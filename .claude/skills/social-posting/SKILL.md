---
name: social-posting
description: Automate posting to a user's own social accounts on any of 71 platforms (TikTok, Instagram, YouTube, X, Facebook, LinkedIn, Threads, Bluesky, Telegram, Discord, Pinterest and more). Covers which platforms have an upload API and whether it's free, the best automation route per platform, exact human and agent setup steps, OAuth sign-in to post on a user's behalf (Google vs each platform's own login), schedulers and hubs, Siri Shortcuts, and limits. Use when a user wants to post, schedule or cross-post content automatically.
---

# Social posting automation

Data (machine-readable, use these instead of guessing):
- `marketing/data/platforms.json` → `.platforms[]`, one per platform. Key fields:
  - `has_upload_api`, `api_free`, `api_cost_detail`, `content_types`, `api_can_upload`
  - `approval`, `limits`, `token_lifetime`, `user_login`, `login_scopes`
  - `post_on_users_behalf`, `review_to_open_to_other_users`, `needs_server_secret`
  - `siri_shortcuts`, `shortcuts_ease`, `docs_url`
  - **`automation_options`**: the routes, best first
- `marketing/data/setup.json`: 71 platforms plus 10 hubs (`kind: "platform" | "hub"`).
  Key fields:
  - `route`, `prerequisites`, **`human_steps`**, `secrets_to_hand_over`
  - **`agent_steps`**, `test_call`, `troubleshooting`
  - `alternative_route`, `content_specs`, `docs_url`
- Read with `jq` (example: `jq '.platforms[] | select(.platform=="TikTok")' marketing/data/platforms.json`)
  or fetch from `https://thegoodolbois.github.io/Bundlepad/marketing/data/…`.

Docs: `marketing/AGENT-GUIDE.md` (the procedure, read it first) and
`marketing/SETUP.md` (setup per platform). The rest:
- `LOGIN.md`: Google vs per-platform sign-in
- `SHORTCUTS.md`: Siri and Tasker
- `METHODS.md`: schedulers, unified APIs, n8n
- `PLATFORMS.md`: the table
- `SOURCES.md`: citations

## Procedure
1. **Ask:**
   - which platforms
   - what content (text, image, short video, long video)
   - how often
   - what they already have (a scheduler, a server, an iPhone, a budget)
   - their own accounts only, or other people's too
2. **Choose a route per platform:** the first entry in `automation_options`
   that fits.
   - `official_api_own_account`
   - `user_sign_in_post_on_behalf`
   - `scheduler_or_automation_tool`
   - `siri_shortcut`
   - `native_scheduler`
   - `manual`
3. **Hand the human their part.** Give them that platform's `human_steps` from
   `setup.json` word for word: creating the developer app, consent, tokens. Ask
   only for the items in `secrets_to_hand_over`, and never for passwords
   (except PeerTube and Lemmy, after warning them).
4. **Do the agent part.** Follow `agent_steps`, then run `test_call` and
   confirm a test post. Store secrets in a secret store, never in code, logs or
   posts.
5. **Schedule.** Use cron, an n8n Schedule Trigger, a hub's queue, or a native
   scheduler.

## Defaults that usually win
- **One hub:** self-hosted **Postiz** (free, 30+ platforms) or **Buffer** (an
  API on every plan). Connect the platforms there and post through one API.
- **Direct for the simple ones:** Telegram bot, Discord webhook, Bluesky app
  password, Mastodon token.
- **YouTube and TikTok:** an unaudited app's uploads are forced private. Post
  through a scheduler that has passed the audit, or apply for the audit.

## Hard rules
- **Official APIs, webhooks, bots and tools built on them only.** No browser
  bots, scraping or self-bots; they get accounts banned.
- **"Sign in with Google" only grants Google services** (YouTube, Blogger,
  Business Profile). Every other platform needs its own OAuth.
- **Respect `limits`:** Instagram 50 API posts/day, Threads 250, TikTok ~15.
- **X's API is paid per post.** Tell the user before turning it on.
- **Don't post identical text repeatedly.** Label bot accounts where the
  platform asks.
- **No posting API:** Medium, Substack, Patreon, Lemon8, RedNote, Rumble and
  the others listed in AGENT-GUIDE §6. Prepare the content to spec, and the
  human posts it.
