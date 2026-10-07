# Bundlepad

Launch together. A group of investors commits SOL to a token launch. At launch,
one atomic group buy goes into the bonding curve, and the tokens are split 1:1
by SOL committed, straight into each investor's own wallet.

- **No pool wallet.** Each investor deposits into their own escrow, which only
  the group-buy program can move, and which they can withdraw from until the buy.
  If the buy doesn't happen, everyone is refunded.
- **Everything on the record.** The launch manifest, every commitment, vote and
  cancellation is logged on this repo's integrity chain (`.chain/`), and every
  launch transaction carries a `Bundlepad <id> <manifestHash>` memo.
- **Fee:** 10% of each commitment, shown before signing, funds a buyback and
  burn of $BUNDLEPAD. The buyback wallet is controlled by the Bundlepad owner.
- **No platform selling.** Bundlepad never sells investors' tokens.

Status: the backend, dashboard, on-chain group-buy program, launcher and
buyback automation are built and tested (`onchain/README.md`). **Start with
`docs/GO-LIVE.md`**: it covers setup, running a launch with friends, costs and
troubleshooting. Going live needs hosting, keys, an
audit and a legal check (`plan/follow_up/follow_up_4.md`). No outside
investor's SOL goes through the program before the audit and the legal check.

## Layout

| Path | What |
|---|---|
| `index.html` | Dashboard (GitHub Pages) |
| `src/` | Integrity chain CLI (`node src/index.js --help`) |
| `src/launch/` | Launch backend: manifests, Google sign-in, wallet signatures, commitments, votes |
| `launches/` | Launch config, manifests and state |
| `onchain/` | Group-buy Solana program, its tests, the launcher and buyback |
| `deploy/` | systemd unit, Caddy (HTTPS) config, and the publish-to-GitHub script |
| `docs/GO-LIVE.md` | Step-by-step go-live guide |
| `marketing/` | Social platforms, posting automation (APIs, schedulers, Siri Shortcuts), crypto channels, promotion rules |
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

Then the on-chain part (deposits, the group buy, settling) runs through
`onchain/client/launcher.js`. See `onchain/README.md`.

Before going live, set `googleClientId`, `buybackWallet`, `groupBuyProgramId`
and `rpcUrl` in `launches/config.json`, and `apiUrl`, `rpcUrl` and
`googleClientId` in `CONFIG` in `index.html`. The API must be served over
HTTPS, since the dashboard is.

Pooled launch participation can be a regulated activity. Check before mainnet.
