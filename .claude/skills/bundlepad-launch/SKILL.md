---
name: bundlepad-launch
description: Set up, run and troubleshoot a Bundlepad group-buy token launch on Solana. Covers server and program deploy, configure, launch manifests, friends committing and depositing into their own escrows, the Jito launch bundle, automatic settle, cancel and refund, and the fee buyback and burn. Use when a user wants to launch a token with friends, fund it, choose when to launch, or automate fee dispersion.
---

# Bundlepad launch

Full guide: `docs/GO-LIVE.md`. Program details: `onchain/README.md`. Read them
before acting. `chain` below means `node src/index.js`, run from the repo root.

## Safety gates (say these to the user)
- The program is tested against a mock pump.fun only. Before anyone else's
  money, run gate (a) in `onchain/README.md` (local validator with real
  pump.fun), then a mainnet test with the user's own 2–3 wallets.
- Get an independent audit and a legal check before strangers deposit.
  Pooled launch participation can be regulated.
- Keypairs (`deployer.json`, `creator.json`, `payer.json`, `buyback.json`)
  stay off GitHub, in `.secrets/` or outside the repo. Never ask for a seed
  phrase.

## Human does / agent does

| Step | Human | Agent |
|---|---|---|
| 1. Fork + Pages | Fork, Settings → Pages → `main` / root | Confirm the dashboard URL loads |
| 2. Server | Rent a VPS (~$5/mo), point DNS `api.<domain>` at it, add a deploy key | Install Node 20, git, caddy; clone to `/opt/bundlepad`; install `deploy/bundlepad.service` and `deploy/Caddyfile`; add the `deploy/publish.sh` cron |
| 3. Program | Fund `deployer.json` (~2.1 SOL) | `cd onchain/group-buy && cargo build-sbf`; `solana program deploy ... --program-id program-keypair.json --keypair deployer.json` |
| 4. Configure | Decide: friends-only (`--require-google false`) or Google sign-in (create an OAuth client) | `chain configure --api-url ... --rpc-url ... --program ... --buyback ... --bundlepad-mint ... --allow-origin https://<user>.github.io ...`, then commit and push `index.html` + `launches/config.json` |
| 5. Check | — | `curl https://api.<domain>/api/launch/dashboard` returns JSON |

## Running a launch
```sh
chain launch create --file my-manifest.json   # start from launches/example-manifest.json
chain launch publish bp-001                    # frozen + hashed on the chain
# send friends the dashboard link; they connect a wallet and Commit (signature only)
chain launch close bp-001                      # freezes the commitment list
cd onchain/client
node launcher.js prepare bp-001 [--slippage BPS] [--refund-after SECS]
node launcher.js init    bp-001 --keypair creator.json   # friends can now Deposit / Withdraw
node launcher.js alt     bp-001 --keypair payer.json
node launcher.js status  bp-001
node launcher.js launch  bp-001 --keypair creator.json --payer payer.json --dry-run
node launcher.js launch  bp-001 --keypair creator.json --payer payer.json [--at ISO-TIME] [--tip LAMPORTS]
node launcher.js close   bp-001 --keypair creator.json
```
- `launch` sends one Jito bundle (create token, group buy, tip) and then
  settles automatically: each depositor gets their pro-rata tokens plus any
  unspent SOL.
- To stop: `launcher.js cancel` (creator), then `launcher.js refund` (anyone).
  `refund` also opens to anyone 24 hours after `launchAt` if no buy happened.

## Fees: buyback and burn
10% of each commitment goes to the buyback wallet. To automate, run
`node onchain/client/buyback.js --keypair .secrets/buyback.json --dry-run`
first, then add an hourly cron. Each run swaps through Jupiter, burns, and
records both transactions on the chain. If the user doesn't want a hot key on
the server, have them swap and burn by hand, and record each step with
`chain buyback --kind swap|burn --sig SIG`.

## Troubleshooting
Use the table in `docs/GO-LIVE.md` § Troubleshooting:
- CORS → `--allow-origin`
- "too early" → `launchAt`
- `CurveNotFresh` → cancel and refund
- pump error 6042 → slippage
- the bundle doesn't land → raise `--tip`
- the transaction is too large → run `alt` first; 32 investors maximum
