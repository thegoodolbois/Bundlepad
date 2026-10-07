# Follow-up 2 → Plan 3 — Transparent Bundled Launch (investor-held funds)

Status: **APPROVED** (2026-10-07). Off-chain part (§1, §2, §6 backend) implemented;
on-chain part continues in `follow_up_3.md`.

## Principles (agreed with the owner)

1. **Investors keep their own funds.** There is no pool wallet and no custodian.
   Each investor's own wallet signs its own buy, and the tokens land directly
   in that wallet.
2. **Proportional allocation.** Each investor commits an amount of SOL, and
   their buy in the launch bundle is exactly that amount.
3. **Public launch record.** The manifest is published and hashed onto the
   integrity chain before commitments open. Every launch tx carries a memo with
   the Bundlepad label and the manifest hash.
4. **Traceable funding.** Funds go from the investor's wallet straight into the
   token's bonding curve. Nothing hops or rotates wallets to hide the trail.
5. **Identity via Google sign-in.** One Google account = one wallet per launch,
   with caps per account.
6. **Platform fee → buyback & burn of $BUNDLEPAD.** A fixed %, shown before
   signing, is paid as part of each investor's own transaction.
7. **No platform-run selling.** Bundlepad never sells investors' tokens or
   pays out sale proceeds. Each investor decides when to sell.

## 1. Identity and caps

- Google Identity Services (OAuth 2.0 / OpenID Connect). It needs a free OAuth
  **client ID** from Google Cloud Console (no billing, no secret needed for the
  browser flow). The ID token's `sub` is the stable account id.
- Wallet binding: the user signs `Bundlepad bind <sub> <wallet> <nonce>` with
  their wallet (`signMessage`), and the backend checks the ed25519 signature.
- Rules per launch: one `sub` ↔ one wallet, and `minSol ≤ commit ≤ maxSolPerInvestor`.
  Commitments stop when `targetSol` or `maxInvestors` is reached.
- Stored: `{sub_hash, wallet, boundAt}`. `sub` is hashed (salted SHA-256), so
  the public ledger shows wallets, not Google accounts.
- Known limit: one person can create several Google accounts. Caps per account
  limit the damage; stronger checks would need a paid provider.

## 2. Launch record (manifest)

`launches/<id>/manifest.json`, logged as a `launch.manifest` chain event and
frozen once commitments open:

```json
{
  "id": "bp-001",
  "label": "Bundlepad launch bp-001",
  "token": { "name": "", "symbol": "", "metadataUri": "" },
  "creatorWallet": "<address>",
  "caps": { "minSol": 0.1, "maxSolPerInvestor": 2, "targetSol": 40, "maxInvestors": 20 },
  "platformFeeBps": 100,
  "buybackToken": "<$BUNDLEPAD mint>",
  "commitWindow": { "opens": "ISO", "closes": "ISO" },
  "launchAt": "ISO",
  "ordering": "see §4"
}
```

When commitments close, the final list `{wallet, sol}` is appended as a
`launch.commitments` event. That list is the proportional allocation.

## 3. How investors sign without handing over funds

Bundles must land within seconds, but investors can't all be online at the same
moment. So each investor pre-signs their buy using a **durable nonce**:

1. The investor's wallet creates a small nonce account it owns (one tx, rent
   refundable).
2. After commitments close, the investor signs one transaction (with the nonce
   in place of a recent blockhash) containing:
   - memo: `Bundlepad bp-001 <manifestHash>`
   - buy instruction for their committed SOL (with a slippage limit they choose)
   - platform fee transfer (`platformFeeBps` of their commit) to the
     buyback address
3. The signed transaction is uploaded to the launcher. It can only do exactly
   what the investor signed. The launcher can't change the amount or the
   destination, and the investor can cancel at any time before launch by
   advancing their own nonce.

## 4. Launch execution

- Jito bundles of ≤ 5 txs, with a tip (paid by the creator) to an official tip
  account. Bundle 1 is: create token (creator) + the first investor buys. The
  remaining buys follow in further bundles in the next slots.
- **Chosen design — one big buy, split pro-rata (atomic group buy):** expected
  launches have 5–10 investors (5–10 SOL, well under the ~80 SOL needed to bond).
  A small immutable on-chain program runs one transaction that all investors
  co-sign:
  1. pulls each investor's committed SOL (plus fee) from their own wallet,
  2. makes a single buy for the total,
  3. transfers each investor `tokens × commit / totalCommit` to their own wallet,
  4. sends the fee to the buyback address.
  It is all-or-nothing: if any step fails, nobody's SOL moves. No wallet ever
  holds pooled funds, every investor gets the same price, and the split is
  exact. The ~8–10 signer limit per tx fits the expected size.
- **Split rule (1:1 by SOL):** `investorTokens = totalTokensBought × investorSol / totalSol`,
  computed only after **all** buys for the launch have landed. Commit time
  doesn't change the token share; it only affects governance weight.
- **More investors than fit in one tx:** each group-buy tx deposits its tokens
  into a program-owned vault (a PDA with no private key, so no person can move
  it). A final `settle` instruction, in the same Jito bundle and callable by
  anyone, reads the vault total and sends every investor their share using the
  rule above. If settle hasn't run, any investor can trigger it, and the program
  allows no other way out of the vault.
  The program needs an independent audit before mainnet. No tokens are
  locked; they are investors' to hold or sell.
- Each landed tx is logged as a `launch.tx` event with its signature.

## 5. Buyback & burn

- Fees collect at a published buyback address. A scheduled job swaps them for
  $BUNDLEPAD and burns the result (SPL `burn`). Each step is logged
  (`buyback.swap`, `buyback.burn`) with tx signatures, and the dashboard shows
  totals.
- Decision: the buyback address should be a Squads multisig (signers published),
  not a single hot wallet.

## 6. Dashboard (GitHub Pages: `index.html` + `app.js`)

- Google sign-in, wallet connect (Phantom / Solflare / Backpack), bind wallet
- launch record, caps, commitment list and progress to target
- commit and pre-sign flow (nonce account setup, signing the buy)
- launch status with explorer links for every tx; buyback/burn totals
- governance: votes on launch parameters, weighted
  `commit × (1 + 1/log2(committedSolAtCommit + 2))`, as signed messages, within
  the manifest's allowed ranges
- integrity-chain audit log, with hashes verified in the browser

A small backend is needed (it stores signed txs and commitments, verifies Google ID
tokens and runs the launcher). The current Node chain code is a natural place
for it, since it runs on your PythonAnywhere or any small host.

## 7. Decisions needed

1. ~~Ordering~~ → decided: one atomic group buy, split pro-rata (§4).
2. ~~Platform fee~~ → decided: **10%** (`platformFeeBps: 1000`), shown to each
   investor before they sign.
3. ~~Buyback custody~~ → decided: the owner signs (single signer, published on
   the dashboard as "buyback wallet controlled by the Bundlepad owner").
4. ~~Backend~~ → decided: runs in this repo/Codespace. Note: Codespaces
   sleep when idle, so the launcher must be running at `launchAt`.
5. Testing → owner wants mainnet. Proposed path:
   a. **Local validator with mainnet pump.fun cloned in** (`solana-test-validator
      --clone`): real program behavior, zero cost, no devnet needed.
   b. **Mainnet, owner's wallets only, tiny amounts** (e.g. 0.05 SOL total,
      2–3 of the owner's own wallets) to confirm the full launch → split → fee path.
   c. **Audit before any outside investor's SOL goes through the program.**
6. Legal: pooled launch participation can be a regulated activity. Check
   before mainnet.
