# Follow-up 3 → Plan 4 — On-chain group buy and launcher

Status: **APPROVED** (2026-10-07) and **implemented**. See `onchain/README.md`.
Items 1–3 are built and tested, item 4 is a record-keeping command, and
item 5 waits on hosting. Go-live steps are in `follow_up_4.md`.

Design change from Plan 3 §3: durable-nonce pre-signing became per-investor
escrow deposits (a Jito bundle holds at most 5 transactions, and a transaction
can use only one nonce). Investors still sign only for their own SOL, and they
can withdraw until the buy.

Plan 3 (`follow_up_2.md`) was approved on 2026-10-07 ("update all and continue
all plans"). Its off-chain part is done:

| Plan 3 item | Where |
|---|---|
| §1 Google sign-in, wallet binding, caps, salted `sub` hashes | `src/launch/crypto.js`, `src/launch/launch.js` (`bind`, `commit`) |
| §2 Manifest, frozen and hashed on the chain; final commitment list | `chain launch publish` / `chain launch close` (`launch.manifest`, `launch.commitments` events) |
| §4 Split rule `tokens × sol / totalSol` | `split()` in `src/launch/launch.js` |
| §6 Dashboard backend, commit / cancel / vote, weighted tallies | `src/server.js` (`/api/launch/*`), `index.html` |
| Tests | `test/launch.test.js` |

Every commit, cancel and vote is signed by the investor's wallet and queued on
the integrity chain. Nothing in this repo holds or moves SOL yet.

## Remaining work (this plan)

1. **Group-buy program** (Rust/Anchor; Rust is installed, the Solana CLI and
   Anchor are not). One instruction that every investor co-signs:
   pull each investor's committed SOL + fee from their own wallet → one buy on
   the bonding curve → transfer `tokens × sol / totalSol` to each investor →
   fee to the buyback address. All-or-nothing. For more signers than fit in one
   transaction: a vault PDA plus a permissionless `settle` instruction, with no
   other way out of the vault. The program is immutable once deployed (upgrade
   authority set to none).
2. **Pre-signing with durable nonces.** After `launch close`, the backend
   builds the group-buy transaction from the frozen commitment list. Each
   investor signs it on the dashboard, with their own nonce account in place of
   a recent blockhash. Each investor can cancel by advancing their nonce.
3. **Launcher.** At `launchAt`, it submits create-token plus the group buy as a
   Jito bundle, logs each signature as a `launch.tx` event and marks the launch
   `launched`.
4. **Buyback job.** It swaps the fees at the buyback address for $BUNDLEPAD,
   burns them, and logs `buyback.swap` / `buyback.burn` with signatures in
   `launches/buyback.json`.
5. **Hosting.** The dashboard is on HTTPS, so the API must be too. A Codespace
   sleeps when idle, so the launcher needs an always-on host at `launchAt`.

## Gates (from Plan 3 §7)

- a. Local validator with mainnet pump.fun cloned in (`solana-test-validator --clone`).
- b. Mainnet with the owner's own wallets only, tiny amounts.
- c. **An independent audit of the program before any outside investor's SOL
  goes through it.**
- d. **A legal check of pooled launch participation before mainnet with outside
  investors.**

## Decisions needed

1. Approve Plan 4 so work on the program can start (items 1–3).
2. Where the backend/launcher runs, and its HTTPS URL (it goes in
   `CONFIG.apiUrl`).
3. The Google OAuth client ID, the buyback wallet address and the $BUNDLEPAD mint.
