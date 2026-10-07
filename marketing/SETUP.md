# Setting up each platform: what the human does, what the agent does

Covers every platform (71) and every posting hub (10). Pairs with [AGENT-GUIDE.md](AGENT-GUIDE.md). Machine-readable version: [data/setup.json](data/setup.json).

**How to use this**

1. Pick the route for each platform (AGENT-GUIDE §2). A hub (Buffer, Postiz…) is often the fastest start.
2. Give the human the **Human does** steps. These need their login, money or approval.
3. Collect the **Hand over to the agent** items and store them as secrets.
4. Do the **Agent does** steps, then run the **Test**.

**General rules**

- The human creates every account, key and token themselves. The agent never asks for a main password, except where a platform only offers password login (PeerTube, Lemmy): use a dedicated account there.
- Console menus get renamed. If a step doesn't match the screen, check the platform's docs link.

## Contents

**Hubs:** [Buffer](#buffer), [Postiz (self-hosted and cloud)](#postiz-self-hosted-and-cloud), [Ayrshare](#ayrshare), [n8n](#n8n), [Zapier](#zapier), [Make](#make), [IFTTT](#ifttt), [Later](#later), [Publer](#publer), [Metricool](#metricool)

**Platforms with a posting API:** [DeviantArt](#deviantart), [SoundCloud](#soundcloud), [Hive](#hive), [Blogger](#blogger), [Tumblr](#tumblr), [WordPress (.com and self-hosted)](#wordpress-com-and-self-hosted), [Ghost](#ghost), [Discord](#discord), [Reddit](#reddit), [Lemmy](#lemmy), [Binance Square](#binance-square), [Farcaster](#farcaster), [Lens](#lens), [Nostr](#nostr), [Dribbble](#dribbble), [Imgur](#imgur), [Kick](#kick), [Twitch](#twitch), [Nextdoor](#nextdoor), [Google Business Profile](#google-business-profile), [KakaoTalk](#kakaotalk), [LINE](#line), [Telegram](#telegram), [Viber](#viber), [WhatsApp](#whatsapp), [WeChat](#wechat), [Bluesky](#bluesky), [Mastodon / Fediverse](#mastodon--fediverse), [Threads](#threads), [Weibo](#weibo), [X (Twitter)](#x-twitter), [Flickr](#flickr), [Pixelfed](#pixelfed), [Apple Podcasts](#apple-podcasts), [LinkedIn](#linkedin), [Facebook Pages](#facebook-pages), [Instagram](#instagram), [MeWe](#mewe), [OK.ru](#okru), [VK](#vk), [Bilibili](#bilibili), [Dailymotion](#dailymotion), [Douyin](#douyin), [Kuaishou / Kwai](#kuaishou--kwai), [Odysee](#odysee), [Snapchat](#snapchat), [TikTok](#tiktok), [Vimeo](#vimeo), [YouTube](#youtube), [PeerTube](#peertube), [Pinterest](#pinterest)

**No posting API (prepared content + manual or native scheduling):** [Clubhouse](#clubhouse), [Medium](#medium), [Naver Blog](#naver-blog), [Patreon](#patreon), [Lemon8](#lemon8), [Xiaohongshu (RedNote)](#xiaohongshu-rednote), [Messenger](#messenger), [Signal](#signal), [Gab](#gab), [Gettr](#gettr), [Truth Social](#truth-social), [Substack](#substack), [BeReal](#bereal), [Spotify for Creators](#spotify-for-creators), [Behance](#behance), [Quora](#quora), [Minds](#minds), [Likee](#likee), [Rumble](#rumble), [Triller](#triller)

## Buffer
_Route: `hosted_hub_api (GraphQL API at https://api.buffer.com with a personal API key; official MCP server as second route)`_ · Price: Free $0 (3 channels, 10 queued posts per channel, 1 user, 1 API key); Essentials $6/channel/month ($5 annual, 1 user); Team $12/channel/month ($10 annual, unlimited users); channels 11-25 cost $4 each, 26-50 $3 each. API and MCP included on all plans.

**Supports:** Instagram, Facebook, TikTok, YouTube (Shorts), LinkedIn, X, Threads, Bluesky, Pinterest, Mastodon, Google Business Profile

**Before you start**
- A Buffer account with a VERIFIED email address (API key creation requires email verification).
- You must be the organization owner to create API keys (Free: 1 key, paid: up to 5 keys).
- Accounts on each social network you want to connect (Instagram must be a Business/Creator account linked to a Facebook Page for direct publishing; Facebook must be a Page; LinkedIn profile or page; YouTube channel; TikTok account).
- Plan: Free works for 3 channels; Essentials ($6/channel/month) for more channels or more than 10 queued posts per channel.
- Public hosting for media (the API does not accept file uploads; media must be reachable by URL until the post publishes) - e.g. an S3/R2 bucket or any public HTTPS URL.
- No platform app reviews needed: Buffer has already passed the TikTok/YouTube/Meta reviews.

**Human does**
1. 1. Open https://buffer.com → 'Get started now' → sign up with email (or Google). Open the verification email and click the link; confirm the dashboard at https://publish.buffer.com loads without a 'verify your email' banner.
2. 2. Choose a plan: profile icon (lower-left) → 'Billing' / 'Plans' (label may differ). Stay on Free for up to 3 channels or pick Essentials; enter card details and confirm. Confirm the plan name shown under Billing.
3. 3. Connect channels: in https://publish.buffer.com click 'Connect channels' (or profile icon → Channels → Connect a channel). Click each network (Instagram, Facebook, TikTok, YouTube, LinkedIn, X, Threads, Bluesky, Pinterest, Mastodon, Google Business), log in, and approve all requested permissions. For Bluesky Buffer asks for your handle and an app password (create it at bsky.app → Settings → Privacy and security → App passwords). For Mastodon enter your server domain first.
4. 4. For Instagram choose the option to publish directly (Business account) rather than reminders/notifications (label may differ). Confirm every connected channel shows its avatar in the left sidebar with no red 'reconnect' warning.
5. 5. Set each channel's posting schedule (queue times): select the channel → 'Settings' / 'Posting schedule' → add times (e.g. 09:00, 13:00) and check the time zone. 'addToQueue' posts via the API land in these slots.
6. 6. Create the API key: profile icon (lower-left) → 'API', or go directly to https://publish.buffer.com/settings/api → 'Personal Access' tab → in 'Keys' click '+ New Key'.
7. 7. Name the key (e.g. 'agent'), leave all Permissions ticked (or untick ones you do not want the agent to have), pick an expiration (7, 30, 60, 90 days or 1 year - choose 1 year and set a calendar reminder 1 week before it expires). Click create.
8. 8. Copy the key immediately (it is shown once) into your password manager as BUFFER_API_KEY. Confirm it appears in the Keys list with its expiry date.
9. 9. Hand BUFFER_API_KEY to the agent via its secret store / .env (never paste it into a git repo).
10. 10. Optional MCP route: in Claude (Settings → Connectors → Add custom connector) or Claude Code (claude mcp add --transport http buffer https://mcp.buffer.com/mcp) add https://mcp.buffer.com/mcp, then approve the Buffer OAuth screen in the browser. Confirm the client lists Buffer tools.
11. 11. Run the test_call below (or ask the agent to) and confirm it returns your organization id.
12. 12. After the agent's first real post, open the channel's Queue in publish.buffer.com and confirm the post appears with the correct time, then check it on the network after it publishes.

**Hand over to the agent (store as secrets)**
- `BUFFER_API_KEY`: https://publish.buffer.com/settings/api → Personal Access → Keys → + New Key (shown once at creation) _(sensitivity: High - full posting rights on all connected channels until expiry; revoke in the same page if leaked)_
- `BUFFER_ORG_ID`: Not secret; the agent fetches it with the account query (step 1 of agent_steps) _(sensitivity: Low)_
- `MEDIA_BUCKET_CREDENTIALS (optional)`: Your own storage provider (S3/R2/etc.) console, used to host images/videos at public URLs _(sensitivity: High)_

**Agent does**
1. 1. Auth check / org id: POST https://api.buffer.com  Headers: 'Authorization: Bearer $BUFFER_API_KEY', 'Content-Type: application/json'. Body: {"query":"query { account { organizations { id name } } }"}. Keep data.account.organizations[0].id as ORG_ID.
2. 2. List channels: POST https://api.buffer.com same headers. Body: {"query":"query($org: OrganizationId!) { channels(input:{organizationId:$org}) { id name service } }","variables":{"org":"ORG_ID"}}. Keep id + service per channel (e.g. instagram, linkedin, bluesky). (Variable type name may differ; inline the id as in the input example if the schema rejects it.)
3. 3. Media: upload the file to your own public HTTPS storage first (Buffer does not accept uploads). Use stable, non-expiring URLs: Buffer fetches the media when the post goes out, which may be days later.
4. 4. Create a queued post: POST https://api.buffer.com Body: {"query":"mutation { createPost(input:{ text:\"Hello\", channelId:\"CH_ID\", schedulingType: automatic, mode: addToQueue, assets:[{ image:{ url:\"https://cdn.example.com/a.jpg\" } }] }) { ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }"}. assets is an ordered array; each item is exactly one of image | video | document | link (new format mandatory since 25 May 2026; exact sub-field names per developers.buffer.com/examples/create-image-post.md). Keep post.id and post.dueAt.
5. 5. Scheduling at a fixed time: same mutation with mode: customScheduled and dueAt:\"2026-10-10T09:00:00Z\" (ISO 8601 UTC). dueAt is only allowed with customScheduled (other modes reject it with a validation error). Other modes: shareNow (publish immediately), shareNext (top of queue).
6. 6. Fan-out: repeat createPost once per channelId; tailor text per service (X 280 chars, Bluesky 300, Threads 500). Read the MutationError.message branch for each - a GraphQL 200 can still carry an error.
7. 7. Token refresh: none - personal keys do not refresh. Track the expiry date chosen at creation; when a call returns 401/unauthorized, stop and ask the human to create a new key at publish.buffer.com/settings/api.
8. 8. Rate limits: per key group, three rolling windows: 100 requests/15 min, 250/24 h, and 3,000 (Free) / 7,500 (Essentials) / 15,000 (Team) per 30 days. Read the RateLimit response headers; on HTTP 429 wait until the window resets (exponential backoff starting at 60 s, max 15 min) and never retry createPost blindly.
9. 9. Idempotency: the API has no idempotency key (unverified). Keep a local ledger keyed by hash(channelId+text+dueAt); before retrying a failed/timeout createPost, list scheduled posts for the channel (posts query with channel filter, see developers.buffer.com/guides/posts-and-scheduling) and skip if a matching post exists.
10. 10. Verify: query the post by id or list the channel's scheduled posts; after dueAt, confirm status is sent and keep the external link if returned (field names per the posts guide).

**Test:** curl -sS -X POST https://api.buffer.com -H "Authorization: Bearer $BUFFER_API_KEY" -H 'Content-Type: application/json' -d '{"query":"query { account { organizations { id } } }"}'  → expect HTTP 200 and {"data":{"account":{"organizations":[{"id":"<ORG_ID>"}]}}}. Read-only; creates nothing.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| HTTP 401 / 'unauthorized' | Key expired (7d-1y expiry), revoked, or 'Bearer ' prefix missing | Create a new key at publish.buffer.com/settings/api and send 'Authorization: Bearer <key>' |
| HTTP 429 | One of the 15-min / 24-h / 30-day windows exceeded (all personal keys share one pool) | Read RateLimit headers, back off until reset, batch fewer queries; upgrade plan for higher 30-day cap |
| createPost returns MutationError mentioning dueAt | dueAt sent with addToQueue/shareNow, or not ISO 8601 UTC | Use mode: customScheduled with dueAt like 2026-10-10T09:00:00Z, or drop dueAt |
| Post fails at publish time with media error | Media URL expired (signed URL) or not public when Buffer fetched it | Use permanent public URLs; keep files until after dueAt |
| Error about assets format | Old multi-field assets object (pre-May-2026 migration) | Send assets as an ordered array of {image\|video\|document\|link} items |
| Channel missing / post errors with 'reconnect' | Network token on Buffer's side expired (e.g. Instagram/LinkedIn re-auth) | Human reconnects the channel in publish.buffer.com → Channels |

**Notes:** API is GraphQL, in public beta, personal API keys only (third-party OAuth not yet open); the old REST API is closed to new apps. Free plan limits queues to 10 posts per channel - addToQueue fails when full. Media via public URLs only (image, video, document, link assets). Official MCP server at https://mcp.buffer.com/mcp (launched 27 May 2026, free on every plan, Buffer OAuth). Keys expire per the period chosen. Easiest route while your own platform apps are unaudited, because Buffer already passed TikTok/YouTube/Meta reviews.

**Alternative:** Buffer MCP: 1) add https://mcp.buffer.com/mcp as a remote MCP server in the agent client; 2) approve Buffer OAuth; 3) let the agent call the Buffer create-post tool per channel. Or via n8n/Make: HTTP Request node POST https://api.buffer.com with the same GraphQL body, or Zapier's Buffer 'Add to Queue' action.

## Postiz (self-hosted and cloud)
_Route: `hosted_or_selfhosted_hub_api (Public API /public/v1; MCP and n8n node as alternatives)`_ · Price: Self-hosted: free (AGPL-3.0), you pay for the server. Cloud: Standard $29/mo (5 channels), Team $39/mo (10 channels), Pro $49/mo (30 channels), Ultimate $99/mo (100 channels); Public API and MCP included.

**Supports:** X, LinkedIn (profile + page), Facebook Pages, Instagram, Threads, TikTok, YouTube, Pinterest, Reddit, Bluesky, Mastodon, Discord, Slack, Telegram, MeWe, Google Business Profile, Dribbble, Lemmy, Warpcast/Farcaster, Nostr, VK, Medium/Dev.to/Hashnode and others (28-30+ total; check postiz.com)

**Before you start**
- Cloud: a Postiz account (postiz.com) on a paid plan (from $29/month) - Postiz Cloud already has approved apps for each network.
- Self-hosted: an always-on Linux server (2 vCPU / 4 GB RAM recommended, unverified) with Docker + Docker Compose, a domain with HTTPS (reverse proxy such as Caddy/Nginx/Traefik), PostgreSQL, Redis and Temporal (provided by the official docker-compose).
- Self-hosted: your OWN developer app on every network you want (Meta, LinkedIn, X, TikTok, YouTube/Google, Pinterest, Reddit, etc.), each with its own review/approval (days to weeks; Meta/TikTok/YouTube audits can take 1-4 weeks).
- Accounts on each social network (Instagram Business/Creator, Facebook Page, etc.).
- For media: files must be reachable via public HTTPS (upload-from-url) or uploaded via multipart.

**Human does**
1. 1. CLOUD: open https://postiz.com → 'Start free trial' / 'Get started' → sign up → choose Standard/Team/Pro and enter payment. Confirm you land in the calendar view.
2. 2. CLOUD: click 'Add Channel' (left column) → pick a network → log in and approve permissions. Repeat for each network. Confirm each channel avatar appears in the left column with no 'disconnected' badge.
3. 3. CLOUD: Settings → Developers → Public API → copy the API key into your password manager as POSTIZ_API_KEY; set POSTIZ_API_URL=https://api.postiz.com/public/v1. On the same page copy the personal MCP URL if you want MCP.
4. 4. SELF-HOSTED: provision the server, point DNS (e.g. postiz.example.com) to it, install Docker. Download the official docker-compose.yml from docs.postiz.com/installation/docker-compose.
5. 5. SELF-HOSTED: edit the environment: MAIN_URL=https://postiz.example.com, FRONTEND_URL=https://postiz.example.com, NEXT_PUBLIC_BACKEND_URL=https://postiz.example.com/api, JWT_SECRET=<long random string>, DATABASE_URL, REDIS_URL, BACKEND_INTERNAL_URL=http://localhost:3000, TEMPORAL_ADDRESS (defaults in the compose file). Put the reverse proxy with HTTPS in front of port 4007 (default in docs).
6. 6. SELF-HOSTED: run 'docker compose up -d', wait 1-3 minutes, open https://postiz.example.com and register the first (admin) user. Consider setting DISABLE_REGISTRATION=true afterwards (variable name unverified).
7. 7. SELF-HOSTED: for each network create a developer app (e.g. developers.facebook.com, linkedin.com/developers, developer.x.com, developers.tiktok.com, console.cloud.google.com), set the redirect URL shown in docs.postiz.com/providers/<network> (typically https://postiz.example.com/integrations/social/<network>), and copy client id/secret into the env vars named on that page (e.g. LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET). Restart with 'docker compose up -d'.
8. 8. SELF-HOSTED: submit each app for the platform's review where needed (Meta App Review, TikTok audit for public posting, Google OAuth verification); until approved, posts may be private-only or limited to test users.
9. 9. SELF-HOSTED: in the UI click 'Add Channel' and connect each account; then Settings → Developers → Public API → copy POSTIZ_API_KEY; set POSTIZ_API_URL=https://postiz.example.com/api/public/v1.
10. 10. Hand POSTIZ_API_URL and POSTIZ_API_KEY to the agent; run the test_call and confirm your channels are listed.
11. 11. After the first agent post, open the Postiz calendar and confirm the post appears at the right time (preview icon), then check it on the network after publishing.

**Hand over to the agent (store as secrets)**
- `POSTIZ_API_URL`: Cloud: https://api.postiz.com/public/v1; self-hosted: https://<your-host>/api/public/v1 _(sensitivity: Low)_
- `POSTIZ_API_KEY`: Postiz UI → Settings → Developers → Public API _(sensitivity: High - can create/delete posts on all channels; regenerate in the same page if leaked)_
- `POSTIZ_MCP_URL (optional)`: Same page (personal MCP URL containing the key, e.g. https://api.postiz.com/mcp/<API_KEY>) _(sensitivity: High - embeds the API key)_

**Agent does**
1. 1. List channels: GET {POSTIZ_API_URL}/integrations  Header: 'Authorization: $POSTIZ_API_KEY' (no 'Bearer' prefix). Keep each item's id, providerIdentifier (e.g. x, linkedin, instagram, bluesky) and disabled flag.
2. 2. Media from URL: POST {POSTIZ_API_URL}/upload-from-url  Headers: Authorization, 'Content-Type: application/json'. Body: {"url":"https://cdn.example.com/a.jpg"}. Keep id and path. URL must be public HTTPS (Postiz rejects private IPs/localhost; MIME must be allow-listed).
3. 3. Media from file: POST {POSTIZ_API_URL}/upload  multipart/form-data with field 'file' (field name unverified) → keep id and path.
4. 4. Create/schedule post: POST {POSTIZ_API_URL}/posts  Headers: Authorization, Content-Type: application/json. Body: {"type":"schedule","date":"2026-10-10T09:00:00.000Z","shortLink":false,"tags":[],"posts":[{"integration":{"id":"INTEGRATION_ID"},"value":[{"content":"Hello","image":[{"id":"MEDIA_ID","path":"MEDIA_PATH"}]}],"settings":{"__type":"linkedin"}}]}. type 'now' publishes immediately, 'draft' saves. Several entries in posts[] fan out to several channels; extra value[] items become thread/comments. Keep the returned post id(s)/group. (settings fields per provider: e.g. X 'who_can_reply_post', YouTube 'title'/'type' - check docs per provider; field names partly unverified.)
5. 5. Scheduling: native - put the target time in 'date' (ISO 8601 UTC) with type 'schedule'.
6. 6. Confirm: GET {POSTIZ_API_URL}/posts?startDate=2026-10-10T00:00:00Z&endDate=2026-10-11T00:00:00Z → find your post and status (draft/scheduled/published/error). Cancel with DELETE {POSTIZ_API_URL}/posts/{id}.
7. 7. Token refresh: none for the API key (static until regenerated). Network tokens are refreshed by Postiz; if /integrations shows a channel as disabled/refresh-needed, ask the human to reconnect it.
8. 8. Rate limits: Public API ~30 requests/hour per key (create-post endpoint reported 90/h self-hosted, 100/h cloud); read X-RateLimit-* headers and, on 429, wait until reset. Minimise calls: one /posts call can carry several channels.
9. 9. Idempotency: no idempotency key; before retrying a timed-out POST /posts, call GET /posts for that date window and skip if identical content already exists for that integration. Keep a local ledger of (integration id, date, content hash).

**Test:** curl -sS -H "Authorization: $POSTIZ_API_KEY" "$POSTIZ_API_URL/integrations"  → expect HTTP 200 and a JSON array of connected channels like [{"id":"...","name":"...","providerIdentifier":"linkedin","disabled":false,...}]. Read-only.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401 Unauthorized | Key sent with 'Bearer ' prefix or wrong/regenerated key | Send 'Authorization: <key>' exactly; recopy from Settings → Developers → Public API |
| 429 Too Many Requests | 30 req/hour public API limit | Wait for X-RateLimit reset; batch channels into one /posts call; cache /integrations results |
| upload-from-url rejected | URL not public HTTPS, redirects to private IP, or MIME type not allowed | Host media on public HTTPS with correct Content-Type (image/jpeg, video/mp4) |
| Self-hosted: 'Add Channel' fails with redirect_uri error | Redirect URL in the platform app does not match MAIN_URL/FRONTEND_URL | Set the exact redirect from docs.postiz.com/providers/<network>; ensure HTTPS and correct env vars; restart |
| Self-hosted posts stuck in queue | Temporal/worker or Redis container down | docker compose ps / logs; restart the stack |
| Post published as private / not visible (self-hosted TikTok/YouTube) | Your own platform app is still unaudited | Complete the platform review, or use Postiz Cloud |

**Notes:** Self-hosting is free but you must create and get each platform's developer app approved yourself; Postiz Cloud has done that. API key header has NO 'Bearer'. Low API rate limit (30/hour) - not suitable for high-volume polling. Official n8n community node (gitroomhq/postiz-n8n) and MCP endpoint exist. Keep media until published.

**Alternative:** 1) Postiz MCP: add the personal MCP URL (Settings → Developers → Public API) as a remote MCP server in the agent client. 2) n8n: install community node '@postiz/n8n' (package name per gitroomhq/postiz-n8n, unverified), add credential with API URL + key, use 'Create Post'. 3) Or fall back to Buffer's API if self-hosted app reviews are blocking.

## Ayrshare
_Route: `hosted_hub_api (REST https://api.ayrshare.com/api; MCP as second route)`_ · Price: No permanent free plan (Launch trial 28 days, no card). Premium $149/mo (1 profile, up to 13 accounts across 13 networks; ~17% off yearly, ~$129/mo); Launch $299/mo (10 profiles); Business $599/mo (30 profiles); Enterprise custom.

**Supports:** Facebook, Instagram, X, LinkedIn, TikTok, YouTube, Threads, Pinterest, Reddit, Bluesky, Telegram, Google Business Profile, Snapchat

**Before you start**
- An Ayrshare account (app.ayrshare.com) on Premium ($149/mo) or higher after the trial.
- Accounts on each social network (Instagram Business/Creator linked to a Facebook Page, Facebook Page, LinkedIn, etc.).
- Media hosted at public HTTPS URLs (mediaUrls), or uploaded via Ayrshare's media upload endpoint.
- No own platform app reviews needed (Ayrshare's apps are approved).

**Human does**
1. 1. Open https://www.ayrshare.com → 'Get started' / sign up at https://app.ayrshare.com; verify your email via the link.
2. 2. Start the trial or choose Premium: dashboard → 'Account' / 'Billing' (label may differ) → select Premium → enter card. Confirm the plan name in the dashboard.
3. 3. Link networks: dashboard → 'Social Accounts' (Linking page) → click each network icon → log in and approve permissions (Instagram via Facebook login; pick the right Page/IG account).
4. 4. Confirm each linked network shows as connected (green/linked) on the Social Accounts page.
5. 5. Get the key: dashboard → 'API Key' page (left menu) → copy the API Key into your password manager as AYRSHARE_API_KEY.
6. 6. (Only for multi-profile plans) Create User Profiles and copy each Profile-Key; Premium uses the primary profile so no Profile-Key is needed.
7. 7. Hand AYRSHARE_API_KEY to the agent; run the test_call and confirm activeSocialAccounts lists your networks.
8. 8. Optional MCP: add remote MCP server https://api.ayrshare.com/mcp (Streamable HTTP) with header 'Authorization: Bearer <API key>' in the agent client; confirm Ayrshare tools are listed.
9. 9. After the first real post, open the dashboard 'Posts' / history view and confirm the post shows status success with links per network.

**Hand over to the agent (store as secrets)**
- `AYRSHARE_API_KEY`: app.ayrshare.com → API Key page _(sensitivity: High - posts to every linked network; regenerate in the dashboard if leaked)_
- `AYRSHARE_PROFILE_KEY (optional)`: Dashboard → User Profiles (Launch/Business plans only) _(sensitivity: High)_

**Agent does**
1. 1. Check linked accounts: GET https://api.ayrshare.com/api/user  Header: 'Authorization: Bearer $AYRSHARE_API_KEY'. Keep activeSocialAccounts (e.g. ["bluesky","facebook","instagram","linkedin"]) and displayNames.
2. 2. Media: pass public HTTPS URLs in mediaUrls (images or one video). Optionally upload first via the media upload endpoint (POST https://api.ayrshare.com/api/media/upload, unverified) and use the returned URL.
3. 3. Publish now: POST https://api.ayrshare.com/api/post  Headers: Authorization: Bearer $AYRSHARE_API_KEY, Content-Type: application/json. Body: {"post":"Hello","platforms":["linkedin","bluesky","instagram"],"mediaUrls":["https://cdn.example.com/a.jpg"]}. Keep id (Ayrshare post id), refId, and postIds[] (per-platform status, id, postUrl).
4. 4. Schedule: add "scheduleDate":"2026-10-10T09:00:00Z" (UTC, YYYY-MM-DDThh:mm:ssZ). Response status 'scheduled'; keep id to update/delete.
5. 5. Platform-specific options go in per-network objects (e.g. youTubeOptions {title, visibility}, instagramOptions, tikTokOptions) - names per Ayrshare docs.
6. 6. Confirm: GET https://api.ayrshare.com/api/post/{id} or GET https://api.ayrshare.com/api/history to read final status and URLs. Cancel a scheduled post: DELETE https://api.ayrshare.com/api/post with body {"id":"<id>"}.
7. 7. Token refresh: none for the API key. Network tokens are managed by Ayrshare; if a platform returns an auth error code, ask the human to relink that network.
8. 8. Rate limits: per 5-minute window, shown in x-ratelimit-max / x-ratelimit-count headers; on 429 back off until the window resets. 1,000 rate-limit violations in 24 h suspends the profile - never hot-loop.
9. 9. Idempotency: Ayrshare blocks duplicate/similar content within 2 days (error code 137) and returns the existing post id - treat 137 as 'already posted'. Do not let your HTTP client auto-retry slow (>30 s) requests; check /history before retrying.

**Test:** curl -sS -H "Authorization: Bearer $AYRSHARE_API_KEY" https://api.ayrshare.com/api/user  → expect HTTP 200 with {"activeSocialAccounts":[...linked networks...],"displayNames":[...],"created":...}. Read-only.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Error code 137 'Duplicate or similar content' | Same text posted within 2 days or a double request | Vary the text, or treat as success using the returned duplicate post id |
| HTTP 429 | 5-minute window exceeded | Respect x-ratelimit headers, back off; avoid tight polling of /history |
| Platform-specific auth error in postIds[] | Network token expired/revoked (e.g. Instagram password change) | Human relinks the network on the Social Accounts page |
| Media error | mediaUrls not public, wrong format, or exceeds network limits | Use direct public HTTPS file URLs with correct extension/content-type; check per-network size limits |
| Post missing on one network but 'success' on others | Partial failure (status per platform) | Inspect postIds[] entries; retry only failed platform with platforms:[that one] |

**Notes:** Developer-first REST API; one call fans out to many networks. Pricey for one person ($149/mo minimum). Official MCP server at https://api.ayrshare.com/mcp; docs MCP at ayrshare.com/docs/mcp. Snapchat appears in activeSocialAccounts list. Duplicate check (2 days) acts as built-in idempotency.

**Alternative:** 1) Ayrshare MCP server (https://api.ayrshare.com/mcp, Bearer key header). 2) n8n/Make/Zapier: HTTP request POST https://api.ayrshare.com/api/post with the Bearer header, or the Ayrshare app/node. 3) Cheaper: Buffer or Publer API.

## n8n
_Route: `automation_tool_webhook_flow (Webhook in → hub or native nodes out)`_ · Price: Community Edition self-hosted: free, unlimited executions. Cloud Starter €20/mo annual (~€24 monthly), 2,500 executions; Pro €50/mo annual (~€60 monthly), 10,000 executions; Business (self-hosted) ~€667/mo; Enterprise quote. One execution = one workflow run regardless of node count.

**Supports:** Native nodes: X, LinkedIn, Facebook Graph API (Pages/Instagram), Telegram, Discord, Reddit, Slack; anything else via HTTP Request (Bluesky, Mastodon, Threads) or hub nodes/APIs (Postiz, Ayrshare, Buffer via HTTP)

**Before you start**
- n8n Cloud account (app.n8n.cloud) OR a server with Docker and a public HTTPS domain for self-hosting.
- Destination credentials: either one hub API key (Buffer/Postiz/Ayrshare - recommended, avoids per-platform app reviews) or your own developer apps per network for native nodes.
- An iPhone with the Shortcuts app if you want a Siri trigger.
- A long random shared secret for the webhook header (e.g. openssl rand -hex 32).

**Human does**
1. 1. Hosting: Cloud - sign up at https://n8n.io → 'Get started' → choose Starter; your instance is https://<name>.app.n8n.cloud. Self-host - on a server run: docker volume create n8n_data && docker run -d --name n8n -p 5678:5678 -e WEBHOOK_URL=https://n8n.example.com/ -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n, behind an HTTPS reverse proxy. Open the URL and create the owner account.
2. 2. Credentials: left menu → Credentials (or Overview → Create → Credential) → 'Header Auth' → Name 'X-Webhook-Token', Value = your random secret → Save. This protects the incoming webhook.
3. 3. Destination credential (hub route): Credentials → 'Header Auth' → Name 'Authorization', Value 'Bearer <BUFFER_API_KEY>' → Save as 'Buffer'. (Or Postiz node credential, or native LinkedIn/X OAuth2 credentials with your own apps.)
4. 4. New workflow: Overview → Create Workflow → add node 'Webhook': HTTP Method POST, Path 'post', Authentication 'Header Auth' → select the X-Webhook-Token credential, Respond 'Using Respond to Webhook Node'.
5. 5. Add a 'Code' or 'Edit Fields (Set)' node to validate input (text non-empty, platforms array) and compute an idempotency key; optionally a 'Remove Duplicates' node / data-table lookup on idempotency_key.
6. 6. Add 'Switch' node on {{$json.body.platforms}} (or 'Split Out' the platforms array, then Switch on each value) with outputs linkedin, bluesky, instagram, test.
7. 7. On each output add the destination: e.g. 'HTTP Request' POST https://api.buffer.com, Authentication 'Generic → Header Auth' (Buffer credential), Body JSON = the createPost GraphQL mutation with text {{$json.body.text}}, channelId per network, dueAt {{$json.body.schedule_at}}. The 'test' output goes straight to the response without posting.
8. 8. Add 'Merge' (append) then 'Respond to Webhook': Respond With JSON, body {"ok":true,"results":{{ $json }} }, Response Code 200.
9. 9. Click 'Test workflow' / 'Listen for test event', send the test_call against the TEST URL (https://<host>/webhook-test/post) and check each node's output.
10. 10. Save and toggle 'Active' (top right). Copy the PRODUCTION URL from the Webhook node (https://<host>/webhook/post) - the /webhook-test/ URL only works while the editor is listening.
11. 11. Siri Shortcut: iPhone Shortcuts → '+' → Add Action 'Ask for Input' (Text, prompt 'What to post?') → 'Get Contents of URL': URL = production URL, Method POST, Headers: X-Webhook-Token = secret, Content-Type = application/json; Request Body JSON: text = Provided Input, platforms = Array [linkedin, bluesky] → 'Show Result'. Name it 'Post to socials' to trigger by voice.
12. 12. Optional MCP: Settings → enable instance-level MCP access (beta, label may differ) and expose the workflow, or build a separate workflow starting with an 'MCP Server Trigger' node whose tool calls the same flow; copy its MCP URL into the agent client.
13. 13. Check Executions (left menu) after each real post to confirm success.

**Hand over to the agent (store as secrets)**
- `N8N_WEBHOOK_URL`: Webhook node → Production URL (https://<host>/webhook/post) _(sensitivity: Medium - useless without the token)_
- `N8N_WEBHOOK_TOKEN`: The value you put in the Header Auth credential 'X-Webhook-Token' _(sensitivity: High - anyone with it can post)_
- `Hub/platform keys (stay inside n8n)`: Stored as n8n credentials; the agent does NOT need them _(sensitivity: High)_

**Agent does**
1. 1. Trigger the flow: POST $N8N_WEBHOOK_URL  Headers: 'X-Webhook-Token: $N8N_WEBHOOK_TOKEN', 'Content-Type: application/json'. Body: {"text":"Hello","platforms":["linkedin","bluesky"],"media_url":"https://cdn.example.com/a.jpg","schedule_at":"2026-10-10T09:00:00Z","idempotency_key":"post-2026-10-10-001"}.
2. 2. Read the JSON returned by 'Respond to Webhook' (results per platform, created ids, errors). Keep ids in the agent's ledger.
3. 3. Media: send a public HTTPS media_url; the flow passes it to the hub (Buffer assets / Postiz upload-from-url / Ayrshare mediaUrls). For binary upload, send multipart/form-data with field 'file' - the Webhook node exposes it as binary data.
4. 4. Scheduling: pass schedule_at through to the hub's native scheduler (Buffer customScheduled+dueAt, Postiz date, Ayrshare scheduleDate). Alternatively add a 'Wait' node (Resume: at specified time) - costs no executions while waiting but keeps state on the n8n server.
5. 5. Token refresh: the webhook token is static; n8n auto-refreshes OAuth2 credentials for native nodes. If a node fails with 401, the response carries the error - tell the human to reconnect that credential.
6. 6. Rate limits/backoff: Cloud counts executions (2,500/mo Starter). Enable 'Retry On Fail' (e.g. 3 tries, 60 s wait) on HTTP nodes for 429/5xx; the agent itself should retry the webhook only on network errors, with backoff 30 s → 2 min → 10 min.
7. 7. Idempotency: send idempotency_key; in the flow, use 'Remove Duplicates' (operation 'Remove items processed in previous executions', key = idempotency_key) or a data table lookup before posting, so a retried webhook does not double-post.
8. 8. Test branch: platforms:["test"] routes to Respond without posting - use it for health checks.

**Test:** curl -sS -X POST "$N8N_WEBHOOK_URL" -H "X-Webhook-Token: $N8N_WEBHOOK_TOKEN" -H 'Content-Type: application/json' -d '{"text":"test","platforms":["test"],"idempotency_key":"test-1"}'  → expect HTTP 200 and the Respond-to-Webhook JSON e.g. {"ok":true,"results":{...}} with nothing posted. 403/401 = wrong token; 404 = workflow not active.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 404 'The requested webhook is not registered' | Workflow inactive, or calling /webhook-test/ when the editor is not listening | Activate the workflow and use the /webhook/ production URL |
| 401/403 from the webhook | Header name/value mismatch with the Header Auth credential | Send exactly X-Webhook-Token: <secret> |
| Webhook returns immediately without results | Respond set to 'Immediately' | Set Respond to 'Using Respond to Webhook Node' and add that node at the end |
| Production URL shows localhost or http | WEBHOOK_URL env var not set on self-hosted instance | Set WEBHOOK_URL=https://n8n.example.com/ and restart the container |
| Duplicate posts after agent retry | No dedupe step | Add Remove Duplicates keyed on idempotency_key |
| Native node 401 / token expired | OAuth credential revoked or app lost permission | Reconnect credential in Credentials; prefer hub route |

**Notes:** An execution = one workflow run regardless of steps. Self-hosted Community Edition has unlimited executions but you maintain the server, backups and HTTPS. Native social nodes need your own developer apps (with their reviews); routing through Buffer/Postiz/Ayrshare avoids that. Community multi-post nodes exist (Postiz, Ayrshare, others) - review before installing. Keep the webhook token secret; rotate by editing the credential.

**Alternative:** 1) MCP Server Trigger workflow: add 'MCP Server Trigger' node + 'Call n8n Workflow Tool' pointing at the post flow; 2) copy the MCP URL into the agent client; 3) agent calls the 'post' tool with text/platforms. Or use Make/Zapier with the same webhook contract.

## Zapier
_Route: `automation_tool_webhook_flow (Webhooks by Zapier Catch Hook → Buffer/native actions)`_ · Price: Free $0 (100 tasks/mo, 2-step Zaps, NO webhooks/premium apps); Professional from $19.99/mo annual ($29.99 monthly), 750 tasks, webhooks + multi-step; Team from $69/mo annual ($103.50 monthly), 2,000 tasks, 25 users; Enterprise custom. Zapier MCP included; each MCP tool call costs 2 tasks.

**Supports:** Via native apps: LinkedIn, Facebook Pages, Instagram for Business, Pinterest, YouTube, Reddit, Telegram, Discord, Slack, X (relaunched integration with publishing), Bluesky (app listed in directory); hub apps Buffer, Ayrshare, Publer, Metricool. Threads/TikTok publishing availability unverified.

**Before you start**
- Zapier account on Professional (or the trial) - Webhooks by Zapier is a premium app not in Free.
- Accounts for each destination (or one Buffer account to cover many networks with a single action).
- A shared secret string to check inside the Zap (Catch Hook has no built-in auth).
- iPhone Shortcuts app for a Siri trigger (optional).

**Human does**
1. 1. Sign up at https://zapier.com/sign-up, verify email; Settings → Billing (https://zapier.com/app/settings/billing, label may differ) → upgrade to Professional (or start the trial). Confirm the plan shows Professional.
2. 2. Click '+ Create' → 'Zaps'. Trigger: search 'Webhooks by Zapier' → Event 'Catch Hook' → Continue (leave 'Pick off a Child Key' empty) → Continue.
3. 3. Copy the custom webhook URL shown (https://hooks.zapier.com/hooks/catch/<account_id>/<hook_id>/) into your password manager as ZAPIER_HOOK_URL.
4. 4. Send the sample request from test_call (with real-looking fields) and click 'Test trigger'; pick the request that shows secret, text, platforms, media_url, schedule_at, idempotency_key.
5. 5. Add a 'Filter by Zapier' step: Only continue if 'secret' (Text) Exactly matches <your secret>. Requests without the secret stop here (and use no tasks).
6. 6. Add 'Paths by Zapier' (optional): Path A rule 'platforms' contains 'linkedin', Path B contains 'bluesky', etc. Or skip Paths and use a single Buffer step.
7. 7. Action (recommended): app 'Buffer' → Event 'Add to Queue' (label may differ) → connect your Buffer account → choose the channel(s) → Text = text, Media/Photo URL = media_url, Scheduled At = schedule_at (if offered). Alternatively LinkedIn 'Create Share Update', Facebook Pages 'Create Page Post', Instagram for Business 'Publish Photo(s)', X 'Create Post'. Connect each account when prompted.
8. 8. Optional: add 'Webhooks by Zapier' → 'POST' action or 'Storage by Zapier' to log the idempotency_key and results; add 'Formatter' to trim text to 280 chars for X.
9. 9. Click 'Test step' on each action (this really posts - use a private/test account or Buffer draft), then 'Publish'. Confirm the Zap toggle is On.
10. 10. Siri Shortcut: Shortcuts → '+' → 'Ask for Input' (Text) → 'Get Contents of URL': URL = ZAPIER_HOOK_URL, Method POST, Request Body JSON: secret = <secret>, text = Provided Input, platforms = [linkedin] → 'Show Result'.
11. 11. Optional MCP: go to https://mcp.zapier.com → New MCP Server → choose client → 'Add tool' (e.g. Buffer Add to Queue, LinkedIn Create Share Update) → connect accounts → copy the server URL into the agent client (keep it secret).
12. 12. Watch Zap History (https://zapier.com/app/history) after the first real run to confirm each step is green.

**Hand over to the agent (store as secrets)**
- `ZAPIER_HOOK_URL`: Zap trigger step 'Catch Hook' → custom webhook URL _(sensitivity: High - the URL itself is the credential)_
- `ZAPIER_HOOK_SECRET`: The string you typed into the Filter step _(sensitivity: High)_
- `ZAPIER_MCP_URL (optional)`: mcp.zapier.com → your server → connection URL _(sensitivity: High - contains auth)_

**Agent does**
1. 1. Trigger: POST $ZAPIER_HOOK_URL  Header 'Content-Type: application/json'. Body: {"secret":"$ZAPIER_HOOK_SECRET","text":"Hello from the agent","platforms":["linkedin","bluesky"],"media_url":"https://example.com/img.jpg","schedule_at":"2026-10-10T09:00:00Z","idempotency_key":"post-2026-10-10-001"}.
2. 2. Response is immediate and asynchronous: {"id":"...","request_id":"...","attempt":"...","status":"success"}. 'success' means accepted, NOT posted; keep request_id for lookup in Zap History.
3. 3. Media: send public HTTPS URLs; Zapier actions download files from URLs ('File' fields accept URLs).
4. 4. Scheduling: pass schedule_at to the Buffer action if it exposes a scheduled time; otherwise add 'Delay by Zapier' → 'Delay Until' = schedule_at (max delay ~1 month, unverified) or let the agent fire the hook at the right time.
5. 5. Token refresh: nothing for the agent; Zapier refreshes connected-account tokens. If an app disconnects, Zapier emails the owner and the Zap errors - human reconnects under https://zapier.com/app/connections.
6. 6. Rate limits: webhooks accept about 30 requests/second and 20,000 per 5 minutes per user (429 above that); legacy 1,000/5 min per Zap. Under load Zapier may return 200 but run later. Back off 60 s on 429.
7. 7. Idempotency: Zapier does not dedupe webhooks. Use 'Storage by Zapier' Get Value(idempotency_key) + Filter 'does not exist' before posting, then Set Value after; the agent sends each key only once and retries only on network errors.
8. 8. MCP route: agent calls the Zapier MCP tool (e.g. buffer_add_to_queue) with natural-language/field args; 2 tasks per call.

**Test:** curl -sS -X POST "$ZAPIER_HOOK_URL" -H 'Content-Type: application/json' -d '{"secret":"wrong","text":"test","platforms":["none"]}'  → expect HTTP 200 {"status":"success",...}; Zap History shows the run stopped at the Filter (nothing posted, no task used).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Zap never runs although hook returns success | Zap is off, or Zapier is delaying under load | Turn the Zap on; check Zap History after a few minutes |
| Fields empty in actions | Sample was sent as form-encoded or with different keys | Send JSON with Content-Type application/json; re-test trigger and remap |
| 'Webhooks by Zapier is a premium app' | Free plan | Upgrade to Professional or trial |
| Every request filtered out | secret mismatch or Filter uses wrong comparison | Use '(Text) Exactly matches' and identical secret |
| Action error: account disconnected | OAuth token revoked/expired at the network | Reconnect in https://zapier.com/app/connections |
| Task usage high | Each successful action counts; Paths with many actions | Use one Buffer action for many channels; filters stop runs cheaply |

**Notes:** Catch Hook has no built-in auth - treat the URL as a secret and filter on a secret field. Async: no post ids returned to the caller (unless you add a callback POST step to your own endpoint). Tasks counted per successful action; MCP calls 2 tasks each. X integration was relaunched with publishing; confirm current Threads/TikTok support in the Zapier app directory.

**Alternative:** 1) Zapier MCP at https://mcp.zapier.com: create server, add 'Buffer: Add to Queue' tool; 2) paste server URL into the agent client; 3) agent calls the tool directly. Or switch to n8n (self-hosted, free) with the same webhook contract.

## Make
_Route: `automation_tool_webhook_flow (Custom webhook → Router → destination modules / hub HTTP)`_ · Price: Free $0 (1,000 credits/mo, 15-min minimum interval for scheduled runs; instant webhooks still run on arrival); at 10,000 credits/mo: Core $9/mo annual ($10.59 monthly), Pro $16/mo annual ($18.82), Teams $29/mo annual ($34.12); Enterprise quote. Credits consumed per module run.

**Supports:** Native modules (verify in app directory): Facebook Pages, Instagram for Business, LinkedIn, Pinterest, YouTube, Telegram, Discord, Slack, Reddit; plus Buffer/Metricool/other hubs; anything else via HTTP module

**Before you start**
- A Make account (make.com); Free is enough to test, Core for regular use.
- Destination accounts or one hub API key (Buffer recommended).
- A random API key for the webhook (Make's built-in webhook API key feature).
- iPhone Shortcuts for Siri trigger (optional).

**Human does**
1. 1. Sign up at https://www.make.com/en/register, pick your data region (EU/US), verify email. Upgrade if needed: Organization → Subscription (label may differ).
2. 2. Scenarios → '+ Create a new scenario'. Click the big '+' → search 'Webhooks' → 'Custom webhook'.
3. 3. In the module click 'Create a webhook' / 'Add' → Webhook name 'post-social' → 'Show advanced settings' → 'API Keys' → 'Add' → create a key (copy its value) → optionally restrict IPs → Save. Copy the URL shown (https://hook.<zone>.make.com/<id>) as MAKE_WEBHOOK_URL.
4. 4. Leave the module listening ('Redetermine data structure' / 'Determining data structure') and send the sample test_call request (with all fields) - Make shows 'Successfully determined'.
5. 5. Add 'Flow control → Router'. On each route click the wrench → 'Set up a filter': condition text operator 'platforms' Array 'contains' 'linkedin' (and so on per network); add a 'test' route that goes directly to the response.
6. 6. On each route add the destination: e.g. 'HTTP → Make a request' POST https://api.buffer.com with header Authorization: Bearer <BUFFER_API_KEY>, Body type Raw / JSON, body = GraphQL createPost using {{1.text}}, {{1.media_url}}, {{1.schedule_at}}; or native LinkedIn 'Create a User Text Post' / Facebook Pages 'Create a Post' / Instagram for Business 'Create a Photo Post' (module labels may differ). Connect each account.
7. 7. Optional dedupe: add 'Data store' (create store 'posted', key = idempotency_key) → 'Get a record' then filter 'record does not exist'; after posting 'Add/replace a record'.
8. 8. Add 'Webhooks → Webhook response' at the end of each route: Status 200, Body {"ok":true,"route":"linkedin","result":"{{...id}}"}, custom header Content-Type: application/json.
9. 9. Click 'Run once' and send the test_call to verify; check the bubbles for each module's output.
10. 10. Save, then toggle the scenario ON with scheduling 'Immediately as data arrives'.
11. 11. Siri Shortcut: Shortcuts → 'Ask for Input' → 'Get Contents of URL': URL = MAKE_WEBHOOK_URL, Method POST, Headers x-make-apikey = <key>, Request Body JSON text/platforms → 'Show Result'.
12. 12. Optional MCP: create a separate scenario with schedule 'On demand', activate it; Profile → API/MCP access → create MCP token (label may differ), add Make's MCP server to the agent client - only active 'On demand' scenarios appear as tools.

**Hand over to the agent (store as secrets)**
- `MAKE_WEBHOOK_URL`: Custom webhook module → URL (https://hook.<zone>.make.com/...) _(sensitivity: Medium-High)_
- `MAKE_WEBHOOK_APIKEY`: Custom webhook → advanced settings → API Keys (value you created) _(sensitivity: High)_
- `MAKE_MCP_TOKEN (optional)`: Profile → API/MCP tokens _(sensitivity: High)_

**Agent does**
1. 1. Trigger: POST $MAKE_WEBHOOK_URL  Headers: 'x-make-apikey: $MAKE_WEBHOOK_APIKEY', 'Content-Type: application/json'. Body: {"text":"Hello","platforms":["linkedin"],"media_url":"https://cdn.example.com/a.jpg","schedule_at":"2026-10-10T09:00:00Z","idempotency_key":"post-2026-10-10-001"}.
2. 2. Response: the Webhook response body (ids) if reached within ~40 s; otherwise '200 Accepted' meaning queued - verify later in scenario History.
3. 3. Media: send public HTTPS URLs; modules can download via 'HTTP → Get a file' then pass binary data.
4. 4. Scheduling: pass schedule_at to the hub (Buffer dueAt). Make has no long 'wait until' module for days; otherwise the agent fires the webhook at the target time.
5. 5. Token refresh: none for the webhook key; Make refreshes connection tokens. On connection errors the scenario may be auto-disabled after repeated failures - human reconnects under Connections and re-enables.
6. 6. Rate limits: up to 30 incoming webhook requests/second (429 above); queue size per webhook ~667 items per 10,000 licensed credits. Back off 30-60 s on 429.
7. 7. Idempotency: Data store lookup on idempotency_key (human_steps 7); agent retries only on network errors.
8. 8. MCP: agent calls the on-demand scenario tool with the same fields.

**Test:** curl -sS -X POST "$MAKE_WEBHOOK_URL" -H "x-make-apikey: $MAKE_WEBHOOK_APIKEY" -H 'Content-Type: application/json' -d '{"text":"test","platforms":["test"],"idempotency_key":"test-1"}'  → expect HTTP 200 with the test route's Webhook response JSON (or 'Accepted'); nothing posted. 401 = wrong/missing API key header.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401 from webhook | API key configured but x-make-apikey header missing/wrong (Authorization/Bearer is not accepted) | Send header x-make-apikey: <key> |
| 'Accepted' but nothing happens | Scenario off, or data waits in queue | Turn scenario ON ('Immediately'); check webhook queue |
| Fields missing in modules | Data structure determined from a smaller sample | Click 'Redetermine data structure' and resend full sample |
| 429 Too Many Requests | >30 req/s or queue full | Throttle, back off |
| Scenario deactivated | Repeated errors (e.g. expired connection) | Fix/reconnect the connection, re-enable; add error handler routes |

**Notes:** Credits (formerly operations) are consumed per module run - Router branches that don't pass filters don't consume. Make MCP exposes only active 'On demand' scenarios. Exact social module names vary; check Make's app list. Keep webhook URL + key secret.

**Alternative:** 1) Make MCP server with an on-demand 'post' scenario; 2) or replace the Router with a single Buffer/Metricool module to cover many networks; 3) or n8n/Zapier with the same JSON contract.

## IFTTT
_Route: `automation_tool_webhook_flow (Webhooks 'Receive a web request' → service actions); weakest option`_ · Price: Free (limited Applets, no Webhooks); Pro ~$2.99-3.99/mo annual (Webhooks, unlimited Applets, multi-action); Pro+ ~$149.99/yr.

**Supports:** Unverified for 2026: Facebook Pages, Tumblr, Telegram, Discord, Reddit, LinkedIn, Buffer (check ifttt.com/explore); X and Facebook personal profiles historically removed

**Before you start**
- An IFTTT account on Pro or higher (Webhooks service needs a paid plan).
- Accounts on the destination services available on IFTTT in your region (often Buffer is the most useful one).
- iPhone Shortcuts for Siri (optional).

**Human does**
1. 1. Sign up at https://ifttt.com/join; open https://ifttt.com/plans and upgrade to Pro. Confirm 'Pro' shows on your profile.
2. 2. Go to https://ifttt.com/maker_webhooks → 'Connect'.
3. 3. Click 'Documentation' (https://ifttt.com/maker_webhooks/settings → shows URL https://maker.ifttt.com/use/<KEY>) and copy the key part as IFTTT_WEBHOOK_KEY.
4. 4. https://ifttt.com/create → 'If This' → search 'Webhooks' → 'Receive a web request' (fields value1-value3) or 'Receive a web request with a JSON payload' → Event Name 'post_social' → Create trigger.
5. 5. 'Then That' → pick the destination service (e.g. Buffer 'Add to Buffer', Facebook Pages 'Create a status message', Telegram 'Send message', Discord, Tumblr - availability varies) → connect account → map Value1 to the message/text and Value2 to the photo URL field.
6. 6. (Pro) Click '+' to add more actions (multi-action) for other networks.
7. 7. Click 'Continue' → 'Finish'. Confirm the Applet is 'Connected'.
8. 8. Test from the Documentation page: fill event 'post_social' and value1 'test', click 'Test It'; check the destination and the Applet's 'View activity'.
9. 9. Siri Shortcut: Shortcuts → 'Ask for Input' → 'Get Contents of URL': URL https://maker.ifttt.com/trigger/post_social/with/key/<KEY>, Method POST, Request Body JSON value1 = Provided Input, value2 = media URL.
10. 10. Hand IFTTT_WEBHOOK_KEY and IFTTT_EVENT to the agent.

**Hand over to the agent (store as secrets)**
- `IFTTT_WEBHOOK_KEY`: https://ifttt.com/maker_webhooks → Documentation (or Settings → URL /use/<KEY>) _(sensitivity: High - fires any of your webhook applets; regenerate from Webhooks settings 'Edit' if leaked)_
- `IFTTT_EVENT`: The Event Name you typed (post_social) _(sensitivity: Low)_

**Agent does**
1. 1. Trigger (value fields): POST https://maker.ifttt.com/trigger/$IFTTT_EVENT/with/key/$IFTTT_WEBHOOK_KEY  Header 'Content-Type: application/json'. Body {"value1":"<text>","value2":"<media_url>","value3":"<link>"}.
2. 2. JSON-payload trigger alternative: POST https://maker.ifttt.com/trigger/$IFTTT_EVENT/json/with/key/$IFTTT_WEBHOOK_KEY with any JSON (only usable via filter code/JsonPayload ingredient).
3. 3. Response: plain text 'Congratulations! You've fired the post_social event' - no post id. Record the time and verify on the destination.
4. 4. Media: value2 must be a public HTTPS image URL accepted by the action's photo field.
5. 5. Scheduling: none - the agent fires the request at the target time (agent-side scheduler/cron).
6. 6. Token refresh: none; key is static. Service connections may expire - IFTTT emails; human reconnects at ifttt.com/my_services.
7. 7. Rate limits: undocumented here (unverified); keep to a few requests per minute and back off 60 s on non-200.
8. 8. Idempotency: none - never retry after a 200; only retry on network failure, and check the destination first.

**Test:** curl -sS -X POST https://maker.ifttt.com/trigger/ping_test/with/key/$IFTTT_WEBHOOK_KEY -H 'Content-Type: application/json' -d '{"value1":"test"}'  → expect HTTP 200 'Congratulations! You've fired the ping_test event' (event with no Applet → nothing posted; validates the key).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 200 Congratulations but nothing posted | Event name mismatch, Applet off, or action failed | Check event spelling, Applet 'View activity' for errors |
| 401/'Invalid key' | Wrong or regenerated key | Copy key again from maker_webhooks Documentation |
| Long delay | IFTTT queue / action latency | Expect up to minutes; not suitable for exact timing |
| Desired network missing | Service/action removed (e.g. X) | Use Buffer action via IFTTT or switch to n8n/Make/Zapier |

**Notes:** Weakest option for an agent: fire-and-forget, no ids, max 3 value fields, social actions shrink over time (X and Facebook personal-profile posting removed historically). Current action list could not be verified (proxy).

**Alternative:** 1) Use n8n/Make/Zapier webhook flow → Buffer instead; 2) or IFTTT Webhooks → Buffer action so one Applet covers all Buffer channels.

## Later
_Route: `manual_in_hub (no public API, no MCP)`_ · Price: Starter $18.75/mo, Growth $37.50/mo, Scale $82.50/mo (annual billing); higher monthly. Starter: 1 social set, 30 posts/profile/month.

**Supports:** Instagram, Facebook, TikTok, Pinterest, LinkedIn, Threads, YouTube Shorts, Snapchat

**Before you start**
- Later account on a paid plan (trial available).
- Instagram Business/Creator account linked to a Facebook Page for auto-publish; TikTok, Pinterest, LinkedIn, Threads, YouTube, Snapchat accounts.
- Later mobile app for notification-publishing cases (e.g. Instagram music/Stories).

**Human does**
1. 1. Sign up at https://later.com → 'Start free trial' → choose Starter/Growth/Scale; enter billing.
2. 2. Connect profiles: app.later.com → 'Social Profiles' / '+ Add Profile' (label may differ) → choose network → log in and authorize. Confirm each profile appears at the top of the calendar.
3. 3. Each time the agent delivers a batch: open app.later.com → 'Media Library' → 'Upload Media' → drag in the files from the agent's folder.
4. 4. Drag a media item onto the calendar slot (date/time from the agent's CSV) → the post editor opens.
5. 5. Select the profile(s) in the editor, paste the caption variant for each network from the agent checklist, add first comment/hashtags if provided.
6. 6. Choose 'Auto Publish' (where supported) vs 'Notification' publishing; set the exact time; click 'Save'.
7. 7. For notification posts, at post time open the Later mobile app from the push notification → 'Copy caption' → open in the network app → paste and publish.
8. 8. Optional: Later 'Link in Bio' - add the URL for the Instagram post in the editor.
9. 9. After publishing, open the calendar; posts turn to 'Published'. Tick them off in the agent's checklist.
10. 10. Enterprise/agency: ask Later sales about any partner API access (none is public).

**Agent does**
1. 1. Produce a content calendar CSV: date, time (with time zone), profile, caption, hashtags, first comment, media filename, link.
2. 2. Resize/encode media to the content_specs per network (e.g. ffmpeg to 1080x1920 H.264 AAC MP4 for Reels/TikTok/Shorts; JPG 1080x1350 for feed) and name files to match the CSV.
3. 3. Write caption variants per network respecting limits (Threads 500, Instagram 2,200/30 hashtags, Pinterest 500 desc + 100 title, LinkedIn 3,000).
4. 4. Bundle into one folder/zip plus a ready-to-paste checklist (one block per post).
5. 5. Send a reminder to the human one day before the batch week, and a reminder at post time for any notification-publish posts.
6. 6. After the week, ask the human to confirm published posts and record links.

**Content specs:** **instagram:** Feed images 1080x1350 (4:5) or 1080x1080, JPG/PNG; Reels 1080x1920 9:16 MP4/H.264, up to 15 min (unverified for Later auto-publish limits); caption max 2,200 chars, max 30 hashtags; links not clickable (use Later Link in Bio). · **tiktok:** 1080x1920 9:16 MP4, caption up to 2,200 chars (unverified). · **pinterest:** 1000x1500 (2:3), title 100 chars, description 500 chars, destination link allowed. · **linkedin:** Text up to 3,000 chars; image 1200x627 or 1080x1080; video MP4. · **threads:** 500 chars, images/video up to 10 items carousel (unverified). · **youtube_shorts:** 9:16 vertical, up to 3 minutes (YouTube limit), title 100 chars. · **general:** Later's Starter plan caps 30 posts per profile per month; check Later's help center for current upload size limits (unverified).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Post failed to auto-publish on Instagram | Personal IG account or Facebook link broken | Switch to Business/Creator, reconnect via Facebook |
| Can't schedule more posts | Starter plan 30 posts/profile/month cap | Upgrade plan or move overflow to next month |
| X (Twitter) not available | Later dropped X support on 28 Aug 2025 | Use Buffer/Publer for X |
| Video rejected | Wrong aspect ratio/length/codec | Re-encode to 9:16 H.264 per specs |

**Notes:** Later has no public self-serve API and no MCP server (2026) - not suitable for agent automation. Dropped X support on 28 Aug 2025; no Bluesky, Telegram, Mastodon or Google Business.

**Alternative:** 1) Move to Buffer (API + MCP, free tier) or Publer (Business API); 2) connect the same profiles there; 3) let the agent post via API.

## Publer
_Route: `hosted_hub_api (REST https://app.publer.com/api/v1, async jobs)`_ · Price: Free (limited, no API); Professional (no API); Business $10/mo monthly or $8/mo yearly for the first account, ~$7 per additional account (from the third), +$3 per team member; API included on Business; Enterprise custom.

**Supports:** Instagram, Facebook, TikTok, YouTube, LinkedIn, X, Threads, Bluesky, Pinterest, Mastodon, Google Business Profile, Telegram, WordPress

**Before you start**
- Publer account on the Business plan (API is Business/Enterprise only).
- Accounts on each network (Instagram Business/Creator, Facebook Page, etc.).
- Workspace owner/admin rights to create API keys.
- Media as files (multipart upload, max 200 MB direct) or public URLs.

**Human does**
1. 1. Sign up at https://publer.com → 'Sign up free' → verify email.
2. 2. Upgrade: Settings → Billing / Plans (label may differ) → Business → choose number of accounts → pay. Confirm 'Business' badge.
3. 3. Connect accounts: in app.publer.com click '+ Add Account' (or Accounts → Add) → choose network → authorize. For Bluesky use an app password; for Mastodon enter your instance. Confirm each account appears in the left sidebar.
4. 4. Create the key: Settings → Access & Login → API Keys → 'Create API Key' → name 'agent' → tick scopes workspaces, accounts, posts, media (and job status if listed) → Create.
5. 5. Copy the key immediately into your password manager as PUBLER_API_KEY.
6. 6. Note the workspace (the agent can fetch its id; or copy from URL/settings).
7. 7. Optional MCP (beta, Enterprise/ambassadors): profile settings → AI & Automations → MCP → create key, select workspaces/accounts → paste the MCP URL into the agent client.
8. 8. Hand PUBLER_API_KEY to the agent and run the test_call; confirm the workspace list appears.
9. 9. After the first post, open the Publer calendar and confirm it shows as scheduled/published.

**Hand over to the agent (store as secrets)**
- `PUBLER_API_KEY`: Settings → Access & Login → API Keys → Create API Key _(sensitivity: High - scoped to the selected permissions; delete key there if leaked)_
- `PUBLER_WORKSPACE_ID`: Agent fetches via GET /workspaces _(sensitivity: Low)_

**Agent does**
1. 1. Workspaces: GET https://app.publer.com/api/v1/workspaces  Header 'Authorization: Bearer-API $PUBLER_API_KEY'. Keep id.
2. 2. Accounts: GET https://app.publer.com/api/v1/accounts  Headers 'Authorization: Bearer-API $PUBLER_API_KEY', 'Publer-Workspace-Id: <id>'. Keep id + provider per account.
3. 3. Media upload (file): POST https://app.publer.com/api/v1/media  Headers as above, multipart/form-data field 'file' (optional direct_upload=true, in_library=false). Keep id, path, type. Max 200 MB (413 if larger). From URL: use the media-from-URL endpoint (per docs media-handling) → returns job_id → poll job status → media id.
4. 4. Create/schedule: POST https://app.publer.com/api/v1/posts/schedule  Headers + 'Content-Type: application/json'. Body: {"bulk":{"state":"scheduled","posts":[{"networks":{"linkedin":{"type":"photo","text":"Hello","media":[{"id":"MEDIA_ID"}]}},"accounts":[{"id":"ACC_ID","scheduled_at":"2026-10-10T09:00:00Z"}]}]}}. Response {"job_id":"..."}. For immediate publishing use the publish endpoint/state per docs (POST /posts/schedule/publish, unverified).
5. 5. Poll: GET https://app.publer.com/api/v1/job_status/{job_id} every 5-10 s until status 'completed'; read payload/failures per account.
6. 6. Token refresh: none; key is static until deleted. Network tokens are refreshed by Publer; reconnect prompts appear in the app.
7. 7. Rate limits: 100 requests per 2-minute sliding window per user (all keys combined); on 429 wait for the window, poll job_status sparingly.
8. 8. Idempotency: no idempotency key (unverified); keep a ledger, and before retrying list scheduled posts (GET /posts with filters) to avoid duplicates.

**Test:** curl -sS -H "Authorization: Bearer-API $PUBLER_API_KEY" https://app.publer.com/api/v1/workspaces  → expect HTTP 200 JSON array of workspaces [{"id":"...","name":"..."}]. Read-only.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401 Unauthorized | Used 'Bearer' instead of 'Bearer-API', or key deleted | Header must be 'Authorization: Bearer-API <key>' |
| 403 / missing workspace | Publer-Workspace-Id header missing or key lacks scope | Add header; recreate key with needed scopes |
| job_status shows failure for an account | Network-specific validation (media type, length) or disconnected account | Read failure message, fix content or reconnect account |
| 413 on upload | >200 MB file | Compress or upload from URL |
| 429 | >100 req/2 min | Back off; reduce polling frequency |

**Notes:** Auth scheme is literally 'Bearer-API <key>'. Async job model - always poll job_status. API only on Business/Enterprise. Good value for one person who also wants Mastodon/Bluesky/Telegram.

**Alternative:** 1) Publer MCP (beta, Enterprise); 2) Zapier/Make Publer integration triggered by the agent's webhook; 3) Buffer API as fallback.

## Metricool
_Route: `hosted_hub_mcp_or_api (MCP on all plans; REST API on Advanced/Custom)`_ · Price: Free (MCP included, max 20 scheduled posts, 30 days analytics); Starter from $20/mo annual ($25 monthly, 5 brands); Advanced from ~€43-53/mo (API, Zapier, Make); Custom quote; X +$5/mo per account.

**Supports:** Instagram, Facebook, TikTok, YouTube, LinkedIn, X (paid add-on), Threads, Bluesky, Pinterest, Google Business Profile, Twitch (analytics)

**Before you start**
- Metricool account (metricool.com); MCP works on every plan, REST API needs Advanced or Custom.
- Accounts on each network; X requires the paid add-on.
- MCP-capable client (Claude Code/Desktop/claude.ai, Cursor, n8n, Make).
- Media at public, non-expiring URLs.

**Human does**
1. 1. Sign up at https://metricool.com → 'Sign up free' → verify email.
2. 2. Create/select a brand → 'Connect' each network (Instagram, Facebook, TikTok, YouTube, LinkedIn, Threads, Bluesky, Pinterest, Google Business; X after buying the add-on). Confirm green connected icons.
3. 3. (API route) Upgrade to Advanced: Account → Billing / Plans (label may differ).
4. 4. MCP route: Claude Code: claude mcp add --transport http metricool https://ai.metricool.com/mcp ; Claude.ai/Desktop: Settings → Connectors → Add custom connector → URL https://ai.metricool.com/mcp. Log in to Metricool in the browser and approve access.
5. 5. API route: Account Settings → API → copy the access token as METRICOOL_USER_TOKEN.
6. 6. Find userId and blogId: open the brand; the URL looks like https://app.metricool.com/evolution/web?blogId=00000&userId=0000000 - copy both numbers.
7. 7. Set the brand's time zone in brand settings (Metricool uses it for scheduling).
8. 8. Hand the three values to the agent; run the test_call.
9. 9. After the first scheduled post, open Planner → confirm it appears at the right time.

**Hand over to the agent (store as secrets)**
- `METRICOOL_USER_TOKEN`: Account Settings → API (Advanced/Custom only) _(sensitivity: High)_
- `METRICOOL_USER_ID`: URL parameter userId when a brand is open _(sensitivity: Low)_
- `METRICOOL_BLOG_ID`: URL parameter blogId, or GET /api/admin/simpleProfiles _(sensitivity: Low)_

**Agent does**
1. 1. List brands: GET https://app.metricool.com/api/admin/simpleProfiles?userId=$METRICOOL_USER_ID  Header 'X-Mc-Auth: $METRICOOL_USER_TOKEN'. Keep each blogId.
2. 2. Normalize media: GET https://app.metricool.com/api/actions/normalize/image/url?url=<urlencoded public URL>&blogId=..&userId=.. with X-Mc-Auth → keep returned URL/media id.
3. 3. Schedule: POST https://app.metricool.com/api/v2/scheduler/posts?blogId=$METRICOOL_BLOG_ID&userId=$METRICOOL_USER_ID  Headers 'X-Mc-Auth: $METRICOOL_USER_TOKEN', 'Content-Type: application/json'. Body: {"publicationDate":{"dateTime":"2026-10-10T09:00:00","timezone":"Europe/Madrid"},"text":"Hello","providers":[{"network":"linkedin"}],"media":["<normalized url>"],"autoPublish":true,"draft":false}. (media shape partly unverified.) Keep returned post id.
4. 4. Scheduling is native via publicationDate (local time + IANA zone, no offset in dateTime).
5. 5. Token refresh: none (static token). Reconnect networks in the UI if posts fail with auth errors.
6. 6. Rate limits: not documented here (unverified); keep under ~1 request/second, back off on 429.
7. 7. Idempotency: list scheduled posts (GET /api/v2/scheduler/posts?blogId&userId&start&end, unverified) before retrying.
8. 8. MCP route: call Metricool MCP tools (e.g. list brands, schedule post) - the free plan caps scheduled posts at 20.

**Test:** curl -sS -H "X-Mc-Auth: $METRICOOL_USER_TOKEN" "https://app.metricool.com/api/admin/simpleProfiles?userId=$METRICOOL_USER_ID"  → expect HTTP 200 JSON list of brands with blogId values. Read-only.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401/403 | Missing X-Mc-Auth or plan below Advanced | Send header; upgrade to Advanced |
| Missing blogId/userId error | Query params omitted | Add both to every request |
| Media skipped | Private/expiring URL | Use permanent public URL; normalize first |
| Post at wrong time | dateTime with offset or wrong timezone | Send local dateTime without offset plus IANA timezone |
| MCP cannot schedule more | Free plan 20-scheduled-posts cap | Upgrade or wait for posts to publish |

**Notes:** MCP (https://ai.metricool.com/mcp) works on all plans; API only on Advanced/Custom. X costs extra. No Mastodon. Good if you also want analytics.

**Alternative:** 1) Metricool MCP from Claude/Cursor (free); 2) Zapier/Make Metricool integration (Advanced); 3) Buffer API as fallback.

## DeviantArt
_Route: `official_api_own_account`_ · Docs: https://www.deviantart.com/developers/

**Before you start**
- A DeviantArt account (free) that will post; email verified.
- No paid plan needed for the API (Core membership optional).
- A redirect URI the agent can receive (e.g. http://localhost:3000/callback).
- No app review documented for single-user apps.

**Human does**
1. 1. Sign in at https://www.deviantart.com/users/login with the posting account; verify your email if prompted (unverified accounts may not submit).
2. 2. Open https://www.deviantart.com/developers/ and click 'Register your Application' (direct: https://www.deviantart.com/developers/register).
3. 3. Fill Title = 'My upload agent', Description = 'Personal uploader for my own art'. Set 'OAuth2 Grant Type' = 'Authorization Code'. In 'OAuth2 Redirect URI Whitelist' paste the exact redirect URI from the agent (e.g. http://localhost:3000/callback). Leave other fields default.
4. 4. Tick the API License Agreement / terms checkbox and click 'Save'.
5. 5. Go to https://www.deviantart.com/developers/apps (Your Applications). Copy 'client_id' → DA_CLIENT_ID and 'client_secret' → DA_CLIENT_SECRET (click 'Show' if hidden). Set the app to 'Published'/active if there is such a toggle (label may differ).
6. 6. Ask the agent for the authorization link; open it while logged in. Review the requested scopes (user, stash, publish) and click 'Authorize'/'Allow'.
7. 7. The browser redirects to the callback; if nothing is listening there, copy the full address-bar URL (contains ?code=...) and paste it to the agent within a few minutes (codes are short-lived).
8. 8. The agent confirms your username via /user/whoami; check it matches.
9. 9. Optional: note the gallery folder(s) the agent should post into (https://www.deviantart.com/<you>/gallery) — the agent can list folder ids itself.
10. 10. To revoke: Settings → Applications / Connected Apps (label may differ) → revoke the app.

**Hand over to the agent (store as secrets)**
- `DA_CLIENT_ID`: deviantart.com/developers/apps → your app _(sensitivity: Low)_
- `DA_CLIENT_SECRET`: Same page _(sensitivity: High)_
- `DA_REFRESH_TOKEN`: Produced by the agent's code exchange _(sensitivity: High — can publish as you; rotates on each refresh)_

**Agent does**
1. 1. Authorize URL: https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=$DA_CLIENT_ID&redirect_uri=<urlencoded>&scope=user%20stash%20publish&state=<random>.
2. 2. Token: POST https://www.deviantart.com/oauth2/token (application/x-www-form-urlencoded) grant_type=authorization_code&client_id=..&client_secret=..&code=..&redirect_uri=.. → keep access_token (expires_in 3600), refresh_token.
3. 3. Refresh before each run or on 401: POST https://www.deviantart.com/oauth2/token grant_type=refresh_token&client_id=..&client_secret=..&refresh_token=.. → persist the NEW refresh_token (rotation; ~3-month lifetime per third-party clients, unverified).
4. 4. Upload to Sta.sh: POST https://www.deviantart.com/api/v1/oauth2/stash/submit, Authorization: Bearer <token>, multipart: file=<image>, title='Title', artist_comments='Description', tags[]=tag1, tags[]=tag2, is_dirty=false → keep itemid.
5. 5. List gallery folders (optional): GET https://www.deviantart.com/api/v1/oauth2/gallery/folders?limit=50 → folderid for galleryids[].
6. 6. Publish: POST https://www.deviantart.com/api/v1/oauth2/stash/publish form itemid=<id>&is_mature=false&agree_submission=true&agree_tos=true&is_ai_generated=false&noai=true&allow_comments=true&galleryids[]=<folderid>&display_resolution=0 → keep deviationid, url. If is_mature=true add mature_level and mature_classification[].
7. 7. Status/text post (optional): POST https://www.deviantart.com/api/v1/oauth2/user/statuses/post body=... (needs scope user.manage).
8. 8. Scheduling: no API schedule field (unverified). Upload to Sta.sh early (step 4) and store {itemid, publish_at}; at publish_at run step 6.
9. 9. Rate limits undocumented: on 429 (or error 'user_api_threshold') back off exponentially starting at 60 s; keep ≥2 s between calls.
10. 10. Idempotency: persist itemid after submit and deviationid after publish; never call publish twice for the same itemid; before retrying check GET https://www.deviantart.com/api/v1/oauth2/stash/item/{itemid} (unverified path).

**Test:** GET https://www.deviantart.com/api/v1/oauth2/user/whoami with Authorization: Bearer <access_token> → 200 {"userid":"...","username":"you","usericon":"...","type":"regular"}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| invalid_request redirect_uri | Redirect URI not exactly whitelisted | Edit the app and add the exact URI |
| insufficient_scope on publish | Token authorized without stash/publish | Re-authorize with scope=user stash publish |
| invalid_grant on refresh | Old (rotated) refresh token reused or expired | Always save the newest refresh token; re-authorize if expired |
| Publish error about AI or mature fields | is_ai_generated or mature fields missing/invalid | Send is_ai_generated truthfully and mature_level/classification when is_mature=true |
| 429 / user_api_threshold | Too many requests | Exponential backoff; slow down |

**Notes:** Scopes and token lifetimes come from third-party clients and the developer page via search (not re-fetched; DeviantArt blocks the proxy). Access tokens last 1 h; refresh tokens rotate. Declare AI-generated work truthfully. Sta.sh acts as a draft store until publish.

**Alternative:** Manual submit at https://www.deviantart.com/submit (choose file, title, tags, gallery, Submit; native scheduling unverified). Unofficial self-hosted scheduler Isekai Core (GitHub) can queue Sta.sh items for later publish — review its code before use.

## SoundCloud
_Route: `official_api_own_account`_ · Docs: https://developers.soundcloud.com/docs/api

**Before you start**
- A SoundCloud account with an active Artist Pro subscription (required to register API apps; price varies by region, see https://soundcloud.com/creator-subscriptions or Settings → Subscription).
- Files ≤4 GB and ≤24 h each; formats AIFF, WAV, FLAC, OGG, MP2, MP3, AAC, AMR, WMA.
- A redirect URI the agent can receive (e.g. http://localhost:8080/callback).
- Optional: Node.js to run the official sc-api-auth.mjs helper from github.com/soundcloud/api.

**Human does**
1. 1. Sign in at https://soundcloud.com/signin. If not Artist Pro, open https://soundcloud.com/creator-subscriptions (or Settings → Subscription), choose Artist Pro, pay, and confirm the badge on your profile.
2. 2. Open https://soundcloud.com/you/apps and click 'Register a new application'.
3. 3. Enter Name = 'My upload agent', a short description, optional website; tick the API Terms of Use checkbox; click 'Register'.
4. 4. On the app's page, in 'Redirect URI' add exactly the URI the agent gives you (e.g. http://localhost:8080/callback). Save.
5. 5. Copy 'Client ID' → SOUNDCLOUD_CLIENT_ID and 'Client Secret' → SOUNDCLOUD_CLIENT_SECRET.
6. 6. (Alternative to steps 2–5) Clone https://github.com/soundcloud/api and run 'node scripts/sc-api-auth.mjs' which walks through app registration/authorization.
7. 7. Ask the agent for the authorization link (https://secure.soundcloud.com/authorize?...); open it while logged in and click 'Connect'/'Allow'.
8. 8. If the agent's local listener did not catch it, paste the full redirected URL (with ?code=...) to the agent within a few minutes.
9. 9. The agent stores SOUNDCLOUD_REFRESH_TOKEN and calls GET /me; confirm the username.
10. 10. Keep Artist Pro active and the app in use — unused apps may be revoked.

**Hand over to the agent (store as secrets)**
- `SOUNDCLOUD_CLIENT_ID`: soundcloud.com/you/apps → your app _(sensitivity: Low)_
- `SOUNDCLOUD_CLIENT_SECRET`: Same page _(sensitivity: High)_
- `SOUNDCLOUD_REFRESH_TOKEN`: From the agent's code exchange; single-use, rotates every refresh _(sensitivity: High — the agent must persist each new one)_

**Agent does**
1. 1. PKCE: generate code_verifier (43–128 chars), code_challenge=BASE64URL(SHA256(verifier)). Open https://secure.soundcloud.com/authorize?client_id=..&redirect_uri=..&response_type=code&code_challenge=..&code_challenge_method=S256&state=<random>.
2. 2. Exchange: POST https://secure.soundcloud.com/oauth/token, Content-Type: application/x-www-form-urlencoded, body grant_type=authorization_code&client_id=..&client_secret=..&redirect_uri=..&code_verifier=..&code=.. → access_token, refresh_token, expires_in (~3600), scope.
3. 3. Refresh: cache the access token and reuse it until near expiry; then POST https://secure.soundcloud.com/oauth/token grant_type=refresh_token&refresh_token=..&client_id=..&client_secret=.. and persist the NEW refresh token atomically (old one is single-use). Do not refresh on every request — token endpoints are rate-limited.
4. 4. Upload: POST https://api.soundcloud.com/tracks, Authorization: OAuth <access_token>, multipart/form-data: track[title]=Title (required), track[asset_data]=@track.wav (required), track[sharing]=private|public, track[description], track[genre], track[tag_list]='tag1 "two words"', track[artwork_data]=@cover.jpg, track[downloadable]=false, track[license]=all-rights-reserved, track[release_date]=2026-10-07 (metadata only) → 201 Track; keep urn (soundcloud:tracks:...), id, permalink_url.
5. 5. Scheduling (no publish-at field in the API): upload with track[sharing]=private; store {urn, publish_at}; at publish_at PUT https://api.soundcloud.com/tracks/{track_urn} JSON {"track":{"sharing":"public"}} (or form track[sharing]=public) → 200.
6. 6. Wait for processing: GET https://api.soundcloud.com/tracks/{track_urn} until state=finished (field name per Track schema; unverified).
7. 7. Playlists: POST https://api.soundcloud.com/playlists JSON {"playlist":{"title":"Album","sharing":"public","tracks":[{"urn":"soundcloud:tracks:123"}]}} (body shape per CreateUpdatePlaylistRequest; unverified exact).
8. 8. Rate limits: 15,000 play-stream requests/24 h per client_id; token endpoint rate-limited per app/IP; on 429 back off exponentially and do not hammer refresh.
9. 9. Idempotency: persist the track urn immediately after 201; before re-uploading, GET https://api.soundcloud.com/me/tracks?limit=20 and skip if the same title/permalink exists.

**Test:** GET https://api.soundcloud.com/me with Authorization: OAuth <access_token> → 200 {"urn":"soundcloud:users:...","username":"you",...}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Cannot register an app | No Artist Pro subscription | Subscribe to Artist Pro |
| invalid_grant on refresh | A previous refresh token was reused (single-use) or lost | Persist each new refresh token; re-authorize if broken |
| 401 with Bearer header | Upload endpoint expects 'Authorization: OAuth <token>' per the spec | Use the OAuth prefix |
| 422 on upload | Missing track[title]/asset_data or unsupported format/size | Send both required fields; ≤4 GB supported format |
| 429 on token endpoint | Too many token requests | Cache tokens; refresh only near expiry |

**Notes:** Use secure.soundcloud.com/oauth/token (api.soundcloud.com/oauth2/token is deprecated). Refresh tokens are single-use. track[release_date] is metadata, not a publish time. Native scheduled release exists in the SoundCloud upload UI for Artist Pro (manual). Unused apps may be revoked.

**Alternative:** Native scheduling in the SoundCloud web uploader: 1) https://soundcloud.com/upload, 2) add file + metadata, 3) set to private and use 'Schedule' / release time (Artist Pro, label may differ), 4) Save. The agent prepares files, artwork (square, ≥800x800 recommended, unverified) and captions.

## Hive
_Route: `official_api_own_account`_ · Docs: https://developers.hive.io/

**Before you start**
- A Hive account (free signup via Ecency or PeakD partners, or paid account creation; wait minutes to a day depending on method).
- Enough Resource Credits (RC) - from staked Hive Power or delegations; new free accounts usually get a delegation.
- Image uploads to images.hive.blog need the account above a reputation threshold (service-configurable).
- Hive Keychain browser extension or PeakD/Ecency to view keys; no API fees.

**Human does**
1. 1. Log in to https://peakd.com (or https://ecency.com) with Hive Keychain.
2. 2. Check RC: PeakD -> your avatar -> Wallet; the RC percentage is shown (label may differ). Keep it above ~20% for posting.
3. 3. Get the PRIVATE POSTING key (starts with 5, WIF): Hive Keychain -> select account -> Manage accounts / Keys (label may differ) -> Posting -> reveal/copy private key. Or PeakD -> Settings -> Keys & Permissions.
4. 4. Never give the owner, active or memo key or the master password - posting key only (it cannot move funds).
5. 5. Safer option: create a separate bot account; on your main account go to PeakD -> Settings -> Keys & Permissions -> Posting -> Add account authority -> enter the bot account -> sign with your active key. Then hand over the bot account's posting key (agent posts with author = your main account using the bot's key).
6. 6. Pick the community to post into (e.g. hive-123456 from the community URL) and your default tags.
7. 7. Store HIVE_USERNAME and HIVE_POSTING_KEY in your password manager and hand them to the agent; optional HIVE_API_NODE.
8. 8. Confirm: the agent reports the posting key matches your account's posting authority (no broadcast).
9. 9. Optional: a test reply on your own old post, then edit it.
10. 10. To revoke: change the posting key (PeakD -> Keys & Permissions -> change keys; needs owner/master) or remove the account authority added in step 5.

**Hand over to the agent (store as secrets)**
- `HIVE_USERNAME`: Your account name (without @) _(sensitivity: Low)_
- `HIVE_POSTING_KEY`: Hive Keychain or PeakD -> Keys & Permissions -> Posting private key (WIF, starts with 5) _(sensitivity: High - can post, vote, follow, comment as the account; cannot transfer funds)_
- `HIVE_API_NODE (optional)`: e.g. https://api.hive.blog _(sensitivity: Low)_
- `HIVE_COMMUNITY (optional)`: Community id like hive-123456 from its URL _(sensitivity: Low)_

**Agent does**
1. 1. Use @hiveio/dhive (JS) or beem/hive-nectar (Python) against a public node (https://api.hive.blog, https://api.deathwing.me); fail over between nodes on errors. No token refresh - keys don't expire.
2. 2. Check: POST https://api.hive.blog {"jsonrpc":"2.0","method":"condenser_api.get_accounts","params":[["<user>"]],"id":1} -> posting.key_auths must contain the public key derived from the WIF (or posting.account_auths includes the bot). RC: rc_api.find_rc_accounts {"accounts":["<user>"]}.
3. 3. Images: signature = secp256k1_sign(sha256('ImageSigningChallenge' + imageBytes), postingKey) hex; POST https://images.hive.blog/<username>/<signature> multipart with the file -> {url}; insert into body as ![alt](url).
4. 4. Post: broadcast operation ['comment', {parent_author:'', parent_permlink:'hive-123456' (community or first tag), author:'<user>', permlink:'my-post-2026-10-07' (unique, lowercase, a-z0-9-), title:'Title', body:'markdown', json_metadata:JSON.stringify({tags:['hive-123456','tag2'], image:['<url>'], app:'agent/1.0', format:'markdown'})}] signed with the posting key (dhive: client.broadcast.comment(op, PrivateKey.fromString(key))).
5. 5. Optional same transaction: comment_options {author, permlink, max_accepted_payout:'1000000.000 HBD', percent_hbd:10000, allow_votes:true, allow_curation_rewards:true, extensions:[[0,{beneficiaries:[{account,weight}]}]]}.
6. 6. Reply: same op with parent_author/parent_permlink of the target post.
7. 7. Idempotency: the permlink is the key - derive it from the queue item; before retrying, condenser_api.get_content [author, permlink] - if it exists, don't rebroadcast (re-broadcasting the same permlink edits the post).
8. 8. Limits: >=5 min between root posts, >=3 s between replies; RC errors ('not enough RC') -> wait for regeneration (~20%/day).
9. 9. Scheduling: chain has none - agent-side queue (or schedule manually in PeakD/Ecency).

**Test:** curl -s https://api.hive.blog -d '{"jsonrpc":"2.0","method":"condenser_api.get_accounts","params":[["'$HIVE_USERNAME'"]],"id":1}' -> result[0].posting.key_auths[0][0] equals the public key derived from HIVE_POSTING_KEY (no broadcast). Optional rc_api.find_rc_accounts for RC.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 'missing required posting authority' (wording may differ) | Wrong key or account authority not set | Use the posting key of the right account; check account_auths |
| 'You may only post once every 5 minutes' (wording may differ) | HIVE_MIN_ROOT_COMMENT_INTERVAL | Wait 5 min between root posts |
| 'not enough RC' (wording may differ) | Resource Credits depleted | Wait, power up HP, or get an RC delegation |
| Image upload 403/400 | Bad signature or reputation below threshold | Sign sha256('ImageSigningChallenge'+bytes) with posting key; use another host if reputation low |
| Post edited instead of new | Permlink reused | Use unique permlinks |

**Notes:** Posts are permanent on chain (edits allowed; deletion only without votes/payout). The posting key can also vote and follow. Payout window 7 days. 3Speak video needs its own uploader.

**Alternative:** 1) PeakD: write post -> click the clock/schedule icon next to Publish (label may differ) -> pick time -> confirm with Keychain. 2) Ecency: editor -> Schedule -> pick time. 3) Both may require granting the scheduler posting authority.

## Blogger
_Route: `official_api_own_account`_ · Docs: https://developers.google.com/blogger/docs/3.0/reference/posts/publish

**Before you start**
- Google account that is Admin or Author of the Blogger blog.
- Google Cloud project (free) with Blogger API v3 enabled.
- OAuth Desktop client + test user (Testing mode: refresh tokens expire after 7 days; 'blogger' is a sensitive scope).
- Public image hosting (own site/CDN/object storage) because the API has no media upload.
- No paid plan; API is free.

**Human does**
1. Open https://console.cloud.google.com and sign in (any Google account with 2-Step Verification is fine; you authorize with the account that owns the channel/blog/business later). Top bar → project picker (left of the search box) → 'New project' → Project name: e.g. 'my-posting-agent' → Location: 'No organization' → Create. Wait ~30 s, then pick the project in the project picker. Confirm: the project name shows in the top bar.
2. Left menu (☰) → 'APIs & Services' → 'Library' → search 'Blogger API v3' → open each result → click 'Enable'. Confirm: the API page now shows 'API enabled' and a 'Manage' button.
3. Left menu → 'APIs & Services' → 'OAuth consent screen' (opens 'Google Auth Platform'; label may differ) → 'Get started'. App information: App name 'my-posting-agent', User support email: pick your address → Next. Audience: 'External' → Next. Contact information: your email → Next. Tick 'I agree to the Google API Services: User Data Policy' → Continue → Create.
4. Google Auth Platform → 'Data access' → 'Add or remove scopes' → in 'Manually add scopes' paste https://www.googleapis.com/auth/blogger → 'Add to table' → tick them → 'Update' → 'Save'. Confirm: they appear under 'Your sensitive scopes' (or restricted/non-sensitive).
5. Google Auth Platform → 'Audience' → 'Test users' → '+ Add users' → type the Google account that owns the channel/blog/business → Save. Leave 'Publishing status: Testing' for now (refresh tokens then expire after 7 days).
6. Google Auth Platform → 'Clients' → '+ Create client' → Application type: 'Desktop app' → Name: 'agent-desktop' → Create. In the dialog click 'Download JSON' (file client_secret_XXXX.json containing client_id and client_secret) and keep it in your password manager. (If the agent runs on a server and gives you an https redirect URI, choose 'Web application' instead and paste that URI under 'Authorised redirect URIs'.) Note: the client secret is only fully visible at creation time.
7. Find your blog ID: open https://www.blogger.com → pick the blog in the left drop-down → the address bar shows https://www.blogger.com/blog/posts/<BLOG_ID> (digits). Copy it as BLOGGER_BLOG_ID.
8. Check your role: Blogger → Settings → Permissions → 'Blog admins and authors' must list your Google account as Admin or Author (Authors can publish their own posts).
9. Send GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (or the JSON) and BLOGGER_BLOG_ID to the agent via a secret store.
10. When the agent sends the sign-in link: sign in with the account that is admin/author of the blog → 'Advanced' → 'Go to my-posting-agent (unsafe)' → allow 'Manage your Blogger account' → Continue. Confirm: myaccount.google.com/connections lists the app.
11. Decide image hosting: the API cannot upload images. Either give the agent credentials for your own storage/CDN (public HTTPS URLs) or upload images yourself in the Blogger editor (Insert image) when reviewing drafts.
12. Optional: Google Auth Platform → Audience → 'Publish app' so the refresh token no longer expires every 7 days; then ask the agent for a fresh sign-in link.
13. Optional fallback: Blogger → Settings → 'Email' → 'Posting using email' → set a secret word (address like you.<secret>@blogger.com) → choose 'Publish email immediately' or 'Save emails as draft posts'; hand the address to the agent as BLOGGER_POST_EMAIL (unverified label).

**Hand over to the agent (store as secrets)**
- `GOOGLE_CLIENT_ID`: console.cloud.google.com → Google Auth Platform → Clients _(sensitivity: Low)_
- `GOOGLE_CLIENT_SECRET`: Downloaded client JSON (shown at creation) _(sensitivity: High)_
- `GOOGLE_REFRESH_TOKEN`: Agent obtains at first sign-in (token response) _(sensitivity: Critical — can edit/delete all posts; revoke at myaccount.google.com/connections)_
- `BLOGGER_BLOG_ID`: blogger.com address bar: /blog/posts/<BLOG_ID> _(sensitivity: Public)_
- `MEDIA_HOST_CREDENTIALS`: Your storage/CDN provider console (optional) _(sensitivity: High)_
- `BLOGGER_POST_EMAIL`: Blogger → Settings → Email → Posting using email (optional fallback) _(sensitivity: High — anyone with it can post)_

**Agent does**
1. Auth: GET https://accounts.google.com/o/oauth2/v2/auth?client_id=…&redirect_uri=http://127.0.0.1:<port>&response_type=code&scope=https://www.googleapis.com/auth/blogger&access_type=offline&prompt=consent&code_challenge=<S256>&code_challenge_method=S256&state=<rand> (can be combined with YouTube/Business Profile scopes in one consent).
2. Token: POST https://oauth2.googleapis.com/token (application/x-www-form-urlencoded) grant_type=authorization_code&code=…&client_id=…&client_secret=…&redirect_uri=…&code_verifier=… → keep refresh_token, access_token (~1 h). Refresh before each job with grant_type=refresh_token; on invalid_grant ask for re-sign-in.
3. Images: upload each image to the public host first; build HTML like <p>…</p><img src="https://cdn.example.com/2026/10/pic.jpg" alt="…"/>.
4. Create draft: POST https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts?isDraft=true with Authorization: Bearer <token>, Content-Type: application/json, body {"kind":"blogger#post","title":"Post title","content":"<p>Hello</p>","labels":["news"]} → keep id, url, status ('DRAFT').
5. Publish now: POST https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts/{postId}/publish (no body) → status 'LIVE', url. Schedule: POST …/posts/{postId}/publish?publishDate=2026-10-10T08:00:00Z → status 'SCHEDULED' (Blogger publishes at that time).
6. Update/revert: PATCH https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts/{postId} with changed fields; POST …/posts/{postId}/revert returns a post to draft. Static pages: POST https://www.googleapis.com/blogger/v3/blogs/{blogId}/pages with {"title":…,"content":…}.
7. Rate limits: default ~10,000 requests/day per project and ~100 requests/100 s per user (check Cloud console → APIs & Services → Blogger API → Quotas). On 403 rateLimitExceeded/userRateLimitExceeded or 429/5xx back off exponentially (1,2,4,8 s + jitter).
8. Idempotency: store a local mapping slug→postId; before creating, GET https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts/search?q=<exact title>&fetchBodies=false (or posts?status=draft,scheduled) and update the existing post instead of inserting a duplicate.

**Test:** GET https://www.googleapis.com/blogger/v3/users/self/blogs with Authorization: Bearer <token> → 200 {"kind":"blogger#blogList","items":[{"id":"<BLOG_ID>","name":"<blog name>","url":"https://<blog>.blogspot.com/"}]}. Then POST …/blogs/{blogId}/posts?isDraft=true with {"title":"API test","content":"<p>test</p>"} → {"id":"…","status":"DRAFT"}; delete with DELETE …/posts/{postId} (204).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 403 'We're sorry, but you don't have permission to access this resource' | Signed-in account is not admin/author of that blog, or wrong blogId | Check Settings → Permissions; re-run users/self/blogs and use the listed id |
| 400 invalid_grant on refresh | Testing-mode 7-day expiry or access revoked | Re-consent; publish the app to production |
| Images missing in published post | img src points to a private/expiring URL (e.g. unshared Drive file) | Use a stable public HTTPS URL or upload via the Blogger editor |
| Scheduled post published immediately | publishDate in the past or missing timezone | Send an RFC 3339 UTC time in the future (…Z) |
| 403 rateLimitExceeded | Per-user 100 req/100 s or daily quota | Back off and batch; request quota increase in Cloud console |

**Notes:** Testing-mode tokens expire after 7 days. Blogger API has no media upload. One Google project + one consent can cover YouTube, Blogger and Business Profile scopes. HTML is sanitised by Blogger (scripts may be stripped). Email posting puts the email body into a post; attachments become images (unverified).

**Alternative:** 1) Email-to-Blogger: Settings → Email → 'Posting using email' secret address; the agent sends an email with subject = title, HTML body = post. 2) Choose 'Save emails as draft posts' to review first. 3) Or use Blogger's own scheduler: in the post editor → Published on → set date/time → Publish. 4) Or Zapier/Make Blogger actions (unverified).

## Tumblr
_Route: `official_api_own_account`_ · Docs: https://www.tumblr.com/docs/en/api/v2

**Before you start**
- A Tumblr account owning the target blog (primary or secondary blog).
- A registered Tumblr OAuth application (free, instant, no review documented for personal use); must follow the Application Developer and API License Agreement.
- No cost.

**Human does**
1. 1. Log into https://www.tumblr.com with the account that owns the blog. Note the blog name (the part before .tumblr.com, or shown in https://www.tumblr.com/blog/<name>).
2. 2. Open https://www.tumblr.com/oauth/apps and click 'Register application' (first time: '+ Register application').
3. 3. Fill: Application Name (e.g. 'My Poster'); Application Website (your site or https://<blog>.tumblr.com); Application Description ('Posts my own content to my blog'); Administrative contact email (yours); Default callback URL (e.g. http://localhost:8765/callback); OAuth2 redirect URLs (the agent's exact redirect, e.g. http://localhost:8765/callback). Tick the captcha/terms and click 'Register'.
4. 4. On the app list, copy 'OAuth Consumer Key' (= OAuth2 client_id) and click 'Show secret key' to copy the 'Secret Key' (= client_secret) into your password manager.
5. 5. Give the agent TUMBLR_CLIENT_ID, TUMBLR_CLIENT_SECRET, TUMBLR_REDIRECT_URI and TUMBLR_BLOG.
6. 6. Open the authorization link the agent sends (https://www.tumblr.com/oauth2/authorize?...), check it requests basic, write and offline access, click 'Allow'. Confirm: agent lists your blogs from /v2/user/info.
7. 7. Approve one test post (agent can create it as state 'draft' first): check https://www.tumblr.com/blog/<blog>/drafts, then publish or delete it.
8. 8. Check the queue at https://www.tumblr.com/blog/<blog>/queue to see agent-scheduled posts; you can edit or delete them there.
9. 9. Revoke later: Tumblr Settings > Apps (https://www.tumblr.com/settings/apps; label may differ) > remove the app.

**Hand over to the agent (store as secrets)**
- `TUMBLR_CLIENT_ID`: https://www.tumblr.com/oauth/apps > OAuth Consumer Key _(sensitivity: low-medium)_
- `TUMBLR_CLIENT_SECRET`: Same page > Secret Key ('Show secret key') _(sensitivity: high)_
- `TUMBLR_REDIRECT_URI`: The OAuth2 redirect URL registered on the app _(sensitivity: low)_
- `TUMBLR_REFRESH_TOKEN`: Produced by the agent after you click 'Allow' (needs offline_access) _(sensitivity: high)_
- `TUMBLR_BLOG`: Blog name, e.g. myblog (or myblog.tumblr.com) _(sensitivity: low)_

**Agent does**
1. 1. Authorize: https://www.tumblr.com/oauth2/authorize?client_id={id}&response_type=code&scope=basic%20write%20offline_access&state={rand}&redirect_uri={urlencoded uri}. Validate state.
2. 2. Token: POST https://api.tumblr.com/v2/oauth2/token, Content-Type: application/x-www-form-urlencoded, body grant_type=authorization_code&code={code}&client_id={id}&client_secret={secret}&redirect_uri={uri}. Keep access_token, expires_in (short-lived, docs example 2520 s), refresh_token.
3. 3. Identity: GET https://api.tumblr.com/v2/user/info, Authorization: Bearer {token} -> response.user.name and response.user.blogs[].name/uuid; confirm TUMBLR_BLOG is in the list.
4. 4. Text/link post (NPF): POST https://api.tumblr.com/v2/blog/{blog}/posts, Bearer, Content-Type: application/json; body {"content":[{"type":"text","text":"Hello"},{"type":"link","url":"https://example.com"}],"tags":"tag1,tag2","state":"published"}. 201 -> keep response.id (string).
5. 5. Media post: same URL as multipart/form-data: part name 'json' (Content-Type application/json) = {"content":[{"type":"image","media":[{"type":"image/jpeg","identifier":"img1"}],"alt_text":"..."}],"state":"published"}, plus a file part named 'img1' with the JPEG bytes. Video: {"type":"video","media":{"type":"video/mp4","identifier":"vid1"}} with part 'vid1' (max 500 MB, 10 min; 20 videos and 60 min of video per user per day).
6. 6. Schedule natively: same call with "state":"queue","publish_on":"2026-10-10T15:00:00Z" (publish_on is ignored unless state is queue). Drafts: state 'draft'; private: state 'private'.
7. 7. Refresh: before expires_in elapses or on 401: POST https://api.tumblr.com/v2/oauth2/token body grant_type=refresh_token&refresh_token={rt}&client_id={id}&client_secret={secret}; store any new refresh_token returned.
8. 8. Limits: 250 published posts/day per user (incl. reblogs), 250 image uploads/day, 20 video uploads/day; per consumer key 1,000 calls/hour and 5,000/day; per IP 300/min. Errors: 403.8023 daily posting limit, 403.8022 queue full, 403.8004 daily media quota, 403.8011 daily video limit, 400.8001 bad NPF JSON. On 429 back off exponentially.
9. 9. Idempotency: store the returned post id per queue item; before retrying a timed-out create, GET https://api.tumblr.com/v2/blog/{blog}/posts/queue (and /posts?limit=5) to check whether it exists. Use a unique slug per item to make duplicates visible.
10. 10. Edit/delete: PUT https://api.tumblr.com/v2/blog/{blog}/posts/{id} (NPF edit) or POST https://api.tumblr.com/v2/blog/{blog}/post/delete {"id":"..."}.

**Test:** GET https://api.tumblr.com/v2/user/info with 'Authorization: Bearer {token}' -> 200 {"meta":{"status":200,"msg":"OK"},"response":{"user":{"name":"...","blogs":[{"name":"myblog",...}]}}} (no post created).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401 Unauthorized after ~40 minutes | Short-lived OAuth2 access token expired | Refresh with the refresh token (requires offline_access scope at authorization) |
| 400 with subcode 8001 | Malformed NPF JSON or multipart part names not matching identifiers | Validate content blocks; ensure file part name equals media identifier and 'json' part is first |
| 403.8022 'queue limit has been reached' | Blog queue is full | Publish or delete queued posts, or hold items locally and enqueue later |
| 403.8023 daily posting limit | 250 posts/day per user reached | Wait until the next day; spread posts |
| Post published immediately instead of scheduled | publish_on sent without state 'queue' | Send state:'queue' together with publish_on in ISO 8601 |

**Notes:** Free; no app review for personal use. API supports real scheduling (state queue + publish_on), so no agent-side cron is strictly needed. Queue size limit exists (error 8022) but its number is not stated in API docs (commonly cited 300; unverified). Legacy OAuth1 tokens can be exchanged at /v2/oauth2/exchange. Ayrshare no longer lists Tumblr.

**Alternative:** (1) Tumblr's own queue: in the web composer click the arrow next to 'Post now' > 'Schedule' or 'Add to queue', and set queue times in https://www.tumblr.com/blog/<blog>/queue settings. (2) IFTTT applet 'Webhooks -> Tumblr: Create a text/photo post': agent sends POST https://maker.ifttt.com/trigger/{event}/with/key/{IFTTT_KEY} {"value1":"title","value2":"body","value3":"image url"}. (3) Zapier 'Webhooks by Zapier (Catch Hook) -> Tumblr: Create Text/Photo Post'.

## WordPress (.com and self-hosted)
_Route: `official_api_own_account`_ · Docs: https://developer.wordpress.com/docs/api/

**Before you start**
- SELF-HOSTED: WordPress 5.6+ (Application Passwords are in core since 5.6), site served over HTTPS (Application Passwords are disabled on plain HTTP unless WP_ENVIRONMENT_TYPE is 'local'), a user with Author role or higher (Editor/Administrator to publish pages or others' posts). Free; no API fees.
- Host must pass the Authorization header to PHP and must not block /wp-json/ (some security plugins such as Wordfence/Solid Security, or WAFs, can disable the REST API or Application Passwords).
- For reliable scheduled publishing: a real server cron hitting wp-cron.php (WP-Cron only fires on page visits).
- WORDPRESS.COM (any plan incl. Free) or a Jetpack-connected site: a WordPress.com account that is Administrator/Editor/Author on the site; a registered app at https://developer.wordpress.com/apps (free) with a redirect URL you control.
- No approval or review is needed for posting to your own site on either variant.

**Human does**
1. SELF-HOSTED 1 - Check HTTPS and REST: open https://YOURSITE/wp-json/ in a browser. Confirm: you see JSON starting with {"name":...,"namespaces":[..."wp/v2"...]}. If you get 404, go to wp-admin -> Settings -> Permalinks -> choose 'Post name' -> Save Changes (or the agent will use https://YOURSITE/?rest_route=/wp/v2/...). If you get a plugin error page, see step 4.
2. SELF-HOSTED 2 - Log in at https://YOURSITE/wp-admin with the account that should be the post author (Author role or higher). Recommended: create a dedicated user: Users -> Add New User -> Username 'posting-agent', Email, Role 'Author' (or 'Editor' if it must publish pages/edit others' posts) -> Add New User, then log in as that user.
3. SELF-HOSTED 3 - Users -> Profile (top-right avatar -> Edit Profile) -> scroll to 'Application Passwords' -> in 'New Application Password Name' type 'posting-agent' -> click 'Add New Application Password'. Copy the 24-character password shown in the green box (shown ONCE; spaces are optional) into your password manager. Also note the exact login Username (shown greyed out at the top of the Profile page - not the display name). Confirm: the password now appears in the list with 'Last Used: -'.
4. SELF-HOSTED 4 - If the 'Application Passwords' section is missing: the site is not HTTPS, or a security plugin disabled it (e.g. Wordfence -> All Options -> 'Disable WordPress application passwords' must be unticked; Solid Security -> Settings -> Advanced -> REST API set to 'Default Access') (label may differ). On Apache/CGI hosts that strip the Authorization header add to .htaccess above the WordPress block: SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
5. SELF-HOSTED 5 - Test from your computer (Terminal): curl -u 'USERNAME:APP PASSWORD' https://YOURSITE/wp-json/wp/v2/users/me?context=edit . Confirm: JSON with your id, 'roles' and 'capabilities'. A 401 'rest_not_logged_in' means the header is stripped (step 4).
6. SELF-HOSTED 6 - Scheduling reliability (optional but recommended): in wp-config.php add define('DISABLE_WP_CRON', true); and in your host's cron panel (cPanel -> Cron Jobs) add every 5 minutes: wget -q -O - https://YOURSITE/wp-cron.php?doing_wp_cron >/dev/null 2>&1. Confirm via a test scheduled post that it publishes on time.
7. SELF-HOSTED 7 - Note the IDs of categories you want: Posts -> Categories -> hover a category -> the edit link shows tag_ID=NN (or let the agent look them up). Hand over WP_SITE_URL, WP_USERNAME, WP_APP_PASSWORD through a password manager share.
8. WORDPRESS.COM 1 - Go to https://developer.wordpress.com/apps (log in with the WordPress.com account) -> 'Create New Application'. Fill: Name 'posting-agent', Description, Website URL (your site), Redirect URLs 'http://localhost:8080/callback' (or the agent's HTTPS callback), Javascript Origins blank, Type 'Web' -> answer the captcha -> Create.
9. WORDPRESS.COM 2 - On the app page, copy 'Client ID' and 'Client Secret' (Manage Settings / OAuth Information section) (label may differ) to the password manager.
10. WORDPRESS.COM 3 - Open in a browser: https://public-api.wordpress.com/oauth2/authorize?client_id=CLIENT_ID&redirect_uri=http://localhost:8080/callback&response_type=code&blog=YOURSITE.wordpress.com (omit &blog= and add &scope=global to grant all your sites). Click 'Approve'. The browser goes to localhost:8080/callback?code=XXXX - copy the code value (valid for a short time) and give it to the agent immediately, or let the agent run a local listener to catch it.
11. WORDPRESS.COM 4 - Confirm: https://wordpress.com/me/security/connected-applications lists 'posting-agent'. To revoke later, click Disconnect there.

**Hand over to the agent (store as secrets)**
- `WP_SITE_URL`: Your site address, e.g. https://example.com (Settings -> General -> Site Address). _(sensitivity: low)_
- `WP_USERNAME`: wp-admin -> Users -> Profile -> 'Username' (login name, not display name). _(sensitivity: low)_
- `WP_APP_PASSWORD`: wp-admin -> Users -> Profile -> Application Passwords -> shown once after 'Add New Application Password'. _(sensitivity: high - full API access as that user; revoke individually in the same screen)_
- `WPCOM_CLIENT_ID`: https://developer.wordpress.com/apps -> your app. _(sensitivity: low)_
- `WPCOM_CLIENT_SECRET`: https://developer.wordpress.com/apps -> your app -> Client Secret. _(sensitivity: high)_
- `WPCOM_REDIRECT_URI`: Exactly the Redirect URL saved in the app. _(sensitivity: low)_
- `WPCOM_SITE`: Site domain (example.wordpress.com or custom domain) or numeric blog ID (returned in the token response as blog_id). _(sensitivity: low)_
- `WPCOM_ACCESS_TOKEN`: Returned by the agent's code exchange (or hand over the one-time code instead). _(sensitivity: high - long-lived bearer token)_

**Agent does**
1. Self-hosted auth: every request sends 'Authorization: Basic ' + base64(WP_USERNAME + ':' + WP_APP_PASSWORD). Base URL {WP_SITE_URL}/wp-json/wp/v2/ (fallback {WP_SITE_URL}/?rest_route=/wp/v2/ when pretty permalinks are off). No token refresh: application passwords last until revoked.
2. WordPress.com auth: POST https://public-api.wordpress.com/oauth2/token, Content-Type: application/x-www-form-urlencoded, body client_id=..&client_secret=..&redirect_uri=..&code=CODE&grant_type=authorization_code -> keep access_token, blog_id, blog_url. No refresh token: authorization-code tokens are long-lived; on 401/403 'invalid_token' ask the human to redo the authorize link. Then send 'Authorization: Bearer TOKEN' to https://public-api.wordpress.com/wp/v2/sites/{WPCOM_SITE}/... (same routes and bodies as self-hosted).
3. Upload media: POST {base}/media with raw bytes as body; headers Content-Type: image/jpeg (real MIME), Content-Disposition: attachment; filename="cover.jpg". Response: keep id (MEDIA_ID) and source_url. Then POST {base}/media/{MEDIA_ID} JSON {"alt_text":"...","caption":"..."}. Max size = PHP upload_max_filesize on self-hosted / plan limit on WordPress.com.
4. Taxonomy: GET {base}/categories?search=News&per_page=100 -> id; GET {base}/tags?search=foo -> id or POST {base}/tags {"name":"foo"} -> id (400 'term_exists' returns the existing term_id in data).
5. Create post: POST {base}/posts, Content-Type: application/json, body {"title":"Hello","content":"<!-- wp:paragraph --><p>Body</p><!-- /wp:paragraph -->","excerpt":"...","status":"publish","featured_media":MEDIA_ID,"categories":[3],"tags":[7],"slug":"hello"} -> keep id, link, status. Plain HTML in content also works (it becomes a Classic block). Pages: POST {base}/pages.
6. Schedule: same body with "status":"future","date_gmt":"2026-10-10T08:00:00" (UTC; 'date' is site-local time). Response status should be 'future'. Self-hosted publishing then depends on WP-Cron; after the due time GET {base}/posts/{id}?context=edit and if still 'future' (missed schedule) POST {base}/posts/{id} {"status":"publish"}.
7. Idempotency: before creating, GET {base}/posts?slug=hello&status=publish,future,draft&context=edit (needs edit rights) - if a post with the planned slug exists, update it (POST {base}/posts/{id}) instead of creating a duplicate. Store the returned id per content item.
8. Update/delete: POST {base}/posts/{id} with changed fields; DELETE {base}/posts/{id} moves to trash, ?force=true deletes permanently.
9. WordPress.com legacy alternative: POST https://public-api.wordpress.com/rest/v1.1/sites/{SITE}/media/new multipart media[]=@file -> media[0].ID; POST https://public-api.wordpress.com/rest/v1.1/sites/{SITE}/posts/new {"title":..,"content":..,"status":"future","date":"2026-10-10T08:00:00+00:00","featured_image":ID,"categories":"News","tags":"a,b"}.
10. Rate limits/backoff: core WordPress has no rate limit (host/WAF may throttle); WordPress.com limits are unpublished. Keep to <=2 requests/s, per_page max 100; on 429/503 wait 2^n seconds (max ~5 min) and honour Retry-After; on 5xx during a create, check by slug before retrying.

**Test:** GET {WP_SITE_URL}/wp-json/wp/v2/users/me?context=edit with header Authorization: Basic base64(user:app_password) -> 200 {"id":2,"username":"posting-agent","roles":["author"],"capabilities":{...}} (no content changed). WordPress.com: GET https://public-api.wordpress.com/rest/v1.1/me with Authorization: Bearer TOKEN -> 200 {"ID":...,"username":...,"primary_blog":...}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401 rest_not_logged_in on /users/me | Authorization header stripped by Apache/CGI/proxy, or wrong username (display name used) | Add the SetEnvIf line to .htaccess; use the login username; retest with curl -u. |
| 401 incorrect_password / 'application_passwords_disabled' | Password typo, revoked, site not HTTPS, or a security plugin disabled Application Passwords | Regenerate the app password; enable HTTPS; re-enable Application Passwords in the plugin. |
| 403 rest_cannot_create / rest_cannot_publish | User role too low (Contributor) or trying to create pages as Author | Raise role to Author/Editor or post as 'pending' for review. |
| Scheduled post shows 'Missed schedule' | WP-Cron did not run because no traffic at the due time | Set a real server cron for wp-cron.php or have the agent flip status to publish after the due time. |
| WordPress.com 403 'unauthorized' for a site | Token was issued for a different blog (single-site scope) | Re-authorize with &blog=THE_SITE or scope=global. |

**Notes:** Application passwords cannot log into wp-admin and are revocable one by one. 'date' is site-local, 'date_gmt' is UTC - prefer date_gmt. Content may be HTML or block markup. WordPress.com implicit-grant tokens last 2 weeks; authorization-code tokens are long-lived with no refresh token. Jetpack Social (paid tiers) can auto-share published posts to other networks. Uploads are public as soon as they are in the Media Library even if the post is a draft.

**Alternative:** 1) Zapier/Make/n8n WordPress module: connect with the same site URL + username + application password (WordPress.com: OAuth in the app). 2) Build a 'webhook in -> WordPress: Create Post' flow with status=future. 3) Or email-to-post with Jetpack 'Post by Email' (Jetpack -> Settings -> Writing -> Post by email -> generate address) for text-only posts. 4) Native: block editor -> Publish panel -> 'Immediately' -> pick date -> Schedule.

## Ghost
_Route: `official_api_own_account`_ · Docs: https://docs.ghost.org/admin-api

**Before you start**
- A Ghost 5.x/6.x site: self-hosted (free software; you pay your own server) or Ghost(Pro). Ghost(Pro) Starter (about $18/mo billed yearly, 1,000 members, 5 MB upload limit) does NOT allow custom integrations; you need Publisher (from about $29/mo yearly) or Business (from about $199/mo) - prices from third-party 2026 summaries (unverified exact figures).
- Owner or Administrator staff role in Ghost Admin (only they can create integrations).
- Agent runtime able to sign an HS256 JWT (any language JWT library, or the official @tryghost/admin-api Node client). Server clock within a few seconds of real time.
- No API fees and no review/approval.

**Human does**
1. Open https://YOURSITE/ghost/ (Ghost(Pro) default: https://YOURSITE.ghost.io/ghost/) and sign in as the Owner or an Administrator. Confirm: you see the Ghost Admin dashboard.
2. Ghost(Pro) only: check your plan at Settings (gear icon, bottom-left) -> General/Billing -> 'Manage' (opens ghost.org account) (label may differ). If it says Starter, click 'Upgrade' and pick Publisher, otherwise custom integrations are unavailable.
3. Settings (gear icon) -> scroll to 'Advanced' -> 'Integrations' -> 'Custom' tab -> click 'Add custom integration'. Name: 'Posting agent' -> 'Add'. Confirm: an integration page opens showing 'Content API key', 'Admin API key' and 'API URL'.
4. Click 'Copy' next to 'Admin API key' (format 24-hex-char id, a colon, then 64-hex-char secret) and paste into your password manager as GHOST_ADMIN_API_KEY. Click 'Copy' next to 'API URL' (e.g. https://yoursite.ghost.io) as GHOST_API_URL. Then click 'Save'.
5. Optional: in the same integration page add a webhook (Add webhook -> Event 'Post published' -> Target URL of the agent) if the agent should be notified when a scheduled post goes live.
6. Newsletters (only if posts should also be emailed): Settings -> 'Newsletters' (under Email/Membership) -> click the newsletter -> note its slug (the 'default-newsletter' style identifier; if not shown, the agent can list it via the API) (label may differ). Make sure email sending is set up (Ghost(Pro) built-in; self-hosted needs Mailgun configured).
7. Optional author: Settings -> Staff -> invite a staff user 'Posting agent' with role Author/Editor if posts should show a specific author; note its email (the agent sets authors by email).
8. Hand over GHOST_API_URL, GHOST_ADMIN_API_KEY and optional GHOST_NEWSLETTER_SLUG via a password-manager share. To revoke later: Settings -> Integrations -> Posting agent -> 'Regenerate' Admin API key or delete the integration.

**Hand over to the agent (store as secrets)**
- `GHOST_API_URL`: Settings -> Advanced -> Integrations -> Posting agent -> API URL. _(sensitivity: low)_
- `GHOST_ADMIN_API_KEY`: Same page -> Admin API key (id:secret). _(sensitivity: high - full admin access to content, members and settings)_
- `GHOST_NEWSLETTER_SLUG`: Settings -> Newsletters -> newsletter slug (optional). _(sensitivity: low)_

**Agent does**
1. Token (per batch, no refresh needed): split GHOST_ADMIN_API_KEY on ':' into id and secret; hex-decode secret into bytes. JWT header {"alg":"HS256","typ":"JWT","kid":id}; payload {"iat":now,"exp":now+300,"aud":"/admin/"}; sign HS256 with the decoded bytes. Tokens must expire within 5 minutes; mint a new one for each batch.
2. Headers on every call: Authorization: Ghost <jwt>; Accept-Version: v5.0 (use the site's major version, e.g. v6.0 on Ghost 6); base {GHOST_API_URL}/ghost/api/admin/.
3. Upload image: POST {base}images/upload/ multipart/form-data: file=@cover.jpg, purpose=image, ref=cover.jpg -> keep images[0].url. Video/audio: POST {base}media/upload/ (file, optional thumbnail); other files: POST {base}files/upload/.
4. Create draft from HTML: POST {base}posts/?source=html, Content-Type: application/json, body {"posts":[{"title":"Hello","html":"<p>Body</p>","feature_image":"IMAGE_URL","custom_excerpt":"...","tags":[{"name":"News"}],"authors":["agent@example.com"],"status":"draft"}]} -> keep posts[0].id, posts[0].updated_at, posts[0].url. Without ?source=html you must send 'lexical' JSON.
5. Publish now: PUT {base}posts/{id}/ {"posts":[{"status":"published","updated_at":"<value from last read>"}]}. Schedule: {"status":"scheduled","published_at":"2026-10-10T08:00:00.000Z","updated_at":...} (future UTC); Ghost publishes it itself at that time.
6. Email to newsletter: add query ?newsletter=GHOST_NEWSLETTER_SLUG&email_segment=all (or status:free / status:-free) on the PUT that sets status published/scheduled. Emails cannot be resent or recalled - only send once, deliberately.
7. Edits: always GET {base}posts/{id}/ first and send its updated_at in the PUT (collision detection; mismatch returns 409 UpdateCollisionError). Pages: same under {base}pages/.
8. Idempotency: give each item a unique slug; before creating, GET {base}posts/slug/{slug}/ (404 = not yet created) and update instead of re-creating.
9. Limits/backoff: no published quota; Ghost(Pro) applies rate limiting - on 429 back off exponentially (2, 4, 8 ... s) and honour Retry-After; on 401 'INVALID_JWT'/'Token expired' mint a new JWT and retry once.

**Test:** GET {GHOST_API_URL}/ghost/api/admin/site/ with Accept-Version: v5.0 (no auth) -> 200 {"site":{"title":...,"version":"5.x"}}; then GET {GHOST_API_URL}/ghost/api/admin/posts/?limit=1&fields=id,title,status with Authorization: Ghost <jwt> -> 200 {"posts":[...],"meta":{...}} confirms the key (nothing created).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401 'Invalid token' / INVALID_JWT | Secret not hex-decoded before signing, wrong kid, or aud not '/admin/' | Hex-decode the part after ':'; kid = part before ':'; aud '/admin/'. |
| 401 'Token expired' / iat in the future | exp more than 5 min after iat, or clock skew | Use exp = iat + 300; sync server clock (NTP). |
| Post body is empty after create | Sent html without ?source=html | Add ?source=html or send lexical. |
| 409 UpdateCollisionError on PUT | updated_at missing or stale | GET the post, copy updated_at, retry. |
| No 'Add custom integration' button | Ghost(Pro) Starter plan or non-admin role | Upgrade to Publisher or sign in as Owner/Administrator. |

**Notes:** Admin key = full admin rights; keep server-side. Newsletter emails are irreversible. Upload size depends on plan (Starter 5 MB). Scheduled posts are published by Ghost itself (no cron needed). Official JS client @tryghost/admin-api handles JWT and uploads.

**Alternative:** 1) Zapier/Make Ghost app: connect with API URL + Admin API key; action 'Create Post' (status scheduled + published_at). 2) n8n 'Ghost' node (Admin API credential) after a Webhook node. 3) Native: Ghost editor -> Publish -> 'Right now' dropdown -> 'Schedule for later' -> date/time -> choose 'Publish and email' or 'Publish only'.

## Discord
_Route: `official_api_own_account`_ · Docs: https://docs.discord.com/developers/resources/webhook

**Before you start**
- A Discord account and a server where you have 'Manage Webhooks' (server owner/admins have it).
- A text, announcement, forum or media channel to post into.
- No review, no cost; webhooks are free.
- Upload size follows the server's boost level: 10 MB on non-boosted servers per the reviewed docs; Aug 2026 news reports the free limit raised to 20 MB (unverified); Level 2 boost 50 MB, Level 3 100 MB (search-snippet).

**Human does**
1. 1. Open Discord desktop or https://discord.com/app and go to your server.
2. 2. Hover the target channel in the left sidebar and click the gear icon (Edit Channel). On mobile: long-press the channel -> Edit Channel.
3. 3. Click Integrations -> Webhooks -> New Webhook (first time: Create Webhook).
4. 4. Click the new webhook (default name like 'Captain Hook') to expand it. Set Name (shown as the author of posts, e.g. 'My Posts') and upload an avatar image.
5. 5. Check the CHANNEL dropdown points to the right channel. Click Save Changes at the bottom bar.
6. 6. Click Copy Webhook URL. It looks like https://discord.com/api/webhooks/<id>/<token>. Paste it into your password manager as DISCORD_WEBHOOK_URL.
7. 7. Forum/media channel: open the thread to post into, right-click it -> Copy Link / Copy ID (needs Settings -> Advanced -> Developer Mode ON) and hand over the thread id, or let the agent create a new thread per post.
8. 8. Hand the URL to the agent via your secret store - never paste it in a public channel (anyone with it can post).
9. 9. Confirm: the agent sends a test message; you should see it in the channel as the webhook's name with a 'BOT'/'APP' tag; the agent deletes it.
10. 10. To rotate or revoke: same Integrations -> Webhooks screen -> the webhook -> Delete Webhook (URL dies instantly); create a new one and hand over the new URL.

**Hand over to the agent (store as secrets)**
- `DISCORD_WEBHOOK_URL`: Server -> channel gear -> Integrations -> Webhooks -> webhook -> Copy Webhook URL _(sensitivity: High - anyone with it can post and edit/delete this webhook's messages)_
- `DISCORD_THREAD_ID (optional)`: Developer Mode on -> right-click the forum thread -> Copy ID _(sensitivity: Low - identifier only)_

**Agent does**
1. 1. Auth is the token embedded in the URL - no headers needed beyond Content-Type. Never log the full URL.
2. 2. Text: POST $DISCORD_WEBHOOK_URL?wait=true, Content-Type: application/json, body {"content":"Hello (<=2000 chars)","username":"optional override","avatar_url":"https://...","allowed_mentions":{"parse":[]}} -> with wait=true you get 200 + Message object; keep id and channel_id (without wait you get 204 No Content).
3. 3. Files: POST $DISCORD_WEBHOOK_URL?wait=true multipart/form-data with parts files[0]=@image.png, files[1]=@clip.mp4 and payload_json='{"content":"caption","attachments":[{"id":0,"description":"alt text"},{"id":1}]}'. Reference in an embed with "image":{"url":"attachment://image.png"}.
4. 4. Embeds: "embeds":[{"title":"...","description":"...","url":"https://...","color":5814783,"image":{"url":"https://..."}}] (up to 10).
5. 5. Poll: {"poll":{"question":{"text":"Which?"},"answers":[{"poll_media":{"text":"A"}},{"poll_media":{"text":"B"}}],"duration":24}} (duration in hours).
6. 6. Forum/media channel: required either ?thread_id=<id> (post into existing thread; auto-unarchived) or body "thread_name":"New topic" (creates thread), optional "applied_tags":["<tag id>"].
7. 7. Silent post: "flags":4096 (SUPPRESS_NOTIFICATIONS); hide link previews: flags 4 (SUPPRESS_EMBEDS).
8. 8. Edit: PATCH $DISCORD_WEBHOOK_URL/messages/<message_id> {"content":"fixed"}; delete: DELETE $DISCORD_WEBHOOK_URL/messages/<message_id> (add ?thread_id= for thread messages).
9. 9. Scheduling: none in the API - queue jobs agent-side (cron) with an idempotency key; store the returned message id so a retry after a timeout is checked (GET $DISCORD_WEBHOOK_URL/messages/<id>) before resending.
10. 10. Rate limits: read X-RateLimit-Remaining / X-RateLimit-Reset-After / X-RateLimit-Bucket; on 429 sleep retry_after (seconds, JSON body) and retry; X-RateLimit-Scope tells user/global/shared. Keep around <=30 messages/min per channel (observed).
11. 11. Token refresh: none - webhook URLs do not expire; 401/404 'Unknown Webhook' means it was deleted -> ask the human for a new URL.

**Test:** curl -s "$DISCORD_WEBHOOK_URL" (GET, posts nothing) -> 200 {"type":1,"id":"...","name":"My Posts","channel_id":"...","guild_id":"..."}. Optional: curl -X POST "$DISCORD_WEBHOOK_URL?wait=true" -H 'Content-Type: application/json' -d '{"content":"test","allowed_mentions":{"parse":[]},"flags":4096}' -> 200 with id; then curl -X DELETE "$DISCORD_WEBHOOK_URL/messages/<id>" -> 204.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 404 {"message":"Unknown Webhook","code":10015} (wording may differ) | Webhook deleted or URL mistyped | Create a new webhook and hand over the new URL |
| 400 'Webhooks posted to forum channels must have a thread_name or thread_id' (wording may differ) | Target is a forum/media channel | Add ?thread_id= or thread_name in the body |
| 413 Request Entity Too Large / 40005 | File above the server's upload limit | Compress or link to the file instead |
| 429 with retry_after | Per-webhook or global rate limit | Sleep retry_after seconds; serialize posts |
| 204 but message never appears | Sent without wait=true and the message was rejected silently | Always use ?wait=true to get errors |

**Notes:** Treat the webhook URL as a password. Posts appear as the webhook's name/avatar, not as the person. Set allowed_mentions {parse:[]} to avoid accidental @everyone pings. Discord has no native message scheduling (only Scheduled Events). Non-application webhooks cannot send interactive components. Announcement channels: webhook posts are not auto-published to following servers (unverified).

**Alternative:** Bot user: 1) https://discord.com/developers/applications -> New Application -> Bot -> Reset Token -> copy. 2) OAuth2 -> URL Generator -> scope bot + permission Send Messages/Attach Files -> open the URL and add to the server. 3) POST https://discord.com/api/v10/channels/<channel_id>/messages with 'Authorization: Bot <token>' and the same body. Schedulers: n8n Discord node, Postiz, Zapier.

## Reddit
_Route: `scheduler_or_automation_tool`_ · Docs: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki

**Before you start**
- A Reddit account with some history (new/low-karma accounts are often auto-filtered) and a verified email.
- Tool route (recommended): an account on Postiz (cloud from ~$29/mo, unverified; or free self-hosted) or Postpone (postpone.app, paid tiers, unverified pricing) that supports Reddit.
- Official route: Data API access must be requested and approved under the Responsible Builder Policy (self-service closed Nov 2025; ~7-day target turnaround, many personal requests reported denied). Free for non-commercial use within 100 queries/min; commercial use needs a paid agreement.
- Knowledge of each target subreddit's rules (flair requirements, self-promotion limits, posting windows).

**Human does**
1. 1. Tool route: sign up at https://postiz.com (or https://postpone.app). In Postiz click 'Add Channel' > 'Reddit' > log in to Reddit if asked > on Reddit's 'Allow' screen click 'Allow'. Confirm: the Reddit avatar appears in the channel list.
2. 2. Postiz: Settings > Developers > Public API (label may differ) > copy the API key into your password manager; give it to the agent as POSTIZ_API_KEY.
3. 3. For each target subreddit, open https://www.reddit.com/r/<name>/about/rules (or the sidebar) and note: allowed post types (text/link/image), required flair, self-promo ratio, banned domains. Give this list to the agent.
4. 4. Do one manual test in the tool: schedule a text post to your own profile subreddit (r/u_<yourname>) 5 minutes ahead and confirm it appears at https://www.reddit.com/user/<yourname>/submitted.
5. 5. Official route (only if you want direct API): read https://support.reddithelp.com/hc/en-us/articles/42728983564564 (Responsible Builder Policy; URL unverified) then open https://support.reddithelp.com/hc/en-us/requests/new and choose the developer/Data API request type (label may differ). Describe: 'Personal script, posting my own content to subreddits I participate in, ~N posts/week, no data collection or AI training, username u/...'. Submit and wait (target ~7 days).
6. 6. After approval: go to https://www.reddit.com/prefs/apps > 'are you a developer? create an app...' (or 'create another app'). Name: e.g. myposter; select 'script'; description optional; redirect uri: http://localhost:8080 ; click 'create app'.
7. 7. Copy the client id (the string under 'personal use script' below the app name) and the 'secret' value into your password manager; hand them to the agent with the username.
8. 8. Credentials for a script app: either give the agent the account password (if 2FA is on, the agent must append ':<6-digit code>' each time, which is impractical) or ask the agent to use the 'web app' style authorization link instead and click 'Allow' once to grant a permanent refresh token (preferred).
9. 9. Check your inbox/modmail after the first posts: if a moderator removes them or an AutoModerator message appears, share it with the agent so it adjusts.
10. 10. Revoke access any time at https://www.reddit.com/prefs/apps (connected 'authorized applications' section) or delete the app.

**Hand over to the agent (store as secrets)**
- `POSTIZ_API_KEY`: Postiz > Settings > Developers > Public API (tool route) _(sensitivity: high (can post to all connected channels))_
- `REDDIT_CLIENT_ID`: reddit.com/prefs/apps > your app > string under the app name (official route, after approval) _(sensitivity: medium)_
- `REDDIT_CLIENT_SECRET`: reddit.com/prefs/apps > your app > 'secret' _(sensitivity: high)_
- `REDDIT_REFRESH_TOKEN`: Produced by the agent after you click 'Allow' on the authorize link with duration=permanent _(sensitivity: high)_
- `REDDIT_USERNAME`: Your username without u/ (used in User-Agent and checks) _(sensitivity: low)_
- `REDDIT_PASSWORD`: Only for the script password grant; avoid if possible (2FA breaks it) _(sensitivity: very high)_

**Agent does**
1. 1. Tool route - find channel: GET https://api.postiz.com/public/v1/integrations with header 'Authorization: {POSTIZ_API_KEY}' -> keep the id of the item whose providerIdentifier is 'reddit'.
2. 2. Tool route - media (image posts): POST https://api.postiz.com/public/v1/upload as multipart/form-data with field file=<image> (or POST /upload-from-url {"url":"https://..."}) -> keep id and path.
3. 3. Tool route - schedule: POST https://api.postiz.com/public/v1/posts, headers Authorization: {key}, Content-Type: application/json; body {"type":"schedule","date":"2026-10-10T15:00:00.000Z","shortLink":false,"tags":[],"posts":[{"integration":{"id":"<reddit-id>"},"value":[{"content":"Body markdown","image":[]}],"settings":{"__type":"reddit","subreddit":[{"value":{"subreddit":"test","title":"My title","type":"self","url":"","is_flair_required":false,"flair":null}}]}}]}. type 'link' needs url; 'image' uses the uploaded image; flair {"id":"<template id>","name":"Discussion"} when required. Keep the returned post/group id. Rate limit ~100 create-post requests/hour (cloud).
4. 4. Official route - authorize (preferred, no password): send user to https://www.reddit.com/api/v1/authorize?client_id={id}&response_type=code&state={rand}&redirect_uri=http://localhost:8080&duration=permanent&scope=identity%20submit%20flair. Exchange: POST https://www.reddit.com/api/v1/access_token with HTTP Basic client_id:secret, User-Agent, body grant_type=authorization_code&code={code}&redirect_uri=http://localhost:8080 -> access_token (expires_in 3600), refresh_token. Script alternative: same endpoint, body grant_type=password&username={u}&password={p}.
5. 5. Every API call goes to https://oauth.reddit.com with headers Authorization: Bearer {token} and a unique User-Agent 'script:myposter:v1.0 (by /u/{username})' (generic agents are heavily throttled).
6. 6. Pre-checks: GET https://oauth.reddit.com/api/v1/me (identity); GET https://oauth.reddit.com/r/{sr}/about/rules; GET https://oauth.reddit.com/r/{sr}/api/link_flair_v2 to get flair template ids when flair is required.
7. 7. Submit: POST https://oauth.reddit.com/api/submit, Content-Type: application/x-www-form-urlencoded, body api_type=json&sr={sr}&kind=self&title={title}&text={markdown}&flair_id={id}&sendreplies=true (link: kind=link&url=...&resubmit=false). Keep json.data.url, json.data.name (t3_...). json.errors non-empty = failure (e.g. RATELIMIT with 'try again in N minutes', SUBMIT_VALIDATION_FLAIR_REQUIRED). Native image posts use the undocumented /api/media/asset.json upload lease then kind=image&url=<uploaded url> (unverified; prefer tool route or link posts).
8. 8. Refresh: before expiry or on 401, POST https://www.reddit.com/api/v1/access_token (Basic auth) body grant_type=refresh_token&refresh_token={rt}. Refresh token is long-lived (permanent until revoked).
9. 9. Scheduling: Reddit API has no publish-at; hold items in a local queue and submit at due time (or use the tool's 'schedule' type). Space posts to different subreddits by >= 10 minutes to avoid spam filters.
10. 10. Limits/backoff: 100 queries/min per OAuth client id averaged over 10 minutes; read X-Ratelimit-Remaining / X-Ratelimit-Reset headers. On RATELIMIT errors wait the stated minutes; never retry more than 3 times.
11. 11. Idempotency: record the returned t3_ id; before retrying a timed-out submit, GET https://oauth.reddit.com/user/{username}/submitted?limit=5 and compare titles. Use resubmit=false for link posts to avoid duplicate URL submissions.

**Test:** Tool route: GET https://api.postiz.com/public/v1/integrations with 'Authorization: <key>' -> 200 array including an object with providerIdentifier 'reddit' and disabled false. Official route: GET https://oauth.reddit.com/api/v1/me with Bearer token and User-Agent -> 200 {"name":"yourname",...}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401/403 on any oauth.reddit.com call right after creating an app | App not approved under the Responsible Builder Policy (new apps get no access) | Use the tool route; or wait for/request approval via the support ticket |
| json.errors [['RATELIMIT', 'you are doing that too much. try again in 9 minutes']] | Account-level posting throttle (low karma / new account) | Wait the stated time; post less frequently; build karma |
| Post submitted but invisible to others / removed | Spam filter, AutoModerator rule or missing flair | Check https://www.reddit.com/r/<sr>/about/rules, add flair, message the moderators; avoid link-only posts from new accounts |
| SUBMIT_VALIDATION_FLAIR_REQUIRED | Subreddit requires flair | Fetch link_flair_v2 and send flair_id (tool: is_flair_required true + flair object) |
| 429 or very slow responses | Generic or missing User-Agent, or > 100 QPM | Set a unique descriptive User-Agent; respect X-Ratelimit headers |
| invalid_grant on password grant | Account has 2FA or wrong password | Use the authorize/refresh-token flow instead |

**Notes:** Biggest gate is API approval (closed self-service since Nov 2025). Native scheduling exists only for moderators (mod tools > Scheduled posts). Buffer/Hootsuite do not support Reddit posting. Commercial use needs a paid agreement. Respect each subreddit's self-promotion norms; automated cross-posting of the same content to many subreddits is treated as spam.

**Alternative:** Official Data API after approval: (1) file the request at https://support.reddithelp.com/hc/en-us/requests/new; (2) create a 'script' app at https://www.reddit.com/prefs/apps; (3) agent authorizes with duration=permanent scopes identity submit flair and posts via POST https://oauth.reddit.com/api/submit at due times. Fallback when neither is available: agent prepares title/body/flair per subreddit and you post manually in the app.

## Lemmy
_Route: `official_api_own_account`_ · Docs: https://join-lemmy.org/api/main

**Before you start**
- An account on a Lemmy server (many servers require email verification and/or an application approved by admins - can take hours to days).
- Communities whose rules allow your (automated) posts.
- Free; no API keys - username/password login.

**Human does**
1. 1. Sign up/sign in at your Lemmy server (e.g. https://lemmy.world) - ideally a dedicated posting account. Answer the registration application if the server asks and wait for approval email.
2. 2. Verify your email via the link the server sends, if required.
3. 3. Settings (avatar menu -> Settings) -> tick 'Bot Account' if posts are automated (many servers require it) -> Save.
4. 4. 2FA: if enabled on this account, the agent needs a TOTP code at each login; for unattended use keep 2FA off on the dedicated account or be ready to give codes.
5. 5. For each target community open it and read the sidebar rules; note its full name (e.g. technology@lemmy.world).
6. 6. If the community is on another server, search it once from your home server (Search -> paste !technology@lemmy.world) and Subscribe so your server knows it.
7. 7. Store LEMMY_INSTANCE_URL, LEMMY_USERNAME, LEMMY_PASSWORD in your password manager and hand them to the agent.
8. 8. Confirm: the agent logs in and reports your username from /api/v3/site.
9. 9. To revoke: change your password (invalidates JWTs) or the agent calls logout.

**Hand over to the agent (store as secrets)**
- `LEMMY_INSTANCE_URL`: Your home server address _(sensitivity: Low)_
- `LEMMY_USERNAME`: Your username _(sensitivity: Low)_
- `LEMMY_PASSWORD`: Your password (dedicated account) _(sensitivity: Critical - full account control)_
- `LEMMY_COMMUNITIES`: List like technology@lemmy.world _(sensitivity: Low)_

**Agent does**
1. 1. GET $LEMMY_INSTANCE_URL/api/v3/site -> version (0.19.x uses /api/v3; Lemmy 1.0 uses /api/v4 with v3 still accepted).
2. 2. Login: POST /api/v3/user/login, Content-Type: application/json, {"username_or_email":"$LEMMY_USERNAME","password":"$LEMMY_PASSWORD","totp_2fa_token":"123456"(only if 2FA)} -> {jwt}. Send Authorization: Bearer <jwt> afterwards. Token refresh: JWT stays valid until logout/password change - reuse it; re-login on 401.
3. 3. Resolve community: GET /api/v3/community?name=technology@lemmy.world -> community_view.community.id (or GET /api/v3/resolve_object?q=!technology@lemmy.world).
4. 4. Image: POST /pictrs/image multipart field images[]=@photo.jpg with Authorization: Bearer <jwt> -> {msg:'ok', files:[{file, delete_token}]}; URL = $LEMMY_INSTANCE_URL/pictrs/image/<file>.
5. 5. Post: POST /api/v3/post {"name":"Title (<=200 chars)","community_id":123,"url":"https://... or image URL","body":"markdown text","alt_text":"...","nsfw":false,"language_id":37} -> post_view.post.id and ap_id (URL).
6. 6. Comment: POST /api/v3/comment {"content":"...","post_id":456,"parent_id":optional}.
7. 7. Scheduling: 0.19 - agent-side queue. Lemmy 1.0 (API v4, rc phase as of 2026) adds a scheduled publish time on create post (field name unverified), max 10 pending per user.
8. 8. Idempotency: before retrying, GET /api/v3/user?username=<me>&sort=New&limit=5 and compare titles/URLs; delete duplicates with POST /api/v3/post/delete {post_id, deleted:true}.
9. 9. Rate limits: default 6 posts/10 min, images and comments have their own buckets (server-configurable, see GET /api/v3/site local_site_rate_limit). On 429 / 'rate_limit_error' wait 10 min.
10. 10. Logout to invalidate: POST /api/v3/user/logout.

**Test:** curl -s -H "Authorization: Bearer $JWT" $LEMMY_INSTANCE_URL/api/v3/site -> my_user.local_user_view.person.name equals your username (no post).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 400 'incorrect_login' / 'email_not_verified' / 'registration_application_pending' (wording may differ) | Credentials, unverified email, or pending approval | Fix password, verify email, wait for admin approval |
| 400 'missing_totp_token' (wording may differ) | 2FA enabled | Supply totp_2fa_token or disable 2FA on the dedicated account |
| 'couldnt_find_community' (wording may differ) | Remote community not yet known to your server | resolve_object or search/subscribe from your server first |
| 'rate_limit_error' (wording may differ) | Too many posts/images | Wait and space posts >=2 min apart |
| Post removed by mods | Community rules ban bots or self-promotion | Read rules; post only where allowed |

**Notes:** Password login only in 0.19 (no OAuth/app tokens). Communities on other servers are posted to through your home server. Check community rules - many ban automated posting. Error strings shown are API error codes (wording may vary by version).

**Alternative:** 1) Lemmy Schedule (https://schedule.lemmings.world): log in with your instance + credentials, compose, pick time. 2) Or Postiz/Poster.ly if they list Lemmy (unverified current support). 3) Or post manually in the web UI.

## Binance Square
_Route: `official_api_own_account`_ · Docs: https://github.com/binance/binance-skills-hub (skills/binance/square-post)

**Before you start**
- A Binance account in good standing at https://www.binance.com (identity verification/KYC is likely required to post on Square (unverified)); no posting restrictions on the account/device.
- Access to Binance Square Creator Center: https://www.binance.com/square/creator-center/home.
- Free: no paid plan for the Square OpenAPI key (no cost documented).
- Agent runtime: Node.js 18+ to run the official scripts; ffmpeg (video cover extraction) and ffprobe (video duration) for video posts; outbound HTTPS to www.binance.com and the presigned upload host.
- Binance 2FA (authenticator app or passkey) enabled — Binance requires it for sensitive actions (unverified for key creation).

**Human does**
1. 1. Sign in at https://www.binance.com (or the Binance app) with your own account. Confirm: account dashboard loads.
2. 2. If not done: Profile → Security → enable Authenticator App / Passkey; complete identity verification under Profile → Identification (wait minutes to days).
3. 3. Open Square once (web: https://www.binance.com/square; app: 'Square' tab) and set up your Square profile (nickname, avatar) if prompted; accept the Square terms.
4. 4. Go to https://www.binance.com/square/creator-center/home (Square → your avatar → Creator Center).
5. 5. Find the OpenAPI / API Key section (label may differ) → 'Create' / 'Generate API Key' → complete any 2FA prompt.
6. 6. Copy the key immediately (it is shown masked afterwards) into your password manager under 'Binance Square OpenAPI key'.
7. 7. Hand it to the agent as environment variable BINANCE_SQUARE_OPENAPI_KEY, or let the agent save it to ~/.config/binance-square/openapi-key (file mode 600) — never paste it into a command line or chat log.
8. 8. Approve the test: the agent publishes one short text post; open the returned link https://www.binance.com/square/post/<id> and confirm it is visible; delete it in the app if you want.
9. 9. When the agent reports error 220004 'API key expired' (or 220003 not found), return to Creator Center, regenerate the key and update the env/file.
10. 10. Optional: in Creator Center review content guidelines; posts with sensitive words (20002/20022) are rejected.

**Hand over to the agent (store as secrets)**
- `BINANCE_SQUARE_OPENAPI_KEY`: https://www.binance.com/square/creator-center/home → OpenAPI / API Key section (shown once) _(sensitivity: high — can publish as you; it is NOT a trading API key, keep it separate from Binance exchange API keys)_

**Agent does**
1. 1. Resolve the key from env BINANCE_SQUARE_OPENAPI_KEY, else ~/.config/binance-square/openapi-key. Never pass it as a CLI argument; when shown, mask as first 5 + last 4 chars. Preferred: run the official scripts from github.com/binance/binance-skills-hub/skills/binance/square-post (node scripts/post-text.mjs --text "…"; post-image.mjs; post-video.mjs).
2. 2. Text post / article without media: POST https://www.binance.com/bapi/composite/v1/public/pgc/openApi/content/add with headers 'X-Square-OpenAPI-Key: <key>', 'Content-Type: application/json', 'clienttype: binanceSkill'; body {"contentType":1,"bodyTextOnly":"Hello #crypto $BTC"} (article: {"contentType":2,"bodyTextOnly":"…","title":"Market Report"}). Success = JSON code "000000"; keep data.id and data.shareLink (or build https://www.binance.com/square/post/<id>).
3. 3. Image upload (per image, max 4): POST https://www.binance.com/bapi/composite/v2/public/pgc/openApi/image/presignedUrl body {"imageName":"chart1.png"} → keep data.presignedUrl, data.fileTicket; then PUT <presignedUrl> with header 'Content-Type: image/png' and the raw file bytes; then poll POST https://www.binance.com/bapi/composite/v2/public/pgc/openApi/image/imageStatus body {"fileTicket":"…"} every 3 s (max 10 tries) until data.status==1 → keep data.imageUrl (status 2 = failed, see failedReason).
4. 4. Image post: POST https://www.binance.com/bapi/composite/v1/public/pgc/openApi/content/add body {"contentType":1,"bodyTextOnly":"Chart analysis","imageList":["<imageUrl1>","<imageUrl2>"]}. Article with cover: {"contentType":2,"bodyTextOnly":"…","title":"…","cover":"<imageUrl>"} (exactly one cover, no imageList).
5. 5. Video post: POST https://www.binance.com/bapi/composite/v2/public/pgc/openApi/video/preSign body {"fileName":"video.mp4","size":<bytes>} → presignedUrl, fileTicket; PUT the file (Content-Type video/mp4); poll /image/imageStatus with the fileTicket until status 1; extract first frame (ffmpeg -i video.mp4 -frames:v 1 -q:v 2 cover.png), upload it as in step 3; then POST https://www.binance.com/bapi/composite/v1/public/pgc/openApi/content/add body {"contentType":3,"fileTicket":"…","cover":"<coverUrl>","videoTimeSeconds":7.5,"isPublish":true,"bodyTextOnly":"My analysis"} (duration from ffprobe). Images and video cannot be mixed; max 1 video.
6. 6. Scheduling: the API has no scheduling or drafts — the agent keeps its own queue (cron/at job at publish_at) and calls content/add at that moment.
7. 7. Token lifecycle: there is no OAuth/refresh; the key works until it expires or is regenerated. On 220003/220004 stop and ask the human to regenerate the key in Creator Center.
8. 8. Limits/backoff: 100 posts/day and 400 uploads/day per key (220009 / 220014 → stop until next day, do not retry). On HTTP 5xx/network errors retry uploads with backoff (5 s, 15 s, 45 s).
9. 9. Idempotency: if content/add returns HTTP 504 the post was probably submitted without an id — treat as success, do NOT resend; check the profile before any retry. Log slug → id/shareLink.
10. 10. Content rules: preserve the user's text exactly ($coin and #topic are parsed server-side); only attach media the user provided; handle 20002/20022 (sensitive words), 20013 (too long), 20020/220011 (empty body), 30008/2000001/2000002 (account/device restriction → tell the human).

**Test:** curl -sS -X POST 'https://www.binance.com/bapi/composite/v1/public/pgc/openApi/content/add' -H "X-Square-OpenAPI-Key: $BINANCE_SQUARE_OPENAPI_KEY" -H 'Content-Type: application/json' -H 'clienttype: binanceSkill' -d '{"contentType":1,"bodyTextOnly":"Test post"}' → expect {"code":"000000","data":{"id":…,"shareLink":…}} (note: this publishes a real public post; delete afterwards in the app).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| code 220003 / 220004 | Key not found / expired | Regenerate in Creator Center and update BINANCE_SQUARE_OPENAPI_KEY. |
| code 220009 or 220014 | Daily post (100) or upload (400) limit reached | Queue the rest for the next day. |
| code 20002 / 20022 | Sensitive words detected | Ask the human to rephrase; do not auto-edit their text. |
| HTTP 504 on content/add | Gateway timeout after submission | Treat as published without id; verify on profile; do not resend. |
| Image poll times out / status 2 | Processing failed or slow | Re-upload once with a smaller JPG/PNG; check failedReason. |
| code 30008 / 2000001 / 2000002 | Account or device posting restriction | Human checks account status/verification in the Binance app; posting via API is blocked until lifted. |

**Notes:** Official Binance-published skill (binance-skills-hub, square-post v2.0.0); free. Create-only: no reading, editing, deleting, scheduling or drafts via this API. Limits 100 posts/day, 400 uploads/day; max 4 images; article = exactly 1 cover; images and video mutually exclusive. Crypto content may be subject to Binance content rules and local regulations.

**Alternative:** Manual: (1) open the Binance app → Square tab → '+' (compose); (2) paste text, add up to 4 images or one video; (3) Post; (4) copy the post link back to the agent. Or run the official scripts in a Siri Shortcut 'Run Script over SSH' on a host that holds the key.

## Farcaster
_Route: `official_api_own_account`_ · Docs: https://docs.neynar.com/docs/integrate-managed-signers

**Before you start**
- A Farcaster account (Farcaster app, formerly Warpcast). Account creation may cost a small yearly storage fee (unverified current price).
- A Neynar developer account at https://dev.neynar.com - Free 'Beginner' plan 200K compute units incl. cast write; Starter $9/mo 1M CU; Growth $49/mo 10M CU (search-snippet).
- A computer with Node.js/yarn for the one-time signer creation (or a Sign In With Neynar flow).
- Image/video hosting with public URLs (casts embed by URL).

**Human does**
1. 1. Install the Farcaster app and make sure you can log in to the account you want to post from.
2. 2. Go to https://dev.neynar.com, sign up, and create an App (Apps -> New app; label may differ). Copy the API key into your password manager as NEYNAR_API_KEY. Choose a plan if you need more than the free credits.
3. 3. On your own computer: git clone https://github.com/neynarxyz/farcaster-examples && cd farcaster-examples/managed-signers.
4. 4. Create .env.local with NEYNAR_API_KEY=<key> and FARCASTER_DEVELOPER_MNEMONIC=<recovery phrase of the account whose FID signs the request> (Farcaster app -> Settings -> Advanced -> Show recovery phrase; label may differ). This stays on your machine only.
5. 5. Run yarn install && yarn dev, open http://localhost:3000 and click Sign in.
6. 6. A QR code / link appears. Scan it with your phone or open it in the Farcaster app and approve the connection (one onchain approval; no cost to you for typical cases (unverified)).
7. 7. The page shows the signer_uuid once approved. Copy it into your password manager as NEYNAR_SIGNER_UUID.
8. 8. Delete FARCASTER_DEVELOPER_MNEMONIC from .env.local (and the clone if not needed).
9. 9. Hand only NEYNAR_API_KEY and NEYNAR_SIGNER_UUID to the agent.
10. 10. Confirm: the agent GETs the signer and reports status 'approved' with your fid.
11. 11. To revoke later: Farcaster app -> Settings -> Advanced / Connected apps -> remove the app's key (label may differ); also rotate the Neynar key in the dev portal.

**Hand over to the agent (store as secrets)**
- `NEYNAR_API_KEY`: dev.neynar.com -> your app -> API key _(sensitivity: High - billable; read/write through Neynar)_
- `NEYNAR_SIGNER_UUID`: Output of the managed-signers demo after approval _(sensitivity: High - can cast/like/follow as the account until revoked)_

**Agent does**
1. 1. All calls to https://api.neynar.com with headers x-api-key: $NEYNAR_API_KEY, Content-Type: application/json. No token refresh - signer and key live until revoked.
2. 2. Check signer: GET https://api.neynar.com/v2/farcaster/signer?signer_uuid=$NEYNAR_SIGNER_UUID -> status must be 'approved'; keep fid.
3. 3. (If the agent itself creates the signer: POST /v2/farcaster/signer -> {signer_uuid, public_key}; the human's machine signs a key request and POST /v2/farcaster/signer/signed_key {signer_uuid, app_fid, deadline, signature} -> signer_approval_url for the human; poll GET signer until approved.)
4. 4. Media: upload images/video to your own hosting/CDN first; get public https URLs (casts carry no blobs).
5. 5. Cast: POST https://api.neynar.com/v2/farcaster/cast {"signer_uuid":"$NEYNAR_SIGNER_UUID","text":"Hello (<=320 bytes; more for Pro)","embeds":[{"url":"https://cdn.example.com/a.jpg"}],"channel_id":"dev","idem":"<16-char unique key per queue item>"} -> {success:true, cast:{hash, author:{fid}}}. Max 2 embeds.
6. 6. Reply/quote: add "parent":"0x<cast hash>" (reply) or embed {"cast_id":{"fid":..., "hash":"0x..."}} (quote; embed format unverified).
7. 7. Thread: post first cast, then each next with parent = previous hash.
8. 8. Scheduling: none - agent-side queue; the idem key prevents duplicates on retry.
9. 9. Delete: DELETE https://api.neynar.com/v2/farcaster/cast {"signer_uuid":"...","target_hash":"0x..."}.
10. 10. Limits: compute units per plan and per-endpoint rate limits; on 429 back off exponentially.

**Test:** curl -s -H "x-api-key: $NEYNAR_API_KEY" "https://api.neynar.com/v2/farcaster/signer?signer_uuid=$NEYNAR_SIGNER_UUID" -> {signer_uuid, status:'approved', fid, public_key} (no cast).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Signer status 'pending_approval' (wording may differ) | Human did not approve in the Farcaster app | Re-open signer_approval_url and approve |
| 401/403 from Neynar | Wrong API key or plan lacks the endpoint | Check key in dev portal; upgrade plan |
| 400 text too long | Over 320 bytes (emoji count multiple bytes) | Shorten or split into a thread |
| Image not shown | URL not public or not an image content-type | Host on a public CDN with correct Content-Type |
| 429 / compute units exhausted | Plan credits used | Wait for reset or upgrade |

**Notes:** Never give the agent the Farcaster recovery phrase. A signer can post, like, follow as the account until revoked. Casts 320 bytes (Pro longer), 2 embeds. Neynar plan figures from search snippets of neynar.com/pricing.

**Alternative:** 1) Postiz: Add channel -> Farcaster -> approve via Neynar. 2) Schedule there. 3) Or post manually in the Farcaster app.

## Lens
_Route: `official_api_own_account`_ · Docs: https://lens.xyz/docs/protocol

**Before you start**
- A Lens v3 account (created in a Lens app such as Hey or Orb) and access to its owner wallet.
- Node.js environment for the agent (@lens-protocol/client, @lens-protocol/metadata, @lens-chain/storage-client, viem).
- An App address to authenticate through (a public app's address or your own registered Lens App); gas sponsorship depends on that App - otherwise the manager wallet needs GHO on Lens Chain for gas.
- Optional Server API key from the Lens developer dashboard to lift rate limits (unverified).

**Human does**
1. 1. Make sure you can sign in to your Lens account in a Lens app (e.g. Hey at https://hey.xyz) with your owner wallet.
2. 2. Ask the agent to generate a NEW wallet for itself; it shows you only the public address (0x...). Never send it your owner wallet key or seed.
3. 3. In the Lens app open Settings -> Managers / Account managers (label may differ) -> Add manager.
4. 4. Paste the agent's address. Permissions: allow executing transactions (posting) only; leave token transfers and native transfers OFF; metadata URI change optional.
5. 5. Confirm and sign the transaction with your owner wallet; wait for confirmation (seconds to a minute) - the manager appears in the list.
6. 6. Copy your Lens account address (Settings / profile -> account address, 0x...) as LENS_ACCOUNT_ADDRESS.
7. 7. Give the agent the App address to log in through (LENS_APP_ADDRESS) - from the app's docs or your own app on the Lens developer dashboard (unverified location).
8. 8. If the App does not sponsor gas, send a small amount of GHO on Lens Chain to the manager address (unverified amounts).
9. 9. Confirm: the agent logs in as manager and reports your account; a test post appears in Hey.
10. 10. To revoke: Settings -> Managers -> Remove the agent's address (sign with owner wallet).

**Hand over to the agent (store as secrets)**
- `LENS_ACCOUNT_ADDRESS`: Your Lens account address in the Lens app _(sensitivity: Low)_
- `LENS_APP_ADDRESS`: The App you authenticate through _(sensitivity: Low)_
- `LENS_MANAGER_PRIVATE_KEY`: Generated by the agent; never leaves the agent's secret store _(sensitivity: High - can post as the account until removed; no transfer rights if denied)_

**Agent does**
1. 1. Setup: PublicClient.create({environment: mainnet}) from @lens-protocol/client (GraphQL https://api.lens.xyz/graphql); signer = viem privateKeyToAccount(LENS_MANAGER_PRIVATE_KEY).
2. 2. Login: client.login({accountManager:{app: LENS_APP_ADDRESS, account: LENS_ACCOUNT_ADDRESS, manager: signer.address}, signMessage: (m)=>signer.signMessage({message:m})}) - under the hood GraphQL mutation challenge -> sign -> authenticate -> accessToken, refreshToken, idToken (JWT RS256). Persist with the SDK storage option.
3. 3. Token refresh: resume with client.resumeSession(); the SDK refreshes the access token using the refresh token automatically; on failure re-login (lifetimes reported as ~10 min access / ~7 days refresh - unverified).
4. 4. Media: upload image/video with @lens-chain/storage-client (Grove): storageClient.uploadFile(file, {acl: immutable(232)}) -> uri 'lens://...'.
5. 5. Metadata: build with @lens-protocol/metadata, e.g. textOnly({content}) or image({content, image:{item: uri, type: MediaImageMimeType.JPEG, altTag}}) or video({...}); upload the JSON with storageClient.uploadAsJson(metadata) -> contentUri.
6. 6. Post: post(sessionClient, {contentUri}).andThen(handleOperationWith(walletClient)).andThen(sessionClient.waitForTransaction) -> tx hash; then fetchPost({txHash}) to get the post id. If the result is SelfFundedTransactionRequest, the manager wallet pays gas in GHO.
7. 7. Scheduling: none confirmed - agent-side queue.
8. 8. Idempotency: store tx hash per queue item; on retry first call fetchPost({txHash}) to see if it landed.
9. 9. Rate limits: API limits apply without a Server API key (numbers unverified); back off exponentially on 429.

**Test:** fetchAccount(client, {address: LENS_ACCOUNT_ADDRESS}) -> account with username/metadata (public, no post); after login, currentSession(sessionClient) -> session showing your account and the manager signer.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Login fails: signer not a manager | Manager not added or tx not confirmed | Re-check Settings -> Managers in the Lens app |
| SelfFundedTransactionRequest and tx fails for gas | App does not sponsor; manager has no GHO | Fund the manager with GHO or use a sponsoring App |
| Unauthenticated after some time | Access/refresh token expired | resumeSession or re-login |
| Old v2 guides (profiles, Polygon) don't work (wording may differ) | Lens migrated to v3 on Lens Chain | Use v3 SDK and account addresses |

**Notes:** Do not take the owner wallet key. Lens v3 on Lens Chain (2025); v2 handles/profile ids no longer apply. Token lifetimes and limits not re-verified (lens.xyz blocked from this environment).

**Alternative:** 1) Post manually in Hey or Orb. 2) No confirmed third-party scheduler; an n8n Code node running the SDK calls on a schedule is possible (unverified).

## Nostr
_Route: `official_api_own_account`_ · Docs: https://github.com/nostr-protocol/nips

**Before you start**
- A Nostr identity (keypair: nsec private / npub public) - free.
- A NIP-46 remote signer you control that stays online at posting time: nsec.app (web, tab must be open or push-enabled), Amber (Android phone), or nsecBunker on your own always-on server.
- A list of write relays (3-5) and optionally a Blossom media server; some relays/Blossom servers are paid (prices vary).

**Human does**
1. 1. Keep your nsec only in a signer you control; never paste it into the agent or a scheduler.
2. 2. Choose a signer: https://nsec.app (web) or Amber (Android, from GitHub/Zapstore) or nsecBunker on a server. Import your existing nsec or create a new key there.
3. 3. In the signer create a new connection: nsec.app -> your key -> Connect app -> 'Share bunker URL' / 'Connect with token' (labels may differ); Amber -> Applications -> Add -> bunker (label may differ).
4. 4. Name it 'posting-agent'. Restrict permissions to sign_event for kind 1 (notes), kind 24242 (Blossom upload auth) and kind 30023 only if you publish long-form. Do not grant nip04/nip44 encrypt/decrypt.
5. 5. Copy the connection string: bunker://<remote-signer-pubkey>?relay=wss://...&secret=... - the secret works for one connection only. Store as NOSTR_BUNKER_URI.
6. 6. Hand NOSTR_BUNKER_URI to the agent; when the agent connects, approve the request in the signer if prompted (choose 'always allow' for the listed kinds).
7. 7. Decide relays: copy your write relays from your usual client (e.g. Settings -> Relays) into NOSTR_RELAYS; or publish a kind 10002 relay list from that client.
8. 8. Media: pick a Blossom server (e.g. https://blossom.primal.net or one you pay for) as BLOSSOM_SERVER; optionally publish a kind 10063 server list from your client.
9. 9. Keep the signer online when posts are due (nsec.app tab open / Amber phone on network / bunker server running).
10. 10. Confirm: the agent reports your npub from get_public_key and a test note appears in your client; delete it if wanted.
11. 11. To revoke: delete the 'posting-agent' connection in the signer.

**Hand over to the agent (store as secrets)**
- `NOSTR_BUNKER_URI`: Signer app -> new connection -> bunker:// string _(sensitivity: High until used (single-use secret); the session then depends on the agent's client key)_
- `NOSTR_RELAYS`: Your client's relay settings (wss:// URLs, comma separated) _(sensitivity: Low)_
- `BLOSSOM_SERVER (optional)`: Your Blossom media host URL _(sensitivity: Low)_
- `NOSTR_CLIENT_KEY (agent-generated)`: Generated and stored by the agent; transport key only, not your identity _(sensitivity: Medium - holder can request signatures within granted perms)_

**Agent does**
1. 1. Generate a local client keypair (NIP-46 transport only) and persist it; it must stay the same across runs so the signer recognises the session.
2. 2. Connect: publish kind 24133 event, NIP-44 encrypted to the signer pubkey, p-tag = signer pubkey, on the bunker URI relays, content {"id":"<rand>","method":"connect","params":["<remote-signer-pubkey>","<secret>","sign_event:1,sign_event:24242"]}; subscribe for kind 24133 responses -> result 'ack' (or the secret). Then send get_public_key -> user pubkey, and switch_relays -> updated relay list.
3. 3. Media: sha256 the file; build kind 24242 {content:'Upload photo', tags:[['t','upload'],['x','<sha256>'],['expiration','<now+600>']]}, sign via sign_event; PUT <BLOSSOM_SERVER>/upload with Authorization: Nostr <base64(signed event JSON)>, Content-Type: image/jpeg, raw body -> blob descriptor {url, sha256, size, type}.
4. 4. Note: build kind 1 {created_at:<now>, content:'Text ... https://blossom.../<sha256>.jpg', tags:[['imeta','url https://...','m image/jpeg','x <sha256>','dim 1200x800','alt description'],['t','hashtag']]} -> send method sign_event with the unsigned event JSON -> signed event {id, sig}.
5. 5. Publish: open websockets to each write relay, send ["EVENT", <signed event>]; expect ["OK", <id>, true, ""]. Success = at least 2 relays OK.
6. 6. Long-form: kind 30023 with tags d (slug), title, published_at; content markdown.
7. 7. Scheduling: none in the protocol - queue agent-side and sign/publish at the due time (signer must be online). Do not postdate created_at.
8. 8. Idempotency: the event id is a hash of content - re-sending the same signed event is harmless; store the signed event and re-broadcast it on retry rather than re-signing.
9. 9. Limits: per-relay; treat ["OK", id, false, "rate-limited: ..."] or "restricted:" as retry later / drop that relay. No token refresh - the NIP-46 session lasts until revoked; on 'unauthorized' redo connect with a new bunker URI.

**Test:** NIP-46 request {method:'ping', params:[]} -> 'pong'; then get_public_key -> user hex pubkey (no post). Optional: publish a kind 1 'test' note -> ["OK", <id>, true, ""] from relays; retract with a kind 5 deletion event referencing the id.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| No response to connect | Signer offline or wrong relay | Open nsec.app/Amber; check relay in bunker URI |
| 'invalid secret' / connect rejected (wording may differ) | Secret already used | Create a new connection and bunker URI |
| Signer refuses sign_event | Kind not in granted permissions | Grant sign_event for that kind in the signer |
| Blossom 401 | Missing/expired kind 24242 auth or wrong x hash | Re-sign auth with correct sha256 and future expiration |
| OK false 'blocked'/'restricted' (wording may differ) | Paid or whitelist relay | Use relays that accept your pubkey or pay |

**Notes:** Never store the nsec. Deletion (kind 5) is only a request. NIP-07 browser extensions only help a browser-driving agent. NIP-96 is deprecated in favour of Blossom (NIP-B7). Some schedulers ask for the raw nsec - avoid.

**Alternative:** 1) Post manually from a client (Primal, Damus, Amethyst) signing with Amber/NIP-07. 2) Use a scheduler only if it supports NIP-46 remote signing (e.g. Postiz Nostr provider - check whether it asks for the nsec; unverified).

## Dribbble
_Route: `official_api_own_account`_ · Docs: https://developer.dribbble.com/v2/

**Before you start**
- A Dribbble account that is allowed to upload shots (historically Pro/team or invited players; per third-party reports a Pro plan is needed for API shot creation — unverified; price see https://dribbble.com/pro).
- A registered OAuth2 application (self-serve).
- Images exactly 400x300 or 800x600 px (per API docs), ≤8 MB, GIF/JPG/PNG.
- A callback URL the agent can receive (e.g. http://localhost:8080/callback).

**Human does**
1. 1. Sign in at https://dribbble.com/session/new. Confirm you can upload manually: open https://dribbble.com/uploads/new — if it lets you start a shot, your account can post.
2. 2. If not, upgrade at https://dribbble.com/pro (or join a team) and repeat step 1.
3. 3. Open https://dribbble.com/account/applications/new (Account settings → Applications → 'Register a new application').
4. 4. Fill Name = 'My shot agent', Description = 'Posts my own shots', Website URL = your site or profile URL, Callback URL = the exact redirect from the agent. Click 'Register application'.
5. 5. On the app page copy 'Client ID' → DRIBBBLE_CLIENT_ID and 'Client Secret' → DRIBBBLE_CLIENT_SECRET.
6. 6. Open the link the agent gives you: https://dribbble.com/oauth/authorize?client_id=<ID>&redirect_uri=<callback>&scope=public+upload&state=<x>. Click 'Authorize'.
7. 7. If the agent is not listening, copy the full redirected URL (contains ?code=...) and paste it to the agent.
8. 8. The agent exchanges it for a long-lived token and runs GET /v2/user; confirm it shows your name.
9. 9. Optional: if posting under a team, give the agent the team id (from GET /v2/user/teams, the agent can look it up).
10. 10. To revoke: https://dribbble.com/account/applications → Authorized applications → Revoke (label may differ).

**Hand over to the agent (store as secrets)**
- `DRIBBBLE_CLIENT_ID`: dribbble.com/account/applications → your app _(sensitivity: Low)_
- `DRIBBBLE_CLIENT_SECRET`: Same page _(sensitivity: High)_
- `DRIBBBLE_ACCESS_TOKEN`: Produced by the code exchange (long-lived, no refresh token) _(sensitivity: High — can create/delete shots)_

**Agent does**
1. 1. Token: POST https://dribbble.com/oauth/token form client_id=..&client_secret=..&code=..&redirect_uri=.. → keep access_token (long-lived; no refresh token issued). On 401 later, ask the human to re-authorize.
2. 2. Prepare image: resize/crop exactly to 800x600 (or 400x300), PNG/JPG/GIF ≤8 MB.
3. 3. Create shot: POST https://api.dribbble.com/v2/shots, Authorization: Bearer $DRIBBBLE_ACCESS_TOKEN, multipart: image=@shot.png, title='Title' (required), description='Text', tags[]=ui, tags[]=web (≤12), team_id (optional), low_profile=false, scheduled_for=<Unix timestamp, optional>. Expect 202 Accepted; keep the Location header (shot URL/id).
4. 4. Scheduling: pass scheduled_for (Unix seconds, future) on create — supported per API docs snippet; if the response ignores it (shot published immediately), fall back to the agent's own scheduler and call create at publish time.
5. 5. Poll GET https://api.dribbble.com/v2/shots/{id} (Bearer) every 10–20 s until the shot returns 200 with images populated (processing done).
6. 6. Update: PUT https://api.dribbble.com/v2/shots/{id} JSON {"title":..,"description":..,"tags":[..]}; delete: DELETE /v2/shots/{id} → 204.
7. 7. Rate limits: not confirmed (unverified; historically 60 req/min, 1,440/day). Read X-RateLimit-Remaining/Reset if present; on 429 wait until reset.
8. 8. Idempotency: before create, GET https://api.dribbble.com/v2/user/shots?per_page=10 and skip if a shot with the same title was created in the last 24 h; persist the Location id right after the 202.

**Test:** GET https://api.dribbble.com/v2/user with Authorization: Bearer <token> → 200 {"id":...,"name":"You","login":"you",...}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 403 on POST /v2/shots | Token lacks upload scope or account not permitted to upload (non-Pro) | Re-authorize with scope=public upload; check manual upload works; upgrade if needed |
| 422 image invalid | Wrong dimensions/size/format | Exactly 400x300 or 800x600, ≤8 MB, GIF/JPG/PNG |
| Shot published immediately instead of scheduled | scheduled_for ignored or not a future Unix timestamp | Send integer seconds in the future; else schedule agent-side |
| 401 | Token revoked | Re-run the authorization flow |

**Notes:** Official docs are blocked by the proxy; dimension rules and scheduled_for come from search snippets of developer.dribbble.com. Upload eligibility (Pro) is per third-party reports. Tokens are long-lived without refresh.

**Alternative:** TimeToPost (third-party scheduler that claims Dribbble support — vet it first): 1) create account, 2) connect Dribbble, 3) queue shots with times. Or manual at https://dribbble.com/uploads/new with an agent-prepared 800x600 image and caption.

## Imgur
_Route: `manual`_ · Docs: https://apidocs.imgur.com/

**Before you start**
- An Imgur account (free).
- New API application registration is closed since August 2026 — no new Client IDs. Only users who already have a registered app can use the API route.
- For the manual route: a browser or the Imgur mobile app.

**Human does**
1. 1. Sign in at https://imgur.com/signin (or the Imgur iOS/Android app).
2. 2. Web: click 'New post' (top left). App: tap the '+' / upload button.
3. 3. Drag in or choose the files the agent prepared (in the order of the agent's checklist). Wait until each thumbnail finishes processing.
4. 4. Click 'Give your post a title...' and paste the title from the agent's checklist.
5. 5. For each image click 'Add description' and paste the per-image description.
6. 6. Choose visibility: 'To Community' (public) or 'Grab link' / Hidden (link-only). For public posts confirm the community rules prompt.
7. 7. After posting, click 'Add tags' and add the tags from the checklist.
8. 8. Copy the post URL from the address bar (https://imgur.com/gallery/...) and send it to the agent for logging.
9. 9. Imgur has no native scheduler: post at the time of the agent's reminder.
10. 10. API path ONLY if you already have a registered app: open https://imgur.com/account/settings/apps, copy Client ID and Client Secret, open https://api.imgur.com/oauth2/authorize?client_id=<ID>&response_type=code, click Allow, and give the agent the code (or refresh token).
11. 11. If you have no app: optionally contact Imgur support (https://help.imgur.com) to ask about API access; otherwise stay on the manual route.

**Agent does**
1. 1. Prepare media: convert images to JPEG/PNG under the size limit (resize long edge to ≤5000 px), videos to H.264 MP4 ≤60 s; name files 01_, 02_ in post order.
2. 2. Write a title (concise, ≤ ~100 chars recommended) and per-image descriptions; write 3–5 tag suggestions; produce 2 caption variants.
3. 3. Produce a ready-to-paste checklist: file order, title, descriptions, visibility (Community vs Hidden), tags.
4. 4. Schedule a reminder to the human at the planned posting time (agent's own scheduler) with the checklist and files attached.
5. 5. Log the returned post URL; next day check the post is still up.
6. 6. Existing-app API only (if the human supplied IMGUR_CLIENT_ID/SECRET/REFRESH_TOKEN): refresh POST https://api.imgur.com/oauth2/token form refresh_token, client_id, client_secret, grant_type=refresh_token → access_token (~28 days) + refresh_token; upload POST https://api.imgur.com/3/image (Authorization: Bearer <access_token>) multipart image=<file>, type=file, title, description → data.id, data.link; group via POST https://api.imgur.com/3/album {"ids[]":[...],"title":...}; share publicly via POST https://api.imgur.com/3/gallery/image/{id} title=...&terms=1. Limits ~12,500 requests/day per client, uploads cost 10 credits; watch X-RateLimit-ClientRemaining.

**Content specs:** **images:** JPEG, PNG, GIF, APNG, TIFF, WEBP etc.; up to 20 MB per image for non-animated (unverified current figure); animated GIF up to 200 MB (unverified). · **video:** MP4/MOV/WEBM etc. up to 60 seconds and ~200 MB (unverified). · **posts:** A post = one or more images/videos with a title (up to ~255 chars, unverified) and per-image descriptions; tags added after posting; public posts appear in Community, 'Hidden' posts are link-only. · **links_hashtags:** Descriptions can contain links (may be shown as plain text); tags are chosen from Imgur's tag picker rather than #hashtags.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| No 'Register an application' option / API registration closed | Imgur closed new app registration in Aug 2026 | Use the manual route |
| Upload stuck processing | File too large or unsupported codec | Re-encode to MP4 H.264 or compress image |
| Post not visible in Community | Posted as hidden or flagged by moderation | Edit post → share to community; follow community rules |
| 429 / credits exhausted (existing app) | Daily client credit limit | Wait for reset per X-RateLimit headers |

**Notes:** Route is manual because new API apps cannot be registered (Aug 2026). Existing apps keep working; OAuth has no scopes (full account access); tokens ~28 days + refresh. Imgur has removed old anonymous/NSFW content before (2023) — do not use it as permanent storage. Anonymous Client-ID uploads are not tied to your account.

**Alternative:** If you hold an existing Imgur app: switch to official_api_own_account using step 6 of the agent steps (refresh → POST /3/image → POST /3/gallery/image/{id}). Otherwise keep the manual checklist + reminder workflow.

## Kick
_Route: `official_api_own_account`_ · Docs: https://docs.kick.com

**Before you start**
- Kick account (free) at https://kick.com
- Two-factor authentication enabled on the account (required to access developer tools)
- Agreement to Kick Developer Terms
- Streaming encoder (OBS or similar) and a computer for live streams; Kick has no video upload
- A redirect URL you control (e.g. http://localhost:8080/callback; for 127.0.0.1 hosts Kick documents a workaround) or https://docs.kick.com for testing

**Human does**
1. 1. Log in at https://kick.com. Open Settings > Security and enable Two-Factor Authentication (authenticator app). Confirm: 2FA shows as enabled.
2. 2. Open https://kick.com/settings/developer (Settings > Developer tab).
3. 3. Click 'Create App' (label may differ). Enter App name (e.g. 'My Agent'), description, and Redirect URL (e.g. http://localhost:8080/callback). Tick the scopes you need: user:read, channel:read, channel:write, chat:write (optional streamkey:read, events:subscribe).
4. 4. Save. Copy the Client ID and Client Secret into your password manager.
5. 5. Let the agent run the OAuth 2.1 PKCE flow locally: it prints an https://id.kick.com/oauth/authorize?... URL. Open it, log in, review scopes and click 'Allow'/'Authorize'.
6. 6. The browser redirects to your redirect URL with ?code=...; the agent's local listener captures it (or copy the full URL and paste it to the agent). Confirm: the agent reports it obtained access and refresh tokens.
7. 7. Store client ID, client secret and refresh token in the agent's secret store (not in chat).
8. 8. In OBS: Settings > Stream > Service 'Custom', paste the stream URL and key from Kick Creator Dashboard (or the agent can read them with streamkey:read).
9. 9. At stream time, start streaming in OBS; the agent updates title/category and posts the opening chat message.
10. 10. To revoke access later: Settings > Developer > delete the app, or ask the agent to call /oauth/revoke.

**Hand over to the agent (store as secrets)**
- `KICK_CLIENT_ID`: kick.com/settings/developer > your app _(sensitivity: low (public identifier))_
- `KICK_CLIENT_SECRET`: kick.com/settings/developer > your app _(sensitivity: high - server secret, never expose client-side)_
- `KICK_REFRESH_TOKEN`: Returned by POST https://id.kick.com/oauth/token after the authorization step _(sensitivity: high - grants channel:write/chat:write on your account)_
- `KICK_BROADCASTER_USER_ID`: GET https://api.kick.com/public/v1/users (user_id field) _(sensitivity: low)_

**Agent does**
1. 1. Authorize (PKCE): generate code_verifier (43-128 chars) and code_challenge=BASE64URL(SHA256(verifier)). Open GET https://id.kick.com/oauth/authorize?response_type=code&client_id={KICK_CLIENT_ID}&redirect_uri={REDIRECT}&scope=user:read%20channel:read%20channel:write%20chat:write&code_challenge={CHALLENGE}&code_challenge_method=S256&state={RANDOM}.
2. 2. Token exchange: POST https://id.kick.com/oauth/token, header Content-Type: application/x-www-form-urlencoded, body grant_type=authorization_code&client_id=...&client_secret=...&redirect_uri=...&code_verifier=...&code=... -> keep access_token, refresh_token, expires_in, scope.
3. 3. Identify: GET https://api.kick.com/public/v1/users with Authorization: Bearer {access_token} -> keep data[0].user_id; GET https://api.kick.com/public/v1/channels (no params, user token) -> own channel incl. stream.is_live, category, slug.
4. 4. Find category: GET https://api.kick.com/public/v2/categories?q=Just%20Chatting (v1 /public/v1/categories?q= fallback) -> keep id.
5. 5. Update stream metadata before going live: PATCH https://api.kick.com/public/v1/channels, headers Authorization: Bearer {token}, Content-Type: application/json, body {"stream_title":"Live: Q&A","category_id":15,"custom_tags":["qa"]} -> expect 204 No Content (scope channel:write).
6. 6. Post chat announcement: POST https://api.kick.com/public/v1/chat, body {"broadcaster_user_id":123456,"content":"We're live! ...","type":"user"} (type 'bot' posts as the app's bot with a badge) -> keep message_id (scope chat:write). Keep under 500 graphemes.
7. 7. Scheduling: Kick has no documented schedule/upload endpoint; the agent schedules on its side (cron at T-5 min: PATCH title/category; on livestream.status.updated webhook or polling channels stream.is_live=true: send chat message).
8. 8. Optional events: with events:subscribe, POST https://api.kick.com/public/v1/events/subscriptions to subscribe to livestream.status.updated / chat.message.sent webhooks (body fields unverified; see Events docs) and verify signatures with GET /public/v1/public-key.
9. 9. Token refresh: when a call returns 401 or before expires_in elapses, POST https://id.kick.com/oauth/token with grant_type=refresh_token&client_id=...&client_secret=...&refresh_token=...; save the NEW refresh_token returned (treat as rotating).
10. 10. Rate limits: not published (unverified); on HTTP 429 back off exponentially (1 s, 2 s, 4 s... max 60 s) and honour any Retry-After header.
11. 11. Idempotency: before PATCH compare current stream_title/category from GET channels and skip if equal; record sent chat message_ids per stream so a retry does not repost the announcement.

**Content specs:** Live streams only (RTMP via encoder); stream title, category, custom tags; VODs and clips come from streams. Chat messages up to 500 graphemes / 2,048 bytes (from a third-party integration spec, unverified).

**Test:** GET https://api.kick.com/public/v1/channels  Headers: Authorization: Bearer {access_token}  -> 200 with {"data":[{"broadcaster_user_id":...,"slug":"yourname","stream_title":"...","category":{...},"stream":{"is_live":false,...}}],"message":"OK"} (field names partly unverified).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 400 'Invalid request' at /oauth/authorize | Missing code_challenge/state or redirect_uri mismatch | Send code_challenge with S256 and state; use the exact redirect URL registered in the app |
| Developer tab not visible | 2FA not enabled | Enable 2FA in account security settings |
| 401 on API calls | Access token expired | Refresh via grant_type=refresh_token and store the new refresh token |
| 403 on PATCH channels or chat | Scope channel:write or chat:write not granted | Re-authorize with the missing scope |
| 429 Too Many Requests | Rate limit | Exponential backoff; reduce polling (e.g. 30 s) |

**Notes:** Uploads are not possible on Kick; only live streaming. OAuth 2.1 with mandatory PKCE; the client secret is also required for token exchange. Token lifetimes are returned in expires_in (exact values unverified). Verified apps get higher chat subscription limits (1,000 -> 10,000); request via developers@kick.com. You can test endpoints on docs.kick.com with redirect URL set to https://docs.kick.com.

**Alternative:** Manual: 1) open Kick Creator Dashboard (dashboard.kick.com, unverified URL); 2) edit Stream info title/category; 3) type the announcement in chat after going live.

## Twitch
_Route: `official_api_own_account`_ · Docs: https://dev.twitch.tv/docs/api/reference

**Before you start**
- Twitch account (free) at https://www.twitch.tv
- Two-factor authentication enabled (required to register apps in the developer console)
- Encoder (OBS) for live streams
- Video uploads (Video Producer) only for Affiliates/Partners (Affiliate: 50 followers, 500 broadcast minutes, 7 unique days, avg 3 viewers in 30 days); uploads are manual - Helix has no upload endpoint
- Non-recurring schedule segments via API only for Affiliates/Partners

**Human does**
1. 1. Log in at https://www.twitch.tv. Settings > Security and Privacy > enable Two-Factor Authentication. Confirm: 2FA enabled.
2. 2. Open https://dev.twitch.tv/console and log in with Twitch; accept the developer agreement if prompted.
3. 3. Click Applications > 'Register Your Application'. Name: unique (e.g. 'MyAgent-Scheduler'); OAuth Redirect URLs: http://localhost:3000 (needed even if device flow is used); Category: 'Application Integration'; Client Type: 'Public' (lets the agent use device code flow without a secret).
4. 4. Click 'Create', then 'Manage' on the app and copy the Client ID to your password manager.
5. 5. Let the agent start the device code flow; it shows a short code and the URL https://www.twitch.tv/activate. Open it, enter the code, review scopes (channel:manage:broadcast, channel:manage:schedule, clips:edit, user:write:chat) and click 'Authorize'.
6. 6. Confirm: the agent reports it received access and refresh tokens. Store the refresh token in the agent's secret store.
7. 7. Check Creator Dashboard > Settings > Channel > Schedule (label may differ) to confirm agent-created schedule segments appear.
8. 8. At stream time start OBS; the agent sets title/category beforehand.
9. 9. Uploads (Affiliate/Partner): Creator Dashboard > Content > Video Producer > 'Upload', select the agent's MP4, paste title/description/category, click Publish (or Save as private).
10. 10. Every 30 days (public client) re-run step 5 if the agent reports the refresh token expired; revoke anytime at Settings > Connections.

**Hand over to the agent (store as secrets)**
- `TWITCH_CLIENT_ID`: dev.twitch.tv/console > Applications > Manage _(sensitivity: low (public identifier))_
- `TWITCH_REFRESH_TOKEN`: Returned by POST https://id.twitch.tv/oauth2/token in the device flow _(sensitivity: high - one-time-use, rotates; public-client tokens expire after 30 days)_
- `TWITCH_BROADCASTER_ID`: GET https://api.twitch.tv/helix/users (data[0].id) _(sensitivity: low)_
- `TWITCH_CLIENT_SECRET`: Only if Client Type 'Confidential': Manage > New Secret _(sensitivity: high - optional)_

**Agent does**
1. 1. Device code: POST https://id.twitch.tv/oauth2/device, Content-Type: application/x-www-form-urlencoded, body client_id={ID}&scopes=channel:manage:broadcast channel:manage:schedule clips:edit user:write:chat -> keep device_code, user_code, verification_uri, interval, expires_in; show user_code to the human.
2. 2. Poll: POST https://id.twitch.tv/oauth2/token body client_id={ID}&scopes=...&device_code={device_code}&grant_type=urn:ietf:params:oauth:grant-type:device_code every {interval} s until 200 -> keep access_token, refresh_token, expires_in (~4 h).
3. 3. Identify: GET https://api.twitch.tv/helix/users, headers Authorization: Bearer {token}, Client-Id: {ID} -> data[0].id = broadcaster_id. Category ids: GET https://api.twitch.tv/helix/search/categories?query=Just%20Chatting -> data[].id.
4. 4. Schedule: POST https://api.twitch.tv/helix/schedule/segment?broadcaster_id={id}, Content-Type: application/json, body {"start_time":"2026-10-10T18:00:00Z","timezone":"Europe/Berlin","duration":"120","is_recurring":false,"category_id":"509658","title":"Q&A stream"} -> keep data.segments[0].id (scope channel:manage:schedule). Update with PATCH /helix/schedule/segment?broadcaster_id=&id=, delete with DELETE same.
5. 5. Before going live: PATCH https://api.twitch.tv/helix/channels?broadcaster_id={id}, body {"title":"Q&A stream","game_id":"509658","tags":["English"]} -> 204 (scope channel:manage:broadcast; title <=140 chars).
6. 6. Chat announcement: POST https://api.twitch.tv/helix/chat/messages, body {"broadcaster_id":"{id}","sender_id":"{id}","message":"We're live!"} -> data[0].message_id, is_sent (scope user:write:chat).
7. 7. Clips while live: POST https://api.twitch.tv/helix/clips?broadcaster_id={id} -> data[0].id, edit_url (scope clips:edit); fetch URL later with GET /helix/clips?id=.
8. 8. Token refresh: when expires_in elapses or on 401, POST https://id.twitch.tv/oauth2/token body grant_type=refresh_token&refresh_token={rt}&client_id={ID} (public client: no secret) -> save new access_token AND new refresh_token (old one is single-use). Validate hourly: GET https://id.twitch.tv/oauth2/validate with Authorization: OAuth {token}.
9. 9. Rate limits: bucket of 800 points/minute per user token; read Ratelimit-Limit, Ratelimit-Remaining, Ratelimit-Reset headers; on 429 sleep until Ratelimit-Reset then retry.
10. 10. Idempotency: GET https://api.twitch.tv/helix/schedule?broadcaster_id={id} before creating a segment and skip if a segment with the same start_time/title exists; store segment ids; compare channel info before PATCH.
11. 11. Agent-side scheduling for title updates/chat posts (cron at T-5 min); uploads stay manual: export MP4 H.264/AAC 1080p60 <=10 Mbps with title/description for Video Producer.

**Content specs:** Live via RTMP. Stream title max 140 chars. Uploads (manual, Affiliate/Partner): MP4/MOV/AVI/FLV, H.264 + AAC, up to 1080p60, up to ~10 Mbps; 5 simultaneous uploads, 100 per 24 h (third-party guides; file size cap unverified).

**Test:** GET https://api.twitch.tv/helix/schedule?broadcaster_id={id}  Headers: Authorization: Bearer {token}, Client-Id: {ID} -> 200 {"data":{"segments":[...],"broadcaster_id":"...","broadcaster_name":"...","vacation":null},"pagination":{}} (404 if no schedule exists yet)

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Cannot register an app in the console | 2FA not enabled | Enable 2FA in Twitch Security settings |
| 400 invalid refresh token | Public-client refresh token reused or older than 30 days | Always store the newest refresh token; re-run device flow |
| 400/403 creating a non-recurring segment | Account not Affiliate/Partner | Use is_recurring true or set the schedule manually |
| 401 Missing scope | Token lacks channel:manage:schedule etc. | Re-authorize with all needed scopes |
| 429 Too Many Requests | Point bucket exhausted | Wait until Ratelimit-Reset; reduce polling |

**Notes:** No video upload API (v5 upload removed; Helix never added it). User tokens expire ~4 h and are refreshable; public-client refresh tokens are single-use and expire 30 days after issue. Uploading highlights/past content remains manual via Video Producer.

**Alternative:** Manual: 1) Creator Dashboard > Settings > Channel > Schedule, add segments; 2) Stream Manager > Edit Stream Info for title/category; 3) Video Producer > Upload for videos.

## Nextdoor
_Route: `manual (default); official Publish API only if Nextdoor approves a partner application`_ · Docs: https://developer.nextdoor.com/docs/sharing-overview

**Before you start**
- A verified Nextdoor neighbor account (address verification) at https://nextdoor.com, or a claimed free Business Page at https://business.nextdoor.com.
- Business Pages: free Business Posts are limited (search snippets: two free posts per month); more reach is paid.
- Publish API (optional): an organization, public agency, business or news partner use case; submit the Publishing API request form; every request is reviewed by Nextdoor; approval time not published (unverified). Individual hobby use is unlikely to be approved.
- For the API route: an HTTPS callback URL you control (OAuth redirect) and public HTTPS hosting for media (API takes media URLs, not uploads).

**Human does**
1. 1. Manual, neighbor profile: open https://nextdoor.com (or the Nextdoor app) → sign in → tap '+' / 'Post' (label may differ).
2. 2. Paste the agent's text (from post.txt), tap the photo icon and add the prepared images/video, choose the audience (your neighborhood / nearby neighborhoods) and a category if asked → 'Post'. Confirm it shows at the top of your neighborhood feed.
3. 3. Manual, Business Page: https://business.nextdoor.com → log in → your Business Page → 'Content' tab → 'Create Post or Local Deal' → 'Create Post' → paste text, add photo → 'Post'. Note the free-post allowance.
4. 4. Optional Share link (no approval): the agent can give you a link like https://nextdoor.com/sharekit/?source=<your-site>&body=<URL-encoded text> — open it on your phone, review the pre-filled composer and tap 'Post'.
5. 5. API route: open https://developer.nextdoor.com → 'Applying for access' → fill the Publishing API request form (organization name, website, use case: 'publish our own organization's posts', expected volume, contact email) → submit.
6. 6. Wait for Nextdoor's review email; on approval the Partnerships team sends client_id and client_secret plus the partner docs. Store both in a password manager.
7. 7. Register/confirm your redirect URI with Nextdoor (e.g. https://<your-domain>/nextdoor/callback) as instructed in the approval email.
8. 8. Authorize your own profile: open https://www.nextdoor.com/v3/authorize/?scope=openid%20post:write%20post:read&client_id=<client_id>&redirect_uri=<urlencoded callback>&response_type=code (add state) → sign in → Allow. Copy the 'code' query parameter from the callback URL (valid only briefly).
9. 9. Hand NEXTDOOR_CLIENT_ID, NEXTDOOR_CLIENT_SECRET and the code (or let the agent run the callback) to the agent's secret store; the agent exchanges it for tokens.
10. 10. Confirm: the agent's test post returns a share_link https://nextdoor.com/p/<id>; open it and check it shows on your profile, then delete it if desired.
11. 11. Re-authorize (repeat step 8) whenever the agent reports the refresh token is invalid.

**Hand over to the agent (store as secrets)**
- `NEXTDOOR_CLIENT_ID`: Approval email from Nextdoor Partnerships after the Publishing API request _(sensitivity: medium)_
- `NEXTDOOR_CLIENT_SECRET`: Same approval email _(sensitivity: high)_
- `NEXTDOOR_REFRESH_TOKEN`: Returned by the token endpoint after the user authorizes (agent stores it) _(sensitivity: high)_
- `NEXTDOOR_ACCESS_TOKEN`: Token endpoint response; short-lived, expiry in response _(sensitivity: high)_

**Agent does**
1. Manual route 1. Draft text (keep under ~3,500 chars for ShareKit; API body_text max 8,192), local tone, no hashtag spam; prepare up to 10 photos (JPG, 1080-2048 px) — save to the shared folder with checklist.md.
2. Manual route 2. Build a ShareKit link: https://nextdoor.com/sharekit/?source=<site>&body=<urlencoded text incl. link> (body required, max 3,500 chars incl. encoding; optional hint_text, hash_tag) and send it with a reminder at the planned time; log the share_link the user returns.
3. API 1. Token exchange: POST https://auth.nextdoor.com/v3/token with header 'Authorization: Basic base64(client_id:client_secret)', 'Content-Type: application/x-www-form-urlencoded', body grant_type=authorization_code&code=<code>&redirect_uri=<callback> → keep access_token, refresh_token, expires_in (exact field names per partner docs (unverified)).
4. API 2. Refresh before expiry (e.g. when <5 min left or on 401): POST https://auth.nextdoor.com/v3/token, same Basic header, body grant_type=refresh_token&refresh_token=<token> (unverified) → store the new tokens.
5. API 3. Media: upload images/video to your own public HTTPS host (e.g. S3/R2 with public-read) and keep the URLs; Nextdoor only accepts publicly accessible media URLs (max 10 media_attachments).
6. API 4. Create post: POST <API base>/v1/create-post (path per developer.nextdoor.com/reference/create-post; base host given in partner docs (unverified)) with headers 'Authorization: Bearer <access_token>', 'Content-Type: application/json', body {"body_text":"Community cleanup this Saturday 9am at Elm Park","media_attachments":["https://cdn.example.com/cleanup.jpg"]} (requires post:write; business-profile/agency targets via extra fields per docs (unverified)). Keep share_link (https://nextdoor.com/p/<post_share_id>) and the post id.
7. API 5. Events/For Sale & Free/agency posts: use the dedicated 'Create event post', 'Create FSF post', 'Create agency post' endpoints from the reference with the same auth.
8. API 6. Scheduling: no API scheduling parameter found — the agent schedules on its side (cron/job queue at publish_at) and calls create-post then.
9. API 7. Rate limits not published (unverified): send at most 1 post/minute, back off exponentially on 429/5xx (30 s, 60 s, 120 s, max 5 tries).
10. API 8. Idempotency: store slug → share_link; never retry a create after an ambiguous timeout without first checking the profile/feed for the post.

**Test:** API route (after approval): POST <API base>/v1/create-post with 'Authorization: Bearer $NEXTDOOR_ACCESS_TOKEN' and {"body_text":"Test post – please ignore"} → expect HTTP 200 with a share_link of the form https://nextdoor.com/p/<id> (then delete the post). Manual route: none (post 'test' and confirm).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Application not answered or rejected | Nextdoor approves organizations/partners, not personal automation | Use manual posting or the ShareKit link. |
| 400 on create-post with media | Media URL not publicly reachable or not HTTPS | Host media publicly (test with curl -I without auth) and retry. |
| 401 Unauthorized | Access token expired | Refresh with refresh_token; if that fails, the human re-authorizes via /v3/authorize. |
| ShareKit opens but text missing | body not URL-encoded or over 3,500 chars | Encode with encodeURIComponent and shorten. |
| Business post option missing | Free business-post allowance used up | Wait for the next month or post from the neighbor profile. |

**Notes:** developer.nextdoor.com is blocked by the research proxy; endpoint names, scopes (openid, post:write, post:read, comment:write, publish_api), token URL https://auth.nextdoor.com/v3/token and body_text/media_attachments limits come from search snippets of the official reference. No native scheduling verified. Free Business Posts are limited (two per month per snippets). Content must be local and follow Nextdoor guidelines.

**Alternative:** Nextdoor ShareKit (Share Plugin), no approval needed: (1) agent builds https://nextdoor.com/sharekit/?source=<site>&body=<encoded text>; (2) send it via reminder/Siri Shortcut 'Open URLs'; (3) human reviews and taps Post; (4) human returns the post URL for the log.

## Google Business Profile
_Route: `official_api_own_account`_ · Docs: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/create

**Before you start**
- Verified, active Google Business Profile where your Google account is Owner or Manager.
- Google Cloud project (free).
- Approved 'Application for Basic API Access' (quota is 0 QPM until approved; review several days to weeks, often ~14 days; not guaranteed for new/unverified profiles).
- OAuth Desktop client with scope business.manage; Testing mode works for your own account (7-day refresh tokens).
- Public HTTPS hosting for post images (API takes sourceUrl).
- No paid plan; API is free.

**Human does**
1. Open https://console.cloud.google.com and sign in (any Google account with 2-Step Verification is fine; you authorize with the account that owns the channel/blog/business later). Top bar → project picker (left of the search box) → 'New project' → Project name: e.g. 'my-posting-agent' → Location: 'No organization' → Create. Wait ~30 s, then pick the project in the project picker. Confirm: the project name shows in the top bar.
2. Confirm the Business Profile is verified: open https://business.google.com (or search your business name on Google while signed in) → the merchant panel must not show 'Get verified'. Google expects an established, verified profile (commonly cited 60+ days old; unverified).
3. Note project number and ID: Cloud console → ☰ → 'IAM & Admin' → 'Settings' → copy 'Project number' and 'Project ID' (also on the Dashboard 'Project info' card).
4. Request API access: open https://developers.google.com/my-business/content/prereqs → 'Request access to the API' (GBP API contact form) → choose 'Application for Basic API Access' in the drop-down → fill Project ID, Project number, the email of an owner/manager of the profile, company name, website, use-case description ('manage posts for my own business locations') → Submit. Wait for the approval email (several days to a few weeks; often cited ~14 days). Confirm: Cloud console → APIs & Services → 'My Business Business Information API' → Quotas shows 300 QPM instead of 0.
5. Left menu (☰) → 'APIs & Services' → 'Library' → search 'My Business Account Management API', 'My Business Business Information API' and 'Google My Business API' (v4, for localPosts/media/reviews; it may only appear after approval) → open each result → click 'Enable'. Confirm: the API page now shows 'API enabled' and a 'Manage' button.
6. Left menu → 'APIs & Services' → 'OAuth consent screen' (opens 'Google Auth Platform'; label may differ) → 'Get started'. App information: App name 'my-posting-agent', User support email: pick your address → Next. Audience: 'External' → Next. Contact information: your email → Next. Tick 'I agree to the Google API Services: User Data Policy' → Continue → Create.
7. Google Auth Platform → 'Data access' → 'Add or remove scopes' → in 'Manually add scopes' paste https://www.googleapis.com/auth/business.manage → 'Add to table' → tick them → 'Update' → 'Save'. Confirm: they appear under 'Your sensitive scopes' (or restricted/non-sensitive).
8. Google Auth Platform → 'Audience' → 'Test users' → '+ Add users' → type the Google account that owns the channel/blog/business → Save. Leave 'Publishing status: Testing' for now (refresh tokens then expire after 7 days).
9. Google Auth Platform → 'Clients' → '+ Create client' → Application type: 'Desktop app' → Name: 'agent-desktop' → Create. In the dialog click 'Download JSON' (file client_secret_XXXX.json containing client_id and client_secret) and keep it in your password manager. (If the agent runs on a server and gives you an https redirect URI, choose 'Web application' instead and paste that URI under 'Authorised redirect URIs'.) Note: the client secret is only fully visible at creation time.
10. Send GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the agent via a secret store.
11. When the agent sends the sign-in link: sign in with the account that is owner/manager of the profile → 'Advanced' → 'Go to my-posting-agent (unsafe)' → allow 'See, edit, create and delete your Google business listings' → Continue.
12. Optional: Google Auth Platform → Audience → 'Publish app' to avoid weekly re-login; then re-sign-in.

**Hand over to the agent (store as secrets)**
- `GOOGLE_CLIENT_ID`: Google Auth Platform → Clients _(sensitivity: Low)_
- `GOOGLE_CLIENT_SECRET`: Downloaded client JSON _(sensitivity: High)_
- `GOOGLE_REFRESH_TOKEN`: Agent obtains at first sign-in _(sensitivity: Critical — can edit the business listing, posts, review replies)_
- `GCP_PROJECT_NUMBER`: IAM & Admin → Settings _(sensitivity: Low)_
- `GBP_ACCOUNT_ID`: Agent fetches via accounts.list (accounts/<digits>) _(sensitivity: Low)_
- `GBP_LOCATION_ID`: Agent fetches via locations.list (locations/<digits>) _(sensitivity: Low)_
- `MEDIA_HOST_CREDENTIALS`: Your storage/CDN console _(sensitivity: High)_

**Agent does**
1. Auth: GET https://accounts.google.com/o/oauth2/v2/auth?client_id=…&redirect_uri=http://127.0.0.1:<port>&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent&code_challenge=<S256>&code_challenge_method=S256 → POST https://oauth2.googleapis.com/token (grant_type=authorization_code, code_verifier) → keep refresh_token; refresh (grant_type=refresh_token) before each job (access token ~1 h).
2. Accounts: GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts with Authorization: Bearer <token> → keep accounts[].name ('accounts/123…'), type (PERSONAL/LOCATION_GROUP).
3. Locations: GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask=name,title,storefrontAddress&pageSize=100 → keep locations[].name ('locations/456…') and title.
4. Media: upload the image to a public HTTPS URL (JPG/PNG; recommended ≥720×540 px, ≤5 MB — unverified).
5. Create post: POST https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts, Content-Type: application/json, body {"languageCode":"en-US","summary":"Autumn menu is here!","topicType":"STANDARD","callToAction":{"actionType":"LEARN_MORE","url":"https://example.com/menu"},"media":[{"mediaFormat":"PHOTO","sourceUrl":"https://cdn.example.com/menu.jpg"}]} → keep name (…/localPosts/<id>), state (PROCESSING→LIVE or REJECTED), searchUrl. EVENT posts add {"event":{"title":…,"schedule":{"startDate":{…},"endDate":{…}}}}; OFFER posts add offer {couponCode, redeemOnlineUrl, termsConditions}.
6. Scheduling: no one-off future publish time in the API — the agent holds the job and sends the create call at the due time. Recurring posts (since 7 Apr 2026): add recurrenceInfo to the LocalPost body (exact sub-field names: check the LocalPost reference; unverified).
7. Other: profile photos POST …/v4/accounts/{a}/locations/{l}/media {"mediaFormat":"PHOTO","locationAssociation":{"category":"ADDITIONAL"},"sourceUrl":"…"}; review replies PUT …/v4/accounts/{a}/locations/{l}/reviews/{reviewId}/reply {"comment":"Thanks!"}.
8. Check status: GET …/localPosts/{postId} → state; LIVE means visible; REJECTED means moderation (edit text: remove phone numbers, excessive caps/links).
9. Limits: 300 QPM default after approval (per-API quotas in Cloud console); summary ≤1,500 characters. On 429 RESOURCE_EXHAUSTED back off exponentially; on 403 with quota 0 → access not approved yet.
10. Idempotency: keep a local record (location + date + hash of summary → localPost name); before re-sending after a timeout, GET …/localPosts?pageSize=10 and compare summaries.

**Test:** GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts with Authorization: Bearer <token> → 200 {"accounts":[{"name":"accounts/1234567890","accountName":"<you>","type":"PERSONAL"}]}. A 429/403 mentioning quota 0 means the access request is not approved yet. Nothing is posted.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 429 / 403 'Quota exceeded … limit 0' | Basic API Access not approved | Submit/wait for the access form; check Quotas page for 300 QPM |
| 'Google My Business API' not in Library or 403 'has not been used in project' | API not enabled (v4 may appear only after approval) | Enable it after approval email; wait a few minutes |
| Post state REJECTED | Content policy (phone numbers in summary, prohibited content, bad image) | Edit summary/CTA, replace image, recreate post |
| 404 location not found | Using locationId with the wrong accountId (location group vs personal) | List locations per account and pair IDs correctly |
| invalid_grant on refresh | Testing-mode 7-day token expiry | Re-consent or publish app |

**Notes:** Nothing works until Google approves the access request (quota 0). Approval is not guaranteed for very new or unverified profiles. Testing-mode refresh tokens expire after 7 days. Posts can be rejected by moderation. Native GBP scheduler exists since ~Apr–May 2026 (third-party report). API is free.

**Alternative:** 1) While waiting for approval, use the native scheduler: search your business on Google → 'Add update' → write post → schedule (label may differ). 2) Or connect the profile in Buffer/Publer/Hootsuite/SocialPilot. 3) The agent then posts through that scheduler's API with the image URL and time. 4) After approval switch to the direct API.

## KakaoTalk
_Route: `manual`_ · Docs: https://developers.kakao.com/docs/latest/en/kakaotalk-channel/common

**Before you start**
- Kakao account (Korean phone number recommended) and a Kakao Talk Channel created in Kakao Business / Talk Channel Admin Center (https://center-pf.kakao.com, now reached via https://business.kakao.com) - free.
- Channel posts (포스트/소식) have no public API - manual or native reservation only.
- Paid channel messages (메시지 to channel friends) are sent from the Admin Center and charged per recipient; API-based business messages (알림톡/친구톡/brand message) need Korean business registration, a business channel and a contract with an official Kakao dealer (e.g. NHN Cloud, Solapi, NCloud SENS) - template review applies.
- Kakao Story API ended (2023).

**Human does**
1. Open https://business.kakao.com (or https://center-pf.kakao.com) -> log in with the Kakao account -> 'Kakao Talk Channel' -> select the channel (or '새 채널 만들기' -> name, search ID, profile image -> confirm).
2. Left menu 포스트 (Posts) -> '새 포스트 작성' (Write new post) (label may differ).
3. Enter the title (required) and paste the body text from the agent's checklist (use the pencil icon to edit title/body blocks).
4. Add media: click 이미지 -> upload the images the agent prepared (in order); or 동영상 / 링크 for a video or the blog link.
5. Optional: add a button (e.g. 'Read more' linking to the blog) and coupons.
6. Publishing options: choose '예약 발행' (reserve) -> pick date and time from the checklist (KST) -> confirm; or '바로 발행' to publish now.
7. Click 발행/저장. Confirm: the post appears under 포스트 list with status 예약 (scheduled) or 발행됨; open the channel home in the KakaoTalk app to check the preview.
8. Mobile: KakaoTalk Channel Admin app ('카카오톡 채널 관리자' app) -> channel -> 포스트 -> 작성 -> same fields -> 예약 (label may differ).
9. Optional paid message to friends: Admin Center -> 메시지 -> 새 메시지 -> choose type -> paste text/image -> target -> 예약 발송 -> check cost -> send (requires credit/cash charged).
10. Copy the post URL (share -> 링크 복사) back to the agent for logging.

**Agent does**
1. Prepare the post: Korean title (<=~40 chars) and body (hook in first 2 lines, link to the blog post), plus an English variant if needed.
2. Resize images: ffmpeg -i in.jpg -vf scale=1080:-2 -q:v 3 post_1.jpg (JPEG, sRGB, <2 MB each); keep upload order in file names.
3. If a paid message is planned, prepend '(광고)' for promotional content and make sure send time is 08:00-21:00 KST; estimate cost = recipients x unit price shown in Admin Center.
4. Build a ready-to-paste checklist: title, body, image list, button label/URL, reservation date/time in KST.
5. Reminder: send the checklist the day before and a nudge 30 min before the reservation deadline; record the returned post URL.
6. Optional self-delivery: with Kakao Login (scope talk_message) the agent can deliver the draft to the human's own chat: POST https://kapi.kakao.com/v2/api/talk/memo/default/send header Authorization: Bearer USER_TOKEN, form template_object={"object_type":"text","text":"Draft...","link":{"web_url":"https://example.com"}} (access token ~6 h, refresh via POST https://kauth.kakao.com/oauth/token grant_type=refresh_token; refresh token ~2 months (unverified)).

**Content specs:** Channel post: title required; body text; up to several images (up to 10 images (unverified)), video or link; buttons and coupons (up to 20 coupons attachable per Kakao guide).; Images: JPG/PNG; square or 4:3 recommended (unverified); keep under ~10 MB (unverified).; Channel message (paid): text up to 1,000 chars with image (unverified), wide image or list types; ad messages must start with '(광고)' per Korean law and respect 21:00-08:00 restrictions.; Post reservation (예약 발행) is available in the Admin Center.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Cannot find 포스트 menu | Admin Center UI moved into Kakao Business | Open business.kakao.com -> Kakao Talk Channel -> channel -> 포스트 (label may differ). |
| Message send button disabled | No business channel / no prepaid balance | Complete business channel verification and charge credit. |
| Post not visible to friends | Channel is private/not searchable or post still reserved | Check channel 공개 settings and reservation time. |

**Notes:** No API for channel posts. Dealer message APIs are per-message paid, template-reviewed and need Korean business registration. Kakao Login tokens (~6 h access, refresh ~2 months) are only for user-level APIs.

**Alternative:** 1) Korean business: contract a Kakao dealer (NHN Cloud, Solapi, NCloud SENS) -> register sender profile (발신프로필) linked to the channel -> get dealer API key -> send brand/friend messages by the dealer's REST API (paid). 2) Otherwise keep native reservation in the Admin Center.

## LINE
_Route: `official_api_own_account`_ · Docs: https://developers.line.biz/en/reference/messaging-api/

**Before you start**
- A LINE Official Account (free 'unverified' account is fine) created with a LINE Business ID (LINE account or e-mail login).
- A Messaging API channel linked to the account (created from LINE Official Account Manager) under a Provider.
- Message plan: each broadcast consumes one message per friend. Japan: Communication plan free 200 msgs/month; Light ¥5,000/month for 5,000; Standard ¥15,000/month for 30,000 + paid overage. Other countries have their own plans (Thailand, Taiwan) - check OA Manager -> Settings -> Plan.
- Media must be hosted at public HTTPS URLs (the agent needs storage such as S3/R2 or your website).
- LINE VOOM (timeline) ended 28-30 Sept 2026, so there is no 'post to feed' option; only messages to friends.

**Human does**
1. Open https://entry.line.biz -> 'Create a LINE Official Account' (アカウントの開設) -> log in with LINE account (or create a Business ID with e-mail) -> fill account name, e-mail, company/store name, industry -> Confirm -> Create. Confirm: you land in LINE Official Account Manager (https://manager.line.biz).
2. In https://manager.line.biz pick the account -> top-right 'Settings' (設定) -> left 'Messaging API' -> 'Enable Messaging API' (Messaging APIを利用する) -> create or choose a Provider (e.g. your brand name) -> optional privacy policy/terms URLs -> OK. Confirm: status 'In use' and a Channel ID appear.
3. Open https://developers.line.biz/console/ -> log in with the same LINE account -> click the Provider -> the Messaging API channel with your account name -> tab 'Messaging API'.
4. Scroll to 'Channel access token (long-lived)' -> 'Issue' -> copy the token to your password manager (reissuing later invalidates the old one). (Optional more secure route: tab 'Basic settings' -> copy Channel ID and Channel secret for short-lived stateless tokens.)
5. Same tab: note 'Bot basic ID' (@xxxx) - friends add the account with it. Turn off 'Auto-reply messages' and 'Greeting messages' if not wanted (links open OA Manager -> Response settings (応答設定)).
6. OA Manager -> Settings -> 'Plan' (プラン) -> choose a plan matching your friend count x broadcasts per month; add a payment method under 'Payments' if upgrading. Confirm: the plan shows the new monthly message limit.
7. Grow friends: OA Manager -> 'Gain friends' (友だち追加) -> copy QR/URL. Add yourself as a friend to see test broadcasts.
8. Hand over LINE_CHANNEL_ACCESS_TOKEN (or Channel ID + Channel secret) through a password manager share.

**Hand over to the agent (store as secrets)**
- `LINE_CHANNEL_ACCESS_TOKEN`: developers.line.biz/console -> provider -> channel -> Messaging API tab -> Channel access token (long-lived) -> Issue. _(sensitivity: high - can message all friends and spend quota)_
- `LINE_CHANNEL_ID / LINE_CHANNEL_SECRET`: Console -> channel -> Basic settings (only if using stateless 15-minute tokens). _(sensitivity: high (secret))_
- `LINE_MEDIA_BASE_URL`: Public HTTPS location where the agent uploads images/videos. _(sensitivity: low)_

**Agent does**
1. Auth header on all calls: Authorization: Bearer LINE_CHANNEL_ACCESS_TOKEN; Content-Type: application/json. Long-lived token does not expire. Optional stateless token: POST https://api.line.me/oauth2/v3/token (form) grant_type=client_credentials&client_id=CHANNEL_ID&client_secret=CHANNEL_SECRET -> access_token valid 15 min (expires_in 899), cannot be revoked; mint per run.
2. Quota check before sending: GET https://api.line.me/v2/bot/message/quota -> {type:'limited', value:N}; GET https://api.line.me/v2/bot/message/quota/consumption -> totalUsage. Also GET https://api.line.me/v2/bot/insight/followers?date=YYYYMMDD for friend count (unverified usage) so cost = friends x messages.
3. Media: upload image (JPEG/PNG, <=10 MB) and a preview (<=1 MB) to public HTTPS; video MP4 <=200 MB plus preview image (unverified sizes). LINE fetches from those URLs at send time.
4. Validate: POST https://api.line.me/v2/bot/message/validate/broadcast with body {"messages":[...]} -> 200 {} if valid (no send).
5. Broadcast: POST https://api.line.me/v2/bot/message/broadcast headers + X-Line-Retry-Key: <new UUID per logical send> body {"messages":[{"type":"text","text":"New post: https://example.com/p"},{"type":"image","originalContentUrl":"https://cdn.example.com/a.jpg","previewImageUrl":"https://cdn.example.com/a_s.jpg"}],"notificationDisabled":false} (max 5 message objects) -> 200 {} and header x-line-request-id (keep).
6. Idempotency: reuse the same X-Line-Retry-Key when retrying the same broadcast; 409 Conflict means it was already accepted - do not resend.
7. Scheduling: no API parameter - agent sends at the target time (Japan JST), or human uses OA Manager scheduled broadcast.
8. Rate limits: broadcast endpoint 60 requests/hour (token bucket: one request per minute refill); other endpoints higher (~2,000 req/s, unverified). On 429 wait at least 60 s and retry with the same retry key. Check delivery: GET https://api.line.me/v2/bot/message/delivery/broadcast?date=YYYYMMDD.

**Test:** GET https://api.line.me/v2/bot/info with Authorization: Bearer TOKEN -> 200 {"userId":"U...","basicId":"@xxxx","displayName":"...","chatMode":"bot","markAsReadMode":"auto"} (no message sent). Optionally POST /v2/bot/message/validate/broadcast with the planned body -> 200 {}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401 Authentication failed | Token reissued/revoked or copied incompletely | Issue a new long-lived token in the console and update the secret. |
| 429 'You have reached your monthly limit' | Plan message quota used up | Upgrade plan in OA Manager or wait for next month; check quota endpoints first. |
| 429 too many requests on broadcast | More than 60 broadcast calls/hour | Wait 60 s; batch up to 5 messages per call. |
| 400 invalid image URL | Non-HTTPS, redirect, or too large image | Serve direct HTTPS JPEG/PNG under size limits. |
| Friends report duplicate messages | Retry without X-Line-Retry-Key | Always send a stable retry key per logical broadcast. |

**Notes:** Broadcasts go to all friends and consume quota (friends x messages). No API for LINE VOOM (service ended Sept 2026). Long-lived channel token never expires; reissuing invalidates the old one. LINE Login tokens (30 days) are only for user login, not for posting.

**Alternative:** 1) OA Manager web/app: https://manager.line.biz -> account -> 'Broadcast messages' (メッセージ配信) -> 'Create new' -> add text/image -> 'Delivery date' set to schedule (予約配信) -> 'Send'. 2) n8n/Make HTTP node calling the broadcast endpoint with the channel token. 3) CRM tools such as respond.io connected to the Messaging API channel.

## Telegram
_Route: `official_api_own_account`_ · Docs: https://core.telegram.org/bots/api

**Before you start**
- A Telegram account (phone number) on the mobile or desktop app; free.
- A Telegram channel (or group) you own or administer - create one in the app: pencil/new message icon -> New Channel.
- No review or approval: a bot token from @BotFather is issued instantly; the Bot API is free.
- No server needed for posting; optional self-hosted Local Bot API server (github.com/tdlib/telegram-bot-api) only if you must upload files >50 MB (up to 2000 MB).

**Human does**
1. 1. In Telegram (app or https://web.telegram.org) search for @BotFather - pick the one with the blue verified check - and tap Start.
2. 2. Send /newbot. When asked for a name, type the display name readers will see on bot messages in groups (e.g. 'My Posts Bot').
3. 3. When asked for a username, type one ending in 'bot' (e.g. myposts_bot). BotFather replies 'Done! Congratulations...' with the HTTP API token (format 123456789:AA...). Copy the whole token into your password manager as TELEGRAM_BOT_TOKEN.
4. 4. Optional hardening: send /setprivacy -> pick the bot -> Enable (the bot only posts; it does not need to read group chatter). Optional: /setuserpic, /setdescription.
5. 5. Open your channel -> tap the channel name at the top -> Edit (pencil; on desktop the three-dot menu -> Manage channel) -> Administrators -> Add Admin (label may differ).
6. 6. Search for the bot's @username, select it. In the admin rights screen keep 'Post Messages' ON; also turn on 'Edit Messages of Others' and 'Delete Messages' if the agent should correct or remove posts; turn the rest off (Add Subscribers, Manage Video Chats, etc.). Tap Save/Done.
7. 7. Confirm: Administrators list now shows the bot. For a public channel note its @username (channel info -> Link t.me/<name>) as TELEGRAM_CHAT_ID (e.g. @mychannel).
8. 8. Private channel: after adding the bot, post any message in the channel (e.g. 'setup'). Tell the agent; it reads the numeric chat_id (starts with -100) via getUpdates. You can delete that message afterwards.
9. 9. Hand TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to the agent through your secret store - not in a public chat.
10. 10. Confirm it worked: the agent sends a silent test message; you should see it in the channel posted under the channel's name. Delete it if you like.
11. 11. If the token is ever leaked: @BotFather -> /revoke -> pick the bot -> a new token is issued and the old one stops working at once; hand over the new one.
12. 12. To stop the agent entirely: channel -> Administrators -> the bot -> Dismiss Admin (or @BotFather -> /deletebot).

**Hand over to the agent (store as secrets)**
- `TELEGRAM_BOT_TOKEN`: @BotFather reply to /newbot; recover with /token (or /revoke for a new one) in @BotFather _(sensitivity: High - full control of the bot; can post to every chat where the bot is admin)_
- `TELEGRAM_CHAT_ID`: Public channel: @username from channel info link t.me/<name>; private channel: -100... id read by the agent from getUpdates _(sensitivity: Low - identifier only)_

**Agent does**
1. 1. Base URL https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/<method>. Use POST with Content-Type: application/json (or multipart/form-data for uploads). Responses: {"ok":true,"result":...} or {"ok":false,"error_code":429,"description":"...","parameters":{"retry_after":N}}. No OAuth; the token never expires unless revoked.
2. 2. Verify token: GET https://api.telegram.org/bot$TOKEN/getMe -> keep result.id and result.username.
3. 3. Private channel id: POST .../getUpdates {"allowed_updates":["channel_post"]} after the human posts -> result[].channel_post.chat.id (e.g. -1001234567890). If a webhook is set, first POST .../deleteWebhook (getUpdates fails while a webhook is active). Store the id.
4. 4. Text: POST .../sendMessage {"chat_id":"@mychannel","text":"Hello <b>world</b>","parse_mode":"HTML","link_preview_options":{"is_disabled":false},"disable_notification":false} (text <=4096 chars). Keep result.message_id.
5. 5. Photo: POST .../sendPhoto multipart: chat_id=@mychannel, photo=@image.jpg (<=10 MB; or an https URL / earlier file_id), caption=... (<=1024 chars), parse_mode=HTML. Video: sendVideo (video=@clip.mp4, supports_streaming=true, caption); other files: sendDocument. Cloud Bot API upload cap 50 MB. Keep result.photo[-1].file_id / result.video.file_id to reuse without re-uploading.
6. 6. Album: POST .../sendMediaGroup multipart: chat_id, media='[{"type":"photo","media":"attach://f1","caption":"Album caption"},{"type":"photo","media":"attach://f2"}]', f1=@a.jpg, f2=@b.jpg (2-10 items; caption only on the first) -> array of messages.
7. 7. Poll: POST .../sendPoll {"chat_id":"@mychannel","question":"Which?","options":[{"text":"A"},{"text":"B"}],"is_anonymous":true}. (Bot API 9.6, Apr 2026, replaced correct_option_id with correct_option_ids for quizzes.)
8. 8. Scheduling: the Bot API has no schedule parameter. Keep a queue (time, payload, idempotency key) and fire from cron/systemd timer at the due time; record the returned message_id against the key so a retried job never sends twice (on a timeout, check your log before resending).
9. 9. Rate limits: <=1 msg/s per chat, <=20 msgs/min per group/channel, ~30 msgs/s overall. On error_code 429 sleep parameters.retry_after seconds, then retry once; use exponential backoff for 5xx.
10. 10. Edits/deletes: POST .../editMessageText {chat_id, message_id, text}, editMessageCaption {chat_id, message_id, caption}, deleteMessage {chat_id, message_id}.
11. 11. Token refresh: none needed. If calls return 401 Unauthorized, the token was revoked - ask the human for the new one.

**Test:** curl -s https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe -> {"ok":true,"result":{"id":...,"is_bot":true,"username":"myposts_bot"}}. Then curl -s -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage -H 'Content-Type: application/json' -d '{"chat_id":"'$TELEGRAM_CHAT_ID'","text":"test","disable_notification":true}' -> ok:true with result.message_id; remove with deleteMessage {chat_id, message_id}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 400 Bad Request: chat not found | Wrong @username/id, or the bot was never added to the channel | Re-check the channel link; for private channels use the -100... id from getUpdates; re-add the bot as admin |
| 403 Forbidden: bot is not a member of the channel chat / need administrator rights | Bot not admin or 'Post Messages' off | Channel -> Administrators -> bot -> enable Post Messages |
| 409 Conflict on getUpdates | A webhook is set for the bot | POST deleteWebhook, then getUpdates |
| 429 Too Many Requests: retry after N | Exceeded per-chat or global flood limits | Sleep retry_after seconds; keep <=20 msgs/min per channel |
| 400 Bad Request: can't parse entities (wording may differ) | Unescaped characters in HTML/MarkdownV2 | Escape <, >, & for HTML or the MarkdownV2 special characters; or drop parse_mode |
| 413 Request Entity Too Large | Photo >10 MB or file >50 MB | Compress/resize, send large photos as documents, or use a Local Bot API server |

**Notes:** Posts appear as the channel, not as the person. The bot token is full control of the bot - store as a secret. Bots cannot schedule natively and cannot post as the user; native scheduling exists only in the human apps (long-press send -> Schedule Message). MTProto user-account libraries need the person's phone login - not recommended. Captions max 1024 chars; text 4096. Stories only for Business accounts that connected the bot. Log In With Telegram (OIDC + PKCE) gives identity only, no posting rights.

**Alternative:** 1) In n8n add a Telegram node (credential = bot token) after a Webhook or Schedule trigger, operation Send Message/Photo, chat ID @mychannel. 2) Or connect the same bot token in Postiz and schedule there. 3) Manual: in the Telegram app type the post in the channel, long-press (mobile) or right-click (desktop) the send button -> Schedule Message -> pick date/time.

## Viber
_Route: `official_api_own_account`_ · Docs: https://developers.viber.com/docs/tools/channels-post-api/

**Before you start**
- Viber account on a phone (mobile app required to create channels) and a Viber Channel where you are the super admin.
- A public HTTPS endpoint with a valid CA-signed certificate (self-signed not accepted) that returns HTTP 200 to Viber callbacks - required once to activate posting via set_webhook (any serverless function, e.g. Cloudflare Worker, works).
- Media hosted at public HTTPS URLs.
- Channels Post API is free (unverified); Viber bot (chatbot) messaging has separate commercial fees and is not needed for channel posting.

**Human does**
1. On your phone open Viber -> Chats -> pencil/compose icon -> 'New Channel' (if you do not have one) -> name, photo, description -> Create. You are now super admin.
2. Open the channel -> tap the channel name at the top (Channel info) -> scroll down to 'Developer Tools' -> tap to view/copy the authentication token (only super admins see it). Paste it into your password manager as VIBER_CHANNEL_TOKEN.
3. Create the webhook endpoint (or let the agent deploy one): a tiny HTTPS function that answers 200 OK to any POST, e.g. https://viber-hook.yourdomain.workers.dev. Confirm with curl -X POST URL that it returns 200.
4. Hand VIBER_CHANNEL_TOKEN and VIBER_WEBHOOK_URL to the agent. The agent calls set_webhook; confirm the agent reports status 0 (ok).
5. Make sure at least you (super admin) are in the channel member list; the agent will use your member id as the 'from' sender.
6. Optional: Channel info -> Settings -> make sure the channel is public or share its invite link (Channel info -> Share) so followers can join; posts by the API appear as from the channel.
7. Check the first test post in the Viber app (desktop or mobile) and confirm formatting.
8. To revoke: Channel info -> Developer Tools -> regenerate/revoke token (label may differ); the old token stops working.

**Hand over to the agent (store as secrets)**
- `VIBER_CHANNEL_TOKEN`: Viber app -> Channel -> Channel info -> Developer Tools -> token. _(sensitivity: high - anyone with it can post to the channel)_
- `VIBER_WEBHOOK_URL`: Your HTTPS endpoint that returns 200. _(sensitivity: low)_

**Agent does**
1. Headers on every call: X-Viber-Auth-Token: VIBER_CHANNEL_TOKEN, Content-Type: application/json. Base URL https://chatapi.viber.com/pa/. Token is static (no refresh) until regenerated.
2. Activate once: POST https://chatapi.viber.com/pa/set_webhook {"url":"VIBER_WEBHOOK_URL","auth_token":"VIBER_CHANNEL_TOKEN"} -> {"status":0,"status_message":"ok"}. Viber sends a test callback to the URL which must return 200.
3. Sender id: POST https://chatapi.viber.com/pa/get_account_info {} -> members[] -> pick the member with role 'superadmin' -> keep its id as ADMIN_ID.
4. Text: POST https://chatapi.viber.com/pa/post {"from":"ADMIN_ID","type":"text","text":"New post: https://example.com/p"} -> {"status":0,"message_token":...} (keep message_token).
5. Picture: {"from":"ADMIN_ID","type":"picture","text":"Caption","media":"https://cdn.example.com/a.jpg","thumbnail":"https://cdn.example.com/a_t.jpg"} (JPEG <=1 MB). Video: {"type":"video","media":URL,"size":BYTES,"duration":SECONDS,"thumbnail":URL} (<=50 MB, <=180 s). File: {"type":"file","media":URL,"size":BYTES,"file_name":"doc.pdf"}. Link: {"type":"url","media":"https://..."}.
6. Scheduling: no API parameter - the agent posts at the target time itself.
7. Idempotency/limits: no published rate limit for channels; send <=1 post/s; store message_token per item and do not repost after a timeout without checking the channel (no read API - ask human or accept the risk). Non-zero status codes: 2 invalid auth token, 3 bad data, 5 receiver/sender not member, 12 rate exceeded (unverified for channels) -> back off 60 s.

**Content specs:** Text: up to 7,000 characters.; Picture: JPEG URL, max 1 MB (thumbnail optional, JPEG <=100 KB); caption text.; Video: MP4/H.264 URL, max 50 MB, duration up to 180 s; size field required, thumbnail optional.; File: max 50 MB with file_name; also url (link), location, contact and sticker types.

**Test:** POST https://chatapi.viber.com/pa/get_account_info with header X-Viber-Auth-Token: TOKEN and body {} -> {"status":0,"status_message":"ok","id":"pa:...","name":"Channel name","members":[{"id":"...","role":"superadmin",...}]} (no post).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| status 2 'invalidAuthToken' | Token regenerated or not a super admin's token | Copy a fresh token from Developer Tools. |
| Posts fail before webhook set | set_webhook not called or endpoint not returning 200 | Deploy endpoint with valid CA certificate, call set_webhook again. |
| set_webhook fails | Self-signed or expired certificate / non-200 response | Use a trusted-CA HTTPS host (e.g. Cloudflare Workers). |
| Picture not shown | Image over 1 MB or not JPEG | Re-encode JPEG under 1 MB. |

**Notes:** Token is static until revoked/regenerated. Webhook must be set before posting. Channels Post API itself is free (unverified); commercial bot chats are paid. Native in-app scheduling for channel posts is unverified.

**Alternative:** 1) SMMplanner or postmypost: connect the Viber channel with the same Developer Tools token and schedule posts. 2) n8n/Make HTTP node: Webhook in -> HTTP Request POST https://chatapi.viber.com/pa/post with the X-Viber-Auth-Token header. 3) Manual: post in the Viber app.

## WhatsApp
_Route: `manual`_ · Docs: https://developers.facebook.com/docs/whatsapp/pricing

**Before you start**
- WhatsApp (or WhatsApp Business) app on a phone with the number that owns the Channel; a Channel created in Updates tab.
- No posting API exists for Channels or Status — posts are made by hand in the app (phone, or WhatsApp Web/desktop for Channels — unverified for all features).
- Optional Cloud API (1:1 messages only): Meta Business portfolio, Meta app, a phone number not active in the WhatsApp app, payment method; template messages are paid per delivered message since 1 Jul 2025.

**Human does**
1. Phone: open WhatsApp → 'Updates' tab → under Channels tap '+' → 'Create channel' → Continue → name, description, icon → 'Create channel' (one-time).
2. Before posting, open the agent's message (email/Notes/Telegram) containing the ready caption and media files; save media to the phone's Photos (long-press → Save).
3. WhatsApp → Updates → tap your Channel → tap the text field → paste the caption.
4. For media: tap the 📎/+ icon → Gallery/Photos → pick the prepared image/video → (optional HD toggle) → add caption → Send.
5. For a poll: 📎 → Poll → question + 2–12 options (unverified count) → Send.
6. Desktop alternative: https://web.whatsapp.com (linked device) → Channels icon → your Channel → paste/attach → Send (unverified whether all post types are available on web).
7. Status: Updates → Status → camera/pencil icon → pick media or type text → Send to 'My contacts'.
8. If the in-app scheduler is available to you (beta): long-press send / tap the clock option to pick date/time (label may differ); otherwise post at the reminder time.
9. Confirm: the update appears in the Channel with a timestamp and view counter; edit within 30 days via long-press → Edit if needed.
10. Reply 'done' to the agent so it marks the job as posted.

**Agent does**
1. Prepare text ≤4,096 chars (keep key line in first ~2 lines), plain URL(s), WhatsApp formatting (*bold*), no hashtags; create 2 variants (Channel post and short Status line ≤ ~700 chars, unverified).
2. Prepare media: images as JPEG ≤16 MB (1080 px wide; 1080×1920 for Status); videos MP4 H.264/AAC, ≤90 s for Status, ≤16 MB (ffmpeg -c:v libx264 -crf 23 -c:a aac -movflags +faststart).
3. Build a one-tap compose link https://wa.me/?text=<urlencoded caption> (opens WhatsApp with text prefilled; user chooses chat — Channels may not be selectable, so copy/paste fallback).
4. Send the human a checklist: channel name, caption (copy block), media files, poll question/options, intended time.
5. Set a reminder at the due time (calendar event or push notification) with the checklist link; re-ping after 30 min if not confirmed.
6. Log the post as 'pending manual' and mark 'done' on confirmation; keep media for 30 days (Channel history window).

**Content specs:** **channel_posts:** Text, photos, videos, GIFs, stickers, voice notes, links, polls (Channels are one-way; followers react/vote, no replies). Admins can edit an update for up to 30 days; channel history is kept 30 days. · **text:** Up to 4,096 characters per message (formatting *bold* _italic_ ~strike~ ```mono```); links get a preview card from the first URL. · **images:** JPEG/PNG; sent compressed (choose HD option for higher quality); ≤16 MB practical (unverified for Channels). · **video:** MP4 H.264/AAC; ≤16 MB via standard media (larger videos may be sent in HD/document mode — unverified for Channels). · **status:** Photo/video/text Status visible 24 h; video Status up to 90 s (rolled out 2025); 9:16 recommended 1080×1920. · **hashtags:** No hashtag system; # is plain text. · **scheduling:** In-app message scheduling reported in beta (Feb–Mar 2026); no confirmed native scheduler for Channel posts.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Create channel option missing | Feature not yet available for the account/region or outdated app | Update WhatsApp; check Updates tab again later |
| Video won't attach or is heavily compressed | Over size/length limit | Re-encode smaller (≤16 MB) or send as HD; trim Status to ≤90 s |
| wa.me link doesn't show the Channel as a target | Share prefill targets chats, not Channels (unverified) | Copy caption, open the Channel manually and paste |

**Notes:** Channels and Status cannot be posted via Meta's API. Third-party unofficial gateways (e.g. Whapi) that post to Channels use a linked WhatsApp session and risk account bans/ToS violations — not recommended. Cloud API template messages cost money (per delivered template, rates by country; US marketing ≈ $0.025) and need opt-in; replies within the 24 h service window are free. Cloud API messaging limits: new portfolios start at 250 unique users/24 h, tiers up to 2,000/10,000/100,000/unlimited (per business portfolio since Oct 2025); 80 msg/s default throughput.

**Alternative:** Cloud API for opted-in 1:1 messages: 1) developers.facebook.com → Create app → use case 'Connect with customers through WhatsApp' → pick Business portfolio; App → WhatsApp → API Setup: note Phone number ID + WhatsApp Business Account ID, add test recipients (max 5) or 'Add phone number' (SMS verify) and add a payment method in Business Settings → WhatsApp accounts. 2) business.facebook.com → Settings → Users → System users → Add (Admin) → Assign assets (app + WhatsApp account, full control) → Generate token with whatsapp_business_messaging, whatsapp_business_management, expiry Never. 3) WhatsApp Manager → Message templates → create a Utility/Marketing template and wait for approval. 4) Agent: POST https://graph.facebook.com/v25.0/{phone-number-id}/messages, Authorization: Bearer <system user token>, {"messaging_product":"whatsapp","to":"14155551234","type":"template","template":{"name":"hello_world","language":{"code":"en_US"}}} → messages[0].id; free-form type text/image only within 24 h of the contact's last message; media via POST /{phone-number-id}/media (multipart) → id; test with GET /{phone-number-id}?fields=display_phone_number,verified_name.

## WeChat
_Route: `official_api_own_account`_ · Docs: https://developers.weixin.qq.com/doc/offiaccount/en/Getting_Started/Overview.html

**Before you start**
- WeChat Official Account (公众号, subscription or service account) registered at https://mp.weixin.qq.com by a mainland-China enterprise or sole proprietorship (个体工商户) with business license; administrator with Chinese ID and a WeChat account with bound bank card.
- WeChat verification (微信认证) completed: about ¥300 per year (annual re-verification). Since July 2025, freepublish/* and mass/* (publish) APIs are revoked for individual-entity accounts, unverified enterprise accounts and accounts that cannot be verified; draft/* still works without verification.
- A server with a fixed public egress IP (must be whitelisted) to call the API.
- No API fees beyond verification.

**Human does**
1. Open https://mp.weixin.qq.com -> 立即注册 -> 订阅号 (or 服务号) -> e-mail + password -> activation e-mail -> choose region 中国大陆 -> subject type 企业 or 个体工商户 -> upload business license, admin ID, admin scans QR with WeChat. Wait for approval.
2. After login: 设置与开发 -> 账号设置 (or 公众号设置) -> 微信认证 -> 开通 -> fill company info, invoice details -> pay ¥300 -> wait for the third-party auditor's call/approval (days). Confirm: account shows '已认证'.
3. 设置与开发 -> 开发接口管理 (Development -> Basic configuration) (label may differ) -> copy 开发者ID(AppID).
4. Same page -> 开发者密码(AppSecret) -> 生成/重置 -> administrator scans QR in WeChat to approve -> copy the AppSecret immediately (shown once) to the password manager.
5. Same page -> IP白名单 -> 修改/查看 -> add the agent server's public egress IPv4 address(es) -> admin confirms by QR scan. Find your egress IP by running curl https://ifconfig.me on the server.
6. 设置与开发 -> 接口权限 (API permissions): check that 草稿箱 (draft) and 发布能力 (publish) show '已获得'. If just verified, wait up to ~24 h.
7. Optional: 设置与开发 -> 人员设置 -> 运营者 add a WeChat ID who can approve sensitive actions.
8. Hand over WECHAT_APPID and WECHAT_APPSECRET via password manager; confirm the server's fixed IP to the agent.

**Hand over to the agent (store as secrets)**
- `WECHAT_APPID`: mp.weixin.qq.com -> 设置与开发 -> 开发接口管理 -> AppID. _(sensitivity: low)_
- `WECHAT_APPSECRET`: Same page -> AppSecret (generate/reset; admin QR scan). _(sensitivity: high - full API control; reset if leaked)_
- `WECHAT_EGRESS_IP`: Public IP of the agent server, added to IP白名单. _(sensitivity: low)_

**Agent does**
1. Token: POST https://api.weixin.qq.com/cgi-bin/stable_token JSON {"grant_type":"client_credential","appid":"APPID","secret":"SECRET","force_refresh":false} -> access_token, expires_in 7200. Cache and reuse; refresh when <5 min left (daily call quota on token endpoints).
2. Cover: POST https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=TOKEN&type=image multipart media=@cover.jpg -> media_id (thumb_media_id), url.
3. In-article images: POST https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=TOKEN multipart media=@img.jpg -> url (mmbiz.qpic.cn); rewrite <img src> in the HTML to these URLs.
4. Draft: POST https://api.weixin.qq.com/cgi-bin/draft/add?access_token=TOKEN JSON {"articles":[{"title":"...","author":"...","digest":"...","content":"<p>...</p>","content_source_url":"https://...","thumb_media_id":"MEDIA_ID","need_open_comment":0,"only_fans_can_comment":0}]} -> media_id (draft id). Works even when publish is not allowed.
5. Publish (verified enterprise only): POST https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=TOKEN {"media_id":"DRAFT_ID"} -> publish_id. Poll POST /cgi-bin/freepublish/get?access_token=TOKEN {"publish_id":"..."} every 10-30 s until publish_status=0 -> article_detail.item[].article_url. Status 1=publishing, 2+=failed (original-content check/moderation).
6. Push to followers instead (counts toward the 1/day mass send for subscription accounts): POST /cgi-bin/message/mass/sendall?access_token=TOKEN {"filter":{"is_to_all":true},"mpnews":{"media_id":"DRAFT_ID"},"msgtype":"mpnews","send_ignore_reprint":0,"clientmsgid":"UNIQUE_ID"} - clientmsgid deduplicates retries.
7. Scheduling: no API parameter - the agent holds the queue and calls submit/sendall at the target Beijing time; or the human uses 定时群发 in the web backend.
8. Errors/backoff: 40001/42001 = token invalid/expired -> fetch new stable_token; 40164 = IP not whitelisted; 45009 = daily API quota reached (wait until midnight Beijing); 48001 = API permission not granted (verification/July-2025 rule). Store draft media_id and publish_id per item to avoid duplicates.

**Content specs:** Article (图文): title <=64 chars (unverified), digest <=120 chars (unverified), content HTML with images hosted on mmbiz.qpic.cn (uploadimg; external image URLs are stripped), content < 20,000 characters and < 1 MB (unverified).; Cover (thumb_media_id): permanent image material; 2.35:1 (900x383) cover recommended (unverified); image material up to 10 MB, bmp/png/jpeg/jpg/gif (unverified).; uploadimg in-article images: jpg/png under 1 MB (unverified).; Subscription accounts: 1 mass push (群发) per day; publishing via freepublish does not notify followers.

**Test:** POST https://api.weixin.qq.com/cgi-bin/draft/count?access_token=TOKEN -> {"total_count":N} (read-only; errcode 40164 means IP not whitelisted, 48001 means no draft permission).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| errcode 40164 invalid ip | Server egress IP not in IP白名单 | Add the IP; use a fixed-IP server/NAT. |
| errcode 48001 api unauthorized on freepublish/submit | Account individual/unverified (publish API revoked July 2025) | Complete enterprise verification, or have a human publish the API-created draft in the backend. |
| Images missing in published article | External image URLs in content | Upload via media/uploadimg and use mmbiz URLs. |
| publish_status 2/3/4 failed | Original-content check or moderation | Read fail_idx, fix content, resubmit as a new draft. |
| 40001 invalid credential | Old token after another system reset AppSecret/token | Use stable_token, avoid force_refresh, reset only once. |

**Notes:** Requires mainland China entity + verification; individual accounts can only prepare drafts by API, then a human publishes in mp.weixin.qq.com. Fixed egress IP required. WeChat Channels (视频号) has no publishing API.

**Alternative:** 1) Agent creates the draft via draft/add (works without verification). 2) Human opens mp.weixin.qq.com -> 内容管理 -> 草稿箱 -> the draft -> 发表 or 群发 -> optional 定时 (schedule) -> scan QR to confirm. 3) Without any API: agent prepares HTML + images; human pastes into the 图文 editor.

## Bluesky
_Route: `official_api_own_account`_ · Docs: https://docs.bsky.app/docs/get-started

**Before you start**
- A Bluesky account (free) at https://bsky.app or another atproto PDS.
- Verified email address (required for video uploads).
- No review, no cost; app password or atproto OAuth.
- Agent needs persistent storage for the session tokens.

**Human does**
1. 1. Go to https://bsky.app and sign in (or open the Bluesky app).
2. 2. Verify your email: Settings -> Account -> Email -> Verify (enter the code from the email). Confirm the status shows Verified.
3. 3. Go to Settings -> Privacy and security -> App passwords.
4. 4. Click Add App Password. Name: 'posting-agent' (letters, numbers, dashes).
5. 5. Leave 'Allow access to your direct messages' unticked. Click Next / Create App Password.
6. 6. Copy the generated password (19 characters, format xxxx-xxxx-xxxx-xxxx). It is shown only once; store it as BLUESKY_APP_PASSWORD.
7. 7. Note your handle (e.g. name.bsky.social or your custom domain) as BLUESKY_HANDLE - shown on your profile under your display name.
8. 8. If your account is on a self-hosted/third-party PDS, note its URL (e.g. https://pds.example.com) as BLUESKY_PDS; otherwise leave default https://bsky.social.
9. 9. Hand these to the agent via your secret store. Never give the main account password.
10. 10. Confirm: the agent posts a test and deletes it; you can see it briefly on your profile.
11. 11. To revoke: Settings -> Privacy and security -> App passwords -> trash icon next to 'posting-agent' (sessions created with it stop working).

**Hand over to the agent (store as secrets)**
- `BLUESKY_HANDLE`: Profile page under display name _(sensitivity: Low)_
- `BLUESKY_APP_PASSWORD`: Settings -> Privacy and security -> App passwords -> Add App Password (shown once) _(sensitivity: High - can post, like, follow, delete posts; not DMs unless allowed, cannot delete the account)_
- `BLUESKY_PDS (optional)`: Only for non-bsky.social hosting; default https://bsky.social _(sensitivity: Low)_

**Agent does**
1. 1. Login: POST https://bsky.social/xrpc/com.atproto.server.createSession, Content-Type: application/json, {"identifier":"$BLUESKY_HANDLE","password":"$BLUESKY_APP_PASSWORD"} -> keep accessJwt, refreshJwt, did, didDoc. Take the PDS URL from didDoc.service[id=#atproto_pds].serviceEndpoint and use it for later calls.
2. 2. Token refresh: accessJwt is short-lived (minutes-hours, exact value unverified); on 400/401 'ExpiredToken' call POST <pds>/xrpc/com.atproto.server.refreshSession with Authorization: Bearer <refreshJwt> (no body) -> new accessJwt + refreshJwt; persist both. Only call createSession again if refresh fails (createSession limit 30/5 min, 300/day per account).
3. 3. Image upload: POST <pds>/xrpc/com.atproto.repo.uploadBlob, Authorization: Bearer <accessJwt>, Content-Type: image/jpeg (raw bytes body, <=1,000,000 bytes; strip EXIF) -> keep the whole blob object {$type:'blob', ref:{$link}, mimeType, size}.
4. 4. Post: POST <pds>/xrpc/com.atproto.repo.createRecord {"repo":"<did>","collection":"app.bsky.feed.post","record":{"$type":"app.bsky.feed.post","text":"Hello https://example.com #tag","createdAt":"2026-10-07T12:00:00Z","langs":["en"],"facets":[...],"embed":{...}}} -> keep uri (at://did/app.bsky.feed.post/<rkey>) and cid. Text <=300 graphemes.
5. 5. Facets: for every URL/mention/hashtag compute UTF-8 byte offsets: {"index":{"byteStart":6,"byteEnd":25},"features":[{"$type":"app.bsky.richtext.facet#link","uri":"https://example.com"}]}; mentions #mention {did} (resolve via GET com.atproto.identity.resolveHandle?handle=), hashtags #tag {tag}. Without facets links are not clickable.
6. 6. Images embed: {"$type":"app.bsky.embed.images","images":[{"image":<blob>,"alt":"description","aspectRatio":{"width":1200,"height":800}}]} (max 4). Link card: fetch og:title/description/image yourself, uploadBlob the thumb, embed {"$type":"app.bsky.embed.external","external":{"uri","title","description","thumb":<blob>}}.
7. 7. Video (<=100 MB, <=3 min; 25 videos or 10 GB/day): GET <pds>/xrpc/com.atproto.server.getServiceAuth?aud=did:web:<pds host>&lxm=com.atproto.repo.uploadBlob&exp=<unix now+1800> -> token; POST https://video.bsky.app/xrpc/app.bsky.video.uploadVideo?did=<did>&name=clip.mp4 with Authorization: Bearer <token>, Content-Type: video/mp4, raw bytes -> jobId; poll GET https://video.bsky.app/xrpc/app.bsky.video.getJobStatus?jobId= until jobStatus.blob; embed {"$type":"app.bsky.embed.video","video":<blob>,"alt","aspectRatio"}.
8. 8. Thread: post the first item, then each reply with record.reply = {"root":{"uri","cid"} of first, "parent":{"uri","cid"} of previous}.
9. 9. Scheduling: none in API or app - agent-side queue; set createdAt to the actual send time (do not backdate).
10. 10. Idempotency: use com.atproto.repo.putRecord with a deterministic rkey (TID derived from the queue item) or check the stored uri before retrying, so a retried job does not double-post.
11. 11. Rate limits: 5,000 points/h and 35,000/day per account (create 3, update 2, delete 1); 3,000 requests/5 min per IP. On 429 read RateLimit-Reset and wait.

**Test:** POST https://bsky.social/xrpc/com.atproto.server.createSession {identifier, password} -> 200 with did/accessJwt; then GET https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=<did> -> your handle/displayName (no post created). Optional: createRecord {text:'test'} -> {uri,cid}; delete with POST <pds>/xrpc/com.atproto.repo.deleteRecord {repo:did, collection:'app.bsky.feed.post', rkey}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401 AuthenticationRequired / 'Invalid identifier or password' (wording may differ) | Main password used, typo, or app password revoked | Create a new app password; use handle without leading @ |
| 400 ExpiredToken | accessJwt expired | refreshSession with refreshJwt; persist new tokens |
| 400 BlobTooLarge | Image >1,000,000 bytes | Resize/compress to under 1 MB (e.g. 2000 px JPEG q80) |
| Links not clickable in the post | No facets sent | Compute UTF-8 byte offsets and add link facets |
| Video upload rejected | Email not verified, >100 MB/3 min, or daily cap | Verify email; trim/re-encode; wait for daily reset |
| 429 RateLimitExceeded | createSession called too often or write points exhausted | Reuse sessions; wait until RateLimit-Reset |

**Notes:** App passwords give near-full account access except DMs (if unticked) and account deletion; revoke when done. Bluesky has no native scheduled posts as of Oct 2026. PDS max blob 50 MB but the app limits images to ~1 MB. For an app other people sign into use atproto OAuth (PAR + PKCE + DPoP) with scopes 'atproto transition:generic' or granular 'atproto repo:app.bsky.feed.post blob:*/*'.

**Alternative:** 1) Buffer, Typefully or Postiz: Channels -> Add Bluesky -> enter handle + app password (or OAuth). 2) Compose and schedule in the scheduler. 3) Or n8n HTTP Request nodes with the createSession + createRecord calls above.

## Mastodon / Fediverse
_Route: `official_api_own_account`_ · Docs: https://docs.joinmastodon.org/methods/statuses/

**Before you start**
- An account on a Mastodon server (e.g. mastodon.social) or a compatible server; free.
- Check the server rules (About page) for automated posting; some require the 'automated account' flag.
- No review; token created in your own settings.

**Human does**
1. 1. Sign in at your server in a browser (e.g. https://mastodon.social).
2. 2. Open Preferences (gear icon, or https://<server>/settings/preferences) -> Development (https://<server>/settings/applications).
3. 3. Click New application.
4. 4. Application name: 'posting-agent'. Application website: optional. Redirect URI: leave urn:ietf:wg:oauth:2.0:oob.
5. 5. Scopes: untick the default 'read', 'write', 'follow' (or 'profile') boxes you don't need, then tick write:statuses and write:media; also tick read:statuses and profile (or read:accounts) so the agent can verify itself and list scheduled posts.
6. 6. Click Submit (bottom of the page). You return to the list - click 'posting-agent'.
7. 7. Copy 'Your access token' into your password manager as MASTODON_ACCESS_TOKEN (Client key/secret are not needed).
8. 8. Note your server base URL (https://mastodon.social) as MASTODON_INSTANCE_URL.
9. 9. Optional, often required for bots: Preferences -> Public profile (Profile) -> tick 'This is an automated account' (label may differ) -> Save changes.
10. 10. Hand both values to the agent via your secret store.
11. 11. Confirm: the agent calls verify_credentials and posts a private test; you see it under your profile (Followers-only/Mentioned only).
12. 12. To revoke: Development -> posting-agent -> Regenerate access token, or Delete the app (Preferences -> Account -> Authorized apps also lists it).

**Hand over to the agent (store as secrets)**
- `MASTODON_INSTANCE_URL`: Your server address, e.g. https://mastodon.social _(sensitivity: Low)_
- `MASTODON_ACCESS_TOKEN`: Preferences -> Development -> posting-agent -> 'Your access token' _(sensitivity: High - posts as you within the granted scopes; does not expire until revoked)_

**Agent does**
1. 1. All calls: Authorization: Bearer $MASTODON_ACCESS_TOKEN against $MASTODON_INSTANCE_URL. No refresh needed (token lives until revoked); 401 means revoked -> ask human.
2. 2. GET /api/v2/instance -> configuration.statuses.max_characters (default 500), max_media_attachments (4), configuration.media_attachments.image_size_limit / video_size_limit / supported_mime_types. Cache daily.
3. 3. Media: POST /api/v2/media multipart: file=@image.jpg, description='alt text', focus='0.0,0.0' (optional thumbnail=@thumb.jpg for video) -> 200 (processed, url set) or 202 (video/gifv/audio processing, url null). Poll GET /api/v1/media/:id every 2-5 s until 200 (206 = still processing). Keep id.
4. 4. Post: POST /api/v1/statuses, headers Authorization + Idempotency-Key: <uuid per queue item> (stored server-side up to 1 hour), JSON {"status":"Hello #fediverse","media_ids":["1101..."],"visibility":"public","language":"en","sensitive":false,"spoiler_text":""} -> Status {id, url, uri}.
5. 5. Poll instead of media: "poll":{"options":["A","B"],"expires_in":86400,"multiple":false}.
6. 6. Native scheduling: add "scheduled_at":"2026-10-08T09:00:00Z" (>=5 min in the future) -> returns ScheduledStatus {id, scheduled_at, params}. List: GET /api/v1/scheduled_statuses; change time: PUT /api/v1/scheduled_statuses/:id {scheduled_at}; cancel: DELETE /api/v1/scheduled_statuses/:id. Media attached to scheduled posts must be uploaded first.
7. 7. Threads: post the first, then each next with in_reply_to_id = previous id (use visibility 'unlisted' for replies to avoid flooding timelines, optional).
8. 8. Quote posts (Mastodon 4.5+): quoted_status_id and quote_approval_policy are accepted; check instance api_versions.mastodon >= 7.
9. 9. Rate limits: 300 requests/5 min per account and per IP; media uploads 30 per 30 min; deletes 30 per 30 min. Read X-RateLimit-Remaining/X-RateLimit-Reset; on 429 wait until reset.
10. 10. Edit: PUT /api/v1/statuses/:id {status, media_ids}; delete: DELETE /api/v1/statuses/:id.

**Test:** curl -s -H "Authorization: Bearer $MASTODON_ACCESS_TOKEN" $MASTODON_INSTANCE_URL/api/v1/accounts/verify_credentials -> 200 with your acct/username (needs profile or read:accounts scope). Optional: POST /api/v1/statuses {"status":"test","visibility":"direct"} -> 200 with id; DELETE /api/v1/statuses/<id>.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 403 'This action is outside the authorized scopes' (wording may differ) | Token lacks the needed scope (e.g. read:accounts for verify_credentials) | Recreate the app/token with the scopes listed in step 5 |
| 422 'Scheduled at the time must be at least 5 minutes in the future' (wording may differ) | scheduled_at too close | Use a time >=5 min ahead in UTC ISO 8601 |
| 422 'Cannot attach files that have not finished processing' (wording may differ) | Video still processing | Poll GET /api/v1/media/:id until url is set |
| 429 Too many requests | Rate or media-upload limit | Wait until X-RateLimit-Reset |
| Duplicate posts after retries | No Idempotency-Key | Always send a per-item Idempotency-Key |

**Notes:** Tokens from Development do not expire. Every server has its own token and rules. Forks (Glitch, Hometown) accept the same calls; GoToSocial/Akkoma/Misskey differ - scheduled_at support varies. Pixelfed handled separately. OAuth apps for other users: POST /api/v1/apps per server; PKCE S256 from 4.3.0.

**Alternative:** 1) Buffer, Typefully, Postiz, Mixpost or Fedica: Add channel -> Mastodon -> enter server domain -> authorize via OAuth. 2) Compose and schedule there. 3) Or use the Mastodon API's own scheduled_at from a Siri Shortcut (one POST).

## Threads
_Route: `official_api_own_account`_ · Docs: https://developers.facebook.com/docs/threads/posts

**Before you start**
- Threads profile (created from your Instagram account).
- Facebook account registered as Meta developer (free), 2FA on.
- Meta app with use case 'Access the Threads API'; your profile added as Threads Tester (no App Review for your own account).
- HTTPS redirect URL (agent's) plus uninstall/delete callback URLs you control.
- Public HTTPS hosting for images/videos.
- Free.

**Human does**
1. Open https://developers.facebook.com → 'Log in' with your Facebook account (enable 2FA first: Facebook → Settings & privacy → Accounts Center → Password and security → Two-factor authentication) → 'Get started' → accept the Platform Terms → verify phone/email by code → choose role 'Developer' → Complete registration. Confirm: the top bar shows 'My Apps'.
2. My Apps → 'Create app' → name + email → Use case 'Access the Threads API' → Next → Create app.
3. Use cases → 'Access the Threads API' → 'Customize' → Permissions: threads_basic (default) → 'Add' threads_content_publish (and threads_delete if the agent should delete test posts; threads_manage_replies optional).
4. Same use case → 'Settings': Redirect Callback URLs = agent's https URL (e.g. https://agent.example.com/threads/callback); Uninstall Callback URL and Delete Callback URL = any https URL you control → Save. Copy 'Threads App ID' and 'Threads App Secret' (Show) into your password manager.
5. App roles → Roles → 'Add people' → 'Threads Tester' → your Threads username → Add.
6. Accept the invite: Threads app → Profile → ☰ → Settings → Account → 'Website permissions' → 'Invites' → Accept (or threads.com on web, same path). Confirm: invite disappears and the app shows under Active.
7. Optional shortcut: use case page → 'User Token Generator' (label may differ) → 'Generate Access Token' next to your tester profile → approve → copy the token (exchange to long-lived via agent).
8. Otherwise open the agent's sign-in link (threads.net/oauth/authorize…) → 'Allow'.
9. Hand THREADS_APP_ID, THREADS_APP_SECRET and the token (if generated) to the agent via a secret store.
10. Verify: ask the agent to run the test call and confirm your username comes back.

**Hand over to the agent (store as secrets)**
- `THREADS_APP_ID`: Use cases → Access the Threads API → Settings _(sensitivity: Low)_
- `THREADS_APP_SECRET`: Same page → Threads App Secret → Show _(sensitivity: High)_
- `THREADS_ACCESS_TOKEN`: Agent's OAuth flow or User Token Generator (exchange to 60-day token) _(sensitivity: Critical)_
- `THREADS_USER_ID`: GET /me?fields=id _(sensitivity: Low)_

**Agent does**
1. Auth: send https://threads.net/oauth/authorize?client_id=<THREADS_APP_ID>&redirect_uri=<url>&scope=threads_basic,threads_content_publish&response_type=code&state=<rand> → POST https://graph.threads.net/oauth/access_token (form) client_id, client_secret, grant_type=authorization_code, redirect_uri, code → short-lived token + user_id.
2. Long-lived: GET https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=<secret>&access_token=<short> → {access_token, expires_in≈5184000 (60 d)}.
3. Refresh (token ≥24 h old, unexpired): GET https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=<token> weekly/monthly; alert human if it fails.
4. Create container: POST https://graph.threads.net/v1.0/{user-id}/threads with Authorization: Bearer <token>, params {"media_type":"TEXT","text":"Hello (≤500 chars)"}; image {"media_type":"IMAGE","image_url":"https://cdn…/a.jpg","text":"…"}; video {"media_type":"VIDEO","video_url":"…"}; extras link_attachment, poll_attachment (text posts, 2–4 options), quote_post_id, reply_to_id. Carousel: children with is_carousel_item=true, then {"media_type":"CAROUSEL","children":"id1,id2"} (2–20 items). Keep id.
5. Wait: ~30 s for media; poll GET https://graph.threads.net/v1.0/{container-id}?fields=status,error_message until FINISHED (ERROR/EXPIRED → stop).
6. Publish: POST https://graph.threads.net/v1.0/{user-id}/threads_publish with creation_id=<container-id> → id (media id); permalink via GET /{media-id}?fields=permalink.
7. Scheduling: no publish-time parameter — the agent's scheduler runs create+publish at the due time.
8. Limits: GET /{user-id}/threads_publishing_limit?fields=quota_usage,config → 250 posts and 1,000 replies per rolling 24 h; deletes 100/day. On HTTP 429 / code 4 back off exponentially.
9. Idempotency: store job → container → media id; never publish the same container twice; after a timeout GET /{user-id}/threads?fields=id,text,timestamp&limit=5 and compare text.

**Test:** GET https://graph.threads.net/v1.0/me?fields=id,username&access_token=<token> → 200 {"id":"<user id>","username":"<you>"}. Then GET /{user-id}/threads_publishing_limit?fields=quota_usage,config → {"data":[{"quota_usage":0,"config":{"quota_total":250,"quota_duration":86400}}]}. Optional: publish TEXT 'test' then DELETE https://graph.threads.net/v1.0/<media-id> (needs threads_delete) → {"success":true,"deleted_id":"…"}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| OAuth error 'Invalid redirect_uri' | Redirect not exactly listed in Threads settings | Add exact URL (scheme, path, trailing slash) under Redirect Callback URLs |
| 'The user has not accepted the invite to test the app' | Threads Tester invite pending | Accept in Threads → Settings → Account → Website permissions → Invites |
| Container status ERROR | Media URL not public or unsupported format | Serve JPEG/PNG or MP4 (H.264/AAC) over public HTTPS |
| Error 190 token expired | 60-day token not refreshed | Re-run OAuth; schedule refresh |
| Publish fails 'media not ready' | Published before FINISHED | Poll status and wait ~30 s |

**Notes:** Works for your own (tester) account without App Review. 60-day token must be refreshed. 500-char text limit; one topic tag per post. Native in-app scheduler exists for single posts.

**Alternative:** 1) Native: Threads composer → ••• → 'Schedule' → pick date/time. 2) Or Buffer/Publer/Sprout/Ayrshare connected to Threads. 3) The agent sends the post via that scheduler's API. 4) Quick manual: agent sends a link https://www.threads.com/intent/post?text=<urlencoded> for one-tap compose.

## Weibo
_Route: `official_api_own_account`_ · Docs: https://open.weibo.com/wiki/

**Before you start**
- Weibo account bound to a mobile number (mainland +86 number strongly recommended).
- Weibo Open Platform developer registration with real-name verification (individual: Chinese ID; enterprise: business license). Non-Chinese individuals may be unable to pass (unverified).
- A website domain you control (ICP filing likely expected for review (unverified)); it becomes the app's 'secure domain' and every API post must contain a link to it.
- Website app (网站接入) - the developer's own account can authorize it while it is unreviewed/test status (reported).
- Free; no API fees.

**Human does**
1. Open https://open.weibo.com and log in with the Weibo account (scan QR with the Weibo app or password + SMS).
2. Click '开发者' / '成为开发者' (Become developer) -> fill developer info: type 个人 (individual) or 企业 (enterprise), name, ID number, contact phone/e-mail, website -> submit for real-name verification. Wait for approval (1-3 working days, unverified).
3. Top menu 微连接 -> 网站接入 (Website access) -> '立即接入' -> enter app name, choose 网站 type -> create. Copy App Key and App Secret from 我的应用 -> app -> 应用信息 -> 基本信息.
4. Verify domain ownership: 应用信息 -> 基本信息 -> 网站地址 -> Weibo shows a <meta property="wb:webmaster" content="..."> tag; add it to your homepage <head> and click 验证 (Verify).
5. Same page: 安全域名 (secure domain) -> edit -> enter your domain (e.g. example.com) -> save. This is the domain every API post must link to.
6. 应用信息 -> 高级信息 -> OAuth2.0 授权设置 -> 授权回调页 (callback) = https://example.com/weibo/callback and 取消授权回调页 = same -> save.
7. Leave the app in test status (or submit 审核 if you need other users); the developer account itself can authorize. Optionally add other accounts under 应用信息 -> 测试信息 -> 测试账号 (label may differ).
8. Open the agent's link https://api.weibo.com/oauth2/authorize?client_id=APP_KEY&redirect_uri=CALLBACK&response_type=code -> log in -> 授权 (Authorize). Copy the ?code=... from the callback URL to the agent within minutes.
9. Confirm: Weibo -> 设置 -> 账号安全/授权管理 (Authorized apps) lists the app (label may differ).

**Hand over to the agent (store as secrets)**
- `WEIBO_APP_KEY`: open.weibo.com -> 我的应用 -> app -> 基本信息. _(sensitivity: low)_
- `WEIBO_APP_SECRET`: Same page (App Secret). _(sensitivity: high)_
- `WEIBO_REDIRECT_URI`: 高级信息 -> 授权回调页. _(sensitivity: low)_
- `WEIBO_SECURE_DOMAIN`: 基本信息 -> 安全域名. _(sensitivity: low)_
- `WEIBO_ACCESS_TOKEN`: From the agent's code exchange. _(sensitivity: high)_

**Agent does**
1. Exchange code: POST https://api.weibo.com/oauth2/access_token form client_id=APP_KEY&client_secret=APP_SECRET&grant_type=authorization_code&code=CODE&redirect_uri=CALLBACK -> keep access_token, expires_in, uid.
2. Check token: POST https://api.weibo.com/oauth2/get_token_info access_token=.. -> expire_in (seconds left). No refresh token for web apps; when <7 days left, send the human the authorize link again.
3. Prepare text: <=140 Chinese chars incl. the link; always include a URL on WEIBO_SECURE_DOMAIN (e.g. the blog post URL); no #hashtags; URL-encode.
4. Post: POST https://api.weibo.com/2/statuses/share.json multipart/form-data: access_token=..&status=URL_ENCODED_TEXT&pic=@image.jpg (optional, one image) -> keep id/idstr and created_at.
5. Scheduling: no API parameter - the agent keeps the queue and calls share at the desired Beijing time (UTC+8).
6. Idempotency: store idstr per item; before a retry after a timeout, GET https://api.weibo.com/2/statuses/user_timeline.json?access_token=..&count=5 (if still permitted for the app (unverified)) and compare text; otherwise do not auto-retry.
7. Limits: frequency limits undisclosed; post at most a few times per hour; on error 10022/10023/10024 (IP/user request limit) wait 1 hour; on 21327/21332 (token expired/invalid) re-authorize.

**Content specs:** API (statuses/share): text URL-encoded, <=140 Chinese characters, must contain at least one URL on the bound secure domain (else error 10017), hashtags not allowed per reports; one image per post (JPEG/PNG/GIF, under 5 MB (unverified)).; Native app/web composer: up to 2,000 characters for normal posts (longer for members) (unverified), up to 9 images (18 for some accounts (unverified)), video upload, #话题# hashtags with two # signs, links shortened to t.cn.; Native timed post (定时微博) available in web composer/app (some quotas tied to membership (unverified)).

**Test:** POST https://api.weibo.com/oauth2/get_token_info with access_token=TOKEN -> {"uid":...,"appkey":"...","scope":null,"create_at":...,"expire_in":...} (no post).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 10017 'appkey not bind domain' | Text lacks a link on the secure domain or domain not set | Set 安全域名 and include https://SECURE_DOMAIN/... in status. |
| 21327 expired_token | Access token lifetime ended | Re-run authorize link; exchange new code. |
| 10014 / insufficient app permissions | App not verified or developer not real-name verified | Complete developer verification; check app status. |
| Text rejected / 20019 repeated content | Duplicate of a recent post | Change text; never re-post identical content. |

**Notes:** Only statuses/share remains for writing for normal apps; no video/article/schedule API. Posts must link to your own domain - suits cross-posting a blog. Token lifetime depends on app level (developer's own authorization reportedly long-lived, up to years) (unverified). Real-name/phone requirements effectively need Chinese identity.

**Alternative:** 1) Native web: weibo.com -> composer -> image/video icons -> clock icon '定时' (timed post) -> choose time -> 发送 (label may differ). 2) Weibo app: + -> 写微博 -> ... -> 定时发布. 3) Agent prepares 140-char and long variants plus images in a daily checklist.

## X (Twitter)
_Route: `official_api_own_account`_ · Docs: https://docs.x.com/x-api/getting-started/pricing

**Before you start**
- An X account that will post (the one you want the posts to appear on), with a confirmed email and phone number.
- X developer access via the Developer Console https://console.x.com (developer.x.com redirects there). Accept the Developer Agreement; no app review for posting to your own account.
- Paid usage: since 6 Feb 2026 new developers get pay-per-use credits only (no free tier; legacy Basic $200/mo and Pro $5,000/mo closed to new signups). Prepaid credits are bought in the Console; post create ~$0.015/request, post containing a URL ~$0.20/request, reads ~$0.005/post, reads capped at 2M/month. The Console's pricing page is the source of truth.
- A payment card for credits; budget e.g. $5-10 to start.
- Somewhere the agent can receive the OAuth redirect once (e.g. a local listener at http://127.0.0.1:8765/callback) and a place to store secrets (password manager or .env).
- Optional: X Premium if you also want to use mobile/X Pro native scheduling (web composer scheduling works without it).

**Human does**
1. 1. Open https://console.x.com in a desktop browser and sign in with the X account that will post. If prompted, accept the Developer Agreement and policy, and describe your use case in plain words, e.g. 'Posting my own content to my own account with a personal script; no data resale, no automated replies.' Confirm: you land on the Console dashboard.
2. 2. Click 'New App' (or Projects & Apps > Create App; label may differ). Name it e.g. 'my-poster-2026' and add a short description. Save. Confirm: the app appears in your apps list.
3. 3. Billing: open Billing / Credits in the Console sidebar (label may differ) > add a payment method > buy credits (start with $5-10). Optionally set a monthly spending cap/auto-recharge OFF so a bug cannot drain your card. Confirm: credit balance shows > $0.
4. 4. Open the app > Settings > 'User authentication settings' > 'Set up' (label may differ). Set: App permissions = 'Read and write' (add 'Direct messages' only if needed); Type of App = 'Web App, Automated App or Bot' (confidential client, gives a Client Secret); Callback URI / Redirect URL = exactly the URL the agent gives you, e.g. http://127.0.0.1:8765/callback; Website URL = your site or https://x.com/<yourhandle>. Click Save. Confirm: the page shows OAuth 2.0 enabled with Read and write.
5. 5. Open the app > 'Keys and tokens'. Under 'OAuth 2.0 Client ID and Client Secret' click Generate/Regenerate, copy the Client ID and Client Secret into your password manager immediately (the secret is shown once). Do not paste them in chat apps; hand them to the agent via its secret store/.env.
6. 6. Give the agent X_CLIENT_ID, X_CLIENT_SECRET and X_REDIRECT_URI (the exact callback you entered in step 4; a single character mismatch breaks the login).
7. 7. When the agent prints an authorization link (starts with https://x.com/i/oauth2/authorize?...), open it in a browser where you are logged in as the posting account, check the requested permissions (read/write posts, upload media, stay connected) and click 'Authorize app'. The browser redirects to your callback; the agent captures the code. Confirm: the agent reports your @handle from /2/users/me.
8. 8. Approve a single test post if the agent asks (costs ~$0.015) and check it on your profile; the agent can delete it afterwards.
9. 9. Optional (only if the account is an automated bot account rather than you scheduling your own posts): on x.com go to Settings and privacy > Your account > Account information > Automation, choose the managing account and confirm so the 'Automated' label shows.
10. 10. Every month: check Console > Usage/Billing for spend; top up credits before they run out (posting fails when the balance is 0).
11. 11. If you ever need to revoke access: x.com > Settings and privacy > Security and account access > Apps and sessions > Connected apps > your app > Revoke; then regenerate the Client Secret in the Console.

**Hand over to the agent (store as secrets)**
- `X_CLIENT_ID`: console.x.com > your App > Keys and tokens > OAuth 2.0 Client ID _(sensitivity: low-medium (identifies the app, not secret alone))_
- `X_CLIENT_SECRET`: console.x.com > your App > Keys and tokens > OAuth 2.0 Client Secret (shown once; regenerate if lost) _(sensitivity: high)_
- `X_REDIRECT_URI`: The Callback URI you entered in User authentication settings (must match exactly) _(sensitivity: low)_
- `X_REFRESH_TOKEN`: Produced by the agent after you click 'Authorize app'; rotates on every refresh, agent stores the newest _(sensitivity: high (grants posting on your account))_

**Agent does**
1. 1. Build PKCE: code_verifier = 43-128 random URL-safe chars; code_challenge = BASE64URL(SHA256(verifier)); state = random. Send the user to: GET https://x.com/i/oauth2/authorize?response_type=code&client_id={X_CLIENT_ID}&redirect_uri={urlencoded X_REDIRECT_URI}&scope=tweet.read%20tweet.write%20users.read%20media.write%20offline.access&state={state}&code_challenge={challenge}&code_challenge_method=S256. Verify returned state matches. (offline.access is required to get a refresh token; media.write for uploads.)
2. 2. Exchange code: POST https://api.x.com/2/oauth2/token, headers: Content-Type: application/x-www-form-urlencoded, Authorization: Basic base64(client_id:client_secret); body: code={code}&grant_type=authorization_code&redirect_uri={X_REDIRECT_URI}&code_verifier={verifier}. Keep access_token, refresh_token, expires_in (7200 s), scope. Store expires_at = now + expires_in.
3. 3. Identity check: GET https://api.x.com/2/users/me, header Authorization: Bearer {access_token}. Keep data.id and data.username; refuse to post if username differs from the expected handle.
4. 4. Media (images, GIF, video): POST https://api.x.com/2/media/upload/initialize with Bearer token, JSON {"media_type":"video/mp4","total_bytes":12345678,"media_category":"tweet_video"} (tweet_image / tweet_gif for others) -> keep data.id (media_id). Then for each chunk (e.g. 4 MB): POST https://api.x.com/2/media/upload/{media_id}/append as multipart/form-data with fields media=<binary chunk>, segment_index=0,1,2... Then POST https://api.x.com/2/media/upload/{media_id}/finalize. If the response contains processing_info (state pending/in_progress), wait check_after_secs and poll GET https://api.x.com/2/media/upload?command=STATUS&media_id={media_id} until state = succeeded (failed -> report error). Small images may use one-shot POST https://api.x.com/2/media/upload (multipart media=..., media_category=tweet_image). Add alt text if supported by your SDK (unverified for v2 endpoint name).
5. 5. Create the post: POST https://api.x.com/2/tweets, headers Authorization: Bearer {token}, Content-Type: application/json; body {"text":"Hello from my scheduler","media":{"media_ids":["1880000000000000000"]}}. Thread: next post body adds "reply":{"in_reply_to_tweet_id":"<previous data.id>"}. Poll: "poll":{"options":["A","B"],"duration_minutes":1440} (no media with polls). Keep data.id and data.text; URL = https://x.com/{username}/status/{id}.
6. 6. Scheduling: the API has no publish-at field. Keep a local queue (id, due_at UTC, text, media paths, status) and run a cron/worker every minute that posts items whose due_at <= now, marking them 'sending' before the call and 'sent' with the returned id after (prevents double posts on crash).
7. 7. Token refresh: when now > expires_at - 5 min or on HTTP 401: POST https://api.x.com/2/oauth2/token with Basic auth and body grant_type=refresh_token&refresh_token={X_REFRESH_TOKEN}. Persist the NEW refresh_token atomically before using the new access token (refresh tokens are single-use; losing the newest forces the user to re-authorize).
8. 8. Rate limits and costs: POST /2/tweets is limited per user (search snippets of docs.x.com cite 100-200 requests/15 min per user plus a 300 posts/3 h combined post+repost cap; unverified exact numbers). On 429 read x-rate-limit-reset (epoch seconds) and sleep until then; exponential backoff (2,4,8... s, max 5 tries) on 5xx. Treat 402/403 credit errors as 'top up credits' and stop. Check Console usage before bulk runs; avoid URLs in posts unless the user accepts ~$0.20/post.
9. 9. Idempotency: X rejects exact duplicate text (403 'duplicate content'). Store a hash of (text + media) per sent item; never resend an item in 'sent' state; if a call times out, GET https://api.x.com/2/users/{id}/tweets?max_results=5 to check whether it was published before retrying.
10. 10. Deleting a mistaken post: DELETE https://api.x.com/2/tweets/{id} with Bearer token -> {"data":{"deleted":true}}.

**Test:** GET https://api.x.com/2/users/me with header 'Authorization: Bearer {access_token}' -> 200 {"data":{"id":"...","name":"...","username":"yourhandle"}} (read call, ~$0.005-0.01 or less; no post created). Optional publish test: POST https://api.x.com/2/tweets {"text":"API test 2026-10-07T12:00Z"} -> 201 {"data":{"id":"...","text":"API test ..."}} (~$0.015), then DELETE https://api.x.com/2/tweets/{id}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 401 Unauthorized on POST /2/tweets | Access token expired (2 h) or was issued without tweet.write | Refresh with grant_type=refresh_token; if scope lacks tweet.write/media.write, re-run the authorize URL with the full scope list |
| 400 invalid_request 'Value passed for the token was invalid' on refresh | An older (already used) refresh token was sent; tokens rotate on each refresh | Use the newest stored refresh token; if lost, have the user click the authorize link again |
| 403 'You are not permitted to perform this action' / app permission error | App permissions still 'Read' or user authorized before permissions were changed to Read and write | Set Read and write in User authentication settings, then re-authorize the user |
| 402/403 mentioning credits or usage cap | Prepaid credit balance exhausted or spend cap reached | Human buys credits in console.x.com Billing; agent pauses the queue until balance > 0 |
| 403 duplicate content | Same text was already posted recently | Change the text (e.g. add a detail) or skip the item; never auto-append random characters without user consent |
| Redirect error 'Something went wrong' on authorize page | redirect_uri not exactly equal to the registered Callback URI, or PKCE mismatch | Copy the Callback URI character for character (http vs https, trailing slash, 127.0.0.1 vs localhost) |

**Notes:** No free tier for new developers since Feb 2026; prepaid credits required. Posts with URLs cost ~13x more (~$0.20). Access tokens last 2 h; refresh tokens are single-use and rotate. Scopes are fixed at authorization time. No API scheduling (agent queue needed). The 'Automated' label is for bot accounts, not for a person scheduling their own posts. Several third-party schedulers now charge an X add-on (e.g. Vista Social $29/mo per X profile since 1 Mar 2026). docs.x.com was blocked from this environment; endpoint and pricing facts come from search snippets of docs.x.com pages.

**Alternative:** Use a scheduler that already pays for X access: (1) Sign up for Typefully, Buffer or Postiz and connect X via 'Add channel > X' (log in and authorize). (2) For Postiz: Settings > Developers > Public API > copy the key; agent calls GET https://api.postiz.com/public/v1/integrations (header 'Authorization: <key>') to get the X integration id. (3) Agent schedules with POST https://api.postiz.com/public/v1/posts {"type":"schedule","date":"2026-10-10T15:00:00.000Z","shortLink":false,"tags":[],"posts":[{"integration":{"id":"<x-id>"},"value":[{"content":"Hello","image":[]}],"settings":{"__type":"x","who_can_reply_post":"everyone"}}]}. (4) Check whether the tool charges an X add-on before committing (some self-hosted tools require your own X API keys - unverified for Postiz cloud).

## Flickr
_Route: `official_api_own_account`_ · Docs: https://www.flickr.com/services/api/

**Before you start**
- A Flickr account with an active Flickr Pro subscription (requesting API keys is limited to Pro members; price varies by region/billing cycle, see https://www.flickr.com/account/upgrade/pro).
- Non-Commercial API key is self-serve; Commercial keys are reviewed.
- OAuth 1.0a signing capability on the agent side (HMAC-SHA1).
- Free accounts are limited to 1,000 photos/videos total; Pro removes that cap.

**Human does**
1. 1. Sign in at https://www.flickr.com/signin. If not Pro, go to https://www.flickr.com/account/upgrade/pro, pick monthly or yearly, pay, and confirm 'Pro' appears on your profile.
2. 2. Open https://www.flickr.com/services/apps/create and click 'Request an API Key'.
3. 3. Click 'Apply for a Non-Commercial Key'. Fill 'What's the name of your app?' = 'My uploader', 'What are you building?' = 'Personal uploader for my own photos'. Tick both acknowledgement boxes and click 'Submit'.
4. 4. The next page shows 'Key' and 'Secret'. Copy them into your password manager as FLICKR_API_KEY and FLICKR_API_SECRET.
5. 5. Open https://www.flickr.com/services/apps/by/me (The App Garden → Your apps), click your app → 'Edit authentication flow' (label may differ). Set App Type = 'Web Application' and Callback URL = the URL the agent gives you, or leave blank if the agent uses out-of-band (oob) verifier codes. Save.
6. 6. Ask the agent to start authorization. It shows a link like https://www.flickr.com/services/oauth/authorize?oauth_token=...&perms=write. Open it while logged in.
7. 7. Click 'OK, I'll authorize it'. With oob you see a 9-digit verifier code (e.g. 123-456-789): paste it to the agent. With a callback, the agent catches it automatically.
8. 8. The agent stores FLICKR_OAUTH_TOKEN and FLICKR_OAUTH_TOKEN_SECRET and runs flickr.test.login; confirm it reports your username.
9. 9. Optional: create an album at https://www.flickr.com/photos/me/albums and copy the album id from the URL as FLICKR_PHOTOSET_ID.
10. 10. To revoke: https://www.flickr.com/services/auth/list.gne (Account → Sharing & Extending → Apps, label may differ) → Remove permission.

**Hand over to the agent (store as secrets)**
- `FLICKR_API_KEY`: App Garden → your app (Key) _(sensitivity: Medium)_
- `FLICKR_API_SECRET`: App Garden → your app (Secret) _(sensitivity: High)_
- `FLICKR_OAUTH_TOKEN`: Returned by access_token exchange _(sensitivity: High — write access to your photos)_
- `FLICKR_OAUTH_TOKEN_SECRET`: Returned by access_token exchange _(sensitivity: High)_
- `FLICKR_PHOTOSET_ID`: Optional, album URL _(sensitivity: Low)_

**Agent does**
1. 1. Request token: GET https://www.flickr.com/services/oauth/request_token with OAuth 1.0a params oauth_consumer_key, oauth_nonce, oauth_timestamp, oauth_signature_method=HMAC-SHA1, oauth_version=1.0, oauth_callback=oob (or URL), signed with API secret + '&' → keep oauth_token, oauth_token_secret.
2. 2. Send the human to https://www.flickr.com/services/oauth/authorize?oauth_token=<token>&perms=write; receive oauth_verifier.
3. 3. Access token: GET https://www.flickr.com/services/oauth/access_token (signed with consumer secret & request-token secret, include oauth_verifier) → keep oauth_token, oauth_token_secret, user_nsid, username. Tokens do not expire (until revoked) — no refresh step.
4. 4. Upload: POST https://up.flickr.com/services/upload/ multipart/form-data with fields photo=<file>, title, description, tags='a b "two words"', is_public=0|1, is_friend, is_family, safety_level=1, content_type=1, hidden=1|2, async=0|1 plus OAuth params. Sign every param EXCEPT 'photo'. Response is XML <rsp stat="ok"><photoid>123</photoid></rsp> (or <ticketid> with async=1).
5. 5. Async check: POST https://api.flickr.com/services/rest/ method=flickr.photos.upload.checkTickets&tickets=<id>&format=json&nojsoncallback=1 (signed) until complete=1 → photoid.
6. 6. Album: POST https://api.flickr.com/services/rest/ method=flickr.photosets.addPhoto&photoset_id=$FLICKR_PHOTOSET_ID&photo_id=<id>&format=json&nojsoncallback=1 (signed), or flickr.photosets.create&title=...&primary_photo_id=<id>.
7. 7. Scheduling (no native API field): upload with is_public=0, store {photo_id, publish_at}; at publish_at call flickr.photos.setPerms&photo_id=..&is_public=1&is_friend=0&is_family=0 (signed, POST); optionally flickr.photos.setDates&date_posted=<unix> to set the posted date.
8. 8. Rate limit: 3,600 queries/hour per API key (all users combined); keep ≥1 s between calls, on 'Service unavailable'/429 back off exponentially; abuse can disable the key.
9. 9. Idempotency: compute a hash of the file and add it as a machine tag (e.g. agent:sha1=<hash>); before uploading search flickr.photos.search&user_id=me&machine_tags=agent:sha1=<hash> and skip if found.

**Test:** Signed GET https://api.flickr.com/services/rest/?method=flickr.test.login&format=json&nojsoncallback=1 → {"user":{"id":"12345678@N00","username":{"_content":"you"}},"stat":"ok"}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 'Invalid signature' (code 96/oauth_problem=signature_invalid) | Signing included 'photo', wrong param encoding/ordering, or wrong secret | Sort params, RFC3986-encode, exclude photo from the base string, use consumer_secret&token_secret |
| 'Insufficient permissions' (code 99) | Token authorized with read only | Re-authorize with perms=write |
| Cannot request a key | Account not Pro | Subscribe to Pro first |
| Upload fails for large video | Exceeds account file size/duration limits | Check Flickr help for current limits (unverified: ~1 GB video); compress |
| 'Invalid API Key' (code 100) | Key disabled or mistyped | Check App Garden; request a new key |

**Notes:** API key requests require Flickr Pro; behaviour of existing keys if Pro lapses is unverified. OAuth 1.0a tokens do not expire. 3,600 queries/hour per key. No native or API scheduling — use private upload + setPerms later. Upload response is XML even if you ask for JSON elsewhere.

**Alternative:** Manual: https://www.flickr.com/photos/upload (web uploader) or the Flickr mobile app. Agent can prepare files + captions and remind the human at the posting time; no audited third-party scheduler with Flickr support was found.

## Pixelfed
_Route: `official_api_own_account`_ · Docs: https://docs.pixelfed.org/

**Before you start**
- An account on a Pixelfed server (e.g. pixelfed.social); free.
- Video posting only if the server admin enabled video MIME types.
- No review; Personal Access Token from your settings.

**Human does**
1. 1. Sign in to your Pixelfed server in a browser (e.g. https://pixelfed.social).
2. 2. Open https://<your-server>/settings/applications (avatar menu -> Settings -> Applications; label may differ).
3. 3. In the Personal Access Tokens section click Create New Token.
4. 4. Name: 'posting-agent'. Scopes: tick read and write (label may differ). Click Create.
5. 5. Copy the token immediately (shown once) and store it as PIXELFED_ACCESS_TOKEN.
6. 6. Note your server URL as PIXELFED_INSTANCE_URL.
7. 7. Check the server's limits on https://<your-server>/site/about or ask the agent to read /api/v1/instance (max photos per post, file size, video allowed).
8. 8. Hand both values to the agent via your secret store.
9. 9. Confirm: the agent calls verify_credentials and reports your username; optionally posts a test photo you then see on your profile.
10. 10. To revoke: same Applications page -> Personal Access Tokens -> Delete/Revoke next to the token.

**Hand over to the agent (store as secrets)**
- `PIXELFED_INSTANCE_URL`: Your server address _(sensitivity: Low)_
- `PIXELFED_ACCESS_TOKEN`: Settings -> Applications -> Personal Access Tokens -> Create New Token (shown once) _(sensitivity: High - posts and acts as you; long-lived (expiry unverified))_

**Agent does**
1. 1. All calls: Authorization: Bearer $PIXELFED_ACCESS_TOKEN, Accept: application/json (Pixelfed requires auth even for reads). No refresh flow for personal tokens; 401 -> ask for a new token.
2. 2. GET /api/v1/instance -> configuration.statuses.max_characters (500 default), max_media_attachments (4 default), configuration.media_attachments.supported_mime_types and image_size_limit (15 MB default).
3. 3. Media: POST /api/v1/media multipart: file=@photo.jpg, description='alt text' -> {id, url, type}. (POST /api/v2/media also exists.) Repeat per image of a carousel.
4. 4. Post: POST /api/v1/statuses, Idempotency-Key: <uuid> (support unverified), JSON {"status":"Caption #photography","media_ids":["123","124"],"visibility":"public","sensitive":false} -> Status {id, url}. Top-level posts must include media; visibility 'direct' is rejected.
5. 5. Scheduling: no scheduled_at in Pixelfed - keep an agent-side queue; record returned id per queue item before marking done to avoid duplicates.
6. 6. Limits: default 1,000 statuses/day and 1,250 media uploads/day per account (instance-configurable). On 429 back off exponentially (start 60 s).
7. 7. Delete: DELETE /api/v1/statuses/:id.

**Test:** curl -s -H "Authorization: Bearer $PIXELFED_ACCESS_TOKEN" $PIXELFED_INSTANCE_URL/api/v1/accounts/verify_credentials -> 200 with your username (no post).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 422 on POST /api/v1/statuses with only text | Pixelfed needs media on top-level posts | Upload at least one image first |
| 422 / 'Invalid media type' on upload (wording may differ) | File type not allowed (e.g. video disabled, HEIC) | Convert to JPEG/PNG; ask admin about video |
| 401 Unauthenticated | Token revoked/wrong or missing Bearer prefix | Create a new token |
| 413 Payload Too Large | Photo above image_size_limit | Resize/compress under the instance limit |

**Notes:** Each server has its own token and limits. No native or API scheduling in core Pixelfed. Stories are not in the Mastodon-compatible API. Instance admins may change limits; always read /api/v1/instance.

**Alternative:** 1) Fedica or Postpone (third-party schedulers claiming Pixelfed support): add account -> Pixelfed -> server domain -> authorize. 2) Schedule there. 3) Otherwise post manually in the Pixelfed web or app.

## Apple Podcasts
_Route: `scheduler_or_automation_tool`_ · Docs: https://podcasters.apple.com/support/823-podcast-requirements

**Before you start**
- An Apple Account (free) with two-factor authentication, to sign in to Apple Podcasts Connect.
- A podcast host that publishes an RSS feed and has an API (example used: Buzzsprout — paid plans; price see buzzsprout.com/pricing). Any host or a self-hosted RSS feed also works.
- Show assets: artwork 1400x1400 to 3000x3000 px, JPEG/PNG, RGB, 72 dpi, no alpha; title, description, language, at least one category, owner email, explicit rating; at least one published episode.
- Apple review of a new show: typically 1–5 business days (up to ~2 weeks when busy).
- Subscriptions/premium episodes would need the Apple Podcasters Program and a Delegated Delivery host (not needed for free shows).

**Human does**
1. 1. Create a Buzzsprout account at https://www.buzzsprout.com, choose a plan, and create the show: title, description, category, language, explicit flag, owner email, and upload 3000x3000 JPG/PNG artwork (RGB, no transparency).
2. 2. Upload and publish at least one episode (Episodes → Upload a new episode → Publish) so the feed is valid.
3. 3. Copy the RSS feed URL (Buzzsprout: Podcast Settings / Directories → RSS feed, label may differ).
4. 4. Easiest: Buzzsprout → Directories → Apple Podcasts → follow the guided submit (label may differ). OR manually: sign in at https://podcastsconnect.apple.com with your Apple Account (2FA code on your device).
5. 5. Manual submit: click '+' → 'New Show' → 'Add a show with an RSS feed', paste the RSS URL, choose availability/countries, fill review contact info, click 'Submit' (label may differ).
6. 6. Wait for the approval email (typically 1–5 business days). In Podcasts Connect the show status changes to 'Published'; copy the Apple Podcasts show link.
7. 7. Get the API token: Buzzsprout → Profile → API. Copy the API token → BUZZSPROUT_API_TOKEN and the numeric podcast ID shown there → BUZZSPROUT_PODCAST_ID.
8. 8. Hand both to the agent and ask it to run GET /api/podcasts; confirm your show appears.
9. 9. After the agent's first scheduled episode goes live, open the Apple Podcasts app/show page and confirm the episode appears (can take a few hours; in Podcasts Connect you can 'Refresh feed' if needed, label may differ).
10. 10. To revoke: Buzzsprout → Profile → API → regenerate/reset token (label may differ).

**Hand over to the agent (store as secrets)**
- `BUZZSPROUT_API_TOKEN`: Buzzsprout → Profile → API _(sensitivity: High — full control of episodes)_
- `BUZZSPROUT_PODCAST_ID`: Buzzsprout → Profile → API (numeric podcast ID) or GET /api/podcasts _(sensitivity: Low)_

**Agent does**
1. 1. Headers on every Buzzsprout call: Authorization: Token token=$BUZZSPROUT_API_TOKEN; User-Agent: MyPodcastAgent/1.0 (identifiable — generic UAs may be blocked); Accept: application/json; Content-Type: application/json; charset=utf-8 for JSON bodies.
2. 2. GET https://www.buzzsprout.com/api/podcasts → confirm the numeric id matches BUZZSPROUT_PODCAST_ID.
3. 3. Create draft: POST https://www.buzzsprout.com/api/$ID/episodes {"title":"Ep 12: Title","description":"<p>Show notes</p>","private":true,"episode_number":12,"season_number":1,"explicit":false} → 201; keep id.
4. 4. Start upload: POST https://www.buzzsprout.com/api/$ID/episodes/{episode_id}/uploads {"filename":"ep12.mp3","type":"audio/mpeg","byte_size":12345678} (add "multipart":true for big files; required for video >5 GiB) → keep upload.id, upload.upload_url (or parts[] with url/content_length).
5. 5. PUT exactly byte_size bytes to upload_url (NO Buzzsprout Authorization header; URL valid 6 h). Multipart: PUT each part's byte range to parts[].url.
6. 6. Complete (mandatory): POST https://www.buzzsprout.com/api/$ID/episodes/{episode_id}/uploads/{upload_id}/complete → 200 with the episode.
7. 7. Poll GET https://www.buzzsprout.com/api/$ID/episodes/{episode_id} every 30 s until duration != -1 (encoding done).
8. 8. Publish or schedule: PATCH https://www.buzzsprout.com/api/$ID/episodes/{episode_id} {"private":false,"published_at":"2026-10-20T09:00:00-04:00"} — a future time schedules it; the RSS feed (and then Apple Podcasts, within hours) picks it up at that time.
9. 9. No token refresh (static API token). Rate limit 60 requests/min per token; retry 429 and 5xx with exponential backoff; do not retry 4xx validation errors unchanged. Use ETag/If-None-Match on polling GETs.
10. 10. Idempotency: persist episode id after step 3; before creating, GET https://www.buzzsprout.com/api/$ID/episodes and skip if an episode with the same title/episode_number exists; if an upload failed, start a new upload on the same episode rather than a new episode.

**Test:** GET https://www.buzzsprout.com/api/podcasts with headers Authorization: Token token=$BUZZSPROUT_API_TOKEN, User-Agent: MyPodcastAgent/1.0, Accept: application/json → 200 JSON array with your show(s) [{"id":123456,"title":"Your Show",...}].

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Episode published but no audio | Upload not completed | Call .../uploads/{upload_id}/complete; poll until duration != -1 |
| Upload fails at complete | PUT byte count differs from byte_size, or upload URL expired (>6 h) | Re-start upload with correct size and PUT promptly |
| 403/blocked requests | Generic User-Agent or wrong auth header format | Send identifiable User-Agent and 'Token token=' header |
| Episode not on Apple after a day | Apple feed crawl delay or show not yet approved | Check Podcasts Connect status; refresh feed; wait 24–48 h |
| Apple rejects the show | Artwork/feed requirements not met (size, RGB, missing email/category) | Fix artwork 1400–3000 px RGB and required feed tags; resubmit |

**Notes:** Apple has no public creator publishing API; episodes arrive via the RSS feed. Podcasts Connect API keys exist only for Delegated Delivery with participating hosts (e.g. Acast, ART19, Blubrry, Buzzsprout, Libsyn, Omny, RSS.com) and Apple Podcasters Program members. Self-hosted RSS also works: add an <item> with enclosure url/length/type, guid, pubDate, and host the MP3 on HTTPS with byte-range support.

**Alternative:** Self-hosted RSS: 1) agent uploads the MP3 to your own HTTPS storage (byte-range support), 2) appends an <item> (title, enclosure url/length/type, guid, pubDate, itunes:duration) to feed.xml, 3) publishes feed.xml at the scheduled time; Apple polls the feed. Or any other host with an API (e.g. Transistor, Libsyn) using the same create → upload → publish pattern (unverified per host).

## LinkedIn
_Route: `official_api_own_account`_ · Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin

**Before you start**
- A personal LinkedIn account (the profile that will post) with 2-step verification recommended.
- A LinkedIn Company Page you administer: every developer app must be associated with a Page (create a free small Page if you have none).
- LinkedIn developer app with the self-serve products 'Sign In with LinkedIn using OpenID Connect' and 'Share on LinkedIn' (instant, free, no review).
- Posting to a Company Page instead of your profile needs the Community Management API (separate app, business verification, review; weeks) - not covered here.
- No cost for the API. A browser to re-authorize every ~60 days (no refresh tokens for self-serve apps).

**Human does**
1. 1. If you have no Company Page: on linkedin.com click 'For Business' (grid icon, top right) > 'Create a Company Page' > choose 'Company' or 'Showcase' > fill Name, LinkedIn public URL, Website (optional), Industry, Size, Type > tick the verification box > 'Create page'. Confirm: you see the Page admin view.
2. 2. Go to https://www.linkedin.com/developers/apps and click 'Create app'. Fill: App name (e.g. 'My Poster'), LinkedIn Page (search and select your Page), Privacy policy URL (optional; your site), App logo (square PNG/JPG, required), tick 'I have read and agree to these terms' > 'Create app'.
3. 3. Settings tab > 'App settings' > next to the Page click 'Verify' > 'Generate URL' > open that URL yourself (as Page admin) and click 'Verify'. Confirm: Settings shows the Page as Verified.
4. 4. Products tab > find 'Share on LinkedIn' > 'Request access' > tick the terms > 'Request access'. Repeat for 'Sign In with LinkedIn using OpenID Connect'. Confirm: both appear under 'Added products' (instant).
5. 5. Auth tab > 'OAuth 2.0 settings' > 'Authorized redirect URLs for your app' > pencil icon > 'Add redirect URL' > paste the agent's URL exactly (e.g. http://localhost:8765/callback) > Update. Confirm: 'OAuth 2.0 scopes' list shows openid, profile, w_member_social (and email).
6. 6. Auth tab > 'Application credentials': copy the Client ID and click the eye icon to reveal and copy the Primary Client Secret into your password manager. Hand both plus the redirect URL to the agent.
7. 7. When the agent sends a link starting https://www.linkedin.com/oauth/v2/authorization?..., open it while logged into your personal LinkedIn, review 'Create, modify, and delete posts... on your behalf' and click 'Allow'. Confirm: the agent reports your name from /v2/userinfo.
8. 8. Optional test: approve one test post (visibility CONNECTIONS or PUBLIC) and check it on your profile's Activity tab; delete it from the post's '...' menu if wanted.
9. 9. Put a calendar reminder at day 55: the agent will send a fresh authorization link; repeat step 7 (no password sharing needed).
10. 10. To revoke later: linkedin.com > Me > Settings & Privacy > Data privacy > 'Permitted services' (label may differ) > remove the app; and/or Auth tab > regenerate the secret.

**Hand over to the agent (store as secrets)**
- `LINKEDIN_CLIENT_ID`: linkedin.com/developers/apps > your app > Auth tab > Application credentials > Client ID _(sensitivity: low-medium)_
- `LINKEDIN_CLIENT_SECRET`: Same place > Primary Client Secret (eye icon); can be regenerated _(sensitivity: high)_
- `LINKEDIN_REDIRECT_URI`: Auth tab > Authorized redirect URLs (exact string) _(sensitivity: low)_
- `LINKEDIN_ACCESS_TOKEN`: Produced by the agent after you click 'Allow'; valid 60 days (expires_in 5184000) _(sensitivity: high (can post as you))_
- `LINKEDIN_PERSON_URN`: Agent derives urn:li:person:{sub} from /v2/userinfo _(sensitivity: low)_

**Agent does**
1. 1. Authorization URL: GET https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={id}&redirect_uri={urlencoded uri}&state={random}&scope=openid%20profile%20w_member_social (add %20email if wanted). Validate state on return.
2. 2. Token exchange: POST https://www.linkedin.com/oauth/v2/accessToken, Content-Type: application/x-www-form-urlencoded, body grant_type=authorization_code&code={code}&redirect_uri={uri}&client_id={id}&client_secret={secret}. Keep access_token, expires_in (5184000 s = 60 days), scope, id_token. No refresh_token is returned for self-serve apps.
3. 3. Identity: GET https://api.linkedin.com/v2/userinfo, Authorization: Bearer {token}. Keep sub -> author = urn:li:person:{sub}; name for confirmation.
4. 4. Common headers for /rest calls: Authorization: Bearer {token}; LinkedIn-Version: 202609 (YYYYMM; latest seen Sept 2026; versions are supported about 1 year, e.g. 202510 sunsets 15 Oct 2026 - keep the value current); X-Restli-Protocol-Version: 2.0.0; Content-Type: application/json.
5. 5. Image: POST https://api.linkedin.com/rest/images?action=initializeUpload body {"initializeUploadRequest":{"owner":"urn:li:person:{sub}"}} -> keep value.uploadUrl and value.image (urn:li:image:...). Then PUT the raw bytes to uploadUrl (header Authorization: Bearer {token}; Content-Type: application/octet-stream). Image is usable once status AVAILABLE (GET https://api.linkedin.com/rest/images/{urlencoded urn}).
6. 6. Video: POST https://api.linkedin.com/rest/videos?action=initializeUpload body {"initializeUploadRequest":{"owner":"urn:li:person:{sub}","fileSizeBytes":12345678,"uploadCaptions":false,"uploadThumbnail":false}} -> value.video, value.uploadToken, value.uploadInstructions[] (each with uploadUrl, firstByte, lastByte). PUT each byte range to its uploadUrl and keep each response's ETag. Then POST https://api.linkedin.com/rest/videos?action=finalizeUpload body {"finalizeUploadRequest":{"video":"urn:li:video:...","uploadToken":"","uploadedPartIds":["etag1","etag2"]}}. Documents (PDF carousels): /rest/documents?action=initializeUpload similarly (field names per docs; unverified detail).
7. 7. Create post: POST https://api.linkedin.com/rest/posts with the headers above, body {"author":"urn:li:person:{sub}","commentary":"Text with escaped reserved chars","visibility":"PUBLIC","distribution":{"feedDistribution":"MAIN_FEED","targetEntities":[],"thirdPartyDistributionChannels":[]},"content":{"media":{"id":"urn:li:image:...","altText":"description"}},"lifecycleState":"PUBLISHED","isReshareDisabledByAuthor":false}. Link post: content {"article":{"source":"https://...","title":"...","description":"..."}}. Text-only: omit content. Expect 201; keep header x-restli-id (urn:li:share:... or urn:li:ugcPost:...). Post URL: https://www.linkedin.com/feed/update/{urn}/.
8. 8. Scheduling: the Posts API has no scheduled-publish field (lifecycleState PUBLISHED publishes now). Keep a local queue and post at due time; mark items 'sending' before and 'sent' with the URN after.
9. 9. Token lifecycle: store expires_at = now + 60 days. At day 55 send the user a fresh authorization link (step 1); on 401 stop the queue and request re-authorization. Programmatic refresh tokens (365 days) only exist for approved partner programs.
10. 10. Rate limits and errors: limits are not published per endpoint; check Developer Portal > your app > Analytics. Third-party reports cite roughly 100-150 posts/member/day (unverified). On 429 back off exponentially (30 s, 60 s, 120 s...). On 426/400 'version not active' bump LinkedIn-Version to a current month.
11. 11. Idempotency: LinkedIn may reject an identical repost (422 duplicate, unverified wording). Keep a content hash per sent item; if a call times out, GET https://api.linkedin.com/rest/posts?q=author&author={urlencoded urn}&count=5 (with headers) to check before retrying (finder availability for self-serve scope unverified).
12. 12. Text formatting: commentary uses 'little text' format; escape ( ) [ ] { } < > @ # * _ ~ | \ with a backslash or the post may be truncated.

**Test:** GET https://api.linkedin.com/v2/userinfo with 'Authorization: Bearer {token}' -> 200 {"sub":"abc123","name":"Your Name","given_name":...,"picture":...} (no post created).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 'The redirect_uri does not match the registered value' on the consent page | Redirect URL differs from the Auth tab entry | Add the exact URL (scheme, host, port, path) in Auth > Authorized redirect URLs |
| unauthorized_scope_error for w_member_social | 'Share on LinkedIn' product not added to the app | Products tab > Request access on Share on LinkedIn, then re-authorize |
| 401 after ~2 months | 60-day token expired; no refresh for self-serve apps | Send the user a new authorization link and replace LINKEDIN_ACCESS_TOKEN |
| 400/426 'Requested version 2025xx is not active' | LinkedIn-Version header sunset | Use a current YYYYMM (e.g. 202609) and re-test |
| Post text cut off after a parenthesis or hashtag looks wrong | Reserved characters in commentary not escaped | Backslash-escape little-text reserved characters |
| 403 when posting as a Company Page | w_organization_social needs Community Management API approval | Post as person, or apply for Community Management API in a separate app |

**Notes:** Free API. Personal-profile posting only with self-serve products; 60-day tokens, manual re-consent every ~2 months. No API scheduling. LinkedIn-Version header must be a supported month (sunset ~1 year). Native LinkedIn scheduler (clock icon in the composer) can schedule up to 3 months ahead if you prefer manual. learn.microsoft.com was blocked here; facts from search snippets of official pages.

**Alternative:** Use Postiz or Buffer which handle LinkedIn tokens: (1) Connect LinkedIn via 'Add channel > LinkedIn' and approve. (2) Postiz: copy API key from Settings > Developers > Public API; GET https://api.postiz.com/public/v1/integrations to find the linkedin integration id. (3) POST https://api.postiz.com/public/v1/posts with {"type":"schedule","date":"<ISO>","shortLink":false,"tags":[],"posts":[{"integration":{"id":"<id>"},"value":[{"content":"...","image":[]}],"settings":{"__type":"linkedin"}}]}. (4) Or schedule manually in LinkedIn's composer (clock icon, up to 3 months).

## Facebook Pages
_Route: `official_api_own_account`_ · Docs: https://developers.facebook.com/docs/pages-api/posts

**Before you start**
- A Facebook Page (not a personal profile) where you have Facebook access with full control or the 'Content' task.
- Facebook account registered as a Meta developer (free), 2FA enabled.
- Meta app with use case 'Manage everything on your Page'; Development mode works for your own Pages (Standard Access via app role).
- Privacy policy URL; public HTTPS media hosting (or upload binary via multipart/rupload).
- Free; App Review (Advanced Access) + Business Verification only to manage other people's Pages.

**Human does**
1. Check Page access: open your Page → 'Settings' → 'Page setup' → 'Page access' (label may differ) → your profile must be listed under 'People with Facebook access' with full control or 'Content' permission.
2. Open https://developers.facebook.com → 'Log in' with your Facebook account (enable 2FA first: Facebook → Settings & privacy → Accounts Center → Password and security → Two-factor authentication) → 'Get started' → accept the Platform Terms → verify phone/email by code → choose role 'Developer' → Complete registration. Confirm: the top bar shows 'My Apps'.
3. My Apps → 'Create app' → name 'my-posting-agent' + contact email → Use case 'Manage everything on your Page' → Business portfolio optional → Create app → re-enter password. Confirm: dashboard in Development mode.
4. Use cases → 'Manage everything on your Page' → 'Customize' → add permissions pages_show_list, pages_read_engagement, pages_manage_posts (and business_management if the Page belongs to a business portfolio) → each shows 'Ready for testing'.
5. App settings → Basic → copy 'App ID' and click 'Show' on 'App secret' (re-enter password) → store both. Add 'Privacy Policy URL' → 'Save changes'.
6. Tools → 'Graph API Explorer' (https://developers.facebook.com/tools/explorer/) → Meta App: select your app → 'User or Page': 'Get User Access Token' → Permissions: add pages_show_list, pages_read_engagement, pages_manage_posts → 'Generate Access Token' → in the Facebook dialog 'Opt in to all current and future Pages' or select your Page → Continue → Save.
7. Copy the token from the 'Access Token' field (short-lived, ~1–2 h) and immediately give it to the agent (it exchanges it for a long-lived one). Or open the Access Token Debugger (https://developers.facebook.com/tools/debug/accesstoken/) → paste → 'Extend Access Token' → copy the 60-day token.
8. Find the Page ID: Page → 'About' → 'Page transparency' → Page ID (or the agent reads it from /me/accounts).
9. Hand META_APP_ID, META_APP_SECRET, FB_USER_TOKEN and FB_PAGE_ID to the agent via a secret store.
10. Verify: in Graph API Explorer run GET me/accounts → your Page appears with an access_token.
11. Remember: changing your Facebook password or removing the app (Settings → Business integrations) invalidates the Page token — then repeat steps 6–9.

**Hand over to the agent (store as secrets)**
- `META_APP_ID`: App dashboard → App settings → Basic _(sensitivity: Low)_
- `META_APP_SECRET`: App settings → Basic → App secret → Show _(sensitivity: High)_
- `FB_USER_TOKEN`: Graph API Explorer → Generate Access Token (short-lived) or Access Token Debugger → Extend _(sensitivity: Critical)_
- `FB_PAGE_TOKEN`: Agent derives from GET /me/accounts with the long-lived user token _(sensitivity: Critical — posts as the Page; does not expire unless revoked)_
- `FB_PAGE_ID`: Page → About → Page transparency, or /me/accounts _(sensitivity: Public)_

**Agent does**
1. Exchange: GET https://graph.facebook.com/v25.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<short token> → {access_token (long-lived ~60 days), token_type, expires_in}.
2. Page token: GET https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token,tasks&access_token=<long user token> → keep the Page's access_token (non-expiring when derived from a long-lived user token) and id. Verify via GET /debug_token?input_token=<page token>&access_token=<APP_ID>|<APP_SECRET> → expires_at 0.
3. Text/link post: POST https://graph.facebook.com/v25.0/{page-id}/feed with JSON {"message":"Hello","link":"https://example.com","access_token":"<page token>"} → keep id ('<pageid>_<postid>').
4. Photo: POST /{page-id}/photos with {"url":"https://cdn.example.com/p.jpg","caption":"…"} (or multipart field 'source'); multi-photo post: upload each with published=false → collect ids → POST /{page-id}/feed {"message":"…","attached_media":[{"media_fbid":"<id1>"},{"media_fbid":"<id2>"}]}.
5. Video: POST https://graph-video.facebook.com/v25.0/{page-id}/videos with file_url=<public URL>, description, title (or multipart 'source').
6. Reel: POST /{page-id}/video_reels {"upload_phase":"start","access_token":…} → video_id + upload_url; POST https://rupload.facebook.com/video-upload/v25.0/{video_id} with headers Authorization: OAuth <page token>, offset: 0, file_size: <bytes>, Content-Type: application/octet-stream, body = file (or header file_url: <public URL>); then POST /{page-id}/video_reels {"upload_phase":"finish","video_id":…,"video_state":"PUBLISHED","description":"…"}. Check GET /{video_id}?fields=status. Stories: POST /{page-id}/photo_stories {photo_id} and /video_stories (start/upload/finish).
7. Scheduling: add "published":false and "scheduled_publish_time":<UNIX seconds or ISO 8601> (10 min – 30 days ahead) on /feed, /photos, /videos; Reels: video_state=SCHEDULED + scheduled_publish_time. List: GET /{page-id}/scheduled_posts. Cancel: DELETE /{post-id}.
8. Token refresh: Page token does not expire; on error 190 (password change/app removed) ask the human for a new user token and repeat the exchange. Long-lived user token itself lasts ~60 days — keep only the Page token.
9. Rate limits: Page calls 4,800 × engaged users / 24 h; Reels 30 API posts / 24 h. Read X-Business-Use-Case-Usage / X-Page-Usage headers; on codes 4, 17, 32, 80001 back off exponentially (minutes).
10. Idempotency: keep job → post id; after a timeout GET /{page-id}/posts?fields=id,message,created_time&limit=5 (or /scheduled_posts) and compare message before retrying.

**Test:** POST https://graph.facebook.com/v25.0/{page-id}/feed with {"message":"API test","published":false,"scheduled_publish_time":<now+3600>,"access_token":"<page token>"} → 200 {"id":"<pageid>_<postid>"}; it appears only in Meta Business Suite → Planner as scheduled. Then DELETE https://graph.facebook.com/v25.0/<pageid>_<postid>?access_token=<page token> → {"success":true}.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| (#200) 'requires both pages_read_engagement and pages_manage_posts' | Token lacks permissions or user token used instead of Page token | Regenerate with both permissions; use the access_token from /me/accounts |
| Error 190 subcode 460 / 463 | Password changed or token expired | Generate a new user token, exchange, re-derive Page token |
| /me/accounts returns empty data | Page not selected in the login dialog or no Page task | Graph API Explorer → regenerate and select the Page; check Page access |
| (#100) scheduled_publish_time invalid | Time <10 min or >30 days ahead, or published not false | Use a time in range and published=false |
| Reel finish returns error / stuck processing | Video spec (3–90 s, 9:16, ≥540×960 — unverified) or failed rupload | Check GET /{video_id}?fields=status, re-encode and re-upload |

**Notes:** Personal profiles can't be posted to via API. Page tokens break if the user changes password or removes the app. New Pages Experience: the user needs Facebook access with Content task. Graph API v25.0 released 18 Feb 2026 (newer may exist; versions live ~2 years). Free.

**Alternative:** 1) Meta Business Suite native scheduler: https://business.facebook.com → Planner/'Create post' → write post → 'Schedule' → pick time. 2) Or connect the Page in Buffer/Hootsuite/Publer. 3) The agent uses that scheduler's API with the media URL and time.

## Instagram
_Route: `official_api_own_account`_ · Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing

**Before you start**
- Instagram professional account (Business or Creator); personal accounts cannot use the API.
- Facebook account registered as a Meta developer (free) with 2FA enabled.
- Meta app with the use case 'Manage messaging & content on Instagram' → 'API setup with Instagram login'; Development mode is enough for your own account (Standard Access via app role / Instagram Tester).
- A privacy policy URL (any public page you control) for the app settings.
- Public HTTPS hosting for images/videos (Meta's servers fetch image_url/video_url) — e.g. own CDN or object storage with public read.
- No paid plan; API free. App Review + Business Verification only if serving other people's accounts.

**Human does**
1. Instagram app → Profile → ☰ (top right) → 'Settings and activity' → 'Account type and tools' → 'Switch to professional account' → pick a category → choose 'Creator' or 'Business' → Done. Confirm: Profile shows 'Professional dashboard'.
2. Open https://developers.facebook.com → 'Log in' with your Facebook account (enable 2FA first: Facebook → Settings & privacy → Accounts Center → Password and security → Two-factor authentication) → 'Get started' → accept the Platform Terms → verify phone/email by code → choose role 'Developer' → Complete registration. Confirm: the top bar shows 'My Apps'.
3. My Apps → 'Create app' → App name 'my-posting-agent', App contact email → Next → Use cases: tick 'Manage messaging & content on Instagram' → Next → Business portfolio: 'I don't want to connect a business portfolio yet' (or pick yours) → Next → Create app → re-enter Facebook password. Confirm: app dashboard opens in 'Development' mode.
4. Dashboard → 'Use cases' → 'Manage messaging & content on Instagram' → 'Customize' → 'API setup with Instagram login'. In '1. Add required messaging/content permissions' make sure instagram_business_basic and instagram_business_content_publish are added (label may differ).
5. Same page, copy 'Instagram app ID' and click 'Show' next to 'Instagram app secret' → copy both into your password manager (they differ from the Meta App ID/secret under App settings → Basic).
6. Add yourself as tester (if 'Add account' later complains): left menu 'App roles' → 'Roles' → 'Add people' → 'Instagram Tester' → type your Instagram username → Add. Then on the web open https://www.instagram.com/accounts/manage_access/ (Settings → Apps and websites → 'Tester invites') → Accept (label may differ).
7. Back on 'API setup with Instagram login' → '2. Generate access tokens' → 'Add account' → log in to Instagram → allow. Next to the account click 'Generate token' → log in again if asked → tick 'I understand' → copy the token (a 60-day long-lived token) and the numeric Instagram user ID shown. Store as INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_USER_ID.
8. If the agent will run the login itself: '3. Set up Instagram business login' → 'Business login settings' → OAuth redirect URIs → paste the agent's https redirect URL → Save.
9. App settings → Basic → 'Privacy Policy URL': paste your policy URL → 'Save changes'. Leave the app in Development mode (no App Review needed for your own account).
10. Give the agent INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID and the public media host credentials through a secret store.
11. Verify: ask the agent to run the test call; it should return your username and account_type BUSINESS or MEDIA_CREATOR.

**Hand over to the agent (store as secrets)**
- `INSTAGRAM_APP_ID`: App dashboard → Use cases → Instagram → API setup with Instagram login (Instagram app ID) _(sensitivity: Low)_
- `INSTAGRAM_APP_SECRET`: Same page → Instagram app secret → Show _(sensitivity: High)_
- `INSTAGRAM_ACCESS_TOKEN`: Same page → Generate access tokens → Generate token (60-day long-lived) _(sensitivity: Critical — can publish to the account)_
- `INSTAGRAM_USER_ID`: Shown next to the account on the token page, or GET /me?fields=user_id _(sensitivity: Low)_
- `MEDIA_HOST_CREDENTIALS`: Your storage/CDN console (bucket key, base URL) _(sensitivity: High)_

**Agent does**
1. (Optional own OAuth) Send the human https://www.instagram.com/oauth/authorize?client_id=<IG_APP_ID>&redirect_uri=<https redirect>&response_type=code&scope=instagram_business_basic,instagram_business_content_publish&state=<rand>. Then POST https://api.instagram.com/oauth/access_token (multipart/form-data or x-www-form-urlencoded) client_id, client_secret, grant_type=authorization_code, redirect_uri, code → short-lived token + user_id; then GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=…&access_token=<short> → {access_token, token_type, expires_in≈5184000}.
2. Refresh every ~30–45 days (token must be ≥24 h old and unexpired): GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<token> → new access_token + expires_in; store and alert the human if refresh fails (then they regenerate on the dashboard).
3. Identify: GET https://graph.instagram.com/v25.0/me?fields=user_id,username,account_type&access_token=… → keep user_id.
4. Host media: upload JPEG (≤8 MB, aspect 4:5–1.91:1, ≥320 px wide) or MP4/MOV (Reels 3 s–15 min, ≤300 MB, H.264/HEVC, AAC, 9:16 recommended) to a public HTTPS URL that stays reachable until publishing completes.
5. Create container: POST https://graph.instagram.com/v25.0/{ig-user-id}/media with Authorization: Bearer <token> and JSON {"image_url":"https://cdn.example.com/a.jpg","caption":"Hello #autumn"}; Reel: {"media_type":"REELS","video_url":"https://cdn.example.com/r.mp4","caption":"…","share_to_feed":true}; Story: {"media_type":"STORIES","image_url":"…"}; Carousel: create each child with {"image_url":…,"is_carousel_item":true}, then {"media_type":"CAROUSEL","children":"<id1>,<id2>","caption":"…"} (≤10 items). Keep id (container id). Large local videos: resumable upload via upload_type=resumable + POST https://rupload.facebook.com/ig-api-upload/v25.0/{container-id} with headers Authorization: OAuth <token>, offset: 0, file_size: <bytes> (documented for Facebook Login for Business; for Instagram Login unverified).
6. Poll: GET https://graph.instagram.com/v25.0/{container-id}?fields=status_code,status every 10–30 s (max ~5 min) until FINISHED (ERROR/EXPIRED → stop and report; containers expire after 24 h).
7. Publish: POST https://graph.instagram.com/v25.0/{ig-user-id}/media_publish with {"creation_id":"<container-id>"} → keep id (media id); then GET /{media-id}?fields=permalink,timestamp for the URL.
8. Scheduling: the API has no publish-time field — the agent's scheduler creates the container ~10 min before and publishes at the due time.
9. Limits: before publishing GET https://graph.instagram.com/v25.0/{ig-user-id}/content_publishing_limit?fields=quota_usage,config → stay under quota_total (100 API posts per rolling 24 h; carousel = 1). Rate-limit errors (code 4/17/32/613, HTTP 429): back off exponentially (1, 2, 4… min) and check the X-Business-Use-Case-Usage header.
10. Idempotency: store job id → container id → media id; never call media_publish twice for the same container (a second call errors); if a publish call times out, GET /{ig-user-id}/media?fields=id,caption,timestamp&limit=5 and match caption before retrying.

**Test:** GET https://graph.instagram.com/v25.0/me?fields=user_id,username,account_type&access_token=<token> → 200 {"user_id":"1784…","username":"<you>","account_type":"BUSINESS" (or MEDIA_CREATOR),"id":"…"}. Then GET /{ig-user-id}/content_publishing_limit?fields=quota_usage,config → {"data":[{"quota_usage":0,"config":{"quota_total":100,"quota_duration":86400}}]} (posts nothing).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Error 190 'Error validating access token' / session expired | 60-day token expired or user changed password/removed app | Regenerate on the dashboard ('Generate token') and refresh every 30–45 days |
| Container status ERROR or 'Media upload has failed with error code 2207026' | Unsupported video format/codec/ratio or URL not publicly reachable | Re-encode to H.264/AAC MP4 with moov atom at front, 9:16, check URL with curl without auth |
| 'The image format is not supported' (code 9004/2207052) | PNG/WebP or redirecting URL | Convert to JPEG, serve direct 200 response |
| Insufficient permission / (#10) Application does not have permission | instagram_business_content_publish not added, or account not tester/app role | Add permission in the use case; add Instagram Tester and accept invite |
| Code 9 / 'reached the publishing limit' | content_publishing_limit exhausted | Wait until the 24 h window rolls; check quota_usage first |

**Notes:** Personal accounts can't use the API. Token expires in 60 days if not refreshed. Images must be JPEG; no shopping tags, filters or music library via API; containers expire after 24 h. Docs prose has varied between 50 and 100 posts/24 h — trust content_publishing_limit. Development mode is enough for accounts with an app role. Native scheduling (up to 75 days) exists in the app for professional accounts and in Meta Business Suite.

**Alternative:** 1) Facebook Login route: if the IG account is linked to a Facebook Page, use graph.facebook.com with permissions instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement (same container → media_publish flow, enables documented resumable uploads). 2) Or connect IG in Buffer/Later/Metricool/Hootsuite and let the agent call that scheduler's API. 3) Or the agent prepares files + caption and the human schedules natively: Instagram app → + → Post → Advanced settings → 'Schedule this post' (label may differ).

## MeWe
_Route: `scheduler_or_automation_tool (Postiz Cloud); self-hosted Postiz or own app requires MeWe Developer Program approval`_ · Docs: https://docs.postiz.com/providers/mewe (MeWe's own developer docs are behind the developer program login)

**Before you start**
- A MeWe account (free) at https://mewe.com, member of any groups you want to post into.
- Postiz Cloud account at https://postiz.com — paid plans: Standard $29/mo (5 channels), Team $39/mo (10), Pro $49/mo (30), Ultimate $99/mo (100); 7-day free trial; yearly billing discounted (per search snippets of pricing pages).
- OR self-hosted Postiz (Docker, HTTPS domain required because MeWe requires HTTPS redirect URIs in production) plus your own MeWe Developer Program approval (beta, limited spots, manual review; wait time not published (unverified)).
- A place to store secrets (password manager / agent env file).

**Human does**
1. 1. Go to https://postiz.com → 'Start free trial' / Sign up → confirm email → choose a plan (Standard $29/mo is enough for MeWe + 4 more channels). Confirm: the Postiz calendar dashboard opens.
2. 2. In Postiz click 'Add Channel' (left sidebar) → choose 'MeWe'. A MeWe login page opens (https://mewe.com/login?client_id=…).
3. 3. Sign in to MeWe and approve the login request for Postiz (MeWe may ask you to confirm the pending login in the app; if Postiz says 'Login request is still pending', approve in MeWe then retry). Confirm: MeWe appears as a channel avatar in Postiz.
4. 4. (Self-host only) Sign in at the MeWe Developer Portal with your MeWe account → submit the Developer Program application describing 'posting my own content to my timeline and groups via self-hosted Postiz' → wait for the approval email.
5. 5. (Self-host only) After approval: Developer Settings → create a new application → type 'Standalone App' → set redirect URI https://<your-postiz-domain>/integrations/social/mewe → copy the App ID and API Key.
6. 6. (Self-host only) Add to Postiz .env: MEWE_APP_ID=<App ID>, MEWE_API_KEY=<API Key> (optional MEWE_HOST=https://mewe.com) and make sure FRONTEND_URL is your HTTPS URL → restart the containers (docker compose up -d). Then repeat steps 2-3 on your instance.
7. 7. In Postiz open Settings → Developers / Public API (label may differ) → copy the API key. Store it as POSTIZ_API_KEY.
8. 8. Note the API base: Cloud https://api.postiz.com/public/v1; self-hosted https://<your-backend-domain>/api/public/v1 (or /public/v1 depending on your reverse proxy).
9. 9. Hand POSTIZ_API_URL and POSTIZ_API_KEY to the agent via its env/secret store (not in chat).
10. 10. Verify: in Postiz create one post to MeWe → 'Add to calendar' with time 5 minutes ahead; confirm it appears on https://mewe.com/<your-handle>/posts.
11. 11. Every ~30 days (or when Postiz shows the MeWe channel as disconnected / 'refresh needed'): click the channel → 'Reconnect' / 'Refresh channel' and approve on MeWe again (MeWe tokens are not refreshable via API; see notes).

**Hand over to the agent (store as secrets)**
- `POSTIZ_API_URL`: https://api.postiz.com/public/v1 for Cloud; your backend URL + /public/v1 for self-host _(sensitivity: low)_
- `POSTIZ_API_KEY`: Postiz → Settings → Developers/Public API → API key _(sensitivity: high — full posting rights to all connected channels)_
- `MEWE_APP_ID`: Self-host only: MeWe Developer Settings → your Standalone App _(sensitivity: medium (stays in Postiz .env, not needed by the agent))_
- `MEWE_API_KEY`: Self-host only: MeWe Developer Settings → your Standalone App _(sensitivity: high (stays in Postiz .env, not needed by the agent))_

**Agent does**
1. 1. Auth: every call sends header 'Authorization: <POSTIZ_API_KEY>' (raw key, no 'Bearer'). No token exchange or refresh on the agent side; Postiz stores the MeWe token.
2. 2. Find the channel: GET {POSTIZ_API_URL}/integrations → response array of {id, name, identifier, picture, disabled, profile}; keep the id where identifier == 'mewe' and disabled == false. Keep 'profile' (MeWe handle) to build https://mewe.com/<profile>/posts.
3. 3. Upload media (photos only — Postiz's MeWe provider skips .mp4): POST {POSTIZ_API_URL}/upload with multipart/form-data field 'file' (e.g. curl -F file=@1.jpg) → keep the returned {id, path}. Or POST {POSTIZ_API_URL}/upload-from-url with JSON {"url":"https://…/1.jpg"}.
4. 4. Group id (for group posts): read the MeWe group id from the group URL https://mewe.com/group/<groupId> (ask the user once) — Postiz fetches groups via MeWe GET /api/dev/groups internally.
5. 5. Create/schedule the post: POST {POSTIZ_API_URL}/posts, Content-Type: application/json, body {"type":"schedule","date":"2026-10-10T15:00:00.000Z","shortLink":false,"tags":[],"posts":[{"integration":{"id":"<mewe-integration-id>"},"value":[{"content":"Hello MeWe","image":[{"id":"<media-id>","path":"<media-path>"}]}],"settings":{"__type":"mewe","postType":"timeline"}}]}. For a group use "settings":{"__type":"mewe","postType":"group","group":"<groupId>"}. Use "type":"now" to publish immediately. Keep the returned post/group ids.
6. 6. Scheduling is server-side in Postiz via 'date' (UTC ISO 8601). Optional GET {POSTIZ_API_URL}/find-slot/<integration-id> returns the next free slot {date}.
7. 7. Verify: GET {POSTIZ_API_URL}/posts?startDate=…&endDate=… (query params per Postiz docs) and check state; on failure DELETE {POSTIZ_API_URL}/posts/<id> and recreate.
8. 8. Token health: if GET /integrations shows the MeWe channel disabled or posts fail with 'Access token expired, please re-authenticate', notify the human to reconnect (Postiz's MeWe provider has no refresh token; token lifetime = MeWe 'expiresAt', default assumed 30 days).
9. 9. Rate limits: Postiz public API ~30 requests/hour per key (create-post may allow more) — batch several channels into one POST /posts and back off exponentially (60 s, 120 s, 240 s) on HTTP 429. MeWe itself may answer 420 'Enhance Your Calm'; Postiz retries those.
10. 10. Idempotency: keep a local log keyed by slug → Postiz post id; before creating, GET /posts for that date range and skip if the same content is already scheduled.

**Test:** curl -sS -H "Authorization: $POSTIZ_API_KEY" "$POSTIZ_API_URL/integrations" → expect HTTP 200 and a JSON array containing an object with "identifier":"mewe" and "disabled":false (safe: read-only).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 'Login request is still pending' when connecting | MeWe login approval not yet confirmed | Approve the request in the MeWe app/web, then click connect again in Postiz. |
| 401 from Postiz API | Wrong key or 'Bearer ' prefix added | Send the raw key in Authorization; regenerate it in Postiz settings if needed. |
| Post fails with 'Access token expired, please re-authenticate' | MeWe apiToken expired (no refresh supported) | Human reconnects the MeWe channel in Postiz (Add Channel / Refresh). |
| Video not posted | Postiz MeWe provider only uploads photos | Post videos manually in the MeWe app, or link to the video. |
| Group post 'Insufficient permissions' | Not a member/poster in that group or wrong group id | Join the group / check posting rights, verify the id from https://mewe.com/group/<id>. |
| HTTP 429 from Postiz | Public API hourly limit hit | Back off and retry after the hour window; batch multiple channels per request. |

**Notes:** Postiz Cloud has presumably already been accepted into MeWe's developer program; self-hosters must apply themselves (beta, limited spots). MeWe's own developer docs sit behind the developer program login; endpoint details above come from Postiz's open-source provider. Photos only (no video) via Postiz. Postiz returns a profile/group URL, not the exact MeWe post URL. MeWe native scheduling unverified.

**Alternative:** (1) Apply to the MeWe Developer Program yourself and create a Standalone App; (2) agent calls MeWe directly with X-App-Id/X-Api-Key and the user's apiToken (POST https://mewe.com/api/dev/me/post {"text":…}); (3) reconnect when expiresAt passes. Otherwise post manually in the MeWe app (compose box on your timeline or group → text → photo → Post).

## OK.ru
_Route: `official_api_own_account`_ · Docs: https://apiok.ru/en/dev/sdk/js/ui.postMediatopic/

**Before you start**
- OK.ru (Odnoklassniki) account with a linked e-mail (app data is e-mailed) and admin rights in the target group.
- Developer rights: accept at https://ok.ru/devaccess.
- An OK app with OAuth platform enabled; permissions VALUABLE_ACCESS, GROUP_CONTENT, PHOTO_CONTENT, LONG_ACCESS_TOKEN (VIDEO_CONTENT for video) granted manually by OK support after an e-mail to api-support@ok.ru (several working days).
- Server-side storage for the application secret key (needed for MD5 signatures). Free.

**Human does**
1. Log in at https://ok.ru with the account that administers the group. Profile -> Settings -> make sure an e-mail is linked (app keys are sent there).
2. Open https://ok.ru/devaccess and click to obtain developer rights (accept terms). Confirm: a 'Developers' / 'Мои загруженные' (My uploaded) apps area appears in Games/Apps.
3. Go to https://apiok.ru/en/dev/app/create for the guide, then in ok.ru -> Games (Игры) -> 'My uploaded' (Мои загруженные) -> 'Add app' (Добавить приложение). Name 'posting-agent', description, type/platform: enable 'OAuth' (external site) (label may differ).
4. In the app's OAuth settings: 'Redirect URI' = e.g. https://your-domain/ok/callback or https://localhost/callback; tick requested permissions VALUABLE_ACCESS, GROUP_CONTENT, PHOTO_CONTENT, LONG_ACCESS_TOKEN (+ VIDEO_CONTENT). Save.
5. Open the e-mail OK sends ('application registered') and copy Application ID, Public key (application_key) and Secret key (application_secret_key) to your password manager. The app settings page may also show an 'eternal' access_token and session_secret_key for your own account - copy them if present (reported).
6. E-mail api-support@ok.ru (subject: 'Permissions request, app ID NNN'): app ID, app link, list VALUABLE_ACCESS, GROUP_CONTENT, PHOTO_CONTENT, LONG_ACCESS_TOKEN (VIDEO_CONTENT), use case 'publishing our own content to our group https://ok.ru/group/NNNN by its administrator'. Wait for the reply confirming permissions (days).
7. Find the group ID: open the group -> the URL https://ok.ru/group/NNNNNNNNNN (number) - or the agent resolves it with group.getUserGroupsV2. Note OK_GROUP_ID.
8. When permissions are confirmed, open the agent's link https://connect.ok.ru/oauth/authorize?client_id=APP_ID&scope=VALUABLE_ACCESS;GROUP_CONTENT;PHOTO_CONTENT;LONG_ACCESS_TOKEN&response_type=code&redirect_uri=REDIRECT and click 'Allow'. Copy the code from the redirect URL to the agent (short-lived).
9. Confirm: ok.ru -> Settings -> 'Apps' (or third-party apps) lists the app with the granted rights.

**Hand over to the agent (store as secrets)**
- `OK_APP_ID`: App registration e-mail / app settings. _(sensitivity: low)_
- `OK_APP_PUBLIC_KEY`: App registration e-mail (application_key). _(sensitivity: low)_
- `OK_APP_SECRET_KEY`: App registration e-mail (application_secret_key). _(sensitivity: high)_
- `OK_REDIRECT_URI`: App OAuth settings. _(sensitivity: low)_
- `OK_ACCESS_TOKEN / OK_REFRESH_TOKEN`: From the agent's code exchange (or the app page's eternal token). _(sensitivity: high)_
- `OK_SESSION_SECRET_KEY`: App page (eternal token only); otherwise computed by the agent. _(sensitivity: high)_
- `OK_GROUP_ID`: Group URL ok.ru/group/NNNN. _(sensitivity: low)_

**Agent does**
1. Code exchange: POST https://api.ok.ru/oauth/token.do?code=CODE&client_id=APP_ID&client_secret=SECRET_KEY&redirect_uri=REDIRECT&grant_type=authorization_code -> access_token, refresh_token, expires_in. With LONG_ACCESS_TOKEN the access token lives 30 days and is auto-extended on use; otherwise ~30 min.
2. Refresh when near expiry (or on error 102 'session expired'): POST https://api.ok.ru/oauth/token.do?refresh_token=..&client_id=APP_ID&client_secret=SECRET_KEY&grant_type=refresh_token -> new access_token.
3. Signature: session_secret_key = md5(access_token + application_secret_key) lowercase hex. sig = md5( concatenation of all 'key=value' params EXCEPT access_token (and session_key), sorted alphabetically by key, no separators + session_secret_key ) lowercase.
4. Call format: POST https://api.ok.ru/fb.do with form fields application_key=PUBLIC_KEY&format=json&method=METHOD&...params...&sig=SIG&access_token=TOKEN.
5. Photo: method=photosV2.getUploadUrl&gid=OK_GROUP_ID&count=1 -> upload_url, photo_ids; POST multipart pic1=@img.jpg to upload_url -> {photos:{PHOTO_ID:{token:'...'}}}; keep the token (do not call photosV2.commit for group topics).
6. Post: method=mediatopic.post&gid=OK_GROUP_ID&type=GROUP_THEME&attachment={"media":[{"type":"text","text":"Hello"},{"type":"photo","list":[{"id":"PHOTO_TOKEN"}]},{"type":"link","url":"https://example.com"}]} -> response = topic id. Own feed: type=USER without gid.
7. Schedule: put "publishAt":"2026-10-10 12:00:00" inside the attachment JSON right after media (format YYYY-MM-DD HH:MM:SS, interpreted as Moscow time (unverified)); topic appears as delayed in the group.
8. Video: method=video.getUploadUrl (VIDEO_CONTENT) -> upload_url, video_id; upload file; attach {"type":"movie","list":[{"id":VIDEO_ID}]}.
9. Idempotency/limits: limits unpublished; send <=1 request/s; store topic id per content item and never re-post after a timeout without first checking the group feed (method=mediatopic.getByIds or group.getStatTopics) (unverified method choice). Errors: PERMISSION_DENIED (10) = support has not granted the permission; PARAM_SIGNATURE (104) = signing bug.

**Test:** POST https://api.ok.ru/fb.do with application_key=..&format=json&method=users.getCurrentUser&sig=..&access_token=.. -> {"uid":"...","name":"..."} (no post).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| PERMISSION_DENIED for mediatopic.post with gid | GROUP_CONTENT/VALUABLE_ACCESS not granted by OK support | E-mail api-support@ok.ru again with app ID and use case; re-authorize after approval. |
| PARAM_SIGNATURE | Wrong sig: included access_token, unsorted params, wrong session_secret_key | Recompute as described; JSON attachment must be byte-identical in sig and request. |
| publishAt ignored, post published immediately | publishAt placed outside attachment or wrong format | Place it inside attachment JSON after media, format 'YYYY-MM-DD HH:MM:SS'. |
| Token expired after ~30 min | LONG_ACCESS_TOKEN not granted | Request LONG_ACCESS_TOKEN; use refresh_token. |

**Notes:** Nothing works for groups until OK support grants the permissions. Signature excludes access_token. Keep the app secret server-side.

**Alternative:** 1) SMMplanner or postmypost: connect OK account via OAuth, pick the group, schedule posts (paid). 2) Native: group -> 'Write' (Написать заметку/Создать) -> settings -> 'Publish later' (Отложенная публикация) -> date/time (label may differ).

## VK
_Route: `official_api_own_account`_ · Docs: https://dev.vk.ru/en/method/wall.post

**Before you start**
- A VK account with a confirmed phone number that is administrator/editor of the target community (group or public page), or the personal page itself.
- IMPORTANT (correction): per VK's official API schema (VKCOM/vk-api-schema, API v5.199), wall.post, photos.getWallUploadServer, photos.saveWallPhoto and video.save accept only a USER access token - a community (group) token cannot publish to the wall. A community token is still useful for groups.getById/messages, not for posting.
- A VK ID app (https://id.vk.com/about/business -> developer cabinet) to obtain a user token via OAuth 2.1 + PKCE; the old Implicit Flow at oauth.vk.com is reported to no longer be accepted for new tokens (unverified for legacy standalone apps).
- Developer verification in VK ID for business: individuals with passport details and a camera face check; companies via VK Business ID (details verified via bank or documents). Wall/photos/video scopes may need this verification and access approval (unverified exact rules).
- A redirect URL you control (HTTPS, or the agent's local listener). No fees reported; free.

**Human does**
1. Log in to https://vk.com with the account that administers the community. Open the community -> 'Manage' (Управление) -> 'Members' -> 'Managers' and confirm your role is Administrator or Editor.
2. Find the community ID: in Manage -> 'Settings' (Настройки) the address field shows vk.com/club123456 or a short name; if it is a short name, the agent resolves it with groups.getById. Note the number as VK_GROUP_ID (positive).
3. Open https://id.vk.com/about/business -> 'Go to account' / 'Перейти в кабинет' -> create (or select) an organization/profile and complete verification: individual = passport data + selfie/face check on camera; company = company details checked via bank/documents. Wait for confirmation (minutes to days) (label may differ).
4. In the VK ID cabinet -> 'Applications' (Приложения) -> 'Add application' -> platform 'Web' -> name 'posting-agent', base domain and 'Trusted redirect URL' = e.g. https://your-domain/vk/callback or http://localhost (label may differ).
5. In the app -> 'Access' / 'Доступы' (scopes): enable wall, photos, video, groups (and offline if offered) and request access if the cabinet shows a request button; wait for approval if required (unverified).
6. Copy 'App ID' (client_id) and the 'Protected key' / client secret (Защищённый ключ) into the password manager.
7. When the agent sends an authorize link (https://id.vk.com/authorize?response_type=code&client_id=...&scope=wall photos video groups&redirect_uri=...&state=...&code_challenge=...&code_challenge_method=S256), open it, sign in with the community admin account and click 'Allow'. The browser lands on the redirect URL with ?code=...&device_id=... - the agent's listener catches it (or copy the full URL to the agent within 10 minutes).
8. Confirm: VK -> Settings -> 'Apps and websites' (Приложения и сайты) lists 'posting-agent'. Revoke there if needed.
9. Optional: in the community -> Manage -> 'Wall' (Стена) ensure wall is 'Open' or 'Limited' (Ограниченная) so admins can post.

**Hand over to the agent (store as secrets)**
- `VK_GROUP_ID`: Community Manage -> Settings address (clubNNNN) - the number. _(sensitivity: low)_
- `VK_ID_CLIENT_ID`: VK ID cabinet -> your app -> App ID. _(sensitivity: low)_
- `VK_ID_CLIENT_SECRET`: VK ID cabinet -> your app -> protected key (if the flow requires it; PKCE web flow may not). _(sensitivity: high)_
- `VK_REDIRECT_URI`: Trusted redirect URL saved in the app. _(sensitivity: low)_
- `VK_USER_ACCESS_TOKEN / VK_USER_REFRESH_TOKEN / VK_DEVICE_ID`: Produced by the agent's code exchange after you approve the authorize link. _(sensitivity: high - acts as you; refresh token lasts ~180 days)_

**Agent does**
1. OAuth 2.1 + PKCE: generate code_verifier (43-128 chars) and code_challenge=BASE64URL(SHA256(verifier)); send the human GET https://id.vk.com/authorize?response_type=code&client_id=ID&redirect_uri=URI&state=RANDOM&code_challenge=..&code_challenge_method=S256&scope=wall%20photos%20video%20groups.
2. Exchange: POST https://id.vk.com/oauth2/auth, Content-Type: application/x-www-form-urlencoded, body grant_type=authorization_code&code=CODE&code_verifier=VERIFIER&client_id=ID&device_id=DEVICE_ID&redirect_uri=URI&state=STATE -> keep access_token (~60 min), refresh_token (~180 days), user_id, scope.
3. Refresh before each run if older than ~50 min: POST https://id.vk.com/oauth2/auth grant_type=refresh_token&refresh_token=..&client_id=ID&device_id=DEVICE_ID&state=.. -> store the NEW access_token and refresh_token (old refresh token becomes invalid).
4. All API calls: POST https://api.vk.com/method/{method} form fields access_token=USER_TOKEN&v=5.199 plus parameters. Response JSON 'response' or 'error' {error_code, error_msg}.
5. Photo for community wall: photos.getWallUploadServer group_id=VK_GROUP_ID -> response.upload_url; POST multipart field photo=@img.jpg to upload_url -> {server, photo, hash}; photos.saveWallPhoto group_id=VK_GROUP_ID&server=..&photo=..&hash=.. -> response[0].owner_id, id -> attachment string 'photo{owner_id}_{id}'.
6. Video: video.save group_id=VK_GROUP_ID&name=..&description=..&wallpost=0 -> upload_url, owner_id, video_id; POST multipart video_file=@clip.mp4 to upload_url -> attachment 'video{owner_id}_{video_id}' (processing may take minutes).
7. Post: wall.post owner_id=-VK_GROUP_ID&from_group=1&message=TEXT&attachments=photo-1_2,video-1_3 (max 10 attachments)&guid=UNIQUE_ID -> response.post_id. guid prevents duplicate posts when the same request is retried.
8. Schedule: add publish_date=UNIX_TIMESTAMP (future; reported limit up to about a year ahead (unverified)) -> post goes to the community's 'Postponed' (Отложенные) list and VK publishes it.
9. Rate limits: user token 3 requests/s; on error 6 (too many requests) sleep 1 s; error 9 (flood control) or 214 (posting limit, ~50 posts/day per community reported) stop for the day; error 14 (captcha) stop and alert the human; error 5 (auth failed) refresh token then re-authorize.

**Test:** POST https://api.vk.com/method/groups.getById with group_id=VK_GROUP_ID&fields=can_post&access_token=USER_TOKEN&v=5.199 -> {"response":{"groups":[{"id":...,"name":...,"is_admin":1,"can_post":1}]}} (no post created).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| error 27 'Group authorization failed: method is unavailable with group auth' | Calling wall.post/photos with a community token | Use the VK ID user token of an admin. |
| error 15 / 'Access denied: no access to call this method' | Scope wall/photos not granted to the app, or app not verified | Enable scopes in the VK ID cabinet, complete verification, re-authorize. |
| error 214 'Access to adding post denied' | Daily post limit or wall closed | Wait 24 h; set wall to Open/Limited; check admin role. |
| error 14 captcha | Too many similar actions | Slow down; pause posting; let human post one manually. |
| invalid_grant on refresh | Refresh token reused or older than ~180 days | Re-run the authorize link. |

**Notes:** owner_id must be negative for communities; from_group=1 posts as the community. Postponed posts are visible to admins under 'Postponed'. Community tokens never expire but cannot post to walls. Quantity limits on same-type methods are undisclosed.

**Alternative:** 1) SMMplanner (smmplanner.com): add VK account via OAuth -> pick community -> schedule posts with photos/video (paid plans). 2) Make 'VK' app or Postiz VK provider with your VK login. 3) Native: community wall -> write post -> clock icon 'Timer' (Таймер) -> set date/time -> 'Schedule' (В очередь).

## Bilibili
_Route: `official_api_own_account`_ · Docs: https://openhome.bilibili.com/doc

**Before you start**
- Bilibili account (real-name verified with mainland phone) that will own the uploads.
- Bilibili Open Platform (哔哩哔哩开放平台, https://openhome.bilibili.com) developer approval; enterprise with Chinese business license likely required for the video submission (稿件) capability (individual eligibility unverified).
- Website app with OAuth callback URL; approval of the 视频稿件 / submission permission (days-weeks, unverified).
- Free (unverified).

**Human does**
1. Open https://openhome.bilibili.com -> 登录 with the Bilibili account -> 成为开发者 / 入驻: pick 企业 (or 个人 if offered), fill company name, license, contact -> submit. Wait for review.
2. Console -> 创建应用 -> 网站应用: name, description, website, OAuth 回调地址 (callback) e.g. https://example.com/bili/callback -> submit.
3. In the app -> 权限 / 能力 -> apply for 视频稿件管理 / 投稿 (video submission) and 用户信息 -> describe use case -> wait for approval (label may differ).
4. App details -> copy client_id and client_secret (App Secret) to the password manager.
5. Open the authorize link shown in the console / sent by the agent (Bilibili account authorization page, e.g. https://account.bilibili.com/pc/account-pc/auth/oauth?client_id=..&return_url=..&response_type=code&state=.. (unverified exact URL)) -> 授权. Copy the code from the callback URL to the agent.
6. Confirm: https://account.bilibili.com -> 授权管理 (authorized apps) lists the app (label may differ).
7. Make sure the account can upload: https://member.bilibili.com/platform/upload/video/frame opens (real-name + answer quiz if prompted).
8. Hand BILI_CLIENT_ID, BILI_CLIENT_SECRET and BILI_REDIRECT_URI to the agent via a password-manager share; when the agent reports the first test submission, open https://member.bilibili.com/platform/upload-manager/article and confirm it shows 审核中 (in review) then 已通过 (label may differ). Revoke later in 授权管理.

**Hand over to the agent (store as secrets)**
- `BILI_CLIENT_ID`: openhome.bilibili.com -> app details. _(sensitivity: low)_
- `BILI_CLIENT_SECRET`: Same page. _(sensitivity: high)_
- `BILI_REDIRECT_URI`: App OAuth callback. _(sensitivity: low)_
- `BILI_ACCESS_TOKEN / BILI_REFRESH_TOKEN`: From the agent's code exchange. _(sensitivity: high)_

**Agent does**
1. Token: POST https://api.bilibili.com/x/account-oauth2/v1/token Content-Type: application/x-www-form-urlencoded client_id=..&client_secret=..&grant_type=authorization_code&code=CODE -> data.access_token, data.refresh_token, data.expires_in (expiry timestamp).
2. Refresh before expiry: POST https://api.bilibili.com/x/account-oauth2/v1/refresh_token client_id=..&client_secret=..&grant_type=refresh_token&refresh_token=.. -> new pair; each refresh_token can be used once; if access_token already expired the user must re-authorize.
3. Categories: GET https://member.bilibili.com/arcopen/fn/archive/type/list?client_id=..&access_token=.. -> pick tid.
4. Init upload: POST https://member.bilibili.com/arcopen/fn/archive/video/init?client_id=..&access_token=.. JSON {"name":"clip.mp4","utype":0} -> data.upload_token (utype 0 = multipart, per docs mirrors).
5. Upload parts: POST https://openupos.bilivideo.com/video/v2/part/upload?upload_token=..&part_number=1 (raw chunk body, e.g. 8 MB chunks; host/size unverified); repeat per part; then POST https://member.bilibili.com/arcopen/fn/archive/video/complete?upload_token=.. .
6. Cover: POST https://member.bilibili.com/arcopen/fn/archive/cover/upload?client_id=..&access_token=.. multipart file=@cover.jpg -> data.url.
7. Submit: POST https://member.bilibili.com/arcopen/fn/archive/add-by-utoken?client_id=..&access_token=..&upload_token=.. JSON {"title":"...","cover":"COVER_URL","tid":21,"no_reprint":1,"desc":"...","tag":"tag1,tag2","copyright":1} -> data.resource_id (BV id). Videos then pass moderation.
8. Scheduling: API timed-publish parameter unverified; the agent queues and submits at the target time (moderation delay applies). Store upload_token and resource_id per item; never resubmit the same upload_token. Back off exponentially on rate-limit codes.

**Content specs:** Video: MP4/FLV/etc.; creator center accepts large files (several GB) (unverified exact limit); 16:9 1920x1080 recommended for normal videos.; Title <=80 chars, description up to ~2,000 chars, up to 10 tags (unverified), category (tid) required, cover image 16:9 (e.g. 1146x717 or larger) (unverified).; Every submission goes through moderation (审核) before it is public.

**Test:** GET https://member.bilibili.com/arcopen/fn/user/account/info?client_id=..&access_token=.. (path from doc mirrors, unverified) -> data.name / openid (no submission).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Permission/scope error on archive endpoints | Submission capability not approved | Apply in the console; wait for approval. |
| Token invalid | Expired access token or reused refresh token | Refresh once before expiry; otherwise re-authorize. |
| Video rejected (退回) | Moderation | Check creator center messages, fix and resubmit. |

**Notes:** Official docs were not fetchable; paths come from third-party mirrors of the open-platform docs. Unofficial cookie-based uploaders (biliup) work for individuals but are outside the official API and risk account action.

**Alternative:** 1) Manual: https://member.bilibili.com/platform/upload/video/frame -> drag video -> title, category, tags, cover, description -> '定时发布' toggle -> pick time (>=2 h ahead, <=15 days (unverified)) -> 立即投稿. 2) Agent prepares the 16:9 file, cover and metadata checklist.

## Dailymotion
_Route: `official_api_own_account`_ · Docs: https://developers.dailymotion.com/guides/upload/

**Before you start**
- A Dailymotion account with a channel (free).
- Owner or Admin role in the Dailymotion Studio organization (needed to create API keys).
- A redirect URI the agent can receive (e.g. http://localhost:8080/callback on the agent machine).
- Upload limits for standard accounts: ≤2 h and ≤4 GB per video; ≤15 videos and ≤10 h total per 24 h. Verified Partners: no per-video limit, up to 96 videos/24 h.

**Human does**
1. 1. Sign in at https://www.dailymotion.com/signin and open Dailymotion Studio at https://studio.dailymotion.com. Make sure the channel you want to post to is selected (top-left channel switcher).
2. 2. In Studio's left menu open 'Organization' → 'API keys' (label may differ; requires Owner/Admin). Click 'Create API key'.
3. 3. Choose 'Public API key' (works with api.dailymotion.com). Do NOT choose 'Private API key' — it only works with partner.api.dailymotion.com.
4. 4. Fill Title = 'My upload agent', Description = 'Uploads to my own channel', Callback URL = the exact redirect URI the agent gives you (e.g. http://localhost:8080/callback). Save/Create.
5. 5. Copy 'API key' → DAILYMOTION_API_KEY and 'API secret' → DAILYMOTION_API_SECRET into your password manager (the secret may be shown only once).
6. 6. Give the agent the key and secret. The agent prints an authorization URL like https://www.dailymotion.com/oauth/authorize?response_type=code&client_id=KEY&redirect_uri=...&scope=manage_videos. Open it in the browser where you are logged in.
7. 7. Review the requested permission (manage your videos) and click 'Allow'/'Accept'. The browser goes to the callback URL; if the agent is not listening there, copy the full URL from the address bar (it contains ?code=...) and paste it to the agent.
8. 8. The agent exchanges the code and gives you back a confirmation with your screenname; it stores DAILYMOTION_REFRESH_TOKEN. Confirm the screenname matches your channel.
9. 9. Optional: in Studio check your upload limits under your channel's settings, or let the agent read them via GET /me?fields=limits.
10. 10. To revoke: delete the API key in Studio → Organization → API keys, or remove the app from your account's connected apps (label may differ).

**Hand over to the agent (store as secrets)**
- `DAILYMOTION_API_KEY`: Studio → Organization → API keys → your public key _(sensitivity: Medium)_
- `DAILYMOTION_API_SECRET`: Same page, shown at creation _(sensitivity: High)_
- `DAILYMOTION_REFRESH_TOKEN`: Produced by the agent's code exchange after you click Allow _(sensitivity: High — lets the agent manage your videos)_

**Agent does**
1. 1. Authorization URL: https://www.dailymotion.com/oauth/authorize?response_type=code&client_id=$KEY&redirect_uri=<urlencoded callback>&scope=manage_videos&state=<random>. Verify state on return.
2. 2. Code exchange: POST https://api.dailymotion.com/oauth/token, Content-Type: application/x-www-form-urlencoded, body grant_type=authorization_code&client_id=$KEY&client_secret=$SECRET&redirect_uri=<same>&code=<code> → keep access_token, expires_in, refresh_token.
3. 3. Refresh (when expires_in has passed or on 401): POST https://api.dailymotion.com/oauth/token body grant_type=refresh_token&client_id=$KEY&client_secret=$SECRET&refresh_token=$REFRESH → new access_token (+ refresh_token if returned — always persist the newest).
4. 4. Get upload URL: GET https://api.dailymotion.com/file/upload with Authorization: Bearer <access_token> → keep upload_url.
5. 5. Upload bytes: POST <upload_url> multipart/form-data with field file=@video.mp4 → keep url from the JSON response.
6. 6. Create video: POST https://api.dailymotion.com/me/videos (Bearer) form body url=<url from step 5> → keep id.
7. 7. Set metadata and publish: POST https://api.dailymotion.com/video/{id} (Bearer) form body title=...&channel=news&tags=a,b&description=...&is_created_for_kids=false&published=true (add private=true for a private video). title, is_created_for_kids and published=true are mandatory to publish.
8. 8. Poll GET https://api.dailymotion.com/video/{id}?fields=status,encoding_progress,published every 30 s until status=published (or ready); report url https://www.dailymotion.com/video/{id}.
9. 9. Scheduling: no confirmed publish_date field (unverified). Do steps 4–7 with published=false (draft), store {id, publish_at} in the agent's scheduler, and at publish_at POST /video/{id} published=true.
10. 10. Limits/backoff: before uploading, GET /me?fields=limits and skip if the 24 h quota is used; on 429/5xx back off exponentially (unverified exact API request rate limits).
11. 11. Idempotency: persist the video id right after step 6; before re-running, GET /me/videos?fields=id,title,created_time&limit=10 and skip if the same title exists from the last 24 h.

**Test:** GET https://api.dailymotion.com/me?fields=id,screenname,limits with Authorization: Bearer <access_token> → 200 {"id":"x...","screenname":"YourChannel","limits":{...}} (read-only).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| invalid_client / 401 on token | Private API key used against api.dailymotion.com, or wrong secret | Create a PUBLIC API key; re-copy the secret |
| redirect_uri_mismatch | Callback URL differs from the one saved on the key | Make both byte-identical (scheme, port, trailing slash) |
| Video stays unpublished | is_created_for_kids or title missing, or published not set | POST /video/{id} with title, is_created_for_kids=false, published=true |
| Upload rejected / quota error | Daily 15-video or 10 h limit or file >4 GB/2 h | Check /me?fields=limits; wait 24 h or split the file |
| invalid_grant on refresh | Refresh token revoked or superseded | Re-run the authorization (steps 6–7 human) |

**Notes:** Use a PUBLIC API key with api.dailymotion.com; private keys are partner-only. is_created_for_kids is mandatory. Access tokens are short-lived (expires_in seconds, ~10 h per record, unverified); always refresh via refresh_token. No confirmed API scheduling field; schedule agent-side.

**Alternative:** Manual upload in Dailymotion Studio (https://studio.dailymotion.com → Upload). If the user is an organization partner: create a Private API key and use client_credentials against https://partner.api.dailymotion.com (steps: create key, POST /oauth/token grant_type=client_credentials, then same upload flow on the partner host).

## Douyin
_Route: `official_api_own_account`_ · Docs: https://developer.open-douyin.com/

**Before you start**
- Douyin account that will publish (mainland phone number).
- Douyin Open Platform (抖音开放平台, https://developer.open-douyin.com) developer account with entity verification - in practice a mainland-China enterprise with business license (营业执照) to create website/mobile apps (individual eligibility unverified).
- A website app with an ICP-filed domain (normally required (unverified)) and HTTPS redirect URL.
- Capability approval for publishing on behalf of users ('代替用户发布内容到抖音' / video.create scope) via the capability lab; review time days-weeks (unverified).
- Free API; Douyin enterprise account verification (企业号, about ¥300 per attempt) is separate and optional.

**Human does**
1. Open https://developer.open-douyin.com -> 登录 (scan QR with the Douyin app) -> 入驻 / developer registration -> choose 企业 -> fill company name, license number, upload 营业执照, contact person and phone -> submit. Wait for verification.
2. 控制台 (Console) -> 移动/网站应用 -> 创建应用 -> 网站应用: app name, icon, description, official website domain (ICP filed), category -> submit for review. Wait for approval.
3. In the app -> 能力管理 / 能力实验室 (capabilities) -> apply for '视频发布' / '代替用户发布内容到抖音' (scope video.create) and '获取用户公开信息' (user_info). Describe use case: 'publishing our own brand videos to our own Douyin account'. Wait for approval.
4. App -> 开发配置 / 应用信息 -> 授权回调域 (redirect domain) -> enter your HTTPS domain -> save (label may differ).
5. App -> 基本信息 -> copy Client Key and Client Secret to your password manager.
6. Open the agent's link https://open.douyin.com/platform/oauth/connect/?client_key=KEY&response_type=code&scope=user_info,video.create&redirect_uri=REDIRECT&state=STATE in a desktop browser, scan the QR with the Douyin app logged in as the publishing account, tap 同意授权 (agree). Hand the code (from the callback URL) to the agent within ~10 minutes.
7. Confirm: Douyin app -> 我 -> ☰ -> 设置 -> 隐私设置/授权管理 lists the app (label may differ).
8. Every ~30 days (refresh_token lifetime) the agent may ask you to re-authorize via the same link.

**Hand over to the agent (store as secrets)**
- `DOUYIN_CLIENT_KEY`: developer.open-douyin.com -> 控制台 -> app -> 基本信息. _(sensitivity: low)_
- `DOUYIN_CLIENT_SECRET`: Same page. _(sensitivity: high)_
- `DOUYIN_REDIRECT_URI`: Your callback URL on the registered domain. _(sensitivity: low)_
- `DOUYIN_OPEN_ID / DOUYIN_ACCESS_TOKEN / DOUYIN_REFRESH_TOKEN`: From the agent's code exchange. _(sensitivity: high)_

**Agent does**
1. Token: POST https://open.douyin.com/oauth/access_token/ Content-Type: application/json {"client_key":"KEY","client_secret":"SECRET","code":"CODE","grant_type":"authorization_code"} -> data.access_token (15 days), data.refresh_token (30 days), data.open_id, data.scope.
2. Refresh access token before day 15: POST https://open.douyin.com/oauth/refresh_token/ (form) client_key=KEY&grant_type=refresh_token&refresh_token=.. -> new access_token. Refreshing does NOT extend refresh_token; to extend it call POST https://open.douyin.com/oauth/renew_refresh_token/ client_key=KEY&refresh_token=.. before day 30 (unverified limits on renewals), else re-authorize.
3. Upload (<=128 MB): POST https://open.douyin.com/api/douyin/v1/video/upload_video/?open_id=OPEN_ID header access-token: TOKEN, multipart video=@clip.mp4 -> data.video.video_id. Larger: /api/douyin/v1/video/init_video_part_upload/ -> /upload_video_part/ (chunks) -> /complete_video_part_upload/ (paths unverified; legacy /video/part/init/ etc.).
4. Publish: POST https://open.douyin.com/api/douyin/v1/video/create_video/?open_id=OPEN_ID header access-token: TOKEN, Content-Type: application/json {"video_id":"VIDEO_ID","text":"Caption #topic","cover_tsp":1.0} -> data.item_id.
5. Scheduling: no schedule parameter found in public docs; the agent keeps the queue and calls create_video at the target Beijing time.
6. Idempotency: store video_id and item_id per item; never call create_video twice for the same video_id; on timeout check the account's list (POST /api/douyin/v1/video/video_list/?open_id=..&cursor=0&count=10, unverified path) before retrying.
7. Errors: 2190008 / 10008 access token expired -> refresh; 10010 refresh token expired -> re-authorize; scope errors -> capability not approved. Rate limits undisclosed; publish at most a few videos per day and back off exponentially on throttling errors.

**Content specs:** Video: MP4 (H.264) recommended; upload_video single request up to 128 MB; larger via part upload (init/upload/complete) (unverified exact limits).; Caption text with #topics and @mentions; recommended vertical 9:16, 1080x1920 (unverified).; Native creator center (creator.douyin.com) supports timed publish (定时发布) up to 14 days ahead (unverified).

**Test:** POST https://open.douyin.com/oauth/userinfo/ (form) access_token=TOKEN&open_id=OPEN_ID -> data.nickname, data.avatar (no publish).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| scope video.create not shown on authorize page | Capability not approved for the app | Apply in 能力管理 and wait for approval. |
| redirect_uri mismatch error | Callback domain not registered | Set 授权回调域 to exactly your domain. |
| access token invalid after 15 days | Not refreshed | Schedule refresh every ~10 days. |
| Video stuck in review / not visible | Douyin moderation | Check in the Douyin app; adjust content. |

**Notes:** Official docs could not be fetched directly (blocked); endpoint paths come from search snippets and third-party skills - confirm in the console. Without approval only the share-to-Douyin SDK/H5 flow (user confirms in app) is available.

**Alternative:** 1) Manual: https://creator.douyin.com -> 发布视频 (Upload) -> drag MP4 -> caption, #topics, cover -> 发布设置 '定时发布' -> pick time -> 发布. 2) App: + -> 相册 -> select video -> 下一步 -> caption -> 高级设置 -> 定时发布 (label may differ). 3) Agent prepares 9:16 MP4, cover frame and caption variants.

## Kuaishou / Kwai
_Route: `manual`_ · Docs: https://open.kuaishou.com

**Before you start**
- Kuaishou (China) account with mainland phone; or Kwai (international) account. Kwai has no public posting API found.
- Manual route: Kuaishou app (iOS/Android) or the web creator platform https://cp.kuaishou.com - no fees.
- Optional official API (China only): Kuaishou Open Platform (https://open.kuaishou.com) developer with mainland entity verification (business license expected), an app with the video publishing capability approved, OAuth redirect URI - free (unverified).

**Human does**
1. Desktop: open https://cp.kuaishou.com -> 登录 -> scan QR with the Kuaishou app (我 -> scan icon) and confirm login.
2. Click 发布作品 / 上传视频 (Publish) -> drag the MP4 the agent prepared into the upload box; wait until the progress bar reaches 100%.
3. Paste the caption from the agent's checklist into 作品描述; add #topics (type # then choose) and @mentions.
4. 封面 (cover): click 编辑封面 -> choose the frame time the agent suggested or upload the cover image.
5. Optional: 关联 settings (location, collection/合集) as needed; 谁可以看 (visibility) = 公开.
6. 发布设置 -> 定时发布 (scheduled) -> pick date/time from the checklist (label may differ). Otherwise choose 立即发布.
7. Click 发布. Confirm: 作品管理 lists the video as 审核中 (in review) or 定时 (scheduled); after review it shows 已发布.
8. Mobile alternative: Kuaishou app -> + (bottom centre) -> 相册 -> pick video -> 下一步 -> caption/cover -> 更多设置 -> 定时发布 (if offered) -> 发布.
9. Kwai (international): Kwai app -> + -> upload from gallery -> caption with #hashtags -> Post (no scheduling found).
10. After publishing, copy the share link (分享 -> 复制链接) back to the agent so it can log it.
11. OPTIONAL API (only if you have a China entity): https://open.kuaishou.com -> 注册开发者 (enterprise verification) -> 创建应用 -> apply for 视频发布 capability -> set 回调地址 -> copy app_id and app_secret -> open the agent's OAuth link and approve in the app.

**Agent does**
1. Prepare the video: ffmpeg -i in.mov -c:v libx264 -profile:v high -pix_fmt yuv420p -vf scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2 -c:a aac -b:a 128k -movflags +faststart out_kuaishou.mp4.
2. Extract a cover frame: ffmpeg -ss 00:00:02 -i out_kuaishou.mp4 -frames:v 1 cover_9x16.jpg; propose the frame timestamp.
3. Write 2 caption variants in Simplified Chinese (short hook <=50 chars + 3-5 #topics) and the Kwai variant in the target language.
4. Produce a ready-to-paste checklist: file names, caption, topics, cover time, target publish time in Beijing time (UTC+8), visibility.
5. Send a reminder 30 minutes before the target time (or the day before if using 定时发布), and log the share link the human returns.
6. OPTIONAL API if approved (endpoints unverified, from SDK docs): token GET https://open.kuaishou.com/oauth2/access_token?app_id=..&app_secret=..&code=..&grant_type=authorization_code -> access_token (~48 h reported; conflicting 2 h reports), refresh_token, open_id; refresh with GET /oauth2/refresh_token?app_id=..&app_secret=..&refresh_token=..&grant_type=refresh_token; upload POST https://open.kuaishou.com/openapi/photo/start_upload?app_id=..&access_token=.. -> upload_token + endpoint; upload file to endpoint; publish POST /openapi/photo/publish?app_id=..&access_token=..&upload_token=.. multipart caption, cover -> photo_id. No API scheduling found.

**Content specs:** Video: MP4 (H.264/AAC) recommended; vertical 9:16 1080x1920 recommended; web creator platform accepts large files (up to several GB) and long videos (exact limits unverified).; Caption with #topics and @mentions; keep the key message in the first line (exact character limit unverified, ~500).; Cover: pick a frame or upload 3:4 / 9:16 image (unverified).; Timed publish (定时发布) available in the web creator platform (unverified range).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Upload stuck or rejected format | Non-H.264 codec or variable frame rate | Re-encode with the ffmpeg command (yuv420p, faststart). |
| Post stays 审核中 for hours | Moderation queue | Wait; avoid editing; check messages in cp.kuaishou.com. |
| Login QR expires | QR not scanned within ~1-2 min | Refresh QR and scan again with the logged-in app. |

**Notes:** Official API needs a China entity and capability approval; endpoints and token lifetimes are from third-party SDK docs and remain unverified. Kwai (international) has no public posting API.

**Alternative:** 1) If a China entity is available: apply for the Kuaishou Open Platform video publishing capability and use the optional API steps. 2) Otherwise keep the manual creator-platform route with 定时发布.

## Odysee
_Route: `official_api_own_account`_ · Docs: https://lbry.tech/api/sdk

**Before you start**
- An Odysee account with a channel (free).
- An always-on Linux/macOS/Windows machine (or VPS) that can run the lbrynet daemon and keep it running until each file has been reflected; ~several GB free disk for the blob cache.
- A small amount of LBC (LBRY Credits) in the daemon's own wallet: every publish locks a bid deposit (e.g. 0.0001–0.01 LBC) plus a tiny transaction fee.
- No OAuth, no app review — the daemon signs claims with the channel key.

**Human does**
1. 1. Sign in at https://odysee.com and confirm your channel exists (avatar menu → 'Channels'); note its handle, e.g. @mychannel.
2. 2. On the server, download the latest lbrynet release for your OS from https://github.com/lbryio/lbry-sdk/releases (asset 'lbrynet-linux.zip' or similar), unzip, and run './lbrynet start' (keep it running, e.g. as a systemd service). It serves JSON-RPC on http://localhost:5279.
3. 3. In a second terminal check it works: './lbrynet status' → 'is_running': true. Wait until wallet sync completes (can take minutes).
4. 4. Note: the daemon creates a brand-new local wallet, NOT linked to your Odysee web wallet. You must either move the channel key into it (step 5) or create a new channel in the daemon (step 6).
5. 5. Move your existing channel (preferred): in a client that holds the channel key (LBRY Desktop with the same wallet synced, or any lbrynet that has the channel) run 'lbrynet channel export --channel_name=@mychannel' and copy the long serialized string; then on the server run 'lbrynet channel import --channel_data=<string>'. Whether odysee.com's web UI offers a channel-export button is (unverified) — if not, use LBRY Desktop signed in with the same account to export.
6. 6. Or create a new channel on the daemon: 'lbrynet channel create --name=@mychannel --bid=0.01' (requires LBC from step 7).
7. 7. Fund the daemon wallet: run 'lbrynet address unused', copy the bLBC address, and send ~1 LBC to it from Odysee (Wallet → Send) or an exchange. Confirm with 'lbrynet wallet balance'.
8. 8. Confirm 'lbrynet channel list' shows @mychannel with has_signing_key true (field name may differ).
9. 9. Back up the daemon wallet folder (~/.local/share/lbry/lbryum/wallets/) to an offline location. Never send the seed phrase to the agent.
10. 10. Give the agent the RPC URL and channel name; it runs the test call.

**Hand over to the agent (store as secrets)**
- `LBRYNET_API_URL`: Default http://localhost:5279 on the server running lbrynet (do not expose publicly) _(sensitivity: High — anyone who can reach it can spend the wallet and publish)_
- `LBRY_CHANNEL_NAME`: Your channel handle, e.g. @mychannel _(sensitivity: Low)_

**Agent does**
1. 1. All calls: POST $LBRYNET_API_URL, Content-Type: application/json, body {"method":"<name>","params":{...}}. No auth header (localhost only).
2. 2. Health: {"method":"status"} → result.is_running true; {"method":"wallet_balance"} → result.available ≥ bid + 0.01.
3. 3. Publish (upload + claim in one call): {"method":"publish","params":{"name":"my-video-2026-10-07","file_path":"/abs/path/video.mp4","bid":"0.001","title":"Title","description":"Text","tags":["tag1"],"languages":["en"],"channel_name":"@mychannel","thumbnail_url":"https://.../thumb.jpg","blocking":true}} → keep result.outputs[0].claim_id, permanent_url, txid.
4. 4. Wait for reflection: poll {"method":"file_list","params":{"claim_id":"<id>"}} until is_fully_reflected true (field name may differ); keep the daemon running until then. Public URL: https://odysee.com/@mychannel/my-video-2026-10-07.
5. 5. Video encoding: Odysee prefers web-optimized MP4 (H.264/AAC, faststart); the agent pre-transcodes with ffmpeg -movflags +faststart. Web upload limit is 4 GB (daemon publish size limit unverified).
6. 6. Scheduling: none (release_time only current/past). Store {file, metadata, publish_at} in the agent's scheduler and call publish at publish_at.
7. 7. Edit later: {"method":"stream_update","params":{"claim_id":"<id>","title":"New","blocking":true}}.
8. 8. No tokens to refresh. Rate limits: none documented; serialize publishes (one at a time) to avoid UTXO conflicts; retry on 'insufficient funds' only after topping up.
9. 9. Idempotency: the claim name is unique per channel — before publishing call {"method":"claim_search","params":{"channel":"@mychannel","name":"<name>"}} and skip if found.

**Test:** POST http://localhost:5279 {"method":"channel_list","params":{}} → {"result":{"items":[{"name":"@mychannel",...}],...}} (no publish).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 'Channel not found' or cannot sign | Channel key not in the daemon wallet | Import with channel_import or create the channel in the daemon |
| Insufficient funds | Daemon wallet has no LBC (separate from Odysee web wallet) | Send LBC to 'address unused' |
| Video not playable on Odysee | Not fully reflected or non-web-optimized encoding | Keep daemon running; re-encode H.264/AAC faststart |
| Connection refused on 5279 | Daemon not running or wallet still syncing | Start lbrynet; wait for status is_running |

**Notes:** This is the open-source LBRY SDK, not an Odysee-branded API; LBRY Inc. wound down and long-term support is not guaranteed. Deposits lock LBC while the claim exists. Livestreaming requires staking LBC on the channel (record says 50 LBC). Never expose port 5279 to the internet.

**Alternative:** Manual upload at https://odysee.com/$/upload (title, description, thumbnail, channel select, Upload). For channels that also post on YouTube: enable Odysee's YouTube Sync (https://odysee.com/$/youtube) so new YouTube uploads are mirrored automatically (availability/eligibility unverified).

## Snapchat
_Route: `scheduler_or_automation_tool`_ · Docs: https://developers.snap.com/marketing-api/Public-Profile-API/Introduction

**Before you start**
- A Snapchat account aged 18+ with a Public Profile (creator) or a Public Profile for Business linked to a Snap Business account (business.snapchat.com).
- Tool route: a scheduler that auto-publishes to Snapchat Stories/Spotlight, e.g. Ayrshare (API; Premium plan ~$149/mo per 2026 reports, unverified), Later, Metricool, OneUp, Sprout Social, Sked Social.
- Official Public Profile API: allowlist-only - you need a Snap point of contact who allowlists your OAuth client ID. Effectively unavailable to individuals without a Snap partner relationship.
- Media prepared vertically (9:16).

**Human does**
1. 1. In the Snapchat app: tap your Bitmoji (top left) > 'Public Profile' / 'Create Public Profile' (label may differ) > follow the prompts. For brands: create a Snap Business account at https://business.snapchat.com and create/link a Public Profile for Business there. Confirm: your profile shows the public profile card with a Subscribe button.
2. 2. Choose a scheduler. Ayrshare (API): sign up at https://app.ayrshare.com, choose a plan that includes Snapchat, then Social Accounts > Snapchat > 'Link' > log in with Snapchat > approve access to the Public Profile. Confirm: Snapchat shows as linked.
3. 3. Ayrshare: open the 'API Key' page in the dashboard (label may differ) and copy the key; give it to the agent as AYRSHARE_API_KEY.
4. 4. Without an API tool (Later/Metricool/OneUp): connect Snapchat there (Add profile > Snapchat > log in > Allow); the agent will prepare files + captions and you drag them into the calendar.
5. 5. Test: schedule one Story 10 minutes ahead in the tool and check it appears on your Public Profile Story at the time.
6. 6. Official route (only with a Snap contact): at https://business.snapchat.com > Business Details (Business settings) > 'OAuth Apps' (label may differ) > create app: name, redirect URI (HTTPS). Copy Client ID and Client Secret.
7. 7. Email your Snap point of contact the OAuth Client ID and intended use (posting Stories/Spotlight to your own Public Profile) and ask for Public Profile API allowlisting. Wait for confirmation.
8. 8. After allowlisting, open the authorization link from the agent and approve access with your Snapchat login.
9. 9. Native fallback: in the app, create the Snap, choose 'Save as draft' or post to 'My Story (Public)' / 'Spotlight' manually at the planned time (no native scheduling for Stories/Spotlight).

**Hand over to the agent (store as secrets)**
- `AYRSHARE_API_KEY`: app.ayrshare.com > API Key page (tool route) _(sensitivity: high (posts to all linked networks))_
- `SNAP_CLIENT_ID`: business.snapchat.com > Business Details > OAuth Apps (only if allowlisted) _(sensitivity: medium)_
- `SNAP_CLIENT_SECRET`: Same place; shown at creation _(sensitivity: high)_
- `SNAP_REFRESH_TOKEN`: Produced by the agent after you approve the OAuth consent (allowlisted route) _(sensitivity: high)_
- `SNAP_PUBLIC_PROFILE_ID`: Agent discovers via the Public Profile API (allowlisted route) _(sensitivity: low)_

**Agent does**
1. 1. Prepare media: one item per post; video MP4 (H.264/AAC), 9:16, 1080x1920 recommended, 5-60 s, under ~500 MB (Ayrshare lists up to 1 GB); image JPG/PNG 1080x1920. Keep captions short (Spotlight description length limit unverified).
2. 2. Tool route - host media at a public HTTPS URL (or Ayrshare media upload endpoint) and verify the URL returns 200 with correct Content-Type.
3. 3. Tool route - Story: POST https://api.ayrshare.com/api/post, headers Authorization: Bearer {AYRSHARE_API_KEY}, Content-Type: application/json; body {"post":"Caption","platforms":["snapchat"],"mediaUrls":["https://cdn.example.com/clip.mp4"],"scheduleDate":"2026-10-10T18:00:00Z"}. Saved Story: add "snapChatOptions":{"savedStory":true}; Spotlight: "snapChatOptions":{"spotlight":true} (exact option value shapes per Ayrshare docs; unverified). Keep the returned id/postIds.
4. 4. Tool route - status: GET https://api.ayrshare.com/api/post/{id} (Bearer) until status success; on error read errors[].message. Duplicate protection: Ayrshare rejects identical content within a window (unverified); store your own content hash per item too.
5. 5. Allowlisted route - OAuth: GET https://accounts.snapchat.com/login/oauth2/authorize?client_id={id}&redirect_uri={uri}&response_type=code&scope=snapchat-profile-api&state={rand}; exchange at POST https://accounts.snapchat.com/login/oauth2/access_token (form: grant_type=authorization_code, code, redirect_uri, client_id, client_secret). Access token ~1 h; refresh with grant_type=refresh_token at the same endpoint before expiry.
6. 6. Allowlisted route - media: encrypt the file with AES-256-CBC (random 32-byte key, 16-byte IV), split into chunks if > 32 MB; POST https://businessapi.snapchat.com/v1/public_profiles/{profile_id}/media (Bearer) with {type: VIDEO|IMAGE, name, key (base64), iv (base64)} -> media_id (container valid 24 h); upload the encrypted chunks via the multipart upload endpoint returned/documented (exact path unverified).
7. 7. Allowlisted route - publish: POST https://businessapi.snapchat.com/v1/public_profiles/{profile_id}/stories with {media_id}; Saved Stories and Spotlight have their own endpoints in Public Profile API docs (names unverified).
8. 8. Scheduling: Ayrshare scheduleDate handles it; for the official API hold items locally and publish at due time.
9. 9. Rate limits/backoff: limits not published (unverified); on 429/5xx retry with exponential backoff (30 s, 60 s, 120 s, max 4).
10. 10. Manual route checklist (no API): deliver the file named YYYY-MM-DD_HHMM_story.mp4, caption text, target (Story / Spotlight), topic hashtag for Spotlight, and send the user a reminder at the posting time.

**Test:** Tool route: GET https://api.ayrshare.com/api/user with 'Authorization: Bearer {AYRSHARE_API_KEY}' -> 200 JSON whose activeSocialAccounts includes "snapchat" (no post created). Allowlisted route: list public profiles via the Public Profile API (endpoint unverified) -> your profile id.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Ayrshare error that Snapchat is not linked / not supported on plan | Snapchat not linked or plan lacks Snapchat | Link Snapchat in Social Accounts; upgrade plan |
| Post rejected for media | Wrong aspect ratio, duration outside 5-60 s, multiple media items | Re-encode to 9:16 1080x1920, 5-60 s, single media URL |
| 401 from businessapi.snapchat.com | Access token expired (~1 h) or app not allowlisted | Refresh token; confirm allowlisting with your Snap contact |
| Media URL fetch failure | URL not public, redirects, or wrong Content-Type | Host on a direct HTTPS URL returning video/mp4 |
| Public Profile option missing in app | Account under 18 or region/eligibility | Use an eligible account or a Snap Business account |

**Notes:** No public self-serve posting API; Public Profile API is allowlist-only. No native scheduling for Stories/Spotlight (drafts only; a creator story-scheduling feature was announced but not confirmed - unverified). Creative Kit only opens Snapchat prefilled (user taps send) - not automation. developers.snap.com and ayrshare.com were blocked here; endpoints come from search snippets.

**Alternative:** (1) Later/Metricool/OneUp: connect Snapchat and upload the agent-prepared 9:16 videos into the calendar. (2) Manual: agent prepares file + caption + reminder; post in the app at the set time. (3) Official Public Profile API only if a Snap contact allowlists your OAuth client ID.

## TikTok
_Route: `scheduler_or_automation_tool`_ · Docs: https://developers.tiktok.com/doc/content-posting-api-get-started

**Before you start**
- A TikTok account (Creator or Business account recommended; required for TikTok Studio web scheduling).
- Tool route: an audited scheduler with TikTok Direct Post, e.g. Postiz (API), Buffer, Later, Metricool, Publer or Hootsuite (paid plans; prices vary).
- Official route: a TikTok for Developers account (https://developers.tiktok.com), an app with Login Kit + Content Posting API, app review, and a Content Posting audit for public posting. Unaudited apps: max 5 users posting per 24 h, account must be private, posts SELF_ONLY. Audit typically takes weeks (2-6 weeks reported; unverified).
- For official route: HTTPS website with Terms of Service and Privacy Policy pages, a 1024x1024 app icon, and a verified domain if using PULL_FROM_URL.
- Free API.

**Human does**
1. 1. Tool route (fastest public posting): sign up at https://postiz.com (or Buffer/Later/Metricool). 'Add Channel' > 'TikTok' > log in to TikTok > on TikTok's consent screen click 'Authorize'/'Continue'. Confirm: TikTok avatar appears as a connected channel.
2. 2. Postiz: Settings > Developers > Public API > copy key; give it to the agent as POSTIZ_API_KEY. (Buffer/Later: the agent prepares files and captions and you schedule in their UI, unless you have their API access.)
3. 3. In the TikTok app ensure the account is public (Profile > menu > Settings and privacy > Privacy > 'Private account' OFF) for the tool route.
4. 4. Official route: open https://developers.tiktok.com > 'Log in' > register as developer (individual or organization). Confirm: you reach 'Manage apps'.
5. 5. Manage apps > 'Connect an app' (label may differ): App name, icon (1024x1024 PNG), category, description, Terms of Service URL, Privacy Policy URL; Platforms: 'Web' with your website URL. Save.
6. 6. Add products: 'Login Kit' (add Redirect URI, must be HTTPS, e.g. https://yourdomain.com/tiktok/callback) and 'Content Posting API' (toggle 'Direct Post' ON). Scopes: user.info.basic, video.publish, video.upload. Copy Client key and Client secret to your password manager.
7. 7. If the agent will use PULL_FROM_URL or photo posts: Content Posting API > 'Manage URL properties' > add your domain or URL prefix > verify via DNS TXT record or by uploading the provided signature file. Confirm: status Verified.
8. 8. Sandbox: in the app switch to Sandbox (label may differ) > 'Target users' > add your TikTok account; accept the invite in the TikTok app if prompted. Test the full flow.
9. 9. Submit the app for review: write a usage explanation and upload a demo video showing login, the compose screen with creator nickname, privacy picker (no default), comment/duet/stitch toggles, commercial-content disclosure, and the successful post. Wait for review email.
10. 10. While unaudited: set your TikTok account to Private before each post (posts land as SELF_ONLY). Then submit the Content Posting audit form (expected daily posts/users, use case). After approval, set the account public and tell the agent to offer PUBLIC_TO_EVERYONE.
11. 11. Authorize: open the link the agent sends (https://www.tiktok.com/v2/auth/authorize/?...) while logged into TikTok and click 'Authorize'.

**Hand over to the agent (store as secrets)**
- `POSTIZ_API_KEY`: Postiz > Settings > Developers > Public API (tool route) _(sensitivity: high)_
- `TIKTOK_CLIENT_KEY`: developers.tiktok.com > Manage apps > your app > Client key _(sensitivity: medium)_
- `TIKTOK_CLIENT_SECRET`: Same page > Client secret _(sensitivity: high)_
- `TIKTOK_REDIRECT_URI`: Login Kit > Redirect URI (exact HTTPS URL) _(sensitivity: low)_
- `TIKTOK_REFRESH_TOKEN`: Produced by the agent after you click Authorize; valid 365 days _(sensitivity: high)_

**Agent does**
1. 1. Tool route: GET https://api.postiz.com/public/v1/integrations (header 'Authorization: {key}') -> id of the tiktok integration. Upload video: POST https://api.postiz.com/public/v1/upload multipart file=<mp4> -> {id,path}. Schedule: POST https://api.postiz.com/public/v1/posts {"type":"schedule","date":"2026-10-10T17:00:00.000Z","shortLink":false,"tags":[],"posts":[{"integration":{"id":"<id>"},"value":[{"content":"Caption #tag","image":[{"id":"<upload id>","path":"<upload path>"}]}],"settings":{"__type":"tiktok","title":"","privacy_level":"PUBLIC_TO_EVERYONE","duet":false,"stitch":false,"comment":true,"autoAddMusic":"no","brand_content_toggle":false,"brand_organic_toggle":false,"video_made_with_ai":false,"content_posting_method":"DIRECT_POST"}}]}. Note: content_posting_method UPLOAD only sends to the TikTok inbox (user must publish within 24 h) though Postiz reports success.
2. 2. Official - authorize: https://www.tiktok.com/v2/auth/authorize/?client_key={key}&response_type=code&scope=user.info.basic,video.publish,video.upload&redirect_uri={urlencoded uri}&state={rand} (add code_challenge/code_challenge_method=S256 for desktop/mobile apps).
3. 3. Token: POST https://open.tiktokapis.com/v2/oauth/token/, Content-Type: application/x-www-form-urlencoded, body client_key={key}&client_secret={secret}&code={code}&grant_type=authorization_code&redirect_uri={uri}. Keep access_token (expires_in 86400), refresh_token (refresh_expires_in ~31536000), open_id, scope.
4. 4. Before every post: POST https://open.tiktokapis.com/v2/post/publish/creator_info/query/, headers Authorization: Bearer {token}, Content-Type: application/json; charset=UTF-8 -> data.creator_nickname, privacy_level_options, comment_disabled, duet_disabled, stitch_disabled, max_video_post_duration_sec. Only use a privacy_level from the options (SELF_ONLY while unaudited).
5. 5. Direct Post video init: POST https://open.tiktokapis.com/v2/post/publish/video/init/ body {"post_info":{"title":"Caption #tag","privacy_level":"SELF_ONLY","disable_comment":false,"disable_duet":false,"disable_stitch":false,"brand_content_toggle":false,"brand_organic_toggle":false},"source_info":{"source":"FILE_UPLOAD","video_size":30567100,"chunk_size":10000000,"total_chunk_count":3}} (or {"source":"PULL_FROM_URL","video_url":"https://verified-domain/v.mp4"}) -> data.publish_id, data.upload_url (valid ~1 h). Init is limited to 6 requests/min per user token.
6. 6. Upload: PUT each chunk to upload_url with headers Content-Type: video/mp4, Content-Length: {chunk bytes}, Content-Range: bytes {first}-{last}/{total}. Chunks 5-64 MB each (last may be larger, up to 128 MB); files under 5 MB in one chunk (official media transfer guide; exact numbers unverified here).
7. 7. Status: POST https://open.tiktokapis.com/v2/post/publish/status/fetch/ {"publish_id":"..."} every 5-10 s until status PUBLISH_COMPLETE (keep publicaly_available_post_id if present) or FAILED (read fail_reason).
8. 8. Photo post: POST https://open.tiktokapis.com/v2/post/publish/content/init/ {"post_info":{"title":"max 90","description":"max 4000","privacy_level":"SELF_ONLY","disable_comment":false,"auto_add_music":true},"source_info":{"source":"PULL_FROM_URL","photo_cover_index":0,"photo_images":["https://verified-domain/1.jpg"]},"post_mode":"DIRECT_POST","media_type":"PHOTO"} (image count/format limits unverified: third-party guides say 1-10 JPG/JPEG images, each under 20 MB; title max 90 and description max 4000 UTF-16 runes per official reference snippets).
9. 9. Draft/inbox alternative (scope video.upload): POST https://open.tiktokapis.com/v2/post/publish/inbox/video/init/ {"source_info":{...}} -> user gets a notification and finishes posting in the TikTok app.
10. 10. Refresh: daily (access token 24 h): POST https://open.tiktokapis.com/v2/oauth/token/ body client_key&client_secret&grant_type=refresh_token&refresh_token={rt}; store returned tokens. Re-authorize before 365 days.
11. 11. Scheduling and limits: no publish-at parameter; hold posts locally and call init at due time. Per creator ~15 direct posts/24 h shared across all apps; per-client caps set by audit. On 429 / rate_limit_exceeded wait 60 s+. Idempotency: record publish_id per queue item; never re-init an item that already has a publish_id unless status is FAILED.

**Test:** Official route: POST https://open.tiktokapis.com/v2/post/publish/creator_info/query/ with 'Authorization: Bearer {token}' and 'Content-Type: application/json; charset=UTF-8' -> 200 {"data":{"creator_nickname":"...","privacy_level_options":["SELF_ONLY",...],"max_video_post_duration_sec":600,...},"error":{"code":"ok"}} (nothing posted). Tool route: GET https://api.postiz.com/public/v1/integrations -> includes providerIdentifier 'tiktok'.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| error.code 'unaudited_client_can_only_post_to_private_accounts' | App not audited and account is public or privacy_level not SELF_ONLY | Set account private and use SELF_ONLY, or pass the Content Posting audit |
| spam_risk_too_many_posts / daily cap error | Creator posted ~15 times in 24 h across all apps | Wait 24 h; spread posts |
| access_token_invalid / 401 next day | 24 h access token expired | Refresh with the refresh token daily |
| url_ownership_unverified on PULL_FROM_URL | Media domain not verified in Manage URL properties | Verify domain/prefix or switch to FILE_UPLOAD |
| Status FAILED with file_format_check_failed or duration error | Video codec/length unsupported or longer than max_video_post_duration_sec | Re-encode H.264/AAC MP4, 9:16, within allowed duration |
| Post never appears though tool says success | Tool used UPLOAD (inbox) mode | Open TikTok app inbox and finish the post within 24 h, or switch to DIRECT_POST |

**Notes:** Unaudited apps = private-only posts and 5 users/24 h. TikTok's UX rules (creator nickname shown, privacy picker without default, interaction toggles, commercial disclosure) are checked in review. Native TikTok Studio (desktop web) schedules videos up to 10 days ahead for Creator/Business accounts, not from the mobile app. developers.tiktok.com was blocked here; facts from search snippets of official pages.

**Alternative:** Official Content Posting API after audit (human steps 4-11, agent steps 2-11); before audit use the inbox/draft flow (video.upload) so the user taps Post in the app. Manual fallback: agent prepares a 9:16 H.264 MP4 + caption, user uploads at https://www.tiktok.com/tiktokstudio/upload and uses 'Schedule' (up to 10 days).

## Vimeo
_Route: `official_api_own_account`_ · Docs: https://developer.vimeo.com/api/upload/videos

**Before you start**
- A vimeo.com account that will own the videos. Any plan works, but a paid plan (Starter/Standard/Advanced or legacy Plus/Pro/Business; prices vary by region and billing cycle, check vimeo.com/upgrade) gives upload access without review, more storage and higher API rate limits (250 / 500 / 1,000 requests per rolling 15 min depending on plan).
- Free (Basic) plan: upload access must be requested and is manually reviewed (up to 5 business days).
- No business verification needed for a single-user app; no server needed (personal access token does not expire).
- A place the agent can read video files from: either a local disk (tus upload) or a direct-download HTTPS URL (pull upload).

**Human does**
1. 1. Sign in at https://vimeo.com/log_in with the account that should own the uploads. Confirm the plan at https://vimeo.com/settings/subscription (label may differ) and note it (Free vs paid) because it decides whether step 4 is needed.
2. 2. Open https://developer.vimeo.com/apps and click 'Create an app' (button top right). If prompted, accept the developer terms.
3. 3. In the dialog: App name = e.g. 'My Upload Agent'; App description = 'Private uploader for my own account'; 'Will people besides you be able to access your app?' = 'No. The only Vimeo accounts that will have access to the app are my own.' Tick the terms box and click 'Create App'. You land on the app page; the 'Client identifier' is shown at the top.
4. 4. FREE PLAN ONLY: on the app page scroll to 'Permissions' (label may differ) and next to 'Upload Access' click 'Request Additional Access' / 'Request Upload Access'. Describe the use ('uploading my own videos to my own account from an automation'), submit, and wait for the approval email (up to 5 business days). Paid plans: Upload Access already shows as granted; skip.
5. 5. On the same app page, in the left column click 'Generate Access Token' (or scroll to 'Generate an access token').
6. 6. Choose 'Authenticated (you)'. Under Scopes tick: Public, Private, Edit, Upload (these four are required to upload). Add 'Delete' only if the agent should be able to delete videos, and 'Video Files' only if it needs direct file links. Click 'Generate'.
7. 7. The page reloads and the token appears unobscured under 'Personal Access Tokens'. Copy it immediately into your password manager as VIMEO_ACCESS_TOKEN (treat it as shown once).
8. 8. Optional: if videos should go into a Showcase, open https://vimeo.com/manage/showcases, open the showcase, copy the number from the URL (album id) as VIMEO_SHOWCASE_ID.
9. 9. Hand the secrets to the agent and ask it to run the test call; confirm it reports your account name and remaining upload quota.
10. 10. To revoke later: same app page → Personal Access Tokens → the trash/delete icon next to the token (label may differ), then generate a new one.

**Hand over to the agent (store as secrets)**
- `VIMEO_ACCESS_TOKEN`: developer.vimeo.com/apps → your app → Generate Access Token → Personal Access Tokens list _(sensitivity: High — full edit/upload access to the account; does not expire until revoked)_
- `VIMEO_SHOWCASE_ID`: Optional; number in the showcase URL at vimeo.com/manage/showcases _(sensitivity: Low)_

**Agent does**
1. 1. Headers on every call: Authorization: bearer $VIMEO_ACCESS_TOKEN; Accept: application/vnd.vimeo.*+json;version=3.4; Content-Type: application/json (for JSON bodies).
2. 2. Preflight: GET https://api.vimeo.com/me?fields=uri,name,upload_quota → keep uri (/users/{id}) and upload_quota.space.free / periodic.free; abort if file size > free quota.
3. 3a. Local file (tus, resumable): POST https://api.vimeo.com/me/videos body {"upload":{"approach":"tus","size":"<bytes>"},"name":"Title","description":"Text","privacy":{"view":"nobody"}} → keep uri (/videos/{id}), link, upload.upload_link.
4. 3b. Then PATCH {upload_link} with headers Tus-Resumable: 1.0.0, Upload-Offset: <current offset, 0 at start>, Content-Type: application/offset+octet-stream and the next chunk of bytes as body (chunks of e.g. 128–512 MB, smaller on slow links). The response Upload-Offset header is the new offset; repeat until it equals size. To resume after a failure: HEAD {upload_link} with Tus-Resumable: 1.0.0 and read Upload-Offset.
5. 3c. Alternative when the file is at a public direct-download URL: POST https://api.vimeo.com/me/videos {"upload":{"approach":"pull","link":"https://example.com/video.mp4"},"name":"Title","privacy":{"view":"nobody"}} — Vimeo fetches the file itself.
6. 4. Poll GET https://api.vimeo.com/videos/{id}?fields=upload.status,transcode.status every 30–60 s until upload.status=complete and transcode.status=complete (error → stop and report).
7. 5. Optional extras: thumbnail POST https://api.vimeo.com/videos/{id}/pictures (returns an upload link, then PUT image bytes, then PATCH active=true) (unverified detail); captions POST /videos/{id}/texttracks {"type":"captions","language":"en","name":"English"} then PUT the .vtt to the returned link; showcase PUT https://api.vimeo.com/me/albums/{album_id}/videos/{video_id} (path may also be /albums/{id}/videos/{id}) (unverified).
8. 6. Scheduling (no publish-at field in the core API): upload with privacy.view=nobody (or unlisted); store {video_id, publish_at} in the agent's own scheduler (cron/queue). At publish_at: PATCH https://api.vimeo.com/videos/{id} {"privacy":{"view":"anybody"}} → expect 200 with privacy.view=anybody.
9. 7. Token refresh: none needed — personal access tokens do not expire. On 401, stop and ask the human for a new token.
10. 8. Rate limits: read X-RateLimit-Limit / X-RateLimit-Remaining / X-RateLimit-Reset on every response; if Remaining < 10 sleep until Reset; on 429 back off exponentially (30 s, 60 s, 120 s…).
11. 9. Idempotency: before creating, GET https://api.vimeo.com/me/videos?query=<exact title>&fields=uri,name,created_time&per_page=10 and skip if the same title was created in the last 24 h; persist the returned video uri immediately after step 3 so a crash resumes the tus upload instead of creating a second video.

**Test:** GET https://api.vimeo.com/me?fields=name,uri,upload_quota with headers Authorization: bearer $VIMEO_ACCESS_TOKEN and Accept: application/vnd.vimeo.*+json;version=3.4 → 200 {"uri":"/users/123","name":"Your Name","upload_quota":{"space":{"free":...,"max":...},...}} (read-only).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 403 / 'You don't have permission' on POST /me/videos | Free plan app without approved Upload Access, or token lacks the upload scope | Request upload access on the app page (free plan) or regenerate the token with Public+Private+Edit+Upload |
| 401 Unauthorized | Token revoked, mistyped, or 'bearer' prefix missing | Check the header format; generate a new token |
| transcode.status=error | Corrupt or unsupported file / pull link points to an HTML page | Re-encode to H.264 MP4; for pull use a direct file URL |
| tus PATCH returns 409/412 | Upload-Offset mismatch or missing Tus-Resumable header | HEAD the upload_link, use the returned offset, include Tus-Resumable: 1.0.0 |
| 429 Too Many Requests | Exceeded the 15-minute plan limit | Sleep until X-RateLimit-Reset, then retry |

**Notes:** Upload access is automatic on paid plans; free plans need review. Tokens from the app page never expire unless revoked. Uploads consume plan storage/weekly quota (GET /me upload_quota). Core Vimeo has no scheduled release (only Vimeo OTT does), so scheduling = private upload + agent-side PATCH. Pull uploads need a directly downloadable URL. Some account-type names changed over time; plan names above may differ.

**Alternative:** Zapier 'Vimeo → Upload Video' action (no developer app): 1) connect Vimeo in Zapier, 2) create a Zap 'Webhooks by Zapier (Catch Hook) → Vimeo Upload Video' mapping file URL/title, 3) the agent POSTs {"file_url":...,"title":...} to the hook URL. Last resort: manual upload at https://vimeo.com/upload.

## YouTube
_Route: `official_api_own_account`_ · Docs: https://developers.google.com/youtube/v3/docs/videos/insert

**Before you start**
- Google account with a YouTube channel (personal or Brand Account); 2-Step Verification recommended.
- Phone-verified channel (https://www.youtube.com/verify) for videos longer than 15 min and custom thumbnails.
- Google Cloud project (free; no billing account needed for YouTube Data API).
- OAuth client (Desktop app) + test user; Testing mode is enough for your own channel but refresh tokens expire after 7 days.
- YouTube API Services compliance audit to publish publicly via API (projects created after 28 Jul 2020 that are unaudited have all uploads forced to private); takes weeks; free; requires privacy policy URL.
- Optional for production OAuth verification: a website/domain you own, verified in Google Search Console, with a privacy policy page.
- The agent needs somewhere to run (laptop or server) with the video files on disk; no paid plan required.

**Human does**
1. Open https://console.cloud.google.com and sign in (any Google account with 2-Step Verification is fine; you authorize with the account that owns the channel/blog/business later). Top bar → project picker (left of the search box) → 'New project' → Project name: e.g. 'my-posting-agent' → Location: 'No organization' → Create. Wait ~30 s, then pick the project in the project picker. Confirm: the project name shows in the top bar.
2. Left menu (☰) → 'APIs & Services' → 'Library' → search 'YouTube Data API v3' → open each result → click 'Enable'. Confirm: the API page now shows 'API enabled' and a 'Manage' button.
3. Left menu → 'APIs & Services' → 'OAuth consent screen' (opens 'Google Auth Platform'; label may differ) → 'Get started'. App information: App name 'my-posting-agent', User support email: pick your address → Next. Audience: 'External' → Next. Contact information: your email → Next. Tick 'I agree to the Google API Services: User Data Policy' → Continue → Create.
4. Google Auth Platform → 'Data access' → 'Add or remove scopes' → in 'Manually add scopes' paste https://www.googleapis.com/auth/youtube.upload and https://www.googleapis.com/auth/youtube.readonly (and https://www.googleapis.com/auth/youtube.force-ssl only if the agent must set thumbnails/captions/playlists — youtube.upload alone covers uploads) → 'Add to table' → tick them → 'Update' → 'Save'. Confirm: they appear under 'Your sensitive scopes' (or restricted/non-sensitive).
5. Google Auth Platform → 'Audience' → 'Test users' → '+ Add users' → type the Google account that owns the channel/blog/business → Save. Leave 'Publishing status: Testing' for now (refresh tokens then expire after 7 days).
6. Google Auth Platform → 'Clients' → '+ Create client' → Application type: 'Desktop app' → Name: 'agent-desktop' → Create. In the dialog click 'Download JSON' (file client_secret_XXXX.json containing client_id and client_secret) and keep it in your password manager. (If the agent runs on a server and gives you an https redirect URI, choose 'Web application' instead and paste that URI under 'Authorised redirect URIs'.) Note: the client secret is only fully visible at creation time.
7. Make sure the channel exists and is phone-verified: https://www.youtube.com/verify → enter phone number → enter the SMS code. Confirm at https://studio.youtube.com → Settings → Channel → 'Feature eligibility' shows 'Intermediate features' enabled (needed for videos >15 min and custom thumbnails).
8. Find the channel ID: https://www.youtube.com/account_advanced → copy 'Channel ID' (starts with UC…). Hand it to the agent as YOUTUBE_CHANNEL_ID.
9. Send the client JSON (or GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET) to the agent through a secure channel (password manager share / secret store, not chat).
10. When the agent sends a Google sign-in link: open it, choose the Google account that owns the channel; if the channel is a Brand Account, pick the channel name in the 'Choose an account or brand account' list. On 'Google hasn't verified this app' click 'Advanced' → 'Go to my-posting-agent (unsafe)' → tick 'Manage your YouTube videos' (and 'View your YouTube account') → Continue. The browser lands on a 127.0.0.1 page/'success' message. Confirm: https://myaccount.google.com/connections lists 'my-posting-agent'.
11. To allow public/scheduled-public uploads (otherwise every API upload is locked to Private): open https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits → 'YouTube API Services - Audit and Quota Extension Form' → fill: organisation, project number (Cloud console → IAM & Admin → Settings → Project number), API client description, screenshots/screencast of the tool, privacy policy URL, how you store user data; accept YouTube API Services Terms. Expect a reply by email in weeks; YouTube may ask follow-up questions.
12. To stop the 7-day re-login: Google Auth Platform → 'Audience' → 'Publish app' → Confirm (status 'In production'). For a single-user personal tool you can stay unverified (sign-in shows a warning, max 100 users). Full verification needs Branding (home page, privacy policy, authorised domain verified in Google Search Console) + Data access justification + demo video for youtube.upload. After publishing, ask the agent to send a fresh sign-in link (old Testing tokens still expire).
13. Optional, for fully native scheduling instead: https://studio.youtube.com → Create → Upload videos → … → Visibility → 'Schedule' → pick date/time → Schedule.

**Hand over to the agent (store as secrets)**
- `GOOGLE_CLIENT_ID`: console.cloud.google.com → Google Auth Platform → Clients → your Desktop client (also in the downloaded JSON as installed.client_id) _(sensitivity: Low (public identifier) but keep with the secret)_
- `GOOGLE_CLIENT_SECRET`: Downloaded client JSON (installed.client_secret); console shows it only at creation, otherwise add a new secret under the client _(sensitivity: High — store in a secret manager)_
- `GOOGLE_REFRESH_TOKEN`: Obtained by the agent at the first sign-in (token endpoint response 'refresh_token'); never shown in the console _(sensitivity: Critical — grants upload rights to the channel; revoke at https://myaccount.google.com/connections)_
- `YOUTUBE_CHANNEL_ID`: https://www.youtube.com/account_advanced → Channel ID (UC…) _(sensitivity: Public)_

**Agent does**
1. Auth (once): open a loopback listener on http://127.0.0.1:<port> and send the human: GET https://accounts.google.com/o/oauth2/v2/auth?client_id=<GOOGLE_CLIENT_ID>&redirect_uri=http://127.0.0.1:<port>&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload%20https://www.googleapis.com/auth/youtube.readonly&access_type=offline&prompt=consent&code_challenge=<S256(verifier)>&code_challenge_method=S256&state=<random>. Verify 'state' on return.
2. Token exchange: POST https://oauth2.googleapis.com/token, header Content-Type: application/x-www-form-urlencoded, body code=<code>&client_id=…&client_secret=…&redirect_uri=http://127.0.0.1:<port>&grant_type=authorization_code&code_verifier=<verifier>. Keep refresh_token (store encrypted), access_token, expires_in (~3599 s), scope.
3. Refresh before each job (or when <5 min left): POST https://oauth2.googleapis.com/token with grant_type=refresh_token&refresh_token=…&client_id=…&client_secret=… → new access_token. On 400 invalid_grant ('Token has been expired or revoked') stop and ask the human to sign in again (Testing mode = every 7 days; also after 6 months unused or password change).
4. Start resumable upload: POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status with headers Authorization: Bearer <access_token>, Content-Type: application/json; charset=UTF-8, X-Upload-Content-Length: <bytes>, X-Upload-Content-Type: video/mp4; body {"snippet":{"title":"My clip","description":"…","tags":["tag1"],"categoryId":"22","defaultLanguage":"en"},"status":{"privacyStatus":"private","publishAt":"2026-10-10T15:00:00Z","selfDeclaredMadeForKids":false,"containsSyntheticMedia":false}}. Keep the 'Location' response header (session URI, valid ~1 week).
5. Upload bytes: PUT <Location> with Content-Length: <bytes>, Content-Type: video/mp4, body = file (or chunks in multiples of 256 KiB with Content-Range: bytes 0-<n>/<total>). 308 = continue from the 'Range' header; 200/201 = done → keep id (video id), status.uploadStatus, status.privacyStatus. On 5xx or connection loss: PUT <Location> with Content-Range: bytes */<total> to learn the offset, then resume with exponential backoff (1,2,4,8… s).
6. Shorts: upload a vertical (9:16) or square video ≤3 min the same way; no special flag (#Shorts in title/description optional).
7. Scheduling: status.privacyStatus='private' + status.publishAt (RFC 3339 UTC, future) makes YouTube publish it; only valid while the video has never been public. Until the audit passes the video stays private regardless — then the agent runs its own scheduler and the human flips visibility in Studio. To reschedule: PUT https://www.googleapis.com/youtube/v3/videos?part=status with {"id":"<videoId>","status":{"privacyStatus":"private","publishAt":"…"}}.
8. Thumbnail (optional, verified channel): POST https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=<id>&uploadType=media, Content-Type: image/jpeg or image/png, body = image ≤2 MB (1280×720 recommended). Playlist: POST https://www.googleapis.com/youtube/v3/playlistItems?part=snippet with {"snippet":{"playlistId":"PL…","resourceId":{"kind":"youtube#video","videoId":"<id>"}}} (needs youtube or youtube.force-ssl scope).
9. Check processing: GET https://www.googleapis.com/youtube/v3/videos?part=status,processingDetails&id=<id> → status.uploadStatus ('uploaded'→'processed'), status.rejectionReason/failureReason.
10. Quota (since 1 Jun 2026): videos.insert has its own bucket of 100 calls/day per project; search.list its own 100/day; other calls share 10,000 units/day (list ≈1 unit, update ≈50). Resets at midnight Pacific. On 403 quotaExceeded wait until reset; on 400/403 uploadLimitExceeded (channel daily cap) retry next day; on 429/5xx exponential backoff with jitter, max ~5 retries.
11. Idempotency: before uploading, keep a local job record (hash of file + title) and the session URI; if a job restarts, resume the same session instead of starting a new one. After a crash with unknown result, GET https://www.googleapis.com/youtube/v3/search is costly — instead list recent uploads via GET https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=<uploads playlist = channelId with UC→UU>&maxResults=10 and match the title before re-uploading.

**Test:** GET https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true with Authorization: Bearer <access_token> → 200 {"items":[{"id":"UC…","snippet":{"title":"<your channel>"},"contentDetails":{"relatedPlaylists":{"uploads":"UU…"}}}]} (1 quota unit, posts nothing). Optional second test: upload a 5-second clip with privacyStatus=private → 200 with {"id":"<videoId>","status":{"uploadStatus":"uploaded","privacyStatus":"private"}}; it appears as Private in YouTube Studio → Content; delete it there.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Uploaded video is Private even though privacyStatus was 'public' or publishAt passed | Project has not passed the YouTube API Services compliance audit (post-28 Jul 2020 projects are locked private) | Submit the audit form; meanwhile change visibility manually in YouTube Studio or use an audited scheduler |
| 400 invalid_grant 'Token has been expired or revoked' on refresh | Consent screen in Testing mode (7-day refresh tokens), password change, user revoked access, or token unused 6 months | Re-run sign-in; publish the app to 'In production' to get long-lived tokens |
| 403 quotaExceeded | Daily upload bucket (100 videos.insert) or 10,000-unit pool used up | Wait for midnight Pacific reset; reduce list calls; request more via the audit/quota extension form |
| 400 uploadLimitExceeded or 'The user has exceeded the number of videos they may upload' | Channel-level daily upload limit | Retry after 24 h; verify the channel by phone |
| 403 forbidden / youtubeSignupRequired or wrong channel | Signed in with a Google account that has no channel, or picked the personal account instead of the Brand Account | Revoke at myaccount.google.com/connections, sign in again and choose the brand channel in the account chooser |
| thumbnails.set returns 403 | Channel not verified for custom thumbnails or scope missing | Verify at youtube.com/verify; include youtube.upload or youtube.force-ssl scope |

**Notes:** Unaudited projects (created after 28 Jul 2020): every API upload is locked private. Testing-mode refresh tokens die 7 days after consent — re-run sign-in weekly or publish the app. No Community/text/image posts via API. Old tutorials quoting 1,600 units per upload are outdated (changed Dec 2025; separate 100/day upload bucket since Jun 2026). Videos >15 min need a phone-verified channel. Declare altered/synthetic content with status.containsSyntheticMedia. API is free. Upload session URIs expire after about a week (unverified).

**Alternative:** 1) Until the audit passes, connect the channel in an audited scheduler (Buffer, Publer, Metricool, Later or Hootsuite) via its UI. 2) The agent creates posts through that scheduler's API (e.g. Publer/Buffer API with the scheduler's key) passing the video URL and publish time. 3) Or: the agent uploads via API as Private, then sends the human a reminder with the YouTube Studio link (studio.youtube.com/video/<id>/edit) to set Visibility → Schedule.

## PeerTube
_Route: `official_api_own_account`_ · Docs: https://docs.joinpeertube.org/api-rest-reference.html

**Before you start**
- An account on a PeerTube server that allows uploads (some servers require admin approval of new accounts; wait time varies by server).
- Enough video quota (shown in My account -> Settings / My library).
- A channel on that account (created at signup or via My library -> Channels -> Create).
- Ideally a dedicated account for automation, because the API login uses username + password.

**Human does**
1. 1. Sign in at your server in a browser (https://<server>/login).
2. 2. Check quota: avatar menu -> My account -> Settings (label may differ) -> 'Video quota' shows used/total; daily quota too.
3. 3. Find the channel to publish to: My library -> Channels; note the channel handle (e.g. mychannel@server) - the agent will look up its numeric id.
4. 4. Security choice: if 2FA is ON (My account -> Settings -> Two-factor authentication), every password login needs a fresh OTP. For unattended use either create a dedicated upload account without 2FA, or accept that the agent asks you for a code when the 2-week refresh token lapses.
5. 5. Use a unique strong password for this account; store it as PEERTUBE_PASSWORD; username as PEERTUBE_USERNAME; server URL as PEERTUBE_INSTANCE_URL (e.g. https://video.example.org).
6. 6. Hand the three values to the agent via your secret store.
7. 7. Confirm: the agent calls /api/v1/users/me and reports your username, channels and quota.
8. 8. Optional test: the agent uploads a short private video; you see it under My library -> Videos with a lock icon; delete it.
9. 9. Native scheduling (manual equivalent): on upload choose Privacy -> 'Scheduled' and pick the date/time - the API does the same with scheduleUpdate.
10. 10. To revoke the agent: change the password (invalidates logins) and/or My account -> Settings -> sessions/token list -> revoke (label may differ).

**Hand over to the agent (store as secrets)**
- `PEERTUBE_INSTANCE_URL`: Your server address _(sensitivity: Low)_
- `PEERTUBE_USERNAME`: Your login username _(sensitivity: Low)_
- `PEERTUBE_PASSWORD`: Your account password (use a dedicated account) _(sensitivity: Critical - full account control)_
- `PEERTUBE_CHANNEL (optional)`: My library -> Channels -> handle _(sensitivity: Low)_

**Agent does**
1. 1. Client creds: GET $PEERTUBE_INSTANCE_URL/api/v1/oauth-clients/local -> {client_id, client_secret} (public per server; cache).
2. 2. Token: POST /api/v1/users/token, Content-Type: application/x-www-form-urlencoded, body client_id=...&client_secret=...&grant_type=password&username=...&password=... (add header x-peertube-otp: <code> if 2FA) -> access_token (~1 day), refresh_token (~2 weeks), expires_in. Persist.
3. 3. Refresh: before expiry POST /api/v1/users/token grant_type=refresh_token&refresh_token=...&client_id=...&client_secret=... -> new pair. If the refresh token has expired, redo step 2.
4. 4. GET /api/v1/users/me (Authorization: Bearer <access_token>) -> videoChannels[].id (pick channelId by name), videoQuota, videoQuotaUsed.
5. 5. Resumable upload init: POST /api/v1/videos/upload-resumable, headers Authorization, Content-Type: application/json, X-Upload-Content-Length: <bytes>, X-Upload-Content-Type: video/mp4; body {"name":"Title (3-120 chars)","channelId":12,"filename":"clip.mp4","privacy":3,"description":"...","tags":["tag1","tag2"],"language":"en","category":15,"scheduleUpdate":{"updateAt":"2026-10-08T09:00:00Z","privacy":1}} -> 201 with Location header (…?upload_id=...).
6. 6. Chunks: PUT <Location> with Content-Type: application/octet-stream, Content-Length, Content-Range: bytes 0-10485759/<total> -> 308 Resume Incomplete (Range header tells what is stored) until the last chunk -> 200 {video:{id, uuid, shortUUID}}. On failure resume from the Range reported.
7. 7. Small files alternative: POST /api/v1/videos/upload multipart: videofile=@clip.mp4, channelId, name, privacy, scheduleUpdate[updateAt], scheduleUpdate[privacy] (form keys, not JSON).
8. 8. Scheduling: privacy 3 (private) + scheduleUpdate {updateAt, privacy:1 public} - the server publishes at that time. Reschedule with PUT /api/v1/videos/{id} {scheduleUpdate:{...}}.
9. 9. Import by URL instead of upload: POST /api/v1/videos/imports {targetUrl, channelId, name, privacy}.
10. 10. Idempotency: before re-uploading after an error, GET /api/v1/users/me/videos?search=<title> to see if the video already exists; DELETE /api/v1/videos/{id} to remove duplicates.
11. 11. Limits: per-server quota (413 or 403 'quota exceeded'), max file size per server; transcoding may take minutes - poll GET /api/v1/videos/{id} state.

**Test:** curl -s -H "Authorization: Bearer $ACCESS" $PEERTUBE_INSTANCE_URL/api/v1/users/me -> 200 {username, videoChannels:[...], videoQuota, videoQuotaDaily} (no upload).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| 400 invalid_grant on token | Wrong password, or 2FA on without x-peertube-otp | Check credentials; send OTP header or use a non-2FA dedicated account |
| 401 invalid_token | Access token expired (~1 day) | Refresh with refresh_token; if expired re-login |
| 413 / 403 quota exceeded | File too large or quota used | Ask admin for more quota or compress |
| Scheduled video stays private | scheduleUpdate missing/invalid updateAt, or sent as stringified JSON in multipart | Use JSON for upload-resumable or scheduleUpdate[updateAt] form keys; check with GET /api/v1/videos/{id} |
| Video not playable after upload | Transcoding in progress | Wait and poll the video's state |

**Notes:** Password-only API login - use a dedicated account. Per-server quotas and file size limits apply. Transcoding happens after upload. Federation spreads public videos to other instances.

**Alternative:** 1) n8n: Schedule/Webhook trigger -> HTTP Request (token) -> HTTP Request (upload multipart) with the calls above. 2) Or upload in the web UI: Publish -> Upload a file -> Privacy: Scheduled -> pick date -> Publish.

## Pinterest
_Route: `official_api_own_account`_ · Docs: https://developers.pinterest.com/docs/api/v5/pins-create/

**Before you start**
- A Pinterest business account (free; convert a personal one) with at least one board.
- A Pinterest developer app (free). Approval path: app request -> Trial access (1,000 requests/day per app; Pins created are hidden from the public) -> Standard access via upgrade request with a video demo of the OAuth flow and a Pin being created (required even for single-user apps). Review times vary; many 2026 community reports of pending requests for weeks.
- A website URL and privacy policy URL to put in the app request (a simple personal page is fine).
- Screen recording software for the Standard access demo (Postman or terminal recordings accepted).
- No API cost.

**Human does**
1. 1. Business account: on pinterest.com click your profile picture > Settings > Account management > 'Convert to a business account' (or create one at https://www.pinterest.com/business/create/). Fill business name, website, category. Confirm: profile shows business tools (Analytics).
2. 2. Create at least one board: profile > '+' > Board > name it. Note the board name for the agent.
3. 3. Open https://developers.pinterest.com/apps/ and click 'Connect app' (app request form; label may differ). Fill: App name, App description ('Publish Pins from my own content to my own boards'), Company/website URL, Privacy policy URL, use case. Submit. Wait for the approval email (Trial access). Confirm: app status shows 'Trial access'.
4. 4. In the app's page > Configure (label may differ): add Redirect URI exactly as the agent gives it (e.g. https://localhost:8765/callback). Copy 'App id' and click 'Show key' to copy the 'App secret key' into your password manager.
5. 5. Hand PINTEREST_APP_ID, PINTEREST_APP_SECRET, PINTEREST_REDIRECT_URI to the agent; open the authorization link it sends (https://www.pinterest.com/oauth/?...) and click 'Give access'. Confirm: agent reports your username.
6. 6. Record the Standard-access demo: start a screen recording, have the agent run the OAuth flow (show the Pinterest consent screen) and create a test Pin via POST /v5/pins (show the request and the 201 response). Keep it 1-3 minutes.
7. 7. Back on the app page click 'Upgrade' / 'Request Standard access' (label may differ). Upload the video, describe usage (single user, own boards, expected volume e.g. 10 Pins/day). Submit and wait; check email and https://community.pinterest.biz for status issues.
8. 8. After Standard approval, ask the agent to recreate any Trial-era Pins (sandbox Pins stay hidden) and re-authorize if prompted.
9. 9. Optional: set up Pinterest's built-in RSS auto-publish (Settings > Bulk create Pins > Auto-publish, label may differ) for a blog feed as a no-API alternative.
10. 10. Revoke access later: Settings > Security and logins (or 'Apps', label may differ) > remove the app.

**Hand over to the agent (store as secrets)**
- `PINTEREST_APP_ID`: developers.pinterest.com/apps > your app > App id _(sensitivity: low-medium)_
- `PINTEREST_APP_SECRET`: Same page > App secret key ('Show key'); can be reset _(sensitivity: high)_
- `PINTEREST_REDIRECT_URI`: Exact redirect URI registered on the app _(sensitivity: low)_
- `PINTEREST_REFRESH_TOKEN`: Produced by the agent after you click 'Give access'; continuous refresh token valid 60 days and refreshable indefinitely _(sensitivity: high)_
- `PINTEREST_BOARD_ID`: Agent reads it from GET /v5/boards _(sensitivity: low)_

**Agent does**
1. 1. Authorize: send user to https://www.pinterest.com/oauth/?client_id={app_id}&redirect_uri={urlencoded uri}&response_type=code&scope=boards:read,boards:write,pins:read,pins:write,user_accounts:read&state={rand}. Validate state.
2. 2. Token: POST https://api.pinterest.com/v5/oauth/token, headers Authorization: Basic base64(app_id:app_secret), Content-Type: application/x-www-form-urlencoded; body grant_type=authorization_code&code={code}&redirect_uri={uri}&continuous_refresh=true. Keep access_token (expires_in ~30 days), refresh_token, refresh_token_expires_in (~60 days), scope. (Legacy 365-day non-continuous refresh tokens are no longer issued.)
3. 3. Identity and boards: GET https://api.pinterest.com/v5/user_account (Bearer) -> username, account_type (must be BUSINESS). GET https://api.pinterest.com/v5/boards?page_size=50 -> items[].id, name; GET /v5/boards/{board_id}/sections for board_section_id.
4. 4. Image Pin: POST https://api.pinterest.com/v5/pins, Bearer, JSON {"board_id":"123","title":"Max 100 chars","description":"Up to 500 chars","link":"https://example.com/post","alt_text":"Up to 500 chars","media_source":{"source_type":"image_url","url":"https://example.com/img.jpg"}} (or {"source_type":"image_base64","content_type":"image/jpeg","data":"<base64>"}; multi-image: source_type multiple_image_urls). Keep id -> https://www.pinterest.com/pin/{id}/.
5. 5. Video Pin: POST https://api.pinterest.com/v5/media {"media_type":"video"} -> media_id, upload_url, upload_parameters (key, policy, x-amz-* fields, Content-Type). POST multipart/form-data to upload_url with every upload_parameters field exactly as returned, then field file=<video>. Poll GET https://api.pinterest.com/v5/media/{media_id} until status = succeeded. Then POST /v5/pins with media_source {"source_type":"video_id","media_id":"...","cover_image_url":"https://...jpg"}. Video Pins count as two write calls.
6. 6. Scheduling: no publish-at parameter for organic Pins in v5; keep a local queue and create Pins at due time.
7. 7. Refresh: when access token is within 2 days of expiry or on 401: POST https://api.pinterest.com/v5/oauth/token (Basic auth) body grant_type=refresh_token&refresh_token={rt}. Store the returned refresh_token (continuous: new 60-day window each refresh) - refresh at least every ~30 days so it never lapses.
8. 8. Rate limits: Trial = 1,000 requests/day per app universal cap plus category caps (~300/day for write categories); Standard = per-minute per-user limits (Pin creation ~100 calls/min, third-party figure). Read x-ratelimit-remaining headers if present; on 429 back off 60 s then exponentially.
9. 9. Idempotency: Pinterest does not dedupe; store a hash (board_id + image URL + title) and the returned Pin id; before retrying a timed-out create, GET https://api.pinterest.com/v5/boards/{board_id}/pins?page_size=5 and compare titles.
10. 10. During Trial: tell the user Pins are only visible to the creator; do not count them as published.

**Test:** GET https://api.pinterest.com/v5/user_account with 'Authorization: Bearer {token}' -> 200 {"username":"yourname","account_type":"BUSINESS",...} (no Pin created).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Pins created (201) but not visible to anyone else | App still on Trial access (sandboxed Pins) | Request Standard access with the demo video; re-create Pins after approval |
| 401 Unauthorized after ~30 days | Access token expired | Refresh with grant_type=refresh_token; if refresh token also expired (>60 days unused), re-authorize |
| 403 'Your application consumer type is not supported' or scope errors | Missing scope (pins:write/boards:read) at authorization or account not business | Re-authorize with all scopes; convert to business account |
| 429 Too Many Requests early in the day | Trial universal cap 1,000/day per app or category cap reached | Wait until the daily reset; batch reads; get Standard access |
| Video Pin create fails / media status 'failed' | Upload parameters altered or unsupported video | Send upload_parameters exactly as returned; MP4/MOV H.264; re-register media |
| redirect_uri mismatch on consent page | URI differs from the one on the app | Register the exact URI in the app configuration |

**Notes:** Free API but Trial Pins are sandbox-only; Standard approval timing is unpredictable in 2026. Business account required. Continuous refresh tokens (60 days, refreshable indefinitely) replaced 365-day legacy tokens in 2025. Native scheduler: up to 30 days ahead, max 10 scheduled Pins; RSS auto-publish exists for blogs. developers.pinterest.com was blocked here; facts from search snippets and community posts.

**Alternative:** Use an approved partner: (1) Connect Pinterest in Postiz, Buffer, Tailwind or Later (Add channel > Pinterest > 'Give access'). (2) Postiz: GET https://api.postiz.com/public/v1/integrations for the pinterest id. (3) POST https://api.postiz.com/public/v1/posts {"type":"schedule","date":"<ISO>","shortLink":false,"tags":[],"posts":[{"integration":{"id":"<id>"},"value":[{"content":"Description","image":[{"id":"<upload id>","path":"<upload path>"}]}],"settings":{"__type":"pinterest","board":"<board id>","title":"Pin title","link":"https://...","dominant_color":""}}]}. (4) Or Pinterest's own scheduler (30 days, 10 Pins) / RSS auto-publish.

## Clubhouse
_Route: `manual`_ · Docs: https://www.clubhouse.com

**Before you start**
- Clubhouse account (free) on an iPhone or Android phone with the Clubhouse app installed; sign-up by phone number
- A verified phone number that receives SMS
- Microphone and a quiet place to speak; audio is live or recorded inside the app
- No paid plan, API key or developer approval exists or is needed

**Human does**
1. 1. Update the Clubhouse app from the App Store/Google Play and log in with your phone number (enter the SMS code). Confirm: your home feed loads.
2. 2. Open the agent's event pack (title <=60 chars, description <=200 chars, date/time with time zone, co-host @usernames, talking-points script).
3. 3. To schedule a live event: on the home screen tap the calendar icon at the top, then the calendar-with-plus icon (label may differ; in newer builds look for 'Schedule' or '+' > 'Schedule a room').
4. 4. In 'Event name' paste the agent's title; tap 'Add a co-host or guest' and pick the co-hosts listed by the agent.
5. 5. Set 'Date' and 'Time' exactly as in the agent's schedule (the app uses your phone's time zone). If the app offers a House/club selector, choose the House the agent named (label may differ).
6. 6. Paste the description into 'Description' and tap 'Publish'. Confirm: the event appears in your Upcoming list.
7. 7. Open the event, tap the share icon > 'Copy link' and paste the link back to the agent (it is used in promo posts on other platforms).
8. 8. About 10 minutes before start (agent reminder), open the event and tap 'Start room'; keep the talking-points script open on a second device.
9. 9. Speak live; invite co-hosts to the stage; end the room when done. If the app offers replay/recording, toggle it on before starting (availability unverified).
10. 10. For asynchronous voice chats: open the chat/group, hold the record button, read the agent's 60-120 s script, release and tap send. Confirm: the voice message shows in the chat.
11. 11. Tell the agent the event happened (or was cancelled) so it can post follow-ups and update the calendar.

**Agent does**
1. 1. Draft the event pack: title (<=60 chars, hook first), description (<=200 chars, who/what/why), date/time in the person's time zone and ISO 8601, co-host list.
2. 2. Write a talking-points script with timings (intro 2 min, segments, Q&A, close) and a 60-120 s voice-chat script variant.
3. 3. Prepare promo posts for other channels that include the event link once the human returns it (placeholder {EVENT_LINK}).
4. 4. Create calendar reminders: 24 h before (promo push), 30 min before (prep), 10 min before (open the app and start the room).
5. 5. Keep a ready-to-paste checklist per event: title, description, co-hosts, time, link-to-collect, after-event recap post.
6. 6. After the event, draft a recap post and, if the person recorded audio elsewhere, prepare it for a podcast host (see alternative route).

**Content specs:** Live rooms/events: event name up to 60 characters; event description up to 200 characters (per 2021-era how-to guides, verify in-app) ; co-hosts optional; audio spoken live in the room, no pre-recorded upload. Room types historically Open / Social / Closed (labels may differ). Voice chats (post-2023 product): voice messages recorded in-app inside a chat/group; no file upload, no scheduling of voice messages. Links: put the event link (shared from the event screen) in posts on other platforms; links inside descriptions may not be clickable (unverified). No hashtags.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Cannot find the schedule/calendar icon | App redesign after the 2023 pivot to voice chats moved event scheduling | Update the app; look under the '+' / start button or your House page for 'Schedule'; if absent, start the room live at the planned time and promote with a direct room link (unverified) |
| Followers are not notified | Notification settings or small follower graph | Share the event link on other platforms 24 h and 1 h before start |
| Room audio drops | Weak network | Use Wi-Fi, close other apps, keep the phone plugged in |

**Notes:** No official API and no third-party scheduler integrations. Product pivoted in 2023 toward asynchronous voice chats among friends; live rooms/events still exist but menus change. Audio must be spoken by the human in-app. Character limits (60/200) come from third-party guides. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Record the talk as a podcast instead: 1) record with any recorder; 2) the agent edits/encodes MP3 and writes show notes; 3) upload to a podcast host with an RSS feed (e.g. Spotify for Creators); 4) share the episode link where Clubhouse promos would go.

## Medium
_Route: `rss_or_import`_ · Docs: https://help.medium.com/hc/en-us/articles/213480228-API-Importing

**Before you start**
- Medium account (free) at https://medium.com; Medium membership (paid, about $5/month or $50/year, unverified current price) only needed for the Partner Program, not for publishing
- A public URL of the article on your own site (for Import), or the article text for manual paste
- Desktop browser (Import is a desktop/web feature)
- No new API tokens are issued; integration tokens created before the cutoff still work but are unsupported

**Human does**
1. 1. Publish the canonical article on your own site/blog first (the agent prepares clean HTML/Markdown). Copy its public URL. Confirm: the URL opens in a private window.
2. 2. Go to https://medium.com and log in. Click your profile picture (top right) > 'Stories'.
3. 3. Click 'Import a story' (top right). Paste the article URL into the field and click 'Import'. Wait a few seconds.
4. 4. Click 'See your story'. The draft opens in the editor; check headings, images, links and code blocks against the agent's checklist. Fix any missing images by dragging the files the agent exported.
5. 5. If Import shows a blank or broken page, close it, open https://medium.com/new-story and paste the agent's ready-to-paste text block instead; insert images at the marked positions.
6. 6. Click 'Publish' (top right). In the publish menu, in 'Story preview' set the preview image, title and subtitle the agent gave.
7. 7. Under topics, type up to 5 topics from the agent's list and press Enter after each.
8. 8. To publish now: click 'Publish now'. To schedule: click 'Schedule for later' (label may differ), choose date and time (your local time zone) and click 'Schedule to publish'.
9. 9. Confirm: Stories > 'Scheduled' (or Drafts with a scheduled badge) lists the story with the chosen time; after publishing it appears under 'Published'.
10. 10. Copy the published Medium URL and give it to the agent for cross-promotion and records.
11. 11. Optional: share your Medium RSS feed (https://medium.com/feed/@yourusername) with the agent so it can confirm the story went live.

**Agent does**
1. 1. Prepare the canonical article on the person's site: semantic HTML (one H1, H2/H3 sections), images with alt text and absolute URLs, no scripts-only content so Medium's importer can parse it.
2. 2. Produce Medium extras: title variant (<~100 chars), subtitle (~140 chars), 5 topics, preview image (wide JPG), and a schedule time in the person's local time zone.
3. 3. Produce a ready-to-paste fallback block (plain text with [IMAGE n] markers) plus numbered image files for manual paste.
4. 4. Write a checklist: URL to import, title, subtitle, topics, preview image, schedule date/time.
5. 5. Set reminders: one at the planned import time, one 10 minutes after the scheduled publish to verify.
6. 6. Verify publication without credentials by polling the public feed: GET https://medium.com/feed/@{username} (RSS) and checking for the new item link; then draft promo posts with the Medium URL.

**Content specs:** Title and subtitle (set in the editor and in the Publish menu 'Story preview'); keep title under ~100 characters (unverified guidance). Up to 5 topics (tags) per story. Images inserted inline (JPG/PNG/GIF); feature/preview image chosen in Story preview, ideally wide (~1400 px+, unverified). Embeds via pasted URLs (YouTube, X, Gist etc.). Imported stories keep the original publication date and add a canonical link to the source. Scheduled stories publish within about 5 minutes of the set time in your local time zone; edits made before then are included.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Import produces a blank or partial story | Medium's importer cannot parse the page (JS-rendered, paywall, blocked bots) | Use a static HTML version or paste manually into medium.com/new-story (see Medium help 'Trouble importing content') |
| Scheduled story not live at the set time | Publishing runs up to ~5 minutes after the time; time zone mismatch | Wait 5-10 minutes; check the time zone shown in the schedule dialog |
| Images missing after import | Relative or hot-link-protected image URLs | Use absolute public image URLs or upload images manually in the editor |
| Old integration token returns 401 | Token revoked or API closed to new integrations | Do not rely on the legacy API; use Import or manual paste |

**Notes:** Medium's API is closed to new integrations and no new tokens are issued; an existing pre-cutoff token may still create posts via the legacy API but it is unsupported. Import backdates to the original publish date and sets canonical link (good for SEO). Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Manual editor: 1) open https://medium.com/new-story; 2) paste the agent's text block and insert images; 3) Publish > set topics and preview; 4) Schedule for later.

## Naver Blog
_Route: `native_scheduler`_ · Docs: https://developers.naver.com/

**Before you start**
- Naver account (free) with a blog at https://blog.naver.com/{naverid}; Korean phone verification is commonly required for new accounts (unverified for foreigners)
- Desktop browser (SmartEditor ONE) or the Naver Blog app (iOS/Android)
- No API: Naver Developers (https://developers.naver.com) only offers search/read APIs; the blog write API/XML-RPC is no longer usable

**Human does**
1. 1. Log in at https://www.naver.com, then open https://blog.naver.com and click '글쓰기' (Write). SmartEditor ONE opens; if a 'continue previous draft' prompt appears, choose 취소 (cancel) for a new post.
2. 2. Click the title area '제목' and paste the agent's Korean title.
3. 3. Click into the body and paste the agent's body section by section. For each [IMAGE n] marker click '사진' (Photo) in the top toolbar and upload image n from the agent's folder (files are numbered in order).
4. 4. Under each image, click the caption line and paste the agent's caption. Add the video with '동영상' if the pack includes one.
5. 5. Click the green '발행' (Publish) button at the top right. The publish panel opens.
6. 6. In '카테고리' pick the category the agent named; in '태그 편집' paste the tags (each starting with #).
7. 7. In '공개 설정' choose 전체공개 (public) unless the agent specified otherwise; leave comments/sharing options as the agent listed.
8. 8. In '발행 시간' select '예약' (scheduled), choose date and time (KST unless your account is set otherwise), then click '발행' to confirm.
9. 9. Confirm: the post shows under 내 블로그 > 글 관리 (post management) with a scheduled (예약) status (label may differ).
10. 10. Mobile alternative: Naver Blog app > pencil icon > write > top-right 등록/발행 > 예약 발행 settings (labels may differ).
11. 11. After it publishes, copy the post URL (https://blog.naver.com/{id}/{postNo}) and send it to the agent.

**Agent does**
1. 1. Write the post in Korean (or the target language): SEO title, intro, H2-style sections, image captions, closing, plus category and up to ~30 tags.
2. 2. Resize images to >=966 px wide JPG (quality ~85) and name them 01.jpg, 02.jpg... in insertion order; compress video to MP4 H.264/AAC.
3. 3. Produce a ready-to-paste document with [IMAGE n] markers and captions directly under each marker.
4. 4. Produce a posting calendar in KST with publish times and a reminder 1 day before (prepare) and at publish time + 10 min (verify).
5. 5. Verify publication via the public blog RSS: GET https://rss.blog.naver.com/{naverid}.xml and check the newest item (unverified URL pattern).
6. 6. Draft cross-promotion posts with the final post URL.

**Content specs:** Title plus rich body built from SmartEditor ONE blocks (text, photo, video, quote, divider, place/map, link). Images JPG/PNG/GIF; recommended width 966 px or wider for full-width display (unverified). Video uploads supported (size/length limits unverified). One category per post; tags up to ~30 (unverified). Visibility: 전체공개 (public) / 이웃공개 / 서로이웃공개 / 비공개. Scheduling: 발행 > 발행 시간 '예약' with date/time. Daily posting cap reported as 10 posts per account per day (unverified).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| No '예약' option in 발행 time | Old editor or app version | Use the PC SmartEditor ONE at blog.naver.com or update the app |
| Images appear small | Image narrower than editor width or layout set to small | Use >=966 px images and set the photo to full width in the editor |
| Post cannot be published (limit message) | Daily publish limit reached (unverified 10/day) | Schedule the post for the next day |

**Notes:** No sanctioned programmatic posting. Naver Post is being shut down; Naver is focusing on Blog. Unofficial auto-posting extensions/bots exist (e.g. 'OPO'); Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Mobile app immediate publish: 1) transfer images to the phone; 2) Naver Blog app > write; 3) paste text and images; 4) publish (or use the app's 예약 option).

## Patreon
_Route: `native_scheduler`_ · Docs: https://docs.patreon.com/

**Before you start**
- Patreon creator account (free to create; Patreon takes a platform fee on earnings, unverified current %)
- Desktop browser (https://www.patreon.com) or the Patreon app
- For audio: a podcast host with a public RSS feed (optional, for official RSS sync)
- API v2 exists (OAuth) but has no create-post endpoint; developer support paused since 2020

**Human does**
1. 1. Log in at https://www.patreon.com and open your creator page.
2. 2. Click 'Create' in the left sidebar; if you also sell digital products choose 'Post' from the drop-down.
3. 3. Type/paste the agent's title in the title field (required) and paste the body text.
4. 4. Attach the media the agent exported (image/video/audio buttons in the editor) and any downloadable files under attachments.
5. 5. In the right-side editor set access: 'Public' or the tiers the agent listed (labels may differ).
6. 6. In 'Email and notifications' leave 'Allow members to be notified when this post is published' on (or toggle off if the agent says so).
7. 7. Toggle 'Set publish date', pick the date and time from the agent's schedule.
8. 8. Click 'Schedule' at the top of the page. Confirm: the post appears in your Library with the scheduled date.
9. 9. (Audio creators, one time) Settings (left sidebar) > 'Podcast and audio' > '+ New podcast' > 'Sync with another platform', paste your host's RSS feed URL, choose publish immediately or save as drafts. Confirm: past episodes appear in Library.
10. 10. Mobile: Patreon app > Create (+) > Post, fill the same fields, use the schedule option (label may differ).
11. 11. After publishing, send the post URL to the agent.

**Agent does**
1. 1. Prepare title, body, tier access plan, public teaser text, and media files (images JPG/PNG, video MP4 H.264, audio MP3).
2. 2. Produce a ready-to-paste checklist: title, body, attachments in order, access setting, notification on/off, publish date/time.
3. 3. For podcasters: validate the host RSS feed (it must contain audio enclosures) and confirm the sync mode (publish vs draft).
4. 4. Keep a schedule list mapping posts to dates; remind the human 1 day before to schedule and 10 min after to verify.
5. 5. Optional read-only checks via API v2 (if the person provides a creator access token): GET https://www.patreon.com/api/oauth2/v2/campaigns with Authorization: Bearer <token> to read campaign data; posting is not possible (unverified that posts list is available for all accounts).

**Content specs:** Title required. Post body text, images, video, audio, polls, links, file attachments. Access: public or specific tiers/paid members. Scheduling: right-side editor 'Set publish date' (future or backdated). Notifications toggle in 'Email and notifications'. Podcast RSS sync imports audio episodes only (video items in the feed are skipped), published immediately or saved as drafts.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Video episodes not appearing after RSS sync | Sync imports audio only | Upload video manually as a post |
| Members not notified | Notification toggle off | Check 'Email and notifications' before scheduling |
| Scheduled post visible to wrong audience | Access set to Public instead of tiers | Edit the post in Library > change access before publish time |

**Notes:** The podcast RSS sync is the only official hands-off route and covers audio only. Patreon API v2 cannot create posts. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Manual immediate publish from the Patreon mobile app: 1) open app > Create; 2) paste title/body; 3) attach media; 4) Publish.

## Lemon8
_Route: `manual`_ · Docs: https://www.lemon8-app.com

**Before you start**
- Lemon8 account (free) in the Lemon8 app (iOS/Android); sign-up with phone/email or TikTok/Apple/Google login (unverified list)
- Smartphone (posting is app-based)
- No API, no developer program, no third-party scheduler integration; US operations run by the TikTok USDS Joint Venture since 2026-01-22

**Human does**
1. 1. Transfer the agent's numbered images/video (01.jpg...) to the phone's camera roll (AirDrop, Google Drive, or Files).
2. 2. Open Lemon8 and log in. Confirm: your profile shows.
3. 3. Tap the '+' button at the bottom center.
4. 4. Select media in the agent's numbered order (tap 01 first). Tap 'Next'.
5. 5. Choose the cover (first image or the agent's text-overlay cover); apply templates/text only if the agent asked. Tap 'Next'.
6. 6. Paste the agent's title into the title field.
7. 7. Paste the caption into the body field; paste the hashtags at the end (or use the '#' button).
8. 8. Select the topic/category the agent named and add location if requested.
9. 9. Tap 'Post'. There is no confirmed native scheduler, so post at the time of the agent's reminder (if a 'Schedule' option appears in your build, use it; unverified).
10. 10. Confirm: the post shows on your profile; copy its link (share icon > Copy link) and send it to the agent.

**Agent does**
1. 1. Export images as 3:4 JPG 1080x1440 px (sRGB, <~5 MB each, unverified ceiling), max 10 per post; make a cover with large title text overlay.
2. 2. If video is used: MP4 H.264/AAC, 1080x1440 or 1080x1920, <=60 s.
3. 3. Write a short catchy title, a list-style caption (~150 words), and 5-10 hashtags; provide 2 caption variants.
4. 4. Name files in posting order and bundle them in one shared folder per post.
5. 5. Send a reminder at the planned posting time with the ready-to-paste checklist (title, caption, hashtags, topic, file order).

**Content specs:** Photo carousels up to 10 images/videos per post (third-party guide; dataset's earlier '<=3' is not confirmed) with optional collage counting as one slot; vertical 3:4 recommended (1080x1440 px); video up to 60 s (third-party, verify in-app); title field plus caption (no hard caption limit reported; ~150 words performs well per guides); 5-10 hashtags; choose a topic/category. Links in captions are not clickable (unverified).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Some photos missing after selecting | Exceeded the per-post media limit | Keep to <=10 items or merge into a collage |
| Images cropped | Non-3:4 aspect ratio | Re-export at 1080x1440 |
| Cannot log in with TikTok | Regional/joint-venture account changes | Use email/phone login (unverified) |

**Notes:** No public API or scheduler integrations; native scheduling not found (unverified). Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Repurpose via TikTok: 1) publish to TikTok via TikTok's official Content Posting API or app; 2) in Lemon8 use the in-app TikTok connection/import where offered (unverified availability); 3) edit the caption for Lemon8 and post.

## Xiaohongshu (RedNote)
_Route: `native_scheduler`_ · Docs: https://open.xiaohongshu.com/

**Before you start**
- Xiaohongshu/RedNote account (free) in the app; phone number verification (Chinese or international number)
- Desktop browser for the creator platform https://creator.xiaohongshu.com (login by scanning a QR code with the app)
- No public publishing API for individuals; open platform APIs (https://open.xiaohongshu.com) are for certified enterprises/partners

**Human does**
1. 1. Open https://creator.xiaohongshu.com in a desktop browser and click login; scan the QR code with the Xiaohongshu app (Me > scan icon). Confirm: the creator dashboard opens.
2. 2. Click '发布笔记' (Publish note) in the left menu.
3. 3. Choose the tab '上传图文' (image note) or '上传视频' (video note) (labels may differ).
4. 4. Upload the agent's files in numbered order (drag the folder contents); for video, upload the MP4 and the cover image via '设置封面'.
5. 5. Paste the title (<=20 characters) into '填写标题'.
6. 6. Paste the body into the description field; add #topics by typing # and selecting suggestions from the agent's list.
7. 7. If the content is AI-generated, enable the content declaration (内容类型声明) option.
8. 8. Set visibility (公开 public) and optional location.
9. 9. Choose '定时发布' (scheduled publishing), pick date and time (China Standard Time), then click '发布'. Confirm: the note appears under 笔记管理 with a scheduled status.
10. 10. Mobile alternative: app > '+' > select media > edit > next > paste title/body > publish (scheduling option availability in-app unverified).
11. 11. After it goes live, share the note link (分享 > 复制链接) with the agent.

**Agent does**
1. 1. Export images 3:4 1080x1440 JPG (<=18) with a text-overlay cover; video MP4 H.264/AAC 1080x1920 with a 3:4 cover image.
2. 2. Write the title (<=20 Chinese characters; aim <=18), body (<=1000 characters; aim <=950), and 3-10 Chinese #topics; no external links or contact details.
3. 3. Flag whether the AI-content declaration is required.
4. 4. Produce a posting calendar in CST with times and a ready-to-paste checklist per note.
5. 5. Remind the human at scheduling time and 10 min after publish time to verify and collect the note link.

**Content specs:** Image notes (图文): up to 18 images, 3:4 vertical recommended (1080x1440) or 1:1. Video notes (视频): 9:16 vertical recommended, roughly 5 s to 15 min (third-party, verify). Title <=20 characters; body <=1000 characters; up to ~10 #topics (extra may be dropped, third-party). AI-generated content must be declared; no off-platform traffic diversion (links/contact info) is allowed. Long-form notes and scheduled publishing (定时发布) available on the creator platform.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Title rejected or truncated | Over 20 characters | Shorten to <=18 characters |
| Note limited/low reach (限流) | External links, contact info, too many hashtags or undeclared AI content | Remove links/contacts, keep <=10 topics, declare AI content |
| QR login fails | App version or account region | Update the app; log in with phone + SMS code on the web if offered |

**Notes:** Personal accounts have no sanctioned API. Many 'xhs publisher' skills/bots drive the creator site via browser automation; Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Post from the mobile app: 1) transfer files to phone; 2) '+' > select media in order; 3) paste title/body/topics; 4) publish at the reminded time.

## Messenger
_Route: `manual`_ · Docs: https://developers.facebook.com/docs/messenger-platform/send-messages

**Before you start**
- A Facebook Page (Messenger is the Page's inbox, not a posting surface — publish content via Facebook Pages).
- Optional auto-reply bot: Meta developer app with use case 'Engage with customers on Messenger from Meta', Page token with pages_messaging (+ pages_manage_metadata for webhooks), an HTTPS webhook endpoint; own Page works in Development mode.
- No free broadcast: Recurring Notifications discontinued 10 Feb 2026 (except AU, EU, JP, KR, UK); several message tags removed in 2026; paid Marketing Messages API replaces broadcasts.

**Human does**
1. Publish content to your Facebook Page instead (see Facebook Pages setup).
2. Set inbox automations: https://business.facebook.com → Inbox → 'Automations' (label may differ) → 'Instant reply' → toggle on → write message → Save.
3. Same page → 'Away message' → set schedule and text → Save.
4. Same page → 'Frequently asked questions' → add up to several questions + answers → Save.
5. To reply manually: Meta Business Suite → Inbox → Messenger → open conversation → paste the agent's prepared reply → Send (within 24 h of the user's message).
6. Optional bot: developers.facebook.com → Create app → use case 'Engage with customers on Messenger from Meta' → Customize → add pages_messaging, pages_manage_metadata → Messenger API settings → 'Generate access tokens' → connect your Page → copy Page token.
7. Same settings → 'Configure webhooks' → Callback URL = agent's https URL, Verify token = string the agent gives you → Verify and save → subscribe the Page to 'messages' (and 'messaging_postbacks').
8. Hand META_APP_SECRET, FB_PAGE_ID, FB_PAGE_TOKEN and the verify token to the agent via a secret store.
9. Test: from your personal account message the Page; confirm the bot/automation reply arrives.

**Agent does**
1. Content goes to Facebook Pages: prepare the Page post (text, image JPEG, video MP4) and use the Facebook Pages route.
2. For inbox: draft reply templates (≤2,000 chars, unverified) and FAQ answers for the human to paste into Business Suite automations.
3. Optional bot (needs the Page token the human generated): handle webhook GET verification (echo hub.challenge when hub.verify_token matches) and validate POST X-Hub-Signature-256 with the app secret.
4. Reply within 24 h: POST https://graph.facebook.com/v25.0/{page-id}/messages?access_token=<page token>, JSON {"recipient":{"id":"<PSID>"},"messaging_type":"RESPONSE","message":{"text":"Thanks!"}} → keep recipient_id, message_id. Attachments: {"message":{"attachment":{"type":"image","payload":{"url":"https://cdn…/a.jpg","is_reusable":true}}}}.
5. Never send unsolicited broadcasts; outside 24 h only HUMAN_AGENT-tagged human replies (7 days). Deduplicate by webhook message mid; back off on code 613/rate errors.

**Content specs:** **messages:** Text replies to people who messaged the Page within 24 h (HUMAN_AGENT tag extends to 7 days for human replies). Text up to 2,000 characters per message (unverified). · **attachments:** image, audio, video, file up to 25 MB; images fetched from URL ≤8 MB; URL fetch timeout 75 s for video, 10 s for other types. · **no_posts:** No feed/story publishing through Messenger; unsolicited broadcasts not allowed for free. · **scheduling:** No native scheduler for messages; Meta Business Suite inbox has automated responses (instant reply, away message, FAQ).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Send fails with error 10 / (#100) 'outside of allowed window' | More than 24 h since the user's last message | Only reply inside the window or use HUMAN_AGENT for a human reply within 7 days |
| Webhook never receives messages | Page not subscribed or verify token mismatch | Re-verify callback and subscribe the Page to 'messages' |
| Recurring notification / old tags rejected | Deprecated in 2026 | Use Page posts for announcements; paid Marketing Messages API only with opt-in |

**Notes:** No way to publish posts/broadcasts via Messenger for free. Outside 24 h window sends fail (error 10/100). Bot secrets (META_APP_ID, META_APP_SECRET, FB_PAGE_ID, FB_PAGE_TOKEN, MESSENGER_WEBHOOK_VERIFY_TOKEN) are only needed for the optional reply bot; Page token from a long-lived user token doesn't expire. App Review (Advanced Access for pages_messaging) + Business Verification only to serve other Pages.

**Alternative:** 1) Facebook Pages API for content (scheduled_publish_time). 2) Meta Business Suite inbox automations (instant reply, away message, FAQ) for auto-replies. 3) Optional reply bot via Send API as above.

## Signal
_Route: `native_scheduler`_ · Docs: https://support.signal.org/hc/articles/5365881590682-Schedule-a-Message-on-Signal-Android (signal-cli is unofficial)

**Before you start**
- Signal account (free) registered to a phone number in the Signal app
- An Android phone for native scheduled sending (Android only; device must be on and online at send time)
- Optional Signal Desktop linked to the phone for composing; iOS/Desktop cannot schedule
- No official bot/broadcast API

**Human does**
1. 1. Get the agent's message text and compressed media onto the Android phone (Signal 'Note to Self', Google Drive, or USB).
2. 2. Open Signal on Android and open the target chat or group.
3. 3. Paste the message text into the compose box; tap the '+' / paperclip to attach the media if any.
4. 4. Long-press (tap and hold) the send button and choose 'Schedule message' (label may differ).
5. 5. Pick the date and time from the agent's schedule and tap 'Schedule send'. Confirm: a scheduled-message indicator/clock icon appears in the chat.
6. 6. To review/cancel: tap the scheduled indicator in the chat to view, reschedule or delete.
7. 7. Keep the phone powered and connected at send time (messages are queued on-device and send when it reconnects).
8. 8. On iOS/Desktop (no scheduling): at the agent's reminder time open the chat, paste and send.
9. 9. For a Story: Stories tab > camera/pencil icon > choose the 9:16 media > select audience > Send.
10. 10. Confirm delivery ticks and tell the agent it was sent.

**Agent does**
1. 1. Draft each announcement (short first line, link at the end) and a shorter variant for Stories.
2. 2. Compress media: images JPG <=2-5 MB, video MP4 H.264/AAC 720p-1080p well under 100 MB; Stories 1080x1920.
3. 3. Produce a send-time list per chat/group in the person's time zone with a ready-to-paste block for each.
4. 4. Set reminders: at scheduling time (Android) or exact send time (iOS/Desktop).
5. 5. Keep a log of what was scheduled/sent to avoid double-sending across devices.

**Content specs:** Text messages (no practical length issue for announcements); attachments: files up to ~100 MB, Android reports video up to ~500 MB (third-party, verify); media may be compressed (Settings > Data and storage > media quality). Stories: vertical 9:16 image or short video (length limit unverified), visible 24 h. Links show previews if enabled. Groups up to 1,000 members (unverified).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| No schedule option on long-press | iOS/Desktop or outdated Android app | Update Signal on Android; otherwise send manually at the reminder time |
| Scheduled message sent late | Phone off or offline at send time | Keep phone charged and online; it sends on reconnect |
| Attachment rejected | Over the size limit | Re-encode smaller or share a link |

**Notes:** Signal has no bot/broadcast API. signal-cli and similar are unofficial registrations of the person's number; Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Manual send at planned times on any device: 1) agent reminder fires; 2) open chat; 3) paste prepared text/media; 4) send.

## Gab
_Route: `manual`_ · Docs: https://gab.com

**Before you start**
- A Gab account (free) created at https://gab.com/auth/sign_up with a confirmed email address.
- Optional GabPRO subscription (paid; price and extra features such as longer posts/scheduling not confirmed from an official page (unverified)).
- An iPhone/Android phone with the Gab app or a mobile browser, or a desktop browser, for posting by hand.
- A shared folder the agent can write to and the human can read on the phone (iCloud Drive, Google Drive, Dropbox or a shared note) for ready-to-post text and media.
- No developer program, API key or approval exists: there is no documented, sanctioned public posting API.

**Human does**
1. 1. One-time: open https://gab.com in a browser (or install 'Gab' from the iOS App Store / Google Play if available in your region; Gab has at times been removed from app stores, in which case use the mobile website and 'Add to Home Screen'). Sign in with your username and password. Confirm success: your avatar shows at the top/side of the home feed.
2. 2. One-time: go to your profile (click your avatar → your profile) and check the account is public (Settings → Privacy (label may differ)) so posts are visible to everyone you intend.
3. 3. One-time: enable two-factor authentication at Settings → Security / Two-factor authentication (label may differ) using an authenticator app; save the backup codes in your password manager. Confirm: you are asked for a 6-digit code at next sign-in.
4. 4. One-time: create a shared folder named 'Gab outbox' in iCloud Drive / Google Drive and give the agent write access; each post will arrive as a subfolder 'YYYY-MM-DD_HHMM_<slug>' containing post.txt and media files.
5. 5. One-time (iPhone, optional): open the Shortcuts app → '+' → add action 'Get File' (folder: Gab outbox, choose the newest post.txt) → 'Get Text from Input' → 'Copy to Clipboard' → 'Open URLs' with https://gab.com/compose (label/path may differ; if it 404s use https://gab.com/home) → name it 'Post to Gab'. Confirm: running it opens Gab with the text on the clipboard.
6. 6. Each post: when the agent's reminder arrives (calendar alert or message at the planned time), open the post's subfolder and copy the text from post.txt (or run the 'Post to Gab' Shortcut).
7. 7. In Gab click/tap the compose box ('What's on your mind?' or the pencil/'Post' button), long-press → Paste the text.
8. 8. Click the image/media icon in the composer → choose the files from the subfolder (Photos/Files). Wait until each thumbnail finishes uploading (spinner disappears); videos can take a few minutes.
9. 9. Check the character counter is not red, check the visibility selector (Public) and that hashtags/links look right; then click 'Post' (label may differ).
10. 10. Confirm the post appears at the top of your profile; copy its URL (… menu → Copy link (label may differ)) and paste it into the 'done' note / reply to the agent so it can mark the item published.
11. 11. If you have GabPRO and a 'Schedule' option (clock icon) appears in the composer, you may instead pick date/time and click 'Schedule' (unverified feature); confirm it is listed under scheduled posts.

**Agent does**
1. 1. Draft each post: plain text under 3,000 characters, 1-5 relevant hashtags at the end, a link (if any) on its own line so the preview card picks it up; produce 2 variants (short <500 chars and long) in post.txt and post_long.txt.
2. 2. Prepare media to spec: images resized to max 1080 px long side, JPG quality 85, EXIF/location stripped (e.g. ffmpeg -i in.jpg -vf scale='min(1080,iw)':-2 -map_metadata -1 out.jpg); videos re-encoded to MP4 H.264/AAC ≤1080p 30 fps (ffmpeg -i in.mov -c:v libx264 -preset medium -crf 23 -vf scale=-2:'min(1080,ih)' -c:a aac -b:a 128k -movflags +faststart out.mp4). Max 4 images per post.
3. 3. Write a subfolder 'YYYY-MM-DD_HHMM_<slug>' into the shared 'Gab outbox' with post.txt, media files numbered in posting order (1.jpg, 2.jpg …) and checklist.md (text length, file names, alt text per image, planned time, visibility Public).
4. 4. Schedule a reminder for the human at the planned time (calendar event with the subfolder link, or a push message) and one follow-up 2 hours later if not confirmed.
5. 5. Keep a posting log (CSV: planned_at, slug, status, post_url). Mark an item 'published' only when the human sends back the post URL; never prepare the same slug twice (duplicate-avoidance).
6. 6. Weekly: send the human a batch summary of what is queued for the next 7 days so they can post in one sitting if they prefer.
7. 7. Do not use Mastodon-style API calls or password-login scripts against Gab: they are unofficial and may violate the terms (see notes).

**Content specs:** **text:** Search snippets report a maximum post length of 5,000 characters (older sources say 3,000; it may depend on GabPRO) (unverified). The agent keeps posts under 3,000 characters so they fit either way. · **images:** JPG/PNG/GIF are accepted; up to 4 images per post is the Mastodon default that Gab historically inherited (unverified). Prepare 1080 px on the long side, JPG quality 85, under 8 MB each (safe Mastodon-style defaults) (unverified). · **video:** Search snippets report videos up to 2 hours (unverified). Prepare MP4 (H.264 video, AAC audio), 1080p or 720p, 30 fps, under 1 GB to be safe (unverified). · **hashtags_links:** Hashtags (#tag) are clickable and searchable; links get a preview card from the page's Open Graph tags (Mastodon behaviour, unverified for current Gab). Mentions use @username. · **aspect_ratios:** Feed shows images at original ratio with a crop on the timeline preview; 1:1 or 4:5 crops best on mobile (unverified).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Gab app is not in the App Store/Play Store | Gab has been removed from app stores at times | Use https://gab.com in Safari/Chrome and choose Share → 'Add to Home Screen'. |
| Post button greyed out / counter red | Text over the character limit for your account tier | Use the short variant post.txt (under 500 chars) instead of post_long.txt, or split into two posts. |
| Video upload stalls or fails | File too large or unsupported codec (e.g. HEVC .mov) | Ask the agent to re-encode to MP4 H.264/AAC 720p and retry on Wi-Fi. |
| Link shows no preview | Target page lacks Open Graph tags or preview blocked | Keep the link on its own line at the end; accept no preview or attach an image instead. |
| Shortcut opens a blank/404 page | The compose URL path differs | Change the 'Open URLs' action to https://gab.com/home and tap the compose box manually. |

**Notes:** Gab offers no documented, sanctioned posting API and no mainstream scheduler (Buffer, Publer, Postiz, Ayrshare, Metricool, Later) lists it. RISK NOTE: Gab historically ran a Mastodon fork, so Mastodon-compatible endpoints (POST /api/v1/statuses with a bearer token, scheduled_at) or password-login scripts may respond, but they are unofficial/undocumented, may break at any time, may violate the terms of service and can get the account restricted. Do not use them as the main route. gab.com is blocked by the research proxy, so all limits above are from search snippets and marked unverified. Test: No API test. Human posts a test 'hello' manually and confirms it appears on their profile.

**Alternative:** No sanctioned alternative. If the human explicitly accepts the risk themselves: (1) they create an app/token in Gab settings if such a page still exists (unverified); (2) agent calls the Mastodon-style POST https://gab.com/api/v1/statuses with 'Authorization: Bearer <token>' and {"status":"..."}; (3) keep manual posting as fallback because the endpoint may stop working. Not recommended.

## Gettr
_Route: `manual`_ · Docs: https://gettr.com

**Before you start**
- A GETTR account (free) created at https://gettr.com or in the GETTR iOS/Android app (email or phone sign-up).
- A phone or desktop browser; no paid plan exists for posting (unverified).
- Before any work: confirm the service is still operating. Mother Jones reported mass layoffs and near-shutdown in 2024; operating status as of 2026-10 is unverified, and gettr.com did not answer from the agent's network on 2026-10-07.

**Human does**
1. 1. Open https://gettr.com in a desktop browser (or open the GETTR app). If the page does not load, shows a shutdown notice, or login fails, stop and tell the agent 'GETTR down'; the agent removes GETTR from the plan.
2. 2. Log in (top right 'Log in' / 'Sign in', label may differ) with your email/phone and password. Confirm that your home feed loads and that recent posts from others are dated within the last few days (a sign the service is alive).
3. 3. On the device you post from, open the folder the agent shared (e.g. iCloud/Google Drive 'gettr/<date>') and download the media files (up to 6 images or 1 video) plus caption.txt.
4. 4. Click the compose box ('What's on your mind?' or a pen/+ button, label may differ).
5. 5. Paste the text from caption.txt. Check the character counter does not exceed 777 (the agent already trimmed it).
6. 6. Click the image/video icon in the composer and select the prepared files in the order the agent numbered them (01_, 02_ ...). Wait for upload thumbnails to finish.
7. 7. If posting a video, wait until processing finishes (progress bar disappears) before posting.
8. 8. Click 'Post' (label may differ). Confirm the post appears at the top of your profile timeline.
9. 9. Open the post, copy its URL from the address bar (or Share > Copy link), and paste it back to the agent so it can log the publish.
10. 10. If the agent scheduled a reminder (no native scheduler), repeat steps 1-9 at the reminder time.

**Agent does**
1. 1. Liveness check before each cycle: run an HTTPS GET to https://gettr.com and ask the person to confirm the feed works; if it fails twice in a week, mark GETTR as dormant and stop preparing content.
2. 2. Write the post text at <=777 characters (target 200-400), with at most 2-3 hashtags and one link; save as caption.txt plus a 280-char variant for reuse.
3. 3. Prepare images: JPG, 1080x1080 or 1080x1350, sRGB, under ~5 MB each (unverified limit), numbered 01_.jpg..06_.jpg, max 6.
4. 4. Prepare video: MP4 H.264 + AAC 44.1/48 kHz, <=3 min (<=10 min only if the account is a verified creator), 1080x1920 or 1920x1080, with burned-in captions.
5. 5. Put files in a shared folder named gettr/<YYYY-MM-DD> and send the person a ready-to-paste checklist (open site, paste caption, attach files in order, post, return URL).
6. 6. Since there is no scheduler, set a reminder (calendar event or agent-side timer) at the planned posting time with the checklist link.
7. 7. Log the returned post URL with the date to avoid duplicate posts of the same content.

**Content specs:** Text: up to 777 characters per post (search snippet, 2021 launch reporting). Images: up to 6 per post (search snippet); use JPG/PNG, 1080 px wide, 1:1 or 4:5 (unverified). Video: max 3 minutes for regular users, up to 10 minutes for creators (search snippet, may have changed); export MP4 H.264/AAC, 1080x1920 (9:16) or 1920x1080 (16:9) (unverified). Hashtags and links are clickable in posts (unverified); no native scheduler found.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| gettr.com does not load or returns an error | Service outage or shutdown (financial trouble reported in 2024) | Retry later; if still down after a few days, drop GETTR from the plan. |
| Text gets cut or Post button disabled | Over the 777-character limit | Use the agent's shorter variant. |
| Video rejected | Over the length limit for non-creator accounts (3 min, unverified) | Ask the agent for a trimmed version under 3 minutes. |

**Notes:** No API, no native scheduler. Platform viability is doubtful; treat as low priority. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Put effort into platforms with official APIs that reach a similar audience: 1) post the same text on X or Truth Social (separate entries); 2) cross-post short video to Rumble (native scheduler); 3) revisit GETTR only if it visibly resumes operation.

## Truth Social
_Route: `manual_with_native_scheduler`_ · Docs: https://www.globenewswire.com/news-release/2025/09/09/3146910/0/en/Truth-Social-Enhances-Platform.html

**Before you start**
- A Truth Social account at https://truthsocial.com (free) with confirmed email/phone.
- Optional Patriot Package (Truth+) subscription, $9.99/month, which unlocks 'Schedule Truths', editing truths and cross-device drafts (announced 9 Sep 2025).
- iOS/Android Truth Social app or a desktop browser.
- A shared folder for agent-prepared text and media.
- No posting API: the official 'Truth API' (TMTG, B2B from 1 Aug 2026) is a paid read-only feed and cannot post.

**Human does**
1. 1. Sign in at https://truthsocial.com or in the Truth Social app. Confirm: home timeline loads.
2. 2. Enable two-factor authentication: Settings → Security → Two-factor authentication (label may differ) with an authenticator app; store backup codes.
3. 3. Optional: subscribe to the Patriot Package (Truth+) $9.99/month from the app's subscription/Truth+ screen (label may differ); confirm the schedule option appears in the composer.
4. 4. One-time: create shared folder 'Truth outbox'; the agent drops plan.csv weekly plus one subfolder per post (post.txt ≤500 chars + media).
5. 5. For each post: tap the compose button ('Truth' / pencil) → paste the text from post.txt.
6. 6. Tap the media icon → select the images/video from the subfolder; wait for uploads to finish.
7. 7. With Patriot Package: tap the schedule (clock) option → pick date and time from plan.csv → 'Schedule' (labels may differ). Without it: tap 'Truth' to post now when the agent's reminder arrives.
8. 8. Confirm: scheduled truths are listed under scheduled/drafts (label may differ), or the posted Truth appears on your profile.
9. 9. Copy the Truth URL (… → Copy link) and send it to the agent so it marks the item done.
10. 10. Weekly: load the next week's batch in one sitting if you have scheduling.

**Agent does**
1. 1. Draft each Truth at ≤500 characters (count URLs fully to be safe), plus a ≤280-char variant; 1-3 hashtags.
2. 2. Prepare media: up to 4 images at 1080 px long side JPG q85 metadata stripped; video MP4 H.264/AAC ≤1080p, ≤10 min, ≤300 MB (ffmpeg -c:v libx264 -crf 23 -c:a aac -movflags +faststart).
3. 3. Write plan.csv (publish_at with timezone, slug, files) and per-post checklist.md into 'Truth outbox'.
4. 4. If the user has Patriot Package: send one weekly reminder to load the batch into 'Schedule Truths'; otherwise schedule a reminder at each publish_at.
5. 5. Track status in a log (slug, planned_at, url); do not re-issue a slug once the user confirms; follow up 2 h after a missed reminder.
6. 6. Do not use unofficial tools (truthbrush, Mastodon-style token scripts) to post.

**Content specs:** **text:** 500 characters per Truth (search snippets; Mastodon-fork default) — verify the counter in the composer. · **images:** JPG/PNG/GIF; up to 4 images per Truth (Mastodon default, unverified). Prepare 1080 px long side, under 8 MB (unverified). · **video:** Up to 10 minutes and 300 MB per snippets (unverified). Prepare MP4 H.264/AAC 1080p 30 fps with +faststart. · **hashtags_links:** #hashtags clickable; links get a preview card; @mentions supported; URLs count toward the limit (exact counting unverified). · **scheduling:** 'Schedule Truths' only for Patriot Package subscribers.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| No schedule option | No Patriot Package subscription or app out of date | Subscribe, update the app, or post at the reminder time. |
| Counter over 500 | Text too long | Use the short variant. |
| Video rejected | Over 10 min / 300 MB or unsupported codec (unverified limits) | Ask the agent to trim/re-encode to H.264 720p. |
| Scheduled Truth posted at wrong time | Timezone mismatch | Agent writes times in the device's timezone and labels it. |

**Notes:** RISK NOTE: Truth Social is Mastodon-based and unofficial tools (e.g. 'truthbrush' and Mastodon-style token scripts) can post, but they are unsanctioned, may violate the ToS and can get the account locked. Do not use as the main route. The official Truth API is read-only, paid and B2B. No verified third-party scheduler (FS Poster claim unverified). truthsocial.com blocked by the research proxy; UI labels best-effort. Test: No API test; human schedules/posts one test Truth and confirms.

**Alternative:** None sanctioned. Next best: (1) buy Patriot Package to batch-schedule natively; (2) agent sends weekly batch + reminders. Unofficial Mastodon-style client = risk only.

## Substack
_Route: `native_scheduler`_ · Docs: https://support.substack.com/hc/en-us/articles/360037870412-How-do-I-schedule-a-post-for-a-future-date

**Before you start**
- A free Substack account and a publication (https://substack.com > Start writing). No fee to publish; Substack takes 10% of paid subscriptions only if paid posts are enabled.
- Desktop browser for long posts; Substack app (iOS/Android) for Notes.
- No public posting API: the official developer offering only looks up public profiles; there is no write access.

**Human does**
1. 1. Go to https://substack.com/sign-in and log in. Open your publication dashboard at https://<yourname>.substack.com/publish (the 'Dashboard').
2. 2. Click 'Create new' (or 'New post', label may differ) > 'Text post'.
3. 3. Paste the agent's title into 'Title' and subtitle into 'Add a subtitle'. Paste the body from the agent's doc (paste from the rendered HTML/Google Doc to keep formatting).
4. 4. Insert images where the agent marked [IMAGE 01] etc.: click the image icon in the toolbar, upload the file, then click the image > 'Edit' to add the alt text the agent supplied.
5. 5. Click 'Continue' (or 'Settings' in the editor top bar). Under audience choose 'Everyone' or 'Only paid subscribers'; under delivery choose 'Email and web' or 'Only publish on web'.
6. 6. In post settings, set the social preview: upload the thumbnail image and paste the SEO title/description the agent prepared.
7. 7. Click the arrow next to 'Publish now' (or 'Send to everyone now') and pick 'Schedule for later'. Choose the date and time (your local time zone) and click 'Schedule'.
8. 8. Confirm: Dashboard > Posts > 'Scheduled' tab shows the post with the correct date/time. You can still edit it until it goes out.
9. 9. Optional test: before scheduling, use 'Send test email' to send it to yourself and check Gmail does not show '[Message clipped]'.
10. 10. Notes: open https://substack.com/notes (or the app's Home > compose), paste the Note text, attach the image, click the calendar icon (web) or the three-dot menu (mobile), pick date/time, confirm. Repeat per Note (one at a time).
11. 11. Back-catalog import (one-off only): Settings > Import/Export > 'Import posts', paste the old blog URL or RSS feed URL, start the import and review imported posts before publishing.
12. 12. Send the agent the live post URL after publication (or confirm the scheduled entry) so it can log it.

**Agent does**
1. 1. Draft each post: title (<=~60 chars for SEO), subtitle, body in Markdown and rendered HTML, with [IMAGE nn] placeholders, alt text, pull quotes and one CTA (subscribe button).
2. 2. Prepare images: header/thumbnail at 1456x1048 (14:10) JPG/PNG, inline images 1456 px wide, each under ~5 MB (unverified limit).
3. 3. Estimate rendered email size; split or shorten if HTML is near 100 KB to avoid Gmail clipping.
4. 4. Write SEO title, SEO description (~150 chars) and a social preview text.
5. 5. Draft a weekly batch of 3-7 Notes (each under ~300 words, one image optional) with planned date/time for each.
6. 6. Send the person a checklist: post title, audience choice, delivery option, schedule time (with time zone), Note times.
7. 7. Agent-side scheduling: create calendar reminders 1 day before each planned slot so the person schedules the post/Notes in time.
8. 8. Track published URLs (https://<yourname>.substack.com/p/<slug>) and read the public RSS feed https://<yourname>.substack.com/feed to confirm publication and avoid duplicates.

**Content specs:** Posts: title + subtitle + rich-text body (text, images, embeds, audio, video, buttons). Social preview / thumbnail image: Substack guidance cited as 14:10 ratio, at least 1456x1048 recommended, minimum 420x300 (search snippet; some help text says 1200x630). Logo >=256x256; wordmark >=1344x256. Keep email HTML under ~102 KB so Gmail does not clip it. Notes: short-form text with images/links; schedulable natively up to ~3 months ahead, one at a time (added March/April 2026). Imports: Settings > Import/Export > Import posts accepts WordPress, Medium, Ghost, Mailchimp, Beehiiv, Tumblr, Blogspot, SeekingAlpha or any RSS feed URL (one-off back-catalog import).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Email shows '[Message clipped]' in Gmail | Rendered email HTML over ~102 KB | Shorten post, reduce embeds, or move long sections to the web-only part. |
| 'Schedule for later' option not visible | Using mobile editor or option hidden behind the arrow next to Publish | Use the web editor and click the small arrow beside the publish button. |
| Notes scheduling missing | App out of date or feature rollout | Update the app; use web at substack.com/notes. |
| Imported posts duplicated or emailed | Import run twice or wrong settings | Delete duplicates; imports are not emailed by default but check before publishing (unverified). |

**Notes:** Import is a one-off back-catalog tool, not continuous RSS sync. Substack has no public posting API and blocks server-side automated posting; third-party Notes schedulers (browser extensions) are not official. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Buffer lists Substack Notes scheduling: 1) connect Substack in Buffer (if available on your plan, unverified whether partner-based); 2) queue Notes there; 3) keep long posts in Substack's native scheduler.

## BeReal
_Route: `manual`_ · Docs: https://bereal.com

**Before you start**
- BeReal app on iPhone or Android (free); account created with phone number.
- Notifications enabled for BeReal so you see the daily 'Time to BeReal' prompt.
- Nothing can be uploaded from the camera roll or scheduled; photos must be taken live in-app.

**Human does**
1. 1. In iOS Settings > Notifications > BeReal (or Android Settings > Apps > BeReal > Notifications) turn notifications on.
2. 2. Keep the agent's caption list (in Notes/Reminders) open for the day.
3. 3. When the 'Time to BeReal' notification arrives, tap it within 2 minutes to open the camera.
4. 4. Frame the shot (back camera) and tap the shutter; hold still while the front camera fires.
5. 5. Review; retake if needed (retakes may be shown to friends, unverified).
6. 6. Tap 'Add a caption' and paste or type one of the agent's caption ideas.
7. 7. Choose audience (My friends only / Discovery, label may differ) and tap Send/Post.
8. 8. If you missed the window, open the app later and post; it will be marked late.
9. 9. Confirm the post appears on your profile/feed.
10. 10. Optionally tell the agent which caption you used so it doesn't repeat it.

**Agent does**
1. 1. Each morning, write 5-10 short caption ideas (<=~80 chars) tied to the person's plans for the day.
2. 2. Suggest 3 likely scenes (desk, walk, product) so the person is ready when the prompt comes.
3. 3. Send the list to the person's notes app or message thread before 9am local time.
4. 4. Track used captions to avoid repetition.
5. 5. No posting automation: any upload/automation contradicts the product design and its terms.

**Content specs:** One dual-camera photo (front + back captured simultaneously in-app) per daily prompt; optional short caption; posts made after the 2-minute window are labelled as late with how late they are. No uploads from gallery, no video uploads from files, no scheduling, no API.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| No daily notification | Notifications disabled or Focus mode | Re-enable notifications; allow BeReal through Focus. |
| Post marked late | Captured after the 2-minute window | Expected; post anyway or wait for next day. |
| Camera fails | Camera permission denied | Settings > BeReal > allow Camera. |

**Notes:** By design no uploads, no API, no scheduling. Any automation violates the product premise. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** None for automation. For similar 'authentic' photo content with scheduling, use Instagram Stories via its official API.

## Spotify for Creators
_Route: `native_scheduler (or rss_or_import via another podcast host)`_ · Docs: https://support.spotify.com/us/creators/article/publishing-audio-episodes/

**Before you start**
- A Spotify account and a Spotify for Creators show at https://creators.spotify.com (free hosting).
- Alternatively a third-party podcast host whose RSS feed is claimed in Spotify for Creators; video from external hosts only through partner hosts using Spotify's video Distribution API (Acast, Audioboom, Libsyn, Omny, Podigee).
- No public upload API for individual creators.

**Human does**
1. 1. Go to https://creators.spotify.com and log in with your Spotify account; select your show.
2. 2. Click 'New episode' (or '+ New episode', label may differ).
3. 3. Drag in the agent's prepared audio (MP3/M4A/WAV) or video (MP4/MOV) file; wait for the upload bar to finish (processing continues in the background).
4. 4. Paste Title and Description (with timestamps and links) from the agent's episode sheet.
5. 5. Under 'Additional details' (label may differ) upload episode artwork, set season/episode number, episode type and explicit flag.
6. 6. Under 'Publish date' choose 'Schedule' and pick the date/time (shown in your local time); or 'Now' to publish immediately.
7. 7. Click 'Next' to review, then 'Publish' / 'Schedule'.
8. 8. Confirm in the Episodes list that the episode shows 'Scheduled' with the correct date.
9. 9. Optional: on the web you can save a draft and publish later from the mobile app.
10. 10. After it goes live, copy the episode link (Share > Copy link) and send it to the agent.
11. 11. Alternative host route (one-time): in Spotify for Creators choose to add/claim an existing show via RSS feed URL, verify via the email code sent to the feed's owner email; future episodes then flow from your host automatically.

**Agent does**
1. 1. Export audio: MP3 128-192 kbps CBR 44.1 kHz (or WAV), loudness about -16 LUFS (unverified recommendation), minimal ID3 tags.
2. 2. Export video when needed: MP4 H.264 High, 1920x1080 16:9, <=25 Mbps, AAC-LC 192 kbps stereo, one audio + one video track, <=12 h (ffmpeg -c:v libx264 -profile:v high -b:v 8M -c:a aac -b:a 192k).
3. 3. Write episode title (<=~70 chars), description with chapter timestamps (00:00 format) and links, season/episode number, explicit flag.
4. 4. Prepare episode artwork 3000x3000 JPG under ~512 KB (third-party guidance), sRGB.
5. 5. Deliver a folder spotify/<episode-number>/ with media, artwork and a checklist including the scheduled publish time.
6. 6. Set a reminder 24 h before the planned date so the person uploads and schedules (large files need processing time).
7. 7. After release, check the public show page/RSS for the new episode to confirm and log it.

**Content specs:** Audio: MP3, M4A or WAV, mono or stereo (MP3: keep embedded artwork/ID3 tags small). Video: MOV, MPG or MP4, exactly one video track and one audio track, max 12 hours, H.264 High Profile, 16:9, max 25 Mbps for 1080p or 35 Mbps for 4K, native frame rate; audio AAC-LC >=192 kbps stereo (no surround). No file-size limit (large files process slowly). Show/episode cover: 1:1 square, JPG/PNG, 3000x3000 recommended (third-party guidance; Spotify artist-art spec says 640-10000 px, sRGB). Publish date: Now or Schedule (local time).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Video rejected or stuck processing | Multiple audio tracks, unsupported codec or very large file | Re-export single-track H.264/AAC MP4; upload on stable connection. |
| Scheduled time wrong | Times shown in local time zone | Check computer time zone before scheduling. |
| Upload fails mid-way | Connection interrupted (no size limit but long uploads) | Use wired connection or compress to lower bitrate. |

**Notes:** No upload API for individuals; Spotify's video Distribution API is only for partner hosting providers. If the person uses a host with its own official API, the agent can upload there and Spotify ingests via RSS/Distribution API. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Host the podcast with a partner host (e.g. Libsyn or Acast): 1) create the show there; 2) submit/claim the RSS feed in Spotify for Creators once; 3) schedule episodes on the host (or its API, if offered); 4) enable the host's Spotify video integration for video episodes.

## Behance
_Route: `manual (native_scheduler with Behance Pro)`_ · Docs: https://www.behance.net/dev

**Before you start**
- Free Adobe ID and Behance profile at https://www.behance.net.
- Behance Pro subscription for Project Scheduling (scheduled publishing): from about US$9.99/month with annual commitment, price varies by region; 7-day free trial (search snippet).
- No API: the Behance API was read-only and new API keys are no longer issued.

**Human does**
1. 1. Go to https://www.behance.net and sign in with your Adobe ID.
2. 2. Click 'Share your work' (top right) > 'Upload' / 'Create a project' (label may differ).
3. 3. In the editor, add media in the agent's order: click Image / Video / Embed in the left panel, upload 01_, 02_... files.
4. 4. Insert the agent's text blocks between media with the 'Text' tool, pasting each block.
5. 5. Click 'Continue' to open project settings. Upload/set the cover image and adjust the crop.
6. 6. Fill 'Project title', 'Tags' (up to 10 from the agent's list), 'Tools used', 'Creative fields', and project description.
7. 7. Set visibility (Everyone; Pro: link-only or password-protected).
8. 8. Free account: click 'Publish'. Behance Pro: open Advanced settings > 'Schedule' (label may differ), pick date/time, and confirm scheduling.
9. 9. Confirm the project appears on your profile (or in drafts/scheduled list with the right date).
10. 10. Copy the project URL and send it to the agent.

**Agent does**
1. 1. Export images at 1400 px wide (or 2x for HiDPI if under 32 MP), sRGB JPG/PNG, under 5 MB each; GIFs optimized.
2. 2. Export directly-uploaded video as MP4 H.264 <=1280 px wide and <1 GB, or prepare a YouTube/Vimeo link for full-width embed.
3. 3. Prepare cover image (808x632, unverified) with central safe area.
4. 4. Write title, description, 10 tags, tools list, credits and the ordered layout list with text blocks.
5. 5. Package files in behance/<project-slug>/ with numbered filenames and a checklist with the planned publish date.
6. 6. If no Pro, set a reminder at the planned time for manual publish.

**Content specs:** Images: JPG, PNG, GIF; recommended 1400 px wide (wider, e.g. up to 3200 px, for HiDPI, unverified); must be under 32 megapixels; if uploads fail, reduce below 50 MB; keep each under ~5 MB for fast load (third-party). Video uploaded directly: max 1280 px wide and 1 GB; embedding from YouTube/Vimeo allows full-bleed. Cover image: 808x632 (unverified, current UI may crop differently). Tags: up to 10. Project scheduling: Behance Pro only, in Advanced Project Settings.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Image upload fails | Over 32 MP or very large file | Resize below 32 MP and under 50 MB. |
| Video appears small | Direct uploads limited to 1280 px wide | Embed from YouTube/Vimeo for full bleed. |
| No Schedule option | Not a Behance Pro subscriber | Subscribe to Pro or publish manually. |

**Notes:** API no longer accepting new keys; was read-only. Some Adobe apps may publish to Behance (unverified). Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Behance Pro scheduling: 1) start Pro trial; 2) prepare several projects; 3) schedule each in Advanced Project Settings so they publish over weeks.

## Quora
_Route: `manual`_ · Docs: https://help.quora.com/hc/en-us/articles/360000470706-Platform-Policies

**Before you start**
- A free Quora account (https://www.quora.com) with a real-name profile and credentials (Profile > Credentials & Highlights).
- Optional: your own Quora Space (create via the 'Create Space' button, label may differ) to publish posts to your followers.
- No official API and no native scheduler.

**Human does**
1. 1. Log in at https://www.quora.com.
2. 2. Open the question URL the agent provided (or search the question title in the top search bar).
3. 3. Click 'Answer' under the question.
4. 4. Paste the agent's answer text; fix formatting with the editor toolbar (bold, lists, quotes).
5. 5. Insert images via the image icon where the agent marked [IMAGE nn]; add links by selecting text and clicking the link icon.
6. 6. Pick the credential to show (e.g. job title) from the credential selector at the top of the answer box.
7. 7. Click 'Post'.
8. 8. For a Space post: open your Space > 'Create Post' (label may differ), paste title/body, add images, click 'Post'.
9. 9. Confirm the answer/post shows on your profile; copy its URL and send to the agent.
10. 10. Reply to comments within 24-48 h as suggested by the agent.

**Agent does**
1. 1. Select 3-5 relevant questions weekly (by search on quora.com) and list their URLs.
2. 2. Write each answer in the person's voice, 300-800 words, citing sources, with at most 1-2 relevant links.
3. 3. Prepare optional images (1200 px wide JPG/PNG).
4. 4. Draft Space posts for the person's own Space.
5. 5. Deliver a checklist with question URL, answer text, credential to use, and posting reminder time.
6. 6. Avoid duplicating identical answers across questions (Quora policies on spam/repetition).

**Content specs:** Answers and Space posts are rich text with headings, lists, images, links, quotes and code; no practical short length limit (one third-party source cites a 1,000-character limit, unverified and inconsistent with long answers in practice). Images JPG/PNG/GIF. Links allowed but self-promotional or repetitive content is restricted by Quora's Platform Policies.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Answer collapsed or removed | Policy violation (spam, self-promotion, repetitive) | Rewrite with substantive content, fewer links. |
| Cannot answer | Question locked or account restricted | Pick another question; check account status. |
| Images fail | Unsupported format or size | Use JPG/PNG under a few MB. |

**Notes:** No scheduling, no API. Only third-party browser-automation tools exist. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Use your own Quora Space as a channel: 1) create Space; 2) post weekly content manually; still no automation.

## Minds
_Route: `manual_with_native_scheduler`_ · Docs: https://gitlab.com/minds

**Before you start**
- A Minds account (free) at https://www.minds.com/register with confirmed email.
- Optional Minds+ / Minds Pro subscription (paid; price not confirmed (unverified)) — raises the video duration limit from ~20 min to ~90 min.
- Desktop browser recommended for scheduling (the post scheduler shipped in the web composer for channels and groups; mobile-app availability unverified).
- A shared folder (iCloud/Google Drive/Dropbox) the agent writes to and the human reads.
- No developer program or API keys: Minds publishes no official public posting API (engine is open source at gitlab.com/minds).

**Human does**
1. 1. One-time: go to https://www.minds.com → 'Login' → enter username + password. Confirm: your newsfeed loads with your avatar top-right.
2. 2. One-time: avatar → Settings → Security → Two-factor authentication (label may differ) → enable via authenticator app; store backup codes in your password manager.
3. 3. One-time: create the shared folder 'Minds outbox' and grant the agent write access. The agent will drop a weekly plan.csv plus one subfolder per post (post.txt + media).
4. 4. Weekly batch: open plan.csv (columns: publish_at local time, slug, text file, media files, target = channel or group name).
5. 5. For each row: on https://www.minds.com/newsfeed click the composer box ('Speak your mind' / '+' Create (label may differ)) on your channel, or open the target group page and use its composer.
6. 6. Paste the text from the row's post.txt; click the media (image/video) icon and select the files from the row's subfolder; wait for upload/transcode progress to complete.
7. 7. Optional: click the tags/NSFW/license controls if the checklist says so (e.g. mark NSFW only if indicated).
8. 8. Click the schedule control in the composer (clock/calendar icon (label may differ)) → pick the date and time from publish_at (check timezone) → confirm.
9. 9. Click 'Post' / 'Schedule'. Confirm: the composer clears and the post shows as scheduled (it does not appear publicly in the feed yet); on your channel the scheduled items are visible to you (location of the scheduled list may differ).
10. 10. Repeat for all rows; then reply to the agent 'batch loaded' with any rows that failed.
11. 11. After the first scheduled time passes, open your channel and confirm the post went live; copy its URL (… menu → Copy URL (label may differ)) back to the agent.
12. 12. If the scheduler is not visible (e.g. in the mobile app), post manually at the reminder time using steps 5-7 and 'Post'.

**Agent does**
1. 1. Build a weekly plan.csv (publish_at in the user's timezone, slug, file names, target channel/group, NSFW flag) and one subfolder per post in 'Minds outbox'.
2. 2. Draft text under 2,000 characters with 2-5 hashtags; for long-form content prepare a separate blog.md with title + body for Minds Blogs.
3. 3. Prepare media: images resized to max 2048 px long side, JPG q85, metadata stripped; videos MP4 H.264/AAC ≤1080p 30 fps, under 20 min (unless the user has Minds+), well under 4 GB (ffmpeg -c:v libx264 -crf 23 -c:a aac -movflags +faststart).
4. 4. Write checklist.md per post (length, file order, alt text, target, publish_at) and a summary of the batch.
5. 5. Send a weekly reminder (e.g. Sunday 18:00 local) to load the batch into Minds' native scheduler; for any post the user says could not be scheduled, set an individual reminder at publish_at.
6. 6. Keep a log (planned_at, slug, status, url); never regenerate an already 'loaded' slug, and confirm publication by asking for the URL after publish_at.
7. 7. Do not use unofficial wrappers (PyPI 'minds', minds-cli) that require the user's password (see notes).

**Content specs:** **text:** Post character limit not found in official sources (unverified); agent keeps activity posts under 2,000 characters; long-form goes in a Minds Blog. · **images:** JPG/PNG/GIF; prepare 1080-2048 px on the long side, under 10 MB (unverified). Multi-image posts supported in newer composer (count unverified; agent uses max 4). · **video:** Max file size 4 GB for all users; duration ~20 minutes for free users, ~90 minutes for Minds+/Pro (per Minds GitLab issue). Prepare MP4 H.264/AAC, 1080p, 30 fps. · **hashtags_links:** #hashtags are clickable and used for discovery; links render a rich preview from Open Graph tags (unverified); posts can be marked NSFW/mature in the composer. · **scheduling:** Native post scheduler for channels and groups (introduced ~2019, engine MR 146).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| No schedule option in the composer | Mobile app or composer variant without the scheduler | Use the desktop web composer at https://www.minds.com/newsfeed; otherwise post at the reminder time. |
| Scheduled post went live at the wrong hour | Timezone mismatch between plan.csv and browser | Agent writes times in the browser's timezone and states the timezone in the CSV header. |
| Video rejected or stuck processing | Over the 20-minute free limit or unsupported codec | Trim to under 20 min / re-encode to H.264 MP4, or upgrade to Minds+ for up to ~90 min. |
| Post not visible in a group | Group requires moderator approval | Check the group's pending queue or ask the group owner. |

**Notes:** Minds has a native scheduler, so batching manually once a week is practical. RISK NOTE: unofficial API wrappers (PyPI 'minds', minds-cli) log in with your username/password, are not sanctioned, may break and may trigger account security; do not use as the main route. No mainstream scheduler supports Minds. minds.com is blocked by the research proxy; UI labels are best-effort. Test: No API test. Human schedules one test post 10 minutes ahead and confirms it publishes.

**Alternative:** Unofficial Python client (password login) — risk only, not recommended: (1) pip install minds; (2) log in with username/password in a script; (3) call its post method. Keep manual + native scheduler as the sanctioned route.

## Likee
_Route: `manual`_ · Docs: https://likee.video

**Before you start**
- Likee app (iOS/Android) and a free account.
- Phone with the prepared video files.
- No official API and no confirmed native scheduler.

**Human does**
1. 1. Receive the prepared video via AirDrop / Google Drive / messaging and save to the phone's gallery.
2. 2. Open Likee and log in.
3. 3. Tap the '+' (create) button at bottom center.
4. 4. Tap 'Upload' / 'Album' (label may differ) and select the prepared video.
5. 5. Trim if prompted to match allowed length; optionally add music/effects.
6. 6. Tap 'Next' to the posting screen.
7. 7. Paste the caption and hashtags from the agent's checklist.
8. 8. Pick a cover frame.
9. 9. Tap 'Post'.
10. 10. Confirm the video appears on your profile; copy its link (Share > Copy link) for the agent.

**Agent does**
1. 1. Export video 1080x1920 MP4 H.264, AAC 44.1 kHz, <=60 s.
2. 2. Burn in subtitles; keep safe zones away from UI overlays.
3. 3. Write caption (<=~150 chars) + 3-8 hashtags.
4. 4. Choose cover frame time.
5. 5. Send a checklist and a reminder at the planned time.

**Content specs:** Vertical 9:16 short video, 1080x1920 MP4 H.264/AAC (unverified); in-app recordings about 60 s (search snippet); upload length limits for gallery videos unverified. Caption with hashtags; character limit unverified.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Video gets trimmed | Upload over length limit | Export <=60 s. |
| Upload fails | Unsupported codec | Re-export H.264/AAC MP4. |
| App unavailable in region | Store availability | Skip platform. |

**Notes:** No API or scheduler found. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** None for automation; reuse the same vertical video on TikTok/Reels/Shorts via official APIs.

## Rumble
_Route: `native_scheduler`_ · Docs: https://rumblefaq.groovehq.com/help/how-to-use-rumble-s-live-stream-api

**Before you start**
- Free Rumble account and channel (https://rumble.com > Sign up).
- Desktop browser for uploads (mobile app possible).
- No public upload API; the Live Stream API only returns read-only stats.

**Human does**
1. 1. Log in at https://rumble.com and click the Upload icon (top right) or go to https://rumble.com/upload.php.
2. 2. Select the prepared MP4; wait for the upload progress to complete.
3. 3. Paste Title, Description and Tags from the agent's sheet; choose Category.
4. 4. Upload the custom thumbnail (or pick a frame).
5. 5. Under 'Visibility', choose 'Scheduled' and set date/time; optionally tick the push-notification option below it.
6. 6. Add the .srt subtitle file if available (Subtitles section, label may differ).
7. 7. Choose licensing: 'Rumble Only' is the usual choice to keep rights and monetize on Rumble; read the other options before picking.
8. 8. Accept the terms checkboxes and click 'Submit'.
9. 9. Confirm under your channel's content tab that the video shows as scheduled.
10. 10. After publish, copy the URL and send it to the agent.

**Agent does**
1. 1. Export MP4 H.264 + AAC 48 kHz, 1920x1080 16:9 (or vertical for shorts), under 15 GB and 8 h.
2. 2. Create thumbnail 1280x720 JPG.
3. 3. Write title, description with links/timestamps, 5-10 tags, category.
4. 4. Produce .srt captions.
5. 5. Recommend license option and scheduled time; package in rumble/<slug>/ with checklist.
6. 6. Set reminder before the schedule time to upload (large files take time).

**Content specs:** MP4 H.264 + AAC recommended. File size: reported up to 15 GB (some sources say 6 GB) and max ~8 hours per upload (search snippet, unverified). Subtitles: vtt, sbv, srt, stl, sub. Thumbnail: 1280x720 JPG/PNG (unverified). Visibility: Public, Unlisted, Private, and Scheduled on the Upload Video page; one optional push notification per video per 24 h. Licensing choices on upload: Rumble Only, Personal Use (not monetized/searchable), Video Management (Exclusive) or (Excluding YouTube), Rumble Player (non-exclusive).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Upload fails | File too large or connection drop | Compress or use wired connection. |
| Video not monetized | Personal Use license chosen | Edit licensing if allowed or re-upload. |
| YouTube sync not working | YouTube-to-Rumble sync blocked | Upload manually. |

**Notes:** Outbound auto-syndication from Rumble to other platforms exists; YouTube-to-Rumble import no longer works. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Rumble Studio for scheduled livestreams: 1) open Rumble Studio; 2) create a scheduled stream with title and time; 3) stream with OBS using the given stream key.

## Triller
_Route: `manual (defunct: do not post)`_ · Docs: https://en.wikipedia.org/wiki/Triller_(app)

**Before you start**
- None: the app has failed to load videos since about December 2025; Triller reported $0 social-media revenue in 2025, was delisted by Nasdaq, and its auditor doubted its survival.

**Human does**
1. 1. Do not post to Triller.
2. 2. Remove Triller from posting calendars and checklists.
3. 3. Every few months, optionally check the app store listing and https://triller.co for a working relaunch.
4. 4. If it visibly returns, tell the agent so it can re-research specs.
5. 5. Meanwhile post the same short videos to TikTok, YouTube Shorts and Instagram Reels.
6. 6. Remove any stored Triller credentials from password managers if no longer needed.
7. 7. Unlink Triller from any other services connected to it.
8. 8. Confirm with the agent that Triller is marked inactive.

**Agent does**
1. 1. Mark Triller as inactive in the plan.
2. 2. Redirect short-video assets to TikTok/Shorts/Reels.
3. 3. Quarterly, search news for Triller relaunch.
4. 4. If relaunched, re-verify API/specs before preparing content.
5. 5. Do not prepare Triller-specific files.

**Content specs:** N/A (platform non-functional). If it returns: vertical 9:16 MP4 short music video (unverified).

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| App opens but videos don't load | Service non-functional since Dec 2025 | Stop using; use other platforms. |

**Notes:** Platform effectively dead.

**Alternative:** Use TikTok Content Posting API, YouTube Data API (Shorts) and Instagram Graph API (Reels) instead: 1) set up each official API; 2) repurpose the same 9:16 videos.

