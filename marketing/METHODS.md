# Ways to automate posting

Prices are as seen 2026-10-07 in search summaries, and many come from
third-party pricing write-ups. Check the vendor's page before paying.

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

**Pick for one person automating their own content: self-hosted Postiz.**
It's free, covers 30+ platforms (including Telegram, Discord, Farcaster,
Nostr and Mastodon), and one API key reaches all of them. Buffer is the
cheapest hosted choice with an API.

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

A cheap pipeline that runs everything:
1. **Source.** New content appears: a blog post (RSS), a video upload, a
   file in a folder, a row in a spreadsheet.
2. **Draft.** An LLM step writes a version for each platform: thread for X,
   caption for Instagram, title and description for YouTube. Keep within
   each platform's limits (see `data/platforms.json`).
3. **Approve.** Optional. The user gets a Telegram or Discord message with
   Approve or Edit buttons. n8n has a "wait for approval" step.
4. **Publish.** Through a hub (Postiz, Buffer, Ayrshare) or direct API calls
   for the simple platforms (Telegram, Discord, Mastodon, Bluesky).
5. **Schedule.** Cron, an n8n schedule trigger, or GitHub Actions on a
   schedule.

Buffer, Postiz, Outstand and Typefully expose **MCP servers**, so an AI agent
such as Claude can draft and queue posts through them directly.
