# Bundlepad go-live guide

This guide takes you from a fork of this repo to friends funding a launch,
the group buy and the token payout, with fees bought back and burned
automatically. Commands run from the repo root unless they say otherwise.
`chain` means `node src/index.js`.

> **Before outside money:**
> - The on-chain program has passed its own tests against a mock pump.fun
>   (`onchain/README.md`). It has **not** run against the real pump.fun or
>   Jito yet.
> - Do steps 6–7 (a local test with real pump.fun, then a mainnet test with
>   your own wallets) before anyone else deposits.
> - Get an independent audit and a legal check before strangers do.

## What you need

| Item | Where | Cost |
|---|---|---|
| GitHub account and a fork of this repo | github.com | free |
| A small always-on Linux server (1 vCPU, 1 GB) | any VPS (Hetzner, DigitalOcean, Vultr…) | about $5/month |
| A domain or subdomain for the API (e.g. `api.yourname.com`) | any registrar | about $10/year |
| A Solana RPC URL | Helius, QuickNode, Triton… (free tiers exist) | free–$50/month |
| Phantom, Solflare or Backpack wallets | browser extension | free |
| Google OAuth client ID (optional, see step 4) | console.cloud.google.com | free |
| SOL | see "Costs" | see below |

**Wallets.** Make a few `solana-keygen` files and keep them off GitHub. One
person can hold all three, but separate keys limit damage if one leaks.

| Wallet | Used for | Needs |
|---|---|---|
| `deployer.json` | deploying the program once | about 2.1 SOL (about 1.0 SOL stays locked as program rent) |
| `creator.json` | the launch's `creatorWallet`: `init`, creating the token, `cancel` | about 0.1 SOL per launch |
| `payer.json` | the lookup table, the buy transaction and the Jito tip, settling everyone | about 0.05 SOL + 0.0021 SOL per investor |
| `buyback.json` | receives the platform fee; swaps and burns $BUNDLEPAD | stays on the server if buyback is automated (a hot key) |

## Costs

| What | Who pays | Amount | Comes back? |
|---|---|---|---|
| Program deploy (144 KB) | deployer | about 1.01 SOL rent (+ about 1.01 SOL buffer while deploying) | the buffer comes back after deploy; the rent stays while the program exists |
| Launch account | creator | 0.003 SOL + 0.0003 per investor | yes, at `close` |
| Lookup table | payer | about 0.015 SOL | only if you deactivate and close it later |
| Token creation on pump.fun | creator | about 0.02–0.03 SOL rent + fees | no |
| Jito tip | payer | 0.001 SOL default (`--tip`) | no |
| Investor token accounts at settle | payer | about 0.0021 SOL each | no (the investor keeps the account) |
| Escrow rent | each investor | about 0.00145 SOL | yes, at settle or refund |
| Platform fee | each investor | 10% of their commitment | goes to buyback & burn |
| pump.fun trading fees | inside the buy | about 1.25% | no |

## One-time setup

1. **Fork and enable Pages.** Fork the repo. Then go to Settings → Pages →
   Deploy from branch → `main`, folder `/` (root). The dashboard is now at
   `https://<you>.github.io/<repo>/`.
2. **Server.**
   ```sh
   sudo apt install -y nodejs git caddy          # Node 20+
   sudo useradd -m bundlepad && sudo git clone https://github.com/<you>/<repo> /opt/bundlepad
   sudo chown -R bundlepad /opt/bundlepad
   cd /opt/bundlepad/onchain/client && sudo -u bundlepad npm ci
   ```
   - Copy `deploy/bundlepad.service` to `/etc/systemd/system/`, then run
     `sudo systemctl enable --now bundlepad`.
   - Point a DNS A record (`api.yourname.com`) at the server. Put that name in
     `deploy/Caddyfile`, copy it to `/etc/caddy/Caddyfile` and reload Caddy.
     Caddy gets the HTTPS certificate itself.
   - Add a **deploy key** with write access to the repo, as the `bundlepad`
     user's SSH key. Then add the cron line from `deploy/publish.sh`, which
     pushes launch state and the chain to GitHub every 10 minutes.
3. **Deploy the program** (from any machine with the Solana CLI, see
   `onchain/README.md`):
   ```sh
   (cd onchain/group-buy && cargo build-sbf)
   solana-keygen new -o program-keypair.json
   solana program deploy onchain/group-buy/target/deploy/bundlepad_group_buy.so \
     --program-id program-keypair.json --keypair deployer.json -u <rpc>
   ```
4. **Configure.** One command sets both the server config and the dashboard:
   ```sh
   chain configure --api-url https://api.yourname.com --rpc-url <rpc> \
     --program <program id> --buyback <buyback wallet address> \
     --bundlepad-mint <$BUNDLEPAD mint> --allow-origin https://<you>.github.io \
     --require-google false        # or: --google-client-id <id>
   ```
   - `--require-google false` is for **launches among friends**: each wallet
     can commit once, with no sign-in.
   - For public launches, create a Google OAuth client (Web application, with
     authorized JavaScript origin `https://<you>.github.io`) and pass
     `--google-client-id`, so one Google account maps to one wallet.

   Commit and push the changed `index.html` and `launches/config.json`, then
   pull on the server.
5. **Check:** `curl https://api.yourname.com/api/launch/dashboard` returns
   JSON, and the dashboard loads without errors.

## Test before anyone else's money

6. **Local test with real pump.fun.** Follow gate (a) in `onchain/README.md`:
   a local validator with pump.fun cloned from mainnet. Then run a full
   launch with `--no-jito`.
7. **Mainnet with your own wallets.** Use 2–3 of your own wallets, about
   0.05 SOL each, and the whole flow below. Check the tokens arrive, the fee
   reaches the buyback wallet and the escrows close.
8. **Audit and legal check**, then lock the program:
   `solana program set-upgrade-authority <id> --final`.

## Running a launch

### You (the organizer)

1. Write the manifest, starting from `launches/example-manifest.json`:
   - token name, symbol and metadata URI
   - `creatorWallet` = the creator address
   - caps
   - `commitWindow` (when friends can commit)
   - `launchAt` (the **earliest** moment you can launch)
2. On the server:
   ```sh
   chain launch create --file my-manifest.json
   chain launch publish bp-001        # frozen and hashed on the integrity chain
   ```
3. **Send friends the dashboard link.**
4. When the commitment window ends (or earlier, if you're ready):
   ```sh
   chain launch close bp-001
   cd onchain/client
   node launcher.js prepare bp-001                        # token mint key → .secrets/mints/
   node launcher.js init bp-001 --keypair creator.json     # friends now see "Deposit"
   node launcher.js alt bp-001 --keypair payer.json
   ```
5. Watch deposits with `node launcher.js status bp-001`.
6. **Choose when to launch.** Any time between `launchAt` and 24 hours after it
   (`prepare --refund-after SECS` changes that window), run:
   ```sh
   node launcher.js launch bp-001 --keypair creator.json --payer payer.json --dry-run   # check sizes
   node launcher.js launch bp-001 --keypair creator.json --payer payer.json
   # or schedule it: --at 2026-11-03T18:00:00Z
   ```
   This sends one Jito bundle:
   - creating the token
   - the group buy
   - the tip

   Then it **settles automatically**, so every depositor gets their share of
   the tokens, plus their share of any unspent SOL, in their own wallet.
7. `node launcher.js close bp-001 --keypair payer.json` returns the launch
   account's rent to the creator.

If you need to stop:
```sh
node launcher.js cancel bp-001 --keypair creator.json
node launcher.js refund bp-001 --keypair payer.json
```
If 24 hours pass after `launchAt` without a buy, **anyone** can run
`refund`, and friends can always withdraw from the dashboard before the buy.

### Your friends

1. Open the dashboard link, connect a wallet (and sign in with Google, if it's on).
2. Enter an amount and press **Commit**. This signs a message only; no SOL moves yet.
3. After you run `init`, they press **Deposit**. Their SOL goes into their
   own escrow, and they can press **Withdraw** any time before the buy.
4. After the launch, the tokens appear in their wallet. Nothing else to do.

## Fees: automated buyback & burn

The program sends 10% of every group buy straight to the buyback wallet. To
turn that into $BUNDLEPAD bought and burned, with every step on the record:

```sh
# on the server, with buyback.json in /opt/bundlepad/.secrets/
node onchain/client/buyback.js --keypair .secrets/buyback.json --dry-run    # see what it would do
# cron, hourly:
0 * * * * cd /opt/bundlepad && node onchain/client/buyback.js --keypair .secrets/buyback.json >> /var/log/bundlepad-buyback.log 2>&1
```

What a run does:
- Keeps 0.05 SOL for fees.
- Swaps the rest through Jupiter.
- Burns every $BUNDLEPAD the wallet holds.
- Records both transactions on the chain. The dashboard's buyback panel shows
  the totals after the next publish.

A hot key on a server is a risk. If you'd rather sign by hand, skip the cron
line, swap and burn from your own wallet, and record each step with
`chain buyback --kind swap|burn --sig SIG ...`.

## Troubleshooting

| Symptom | Cause, and what to do |
|---|---|
| Dashboard says "backend isn't connected" | `apiUrl` isn't set. Run `chain configure --api-url ...`, then push `index.html` |
| Commit fails "Google client ID is not configured" | Set `--google-client-id` or `--require-google false` |
| Browser blocks API calls (CORS) | `--allow-origin` must be exactly `https://<you>.github.io` |
| `launch` says "too early" | The program accepts the buy only from `launchAt` |
| Buy fails with `CurveNotFresh` (custom error 12) | Someone bought the token before the group buy (sent without Jito, or the bundle split). Run `cancel`, then `refund` |
| Buy fails with pump error 6042 | The price moved past the slippage floor. Retry, or `prepare` the next launch with a higher `--slippage` |
| Jito bundle doesn't land | Raise `--tip` and run `launch` again. Nothing happened on chain, so it's safe to retry |
| Buy transaction too large | Run `alt` first. The lookup table is required, and 32 investors is the maximum |
| Friends' deposits don't show | Check `rpcUrl` in the dashboard config. Deposits read at `confirmed` |

## Things that are still manual

- Making token metadata (image plus a JSON file on IPFS or Arweave) for
  `token.metadataUri`.
- Choosing the moment to run `launch`. Scheduling with `--at` is supported,
  but nothing launches on its own.
- Closing old lookup tables to recover their rent.
