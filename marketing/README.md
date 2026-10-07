# Social posting automation: every platform, every option

A reference for **automating content posting** across 71 social and
content platforms. It's written so an AI agent can use it to help a user set
up their automation. Researched 2026-10-07.

## For agents: start here
1. **[AGENT-GUIDE.md](AGENT-GUIDE.md):** what to ask the user, how to pick a
   route per platform, setup patterns, and rules. Then **[SETUP.md](SETUP.md)**
   for each platform's exact human and agent steps.
2. **[data/platforms.json](data/platforms.json):** one record per platform.
   `automation_options` lists **every route to automate posting, best
   first**. The routes are:
   - `official_api_own_account`
   - `user_sign_in_post_on_behalf`
   - `scheduler_or_automation_tool`
   - `siri_shortcut`
   - `native_scheduler`
   - `manual`

   Raw file for programs:
   `https://raw.githubusercontent.com/thegoodolbois/Bundlepad/claude/sleepy-brown-x6slgf/marketing/data/platforms.json`

## Files
| File | What it is |
|---|---|
| [SETUP.md](SETUP.md) | **Step-by-step setup for every platform and hub:** what the human does (exact consoles, clicks, approvals), which secrets to hand over, what the agent does (exact API calls), a test call. Machine-readable: [data/setup.json](data/setup.json) |
| [PLATFORMS.md](PLATFORMS.md) | Overview table, then every platform with its numbered automation routes |
| [LOGIN.md](LOGIN.md) | Can a user sign in (Google or the platform's own login) and let an app post for them? Scopes, review, token lifetimes |
| [SHORTCUTS.md](SHORTCUTS.md) | Siri / Apple Shortcuts recipes (Telegram, Discord, Bluesky, Mastodon, Threads, WhatsApp, Farcaster, Binance Square), timed automations, Android |
| [METHODS.md](METHODS.md) | Schedulers (Buffer, Hootsuite…), unified posting APIs (Postiz, Ayrshare…), no-code tools (n8n, Zapier, Make, IFTTT), AI-agent pipelines |
| [data/platforms.csv](data/platforms.csv) | Same data as the JSON, for spreadsheets |
| [SOURCES.md](SOURCES.md) | Where the facts came from |

## Fields per platform (JSON/CSV)
- **What it supports:** `content_types` (what the platform supports at all),
  `official_api`, `api_can_upload`, `has_upload_api`
- **Cost and access:** `api_free` / `api_cost_detail`, `approval`, `limits`
- **Scheduling:** `native_scheduling`, `api_scheduling`, `schedulers`
- **Signing in to post for a user:** `user_login`, `post_on_users_behalf`,
  `login_scopes`, `review_to_open_to_other_users`, `token_lifetime`,
  `needs_server_secret`
- **Siri:** `siri_shortcuts`, `shortcuts_ease`
- **Reference:** `verification`, `docs_url`

## Headline facts
- **51 of 71** platforms have an API that can post or upload. The other 20
  are manual-only (listed in AGENT-GUIDE.md §6).
- **Easiest to automate (one HTTPS call with a static token):** Telegram,
  Discord, Bluesky, Mastodon, Pixelfed, Lemmy, VK, Viber, LINE, Vimeo,
  self-hosted WordPress.
- **Free hub:** self-hosted **Postiz** reaches 30+ platforms with one API.
  **Buffer** is the cheapest hosted option with an API on every plan.
- **Paid API:** X, about $0.015 per post or $0.20 with a link. Most other
  posting APIs are free; some need a paid account on that platform (Flickr
  Pro, SoundCloud Artist Pro, Ghost(Pro) above Starter).
- **"Sign in with Google"** covers YouTube, Blogger and Business Profile only.
  Every other platform needs its own sign-in.
- **Review gates:** YouTube and TikTok keep API uploads private until your app
  passes their audits. Use an audited scheduler meanwhile.

## Reliability
Most official doc sites couldn't be opened directly from the research
sandbox. Facts come from official docs where possible, otherwise from search
summaries of official pages, then third-party write-ups. Each record's
`verification` field says which. "Unverified" means not confirmed. Prices
and access rules change, so check `docs_url` before acting.
