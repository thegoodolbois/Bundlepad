# Bundlepad

Launch together. A group of investors commits SOL to a token launch. At launch,
one atomic group buy goes into the bonding curve, and the tokens are split 1:1
by SOL committed, straight into each investor's own wallet.

- **No pool wallet.** Investors' SOL stays in their own wallets until their own
  signature moves it into the group buy.
- **Everything on the record.** The launch manifest, every commitment, vote and
  cancellation is logged on this repo's integrity chain (`.chain/`), and every
  launch transaction carries a `Bundlepad <id> <manifestHash>` memo.
- **Fee:** 10% of each commitment, shown before signing, funds a buyback and
  burn of $BUNDLEPAD. The buyback wallet is controlled by the Bundlepad owner.
- **No platform selling.** Bundlepad never sells investors' tokens.

Status: the off-chain backend and dashboard are built. The on-chain group-buy
program and launcher are planned (`plan/follow_up/follow_up_3.md`) and need an
audit and a legal check before any outside investor's SOL goes through them.

## Layout

| Path | What |
|---|---|
| `index.html` | Dashboard (GitHub Pages) |
| `src/` | Integrity chain CLI (`node src/index.js --help`) |
| `src/launch/` | Launch backend: manifests, Google sign-in, wallet signatures, commitments, votes |
| `launches/` | Launch config, manifests and state |
| `.chain/` | The integrity chain (blocks, objects, event log) |
| `plan/`, `memory.json` | Plans and their approval state |

## Running a launch

```sh
npm test                                         # chain + launch tests
node src/index.js launch create --file launches/example-manifest.json
node src/index.js launch publish bp-001          # freezes the manifest on the chain
node src/index.js serve --host 0.0.0.0           # API for the dashboard
node src/index.js launch close bp-001            # freezes the commitment list
node src/index.js pages                          # data/dashboard.json + chain copy in index.html
```

Before going live, set `googleClientId` (and `buybackWallet`) in
`launches/config.json`, and `apiUrl` / `googleClientId` in `CONFIG` in
`index.html`. The API must be served over HTTPS, since the dashboard is.

Pooled launch participation can be a regulated activity. Check before mainnet.
