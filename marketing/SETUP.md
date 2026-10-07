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
_Route: `hosted_hub_api`_ · Price: Free (3 channels); Essentials $6/channel/mo ($5 annual); Team $12/channel/mo ($10 annual); volume discounts above 10 channels

**Supports:** Instagram, Facebook, TikTok, YouTube (Shorts), LinkedIn, X, Threads, Bluesky, Pinterest, Mastodon, Google Business Profile

**Human does**
1. 1. Sign up at buffer.com. Pick a plan: Free (3 channels, 10 queued posts per channel) or Essentials ($6/channel/month, $5 annual) or Team ($12/channel/month).
2. 2. In Buffer click 'Connect channels' (or Settings → Channels → Connect) and authorize each account: Instagram, Facebook, TikTok, YouTube (Shorts), LinkedIn, X, Threads, Bluesky, Pinterest, Mastodon, Google Business.
3. 3. Open Buffer's API settings (Settings → API, linked from developers.buffer.com 'Get API Key') → create a personal API key → copy it.
4. 4. Optional MCP: in Claude/Cursor add a remote MCP server with URL https://mcp.buffer.com/mcp and approve the Buffer OAuth prompt.

**Hand over to the agent (store as secrets):** `BUFFER_API_KEY`

**Agent does**
- 1. POST https://api.buffer.com with 'Authorization: Bearer $BUFFER_API_KEY', JSON {"query":"query { account { organizations { id } } }"} → organizationId.
- 2. POST {"query":"query { channels(input:{organizationId:\"ORG\"}) { id name service } }"} → channel ids.
- 3. Create a post: mutation createPost(input:{text:"...", channelId:"CH", schedulingType: automatic, mode: addToQueue}) { ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } }. For a fixed time use mode: customScheduled + dueAt (ISO 8601 UTC). Other modes: shareNow, shareNext.
- 4. Repeat per channel; check MutationError messages.

**Test:** curl -X POST https://api.buffer.com -H "Authorization: Bearer $BUFFER_API_KEY" -H 'Content-Type: application/json' -d '{"query":"query { account { organizations { id } } }"}' → expect your organization id.

**Notes:** Rate limits per plan (personal keys share one pool): Free 100/15 min, 250/24 h, 3,000/30 days; Essentials 100/15 min, 250/24 h, 7,500/30 days; Team 100/15 min, 500/24 h, 15,000/30 days; 429 when exceeded. API docs list text + image posts; video via API not confirmed. Buffer has passed platform reviews (TikTok, YouTube, Meta), so it is the easiest route while your own app is unaudited.

**Alternative:** Buffer MCP (mcp.buffer.com/mcp) from an MCP client, or Zapier/Make Buffer actions.

## Postiz (self-hosted and cloud)
_Route: `hosted_or_selfhosted_hub_api`_ · Price: Self-hosted: free (AGPL, pay for server). Cloud: from $29/month (5 channels), higher tiers available; MCP included

**Supports:** X, LinkedIn (profile + page), Facebook Pages, Instagram, Threads, TikTok, YouTube, Pinterest, Reddit, Bluesky, Mastodon, Discord, Slack, Telegram, MeWe, Google Business Profile, Dribbble, Lemmy, Warpcast/Farcaster, Nostr, VK, Medium/Dev.to/Hashnode (blogs) and others (28-30+ total; check postiz.com channels page)

**Human does**
1. Cloud: 1. Sign up at postiz.com and choose a plan (from $29/month for 5 channels). 2. Click 'Add Channel' and authorize each platform. 3. Settings → Developers → Public API → copy the API key (and/or the personal MCP URL).
2. Self-hosted: 1. Get an always-on server with Docker. 2. Follow docs.postiz.com self-host Docker Compose guide; set the public URL/env vars; start the stack and create the admin user. 3. For every platform you want, register a developer app on that platform (e.g. MeWe Standalone App, Meta app, LinkedIn app) and put its client id/secret in Postiz's .env per docs.postiz.com/self-host/providers/<platform>; restart. 4. In the UI click 'Add Channel' and log in to each platform. 5. Settings → Developers → Public API → create/copy the key.

**Hand over to the agent (store as secrets):** `POSTIZ_API_URL (cloud: https://api.postiz.com/public/v1; self-hosted: https://<host>/api/public/v1)`, `POSTIZ_API_KEY`

**Agent does**
- 1. GET {POSTIZ_API_URL}/integrations, header 'Authorization: $POSTIZ_API_KEY' → list channel ids and providers.
- 2. Optional media: POST {POSTIZ_API_URL}/upload (multipart) → returns path to use in image[].
- 3. POST {POSTIZ_API_URL}/posts with {type:'schedule'|'now'|'draft', date:'<ISO>', shortLink:false, tags:[], posts:[{integration:{id}, value:[{content, image:[]}], settings:{__type:'<provider>', ...}}]}.
- 4. GET {POSTIZ_API_URL}/posts?startDate&endDate to confirm; DELETE /posts/:id to cancel.
- MCP alternative: add remote MCP URL https://api.postiz.com/mcp/<API_KEY> to the agent client.

**Test:** curl -H "Authorization: $POSTIZ_API_KEY" $POSTIZ_API_URL/integrations → expect connected channels.

**Notes:** Public API rate limit 30 requests/hour per key (create-post endpoint 90/hour self-hosted, 100/hour cloud); headers X-RateLimit-*. Self-hosting is free (AGPL) but you must create and get each platform's developer app approved yourself; Postiz Cloud has done that. Supports 28-30+ platforms. Official n8n node exists (gitroomhq/postiz-n8n).

**Alternative:** Postiz MCP server or the official n8n community node.

## Ayrshare
_Route: `hosted_hub_api`_ · Price: No free plan (trial only). Premium $149/mo ($129/mo annual) for 1 profile; Launch $299/mo (10 profiles); Business $599/mo ($499 annual); Enterprise custom

**Supports:** Facebook, Instagram, X, LinkedIn, TikTok, YouTube, Threads, Pinterest, Reddit, Bluesky, Telegram, Google Business Profile, Snapchat (listed on some plans)

**Human does**
1. 1. Sign up at ayrshare.com (no permanent free plan; trial available). Choose Premium ($149/mo, $129 annual) for one profile.
2. 2. In the Ayrshare dashboard → Social Accounts (Linking) → click each network and authorize your accounts.
3. 3. Dashboard → API Key page → copy the API Key.
4. 4. Optional MCP: add remote MCP server https://api.ayrshare.com/mcp (Streamable HTTP) with header 'Authorization: Bearer <API key>'.

**Hand over to the agent (store as secrets):** `AYRSHARE_API_KEY`

**Agent does**
- 1. GET https://api.ayrshare.com/api/user with 'Authorization: Bearer $AYRSHARE_API_KEY' → confirm linked activeSocialAccounts.
- 2. POST https://api.ayrshare.com/api/post with JSON {"post":"text","platforms":["bluesky","linkedin",...],"mediaUrls":["https://..."],"scheduleDate":"2026-10-10T15:00:00Z"} (omit scheduleDate to post now).
- 3. Read per-platform status/ids in the response; GET /api/post/{id} or /api/history to confirm.

**Test:** curl -H "Authorization: Bearer $AYRSHARE_API_KEY" https://api.ayrshare.com/api/user → expect your linked accounts.

**Notes:** Developer-first REST API; one call fans out to many networks. Pricey for one person. Official Action MCP server at https://api.ayrshare.com/mcp and docs MCP at https://www.ayrshare.com/docs/mcp. Media must be public URLs. /api/user endpoint name from prior knowledge (docs blocked by proxy).

**Alternative:** Ayrshare n8n/Zapier integration or its MCP server.

## n8n
_Route: `automation_tool_webhook_flow`_ · Price: Community Edition self-hosted free (unlimited executions); Cloud Starter ~€20/mo (2,500 executions), Pro ~€50/mo (10,000), Business self-hosted €667/mo, Enterprise quote (annual billing)

**Supports:** Native nodes: X, LinkedIn, Facebook Graph API (Pages/Instagram), Telegram, Discord, Reddit, Slack; anything else via HTTP Request (Bluesky, Mastodon, Threads) or hub nodes (Postiz, Ayrshare, Buffer via HTTP)

**Human does**
1. 1. Choose hosting: n8n Cloud (Starter ~€20/mo, 2,500 executions) or self-host the free Community Edition (Docker: docker run -p 5678:5678 n8nio/n8n, behind HTTPS).
2. 2. Create credentials for the destinations: either native nodes (X, LinkedIn, Facebook Graph API, Telegram, Discord, Reddit, Mastodon via HTTP) each with their own developer app, OR one hub credential (Buffer/Postiz/Ayrshare API key via HTTP Request node or Postiz community node) — the hub route avoids per-platform app reviews.
3. 3. New workflow → add 'Webhook' node: HTTP Method POST, Path 'post', Authentication 'Header Auth' (name X-Webhook-Token, value = a long random secret), Respond 'When last node finishes'.
4. 4. Add an 'IF'/'Switch' node on {{$json.body.platforms}} → branch to destination nodes (e.g. HTTP Request to https://api.buffer.com GraphQL createPost, or LinkedIn node 'Create Post', X node 'Create Tweet').
5. 5. Map text = {{$json.body.text}}, media URL = {{$json.body.media_url}}, time = {{$json.body.schedule_at}}.
6. 6. Add 'Respond to Webhook' returning JSON with the created post ids.
7. 7. Activate the workflow (toggle) — copy the Production URL (https://<host>/webhook/post; the /webhook-test/ URL only works while listening in the editor).
8. 8. Siri Shortcut: Shortcuts app → New → 'Ask for Input' (text) → 'Get Contents of URL' = production URL, Method POST, Headers X-Webhook-Token, Request Body JSON {text, platforms}.
9. 9. Optional MCP: Settings → enable instance-level MCP access (beta) and expose this workflow, or add an 'MCP Server Trigger' node to a workflow.

**Hand over to the agent (store as secrets):** `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_TOKEN`

**Agent does**
- 1. POST $N8N_WEBHOOK_URL with headers 'X-Webhook-Token: $N8N_WEBHOOK_TOKEN', 'Content-Type: application/json' and body {"text":"...","platforms":["linkedin","bluesky"],"media_url":"https://...","schedule_at":null}.
- 2. Read the JSON response from 'Respond to Webhook' (post ids/errors).

**Test:** curl -X POST "$N8N_WEBHOOK_URL" -H "X-Webhook-Token: $N8N_WEBHOOK_TOKEN" -H 'Content-Type: application/json' -d '{"text":"test","platforms":["test"]}' → expect 200 and the echo/response JSON (use a 'test' branch that does not post).

**Notes:** An execution = one workflow run regardless of steps. Self-hosted Community Edition has unlimited executions. Native nodes need your own platform developer apps (with their reviews); routing through Buffer/Postiz/Ayrshare from n8n avoids that. Community multi-post nodes exist (Postiz, Ayrshare, Zernio, PostFast, letmepost) — verify trust before installing.

**Alternative:** n8n MCP Server Trigger node so the agent calls the workflow as an MCP tool.

## Zapier
_Route: `automation_tool_webhook_flow`_ · Price: Free $0 (100 tasks/mo, 2-step Zaps, no Webhooks); Professional from $19.99/mo (750 tasks); Team from $69/mo (2,000 tasks); Enterprise custom (annual prices). MCP included, 2 tasks per call

**Supports:** Via native apps (verify in Zapier directory): LinkedIn, Facebook Pages, Instagram for Business, Pinterest, YouTube, Reddit, Telegram, Discord, Slack; plus hub apps Buffer, Ayrshare, Publer etc. X/Threads/Bluesky availability unverified

**Human does**
1. 1. Sign up at zapier.com. Webhooks by Zapier is a Premium app → needs a paid plan (Professional from $19.99/mo, 750 tasks) or the trial; multi-step Zaps also need paid.
2. 2. Create Zap → Trigger: 'Webhooks by Zapier' → Event 'Catch Hook' → Continue → copy the custom webhook URL (https://hooks.zapier.com/hooks/catch/<id>/<key>/).
3. 3. Send a sample request (see test_call) and click 'Test trigger' so Zapier learns fields text, platforms, media_url.
4. 4. Add a 'Filter' or 'Paths' step on platforms (optional), then Action steps such as LinkedIn 'Create Share Update', Facebook Pages 'Create Page Post', Instagram for Business 'Publish Photo', Buffer 'Add to Queue' (Buffer is the easiest single action for many networks). Connect each account when prompted.
5. 5. Map text/media fields from the webhook → Test each step → Publish.
6. 6. Siri Shortcut: 'Ask for Input' → 'Get Contents of URL' (POST, JSON body {text, platforms}) to the hook URL.
7. 7. Optional MCP: go to mcp.zapier.com → create server → add actions (e.g. Buffer Add to Queue, LinkedIn Create Share) → copy the MCP server URL into the agent client.

**Hand over to the agent (store as secrets):** `ZAPIER_HOOK_URL (treat as secret; it contains the key)`, `ZAPIER_HOOK_SECRET (optional shared field checked in a Filter step)`

**Agent does**
- 1. POST $ZAPIER_HOOK_URL with JSON {"secret":"$ZAPIER_HOOK_SECRET","text":"...","platforms":["linkedin"],"media_url":"https://..."}.
- 2. Expect {"status":"success","id":...} — Zapier replies immediately (asynchronous); verify on the platform or via Zap History.

**Test:** curl -X POST "$ZAPIER_HOOK_URL" -H 'Content-Type: application/json' -d '{"text":"test","platforms":["none"]}' → expect {"status":"success"}.

**Notes:** Catch Hook has no built-in auth: keep the URL secret and add a Filter that checks a 'secret' field. Tasks counted per successful action. Zapier MCP: each tool call costs 2 tasks. Which social apps Zapier currently offers (X, Threads, Bluesky, TikTok) could not be verified here (search budget exhausted).

**Alternative:** Zapier MCP (mcp.zapier.com) exposing Buffer/LinkedIn actions directly to the agent.

## Make
_Route: `automation_tool_webhook_flow`_ · Price: Free $0 (1,000 credits/mo, 15-min interval); Core ~$12/mo; Pro ~$21/mo; Teams ~$38/mo (annual billing); Enterprise custom

**Supports:** Native modules (verify): Facebook Pages, Instagram for Business, LinkedIn, Pinterest, YouTube, Telegram, Discord, Slack, Reddit; plus Buffer/hubs; others via HTTP module

**Human does**
1. 1. Sign up at make.com. Free plan: 1,000 credits/month, 15-min minimum interval for scheduled scenarios (instant webhooks still run on arrival); Core $12/mo (annual) for more.
2. 2. Create a new scenario → add module 'Webhooks' → 'Custom webhook' → Add → name it → (optional) set an API key restriction / IP restriction → Save → copy the URL (https://hook.<zone>.make.com/<id>).
3. 3. Click 'Redetermine data structure' and send a sample request (test_call) so Make learns text/platforms/media_url.
4. 4. Add a Router; on each route add a filter (platforms contains 'linkedin', etc.) and the destination module: e.g. LinkedIn 'Create a User Text Post', Facebook Pages 'Create a Post', Instagram for Business 'Create a Photo Post', or Buffer/HTTP module for a hub. Connect each account.
5. 5. Add 'Webhooks → Webhook response' (status 200, body with post ids).
6. 6. Turn the scenario ON (scheduling 'Immediately as data arrives').
7. 7. Siri Shortcut: 'Get Contents of URL' POST JSON to the webhook URL (add header x-make-apikey if you set one).
8. 8. Optional MCP: set a scenario's schedule to 'On demand', activate it, then connect the Make MCP server (Profile → API/MCP token) so agents see it as a tool.

**Hand over to the agent (store as secrets):** `MAKE_WEBHOOK_URL`, `MAKE_WEBHOOK_APIKEY (if set)`

**Agent does**
- 1. POST $MAKE_WEBHOOK_URL with header 'x-make-apikey: $MAKE_WEBHOOK_APIKEY' and JSON {text, platforms, media_url, schedule_at}.
- 2. Read the Webhook response body for ids; 'Accepted' means no response module was reached yet.

**Test:** curl -X POST "$MAKE_WEBHOOK_URL" -H "x-make-apikey: $MAKE_WEBHOOK_APIKEY" -H 'Content-Type: application/json' -d '{"text":"test","platforms":["none"]}' → expect 200 (or 'Accepted').

**Notes:** Credits (formerly operations) are consumed per module run. Make MCP server exposes only active scenarios scheduled 'On demand' as tools. Webhook API-key header name from prior knowledge (unverified this session). Exact current social module names unverified.

**Alternative:** Make MCP server running an on-demand 'post' scenario.

## IFTTT
_Route: `automation_tool_webhook_flow`_ · Price: Free (limited Applets, hourly checks, no Webhooks); Pro ~$2.99-3.99/mo annual (Webhooks, multi-action); Pro+ ~$149.99/yr

**Supports:** Unverified for 2026: Facebook Pages, Tumblr, Telegram, Discord, Reddit, LinkedIn (check ifttt.com/explore); X and Facebook personal profiles historically removed

**Human does**
1. 1. Sign up at ifttt.com and upgrade to Pro (~$2.99-3.99/mo annual) — the Webhooks service requires Pro or higher.
2. 2. Go to ifttt.com/maker_webhooks → Connect → Documentation (or Settings) to see your Webhooks key.
3. 3. Create → If This: 'Webhooks' → 'Receive a web request' (fields value1..value3) or 'Receive a web request with a JSON payload' → Event name 'post_social'.
4. 4. Then That: pick the destination service action available in your region (e.g. Facebook Pages 'Create a status message', Tumblr, Telegram, Discord, LinkedIn if offered) → map {{Value1}} to the message.
5. 5. Save/Connect the Applet (Pro allows multiple actions per Applet).
6. 6. Siri Shortcut: 'Get Contents of URL' POST https://maker.ifttt.com/trigger/post_social/with/key/<KEY> with JSON {"value1":"text","value2":"media url"}.

**Hand over to the agent (store as secrets):** `IFTTT_WEBHOOK_KEY`, `IFTTT_EVENT=post_social`

**Agent does**
- 1. POST https://maker.ifttt.com/trigger/$IFTTT_EVENT/with/key/$IFTTT_WEBHOOK_KEY with JSON {"value1":"<text>","value2":"<media_url>"} (or /trigger/$IFTTT_EVENT/json/with/key/... for JSON-payload trigger).
- 2. Expect 'Congratulations! You've fired the post_social event'. No post id is returned.

**Test:** curl -X POST https://maker.ifttt.com/trigger/post_social/with/key/$IFTTT_WEBHOOK_KEY -H 'Content-Type: application/json' -d '{"value1":"test"}' → expect the 'Congratulations' text.

**Notes:** Weakest option for an agent: fire-and-forget, no ids, limited value fields, social actions shrink over time (Twitter/X triggers/actions and Facebook personal-profile posting were removed historically). Current social action list could not be verified (proxy + search budget). URL format from prior knowledge.

**Alternative:** Use n8n/Make/Zapier → Buffer instead.

## Later
_Route: `manual_in_hub (no self-serve public API)`_ · Price: Starter $18.75/mo, Growth $37.50/mo, Scale $82.50/mo (annual billing)

**Supports:** Instagram, Facebook, TikTok, Pinterest, LinkedIn, Threads, YouTube Shorts, Snapchat

**Human does**
1. 1. Sign up at later.com; choose Starter ($18.75/mo annual, 1 social set, 30 posts/profile/month), Growth ($37.50/mo) or Scale ($82.50/mo).
2. 2. Connect profiles in Later: Instagram, Facebook, TikTok, Pinterest, LinkedIn, Threads, YouTube (Shorts), Snapchat.
3. 3. Upload agent-prepared media to the Later Media Library, drag to the calendar, paste caption, set time, Save.
4. 4. Enterprise/Agency customers may ask Later sales about API access.

**Agent does**
- 1. Prepare a content calendar (CSV: date, time, profile, caption, media file).
- 2. Hand it to the user for manual upload; no agent API call.

**Test:** No API; schedule one test post in the Later calendar and confirm it publishes.

**Notes:** Later has no public self-serve API and no MCP server (2026). Dropped X support on 28 Aug 2025; no Bluesky, Telegram or Google Business. Not suitable for agent automation.

**Alternative:** Buffer, Publer or Postiz (all have APIs/MCP).

## Publer
_Route: `hosted_hub_api`_ · Price: Free plan (limited, no API); Professional; Business ~$7/account/month (API included); Enterprise custom

**Supports:** Instagram, Facebook, TikTok, YouTube, LinkedIn, X, Threads, Bluesky, Pinterest, Mastodon, Google Business Profile, Telegram, WordPress

**Human does**
1. 1. Sign up at publer.com and choose the Business plan (API is Business/Enterprise only; ~$7 per account/month, e.g. ~$21/mo for 3 accounts).
2. 2. Connect accounts: '+ Add Account' → authorize Instagram, Facebook, TikTok, YouTube, LinkedIn, X, Threads, Bluesky, Pinterest, Mastodon, Google Business, Telegram, WordPress.
3. 3. Settings → Access & Login → API Keys → Create API Key → name it → select scopes workspaces, accounts, posts (and media) → copy the key.
4. 4. Optional MCP (beta, Enterprise/ambassadors): profile settings → AI & Automations → MCP → add/create API key, select workspaces and accounts.

**Hand over to the agent (store as secrets):** `PUBLER_API_KEY`, `PUBLER_WORKSPACE_ID (agent can fetch)`

**Agent does**
- 1. GET https://app.publer.com/api/v1/workspaces with 'Authorization: Bearer-API $PUBLER_API_KEY' → workspace id.
- 2. GET https://app.publer.com/api/v1/accounts with same auth + 'Publer-Workspace-Id: <id>' → account ids.
- 3. (Media) upload via the media endpoint per docs → media id.
- 4. POST https://app.publer.com/api/v1/posts/schedule with body {"bulk":{"state":"scheduled","posts":[{"networks":{"facebook":{"type":"status","text":"..."}},"accounts":[{"id":"ACC","scheduled_at":"2026-10-10T09:00:00Z"}]}]}} (omit scheduled_at to publish now) → job_id.
- 5. Poll GET https://app.publer.com/api/v1/job_status/{job_id} until status 'completed'; read results/errors.

**Test:** curl -H "Authorization: Bearer-API $PUBLER_API_KEY" https://app.publer.com/api/v1/workspaces → expect your workspace list.

**Notes:** Auth scheme is literally 'Bearer-API <key>'. Rate limit 100 requests per 2-minute sliding window per user (across keys). Async job model. Good fit for one person who also wants Mastodon/Bluesky/Telegram.

**Alternative:** Publer MCP (beta) or Zapier/Make Publer integration.

## Metricool
_Route: `hosted_hub_mcp_or_api`_ · Price: Free plan (MCP included, no X/LinkedIn); Starter/Advanced paid; Advanced from ~€53/mo annual (15 brands) — API only on Advanced/Custom; X +$5/mo per account

**Supports:** Instagram, Facebook, TikTok, YouTube, LinkedIn, X (paid add-on), Threads, Bluesky, Pinterest, Google Business Profile, Twitch (analytics)

**Human does**
1. 1. Sign up at metricool.com. MCP works on every plan including Free; the REST API needs Advanced (from ~€53/mo annual for 15 brands) or Custom.
2. 2. Create a brand and connect networks: Instagram, Facebook, TikTok, YouTube, LinkedIn, X (+$5/mo per account, not on Free), Threads, Bluesky, Pinterest, Google Business (no Mastodon).
3. 3. MCP route: in Claude Code run 'claude mcp add --transport http metricool https://ai.metricool.com/mcp' (Claude Desktop: use npx mcp-remote https://ai.metricool.com/mcp) and complete the Metricool login.
4. 4. API route (Advanced): Account Settings → API → copy the access token; note your userId and the brand's blogId (visible in the URL when that brand is selected).

**Hand over to the agent (store as secrets):** `METRICOOL_USER_TOKEN`, `METRICOOL_USER_ID`, `METRICOOL_BLOG_ID`

**Agent does**
- MCP: call the Metricool MCP tools to list brands and schedule a post.
- API: 1. POST https://app.metricool.com/api/v2/scheduler/posts?blogId=$METRICOOL_BLOG_ID&userId=$METRICOOL_USER_ID with header 'X-Mc-Auth: $METRICOOL_USER_TOKEN' and JSON containing publicationDate {dateTime:'2026-10-10T09:00:00', timezone:'Europe/...'}, text, providers [{network:'linkedin'}], media URLs. 2. Check the returned post id.

**Test:** API: create a draft/scheduled test post far in the future and expect a 200 with a post id; then delete it in the Metricool planner.

**Notes:** Body field names (publicationDate, providers) from search snippets/prior knowledge — confirm against Metricool API docs. X costs extra. Good if you also want analytics.

**Alternative:** Metricool MCP (free, all plans) instead of REST API.

## DeviantArt
_Route: `official_api_own_account`_ · Docs: https://www.deviantart.com/developers/

**Human does**
1. Log in to the DeviantArt account that will post.
2. Go to https://www.deviantart.com/developers/ → 'Register your Application' (https://www.deviantart.com/developers/register).
3. Fill title, description; OAuth2 Grant Type = Authorization Code; OAuth2 Redirect URI Whitelist = the exact redirect URI the agent gives (e.g. http://localhost:3000/callback). Accept the API terms → Save.
4. Copy client_id and client_secret from the app list.
5. Open the authorize URL the agent prints, log in, approve; give the agent the code (or let it catch the localhost redirect).

**Hand over to the agent (store as secrets):** `DA_CLIENT_ID`, `DA_CLIENT_SECRET`, `DA_REFRESH_TOKEN`

**Agent does**
- Authorize: https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=...&redirect_uri=...&scope=user%20stash%20publish&state=...
- Token: POST https://www.deviantart.com/oauth2/token grant_type=authorization_code (later grant_type=refresh_token). Access token ~1 h; refresh tokens rotate — always store the new one.
- Upload to Sta.sh: POST https://www.deviantart.com/api/v1/oauth2/stash/submit multipart (file, title, artist_comments, tags[]) → itemid.
- Publish: POST https://www.deviantart.com/api/v1/oauth2/stash/publish with itemid, is_mature (+mature_level/classification if true), agree_submission=1, agree_tos=1, is_ai_generated (required), noai, galleryids[], allow_comments, license options → deviationid, url.
- Status updates: POST /api/v1/oauth2/user/statuses/post (scope user.manage). Journals via /deviation/journal/create (if available to the app).
- No API scheduling — agent publishes at the target time (Sta.sh holds the draft until then).

**Test:** GET https://www.deviantart.com/api/v1/oauth2/user/whoami with Bearer token — expect your username.

**Notes:** Refresh token lifetime (~3 months) and token rotation are from third-party clients, not re-confirmed. Mark AI-generated work truthfully (is_ai_generated). Respect 429 rate limiting with backoff (limits undocumented).

**Alternative:** Manual submit at deviantart.com/submit (has native scheduling unverified); self-hosted Isekai Core (unofficial).

## SoundCloud
_Route: `official_api_own_account`_ · Docs: https://developers.soundcloud.com/docs/api

**Human does**
1. Subscribe to SoundCloud Artist Pro on the account that will upload (soundcloud.com/creator-subscriptions or Settings → Subscription).
2. Go to https://soundcloud.com/you/apps → 'Register a new application'. Enter app name, description, optional website; accept API Terms → Register. (Alternative: run 'node scripts/sc-api-auth.mjs' from github.com/soundcloud/api.)
3. In the app settings add the Redirect URI the agent gives (e.g. http://localhost:8080/callback). Copy Client ID and Client Secret.
4. Open the authorize URL the agent prints, log in, approve; the agent captures the code.

**Hand over to the agent (store as secrets):** `SOUNDCLOUD_CLIENT_ID`, `SOUNDCLOUD_CLIENT_SECRET`, `SOUNDCLOUD_REFRESH_TOKEN`

**Agent does**
- PKCE: make code_verifier, code_challenge=BASE64URL(SHA256(verifier)); open https://secure.soundcloud.com/authorize?client_id=...&redirect_uri=...&response_type=code&code_challenge=...&code_challenge_method=S256&state=...
- Exchange: POST https://secure.soundcloud.com/oauth/token grant_type=authorization_code, client_id, client_secret, redirect_uri, code_verifier, code.
- Refresh before each run: POST https://secure.soundcloud.com/oauth/token grant_type=refresh_token, refresh_token, client_id, client_secret — persist the NEW refresh token (single-use).
- Upload: POST https://api.soundcloud.com/tracks, header Authorization: OAuth <access_token>, multipart: track[title] (req), track[asset_data] (file, req), track[sharing]=public|private, track[description], track[genre], track[tag_list], track[artwork_data], track[downloadable], track[license], track[release_date] → 201 Track.
- Scheduling: upload with track[sharing]=private, then at target time PUT https://api.soundcloud.com/tracks/{track_urn} track[sharing]=public.
- Playlists: POST /playlists with playlist[title], playlist[tracks].

**Test:** GET https://api.soundcloud.com/me with Authorization: OAuth <access_token> — expect your profile.

**Notes:** Refresh tokens are single-use; always save the new one. Use secure.soundcloud.com/oauth/token (api.soundcloud.com/oauth2/token is deprecated). Unused apps may be revoked. Artist Pro lapse blocks registering new apps.

**Alternative:** Native scheduling in the SoundCloud upload UI (Artist Pro) — manual.

## Hive
_Route: `official_api_own_account`_ · Docs: https://developers.hive.io/

**Human does**
1. Have a Hive account (free signup via Ecency/PeakD or paid creation) with enough Resource Credits (check on peakd.com -> Wallet; new accounts usually have a delegation).
2. Get your PRIVATE POSTING key (starts with 5...): in Hive Keychain -> account -> Manage accounts/Keys -> Posting -> show private key, or PeakD -> Wallet/Settings -> Keys & Permissions.
3. Never give the owner, active or memo key or the master password - posting key only (it cannot move funds).
4. Safer option: create a separate bot account and on your main account grant it Posting authority (PeakD -> Settings -> Keys & Permissions -> Posting -> Add account authority); then give the agent the bot account's posting key. Revoke any time from the same page.
5. Hand over the username and the posting key.

**Hand over to the agent (store as secrets):** `HIVE_USERNAME`, `HIVE_POSTING_KEY (WIF)`, `HIVE_API_NODE (optional, e.g. https://api.hive.blog)`

**Agent does**
- Use @hiveio/dhive (JS) or beem (Python) against a public node (https://api.hive.blog, https://api.deathwing.me ...).
- Images: sign sha256('ImageSigningChallenge' + imageBytes) with the posting key -> POST multipart to https://images.hive.blog/<username>/<signature> -> {url}; insert as markdown ![](url).
- Post: broadcast a 'comment' op {parent_author:'', parent_permlink:<first tag/community e.g. hive-123456>, author, permlink:<unique-slug>, title, body (markdown), json_metadata:JSON{tags:[...], image:[urls], app:'agent/1.0', format:'markdown'}} signed with the posting key (dhive: client.broadcast.comment(op, key)).
- Optional comment_options op in the same transaction (beneficiaries, max_accepted_payout, percent_hbd).
- Reply: same op with parent_author/parent_permlink of the post.
- Wait >=5 min between root posts (>=3 s between replies); on RC errors wait for regeneration.
- Scheduling: chain has none - queue on the agent side (or schedule in PeakD/Ecency manually).

**Test:** condenser_api.get_accounts([[HIVE_USERNAME]]) and check that the public key derived from HIVE_POSTING_KEY is in posting.key_auths (no broadcast); optionally rc_api.find_rc_accounts to see RC.

**Notes:** Posts are permanent on chain (edits possible, deletion only if no payout/votes). The posting key can also vote, follow and comment as the account. Payout window 7 days. 3Speak video needs its own uploader.

**Alternative:** PeakD or Ecency scheduler (manual, via Keychain/HiveSigner).

## Blogger
_Route: `official_api_own_account`_ · Docs: https://developers.google.com/blogger/docs/3.0/reference/posts/publish

**Human does**
1. Sign in at https://console.cloud.google.com with the Google account that owns the channel/blog/business (or any account; you'll authorize with the owner account later). Top bar project picker → New project → name it (e.g. 'my-posting-agent') → Create, then select it.
2. APIs & Services → Library → search 'Blogger API v3' → Enable.
3. Left menu → APIs & Services → OAuth consent screen (now called 'Google Auth Platform') → Get started. App name, user support email → Audience: External → contact email → agree → Create.
4. Google Auth Platform → Data access → Add or remove scopes → add https://www.googleapis.com/auth/blogger → Update → Save.
5. Google Auth Platform → Audience → Test users → + Add users → add the Google account that will sign in → Save. (Leave publishing status 'Testing' for now.)
6. Google Auth Platform → Clients → + Create client → Application type 'Desktop app' (simplest; the agent uses a loopback redirect) or 'Web application' with the redirect URI the agent gives you → Create → Download JSON (contains client_id and client_secret).
7. Find your blog ID: Blogger dashboard → the URL contains blogID=<digits> (blogger.com/blog/posts/<BLOG_ID>).
8. When the agent sends the sign-in link, sign in with the account that is an author/admin of the blog, click past the unverified-app warning and allow 'Manage your Blogger account'.
9. Optional: Google Auth Platform → Audience → Publish app, so the refresh token doesn't expire every 7 days.

**Hand over to the agent (store as secrets):** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN (agent obtains)`, `BLOGGER_BLOG_ID`

**Agent does**
- OAuth (same as YouTube; can be combined into one consent) with scope https://www.googleapis.com/auth/blogger, access_type=offline, prompt=consent, PKCE.
- Refresh access token (1h) via https://oauth2.googleapis.com/token.
- Host images elsewhere (e.g. Google Photos/Drive public link or own CDN) and embed <img src> in content.
- POST https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts?isDraft=true with {title, content (HTML), labels} → post id.
- Publish now: POST …/posts/{postId}/publish; schedule: POST …/posts/{postId}/publish?publishDate=<RFC3339>. Pages: POST …/blogs/{blogId}/pages.
- Respect ~100 req/100 s per user.

**Test:** GET https://www.googleapis.com/blogger/v3/users/self/blogs → expect your blog listed; then posts.insert with isDraft=true → expect a post id (stays draft).

**Notes:** Testing-mode tokens expire after 7 days. Blogger API has no media upload. One Google project + one consent can cover YouTube, Blogger and Business Profile scopes.

**Alternative:** Email-to-Blogger (Settings → Email → 'Posting using email' secret address) for simple posts; or Zapier/Make Blogger actions; or Blogger's own scheduler.

## Tumblr
_Route: `official_api_own_account`_ · Docs: https://www.tumblr.com/docs/en/api/v2

**Human does**
1. 1. Log into Tumblr with the account that owns the blog.
2. 2. Go to https://www.tumblr.com/oauth/apps → 'Register application'. Fill Application name, Application website, Application description, Administrative contact email, Default callback URL, and OAuth2 redirect URLs (the agent's redirect, e.g. http://localhost:8765/callback). Register.
3. 3. Copy the OAuth Consumer Key (= OAuth2 client_id) and Secret Key (= client_secret).
4. 4. Open the authorization link from the agent and click 'Allow'.

**Hand over to the agent (store as secrets):** `TUMBLR_CLIENT_ID`, `TUMBLR_CLIENT_SECRET`, `TUMBLR_REDIRECT_URI`, `TUMBLR_REFRESH_TOKEN`, `TUMBLR_BLOG (blog name, e.g. myblog)`

**Agent does**
- 1. Authorize: https://www.tumblr.com/oauth2/authorize?client_id=...&response_type=code&scope=basic%20write%20offline_access&state=...&redirect_uri=...
- 2. Token: POST https://api.tumblr.com/v2/oauth2/token (grant_type=authorization_code, code, client_id, client_secret, redirect_uri) → access_token, expires_in, refresh_token.
- 3. GET /v2/user/info to list blogs and confirm the target blog.
- 4. Post (NPF): POST https://api.tumblr.com/v2/blog/{blog}/posts JSON {content:[{type:'text',text:...},{type:'image',media:[{type:'image/jpeg',identifier:'img1'}]}], tags:'a,b', state:'published'}. For media send multipart/form-data with a 'json' part and file parts named by identifier.
- 5. Schedule: same call with state:'queue' and publish_on:'2026-10-10T15:00:00Z' (or state:'draft').
- 6. Refresh on expiry: POST /v2/oauth2/token grant_type=refresh_token; store the new refresh token.
- 7. Respect 250 posts/day and 250 images/day; handle 403.8022 (queue full) and 403.8023 (daily limit).

**Test:** GET https://api.tumblr.com/v2/user/info with bearer token → returns your user and blogs.

**Notes:** No app review documented for personal use; must follow the Application Developer and API License Agreement. Legacy OAuth1 tokens can be exchanged via /v2/oauth2/exchange. Video upload limits are stricter than images (not documented in API.md numbers).

**Alternative:** Tumblr's native queue (web) or IFTTT/Zapier Tumblr actions.

## WordPress (.com and self-hosted)
_Route: `official_api_own_account`_ · Docs: https://developer.wordpress.com/docs/api/

**Human does**
1. SELF-HOSTED (WordPress 5.6+): make sure the site is served over HTTPS (Application Passwords are disabled on plain HTTP unless WP_ENVIRONMENT_TYPE is 'local').
2. Log in to wp-admin with a user that has the Author role or higher (Editor/Administrator to publish pages).
3. Go to Users -> Profile (or Users -> All Users -> your user -> Edit), scroll to 'Application Passwords'.
4. Type a name (e.g. 'posting-agent') in 'New Application Password Name' and click 'Add New Application Password'.
5. Copy the 24-character password shown once (spaces are optional). Note your login username (not the display name) and the site URL.
6. If a security plugin (Wordfence, iThemes, etc.) or the host blocks the REST API or Basic Auth headers, allow /wp-json/ and the Authorization header (some Apache/CGI setups need 'SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1' in .htaccess).
7. WORDPRESS.COM instead: go to https://developer.wordpress.com/apps -> 'Create New Application', set name, website and a Redirect URL you control (e.g. http://localhost:8080/callback), type 'Web'; copy Client ID and Client Secret.
8. WORDPRESS.COM: open https://public-api.wordpress.com/oauth2/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT&response_type=code&blog=YOURSITE.wordpress.com in a browser, approve, and hand the 'code' from the redirect URL to the agent (or let the agent exchange it). No fees for API use on either variant.

**Hand over to the agent (store as secrets):** `WP_SITE_URL`, `WP_USERNAME`, `WP_APP_PASSWORD`, `(WordPress.com only) WPCOM_CLIENT_ID`, `WPCOM_CLIENT_SECRET`, `WPCOM_REDIRECT_URI`, `WPCOM_SITE (domain or blog ID)`, `WPCOM_ACCESS_TOKEN (or one-time auth code)`

**Agent does**
- Self-hosted auth: HTTP Basic with base64(WP_USERNAME:WP_APP_PASSWORD) on every request to {WP_SITE_URL}/wp-json/wp/v2/... (fallback {WP_SITE_URL}/?rest_route=/wp/v2/... if pretty permalinks are off).
- Upload media: POST /wp-json/wp/v2/media with raw file body, headers Content-Type: image/jpeg (actual MIME) and Content-Disposition: attachment; filename="photo.jpg". Response .id = media ID, .source_url = URL. Optionally POST /wp-json/wp/v2/media/{id} {alt_text, caption}.
- Look up/create taxonomy: GET /wp-json/wp/v2/categories?search=..., GET/POST /wp-json/wp/v2/tags {name}.
- Create post: POST /wp-json/wp/v2/posts JSON {title, content (HTML or block markup), excerpt, status:'publish'|'draft'|'future', featured_media: MEDIA_ID, categories:[ids], tags:[ids]}. Pages: POST /wp-json/wp/v2/pages.
- Schedule: status:'future' plus date_gmt:'2026-10-10T08:00:00' (UTC) or date (site timezone). WordPress publishes via WP-Cron, which fires on site traffic; for exact timing the host should run a real cron hitting wp-cron.php.
- Update/delete: POST /wp-json/wp/v2/posts/{id} with changed fields; DELETE /wp-json/wp/v2/posts/{id} (trash) or ?force=true.
- WordPress.com: exchange code -> POST https://public-api.wordpress.com/oauth2/token (client_id, client_secret, redirect_uri, code, grant_type=authorization_code) -> access_token; then send 'Authorization: Bearer TOKEN' to https://public-api.wordpress.com/wp/v2/sites/{SITE}/posts and /media (same bodies as above) or v1.1: POST https://public-api.wordpress.com/rest/v1.1/sites/{SITE}/media/new (multipart media[]) and /posts/new {title, content, status:'future', date}.
- Limits: keep to a few requests per second; on 429 or 503 back off exponentially.

**Test:** GET {WP_SITE_URL}/wp-json/wp/v2/users/me?context=edit with Basic auth -> 200 with your user id, roles and capabilities (401 'rest_not_logged_in' means the Authorization header is being stripped). WordPress.com: GET https://public-api.wordpress.com/rest/v1.1/me with Bearer token.

**Notes:** Application passwords cannot log into wp-admin and are revocable individually. Scheduled posts depend on WP-Cron (missed schedule if no traffic). 'date' is site-local time, 'date_gmt' is UTC - prefer date_gmt. Some managed hosts and WordPress.com plans without plugins still expose the REST API via public-api.wordpress.com. Jetpack Social can auto-share published posts to other networks.

**Alternative:** No-code: Zapier/Make/n8n WordPress modules (same app password), or Publer/Jetpack Social for scheduling; or email-to-post via Jetpack Post by Email.

## Ghost
_Route: `official_api_own_account`_ · Docs: https://docs.ghost.org/admin-api

**Human does**
1. Have a Ghost 5.x site: self-hosted (free) or Ghost(Pro) on Publisher plan or higher (Starter cannot add custom integrations).
2. Sign in to Ghost Admin (https://yoursite.com/ghost/) as Owner or Administrator.
3. Settings (gear icon) -> Advanced -> Integrations -> 'Add custom integration' -> name it (e.g. 'Posting agent') -> Create.
4. Copy the 'Admin API key' (format id:secret) and the 'API URL' (e.g. https://yoursite.ghost.io). Keep the key secret; anyone with it has full admin content access.
5. If you send newsletters, note the newsletter slug: Settings -> Email newsletter (Newsletters) -> open the newsletter -> slug (default usually 'default-newsletter').

**Hand over to the agent (store as secrets):** `GHOST_API_URL`, `GHOST_ADMIN_API_KEY`, `GHOST_NEWSLETTER_SLUG (optional)`

**Agent does**
- Split GHOST_ADMIN_API_KEY on ':' into id and secret; hex-decode the secret into bytes.
- Build JWT: header {alg:'HS256', typ:'JWT', kid:id}; payload {iat:now, exp:now+300, aud:'/admin/'}; sign HS256 with the decoded secret. Make a fresh token per request batch.
- Send headers on every call: 'Authorization: Ghost <jwt>' and 'Accept-Version: v5.0'. Base: {GHOST_API_URL}/ghost/api/admin/.
- Upload image: POST /ghost/api/admin/images/upload/ multipart (file=@img.jpg, purpose=image, ref=filename) -> images[0].url. Video/audio: POST /ghost/api/admin/media/upload/; other files: /files/upload/.
- Create post: POST /ghost/api/admin/posts/?source=html JSON {posts:[{title, html:'<p>..</p>', feature_image:URL, tags:[{name:'x'}], status:'draft'}]} (without ?source=html you must send lexical JSON).
- Publish now: status:'published'. Schedule: status:'scheduled' with published_at:'2026-10-10T08:00:00.000Z' (future UTC).
- Email as newsletter: add query ?newsletter=SLUG&email_segment=all when setting status to published/scheduled (once sent, cannot resend).
- Edit: GET /posts/{id}/ to read updated_at, then PUT /posts/{id}/ with {posts:[{..., updated_at}]} (required for collision detection). Pages: same under /pages/.

**Test:** GET {GHOST_API_URL}/ghost/api/admin/site/ with Accept-Version: v5.0 (no auth needed) -> site title/version; then GET /ghost/api/admin/posts/?limit=1 with the JWT -> 200 confirms the key.

**Notes:** Secret must be hex-decoded before signing (common bug). Clock skew >5 min breaks JWTs. Ghost(Pro) Starter: no custom integrations. Newsletter send is irreversible. Official JS client @tryghost/admin-api handles JWT.

**Alternative:** Zapier/Make Ghost integration (uses the same custom-integration key), or the Ghost Admin editor's built-in schedule.

## Discord
_Route: `official_api_own_account`_ · Docs: https://docs.discord.com/developers/resources/webhook

**Human does**
1. You need 'Manage Webhooks' on the server (server owner/admin has it).
2. Desktop/web: hover the target text channel -> gear icon (Edit Channel) -> Integrations -> Webhooks -> New Webhook (or Create Webhook).
3. Click the new webhook, set its name and avatar (this is how posts will appear), confirm the channel dropdown, click Save Changes.
4. Click 'Copy Webhook URL' and give it to the agent as a secret.
5. To revoke later: same screen -> Delete Webhook (the URL stops working immediately).

**Hand over to the agent (store as secrets):** `DISCORD_WEBHOOK_URL (https://discord.com/api/webhooks/<id>/<token>)`

**Agent does**
- Text: POST $DISCORD_WEBHOOK_URL?wait=true, Content-Type: application/json, body {content (<=2000 chars), username?, avatar_url?, embeds?:[...<=10], allowed_mentions:{parse:[]}}. wait=true returns the Message object (200) instead of 204.
- Files: POST multipart/form-data with parts files[0], files[1]... and payload_json = {content, attachments:[{id:0, description:'alt text'}]}; reference in embeds via attachment://filename.
- Polls: include poll:{question:{text}, answers:[{poll_media:{text}}], duration:24} in the JSON.
- Forum/media channel: add ?thread_id=<id> to post into a thread or thread_name in the body to create one.
- Edit: PATCH $DISCORD_WEBHOOK_URL/messages/<message_id>; delete: DELETE same path.
- Scheduling: none in the API - queue on the agent side.
- Rate limits: honor X-RateLimit-Remaining/Reset-After; on 429 sleep retry_after seconds.

**Test:** curl -X POST "$DISCORD_WEBHOOK_URL?wait=true" -H 'Content-Type: application/json' -d '{"content":"test","allowed_mentions":{"parse":[]}}' -> expect 200 with a message id (then DELETE $DISCORD_WEBHOOK_URL/messages/<id>). GET $DISCORD_WEBHOOK_URL also returns the webhook info without posting.

**Notes:** Treat the webhook URL as a password: anyone with it can post. Webhooks post as the webhook's name/avatar, not as the person. Set allowed_mentions to avoid accidental @everyone pings. Discord has no native message scheduling (only Scheduled Events).

**Alternative:** Bot user (Developer Portal -> New Application -> Bot -> token; invite with scope bot + permission Send Messages; POST /api/v10/channels/{id}/messages with 'Authorization: Bot <token>'). Schedulers: n8n, Postiz, Zapier.

## Reddit
_Route: `scheduler_or_automation_tool`_ · Docs: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki

**Human does**
1. 1. Recommended (no API approval needed): sign up for Postpone (postpone.app) or Postiz, connect your Reddit account via 'Add account → Reddit' and approve the Reddit OAuth screen.
2. 2. If the tool offers an API/webhook (Postiz public API key, Ayrshare API key on a paid plan), create the key in the tool's settings and give it to the agent; otherwise the agent prepares posts and you paste/schedule them in the tool.
3. 3. Official route (only if approved): read the Responsible Builder Policy, then file a request at https://support.reddithelp.com/hc/en-us/requests/new (Reddit Data API / developer request) describing: personal script posting your own content to subreddits you participate in, expected volume, no data collection.
4. 4. After approval: https://www.reddit.com/prefs/apps → 'are you a developer? create an app…' → name, type 'script', redirect uri http://localhost:8080 → create. Copy the client id (under the app name) and secret.
5. 5. Check each target subreddit's rules on self-promotion and bots; use a dedicated account if appropriate.

**Hand over to the agent (store as secrets):** `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD (script app; account without 2FA, or use web-app flow with REDDIT_REFRESH_TOKEN)`, `or POSTIZ_API_KEY / AYRSHARE_API_KEY for the tool route`

**Agent does**
- 1. Script app token: POST https://www.reddit.com/api/v1/access_token (Basic auth client_id:secret; grant_type=password, username, password) → 1h bearer token; or web-app flow with authorize?duration=permanent&scope=identity%20submit and refresh via grant_type=refresh_token.
- 2. All calls to https://oauth.reddit.com with a unique User-Agent like 'platform:myposter:v1.0 (by /u/username)'.
- 3. GET /api/v1/me to confirm identity; optionally GET /r/{sr}/api/link_flair_v2 for required flair.
- 4. Submit: POST /api/submit (sr, kind=self|link|image, title, text or url, flair_id, api_type=json). Image posts require uploading via /api/media/asset.json then submitting the returned URL.
- 5. No API scheduling: hold posts locally until due; respect 100 QPM per OAuth client and subreddit ratelimit errors (RATELIMIT with wait time).
- 6. Tool route: call the tool's create-post endpoint with scheduleDate instead.

**Test:** GET https://oauth.reddit.com/api/v1/me with bearer token and User-Agent → returns your username.

**Notes:** Biggest gate is approval; personal script requests are frequently denied. Unapproved new apps get no API access. Commercial use needs a paid agreement. Spam filters/shadow-removal are common for new accounts and link posts; follow 9:1-style self-promotion norms of each subreddit.

**Alternative:** Official Data API with a 'script' app once Reddit approves the request (steps 3–4 above).

## Lemmy
_Route: `official_api_own_account`_ · Docs: https://join-lemmy.org/api/main

**Human does**
1. Create or use an account on a Lemmy server (a dedicated posting account is safer). Verify the email if the server requires it.
2. If the server has 2FA on for this account, either disable it for the dedicated account or be ready to give a TOTP code at login.
3. Optional: Settings -> tick 'Bot account' if the posts are automated (many servers require it).
4. List the communities to post to (e.g. technology@lemmy.world) and confirm their rules allow your posts.
5. Hand over the server URL, username and password.

**Hand over to the agent (store as secrets):** `LEMMY_INSTANCE_URL`, `LEMMY_USERNAME`, `LEMMY_PASSWORD`

**Agent does**
- GET /api/v3/site -> version (0.19.x uses /api/v3; 1.0 uses /api/v4 with v3 still accepted).
- POST /api/v3/user/login {username_or_email, password, totp_2fa_token?} -> {jwt}. Send Authorization: Bearer <jwt> on later calls.
- Resolve community: GET /api/v3/community?name=technology@lemmy.world -> community_view.community.id (or GET /api/v3/resolve_object?q=...).
- Image: POST /pictrs/image multipart field images[] with the Bearer header -> {files:[{file, delete_token}]}; URL = $LEMMY_INSTANCE_URL/pictrs/image/<file>.
- Post: POST /api/v3/post {name (title), community_id, url? (link or uploaded image URL), body? (markdown), alt_text?, nsfw?, language_id?} -> post_view.post.id.
- Comment: POST /api/v3/comment {content, post_id, parent_id?}.
- Scheduling: on 0.19 queue on the agent side; on 1.0 use the v4 scheduled publish field (<=10 pending).
- Default rate limit 6 posts per 10 min per IP/account (server-configurable); back off on 429/'rate_limit_error'.

**Test:** GET /api/v3/site with Bearer jwt -> expect my_user.local_user_view.person.name to be your username.

**Notes:** Password login only (no OAuth/app tokens in 0.19), so use a dedicated account and store the password as a secret; log out (POST /api/v3/user/logout) to invalidate a JWT. Communities on other servers are posted to through your home server. Check community rules - many ban automated posting.

**Alternative:** Schedulers: Lemmy Schedule (schedule.lemmings.world), Poster.ly, Postiz.

## Binance Square
_Route: `official_api_own_account`_ · Docs: https://github.com/binance/binance-skills-hub (skills/binance/square-post)

**Human does**
1. 1. Log in to binance.com with your own account (Square posting may require account verification/KYC and no posting restrictions).
2. 2. Open https://www.binance.com/square/creator-center/home (Binance → Square → Creator Center).
3. 3. Find the OpenAPI / API Key section → create a Square OpenAPI key → copy it once (shown masked afterwards).
4. 4. Hand the key to the agent as an environment variable (never paste it into a command line or chat log).

**Hand over to the agent (store as secrets):** `BINANCE_SQUARE_OPENAPI_KEY`

**Agent does**
- 1. Read the key from BINANCE_SQUARE_OPENAPI_KEY (or ~/.config/binance-square/openapi-key). Display it only masked (first 5 + last 4 chars).
- 2. Text post: POST https://www.binance.com/bapi/composite/v1/public/pgc/openApi/content/add with headers 'X-Square-OpenAPI-Key: <key>', 'Content-Type: application/json', 'clienttype: binanceSkill' and body {"bodyTextOnly": "<text>"}.
- 3. Check response code == "000000"; build URL https://www.binance.com/square/post/{id} from the returned id.
- 4. Images (1-4), articles (title + cover) and video: use the official skill scripts post-image.mjs / post-video.mjs from binance-skills-hub (Node 18+, ffmpeg/ffprobe for video) which handle upload then post.
- 5. Handle errors: 220003 key not found, 220004 key expired, 220009 daily post limit, 220014 daily upload limit, 20002/20022 sensitive content, 20013 too long, 30008/2000001/2000002 account restrictions.

**Test:** curl -X POST 'https://www.binance.com/bapi/composite/v1/public/pgc/openApi/content/add' -H "X-Square-OpenAPI-Key: $BINANCE_SQUARE_OPENAPI_KEY" -H 'Content-Type: application/json' -H 'clienttype: binanceSkill' -d '{"bodyTextOnly":"Test post"}' → expect code "000000" and an id.

**Notes:** Official Binance-published skill; free. Limits 100 posts/day, 400 uploads/day. Only attach media the user explicitly provides. Crypto content may be subject to Binance content rules and local regulations.

**Alternative:** Post manually in the Binance app → Square → '+' compose.

## Farcaster
_Route: `official_api_own_account`_ · Docs: https://docs.neynar.com/docs/integrate-managed-signers

**Human does**
1. Have a Farcaster account (Farcaster app, formerly Warpcast).
2. Sign up at https://dev.neynar.com, create an app and copy the API key (Free plan is enough for light posting; check current pricing).
3. Create an approved signer WITHOUT giving your recovery phrase to the agent - either: (a) on your own computer clone github.com/neynarxyz/farcaster-examples, open managed-signers, put NEYNAR_API_KEY and your FARCASTER_DEVELOPER_MNEMONIC (Farcaster app -> Settings -> Advanced -> Show Farcaster recovery phrase) in .env.local, run 'yarn install && yarn dev', open localhost:3000 and click Sign in; or (b) use a Sign In With Neynar demo for your app.
4. Scan the QR / open the approval link in the Farcaster app and approve the signer (one onchain approval).
5. Copy the resulting signer_uuid. Remove the mnemonic from .env.local afterwards.
6. Hand over only the Neynar API key and signer_uuid. To revoke later: Farcaster app -> Settings -> Advanced/Connected apps -> remove the app's key.

**Hand over to the agent (store as secrets):** `NEYNAR_API_KEY`, `NEYNAR_SIGNER_UUID`

**Agent does**
- All calls to https://api.neynar.com with header x-api-key: $NEYNAR_API_KEY.
- Check signer: GET /v2/farcaster/signer?signer_uuid=$NEYNAR_SIGNER_UUID -> status must be 'approved' (and fid).
- (If the agent creates the signer itself: POST /v2/farcaster/signer -> {signer_uuid, public_key}; the human's machine signs a key request and calls POST /v2/farcaster/signer/signed_key {signer_uuid, app_fid, deadline, signature} -> signer_approval_url to show the human; poll GET signer until approved.)
- Media: upload images/video to your own hosting (or any public URL) first.
- Cast: POST /v2/farcaster/cast {signer_uuid, text, embeds:[{url}] (max 2), channel_id? (e.g. 'dev'), parent? (cast hash or URL for replies), idem? (idempotency key)} -> {success, cast:{hash}}.
- Delete: DELETE /v2/farcaster/cast {signer_uuid, target_hash}.
- Scheduling: none - queue on the agent side. Each call costs compute units against the Neynar plan.

**Test:** GET https://api.neynar.com/v2/farcaster/signer?signer_uuid=$NEYNAR_SIGNER_UUID -> expect status 'approved' and your fid (no post).

**Notes:** Never hand the agent the Farcaster recovery phrase - it controls the whole account. A signer can post, like, follow etc. as the account until revoked. Casts are limited to 320 bytes (Pro allows longer) and 2 embeds. Neynar pricing/compute-unit figures not re-verified (site blocked).

**Alternative:** Postiz (Farcaster provider via Neynar); or post manually in the Farcaster app.

## Lens
_Route: `official_api_own_account`_ · Docs: https://lens.xyz/docs/protocol

**Human does**
1. Have a Lens account (created in a Lens app such as Hey or Orb) and its owner wallet.
2. Have the agent generate a NEW wallet address for itself (manager key); the agent shows you only the address.
3. In your Lens app go to Settings -> Managers (Account managers) -> Add manager -> paste the agent's address; grant transaction execution only (no token/native transfers) -> sign with your owner wallet.
4. Tell the agent your Lens account address (not the owner wallet's key) and the App address to log in through (the app you use, or your own registered Lens App).
5. To revoke: Settings -> Managers -> Remove.

**Hand over to the agent (store as secrets):** `LENS_ACCOUNT_ADDRESS`, `LENS_APP_ADDRESS`, `LENS_MANAGER_PRIVATE_KEY (generated by the agent, only manager rights)`

**Agent does**
- Use @lens-protocol/client (environment mainnet -> https://api.lens.xyz/graphql) with a viem wallet from LENS_MANAGER_PRIVATE_KEY.
- Login: client.login({accountManager:{app, account, manager}, signMessage}) -> challenge -> sign -> authenticate -> accessToken (short), refreshToken (~7 days), idToken. Resume sessions with refresh.
- Media: upload image/video to Grove storage (@lens-chain/storage-client, acl immutable for chain 232) -> lens:// URI.
- Metadata: build with @lens-protocol/metadata (textOnly / image / video({content, video:{item, type}})) and upload the JSON to Grove -> contentUri.
- Post: post(sessionClient, {contentUri}) -> handle result: PostResponse (sponsored, done) or SelfFundedTransactionRequest (send the tx from the manager wallet, needs GHO for gas) -> waitForTransaction.
- Scheduling: none - queue on the agent side.

**Test:** fetchAccount({address: LENS_ACCOUNT_ADDRESS}) (public, no post), then login as manager and call currentSession -> expect your account.

**Notes:** Do not take the owner wallet's private key or seed; the manager key is revocable and can be denied transfer rights. Lens moved to Lens v3 on Lens Chain (2025); older v2/Polygon guides and profile handles no longer apply. Gas sponsorship depends on the App you authenticate through. Token lifetimes and exact limits not re-verified (lens.xyz blocked).

**Alternative:** Post manually in a Lens app (Hey, Orb); no confirmed third-party scheduler.

## Nostr
_Route: `official_api_own_account`_ · Docs: https://github.com/nostr-protocol/nips

**Human does**
1. Keep your nsec in a signer you control; never paste it into the agent.
2. Set up a NIP-46 remote signer ('bunker'): e.g. nsec.app (web), Amber (Android), or nsecBunker on your own server; import or create your key there.
3. In the signer create a new connection/app: choose 'bunker://' (connect via token), name it 'posting-agent', and limit permissions to sign_event for kind 1 (notes), kind 24242 (Blossom upload auth) and kind 30023 if you publish long-form; do not grant nip04/nip44 decrypt.
4. Copy the bunker:// connection string (bunker://<signer-pubkey>?relay=wss://...&secret=...) and give it to the agent. The secret is single-use.
5. Approve the agent's first connect request in the signer if prompted; keep the signer online (nsec.app tab or Amber phone) when posts are due.
6. Optional: publish a kind 10063 Blossom server list and a kind 10002 relay list from your usual client.
7. To revoke: delete the connection in the signer app.

**Hand over to the agent (store as secrets):** `NOSTR_BUNKER_URI (bunker://...)`, `NOSTR_RELAYS (comma-separated wss:// URLs, optional)`, `BLOSSOM_SERVER (optional, e.g. https://blossom.primal.net)`

**Agent does**
- Generate a local client keypair (only for NIP-46 transport; it is not the user's key) and persist it.
- Connect: send kind 24133 NIP-44-encrypted request {method:'connect', params:[<signer-pubkey>, <secret>, 'sign_event:1,sign_event:24242']} on the bunker's relays; expect 'ack'/secret. Then call get_public_key to learn the user's pubkey and switch_relays.
- Media: build a kind 24242 auth event {t:'upload', x:<sha256 of file>, expiration} -> sign_event via bunker -> PUT <blossom>/upload with header Authorization: Nostr <base64(signed event)> -> {url, sha256}.
- Note: build kind 1 {content: text + media URL, tags:[['imeta','url <url>','m image/jpeg','x <sha256>','dim WxH'], ['t','hashtag']...], created_at:now} -> sign_event via bunker -> signed event.
- Publish: open websockets to 3-5 write relays (user's kind 10002 list) and send ['EVENT', signed]; expect ['OK', id, true, ''] from each.
- Scheduling: none in the protocol - keep a queue and sign/publish at the due time (signer must be online). Do not backdate/postdate created_at to fake scheduling.
- Per-relay limits/payments differ - treat ['OK', id, false, 'rate-limited:...'] as retry later.

**Test:** NIP-46 get_public_key -> expect the user's npub/hex pubkey; then publish a kind 1 'test' note and expect ['OK', <id>, true] from relays (delete with a kind 5 event if needed).

**Notes:** Never ask for or store the nsec. Deletion (kind 5) is a request that relays may ignore. NIP-07 browser extensions (nos2x, Alby) only work for an agent driving a browser; use NIP-46 for headless automation. Postiz's Nostr integration may ask for a private key - avoid giving it the main nsec.

**Alternative:** Manual posting via a client with a NIP-46/NIP-07 signer; schedulers (e.g. Postiz) only if they support remote signers.

## Dribbble
_Route: `official_api_own_account`_ · Docs: https://developer.dribbble.com/v2/

**Human does**
1. Have a Dribbble account that can upload shots (Pro recommended — upload via API has historically required Pro/team).
2. Go to https://dribbble.com/account/applications/new (Account settings → Applications → Register a new application).
3. Name, description, website URL, Callback URL = redirect URL from the agent → Register. Copy Client ID and Client Secret.
4. Open https://dribbble.com/oauth/authorize?client_id=...&redirect_uri=...&scope=public+upload, approve, give the agent the code.

**Hand over to the agent (store as secrets):** `DRIBBBLE_CLIENT_ID`, `DRIBBBLE_CLIENT_SECRET`, `DRIBBBLE_ACCESS_TOKEN`

**Agent does**
- Token: POST https://dribbble.com/oauth/token (client_id, client_secret, code, redirect_uri) → access_token (long-lived, no refresh token).
- Create shot: POST https://api.dribbble.com/v2/shots multipart: image (file), title (required), description, tags[] (≤12), team_id, low_profile, scheduled_for (Unix timestamp, if accepted — unverified). Expect 202 Accepted; Location header has the shot URL.
- Poll GET https://api.dribbble.com/v2/shots/{id} until processing completes.
- Update: PUT /v2/shots/{id}; delete: DELETE /v2/shots/{id}.

**Test:** GET https://api.dribbble.com/v2/user with Authorization: Bearer <token> — expect your profile.

**Notes:** Image dimension rules are strict (400x300/800x600 per docs). Non-Pro accounts may get 403 on create. Official docs blocked by proxy; details from search snippets.

**Alternative:** TimeToPost (third-party scheduler claiming Dribbble support) or manual upload at dribbble.com/uploads/new.

## Imgur
_Route: `manual`_ · Docs: https://apidocs.imgur.com/

**Human does**
1. New API app registration has been closed since Aug 2026 — you cannot get a new Client ID.
2. If you ALREADY have a registered app (imgur.com/account/settings/apps): copy Client ID and Client Secret, then authorize your account via https://api.imgur.com/oauth2/authorize?client_id=...&response_type=token and hand over the refresh token.
3. Otherwise post manually at imgur.com (New post → upload → title → Post publicly) or ask Imgur Support about API access.

**Hand over to the agent (store as secrets):** `IMGUR_CLIENT_ID (existing app only)`, `IMGUR_CLIENT_SECRET`, `IMGUR_REFRESH_TOKEN`

**Agent does**
- Existing apps only: refresh: POST https://api.imgur.com/oauth2/token {refresh_token, client_id, client_secret, grant_type=refresh_token}.
- Upload: POST https://api.imgur.com/3/image (Authorization: Bearer <token>) multipart 'image' (or 'video'), title, description, album → returns id, link.
- Album: POST https://api.imgur.com/3/album {ids[], title}.
- Share to public gallery: POST https://api.imgur.com/3/gallery/image/{id} {title, topic, terms=1} (or /gallery/album/{id}).
- No scheduling — agent must post at the desired time.

**Test:** GET https://api.imgur.com/3/credits with Authorization: Client-ID <id> — expect remaining credits.

**Notes:** Registration closed Aug 2026 (third-party plugins report breakage). Anonymous Client-ID uploads are not tied to your account. Imgur deleted old anonymous/NSFW content in 2023 — don't rely on it as permanent storage.

**Alternative:** Existing Imgur app credentials → official_api_own_account; else manual.

## Kick
_Route: `official_api_own_account`_ · Docs: https://docs.kick.com

**Human does**
1. Create an app in Kick Developer settings (kick.com > Settings > Developer), set redirect URL.
2. Authorize the app on your own account with scopes channel:write chat:write.
3. Give the agent the client ID/secret or the resulting tokens via a secure store (or run the OAuth locally).
4. Go live with OBS using your stream key at the scheduled time.

**Hand over to the agent (store as secrets):** `Kick OAuth client ID`, `Kick OAuth client secret`, `user refresh token (own account)`

**Agent does**
- Before each stream: update title/category via API; post a chat announcement at stream start.
- Prepare stream titles, category, and promo posts for other platforms.
- After stream: list VOD/clip URLs for cross-posting.

**Content specs:** Live streams (RTMP via OBS); title, category, tags; VODs retained per settings; clips made in-player.

**Test:** GET https://api.kick.com/public/v1/channels with Authorization: Bearer <user token> (returns own channel)

**Notes:** Uploads are not possible on Kick at all; only live streaming. OAuth 2.1 with PKCE. Stream itself is started by the human's encoder.

**Alternative:** Manual: edit stream info in the Creator Dashboard.

## Twitch
_Route: `official_api_own_account`_ · Docs: https://dev.twitch.tv/docs/api/reference

**Human does**
1. Register an app at dev.twitch.tv/console (public client OK), add redirect URL.
2. Authorize your own account with the needed scopes (device code flow works without a server).
3. Hand the client ID and refresh token to the agent via a secure store.
4. Uploads (Affiliate/Partner only): Creator Dashboard > Content > Video Producer > Upload, attach the agent-prepared file, paste title/description, publish.

**Hand over to the agent (store as secrets):** `Twitch client ID`, `user refresh token (own account)`

**Agent does**
- Create schedule segments and update title/category before streams via Helix.
- Prepare upload-ready MP4 (H.264/AAC, up to 1080p60, <=10 Mbps) with title and description for manual Video Producer upload.
- Create clips during streams if requested.

**Content specs:** Uploads: MP4/MOV/AVI/FLV, H.264 + AAC, up to 1080p 60fps, ~10 Mbps; 5 simultaneous uploads, 100 per 24h; Affiliate/Partner only.

**Test:** GET https://api.twitch.tv/helix/schedule?broadcaster_id=<id> with Client-Id and Bearer token

**Notes:** User tokens expire (~4h) and are refreshable. Uploading highlights/past content remains manual.

**Alternative:** Manual: set schedule in Creator Dashboard > Settings > Channel > Schedule.

## Nextdoor
_Route: `manual (official API only if Nextdoor approves a partner application)`_ · Docs: https://developer.nextdoor.com/docs/sharing-overview

**Human does**
1. 1. Default (manual): open nextdoor.com or the app → tap '+' / 'Post' → paste the agent's text → add photos → choose audience → Post. For a Business Page: Business Page → Content tab → 'Create Post or Local Deal' → 'Create Post'.
2. 2. Optional API route (businesses/organizations): go to developer.nextdoor.com → 'Applying for access' → submit the Publishing API request form describing your use (posting your own business/org content).
3. 3. Wait for Nextdoor review; on approval you receive client_id and client_secret by email.
4. 4. Complete Nextdoor's OAuth flow to authorize your own neighbor/business profile with scope post:write (details in the docs you receive).

**Hand over to the agent (store as secrets):** `NEXTDOOR_CLIENT_ID`, `NEXTDOOR_CLIENT_SECRET`, `NEXTDOOR_ACCESS_TOKEN (or refresh token, per partner docs)`

**Agent does**
- Manual route: 1. Draft post text + media; 2. Remind the user at the chosen time with ready-to-paste text.
- API route (after approval): 1. Obtain bearer token per 'Get access token' doc using client_id/secret. 2. Host media at a public HTTPS URL. 3. Call the 'Create post' endpoint (path as given in developer.nextdoor.com/reference/create-post) with body text + media URLs, header 'Authorization: Bearer <token>'. 4. Store returned share_link.

**Test:** API route: create a short test post and expect a share_link of the form https://nextdoor.com/p/{id}. Manual route: post 'test' and confirm.

**Notes:** developer.nextdoor.com is blocked by the proxy here; endpoint path/body taken from search snippets. No native scheduling verified. The Share Plugin (open, no application) only opens a pre-filled share dialog for the user — useful for a Shortcut that opens a share URL, but the person still taps Post.

**Alternative:** Nextdoor Share Plugin / share link (no approval needed; user confirms each post).

## Google Business Profile
_Route: `official_api_own_account`_ · Docs: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/create

**Human does**
1. Sign in at https://console.cloud.google.com with the Google account that owns the channel/blog/business (or any account; you'll authorize with the owner account later). Top bar project picker → New project → name it (e.g. 'my-posting-agent') → Create, then select it.
2. Make sure your Business Profile is verified and active (business.google.com / Google Search 'my business'); Google expects a real, established profile (commonly cited 60+ days).
3. Note the project number: Cloud console → IAM & Admin → Settings → Project number.
4. Submit the GBP API access request: go to developers.google.com/my-business/content/prereqs → 'Request access to the API' (contact form, choose 'Application for Basic API Access'), using an email that is an owner/manager of the profile and the project number. Wait for the approval email (~up to 14 days). Check: APIs & Services → Quotas — QPM should change from 0 to 300.
5. After approval: APIs & Services → Library → enable 'My Business Account Management API', 'My Business Business Information API' and 'Google My Business API' (v4, for localPosts/media/reviews).
6. Left menu → APIs & Services → OAuth consent screen (now called 'Google Auth Platform') → Get started. App name, user support email → Audience: External → contact email → agree → Create.
7. Google Auth Platform → Data access → Add or remove scopes → add https://www.googleapis.com/auth/business.manage → Update → Save.
8. Google Auth Platform → Audience → Test users → + Add users → add the Google account that will sign in → Save. (Leave publishing status 'Testing' for now.)
9. Google Auth Platform → Clients → + Create client → Application type 'Desktop app' (simplest; the agent uses a loopback redirect) or 'Web application' with the redirect URI the agent gives you → Create → Download JSON (contains client_id and client_secret).
10. When the agent sends the sign-in link, sign in with the account that owns/manages the profile and allow access.

**Hand over to the agent (store as secrets):** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN (agent obtains)`, `GBP_ACCOUNT_ID and GBP_LOCATION_ID (agent can look these up)`

**Agent does**
- OAuth with scope https://www.googleapis.com/auth/business.manage, access_type=offline, PKCE; refresh hourly.
- GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts → accounts/{accountId}.
- GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations?readMask=name,title → locations/{locationId}.
- Create post: POST https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/localPosts with {languageCode, summary, topicType: STANDARD|EVENT|OFFER, callToAction?, event?, offer?, media:[{mediaFormat:'PHOTO', sourceUrl:'<public URL>'}]}.
- Photos/videos to the profile: POST …/locations/{locationId}/media with sourceUrl. Review replies: PUT …/reviews/{reviewId}/reply.
- Scheduling: hold one-off posts in the agent's scheduler; for repeating posts set recurrenceInfo on the LocalPost.
- Respect QPM limits and 1500-char summary limit.

**Test:** GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts → expect your account (a 429/403 with quota 0 means access not yet approved).

**Notes:** Nothing works until Google approves the access request (quota 0). Approval is not guaranteed for very new or unverified profiles. Testing-mode refresh tokens expire after 7 days. Posts can be rejected by moderation (phone numbers in text, etc.).

**Alternative:** Use the native GBP scheduler, or an approved scheduler (Buffer, Publer, Hootsuite, SocialPilot) via its API while waiting for approval.

## KakaoTalk
_Route: `manual`_ · Docs: https://developers.kakao.com/docs/latest/en/kakaotalk-channel/common

**Human does**
1. Create a Kakao Talk Channel at https://center-pf.kakao.com (Kakao Talk Channel Admin Center) with your Kakao account.
2. Write channel posts in Admin Center -> 포스트 (Posts) -> 새 포스트 작성; use the reservation option (예약 발행) to schedule.
3. For broadcast messages to channel friends (메시지 -> 새 메시지): requires a business channel (비즈니스 채널) with Korean business registration; messages are paid per send.
4. API messaging (알림톡/친구톡 / brand message) requires Korean business registration and a contract with an official Kakao dealer (e.g. NHN Cloud, Solapi); not available for channel posts.

**Agent does**
- No API exists for creating Kakao Talk Channel posts; the agent prepares text and images (and a target publish time) for the human to paste into Admin Center.
- Optional personal reminder: Kakao Login with talk_message scope allows POST https://kapi.kakao.com/v2/api/talk/memo/default/send (send-to-me), useful only to deliver drafts to yourself.

**Test:** None for posting. (If using send-to-me: GET https://kapi.kakao.com/v2/user/me with Bearer token.)

**Notes:** Kakao Story API ended. Kakao Login tokens: access ~6h (REST), refresh ~2 months. Dealer message APIs are per-message paid and template-reviewed.

**Alternative:** Korean business: dealer API (NHN Cloud/Solapi) for brand/friend messages to channel subscribers.

## LINE
_Route: `official_api_own_account`_ · Docs: https://developers.line.biz/en/reference/messaging-api/

**Human does**
1. Create a LINE Official Account at https://entry.line.biz (LINE Business ID login; free 'unverified' account is fine).
2. In LINE Official Account Manager (manager.line.biz) -> Settings -> Messaging API -> 'Enable Messaging API' -> pick/create a Provider.
3. Open LINE Developers Console (developers.line.biz/console) -> your provider -> the Messaging API channel -> 'Messaging API' tab -> 'Channel access token (long-lived)' -> Issue. Copy it.
4. Choose a plan in OA Manager -> Settings -> Plan (Japan: Communication free 200 msgs/month; Light ¥5,000 = 5,000; Standard ¥15,000 = 30,000 + overage). Each broadcast consumes one message per friend.
5. Optionally disable auto-reply/greeting in OA Manager -> Response settings if not wanted.

**Hand over to the agent (store as secrets):** `LINE_CHANNEL_ACCESS_TOKEN`

**Agent does**
- Header: Authorization: Bearer LINE_CHANNEL_ACCESS_TOKEN; Content-Type: application/json.
- Check quota: GET https://api.line.me/v2/bot/message/quota and GET /v2/bot/message/quota/consumption.
- Media must be public HTTPS URLs (image JPEG/PNG <=10MB with previewImageUrl <=1MB; video mp4 <=200MB with preview image).
- Broadcast: POST https://api.line.me/v2/bot/message/broadcast {messages:[{type:'text',text:'...'},{type:'image',originalContentUrl,previewImageUrl}]} (max 5 messages per call); add header X-Line-Retry-Key: UUID for safe retries.
- Validate first: POST https://api.line.me/v2/bot/message/validate/broadcast with the same body.
- Scheduling: no API parameter - agent sends at the target time (or human uses scheduled broadcast in OA Manager).

**Test:** GET https://api.line.me/v2/bot/info -> bot userId, basicId, displayName (no message sent).

**Notes:** Broadcasts go to all friends and cost quota; no API for LINE VOOM/timeline posts (VOOM shutdown claim not re-verified). Long-lived channel token does not expire but reissuing invalidates the old one; LINE Login tokens last 30 days.

**Alternative:** OA Manager web UI scheduled broadcasts; respond.io or similar CRM tools.

## Telegram
_Route: `official_api_own_account`_ · Docs: https://core.telegram.org/bots/api

**Human does**
1. In Telegram open a chat with @BotFather (blue check) and send /newbot.
2. Send a display name, then a username ending in 'bot' (e.g. myposts_bot). BotFather replies with the HTTP API token (looks like 123456789:AA...). Copy it.
3. Optional: /setprivacy -> choose the bot -> Enable (it only needs to post, not read group chatter).
4. Open your channel -> tap the channel name -> Edit (pencil) / Manage channel -> Administrators -> Add Admin -> search the bot's @username -> select it.
5. In the admin rights screen keep 'Post Messages' ON (also 'Edit Messages of Others'/'Delete Messages' if the agent should fix posts); turn everything else off -> Save/Done.
6. Tell the agent the channel's public @username. For a private channel: post any message in the channel after adding the bot, then let the agent read the numeric chat_id (starts with -100) from getUpdates.
7. If the bot token is ever leaked: @BotFather -> /revoke -> pick the bot -> new token.

**Hand over to the agent (store as secrets):** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID (e.g. @mychannel or -1001234567890)`

**Agent does**
- Base URL: https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/<method>; POST JSON or multipart/form-data. Every response is {ok, result} or {ok:false, error_code, description, parameters.retry_after}.
- GET getMe -> confirms token and returns the bot's id/username.
- Private channel only: GET getUpdates?allowed_updates=["channel_post"] after the human posts in the channel -> result[].channel_post.chat.id. (Do not call getUpdates if a webhook is set; deleteWebhook first.)
- Text: POST sendMessage {chat_id, text (<=4096 chars), parse_mode:'HTML' or 'MarkdownV2', link_preview_options:{is_disabled:false}, disable_notification:false}.
- Photo: POST sendPhoto multipart {chat_id, photo:@file (<=10 MB) or an https URL, caption (<=1024 chars), parse_mode}. Video: sendVideo {chat_id, video, caption, supports_streaming:true}. Other files: sendDocument. Upload limit 50 MB via the cloud Bot API.
- Album: POST sendMediaGroup {chat_id, media:[{type:'photo'|'video', media:'attach://f1', caption on first item}, ... 2-10 items]} with the files as multipart parts f1, f2...
- Poll: POST sendPoll {chat_id, question, options:[{text},...]} .
- Reuse uploaded media by the returned file_id instead of re-uploading.
- Scheduling: the Bot API has no schedule parameter - keep a queue on the agent side (cron) and call sendMessage at the due time.
- Pace: <=1 msg/s and <=20 msgs/min to the channel; on HTTP 429 sleep parameters.retry_after seconds and retry.
- Edits/deletes: editMessageText / editMessageCaption / deleteMessage with chat_id + message_id from the send result.

**Test:** curl -s https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe (expect ok:true), then POST sendMessage {chat_id:$TELEGRAM_CHAT_ID, text:'test', disable_notification:true} -> expect ok:true with result.message_id (delete it with deleteMessage).

**Notes:** Posts appear as the channel, not as the person. The bot token is full control of the bot - store it as a secret. Bots cannot post to the person's private chats or schedule natively; native scheduling exists only in the Telegram apps for humans (or MTProto user-account libraries, which require the person's phone login - not recommended). 'chat not found' usually means the bot is not an admin or the @username is wrong. Captions max 1024 chars.

**Alternative:** Scheduler: n8n Telegram node or Postiz with the same bot token; or schedule manually in the Telegram app (long-press send -> Schedule Message).

## Viber
_Route: `official_api_own_account`_ · Docs: https://developers.viber.com/docs/tools/channels-post-api/

**Human does**
1. Create or own a Viber Channel and be its super admin (Viber 17.7+ on mobile).
2. Open the channel -> Channel info -> Developer Tools -> copy the authentication token (super admin only).
3. Provide an HTTPS endpoint with a valid CA-signed certificate that answers 200 to Viber callbacks (any simple serverless function); required once to activate the token via set_webhook.

**Hand over to the agent (store as secrets):** `VIBER_CHANNEL_TOKEN`, `VIBER_WEBHOOK_URL`

**Agent does**
- Header on all calls: X-Viber-Auth-Token: VIBER_CHANNEL_TOKEN; base https://chatapi.viber.com/pa/.
- Activate: POST /pa/set_webhook {url: VIBER_WEBHOOK_URL} once (endpoint must return 200).
- Get sender id: POST /pa/get_account_info -> members[] -> id of a superadmin; use it as 'from'.
- Post text: POST /pa/post {from:ADMIN_ID, type:'text', text:'...'}.
- Post image: {from, type:'picture', text:'caption', media:'https://.../img.jpg'} (JPEG/PNG public URL); video: {type:'video', media:URL, size:bytes, duration, thumbnail}; file: {type:'file', media, size, file_name}; link: {type:'url', media:URL}.
- No scheduling parameter - agent posts at the target time.

**Test:** POST https://chatapi.viber.com/pa/get_account_info with X-Viber-Auth-Token -> channel name, members (no post).

**Notes:** Token is static until revoked/regenerated. Webhook must be set before posting. Viber chatbots (Bot API) carry a monthly fee for commercial bots; Channels Post API itself is free (unverified).

**Alternative:** SMMplanner or postmypost Viber channel publishing.

## WhatsApp
_Route: `manual`_ · Docs: https://developers.facebook.com/docs/whatsapp/pricing

**Human does**
1. For Channel or Status posts there is no official API: the agent prepares the text/media and a wa.me share link or a Shortcut; you open WhatsApp → Updates tab → your Channel → paste/attach → send (or schedule if the in-app scheduler is available to you).
2. Optional (only for 1:1 broadcast-style messages to people who opted in): developers.facebook.com → My Apps → Create app → use case 'Connect with customers through WhatsApp' → select/create a Business portfolio.
3. App → WhatsApp → API Setup: note the test Phone number ID and WhatsApp Business Account ID; add up to 5 recipient numbers for testing; to use your own number click 'Add phone number' (the number must not be active in the WhatsApp app, or migrate it), verify via SMS, and add a payment method in Business Settings → WhatsApp accounts → Payment settings.
4. Business Settings (business.facebook.com) → Users → System users → Add (Admin) → Assign assets: the app and WhatsApp account (full control) → Generate token with whatsapp_business_messaging and whatsapp_business_management, expiry 'Never'.
5. WhatsApp Manager → Message templates → Create a Marketing/Utility template and wait for approval.

**Hand over to the agent (store as secrets):** `WHATSAPP_SYSTEM_USER_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `list of opted-in recipient numbers`

**Agent does**
- Manual route: generate the post text + media, and a link https://wa.me/?text=<urlencoded> for one-tap prefill; remind the human at the due time.
- API route (1:1 only): POST https://graph.facebook.com/v{ver}/{phone-number-id}/messages with {messaging_product:'whatsapp', to, type:'template', template:{name, language:{code}, components}}; free-form type text/image only within 24h after the contact messaged you.
- Media: POST /{phone-number-id}/media to get a media id, or use a public link.
- Respect messaging-limit tiers (unique users per 24h) and quality rating; schedule in the agent's own scheduler.

**Test:** GET https://graph.facebook.com/v{ver}/{phone-number-id}?fields=display_phone_number,verified_name → expect your number; or send the pre-approved 'hello_world' template to your own test recipient.

**Notes:** Channels and Status cannot be posted via Meta's API. Third-party unofficial gateways (e.g. Whapi) that do post to Channels use a linked WhatsApp session and risk account bans/ToS violation — not recommended. Cloud API template messages cost money and need opt-in.

**Alternative:** Cloud API for opted-in 1:1 messaging (paid templates); Hootsuite/inbox tools only for replies.

## WeChat
_Route: `official_api_own_account`_ · Docs: https://developers.weixin.qq.com/doc/offiaccount/en/Getting_Started/Overview.html

**Human does**
1. Register an Official Account (subscription account) at https://mp.weixin.qq.com as a Chinese enterprise or sole proprietor (个体工商户); needs a Chinese business license, the administrator's Chinese ID and a WeChat account with bound bank card. Individual-entity accounts can no longer use the publish API (since July 2025).
2. Complete WeChat verification: Settings -> 公众号设置 -> 认证 (Verification); pay ¥300 per year; wait for approval.
3. 设置与开发 -> 基本配置 / 开发接口管理 (Development -> Basic configuration): copy AppID, generate/reset AppSecret (admin scans QR).
4. Add the agent server's public egress IP(s) to 'IP白名单' (API IP whitelist) on the same page.
5. Check 接口权限 (API permissions) shows 草稿箱 (draft) and 发布能力 (publish) as 'obtained'. Permission activation can take ~24h after verification.

**Hand over to the agent (store as secrets):** `WECHAT_APPID`, `WECHAT_APPSECRET`, `(fixed egress IP whitelisted)`

**Agent does**
- Token: POST https://api.weixin.qq.com/cgi-bin/stable_token {grant_type:'client_credential', appid, secret} -> access_token (7200 s); cache and reuse (daily quota on token calls).
- Cover image: POST https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=...&type=image multipart media=@cover.jpg -> media_id (thumb_media_id).
- In-article images: POST https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=... multipart media=@img.jpg -> url (mmbiz.qpic.cn); use these URLs in content HTML (external image URLs are stripped).
- Draft: POST https://api.weixin.qq.com/cgi-bin/draft/add?access_token=... {articles:[{title, author, digest, content:'<p>..</p>', content_source_url, thumb_media_id, need_open_comment:0}]} -> media_id.
- Publish: POST https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=... {media_id} -> publish_id; poll POST /cgi-bin/freepublish/get {publish_id} until publish_status=0 (success) -> article_url.
- Publishing via freepublish does not push to followers' chat lists; pushing (mass send) is POST /cgi-bin/message/mass/sendall (1 per day for subscription accounts).
- No API scheduling: the agent holds the queue and calls submit at the target time (or a human uses 定时群发 in the backend).

**Test:** GET https://api.weixin.qq.com/cgi-bin/get_api_domain_ip?access_token=... (or draft/count) -> returns data without publishing; errcode 40164 means IP not whitelisted.

**Notes:** Requires mainland China entity + verification; individual accounts lost the publish API in July 2025 (agent can still prepare content but a human must publish in mp.weixin.qq.com). Fixed egress IP needed. WeChat Channels (视频号) has no publishing API.

**Alternative:** Manual: agent prepares HTML/images, human pastes into the mp.weixin.qq.com editor and uses 定时群发 scheduling.

## Bluesky
_Route: `official_api_own_account`_ · Docs: https://docs.bsky.app/docs/get-started

**Human does**
1. Make sure the account email is verified (Settings -> Account) - required before video uploads.
2. In bsky.app or the app: Settings -> Privacy and security -> App passwords -> Add App Password.
3. Name it (e.g. 'posting-agent'); leave 'Allow access to your direct messages' OFF; tap Next/Create.
4. Copy the generated password (xxxx-xxxx-xxxx-xxxx) - it is shown only once.
5. Give the agent your handle (e.g. name.bsky.social) and the app password. Never give the main password.
6. To revoke: same App passwords screen -> delete it.

**Hand over to the agent (store as secrets):** `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`, `BLUESKY_PDS (optional; default https://bsky.social)`

**Agent does**
- POST https://bsky.social/xrpc/com.atproto.server.createSession {identifier:$BLUESKY_HANDLE, password:$BLUESKY_APP_PASSWORD} -> accessJwt, refreshJwt, did, didDoc (use the PDS endpoint from didDoc for later calls).
- Keep the session: refresh with POST com.atproto.server.refreshSession (Authorization: Bearer refreshJwt) instead of logging in again (createSession: 30/5 min, 300/day).
- Images: POST <pds>/xrpc/com.atproto.repo.uploadBlob, raw bytes body, Content-Type image/jpeg|png|webp, Bearer accessJwt (each <=1,000,000 bytes) -> blob object.
- Post: POST <pds>/xrpc/com.atproto.repo.createRecord {repo:did, collection:'app.bsky.feed.post', record:{$type:'app.bsky.feed.post', text (<=300 graphemes), createdAt: ISO now, langs:['en'], facets:[...], embed}}.
- Facets: compute UTF-8 byteStart/byteEnd for each URL (app.bsky.richtext.facet#link {uri}), mention (#mention {did}, resolve via com.atproto.identity.resolveHandle) and hashtag (#tag {tag}) - otherwise links are not clickable.
- Image embed: {$type:'app.bsky.embed.images', images:[{image:blob, alt:'...', aspectRatio:{width,height}}]} up to 4.
- Link card: fetch the page's og:title/description/image yourself, uploadBlob the thumbnail, embed {$type:'app.bsky.embed.external', external:{uri,title,description,thumb}}.
- Video (<=100 MB, <=3 min): GET com.atproto.server.getServiceAuth?aud=did:web:<pds host>&lxm=com.atproto.repo.uploadBlob&exp=<now+30min> -> token; POST https://video.bsky.app/xrpc/app.bsky.video.uploadVideo?did=<did>&name=<file.mp4> with that token and the bytes -> jobId; poll app.bsky.video.getJobStatus until blob; embed {$type:'app.bsky.embed.video', video:blob, alt, aspectRatio}.
- Thread: post the first item, then each reply with record.reply = {root:{uri,cid of first}, parent:{uri,cid of previous}}.
- Scheduling: none in the API or app - queue on the agent side. Respect 429 + RateLimit-* headers.

**Test:** After createSession, GET <pds>/xrpc/app.bsky.actor.getProfile?actor=<did> (no post). Then createRecord a text post 'test' -> expect {uri, cid}; delete with com.atproto.repo.deleteRecord {repo, collection:'app.bsky.feed.post', rkey from uri}.

**Notes:** App passwords give near-full account access except DMs/account deletion - store as a secret and revoke when done. Bluesky has no native scheduled posts as of 2026. For an app other people sign into, use atproto OAuth (PAR + PKCE + DPoP) with granular scopes instead of app passwords.

**Alternative:** Schedulers: Buffer, Hootsuite, Typefully, Postiz (connect with an app password or OAuth).

## Mastodon / Fediverse
_Route: `official_api_own_account`_ · Docs: https://docs.joinmastodon.org/methods/statuses/

**Human does**
1. Log in to your Mastodon server in a browser (e.g. https://mastodon.social).
2. Go to Preferences (gear icon) -> Development -> New application.
3. Application name: e.g. 'posting-agent'. Leave Redirect URI as urn:ietf:wg:oauth:2.0:oob.
4. Scopes: untick the defaults you don't need and tick write:statuses and write:media (add read:statuses if the agent should check its posts). Click Submit.
5. Open the application you just created and copy 'Your access token'.
6. Optional for bot-like posting: Preferences -> Public profile -> tick 'This is an automated account' (some servers' rules require it).
7. Hand over the server base URL and the token. To revoke: Development -> the app -> Delete (or Regenerate access token).

**Hand over to the agent (store as secrets):** `MASTODON_INSTANCE_URL`, `MASTODON_ACCESS_TOKEN`

**Agent does**
- All calls: Authorization: Bearer $MASTODON_ACCESS_TOKEN against $MASTODON_INSTANCE_URL.
- GET /api/v2/instance -> configuration.statuses.max_characters (default 500), max_media_attachments (default 4), media_attachments limits.
- Media: POST /api/v2/media multipart {file, description (alt text), focus?} -> 200 (image, ready) or 202 (video/audio still processing; url null). Poll GET /api/v1/media/:id until url is set (206 = still processing).
- Post: POST /api/v1/statuses with header Idempotency-Key: <uuid> and body {status, media_ids:[...<=4], visibility:'public'|'unlisted'|'private'|'direct', spoiler_text?, sensitive?, language:'en', in_reply_to_id? (threads), poll?:{options:[], expires_in}}.
- Schedule: add scheduled_at (ISO 8601, >=5 min ahead) -> returns a ScheduledStatus. List GET /api/v1/scheduled_statuses; reschedule PUT /api/v1/scheduled_statuses/:id {scheduled_at}; cancel DELETE same.
- Threads: post the first, then each next with in_reply_to_id of the previous.
- Limits: 300 req/5 min, 30 media uploads/30 min; on 429 wait until X-RateLimit-Reset.

**Test:** GET /api/v1/accounts/verify_credentials (needs read:accounts or profile scope; otherwise skip) or POST /api/v1/statuses {status:'test', visibility:'direct'} -> expect an id; then DELETE /api/v1/statuses/:id.

**Notes:** Tokens from Development do not expire until revoked. Every server has its own token and rules - check the server's rules on automated posting. Fediverse forks (Glitch, Hometown, GoToSocial, Akkoma) mostly accept the same calls; scheduled_at support varies on non-Mastodon software. Pixelfed is handled separately (no scheduled_at, no text-only posts).

**Alternative:** Schedulers: Buffer, Typefully, Postiz, Mixpost, Fedica (connect via Mastodon OAuth).

## Threads
_Route: `official_api_own_account`_ · Docs: https://developers.facebook.com/docs/threads/posts

**Human does**
1. Have a Threads profile (created from your Instagram account).
2. developers.facebook.com → Log in → register as a developer.
3. My Apps → Create app → Use case: 'Access the Threads API' → Create app.
4. Use cases → Customize 'Access the Threads API' → Permissions: threads_basic (default) and add threads_content_publish.
5. Same Settings page: set Redirect Callback URL (the agent's redirect URL, https), plus Uninstall and Delete callback URLs (any URL you control). Note the Threads App ID and Threads App Secret shown there.
6. App roles → Roles → Add people → 'Threads Tester' → your Threads username. Then accept: threads.net (web) or app → Settings → Account → Website permissions → Invites → Accept.
7. Optional shortcut: use the Threads tab in Graph API Explorer / the 'User Token Generator' on the use-case page to generate a token for yourself.
8. Open the agent's sign-in link and approve.

**Hand over to the agent (store as secrets):** `THREADS_APP_ID`, `THREADS_APP_SECRET`, `THREADS_ACCESS_TOKEN (long-lived, 60 days)`, `THREADS_USER_ID (agent can fetch via /me)`

**Agent does**
- https://threads.net/oauth/authorize?client_id=…&redirect_uri=…&scope=threads_basic,threads_content_publish&response_type=code → POST https://graph.threads.net/oauth/access_token (code) → GET https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=…&access_token=… → 60-day token.
- Refresh (token ≥24h old, unexpired): GET https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=…; do it weekly/monthly.
- Create container: POST https://graph.threads.net/v1.0/{user-id}/threads with media_type=TEXT|IMAGE|VIDEO|CAROUSEL, text, image_url/video_url (public URLs), optional poll_attachment, link_attachment, quote_post_id, reply_to_id. Carousel: children with is_carousel_item=true first.
- Wait (~30 s for media; poll GET /{container-id}?fields=status), then POST /{user-id}/threads_publish?creation_id=…
- Hold scheduled posts in the agent's scheduler (no API publish time). Check GET /{user-id}/threads_publishing_limit (250 posts/24h).

**Test:** GET https://graph.threads.net/v1.0/me?fields=id,username → expect your username; then publish a TEXT post 'test' and delete it in the app (or via DELETE /{media-id} if threads_delete is granted).

**Notes:** Works for your own (app-role/tester) account without App Review. 60-day token must be refreshed. 500-char text limit; one topic tag per post.

**Alternative:** Native in-app scheduler, or Buffer/Publer/Sprout/Ayrshare.

## Weibo
_Route: `official_api_own_account`_ · Docs: https://open.weibo.com/wiki/

**Human does**
1. Have a Weibo account bound to a mobile number (Chinese +86 number strongly recommended) and own a website domain you can edit.
2. Go to open.weibo.com -> 'Developer' / 登录 -> complete developer information and real-name verification (个人开发者 with Chinese ID; foreigners may be unable to pass; enterprises need business license).
3. 微连接 -> 网站接入 (Website) -> create app; verify ownership of your domain (add the meta tag Weibo gives to your homepage).
4. My Apps -> app -> 应用信息 -> 基本信息 -> edit '安全域名' (secure domain) = your domain; 高级信息 -> set 授权回调页 (OAuth callback URL) on that domain.
5. Copy App Key and App Secret. The app may stay in test status; the developer's own account can authorize it without review.
6. Authorize your own account: open https://api.weibo.com/oauth2/authorize?client_id=APP_KEY&redirect_uri=CALLBACK&response_type=code and hand the code to the agent.

**Hand over to the agent (store as secrets):** `WEIBO_APP_KEY`, `WEIBO_APP_SECRET`, `WEIBO_REDIRECT_URI`, `WEIBO_ACCESS_TOKEN`, `WEIBO_SECURE_DOMAIN`

**Agent does**
- Exchange code: POST https://api.weibo.com/oauth2/access_token (client_id, client_secret, grant_type=authorization_code, code, redirect_uri) -> access_token, expires_in, uid.
- Post: POST https://api.weibo.com/2/statuses/share.json multipart: access_token, status=URL-encoded text (<=140 chars) that includes at least one link on WEIBO_SECURE_DOMAIN (e.g. the blog post URL), optional pic=@image (one image, JPEG/PNG/GIF, <5MB).
- No scheduling via API: keep the queue on the agent side and call share at the desired time.
- Before expiry (check expires_in), re-run authorization; there is no refresh token for web apps.

**Test:** POST https://api.weibo.com/oauth2/get_token_info with access_token=... -> returns uid, appkey, expire_in (no post created).

**Notes:** Only statuses/share remains for writing; no video/article APIs for normal apps. Posts must link to your own domain, which suits cross-posting a blog. Hashtags not allowed in share text per reports. Real-name/phone requirements effectively need Chinese identity.

**Alternative:** Manual: Weibo app/web composer with built-in timed post (定时微博).

## X (Twitter)
_Route: `official_api_own_account`_ · Docs: https://docs.x.com/x-api/getting-started/pricing

**Human does**
1. 1. Sign in at https://console.x.com (developer.x.com redirects there) with the X account that will post; accept the Developer Agreement and describe the use case ('posting my own content to my own account').
2. 2. In the Console create an App (it is placed in a Project automatically, or create Project → App).
3. 3. Billing / Credits: add a payment method and buy prepaid credits (e.g. $5–10 to start); optionally set a monthly spending limit. Budget: ~$0.015 per plain post, ~$0.20 per post containing a link.
4. 4. App → Settings → User authentication settings → Set up: App permissions = 'Read and write'; Type of App = 'Web App, Automated App or Bot' (confidential, gives a Client Secret); Callback URI = the agent's redirect URL (e.g. http://127.0.0.1:8765/callback); Website URL = any site you own (or your X profile URL). Save.
5. 5. App → Keys and tokens → OAuth 2.0 Client ID and Client Secret: copy both (secret is shown once; regenerate if lost).
6. 6. When the agent prints the authorization URL, open it while logged into the posting account and click 'Authorize app'.
7. 7. Optional: if the account is a bot rather than you posting your own content, set Settings and privacy → Your account → Account information → Automation, and link your managing account so the 'Automated' label shows.

**Hand over to the agent (store as secrets):** `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_REDIRECT_URI`, `X_REFRESH_TOKEN (produced after step 6; agent stores and rotates it)`

**Agent does**
- 1. Generate PKCE code_verifier/code_challenge (S256) and state; send the user to https://x.com/i/oauth2/authorize?response_type=code&client_id=...&redirect_uri=...&scope=tweet.read%20tweet.write%20users.read%20media.write%20offline.access&state=...&code_challenge=...&code_challenge_method=S256.
- 2. Exchange the code: POST https://api.x.com/2/oauth2/token (grant_type=authorization_code, code, redirect_uri, code_verifier; HTTP Basic auth with client id:secret). Store access_token (2h) and refresh_token.
- 3. GET /2/users/me to confirm the account id/handle.
- 4. Media: POST /2/media/upload/initialize (media_type, total_bytes, media_category tweet_image|tweet_video|tweet_gif) → POST /2/media/upload/{id}/append (chunks, segment_index) → POST /2/media/upload/{id}/finalize → for video poll GET /2/media/upload?command=STATUS&media_id=... until succeeded. Images may use one-shot POST /2/media/upload.
- 5. Post: POST /2/tweets {text, media:{media_ids:[...]}} ; threads via reply.in_reply_to_tweet_id; polls via poll{options,duration_minutes}.
- 6. Before expiry (or on 401) refresh: POST /2/oauth2/token grant_type=refresh_token; persist the NEW refresh_token immediately (single-use).
- 7. No API scheduling: keep a local queue and call POST /2/tweets at the due time (cron/scheduler).
- 8. Respect costs (avoid links when not needed, or put the link in a reply only if the user agrees), handle 429 with x-rate-limit-reset, never post duplicate text (403 duplicate).

**Test:** GET https://api.x.com/2/users/me with the bearer access token → returns your id and username (read call, negligible cost). Optional publish test: POST /2/tweets {"text":"API test <timestamp>"} → returns data.id (costs ~$0.015), then DELETE /2/tweets/{id}.

**Notes:** No free tier for new developers since Feb 2026; credits must be prepaid or calls fail (402/403 credits). Links cost ~13x more per post. Refresh tokens rotate; losing the latest one forces re-authorization. Scopes are fixed at authorization time (add media.write before authorizing). The 'Automated' label is for bot accounts; a person scheduling their own posts does not need it. Pricing reference is docs.x.com (blocked here; confirmed via search snippets citing it).

**Alternative:** Typefully, Buffer or Hootsuite: connect X in the tool (no developer account or credits on your side) and let the agent use the tool's API (Buffer/Typefully APIs) or the tool UI; note some tools charge an extra X add-on.

## Flickr
_Route: `official_api_own_account`_ · Docs: https://www.flickr.com/services/api/

**Human does**
1. Subscribe to Flickr Pro on the account that will own the photos (flickr.com/account/upgrade/pro).
2. Go to https://www.flickr.com/services/apps/create → 'Request an API Key' → 'Apply for a Non-Commercial Key'. Fill app name/description, accept terms → Submit. Copy Key and Secret.
3. On the app's page (The App Garden → Your apps → Edit authentication flow) set app type 'Web Application' with callback URL from the agent, or leave it for out-of-band (oauth_callback=oob) where you paste a verifier code.
4. Open the authorize link the agent produces (https://www.flickr.com/services/oauth/authorize?oauth_token=...&perms=write), approve, give the agent the verifier code.

**Hand over to the agent (store as secrets):** `FLICKR_API_KEY`, `FLICKR_API_SECRET`, `FLICKR_OAUTH_TOKEN`, `FLICKR_OAUTH_TOKEN_SECRET`

**Agent does**
- OAuth 1.0a (HMAC-SHA1 signed): GET https://www.flickr.com/services/oauth/request_token (oauth_callback) → user authorizes with perms=write → GET https://www.flickr.com/services/oauth/access_token (oauth_verifier). Store token+secret (no expiry).
- Upload: POST https://up.flickr.com/services/upload/ multipart with 'photo' file + title, description, tags, is_public/is_friend/is_family, safety_level, content_type, hidden; sign all params except 'photo'. Response XML contains <photoid>. Add async=1 for large files and poll flickr.photos.upload.checkTickets.
- Album: flickr.photosets.addPhoto (photoset_id, photo_id) or flickr.photosets.create via POST https://api.flickr.com/services/rest/ (format=json&nojsoncallback=1).
- Scheduling: none native; upload with is_public=0 and later call flickr.photos.setPerms is_public=1, or set flickr.photos.setDates for date-posted.
- Stay under 3,600 calls/hour.

**Test:** Signed GET https://api.flickr.com/services/rest/?method=flickr.test.login&format=json&nojsoncallback=1 — expect your user id and username.

**Notes:** If Pro lapses, the key request path is gone; existing keys behaviour on lapse unverified. Free accounts are limited to 1,000 photos/videos total. Video uploads supported (size/length limits per account type).

**Alternative:** Flickr Uploadr / web uploader manually; no scheduler tools found.

## Pixelfed
_Route: `official_api_own_account`_ · Docs: https://docs.pixelfed.org/

**Human does**
1. Log in to your Pixelfed server in a browser.
2. Open https://<your-server>/settings/applications (Settings -> Applications).
3. Under Personal Access Tokens click Create New Token, name it 'posting-agent', select the read and write scopes, click Create.
4. Copy the token (shown once) and give it with your server URL to the agent.
5. To revoke: same page -> Delete the token.

**Hand over to the agent (store as secrets):** `PIXELFED_INSTANCE_URL`, `PIXELFED_ACCESS_TOKEN`

**Agent does**
- All calls: Authorization: Bearer $PIXELFED_ACCESS_TOKEN (Pixelfed requires auth even for reads).
- GET /api/v1/instance -> configuration.statuses.max_media_attachments, max_characters, media_attachments.supported_mime_types and size limits.
- Media: POST /api/v1/media multipart {file, description (alt text)} -> {id}. (v2 /api/v2/media also exists.) Repeat for each image of a carousel (default max 4).
- Post: POST /api/v1/statuses {status (caption), media_ids:[...], visibility:'public'|'unlisted'|'private', sensitive?, spoiler_text?} with optional Idempotency-Key header -> Status with id/url.
- No text-only posts and no 'direct' visibility; no scheduled_at - queue on the agent side.
- Respect daily caps (1,000 posts / 1,250 media per 24 h by default) and HTTP 429.

**Test:** GET /api/v1/accounts/verify_credentials with the token -> expect your account JSON (no post created).

**Notes:** Each server has its own token and limits. Video only works if the admin added video MIME types. Stories are not in the Mastodon-compatible API.

**Alternative:** Fedica or Postpone (scheduler) connected via Pixelfed OAuth; otherwise post manually in the Pixelfed app.

## Apple Podcasts
_Route: `scheduler_or_automation_tool`_ · Docs: https://podcasters.apple.com/support/823-podcast-requirements

**Human does**
1. Pick a podcast host with an API (example: Buzzsprout — any host works; Buzzsprout docs are used below). Create the account and the show (title, description, 3000x3000 artwork, category, owner email).
2. Publish at least one episode in the host so the RSS feed is valid; copy the RSS feed URL.
3. Sign in to Apple Podcasts Connect (https://podcastsconnect.apple.com) with your Apple Account → '+' → New Show → 'Add a show with an RSS feed' → paste feed URL → fill review info → Submit. Wait for Apple review (typically up to a few days).
4. (Optional) Buzzsprout: Directories → Apple Podcasts does the submission for you instead of step 3.
5. Get the host API token: Buzzsprout → Profile → API (copy the token and the numeric podcast ID shown there).

**Hand over to the agent (store as secrets):** `BUZZSPROUT_API_TOKEN`, `BUZZSPROUT_PODCAST_ID`

**Agent does**
- All calls: https://www.buzzsprout.com/api/..., header Authorization: Token token=$BUZZSPROUT_API_TOKEN, Content-Type: application/json; charset=utf-8, identifiable User-Agent.
- GET /api/podcasts — confirm podcast id.
- POST /api/{podcast_id}/episodes {"title":...,"description":...,"private":true,"episode_number":..,"season_number":..,"explicit":false} → episode id.
- POST /api/{podcast_id}/episodes/{id}/uploads {filename, byte_size, type:'audio/mpeg'} (add multipart:true for big files) → upload_url.
- PUT exact file bytes to upload_url (no Buzzsprout auth header; URL valid 6 h).
- POST /api/{podcast_id}/episodes/{id}/uploads/{upload_id}/complete (required).
- Poll GET /api/{podcast_id}/episodes/{id} until duration != -1.
- Publish/schedule: PATCH /api/{podcast_id}/episodes/{id} {"private":false,"published_at":"2026-10-20T09:00:00-04:00"} — future time = scheduled; the RSS feed (and thus Apple Podcasts) picks it up at that time.
- Limit: 60 requests/min per token; retry 429/5xx with backoff.

**Test:** GET https://www.buzzsprout.com/api/podcasts with the token — expect your show(s) and IDs.

**Notes:** Apple ingests from the RSS feed; new episodes may take a few hours to show. Without a host, a self-hosted RSS feed edited by the agent also works (add <item> with enclosure url/length/type, guid, pubDate; host the MP3 on HTTPS with byte-range support). Subscription/premium episodes require Apple Podcasters Program + Delegated Delivery host.

**Alternative:** Self-hosted RSS: agent uploads audio to own HTTPS storage and appends an <item> to the feed XML (pubDate = publish time); Apple polls the feed.

## LinkedIn
_Route: `official_api_own_account`_ · Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin

**Human does**
1. 1. Make sure you have a LinkedIn Company Page you admin (required to own a developer app). If none: LinkedIn → For Business → Create a Company Page (any small page is fine).
2. 2. Go to https://www.linkedin.com/developers/apps → 'Create app'. Fill App name, LinkedIn Page (select your page), Privacy policy URL (optional), App logo, tick the legal agreement → Create app.
3. 3. Settings tab → 'Verify' the app association: send the verification URL to the page admin (yourself) and approve it.
4. 4. Products tab → 'Request access' on 'Sign In with LinkedIn using OpenID Connect' and on 'Share on LinkedIn' (both self-serve; approved instantly after accepting terms).
5. 5. Auth tab → OAuth 2.0 settings → add Authorized redirect URL from the agent (e.g. http://localhost:8765/callback). Copy Client ID and Primary Client Secret.
6. 6. When the agent shows the authorization URL, open it logged in as yourself and click 'Allow'.
7. 7. Every ~55 days repeat step 6 when the agent reminds you (no refresh tokens for self-serve).

**Hand over to the agent (store as secrets):** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`, `LINKEDIN_ACCESS_TOKEN (after step 6, valid 60 days)`

**Agent does**
- 1. Authorization: https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=...&redirect_uri=...&state=...&scope=openid%20profile%20w_member_social
- 2. Exchange: POST https://www.linkedin.com/oauth/v2/accessToken (grant_type=authorization_code, code, redirect_uri, client_id, client_secret). Record expires_in (5184000 s).
- 3. GET https://api.linkedin.com/v2/userinfo → 'sub' → author URN urn:li:person:{sub}.
- 4. Images: POST /rest/images?action=initializeUpload {initializeUploadRequest:{owner:urn}} → PUT binary to uploadUrl → use image URN. Video: POST /rest/videos?action=initializeUpload → upload parts → POST /rest/videos?action=finalizeUpload. Documents: /rest/documents similarly.
- 5. Post: POST https://api.linkedin.com/rest/posts with headers Authorization: Bearer, LinkedIn-Version: YYYYMM (a currently supported month), X-Restli-Protocol-Version: 2.0.0; body {author, commentary, visibility:'PUBLIC', distribution:{feedDistribution:'MAIN_FEED'}, content:{media:{id}} or {article:{source,title}}, lifecycleState:'PUBLISHED', isReshareDisabledByAuthor:false}. Post URN returned in x-restli-id header (201).
- 6. Scheduling: keep a local queue; call /rest/posts at the due time (no API scheduling).
- 7. Track token expiry and alert the user ~5 days before 60 days to re-authorize; respect daily per-member limits (~150 requests/member/day for sharing) and 429s.

**Test:** GET https://api.linkedin.com/v2/userinfo with the bearer token → returns sub, name (no post created).

**Notes:** Escape reserved characters in commentary (little text format: ( ) [ ] { } @ # * _ ~ < > | \). LinkedIn-Version header must be a currently supported version (versions sunset after ~1 year). Company page posting needs Community Management API (separate app, business verification, review). Native LinkedIn scheduler (up to 3 months) exists in the web/app composer.

**Alternative:** Buffer/Hootsuite/Publer connect a personal LinkedIn profile without a developer app and avoid the 60-day re-auth chores (tool handles tokens).

## Facebook Pages
_Route: `official_api_own_account`_ · Docs: https://developers.facebook.com/docs/pages-api/posts

**Human does**
1. Make sure you have full control (or 'Content' task access) of a Facebook Page (not a personal profile).
2. developers.facebook.com → Log in → Get started → verify to register as a developer.
3. My Apps → Create app → Use case: 'Manage everything on your Page' → (business portfolio optional) → Create app.
4. Use cases → Customize 'Manage everything on your Page' → add permissions pages_show_list, pages_read_engagement, pages_manage_posts (also business_management if the Page is in a business portfolio).
5. App settings → Basic: add Privacy Policy URL; copy App ID and App Secret. Keep app in Development mode.
6. Tools → Graph API Explorer → select your app → User or Page: 'Get User Access Token' → tick the permissions above → Generate → in the Facebook dialog choose your Page(s) → Continue.
7. Give the short-lived user token to the agent (or sign in via the agent's login link).

**Hand over to the agent (store as secrets):** `META_APP_ID`, `META_APP_SECRET`, `FB_USER_TOKEN (short-lived, agent exchanges) or FB_PAGE_TOKEN`, `FB_PAGE_ID`

**Agent does**
- GET https://graph.facebook.com/v{ver}/oauth/access_token?grant_type=fb_exchange_token&client_id=…&client_secret=…&fb_exchange_token=… → long-lived user token (~60 days).
- GET /me/accounts?fields=id,name,access_token → Page token (does not expire when derived from a long-lived user token; invalidated if password/permissions change).
- Text/link: POST /{page-id}/feed (message, link). Photo: POST /{page-id}/photos (url or source, caption). Video: POST /{page-id}/videos. Reels: POST /{page-id}/video_reels upload_phase=start → upload to rupload.facebook.com → upload_phase=finish&video_state=PUBLISHED. Stories: /photo_stories, /video_stories.
- Schedule: published=false + scheduled_publish_time (UNIX, 10 min – 30 days ahead) on /feed, /photos, /videos; Reels support video_state=SCHEDULED + scheduled_publish_time.
- Respect rate limits (Page: 4,800 × engaged users/24h; Reels 30/24h).

**Test:** POST /{page-id}/feed with message='test', published=false, scheduled_publish_time=<now+1h> → expect a post id; then DELETE /{post-id}.

**Notes:** Personal profiles can't be posted to via API. Page tokens break if the user changes password or removes the app. New Pages Experience: the user needs Facebook access with Content task.

**Alternative:** Meta Business Suite native scheduler, or Buffer/Hootsuite/Publer.

## Instagram
_Route: `official_api_own_account`_ · Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing

**Human does**
1. Instagram app → Profile → ☰ → Settings and activity → Account type and tools → Switch to professional account → Creator or Business.
2. Go to developers.facebook.com → Log in with Facebook → Get started → verify (phone/email) to register as a developer.
3. My Apps → Create app → name + contact email → Use case: 'Manage messaging & content on Instagram' → (business portfolio: skip or choose) → Create app.
4. App dashboard → Use cases → Customize 'Manage messaging & content on Instagram' → 'API setup with Instagram login'. Under permissions add instagram_business_basic and instagram_business_content_publish.
5. Same page → '2. Generate access tokens' → Add account → log in to your Instagram account. If asked to add as tester first: App roles → Roles → Add people → Instagram Tester → your username; then Instagram (web) → Settings → Apps and websites → Tester invites → Accept.
6. Click 'Generate token' next to your account → copy the token (this is already a 60-day long-lived token) and note the Instagram app ID/secret shown on that page (Instagram App ID differs from the Meta App ID).
7. App settings → Basic: add a Privacy Policy URL and save. Leave the app in Development mode (no App Review needed for your own account).
8. If the agent will do OAuth itself: under '3. Set up Instagram business login' add the agent's redirect URL.

**Hand over to the agent (store as secrets):** `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_ACCESS_TOKEN (60-day long-lived)`, `INSTAGRAM_USER_ID (agent can fetch via /me)`, `MEDIA_HOST base URL or storage credentials for public media hosting`

**Agent does**
- (If doing OAuth) https://www.instagram.com/oauth/authorize?client_id=…&redirect_uri=…&response_type=code&scope=instagram_business_basic,instagram_business_content_publish → POST https://api.instagram.com/oauth/access_token → GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token → 60-day token.
- Refresh every ~30–45 days: GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=… (token must be ≥24h old and unexpired).
- GET https://graph.instagram.com/me?fields=user_id,username → IG user id.
- Upload media to a public HTTPS URL (Meta's servers fetch it).
- Create container: POST https://graph.instagram.com/v{ver}/{ig-user-id}/media with image_url, or media_type=REELS + video_url, or media_type=STORIES + image_url/video_url; carousels: create each child with is_carousel_item=true, then media_type=CAROUSEL&children=id1,id2…; add caption.
- Poll GET /{container-id}?fields=status_code until FINISHED (videos), then POST /{ig-user-id}/media_publish?creation_id={container-id}.
- Schedule by holding the job in the agent's scheduler (API has no publish-time field). Check GET /{ig-user-id}/content_publishing_limit before publishing.

**Test:** GET https://graph.instagram.com/me?fields=user_id,username,account_type&access_token=… → expect your username and BUSINESS/MEDIA_CREATOR; then GET /{ig-user-id}/content_publishing_limit (non-posting).

**Notes:** Personal accounts can't use the API. Token expires in 60 days if not refreshed. Images must be JPEG; no shopping tags/filters; containers expire after 24h. Docs prose has varied between 50 and 100 posts/24h — trust content_publishing_limit. Development mode is enough for accounts with an app role.

**Alternative:** Facebook Login route (graph.facebook.com, permissions instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement) if the IG account is linked to a Facebook Page; or schedulers (Buffer, Later, Hootsuite, Metricool) / native in-app scheduling.

## MeWe
_Route: `scheduler_or_automation_tool (Postiz Cloud)`_ · Docs: https://docs.postiz.com/providers/mewe (MeWe's own developer docs are behind the developer program login)

**Human does**
1. 1. Sign up at postiz.com (Cloud; paid plans from $29/month) — or self-host Postiz (see Postiz hub entry).
2. 2. In Postiz click 'Add Channel' → choose 'MeWe' → log in to MeWe and authorize.
3. 3. (Self-hosted only) First join the MeWe Developer Program: sign in to the MeWe Developer Portal → submit application → wait for approval → create a new application of type 'Standalone App' → copy App ID and API Key into Postiz's .env (variable names per docs.postiz.com/self-host/providers/mewe) → restart Postiz.
4. 4. In Postiz: Settings → Developers → Public API → copy the API key.

**Hand over to the agent (store as secrets):** `POSTIZ_API_URL=https://api.postiz.com/public/v1 (or https://<your-host>/api/public/v1 when self-hosted)`, `POSTIZ_API_KEY`

**Agent does**
- 1. GET {POSTIZ_API_URL}/integrations with header 'Authorization: <POSTIZ_API_KEY>' (no 'Bearer') → find the integration with providerIdentifier 'mewe' and note its id.
- 2. (If media) POST {POSTIZ_API_URL}/upload (multipart file) → get the media path/id.
- 3. POST {POSTIZ_API_URL}/posts with type 'schedule' (or 'now'), date (ISO), and posts[0] = {integration:{id}, value:[{content, image:[...]}], settings:{__type:'mewe', postType:'timeline'}} (use postType 'group' + group id for groups).

**Test:** curl -H 'Authorization: $POSTIZ_API_KEY' $POSTIZ_API_URL/integrations → expect a MeWe entry.

**Notes:** Postiz public API limit: 30 requests/hour per key (create-post ~90-100/hour). Postiz Cloud has presumably already been accepted into MeWe's developer program; self-hosters must apply themselves (beta, limited spots). MeWe token lifetime/scopes not published.

**Alternative:** Apply to the MeWe Developer Program directly and call MeWe's API with your own app; or post manually in the MeWe app.

## OK.ru
_Route: `official_api_own_account`_ · Docs: https://apiok.ru/en/dev/sdk/js/ui.postMediatopic/

**Human does**
1. Log in to ok.ru with the account that owns/administers the target group (or your personal profile).
2. Enable developer rights: open https://ok.ru/devaccess and accept the developer terms.
3. Create the app: Games/Apps section -> 'My uploaded' (or https://ok.ru/app/setup) -> 'Add application' -> type 'External' (website/OAuth), set name, redirect URI (e.g. https://localhost/callback), and in the OAuth section tick VALUABLE_ACCESS, GROUP_CONTENT, PHOTO_CONTENT, LONG_ACCESS_TOKEN (VIDEO_CONTENT if posting video).
4. From the app settings email/page copy Application ID, Public key (application_key) and Secret key (application_secret_key). The settings page also shows an owner 'eternal' access_token + session_secret_key for testing on your own account (reported; use if present).
5. Email api-support@ok.ru: app ID, app link, list of permissions (VALUABLE_ACCESS, GROUP_CONTENT, PHOTO_CONTENT, LONG_ACCESS_TOKEN) and use case 'publishing my own content to my group ID NNNN'. Wait for approval (days).
6. Authorize your own account once: open https://connect.ok.ru/oauth/authorize?client_id=APP_ID&scope=VALUABLE_ACCESS;GROUP_CONTENT;PHOTO_CONTENT;LONG_ACCESS_TOKEN&response_type=code&redirect_uri=REDIRECT and hand the code to the agent.
7. Note the group ID (Group -> settings, or from the group URL ok.ru/group/NNNN).

**Hand over to the agent (store as secrets):** `OK_APP_ID`, `OK_APP_PUBLIC_KEY`, `OK_APP_SECRET_KEY`, `OK_ACCESS_TOKEN`, `OK_REFRESH_TOKEN`, `OK_SESSION_SECRET_KEY (if eternal token)`, `OK_GROUP_ID`

**Agent does**
- Token: POST https://api.ok.ru/oauth/token.do?code=CODE&client_id=APP_ID&client_secret=SECRET&redirect_uri=REDIRECT&grant_type=authorization_code -> access_token, refresh_token; refresh with grant_type=refresh_token.
- Signing: session_secret_key = md5(access_token + application_secret_key) (lowercase hex). sig = md5( concat of 'key=value' for all params except access_token and session_key, sorted by key, no separators ) + session_secret_key ), lowercase. Send application_key, format=json, method, params, sig, access_token to https://api.ok.ru/fb.do.
- Photo: method=photosV2.getUploadUrl gid=GROUP_ID count=1 -> upload_url, photo_ids; POST multipart pic1=@file to upload_url -> photos{photo_id:{token}}; use the token as photo id in the attachment.
- Post: method=mediatopic.post gid=GROUP_ID type=GROUP_THEME attachment={"media":[{"type":"text","text":"..."},{"type":"photo","list":[{"id":"TOKEN"}]},{"type":"link","url":"https://..."}],"publishAt":"2026-10-10 12:00:00"} (omit publishAt to post now). For your own feed use type=USER without gid.
- Video: video.getUploadUrl (needs VIDEO_CONTENT) -> upload -> attach {type:'movie', list:[{id:VIDEO_ID}]}.
- Handle PERMISSION_DENIED (permission not granted by support), PARAM_SIGNATURE (signing bug).

**Test:** https://api.ok.ru/fb.do?application_key=...&format=json&method=users.getCurrentUser&sig=...&access_token=... -> returns your uid and name.

**Notes:** Nothing works for groups until OK support grants GROUP_CONTENT + VALUABLE_ACCESS. publishAt is local Moscow time format string. Signature excludes access_token. Keep the app secret server-side.

**Alternative:** SMMplanner or postmypost (connect OK account, schedule posts) - no developer approval needed.

## VK
_Route: `official_api_own_account`_ · Docs: https://dev.vk.ru/en/method/wall.post

**Human does**
1. Use a VK community (group/public page) you administer (posting to a community is the simplest route; personal-wall posting needs a VK ID app and user OAuth).
2. Open the community -> 'Manage' (Управление) -> 'API usage' (Работа с API) -> 'Access tokens' (Ключи доступа) -> 'Create token'.
3. Tick rights: 'Community management' (manage), 'Photos' (photos), 'Wall' (wall), 'Documents' (docs); confirm with the SMS/push code. Copy the token.
4. Copy the numeric community ID (Manage -> Settings shows the address; or vk.com/clubNNNN -> NNNN).
5. OPTIONAL personal wall / video upload: go to id.vk.com/about/business -> create a VK ID app (web), complete developer verification (passport + face scan for individuals), enable scopes wall, photos, video, set redirect URL; copy app ID (client_id). No fees.

**Hand over to the agent (store as secrets):** `VK_COMMUNITY_TOKEN`, `VK_GROUP_ID`, `(optional) VK_ID_CLIENT_ID`, `VK_USER_ACCESS_TOKEN`, `VK_USER_REFRESH_TOKEN`

**Agent does**
- All calls: POST https://api.vk.com/method/{method} with access_token=... and v=5.199 (current API version) form params.
- Photo: photos.getWallUploadServer group_id=GROUP_ID -> upload_url; POST multipart photo=@file to upload_url -> {server, photo, hash}; photos.saveWallPhoto group_id, server, photo, hash -> owner_id,id -> attachment 'photo{owner_id}_{id}'. (If the community token is rejected for upload methods, use a user token with photos scope.)
- Video: video.save group_id=GROUP_ID name, description, wallpost=0 -> upload_url; POST multipart video_file to it -> attachment 'video{owner_id}_{video_id}' (requires a user token with video scope).
- Post: wall.post owner_id=-GROUP_ID, from_group=1, message, attachments='photo-1_2,video-1_3' (max 10), optional publish_date=unix timestamp for a deferred post.
- Rate: stay under 20 req/s community / 3 req/s user; handle error 6 (too many requests), 9 (flood control), 14 (captcha), 214 (posting denied / limit reached) with backoff.
- VK ID user token (personal wall): OAuth 2.1 + PKCE at https://id.vk.com/authorize -> POST https://id.vk.com/oauth2/auth (grant_type=authorization_code, code_verifier, device_id) -> access_token (~1h) + refresh_token; refresh with grant_type=refresh_token.

**Test:** POST https://api.vk.com/method/groups.getById with access_token=VK_COMMUNITY_TOKEN&v=5.199 -> returns your community info (no post created).

**Notes:** owner_id must be negative for communities. Deferred posts appear in the community's 'Postponed' list. Undocumented daily limits; avoid bursts of posts. Community tokens never expire unless revoked or rights change.

**Alternative:** SMMplanner, Postiz or Make VK modules (OAuth to your account) for scheduling without code.

## Bilibili
_Route: `official_api_own_account`_ · Docs: https://openhome.bilibili.com/doc

**Human does**
1. Apply as a developer at https://openhome.bilibili.com (哔哩哔哩开放平台): log in with your Bilibili account, choose developer type and submit qualifications (enterprise with Chinese business license likely required for content-submission capability; individual eligibility unverified).
2. Create an application (网站应用), set the OAuth callback URL, and request the 视频稿件 (video submission) permission; wait for review.
3. Copy client_id and client_secret.
4. Authorize your own account via the OAuth authorize link shown in the console; hand the code to the agent.

**Hand over to the agent (store as secrets):** `BILI_CLIENT_ID`, `BILI_CLIENT_SECRET`, `BILI_REDIRECT_URI`, `BILI_ACCESS_TOKEN`, `BILI_REFRESH_TOKEN`

**Agent does**
- Token: POST https://api.bilibili.com/x/account-oauth2/v1/token (application/x-www-form-urlencoded: client_id, client_secret, grant_type=authorization_code, code) -> access_token, refresh_token, expires_in; refresh before expiry with grant_type=refresh_token.
- Init upload: POST https://member.bilibili.com/arcopen/fn/archive/video/init?client_id=..&access_token=.. JSON {name:'file.mp4', utype:0} -> upload_token.
- Upload parts: POST the file chunks to the part-upload endpoint (openupos.bilivideo.com/video/v2/part/upload?upload_token=..&part_number=N per docs), then POST https://member.bilibili.com/arcopen/fn/archive/video/complete?upload_token=..
- Cover: POST https://member.bilibili.com/arcopen/fn/archive/cover/upload?client_id=..&access_token=.. multipart file -> url.
- Submit: POST https://member.bilibili.com/arcopen/fn/archive/add-by-utoken?client_id=..&access_token=..&upload_token=.. JSON {title, cover, tid (category ID), tag:'a,b', desc, copyright:1, no_reprint:1} -> resource_id (BV id). Videos go through Bilibili moderation before appearing.
- Scheduling via API unverified - agent queues and submits at the target time.

**Test:** GET the open-platform user-info endpoint (arcopen/fn/user/account/info?client_id=..&access_token=..) -> your mid/nickname (no submission).

**Notes:** Official docs were not fetchable; part-upload host and user-info path are from third-party mirrors of the docs. Permission is granted to approved developers only. Unofficial cookie-based tools (biliup) work for individuals but are outside the official API and risk account action.

**Alternative:** Manual upload in the creator center (member.bilibili.com/platform/upload) with built-in timed publish (定时发布).

## Dailymotion
_Route: `official_api_own_account`_ · Docs: https://developers.dailymotion.com/guides/upload/

**Human does**
1. Have a Dailymotion channel and log in to Dailymotion Studio (https://studio.dailymotion.com) as Owner or Admin of the organization.
2. Studio → Organization → API keys → 'Create API key' → choose 'Public API key'.
3. Title + description; Callback URL = the redirect URL the agent gives you (e.g. http://localhost:8080/callback) for Authorization Code grant.
4. Copy API key and API secret (secret is shown once).
5. Open the authorization URL the agent prints, log in, approve scope manage_videos; give the agent the resulting code (or let the agent catch it on localhost).

**Hand over to the agent (store as secrets):** `DAILYMOTION_API_KEY`, `DAILYMOTION_API_SECRET`, `DAILYMOTION_REFRESH_TOKEN`

**Agent does**
- Authorize: https://www.dailymotion.com/oauth/authorize?response_type=code&client_id=$KEY&redirect_uri=...&scope=manage_videos
- Token: POST https://api.dailymotion.com/oauth/token grant_type=authorization_code (then grant_type=refresh_token with client_id/client_secret/refresh_token when expired). Save the refresh token.
- GET https://api.dailymotion.com/file/upload (Bearer token) → upload_url.
- POST the file as multipart field 'file' to upload_url → response contains url.
- POST https://api.dailymotion.com/me/videos with url=<returned url> → video id.
- POST https://api.dailymotion.com/video/{id} with title, is_created_for_kids=false, channel, tags, description, published=true (private=true for private).
- Poll GET /video/{id}?fields=status,encoding_progress until status=published.
- Scheduling: keep published=false and have the agent's own scheduler set published=true later (publish_date unverified).

**Test:** GET https://api.dailymotion.com/me?fields=id,screenname,limits with Bearer token — expect your channel and upload limits.

**Notes:** Use a PUBLIC API key for api.dailymotion.com; private keys only work on partner.api.dailymotion.com. is_created_for_kids is mandatory to publish. Respect daily upload counts.

**Alternative:** Manual upload in Dailymotion Studio; Partner (private API key + client_credentials) route if the user is an organization partner.

## Douyin
_Route: `official_api_own_account`_ · Docs: https://developer.open-douyin.com/

**Human does**
1. Register a developer account at https://developer.open-douyin.com (抖音开放平台) and complete entity verification - in practice a mainland-China enterprise with business license (营业执照) is needed to create mobile/website apps (unverified for individuals).
2. 控制台 -> 创建应用 -> 网站应用 (website app): fill name, icon, website domain (ICP-filed site normally required), submit for review.
3. In the app -> 能力管理 -> apply for '视频发布' / video.create (and user_info); describe the use case; wait for approval.
4. Set the OAuth redirect domain (HTTPS) in the app settings; copy Client Key and Client Secret.
5. Authorize your Douyin account: open https://open.douyin.com/platform/oauth/connect/?client_key=KEY&response_type=code&scope=user_info,video.create&redirect_uri=REDIRECT, scan with the Douyin app, hand the code to the agent.

**Hand over to the agent (store as secrets):** `DOUYIN_CLIENT_KEY`, `DOUYIN_CLIENT_SECRET`, `DOUYIN_REDIRECT_URI`, `DOUYIN_OPEN_ID`, `DOUYIN_ACCESS_TOKEN`, `DOUYIN_REFRESH_TOKEN`

**Agent does**
- Token: POST https://open.douyin.com/oauth/access_token/ {client_key, client_secret, code, grant_type:'authorization_code'} -> access_token (15d), refresh_token (30d), open_id. Refresh: POST https://open.douyin.com/oauth/refresh_token/ {client_key, grant_type:'refresh_token', refresh_token}; renew_refresh_token endpoint before 30 days.
- Upload (<=128MB): POST https://open.douyin.com/api/douyin/v1/video/upload_video/?open_id=OPEN_ID with header access-token: TOKEN, multipart video=@file.mp4 -> video.video_id (legacy path /video/upload/). Larger files: /video/part/init/ -> /video/part/upload/ (chunks) -> /video/part/complete/.
- Publish: POST https://open.douyin.com/api/douyin/v1/video/create_video/?open_id=OPEN_ID header access-token, JSON {video_id, text:'caption #tag', cover_tsp (optional)} -> item_id (legacy /video/create/).
- Scheduling: none via API - agent queues and calls create at the target time.
- Refresh tokens proactively; on error 10010 the user must re-authorize.

**Test:** POST https://open.douyin.com/oauth/userinfo/ {access_token, open_id} -> your nickname/avatar (no publish).

**Notes:** Exact endpoint paths and qualification rules could not be fetched from official docs (blocked); verify in the console. Enterprise verification of a Douyin account (企业号) costs ¥300 per attempt but is separate from developer registration. Without approval, only the 'share to Douyin' SDK/H5 flow (user confirms in app) is available.

**Alternative:** Manual upload via Douyin creator center (creator.douyin.com) with timed publish.

## Kuaishou / Kwai
_Route: `manual`_ · Docs: https://open.kuaishou.com

**Human does**
1. Official API route (China only): register at https://open.kuaishou.com as a developer - mainland-China entity verification (business license) is expected; create a website/mobile app, apply for the video publishing capability (scope user_video_publish, unverified name), set redirect URI, copy app_id and app_secret.
2. Authorize your own Kuaishou account through the OAuth link in the console and hand the code to the agent.
3. If you cannot get approval (likely for an individual or non-Chinese entity): upload manually in the Kuaishou creator center (cp.kuaishou.com) or the app; Kwai (international) has no public posting API.

**Hand over to the agent (store as secrets):** `KUAISHOU_APP_ID`, `KUAISHOU_APP_SECRET`, `KUAISHOU_ACCESS_TOKEN`, `KUAISHOU_REFRESH_TOKEN`

**Agent does**
- Token: GET https://open.kuaishou.com/oauth2/access_token?app_id=..&app_secret=..&code=..&grant_type=authorization_code -> access_token, refresh_token, open_id; refresh with /oauth2/refresh_token?grant_type=refresh_token (lifetimes unverified).
- Start upload: POST https://open.kuaishou.com/openapi/photo/start_upload?app_id=..&access_token=.. -> upload_token + endpoint.
- Upload the video to the returned endpoint (single or fragmented upload per docs).
- Publish: POST https://open.kuaishou.com/openapi/photo/publish?app_id=..&access_token=..&upload_token=.. multipart {caption, cover=@cover.jpg} -> photo_id.
- No API scheduling found; agent queues locally.

**Test:** GET https://open.kuaishou.com/openapi/user_info?app_id=..&access_token=.. -> your nickname (no publish).

**Notes:** Endpoints are from memory/third-party SDKs; official docs could not be fetched and search budget ran out - verify all paths and token lifetimes in the console. Token lifetime reports conflict (2h vs 48h).

**Alternative:** Manual upload with the creator center.

## Odysee
_Route: `official_api_own_account`_ · Docs: https://lbry.tech/api/sdk

**Human does**
1. Have an Odysee account and channel (odysee.com → Create channel).
2. Get the channel into a local wallet: on odysee.com → Settings → (Advanced) Export/Backup wallet or channel; or create the channel inside lbrynet instead. (Odysee web wallets are custodial-sync; exporting the channel signing key is needed for the daemon to publish under the same channel.)
3. Install the LBRY SDK (lbrynet) on an always-on machine: download from https://github.com/lbryio/lbry-sdk/releases, run 'lbrynet start'.
4. Fund the daemon wallet with a small amount of LBC (each publish needs a bid/deposit of e.g. 0.001+ LBC plus tx fees): 'lbrynet address unused' → send LBC to it.
5. Import the exported channel ('lbrynet channel import <key>') or create one ('lbrynet channel create --name=@mychannel --bid=0.01').

**Hand over to the agent (store as secrets):** `LBRYNET_API_URL (default http://localhost:5279)`, `LBRY_CHANNEL_NAME`, `(wallet stays on the machine; do not hand over seed phrase)`

**Agent does**
- All calls: JSON-RPC POST $LBRYNET_API_URL {"method":...,"params":{...}}.
- Check: method 'status' (is_running) and 'wallet_balance'.
- Publish: method 'publish' (or 'stream_create') params {name:'url-slug', file_path:'/abs/path/video.mp4', bid:'0.001', title, description, tags:[...], languages:['en'], channel_name:'@mychannel', thumbnail_url, blocking:true}.
- File is reflected (uploaded) to LBRY reflector servers; Odysee indexes the claim — check with 'file_list' / 'claim_search' --claim_id.
- Update: method 'stream_update' with claim_id. No future scheduling — the agent must trigger publish at the desired time.

**Test:** POST http://localhost:5279 {"method":"channel_list"} — expect your channel listed (no publish).

**Notes:** Unofficial for Odysee specifically (LBRY SDK is open source; LBRY Inc. wound down, Odysee maintains the network). Web uploader prefers web-optimized MP4. Deposits lock LBC while the claim exists. Needs the daemon running until the file is fully reflected.

**Alternative:** Manual upload at odysee.com/$/upload; or Odysee's YouTube Sync for channels that also post to YouTube.

## Snapchat
_Route: `scheduler_or_automation_tool`_ · Docs: https://developers.snap.com/marketing-api/Public-Profile-API/Introduction

**Human does**
1. 1. In the Snapchat app create a Public Profile (Profile → 'Create Public Profile'); you must be 18+. For brands, create a Snap Business account at business.snapchat.com and link the Public Profile.
2. 2. Sign up for a scheduler that auto-publishes to Snapchat (Later, Metricool, OneUp or Ayrshare) and connect Snapchat → log in with Snap and approve access to the Public Profile.
3. 3. If the tool has an API (e.g. Ayrshare API key, paid plan), create a key and give it to the agent; otherwise the agent prepares vertical 9:16 media + captions and you schedule them in the tool.
4. 4. Official route only if you have a Snap partner contact: Business Manager → Business Details → OAuth Apps → create app (redirect URI), then email your Snap contact the client ID and use case to request Public Profile API allowlisting.

**Hand over to the agent (store as secrets):** `AYRSHARE_API_KEY (or the chosen tool's key)`, `SNAP_CLIENT_ID / SNAP_CLIENT_SECRET / SNAP_REFRESH_TOKEN only if allowlisted`

**Agent does**
- 1. Tool route: upload media to the tool and call its post endpoint with platform snapchat, story/spotlight type and scheduleDate; poll status.
- 2. Allowlisted route: OAuth via https://accounts.snapchat.com/login/oauth2/authorize with scope snapchat-profile-api; exchange at https://accounts.snapchat.com/login/oauth2/access_token; refresh hourly (access tokens ~1h).
- 3. Discover your public profile id, upload media through the Public Profile media endpoints, then create Story / Saved Story / Spotlight posts per the Public Profile API docs.
- 4. Hold posts until due (no API scheduling).

**Test:** Tool route: the tool's 'get connected profiles/user' endpoint (e.g. Ayrshare GET /api/user) shows Snapchat as connected. Allowlisted route: list your public profiles via the Public Profile API.

**Notes:** Without a Snap partner contact the Public Profile API is effectively unavailable to individuals. Creative Kit only opens Snapchat with prefilled content (user taps send) — not automation. developers.snap.com was blocked; endpoint names beyond OAuth are from search snippets and should be checked in the docs.

**Alternative:** Manual posting in the app, or Creative Kit share-to-Snapchat; official Public Profile API if Snap allowlists your app.

## TikTok
_Route: `scheduler_or_automation_tool`_ · Docs: https://developers.tiktok.com/doc/content-posting-api-get-started

**Human does**
1. 1. Fastest public posting: connect TikTok in an audited scheduler (Buffer, Later, Metricool, Publer or Hootsuite): Channels → Add TikTok → log in and approve. Prefer a TikTok Business or Creator account. Give the agent the tool's API key if it has one (e.g. Buffer/Publer API), otherwise the agent prepares assets and captions.
2. 2. Official route: go to https://developers.tiktok.com, log in, create a developer account (individual or organization).
3. 3. Manage apps → 'Connect an app': name, icon (1024px), category, description, Terms of Service URL, Privacy Policy URL, platform 'Web' with website URL.
4. 4. Add products: 'Login Kit' (redirect URI, HTTPS) and 'Content Posting API'; in Content Posting enable 'Direct Post'. Request scopes user.info.basic, video.publish (and video.upload for drafts).
5. 5. If using PULL_FROM_URL uploads: Manage URL properties → verify your domain or URL prefix (DNS TXT or file).
6. 6. Sandbox: add your TikTok account as a target user to test before review.
7. 7. Submit the app for review with a demo video of the full flow (login → compose UI showing creator nickname, privacy options, interaction toggles, commercial-content disclosure → post).
8. 8. While unaudited set your TikTok account to Private (posts will be SELF_ONLY). Then submit the Content Posting audit (form with expected usage) to unlock public posts; allow 2–6 weeks.

**Hand over to the agent (store as secrets):** `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`, `TIKTOK_REFRESH_TOKEN (365 days)`, `or BUFFER/PUBLER API key for the scheduler route`

**Agent does**
- 1. Authorize: https://www.tiktok.com/v2/auth/authorize/?client_key=...&response_type=code&scope=user.info.basic,video.publish,video.upload&redirect_uri=...&state=...&code_challenge=... (PKCE for desktop/mobile).
- 2. Token: POST https://open.tiktokapis.com/v2/oauth/token/ (client_key, client_secret, code, grant_type=authorization_code, redirect_uri) → access (24h), refresh (365d), open_id.
- 3. Before each post: POST /v2/post/publish/creator_info/query/ → privacy_level_options, max_video_post_duration_sec, comment/duet/stitch disabled flags.
- 4. Direct Post video: POST /v2/post/publish/video/init/ {post_info:{title, privacy_level (from options; SELF_ONLY while unaudited), disable_comment, disable_duet, disable_stitch, brand_content_toggle, brand_organic_toggle}, source_info:{source:'FILE_UPLOAD', video_size, chunk_size, total_chunk_count} or {source:'PULL_FROM_URL', video_url}} → publish_id, upload_url.
- 5. FILE_UPLOAD: PUT chunks to upload_url with Content-Range headers.
- 6. Poll POST /v2/post/publish/status/fetch/ {publish_id} until PUBLISH_COMPLETE (or SEND_TO_USER_INBOX for drafts).
- 7. Photos: POST /v2/post/publish/content/init/ with media_type PHOTO, photo_images URLs (verified domain), post_mode DIRECT_POST or MEDIA_UPLOAD.
- 8. Drafts (video.upload): POST /v2/post/publish/inbox/video/init/ — user finishes in the TikTok app.
- 9. Refresh daily: POST /v2/oauth/token/ grant_type=refresh_token. Hold posts locally until due; stay under ~15 direct posts/day.

**Test:** POST https://open.tiktokapis.com/v2/post/publish/creator_info/query/ with bearer token → returns creator_nickname and privacy_level_options (no upload).

**Notes:** Unaudited = private-only posts and 5 users/24h; account must be private when posting. TikTok's UX guidelines require showing creator info, privacy picker with no default, and disclosure toggles — needed for audit. Some schedulers (Buffer) push to the TikTok app as notification for certain post types. developers.tiktok.com blocked here; facts from search snippets of official pages.

**Alternative:** Official Content Posting API (steps 2–8) once the audit passes; before that, drafts via video.upload (user taps Post in app).

## Vimeo
_Route: `official_api_own_account`_ · Docs: https://developer.vimeo.com/api/upload/videos

**Human does**
1. Log in to vimeo.com with the account that should own the videos (a paid plan avoids the upload-access review and gives higher rate/storage limits).
2. Go to https://developer.vimeo.com/apps → 'Create an app'. Name + description; answer 'No' to 'Will people besides you be able to access your app?' (single-user app). Accept the terms → Create App.
3. Free plan only: on the app page, Permissions section → Upload Access → 'Request Additional Access', answer the questions, submit. Wait for approval email (up to 5 business days). Paid plans skip this.
4. On the app page → 'Authentication' tab → 'Generate an access token' → choose 'Authenticated (you)', tick scopes: Public, Private, Edit, Upload (add Delete/Video Files only if needed) → Generate. Copy the token immediately (shown once).
5. Hand the token to the agent. Revoke/regenerate on the same page if it leaks.

**Hand over to the agent (store as secrets):** `VIMEO_ACCESS_TOKEN`

**Agent does**
- Auth header on every call: Authorization: bearer $VIMEO_ACCESS_TOKEN; Accept: application/vnd.vimeo.*+json;version=3.4; Content-Type: application/json.
- GET https://api.vimeo.com/me?fields=uri,name,upload_quota — confirm account and remaining quota.
- Public file URL: POST https://api.vimeo.com/me/videos {"upload":{"approach":"pull","link":"https://.../video.mp4"},"name":"Title","description":"...","privacy":{"view":"anybody"}} → Vimeo fetches the file.
- Local file (resumable): POST https://api.vimeo.com/me/videos {"upload":{"approach":"tus","size":<bytes>},"name":...} → take upload.upload_link; then PATCH upload_link with headers Tus-Resumable: 1.0.0, Upload-Offset: <offset>, Content-Type: application/offset+octet-stream and the bytes (chunked); HEAD upload_link to check Upload-Offset and resume.
- Poll GET https://api.vimeo.com/videos/{id}?fields=upload.status,transcode.status until upload complete and transcode complete.
- Optional: thumbnail POST /videos/{id}/pictures, captions POST /videos/{id}/texttracks, add to showcase PUT /albums/{album_id}/videos/{id}.
- 'Scheduling': upload with privacy.view=nobody, then at the target time PATCH /videos/{id} {"privacy":{"view":"anybody"}}.
- Respect x-ratelimit-remaining; back off on 429.

**Test:** GET https://api.vimeo.com/me?fields=name,uri,upload_quota with the bearer token — expect your account name and quota (read-only).

**Notes:** Without upload access approval, POST /me/videos returns a permission error on free plans. Tokens generated on the app page do not expire unless revoked. Upload counts against plan storage/weekly quota. 'pull' needs a directly downloadable URL (no HTML landing pages).

**Alternative:** Zapier 'Vimeo → Upload Video' action (no developer app needed), or manual upload in the Vimeo web app.

## YouTube
_Route: `official_api_own_account`_ · Docs: https://developers.google.com/youtube/v3/docs/videos/insert

**Human does**
1. Sign in at https://console.cloud.google.com with the Google account that owns the channel/blog/business (or any account; you'll authorize with the owner account later). Top bar project picker → New project → name it (e.g. 'my-posting-agent') → Create, then select it.
2. Left menu → APIs & Services → Library → search 'YouTube Data API v3' → Enable.
3. Left menu → APIs & Services → OAuth consent screen (now called 'Google Auth Platform') → Get started. App name, user support email → Audience: External → contact email → agree → Create.
4. Google Auth Platform → Data access → Add or remove scopes → add https://www.googleapis.com/auth/youtube.upload (and optionally https://www.googleapis.com/auth/youtube.readonly for the test call) → Update → Save.
5. Google Auth Platform → Audience → Test users → + Add users → add the Google account that will sign in → Save. (Leave publishing status 'Testing' for now.)
6. Google Auth Platform → Clients → + Create client → Application type 'Desktop app' (simplest; the agent uses a loopback redirect) or 'Web application' with the redirect URI the agent gives you → Create → Download JSON (contains client_id and client_secret).
7. Give the agent the client JSON (or the client ID + secret).
8. When the agent sends the Google sign-in link, sign in with the account that owns the channel; if it's a Brand Account channel, pick that channel in the account chooser. Click past 'Google hasn't verified this app' (Advanced → Go to <app>) and allow 'Manage your YouTube videos'.
9. To make uploads public/scheduled-public from the API: request the YouTube API Services audit — fill in the 'YouTube API Services - Audit and Quota Extension Form' (linked from developers.google.com/youtube/v3/guides/quota_and_compliance_audits). You'll need a privacy policy URL, a description/screencast of the tool and to agree to the YouTube API ToS. Expect weeks.
10. To stop the weekly re-login: Google Auth Platform → Audience → Publish app (In production). For a personal single-user tool you can stay unverified (users see a warning; the 100-user cap applies), or submit for verification (Branding: homepage, privacy policy, domain verification in Search Console; justification + demo video for the sensitive scope).

**Hand over to the agent (store as secrets):** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN (agent obtains at first sign-in; store securely)`, `YOUTUBE_CHANNEL_ID (optional, for checks)`

**Agent does**
- Start OAuth: https://accounts.google.com/o/oauth2/v2/auth?client_id=…&redirect_uri=http://127.0.0.1:<port>&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload%20https://www.googleapis.com/auth/youtube.readonly&access_type=offline&prompt=consent&code_challenge=…(PKCE S256).
- POST https://oauth2.googleapis.com/token (grant_type=authorization_code) → store refresh_token; access tokens last ~1h; refresh with grant_type=refresh_token before each job.
- Upload: POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status with JSON {snippet:{title,description,tags,categoryId}, status:{privacyStatus:'private', publishAt:'<RFC3339 UTC>' (optional), selfDeclaredMadeForKids:false, containsSyntheticMedia:<bool>}} → PUT the bytes to the returned Location URL (chunked, resume on 5xx).
- Shorts: just upload a vertical/square video ≤3 min; adding #Shorts to title/description is optional.
- Optional: thumbnails.set (custom thumbnails need a verified channel), playlistItems.insert.
- Scheduling: set status.publishAt with privacyStatus=private (only works once audit lifts the private lock; before that video stays private regardless). Or let the agent's own scheduler run the upload at the due time.
- Respect quota: 100 uploads/day bucket; other calls from the 10,000-unit pool. Handle 403 quotaExceeded / uploadLimitExceeded (channel-level daily limits also exist).

**Test:** GET https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true (needs youtube.readonly) → expect your channel title; then upload a 5-second clip with privacyStatus=private → expect a video id visible in YouTube Studio.

**Notes:** Unaudited projects (created after 28 Jul 2020): every API upload is locked private. Testing-mode refresh tokens die 7 days after consent — re-run sign-in weekly or publish the app. No Community posts via API. Old tutorials quoting 1,600 units/upload are outdated (changed Dec 2025, separate bucket since Jun 2026). Video length >15 min requires a phone-verified channel.

**Alternative:** Until the audit passes, connect the channel to an audited scheduler (Buffer, Later, Publer, Metricool, Hootsuite) and have the agent use that tool's API (e.g. Buffer/Publer API) or upload via YouTube Studio's own scheduler. Or upload private via API and flip to public/scheduled manually in Studio.

## PeerTube
_Route: `official_api_own_account`_ · Docs: https://docs.joinpeertube.org/api-rest-reference.html

**Human does**
1. Have an account on a PeerTube server that allows uploads (check the server's video quota under My account -> Settings/Quota).
2. Prefer a dedicated account/channel for automation, with a unique strong password; if 2FA is on, the agent will need a fresh OTP at each password login, so either disable 2FA for this dedicated account or be ready to provide codes.
3. Note the server URL and the channel handle to publish to (My library -> Channels).
4. Hand over the server URL, username and password as secrets.

**Hand over to the agent (store as secrets):** `PEERTUBE_INSTANCE_URL`, `PEERTUBE_USERNAME`, `PEERTUBE_PASSWORD`

**Agent does**
- GET /api/v1/oauth-clients/local -> {client_id, client_secret}.
- POST /api/v1/users/token (application/x-www-form-urlencoded) {client_id, client_secret, grant_type:'password', username, password} -> access_token (1 day), refresh_token (2 weeks). Add header x-peertube-otp if 2FA.
- GET /api/v1/users/me -> videoChannels[].id (pick channelId).
- Upload: POST /api/v1/videos/upload-resumable with headers X-Upload-Content-Length, X-Upload-Content-Type and JSON {name, channelId, filename, privacy (1 public, 2 unlisted, 3 private, 4 internal), description?, tags?, category?, language?} -> 201 Location ...?upload_id=...
- PUT that Location with Content-Range: bytes start-end/total chunks (>= server minChunkSize) -> 308 until last chunk, final 200 returns {video:{id, uuid, shortUUID}}.
- Small files may use POST /api/v1/videos/upload (single multipart) instead.
- Schedule: upload with privacy=3 (private) plus scheduleUpdate:{updateAt:'<ISO>', privacy:1} -> PeerTube makes it public at that time (also settable via PUT /api/v1/videos/{id}).
- Import by URL: POST /api/v1/videos/imports {targetUrl, channelId, name, privacy}.
- Refresh: POST /api/v1/users/token {grant_type:'refresh_token', refresh_token, client_id, client_secret} before access expiry.

**Test:** GET /api/v1/users/me with Bearer token -> expect your username, channels and videoQuota.

**Notes:** Password-only API login: use a dedicated account and store the password as a secret; tokens can be revoked in My account -> Settings (token sessions). Per-server quotas and max file size apply (413 if exceeded). Transcoding happens after upload; the video may not be playable immediately.

**Alternative:** n8n HTTP Request nodes with the same calls; or upload manually in the web UI with 'Schedule publication' under privacy.

## Pinterest
_Route: `official_api_own_account`_ · Docs: https://developers.pinterest.com/docs/api/v5/pins-create/

**Human does**
1. 1. Convert to (or create) a free Pinterest business account: Settings → Account management → Convert to business.
2. 2. Go to https://developers.pinterest.com/apps/ → 'Connect app' (app request): fill app name, description, website URL, privacy policy URL, use case ('publish my own Pins'), and submit. Wait for approval email (gives Trial access).
3. 3. In the app's settings add Redirect URI from the agent (e.g. https://localhost/callback) and copy App ID and App secret key.
4. 4. Have the agent run the OAuth flow; screen-record it plus a Pin creation (Trial Pins are sandbox).
5. 5. In the app page click 'Upgrade' / request Standard access, upload the recording and describe usage. Wait for approval.
6. 6. Approve the OAuth consent screen when the agent sends the link (again after Standard approval if needed).

**Hand over to the agent (store as secrets):** `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`, `PINTEREST_REDIRECT_URI`, `PINTEREST_REFRESH_TOKEN`

**Agent does**
- 1. Authorize: https://www.pinterest.com/oauth/?client_id=...&redirect_uri=...&response_type=code&scope=boards:read,pins:read,pins:write,user_accounts:read&state=... (add boards:write to create boards).
- 2. Token: POST https://api.pinterest.com/v5/oauth/token (Basic auth app_id:secret; grant_type=authorization_code, code, redirect_uri) → access (30 d) + refresh (365 d).
- 3. GET /v5/boards to pick board_id (and board_section_id).
- 4. Image Pin: POST /v5/pins {board_id, title, description, link, alt_text, media_source:{source_type:'image_url', url} or 'image_base64'}.
- 5. Video Pin: POST /v5/media {media_type:'video'} → upload to returned upload_url with upload_parameters → poll GET /v5/media/{media_id} until succeeded → POST /v5/pins with media_source {source_type:'video_id', media_id, cover_image_url}.
- 6. Refresh before 30 days: POST /v5/oauth/token grant_type=refresh_token; re-authorize before refresh token's 365 days.
- 7. Hold Pins locally until due (no API scheduling); during Trial stay under 1,000 req/day.

**Test:** GET https://api.pinterest.com/v5/user_account → returns your username/account_type (no Pin created).

**Notes:** Trial Pins are sandbox-only and invisible to others; Standard approval can take weeks and community reports describe delays. Trial cap applies to the whole app. Business account required.

**Alternative:** Buffer, Later, Tailwind or Hootsuite (audited Pinterest partners) publish publicly right away; or the built-in scheduler (30 days, 10 Pins max).

## Clubhouse
_Route: `manual`_ · Docs: https://www.clubhouse.com

**Human does**
1. Open the Clubhouse app on the phone.
2. For a live session: tap Schedule/Create event, paste the event title and description the agent prepared, set date/time, add co-hosts, save, then share the event link the agent drafted on other channels.
3. At event time, start the room from the event and speak live (cannot be pre-recorded).
4. For a voice chat: open the chat, record the voice note using the agent's talking-points script, send.

**Agent does**
- Draft event title and description (short, hook first), a speaking outline/talking-points script with timings, and promo posts linking the event for other platforms.
- Keep a calendar reminder list for event start times.

**Content specs:** Live audio only, spoken in-app; event title short (keep under ~60 chars); description a few sentences; voice messages recorded in-app.

**Notes:** No official API, no third-party scheduler integrations. Audio must be recorded/spoken live by the human. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Record the talk elsewhere and publish as a podcast (see Spotify for Creators / podcast host RSS) if asynchronous distribution is the goal.

## Medium
_Route: `rss_or_import`_ · Docs: https://help.medium.com/hc/en-us/articles/213480228-API-Importing

**Human does**
1. Publish the canonical article on your own site/blog first (the agent can prepare it).
2. On Medium: profile picture > Stories > Import a story, paste the article URL, click Import.
3. Click See your story, check formatting/images, add up to 5 tags and the subtitle the agent prepared.
4. Click Publish, or Publish > Schedule for later and pick date/time, then Schedule to publish.

**Agent does**
- Prepare the article as clean HTML/Markdown on the person's own site (title, subtitle, headings, images with alt text) so Medium's importer parses it well.
- Prepare Medium-specific title (<~100 chars), subtitle, 5 tags, feature image, and a schedule time list.
- Fallback: provide copy-paste-ready text block if import produces a blank page.

**Content specs:** Title + subtitle; images uploaded inline (feature image ideally wide, ~1400px+ width); up to 5 tags; import keeps canonical link.

**Notes:** If the person already has a pre-cutoff integration token, the legacy API can still create posts (published/draft) for their own account, but it is unsupported; do not depend on it. Import tool uses a third-party parser and may fail on some pages. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Manual: paste the prepared draft into medium.com/new-story, add images, then Schedule for later.

## Naver Blog
_Route: `native_scheduler`_ · Docs: https://developers.naver.com/

**Human does**
1. Log in at blog.naver.com and click 글쓰기 (Write) to open SmartEditor ONE.
2. Paste the title and body the agent prepared; upload images in order and add the captions.
3. Click 발행 (Publish), choose category, add tags (agent list), set 공개 설정 (visibility).
4. Set 발행 시간 to 예약 (scheduled), pick date/time, and confirm.

**Agent does**
- Write the post in Korean (or target language): title, body sections, image captions, up to ~30 tags, category suggestion.
- Resize images (e.g. 966px or wider, JPG/PNG) and name them in insertion order.
- Produce a posting calendar with publish times.

**Content specs:** Title + rich body (SmartEditor ONE blocks); images JPG/PNG/GIF; video uploads supported; tags (keep ~10-30); one category per post.

**Notes:** No sanctioned programmatic posting. Unofficial auto-posting extensions/bots exist ('OPO' etc.); Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Manual immediate publish in the Naver Blog mobile app.

## Patreon
_Route: `native_scheduler`_ · Docs: https://docs.patreon.com/

**Human does**
1. Click Create > Post, add the title (required) and paste the body the agent prepared.
2. Attach media files the agent exported; set audience/tier access as listed.
3. Open the publish settings, toggle Set publish date, choose date/time, and click Schedule.
4. (Audio creators) one time: Settings > Podcast and audio > + New podcast > Sync with another platform, paste host RSS feed, choose publish vs draft.

**Agent does**
- Prepare title, body, tier visibility plan, teaser text for public preview, and media files.
- For podcasters: confirm the host RSS URL and that episodes flow (audio-only).
- Keep a schedule list mapping posts to dates.

**Content specs:** Title required; text, images, video, audio, polls, links; audio sync from RSS (audio only); tier-gated or public visibility.

**Notes:** The RSS sync is the only official hands-off route and covers audio episodes only. Patreon API cannot create posts. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Manual immediate publish from the Patreon mobile app.

## Lemon8
_Route: `manual`_ · Docs: https://www.lemon8-app.com

**Human does**
1. Transfer the prepared images/video and caption to the phone.
2. Open Lemon8, tap +, select media in the agent's order, choose a cover.
3. Paste the title and caption; add the hashtags and topic.
4. Post now (no scheduling).

**Agent does**
- Prepare 3:4 vertical images (e.g. 1080x1440) with a text-overlay cover, short video if needed.
- Write a catchy title, a list-style caption, 5-10 hashtags.
- Keep a daily reminder list for posting times.

**Content specs:** Vertical 3:4 photos recommended (1080x1440); carousels; short video; title + caption + hashtags. Exact limits unverified.

**Notes:** No public API or scheduler integrations. Verify the current photo/video count limit in-app (dataset's '<=3' is unconfirmed). Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Repurpose: post to TikTok via its official API, then reuse in Lemon8 via the in-app TikTok connection where offered.

## Xiaohongshu (RedNote)
_Route: `native_scheduler`_ · Docs: https://open.xiaohongshu.com/

**Human does**
1. Log in at https://creator.xiaohongshu.com/ (scan QR with the app).
2. Click 发布笔记, choose 图文 or 视频, upload the prepared files in order.
3. Paste the title (<=20 chars) and body; add topics/hashtags.
4. Choose 定时发布, set date/time, and publish.

**Agent does**
- Prepare images 3:4 (1080x1440) or 1:1, video vertical 9:16, cover image with text overlay.
- Write title within 20 characters, body within ~1000 characters, 3-10 # topics in Chinese.
- Provide a posting calendar.

**Content specs:** Image notes up to 18 images (3:4 recommended); video notes; title <=20 chars; body <=1000 chars (verify in-app).

**Notes:** Personal accounts have no sanctioned API. Many 'xhs publisher' skills/bots drive the creator site via browser automation; Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Post manually from the Xiaohongshu mobile app.

## Messenger
_Route: `manual`_ · Docs: https://developers.facebook.com/docs/messenger-platform/send-messages

**Human does**
1. Messenger is not a posting surface: post content to your Facebook Page instead (see Facebook Pages setup).
2. Optional, to auto-reply to people who message your Page: developers.facebook.com → Create app → use case 'Engage with customers on Messenger from Meta' → add your Page under Messenger API settings → Generate Page token; add permissions pages_messaging, pages_manage_metadata.
3. Set a webhook callback URL + verify token (agent provides) and subscribe the Page to 'messages' field.

**Hand over to the agent (store as secrets):** `META_APP_ID`, `META_APP_SECRET`, `FB_PAGE_ID`, `FB_PAGE_TOKEN`, `MESSENGER_WEBHOOK_VERIFY_TOKEN`

**Agent does**
- Receive webhook 'messages' events; reply within 24h: POST https://graph.facebook.com/v{ver}/{page-id}/messages with {recipient:{id:PSID}, messaging_type:'RESPONSE', message:{text|attachment}}.
- Do not attempt unsolicited broadcasts (recurring notifications/message tags deprecated; Marketing Messages API is paid and requires opt-in).

**Test:** Message your Page from your personal account, then POST /{page-id}/messages replying to your PSID → expect message_id.

**Notes:** No way to publish posts/broadcasts via Messenger for free. Outside 24h window sends fail (error 10/100).

**Alternative:** Facebook Pages API for content; Meta Business Suite inbox automations for auto-replies.

## Signal
_Route: `native_scheduler`_ · Docs: https://support.signal.org/hc/articles/5365881590682-Schedule-a-Message-on-Signal-Android (signal-cli is unofficial)

**Human does**
1. Copy the prepared message (and media) to the Android phone.
2. Open the group/chat, paste the text, attach media.
3. Long-press the send button, choose the time, tap Schedule send.
4. On iOS/Desktop: send manually at the planned time.

**Agent does**
- Draft messages/announcements, compress images/videos, and prepare a send-time list.
- For Stories: prepare vertical 9:16 image or short video.

**Content specs:** Text messages; attachments (images, video, files; ~100 MB file limit); Stories vertical 9:16 (verify limits in-app).

**Notes:** Signal has no bot/broadcast API. signal-cli and similar are unofficial registrations of the person's number; Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Manual send at planned times on any device.

## Gab
_Route: `manual`_ · Docs: https://gab.com

**Human does**
1. 1. Sign in at gab.com (or the Gab iOS/Android app) with your own account.
2. 2. Let the agent prepare each post as a ready-to-paste text plus media files (saved to Files/Photos or a shared note).
3. 3. Open Gab → tap the compose button ('Post'/pencil) → paste the text → attach the images/video → Post.
4. 4. Optional iOS Shortcut: create a Shortcut 'Post to Gab' with actions: Get Clipboard → Open URLs 'https://gab.com/compose' (or Open App 'Gab'). Run it after the agent copies the text to the clipboard.

**Agent does**
- 1. Draft the post text (respect Gab's character limit; keep under ~3,000 chars to be safe — limit unverified).
- 2. Export media to the agreed shared folder and return a checklist: text, media file names, desired post time.
- 3. At the desired time, send the user a reminder with the text so they can paste and post manually.

**Test:** No API test. Human posts a test 'hello' manually and confirms it appears on their profile.

**Notes:** Gab offers no documented, sanctioned API and no mainstream scheduler supports it. RISK NOTE: Mastodon-compatible endpoints (POST /api/v1/statuses with a bearer token) and scripts that log in with a password are unofficial/undocumented; they may break or violate the ToS and can get the account restricted. Do not use them as the main route.

**Alternative:** If the user accepts the risk themselves, an unofficial Mastodon-style client may work — not recommended. Otherwise none.

## Gettr
_Route: `manual`_ · Docs: https://gettr.com

**Human does**
1. Check that gettr.com still loads and accepts posts before planning.
2. Log in, compose a post, paste the prepared text, attach media.
3. Post now.

**Agent does**
- Prepare short text (X-style), images, short video.
- Confirm platform is alive before investing effort.

**Content specs:** Short text posts (historically ~777 chars), images, video (verify in-app).

**Notes:** No API, no scheduler. Platform viability is doubtful. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Prefer platforms with official APIs for the same audience.

## Truth Social
_Route: `manual_with_native_scheduler`_ · Docs: https://www.globenewswire.com/news-release/2025/09/09/3146910/0/en/Truth-Social-Enhances-Platform.html

**Human does**
1. 1. Sign in to Truth Social (app or truthsocial.com).
2. 2. Optional: subscribe to the Patriot Package (Truth+) to unlock 'Schedule Truths'.
3. 3. For each agent-prepared post: tap compose ('Truth') → paste text → attach media → (with Patriot Package) choose the schedule option and pick date/time → Post/Schedule.
4. 4. Without the subscription: post manually when the agent reminds you.

**Agent does**
- 1. Draft post text (500-char limit typical of Mastodon-based Truth Social — verify in app) and media.
- 2. Provide a batch list with times; send reminders if the user has no scheduling feature.

**Test:** No API test; human schedules/posts one test Truth and confirms.

**Notes:** RISK NOTE: Truth Social is Mastodon-based and unofficial tools (e.g. 'truthbrush' and Mastodon-style token scripts) can post, but they are unsanctioned, may violate the ToS and can get the account locked. Do not use as the main route.

**Alternative:** None sanctioned. Unofficial Mastodon-style client = risk only.

## Substack
_Route: `native_scheduler`_ · Docs: https://support.substack.com/hc/en-us/articles/360037870412-How-do-I-schedule-a-post-for-a-future-date

**Human does**
1. Open Dashboard > New post, paste the prepared title, subtitle and body (or import via Settings > Import/Export > Import posts with your blog/RSS URL).
2. Insert images, set the email/social preview, choose audience (everyone/paid).
3. Click Continue > Schedule, choose date/time, confirm.
4. For Notes: write the Note, click the calendar icon, pick a time.

**Agent does**
- Draft post: title, subtitle, body in Markdown/HTML, images with alt text, social preview text and image.
- Draft a batch of Notes with planned times.
- Keep posts under email-clipping size (Gmail clips ~102 KB HTML).

**Content specs:** Title + subtitle; rich text, images, embeds, audio/video posts; social preview image ~1200x630 (recommended); keep emails concise.

**Notes:** Import is mainly for back catalogs (one-off), not continuous sync. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Buffer's Substack Notes integration for Notes (verify it is official-partner based).

## BeReal
_Route: `manual`_ · Docs: https://bereal.com

**Human does**
1. Respond to the daily notification (or post late, labeled as late).
2. Take the dual-camera photo in-app.
3. Add the caption the agent drafted; post.

**Agent does**
- Draft a short caption idea list; nothing else can be pre-prepared since photos must be captured live in-app.

**Content specs:** Dual-camera photo captured in-app; short caption; late posts labeled.

**Notes:** By design no uploads, no API, no scheduling. Any automation violates the product premise. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** None.

## Spotify for Creators
_Route: `native_scheduler`_ · Docs: https://support.spotify.com/us/creators/article/publishing-audio-episodes/

**Human does**
1. Log in to creators.spotify.com > New episode.
2. Upload the prepared audio/video file, paste title and description, add cover art.
3. Set Publish date to Schedule and choose date/time; publish.
4. Alternative: host elsewhere and submit the host RSS once; future episodes flow automatically.

**Agent does**
- Export MP3/WAV (audio) or MP4/MOV (video, one video + one audio track, <=12h).
- Write episode title, description with timestamps/links, season/episode numbers.
- Prepare cover art (square, 3000x3000 recommended).

**Content specs:** Audio: MP3, WAV, MP4, MOV; Video: MOV, MPG, MP4; single video+audio track; max 12h; no file-size limit.

**Notes:** If the person's host offers its own official API (e.g. some hosts do), the agent could upload there and Spotify picks it up via RSS/Distribution API. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Podcast host with Spotify video integration (e.g. Libsyn) + RSS.

## Behance
_Route: `manual`_ · Docs: https://www.behance.net/dev

**Human does**
1. Click Share your work > Upload; add images/videos in the order the agent listed.
2. Add the prepared text blocks between media; set cover image and crop.
3. Enter title, tags (up to 10), tools used, creative field; set visibility.
4. Publish, or (Behance Pro) set a schedule date in project settings and confirm.

**Agent does**
- Export images at 1400px wide (or 3200px for HiDPI), JPG/PNG/GIF, under per-file limits; MP4 for video.
- Prepare cover 808x632, title, project description, tags, tools, and credits.

**Content specs:** Project images ~1400px width (up to 3200px), cover 808x632, up to 10 tags; video embeds/uploads (verify current file-size limits).

**Notes:** Adobe tool integrations (e.g. publishing from some Adobe apps) may exist; not verified. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Behance Pro scheduler route if subscribed (native_scheduler).

## Quora
_Route: `manual`_ · Docs: https://help.quora.com/hc/en-us/articles/360000470706-Platform-Policies

**Human does**
1. Find the question (or your Space) the agent selected.
2. Click Answer (or Create post in Space), paste the prepared answer.
3. Insert images and links; add credentials; Post.

**Agent does**
- Pick relevant questions, write answers in the person's voice with sources, images optional.
- Keep answers human-reviewed; Quora restricts spam/repetitive content.

**Content specs:** Rich-text answers/posts with images and links; no hard short limit in practice.

**Notes:** No scheduling, no API. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Spaces posts as the person's own channel; still manual.

## Minds
_Route: `manual_with_native_scheduler`_ · Docs: https://gitlab.com/minds

**Human does**
1. 1. Sign in at minds.com (or the Minds app).
2. 2. The agent gives you a batch of posts (text + media + planned time).
3. 3. For each: click the compose box on your newsfeed/channel → paste text → attach media → open the schedule (clock/calendar) option in the composer → pick date/time → Post/Schedule.
4. 4. Verify the scheduled posts appear in your channel's scheduled list.

**Agent does**
- 1. Produce a posting plan (CSV/note): datetime, text, media file names.
- 2. Hand it to the user; optionally remind them weekly to load the next batch into Minds' native scheduler.

**Test:** No API test. Human schedules one test post 10 minutes ahead and confirms it publishes.

**Notes:** Minds has a native scheduler, so batching manually once a week is practical. RISK NOTE: unofficial API wrappers (PyPI 'minds', minds-cli) require your password, are not sanctioned and may break or trigger account security; do not use as the main route.

**Alternative:** Unofficial Python client (password login) — risk only, not recommended.

## Likee
_Route: `manual`_ · Docs: https://likee.video

**Human does**
1. Transfer the prepared vertical video to the phone.
2. Open Likee, tap +, Upload, select the video, add music/effects if desired.
3. Paste caption and hashtags; Post.

**Agent does**
- Export 9:16 vertical MP4 (1080x1920), <=60s, with caption and 3-8 hashtags.

**Content specs:** Vertical 9:16 short video, ~60s; caption with hashtags.

**Notes:** No API or scheduler found. Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** None.

## Rumble
_Route: `native_scheduler`_ · Docs: https://rumblefaq.groovehq.com/help/how-to-use-rumble-s-live-stream-api

**Human does**
1. Go to rumble.com/upload, select the prepared video file.
2. Paste title, description, tags; upload thumbnail; pick category.
3. Under Visibility, choose Scheduled and set the date/time.
4. Accept the terms/licensing option and submit.

**Agent does**
- Export MP4 (H.264 + AAC 48 kHz), 16:9, plus thumbnail 1280x720.
- Write title, description, tags, and .srt captions.

**Content specs:** MP4 H.264/AAC recommended; reported max file 6-15 GB and ~8h (unverified); subtitles vtt/sbv/srt/stl/sub.

**Notes:** Unofficial/reverse-engineered posting libraries, browser-automation bots and session-cookie tools exist; using them risks account restriction or ban and breaks without notice. Not a supported route.

**Alternative:** Rumble Studio for scheduled livestreams.

## Triller
_Route: `manual`_ · Docs: https://en.wikipedia.org/wiki/Triller_(app)

**Human does**
1. Do not post; drop Triller from the plan unless it visibly returns.

**Agent does**
- Nothing; redirect effort to other short-video platforms.

**Content specs:** N/A

**Notes:** Platform effectively dead.

**Alternative:** Use TikTok/YouTube Shorts/Instagram Reels official APIs instead.

