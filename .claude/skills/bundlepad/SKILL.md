---
name: bundlepad
description: Map of the whole Bundlepad repo and which skill to use for each job. Use first whenever you work in this repo or with its guide page, or when a user asks what Bundlepad can do: group-buy token launches on Solana, the integrity chain, or automating social content (platform APIs, market research, scripts, videos, posting).
---

# Bundlepad: start here

Repo: https://github.com/thegoodolbois/Bundlepad. Guide page: https://thegoodolbois.github.io/Bundlepad/marketing/.
If you don't have the repo checked out, read any file at
`https://raw.githubusercontent.com/thegoodolbois/Bundlepad/main/<path>`.

## Pick the skill for the job

| The user wants to… | Skill | Main files |
|---|---|---|
| Run a group-buy token launch with friends, deposits, settle, refunds, fee buyback | `bundlepad-launch` | `docs/GO-LIVE.md`, `src/`, `onchain/`, `deploy/` |
| Know which platforms can be posted to by API, set up access, sign users in, post | `social-posting` | `marketing/data/platforms.json`, `setup.json`, `AGENT-GUIDE.md` |
| Find trending products and ads, compare the market, sell vs affiliate, margins | `market-research` | `marketing/MARKET-RESEARCH.md`, `data/market.json` |
| Turn a script into a video from footage they're allowed to use | `video-sourcing` | `marketing/VIDEO-SOURCING.md`, `data/video.json` |
| Rewrite a winning script for their product, rate it, block copies and repeats | `script-engine` | `marketing/engine/`, `SCRIPT-ENGINE.md` |
| Onboard a user: collect their profile, products, platform keys and schedule | `user-intake` | `marketing/INTAKE.md`, `marketing/setup.html` |
| Automate daily or weekly content end to end | `content-autopilot` | all of the marketing ones, in order |

## Repo layout

| Path | What |
|---|---|
| `index.html` | Bundlepad launch dashboard (GitHub Pages) |
| `src/` | Integrity chain plus launch backend CLI: `node src/index.js help` |
| `launches/` | `config.json`, launch manifests and state |
| `onchain/` | Solana group-buy program (Rust), tests, `client/launcher.js`, `client/buyback.js` |
| `deploy/` | systemd unit, Caddyfile, `publish.sh` cron |
| `docs/GO-LIVE.md` | Step-by-step go-live guide |
| `marketing/` | Content automation research, guide page (`index.html`), JSON data, script engine |
| `.claude/skills/` | These skills |
| `.chain/` | The integrity chain (do not edit by hand) |
| `plan/`, `memory.json` | Plans and approval state |

## House rules when you change this repo

1. Code style: Node 20+, CommonJS, `'use strict'`, no dependencies in the root
   package (the `onchain/client` and `marketing/engine` packages have their own).
2. Run tests before committing:
   - root: `npm test`
   - script engine: `cd marketing/engine && npm test`
   - on-chain client: `cd onchain/client && npm test`
3. After each commit, record it on the integrity chain, then commit that record:
   ```sh
   node src/index.js track && node src/index.js pages && node src/index.js verify-chain
   git add -A && git commit -m "Record the <topic> commit on the integrity chain"
   ```
4. GitHub Pages serves `main` from the repo root (`.nojekyll` is present).
   Data pages load JSON with `fetch`, so test them over HTTP
   (`python3 -m http.server`), not `file://`.
5. Never commit keys: `.secrets/`, keypair JSON files, API tokens.
