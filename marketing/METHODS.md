# Ways to automate posting

Prices are as seen 2026-10-07 in search summaries, and many come from
third-party pricing write-ups. Check the vendor's page before paying. None of
these vendors publishes a crypto-content rule that could be found (not
confirmed either way), so read their terms before you post token promotions
through them.

## 1. Multi-platform schedulers (for people)

You queue posts in a web app, and it publishes them on time.

| Tool | Free tier | Cheapest paid | Own API? | Notes |
|---|---|---|---|---|
| Buffer | 3 channels, 10 queued per channel | $6/channel/mo | **Yes**: GraphQL API (May 2026), MCP server, CLI, on every plan | Official Bluesky partner; YouTube Shorts |
| Hootsuite | No (30-day trial) | $99/mo, 10 accounts | Yes: REST `POST /v1/messages` | Not Pinterest via the API |
| Later | — | $25/mo | No public API | No X found |
| Sprout Social | No | $199/seat/mo | Advanced plan only | Enterprise |
| Publer | 3 accounts (no X) | $5/mo | Business plan only | Threads via push notification |
| Metricool | 1 brand (no LinkedIn or X) | $20/mo | Custom plan only | Snapchat without Spotlight |
| SocialBee | — | $29/mo | No | |
| Typefully | 15 posts/mo | ~$12.50/mo | Yes, plus agents and MCP (reportedly free) | X, LinkedIn, Bluesky, Threads, Mastodon only |
| Hypefury | No | $29/mo | Not confirmed | Built around X |
| Loomly | — | $49/mo | Undocumented | |
| Vista Social | No | $39/mo (X costs extra) | Paid add-on | |

**Pick:**
- **Buffer** if you want one cheap tool with an API that Siri or n8n can call.
- **Typefully** if you mostly post to X, Bluesky and Threads.

## 2. Unified posting APIs (for code)

One key, one HTTP call, many networks.

| API | Networks | Price | Self-host |
|---|---|---|---|
| Ayrshare | FB, X, Bluesky, IG, LinkedIn, Telegram, Reddit, Google Business, Pinterest, TikTok, YouTube | $149/mo (1,000 posts) | No |
| Zernio (formerly Late / getlate.dev) | 15 | 2 accounts free, then $6 per account (lower in bulk) | No |
| Upload-Post | TikTok, IG, LinkedIn, YouTube, FB, X, Threads, Pinterest, Reddit, Bluesky | free: 10 uploads/mo; $24/mo | No |
| Outstand | 12 | $19/mo (3,000 posts), then ~$0.005–0.007 per post | No; MCP |
| **Postiz** | 30+ incl. **Telegram, Discord, Farcaster, Nostr, Mastodon** | **free self-hosted** (AGPL-3.0); cloud from ~$29/mo | **Yes** |
| Mixpost | Lite: FB Pages, X, Mastodon; Pro adds Threads, TikTok, YouTube, Bluesky, Discord, Farcaster | Lite free; Pro $299 one-off | **Yes** |

**Pick for Bundlepad: self-hosted Postiz.** It runs on the same server as the
backend (see `docs/GO-LIVE.md`). It's free, and it's the only one that covers
the crypto-native networks too: Farcaster, Nostr, Telegram and Discord.

X's own API charges still apply underneath any of these: about $0.015 per
post, and about $0.20 per post with a link.

## 3. No-code automation

| Tool | Free tier | Paid from | Native social actions |
|---|---|---|---|
| **n8n** | **Self-hosted: unlimited** | Cloud ~€20/mo | X, LinkedIn, Telegram, Discord, Reddit, Facebook Graph API, YouTube |
| Zapier | 100 tasks, 2-step Zaps | $19.99/mo | X (bring your own paid X API), Buffer, Hootsuite, YouTube |
| Make | 1,000 credits | ~$9/mo | Facebook Pages, Instagram Business, LinkedIn; X status unclear |
| IFTTT | 2 applets | $2.99/mo | X (Pro plans), Bluesky, Telegram, Buffer, Threads, iOS Shortcuts trigger |
| Pipedream | 100 credits | $29/mo | X, Telegram bot |

## 4. Your own cron job or AI agent

The cheapest pipeline that can run the whole thing:
1. **Draft.** An LLM step writes a post. Examples: launch is open, X SOL
   committed, launch in 1 hour, tokens settled. Facts come from the Bundlepad
   API (`/api/launch/dashboard`).
2. **Approve.** A human gets a Telegram or Discord message with Approve or
   Edit buttons. n8n has a "wait for approval" step. Keep this step for
   anything about price, returns or token sales.
3. **Publish.** Postiz or a unified API sends the post, or direct API calls do
   for Telegram, Discord, Mastodon and Bluesky.
4. **Schedule.** Cron, an n8n schedule trigger, or GitHub Actions on a schedule.

Buffer, Postiz, Outstand and Typefully expose **MCP servers**, so an AI agent
such as Claude can draft and queue posts through them directly.

### Event-driven posts from Bundlepad

The backend already writes every launch event to the integrity chain:
`launch.manifest`, `launch.commit`, `launch.commitments`, `launch.tx` and
`buyback.burn`. An n8n workflow can poll
`GET /api/chain/events?limit=30` and post when a new event appears:
- **"Commitments are open"** on `launch.manifest`
- **"Launch landed"** on `launch.tx` with kind `buy`, with the explorer link
- **"Burned N $BUNDLEPAD"** on `buyback.burn`, with the transaction link

Each one is a real, checkable on-chain fact, which keeps posts accurate.
