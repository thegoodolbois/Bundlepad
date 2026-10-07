# Bundlepad on-chain group buy

| Path | What |
|---|---|
| `group-buy/` | The Solana program (native Rust, `solana-program` 2.x, no framework) |
| `mock-pump/` | A test copy of pump.fun's `buy_exact_quote_in_v2`, used only in tests |
| `tests/` | LiteSVM end-to-end tests, plus `vectors.rs`, which keeps `test/fixtures/onchain-vectors.json` in sync with the JS client |
| `client/` | `launcher.js`: init, lookup table, Jito launch bundle, automatic settle, refunds. `buyback.js`: swaps fees for $BUNDLEPAD and burns them |

## How it works

1. **`init_launch`** (signed by the creator). It fixes the terms and nothing can change them afterwards:
   - the commitment list, frozen by `chain launch close`
   - the fee (at most 10%) and the buyback address
   - the pre-generated mint address
   - the slippage floor (at most 20%)
   - `launch_at` and `refund_after`
2. **`deposit`** (signed by the investor). It moves exactly the committed SOL
   into the investor's **own escrow PDA**. No pooled wallet holds it. The
   investor can **`withdraw`** at any time before the buy.
3. **`execute_buy`** (anyone can call it, from `launch_at` until `refund_after`):
   - Sweeps every funded escrow, each exactly once.
   - Sends the fee to the buyback address.
   - Holds back 0.01 SOL for pump.fun's first-buy rent. Whatever isn't used is refunded.
   - Makes **one** `buy_exact_quote_in_v2` from a system-owned vault PDA, only if:
     - the mint, the bonding-curve PDA, the buyer and the receiving token account are the pinned ones, and
     - the curve is **fresh** (`real_quote_reserves == 0`, not complete), so every investor gets the launch price, and
     - at least `expected × (1 − slippage)` tokens arrive.
   - Everything in it is atomic.
4. **`settle`** (anyone can call it):
   - Sends an investor `floor(T·(before+mine)/total) − floor(T·before/total)` tokens. The shares add up to exactly every token bought.
   - Sends the same share of any unspent SOL.
   - Closes the investor's escrow and returns its rent to them.
5. **Refunds.** If the creator calls `cancel`, or `refund_after` passes without
   a buy, anyone can return every escrow to its investor (`withdraw` with no
   investor signature).
6. **`close_launch`** returns the launch account's rent to the creator once
   everyone is settled or refunded.

There is no admin key, no upgrade path in the program logic, and no
instruction that sends investor SOL or tokens anywhere except:
- pump.fun (for the buy)
- the fixed buyback address (for the fee)
- back to the investor

### Change from Plan 3 §3

Plan 3 had each investor pre-sign their buy with a durable nonce. That doesn't
scale. A Jito bundle holds at most 5 transactions, and a transaction can use
only one nonce, so about 3 investors would fit.

Escrow deposits keep the same guarantees:
- investors sign only for their own SOL
- they can cancel (withdraw) until the buy
- nobody can redirect the funds

They also don't need investors to be online at launch.

## Build and test

```sh
# Agave 3.0 (cargo-build-sbf, solana-test-validator)
sh -c "$(curl -sSfL https://release.anza.xyz/v3.0.13/install)"
(cd group-buy && cargo build-sbf) && (cd mock-pump && cargo build-sbf)
(cd tests && cargo test)            # LiteSVM end-to-end, 7 tests
(cd group-buy && cargo test)        # unit tests
(cd client && npm ci && npm test)   # launcher transaction building, buyback (mocked RPC + Jupiter)
npm test                            # (repo root) JS client vs. Rust vectors
```

The platform tools ship Cargo 1.84. The `Cargo.lock` files pin dependency
versions that build with it (for example `blake3 1.5.5`). Regenerate a
lockfile with `CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback cargo generate-lockfile`.

## Runbook

All on-chain settings live in `launches/config.json`: `groupBuyProgramId`,
`buybackWallet` and `rpcUrl`. `CONFIG.rpcUrl` in `index.html` is the RPC the
dashboard uses for deposits.

1. **Deploy once:**
   ```sh
   solana-keygen new -o program-keypair.json
   solana program deploy group-buy/target/deploy/bundlepad_group_buy.so --program-id program-keypair.json
   ```
   Put the address in `groupBuyProgramId`. After the audit, make it immutable
   with `solana program set-upgrade-authority <id> --final`.
2. **Per launch:**
   ```sh
   chain launch publish ID   # … commitments … then:
   chain launch close ID
   node client/launcher.js prepare ID                       # creates the mint key in .secrets/, fixes on-chain terms
   node client/launcher.js init ID --keypair creator.json   # dashboard now shows Deposit
   node client/launcher.js alt ID --keypair payer.json      # lookup table for the buy transaction
   node client/launcher.js status ID                        # watch deposits
   node client/launcher.js launch ID --keypair creator.json --dry-run
   node client/launcher.js launch ID --keypair creator.json --payer payer.json   # Jito bundle, then settles everyone
   node client/launcher.js settle ID --keypair payer.json   # only needed after --no-settle or a partial settle
   node client/launcher.js close ID --keypair payer.json
   ```
   If the launch has to stop:
   ```sh
   node client/launcher.js cancel ID --keypair creator.json
   node client/launcher.js refund ID --keypair payer.json
   ```
   Each landed transaction is recorded on the integrity chain (`launch.tx`).
3. **Buyback & burn.** Run `node client/buyback.js --keypair buyback.json`
   (it's cron-safe). It swaps the fee SOL for $BUNDLEPAD via Jupiter, burns it
   and records both steps. Or do it by hand and record each step with
   `chain buyback --kind swap|burn --sig SIG ...`.

The full end-to-end setup (server, HTTPS, config, costs) is in `docs/GO-LIVE.md`.

## Testing gates before outside money (Plan 3 §7)

a. **Local validator with real pump.fun.** Clone the programs and accounts
   from mainnet. Then run the runbook with `--no-jito` (`launch` sends the two
   transactions in order):
   ```sh
   solana-test-validator -u mainnet-beta --reset \
     --bpf-program <groupBuyProgramId> group-buy/target/deploy/bundlepad_group_buy.so \
     --clone-upgradeable-program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P \
     --clone-upgradeable-program pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ \
     --clone-upgradeable-program MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e \
     --clone <pump Global PDA> --clone <fee_config PDA> --clone <global_volume_accumulator PDA> \
     --clone <mayhem global-params PDA> --clone <mayhem sol-vault PDA> \
     --clone <the fee recipient> --clone <the buyback fee recipient>
   ```
b. **Mainnet with the owner's wallets only**, tiny amounts.

c. **Independent audit** of `group-buy/` before any outside investor's SOL goes through it.

d. **Legal check** of pooled launch participation.

## What the tests cover, and what they don't

They cover (LiteSVM, the real compiled program):
- deposits, withdrawals and duplicate deposits
- escrow addresses pre-funded by an attacker
- strangers who aren't on the commitment list
- refunds after a cancel or the deadline, with no investor signature
- only the creator can cancel
- the buy refuses a curve that isn't fresh
- the slippage floor (pump error 6042)
- swapped user, token-account, mint and program accounts
- missing or duplicated escrows
- the exact fee and token split, the unspent-SOL refund, escrow and launch closing
- invalid launch terms

On a local `solana-test-validator`:
- init, deposit, status, cancel, refund and close through the launcher
- deposit and withdraw through the dashboard with a scripted wallet

Not covered here (no mainnet access from the build environment):
- the real pump.fun program
- Jito bundle submission
- the live Jupiter API (`buyback.js` is tested against a mocked RPC and Jupiter)
