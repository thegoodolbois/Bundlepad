# Setting up each platform: what the human does, what the agent does

Covers every platform (71) and every posting hub (0). Pairs with [AGENT-GUIDE.md](AGENT-GUIDE.md). Machine-readable version: [data/setup.json](data/setup.json).

**How to use this**

1. Pick the route for each platform (AGENT-GUIDE §2). A hub (Buffer, Postiz…) is often the fastest start.
2. Give the human the **Human does** steps. These need their login, money or approval.
3. Collect the **Hand over to the agent** items and store them as secrets.
4. Do the **Agent does** steps, then run the **Test**.

**General rules**

- The human creates every account, key and token themselves. The agent never asks for a main password, except where a platform only offers password login (PeerTube, Lemmy): use a dedicated account there.
- Console menus get renamed. If a step doesn't match the screen, check the platform's docs link.

## Contents

**Hubs:** 

**Platforms with a posting API:** [DeviantArt](#deviantart), [SoundCloud](#soundcloud), [Hive](#hive), [Blogger](#blogger), [Tumblr](#tumblr), [WordPress (.com and self-hosted)](#wordpress-com-and-self-hosted), [Ghost](#ghost), [Discord](#discord), [Reddit](#reddit), [Lemmy](#lemmy), [Binance Square](#binance-square), [Farcaster](#farcaster), [Lens](#lens), [Nostr](#nostr), [Dribbble](#dribbble), [Imgur](#imgur), [Nextdoor](#nextdoor), [Google Business Profile](#google-business-profile), [KakaoTalk](#kakaotalk), [LINE](#line), [Messenger](#messenger), [Telegram](#telegram), [Viber](#viber), [WhatsApp](#whatsapp), [WeChat](#wechat), [Bluesky](#bluesky), [Gab](#gab), [Mastodon / Fediverse](#mastodon--fediverse), [Threads](#threads), [Weibo](#weibo), [X (Twitter)](#x-twitter), [Flickr](#flickr), [Pixelfed](#pixelfed), [Apple Podcasts](#apple-podcasts), [LinkedIn](#linkedin), [Facebook Pages](#facebook-pages), [Instagram](#instagram), [MeWe](#mewe), [Minds](#minds), [OK.ru](#okru), [VK](#vk), [Bilibili](#bilibili), [Dailymotion](#dailymotion), [Douyin](#douyin), [Kuaishou / Kwai](#kuaishou--kwai), [Odysee](#odysee), [Snapchat](#snapchat), [TikTok](#tiktok), [Vimeo](#vimeo), [YouTube](#youtube), [PeerTube](#peertube), [Pinterest](#pinterest)

**No posting API (prepared content + manual or native scheduling):** [Clubhouse](#clubhouse), [Medium](#medium), [Naver Blog](#naver-blog), [Patreon](#patreon), [Lemon8](#lemon8), [Xiaohongshu (RedNote)](#xiaohongshu-rednote), [Kick](#kick), [Twitch](#twitch), [Signal](#signal), [Gettr](#gettr), [Truth Social](#truth-social), [Substack](#substack), [BeReal](#bereal), [Spotify for Creators](#spotify-for-creators), [Behance](#behance), [Quora](#quora), [Likee](#likee), [Rumble](#rumble), [Triller](#triller)

## DeviantArt
_Route: `official_api_own_account`_ · Docs: https://www.deviantart.com/developers/

**Human does**
1. deviantart.com/developers → Register your application (redirect URI from the agent).

**Hand over to the agent (store as secrets):** `DA_CLIENT_ID`, `DA_CLIENT_SECRET`, `refresh token`

**Agent does**
- OAuth with scopes stash publish.
- POST /stash/submit, then POST /stash/publish (fill in the required maturity and AI-generated fields).

**Test:** GET /user/whoami; expect your username.

## SoundCloud
_Route: `official_api_own_account`_ · Docs: https://developers.soundcloud.com/docs/api

**Human does**
1. Have SoundCloud Artist Pro. Register an app at soundcloud.com/you/apps (self-serve for Artist Pro).

**Hand over to the agent (store as secrets):** `SOUNDCLOUD_CLIENT_ID`, `SOUNDCLOUD_CLIENT_SECRET`, `refresh token`

**Agent does**
- OAuth 2.1 with PKCE.
- POST /tracks (multipart: track[asset_data], track[title]).

**Test:** GET /me; expect your profile.

**Notes:** Refresh tokens are single-use; always save the new one.

## Hive
_Route: `manual`_ · Docs: https://developers.hive.io/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Blogger
_Route: `official_api_own_account`_ · Docs: https://developers.google.com/blogger/docs/3.0/reference/posts/publish

**Human does**
1. Go to console.cloud.google.com, sign in, and create a project.
2. Enable 'Blogger API v3'.
3. APIs & Services → OAuth consent screen: choose External, fill in the app name, support email and developer email. Add yourself under Test users.
4. APIs & Services → Credentials → Create credentials → OAuth client ID. Type: Web application (redirect URI from the agent) or Desktop app.
5. Download the client ID and client secret.
6. Approve the 'Manage your Blogger account' prompt when signing in.

**Hand over to the agent (store as secrets):** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `refresh token`, `BLOG_ID (in the Blogger dashboard URL)`

**Agent does**
- OAuth with scope https://www.googleapis.com/auth/blogger.
- posts.insert with isDraft=true, then posts.publish with publishDate to schedule.

**Test:** posts.insert a draft; expect a post ID.

**Notes:** The same Google project and sign-in can also cover YouTube and Business Profile: request all the scopes at once.

## Tumblr
_Route: `official_api_own_account`_ · Docs: https://www.tumblr.com/docs/en/api/v2

**Human does**
1. tumblr.com/oauth/apps → Register application (callback URL from the agent).

**Hand over to the agent (store as secrets):** `TUMBLR_CLIENT_ID`, `TUMBLR_CLIENT_SECRET`, `refresh token`

**Agent does**
- OAuth 2 with scopes basic write offline_access.
- POST /v2/blog/{blog}/posts (NPF). Schedule with state=queue and publish_on.

**Test:** GET /v2/user/info; expect your blogs.

## WordPress (.com and self-hosted)
_Route: `official_api_own_account`_ · Docs: https://developer.wordpress.com/docs/api/

**Human does**
1. WP admin → Users → Profile → Application Passwords → add a name → copy the password (needs HTTPS).

**Hand over to the agent (store as secrets):** `SITE_URL`, `WP_USERNAME`, `WP_APP_PASSWORD`

**Agent does**
- Basic auth to /wp-json/wp/v2/media (upload) and /wp-json/wp/v2/posts {title, content, status}. Schedule with status=future and date.

**Test:** GET /wp-json/wp/v2/users/me; expect your user.

**Notes:** WordPress.com instead: register an app at developer.wordpress.com/apps and use OAuth.

## Ghost
_Route: `official_api_own_account`_ · Docs: https://docs.ghost.org/admin-api

**Human does**
1. Ghost admin → Settings → Integrations → Add custom integration → copy the Admin API key and API URL (Ghost(Pro) needs a plan above Starter).

**Hand over to the agent (store as secrets):** `GHOST_API_URL`, `GHOST_ADMIN_API_KEY`

**Agent does**
- Sign a 5-minute HS256 JWT from the key (id:secret), then POST /ghost/api/admin/posts/ (status=scheduled + published_at to schedule).

**Test:** GET /ghost/api/admin/site/; expect the site info.

## Discord
_Route: `official_api_own_account`_ · Docs: https://docs.discord.com/developers/resources/webhook

**Human does**
1. In your server: Channel → Edit channel → Integrations → Webhooks → New webhook → Copy webhook URL (you need Manage Webhooks).

**Hand over to the agent (store as secrets):** `DISCORD_WEBHOOK_URL`

**Agent does**
- POST the webhook URL with JSON {content, username, embeds} (append ?wait=true to get the message back). Files go as multipart.

**Test:** POST {content:'test'}; expect 200/204.

**Notes:** Treat the webhook URL as a password.

## Reddit
_Route: `official_api_own_account`_ · Docs: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki

**Human does**
1. Read Reddit's Responsible Builder Policy. API access now needs approval: file a request through Reddit's developer support/help center describing the bot.
2. Once approved: reddit.com/prefs/apps → create app, type 'script' (just your account) or 'web app'.
3. Prefer a dedicated account that follows each subreddit's rules.

**Hand over to the agent (store as secrets):** `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `refresh token (or script-app credentials)`

**Agent does**
- OAuth with scopes identity submit, duration=permanent.
- POST /api/submit (kind=self or link, sr=subreddit).
- Set a descriptive User-Agent; respect 100 queries/min.

**Test:** GET /api/v1/me; expect your username.

**Notes:** Ayrshare or n8n can post for you if you'd rather not register.

## Lemmy
_Route: `official_api_own_account`_ · Docs: https://join-lemmy.org/api/main

**Human does**
1. Create an account on a Lemmy server (a dedicated one is better).

**Hand over to the agent (store as secrets):** `INSTANCE_URL`, `USERNAME`, `PASSWORD`

**Agent does**
- POST /api/v3/user/login → JWT, then POST /api/v3/post {name, community_id, body or url}. Images via /pictrs/image.

**Test:** GET /api/v3/site with the JWT; expect your user.

**Notes:** Default limit: 6 posts per 10 minutes.

## Binance Square
_Route: `official_api_own_account`_ · Docs: https://github.com/binance/binance-skills-hub

**Human does**
1. Binance → Square → Creator Center → create an OpenAPI key.

**Hand over to the agent (store as secrets):** `BINANCE_SQUARE_API_KEY`

**Agent does**
- POST https://www.binance.com/bapi/composite/v1/public/pgc/openApi/content/add with header X-Square-OpenAPI-Key.

**Test:** Post a short test text; expect success.

**Notes:** Limits: 100 posts/day.

## Farcaster
_Route: `official_api_own_account`_ · Docs: https://docs.neynar.com/docs/integrate-managed-signers

**Human does**
1. Have a Farcaster account. Sign up at neynar.com and copy the API key.
2. When the agent shows a signer approval link or QR, approve it in the Farcaster app.

**Hand over to the agent (store as secrets):** `NEYNAR_API_KEY`, `SIGNER_UUID`

**Agent does**
- Create a managed signer via Neynar, then show the approval URL to the human.
- POST /v2/farcaster/cast {signer_uuid, text, embeds}.

**Test:** Cast 'test'; expect a cast hash.

## Lens
_Route: `manual`_ · Docs: https://lens.xyz/docs/protocol/best-practices/transaction-lifecycle

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Nostr
_Route: `official_api_own_account`_ · Docs: https://d-central.tech/nostr-nips-reference/

**Human does**
1. Install a signer: a NIP-07 browser extension (e.g. nos2x, Alby) or a NIP-46 bunker (e.g. nsec.app, Amber). Connect it to the agent's app when asked.

**Hand over to the agent (store as secrets):** `bunker:// connection string (NIP-46)`

**Agent does**
- Connect via NIP-46 and request sign_event permission for kind 1.
- Publish signed events to several relays.

**Test:** Publish a kind-1 note; expect relays to answer OK.

**Notes:** Never ask for or store the nsec.

## Dribbble
_Route: `manual`_ · Docs: https://developer.dribbble.com/v2/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Imgur
_Route: `manual`_ · Docs: https://apidocs.imgur.com/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Nextdoor
_Route: `manual`_ · Docs: https://developer.nextdoor.com/docs/sharing-overview

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Google Business Profile
_Route: `official_api_own_account`_ · Docs: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/create

**Human does**
1. Go to console.cloud.google.com, sign in, and create a project.
2. Fill in Google's Business Profile API access request form (allowlist, about 14 days). Your verified business profile should be active (reportedly 60+ days).
3. After approval, enable the Business Profile APIs (My Business Account Management, Business Information, and the v4 API for posts).
4. APIs & Services → OAuth consent screen: choose External, fill in the app name, support email and developer email. Add yourself under Test users.
5. APIs & Services → Credentials → Create credentials → OAuth client ID. Type: Web application (redirect URI from the agent) or Desktop app.
6. Download the client ID and client secret.

**Hand over to the agent (store as secrets):** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `refresh token`, `account and location IDs`

**Agent does**
- OAuth with scope https://www.googleapis.com/auth/business.manage.
- accounts.locations.localPosts.create for updates, offers and events.

**Test:** List accounts; expect your business account.

**Notes:** Quota is 0 until Google approves the access request. Buffer, Publer or Hootsuite can post meanwhile.

## KakaoTalk
_Route: `manual`_ · Docs: https://developers.kakao.com/docs/latest/en/kakaotalk-channel/common

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## LINE
_Route: `official_api_own_account`_ · Docs: https://developers.line.biz/en/reference/messaging-api/

**Human does**
1. Create a LINE Official Account, then in LINE Developers Console create a Messaging API channel for it.
2. Messaging API tab → issue a long-lived channel access token. Pick a plan (free: 200 messages/month in Japan).

**Hand over to the agent (store as secrets):** `LINE_CHANNEL_ACCESS_TOKEN`

**Agent does**
- POST /v2/bot/message/broadcast {messages:[...]}. Media must be at an HTTPS URL.

**Test:** GET /v2/bot/info; expect the bot info.

**Notes:** LINE VOOM (feed) ended in Sept 2026; there is no API for timeline posts.

## Messenger
_Route: `manual`_ · Docs: https://developers.facebook.com/docs/messenger-platform/send-messages

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Telegram
_Route: `official_api_own_account`_ · Docs: https://core.telegram.org/bots/api

**Human does**
1. In Telegram, message @BotFather → /newbot → choose a name → copy the bot token.
2. Open your channel → Administrators → Add admin → your bot, with 'Post messages'.

**Hand over to the agent (store as secrets):** `TELEGRAM_BOT_TOKEN`, `channel username (@name) or numeric chat ID`

**Agent does**
- POST https://api.telegram.org/bot<TOKEN>/sendMessage {chat_id, text, parse_mode}. sendPhoto / sendVideo / sendMediaGroup for media.
- Schedule on the agent's side (cron); keep under ~20 messages/min.

**Test:** sendMessage 'test'; expect ok:true.

## Viber
_Route: `official_api_own_account`_ · Docs: https://developers.viber.com/docs/tools/channels-post-api/

**Human does**
1. As channel super admin (Viber 17.7+): Channel info → Developer Tools → copy the token.
2. The agent sets a webhook once (needs an HTTPS endpoint).

**Hand over to the agent (store as secrets):** `VIBER_CHANNEL_TOKEN`

**Agent does**
- POST https://chatapi.viber.com/pa/set_webhook once, then POST /pa/post with X-Viber-Auth-Token {from, type, text or media URL}.

**Test:** POST /pa/get_account_info; expect the channel info.

## WhatsApp
_Route: `manual`_ · Docs: https://developers.facebook.com/docs/whatsapp/pricing

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## WeChat
_Route: `manual`_ · Docs: https://developers.weixin.qq.com/doc/offiaccount/en/Getting_Started/Overview.html

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Bluesky
_Route: `official_api_own_account`_ · Docs: https://docs.bsky.app/docs/get-started

**Human does**
1. Bluesky → Settings → Privacy and security → App passwords → Add app password → copy it.

**Hand over to the agent (store as secrets):** `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`

**Agent does**
- POST com.atproto.server.createSession (identifier, password) → accessJwt + did.
- Images: com.atproto.repo.uploadBlob, then createRecord app.bsky.feed.post with an embed. Add facets so links are clickable.
- Reuse the session; createSession is limited to 30 per 5 min.

**Test:** createRecord a test post; expect a uri.

**Notes:** For an app other people sign into, use atproto OAuth instead of app passwords.

## Gab
_Route: `manual`_ · Docs: https://gab.com

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Mastodon / Fediverse
_Route: `official_api_own_account`_ · Docs: https://docs.joinmastodon.org/methods/statuses/

**Human does**
1. On your server: Preferences → Development → New application. Scopes write:statuses and write:media. Save, then copy 'Your access token'.
2. Pixelfed: Settings → Applications → create a personal access token.

**Hand over to the agent (store as secrets):** `INSTANCE_URL`, `ACCESS_TOKEN`

**Agent does**
- POST /api/v2/media for images or video, then POST /api/v1/statuses {status, media_ids, visibility}.
- Mastodon can schedule with scheduled_at (5+ minutes ahead).

**Test:** POST a status with visibility=direct; expect an ID.

**Notes:** Tick 'This is an automated account' in the profile if it's a bot.

## Threads
_Route: `official_api_own_account`_ · Docs: https://developers.facebook.com/docs/threads/posts

**Human does**
1. Go to developers.facebook.com, log in, and register as a developer (phone or card verification may be asked).
2. My Apps → Create app. Pick the use case that matches the platform (below). App type: Business.
3. App settings → Basic: add a privacy policy URL (any page you control) and note the App ID and App Secret.
4. Keep the app in Development mode. You (the admin) can use it on your own accounts without App Review.
5. Use case: 'Access the Threads API'. Add permissions threads_basic and threads_content_publish.
6. Use-case settings: add your Threads account as a Threads tester and accept the invite in the Threads app (Settings → Account → Website permissions).
7. Add the agent's redirect URL under the Threads settings.

**Hand over to the agent (store as secrets):** `THREADS_APP_ID`, `THREADS_APP_SECRET`, `long-lived Threads token`, `Threads user ID`

**Agent does**
- OAuth at threads.net/oauth/authorize, exchange the code, then swap for a 60-day token (th_exchange_token) and refresh it after 24h (th_refresh_token).
- POST /{user-id}/threads (media_type TEXT / IMAGE / VIDEO / CAROUSEL), then POST /{user-id}/threads_publish.
- Limit: 250 posts/day. The API has no scheduling, so the agent holds the post until it's due.

**Test:** Publish a text post; expect an ID.

**Notes:** Without review you can post to your own and testers' accounts.

## Weibo
_Route: `manual`_ · Docs: https://open.weibo.com/wiki/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## X (Twitter)
_Route: `official_api_own_account`_ · Docs: https://docs.x.com/x-api/getting-started/pricing

**Human does**
1. Go to developer.x.com (console) and sign in with the X account that will post.
2. Create a Project and an App inside it.
3. Buy prepaid API credits in the Developer Console: pay-per-use, about $0.015 per post, about $0.20 per post with a link.
4. App → User authentication settings: OAuth 2.0, type 'Web App' (or 'Native App' for no secret), permissions Read and write, callback URL from the agent, website URL.
5. Copy the OAuth 2.0 Client ID and Client Secret.
6. Profile → Settings → 'Automated' account label: turn it on if posts are fully automated.

**Hand over to the agent (store as secrets):** `X_CLIENT_ID`, `X_CLIENT_SECRET`, `refresh token`

**Agent does**
- OAuth 2.0 + PKCE with scopes tweet.read tweet.write users.read media.write offline.access.
- Media: /2/media/upload (initialize, append, finalize), then POST /2/tweets with media_ids.
- Tokens last 2h; refresh them. No API scheduling, so the agent holds the post until it's due.
- Never post identical text twice.

**Test:** POST /2/tweets with a short unique text; expect an ID (costs one post credit).

## Flickr
_Route: `official_api_own_account`_ · Docs: https://www.flickr.com/services/api/

**Human does**
1. Have Flickr Pro (needed to request an API key). flickr.com/services/apps/create → apply for a non-commercial key.

**Hand over to the agent (store as secrets):** `FLICKR_KEY`, `FLICKR_SECRET`, `OAuth 1.0a token + secret`

**Agent does**
- OAuth 1.0a with perms=write (signed requests).
- POST https://up.flickr.com/services/upload/.

**Test:** flickr.test.login; expect your username.

## Pixelfed
_Route: `manual`_ · Docs: https://docs.pixelfed.org/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Apple Podcasts
_Route: `manual`_ · Docs: https://podcasters.apple.com/support/823-podcast-requirements

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## LinkedIn
_Route: `official_api_own_account`_ · Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin

**Human does**
1. Create a LinkedIn Company Page (required to own an app, any page works), then go to linkedin.com/developers → Create app and link that page.
2. Products: add 'Sign In with LinkedIn using OpenID Connect' and 'Share on LinkedIn' (both self-serve).
3. Auth tab: add the agent's redirect URL; copy the Client ID and Client Secret.

**Hand over to the agent (store as secrets):** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `access token (60 days)`

**Agent does**
- OAuth with scopes openid profile w_member_social.
- Get the person URN from /v2/userinfo.
- POST /rest/posts (LinkedIn-Version header). Images and videos via the Images/Videos APIs.
- Remind the user to sign in again every 60 days (no refresh for self-serve apps).

**Test:** Create a text post; expect a 201 with the post URN.

**Notes:** Posting as a company page needs the Community Management API, which requires an application from a registered business.

## Facebook Pages
_Route: `official_api_own_account`_ · Docs: https://developers.facebook.com/docs/pages-api/posts

**Human does**
1. Have a Facebook Page you admin.
2. Go to developers.facebook.com, log in, and register as a developer (phone or card verification may be asked).
3. My Apps → Create app. Pick the use case that matches the platform (below). App type: Business.
4. App settings → Basic: add a privacy policy URL (any page you control) and note the App ID and App Secret.
5. Keep the app in Development mode. You (the admin) can use it on your own accounts without App Review.
6. Use case: 'Manage everything on your Page'. Add permissions pages_manage_posts, pages_read_engagement and pages_show_list.
7. Use the Graph API Explorer (or the agent's login link): select your app, get a User token with those permissions, then choose your Page to get a Page token.

**Hand over to the agent (store as secrets):** `META_APP_ID`, `META_APP_SECRET`, `PAGE_ID`, `Page access token`

**Agent does**
- Exchange the user token for a long-lived one, then fetch /me/accounts. A Page token from a long-lived user token doesn't expire.
- POST /{page-id}/feed (message, link). For photos POST /{page-id}/photos; for video POST /{page-id}/videos.
- Schedule with published=false and scheduled_publish_time (10 min to 30 days ahead).

**Test:** Create an unpublished scheduled post 1 hour ahead, then delete it.

## Instagram
_Route: `official_api_own_account`_ · Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing

**Human does**
1. Switch your Instagram account to Professional (Business or Creator): Instagram → Settings → Account type and tools.
2. Go to developers.facebook.com, log in, and register as a developer (phone or card verification may be asked).
3. My Apps → Create app. Pick the use case that matches the platform (below). App type: Business.
4. App settings → Basic: add a privacy policy URL (any page you control) and note the App ID and App Secret.
5. Keep the app in Development mode. You (the admin) can use it on your own accounts without App Review.
6. Use case: 'Manage messaging & content on Instagram' (Instagram API with Instagram Login).
7. Under Instagram → API setup, add your Instagram account as an Instagram tester, then accept the invite in Instagram (Settings → Website permissions → Apps and websites → Tester invites).
8. Generate a token for your account in the dashboard, or sign in when the agent sends the login link.

**Hand over to the agent (store as secrets):** `META_APP_ID`, `META_APP_SECRET`, `Instagram long-lived token (60 days)`, `Instagram user ID`

**Agent does**
- Exchange for a long-lived token and refresh it before 60 days.
- Host the media at a public HTTPS URL.
- POST /{ig-user-id}/media (image_url or video_url with media_type REELS / STORIES / CAROUSEL), wait until status is FINISHED, then POST /{ig-user-id}/media_publish.
- Check /content_publishing_limit (50 per 24h).

**Test:** Publish one test image; expect a media ID.

**Notes:** No App Review is needed for your own account. Review plus Business Verification is needed only if other people will sign in.

## MeWe
_Route: `manual`_ · Docs: https://docs.postiz.com/providers/mewe

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Minds
_Route: `manual`_ · Docs: https://gitlab.com/minds

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## OK.ru
_Route: `manual`_ · Docs: https://apiok.ru/en/dev/sdk/js/ui.postMediatopic/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## VK
_Route: `official_api_own_account`_ · Docs: https://dev.vk.ru/en/method/wall.post

**Human does**
1. Community you admin → Manage → API usage → Access tokens → Create token with wall and photos permissions (or create a VK ID app for personal posting; business apps need passport verification).

**Hand over to the agent (store as secrets):** `VK_COMMUNITY_TOKEN`, `group ID`

**Agent does**
- wall.post with owner_id=-GROUP_ID, from_group=1, message and attachments. Photos via photos.getWallUploadServer → upload → saveWallPhoto. Schedule with publish_date.

**Test:** wall.post a test message to the community; expect a post_id.

## Bilibili
_Route: `manual`_ · Docs: https://openhome.bilibili.com/doc

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Dailymotion
_Route: `official_api_own_account`_ · Docs: https://developers.dailymotion.com/guides/upload/

**Human does**
1. Dailymotion Studio → Organization → API keys → create a public API key (redirect URL from the agent).

**Hand over to the agent (store as secrets):** `DAILYMOTION_API_KEY`, `DAILYMOTION_API_SECRET`, `refresh token`

**Agent does**
- OAuth with scope manage_videos.
- GET /file/upload → upload the file → POST /me/videos {url, title, published=true} (publish_date to schedule).

**Test:** GET /me; expect your channel.

## Douyin
_Route: `manual`_ · Docs: https://developer.open-douyin.com/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Kuaishou / Kwai
_Route: `manual`_ · Docs: https://open.kuaishou.com

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Odysee
_Route: `manual`_ · Docs: https://lbry.tech/api/sdk

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Snapchat
_Route: `manual`_ · Docs: https://developers.snap.com/marketing-api/Public-Profile-API/Introduction

**Human does**
1. Use Creative Kit (Share to Snapchat) or post in the app. The Public Profile posting API is allowlist-only: ask Snap through a partner contact.

**Notes:** Later, Ayrshare or Metricool can schedule Snapchat for you.

## TikTok
_Route: `official_api_own_account`_ · Docs: https://developers.tiktok.com/doc/content-posting-api-get-started

**Human does**
1. Go to developers.tiktok.com, log in and create a developer account.
2. Manage apps → Connect an app. Fill in the name, icon, category, description, terms URL and privacy policy URL.
3. Add products Login Kit and Content Posting API. Under Content Posting, turn on Direct Post if you want to post straight to your profile.
4. Add the agent's redirect URI (HTTPS) and verify your domain or URL prefix if you'll use PULL_FROM_URL uploads.
5. Add your TikTok account as a target/test user. Set your TikTok account to private while unaudited: unaudited apps can only post SELF_ONLY.
6. Submit the app for review (demo video of the flow), and later the Content Posting audit to post publicly.

**Hand over to the agent (store as secrets):** `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `refresh token (365 days)`

**Agent does**
- OAuth with scopes user.info.basic, video.publish (or video.upload for drafts).
- query_creator_info first; then POST /v2/post/publish/video/init/ with FILE_UPLOAD or PULL_FROM_URL and a privacy_level from the allowed list; upload the chunks; poll the status.
- Access tokens last 24h; refresh them.

**Test:** Init a draft upload (video.upload) of a short clip; expect a publish_id.

**Notes:** Until the audit passes, posts are private and at most 5 users/day. For public posts now, use Buffer/Later/Publer/Metricool.

## Vimeo
_Route: `official_api_own_account`_ · Docs: https://developer.vimeo.com/api/upload/videos

**Human does**
1. developer.vimeo.com → Create app.
2. On a free plan: request Upload Access on the app page (human review, up to 5 business days). On paid plans it's automatic.
3. Generate an access token on the app page with scopes upload, edit, public, private.

**Hand over to the agent (store as secrets):** `VIMEO_ACCESS_TOKEN`

**Agent does**
- POST /me/videos with upload.approach=pull and a link to the file (or tus for local files).

**Test:** GET /me; expect your account.

## YouTube
_Route: `official_api_own_account`_ · Docs: https://developers.google.com/youtube/v3/docs/videos/insert

**Human does**
1. Go to console.cloud.google.com, sign in, and create a project.
2. APIs & Services → Library → enable 'YouTube Data API v3'.
3. APIs & Services → OAuth consent screen: choose External, fill in the app name, support email and developer email. Add yourself under Test users.
4. APIs & Services → Credentials → Create credentials → OAuth client ID. Type: Web application (redirect URI from the agent) or Desktop app.
5. Download the client ID and client secret.
6. When the agent sends a sign-in link, sign in with the Google account that owns the channel and approve 'Manage your YouTube videos'.
7. Optional, to make uploads public: request the YouTube API compliance audit (form linked from the YouTube API Services docs). Until it passes, API uploads are locked private.
8. Optional: publish the consent screen and complete Google verification, so sign-ins stop expiring every 7 days.

**Hand over to the agent (store as secrets):** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `the refresh token (the agent obtains it at sign-in)`

**Agent does**
- Run the OAuth flow with scope https://www.googleapis.com/auth/youtube.upload, access_type=offline, prompt=consent.
- Store the refresh token.
- Upload with videos.insert (resumable). Set status.privacyStatus, and status.publishAt to schedule.
- Refresh the access token every hour.

**Test:** videos.insert of a short test clip as private; expect a video ID.

**Notes:** In Testing mode the refresh token dies after 7 days, so re-sign in weekly or publish the app. Until the audit passes, use Buffer/Later/Publer/Metricool for public uploads.

## PeerTube
_Route: `official_api_own_account`_ · Docs: https://docs.joinpeertube.org/api-rest-reference.html

**Human does**
1. Create an account on a PeerTube server (preferably one used only for automation).

**Hand over to the agent (store as secrets):** `INSTANCE_URL`, `USERNAME`, `PASSWORD`

**Agent does**
- GET /api/v1/oauth-clients/local → POST /api/v1/users/token (grant_type=password).
- POST /api/v1/videos/upload-resumable. Schedule with scheduleUpdate.

**Test:** GET /api/v1/users/me; expect your account.

**Notes:** Password-only login: use a dedicated account and store the password as a secret.

## Pinterest
_Route: `official_api_own_account`_ · Docs: https://developers.pinterest.com/docs/api/v5/pins-create/

**Human does**
1. Convert to a Pinterest business account (free).
2. developers.pinterest.com → My apps → Connect app; fill in the details and redirect URI.
3. The app starts in Trial access: Pins created then are sandbox-only. Request Standard access (submit a short video of the OAuth flow plus a Pin being created).

**Hand over to the agent (store as secrets):** `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`, `refresh token`

**Agent does**
- OAuth with scopes boards:read pins:write (boards:write to create boards).
- POST /v5/pins with board_id and media_source.
- Access tokens last 30 days; refresh within 60 days.

**Test:** GET /v5/boards; expect your boards.

**Notes:** Use Buffer/Later/Hootsuite until Standard access is approved.

## Clubhouse
_Route: `manual`_ · Docs: https://www.clubhouse.com

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Medium
_Route: `manual`_ · Docs: https://github.com/Medium/medium-api-docs

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Naver Blog
_Route: `manual`_ · Docs: https://developers.naver.com/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Patreon
_Route: `manual`_ · Docs: https://docs.patreon.com/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Lemon8
_Route: `manual`_ · Docs: https://www.lemon8-app.com

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Xiaohongshu (RedNote)
_Route: `manual`_ · Docs: https://open.xiaohongshu.com/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Kick
_Route: `manual`_ · Docs: https://docs.kick.com

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Twitch
_Route: `manual`_ · Docs: https://dev.twitch.tv/docs/api/reference

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Signal
_Route: `manual`_ · Docs: https://github.com/AsamK/signal-cli

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Gettr
_Route: `manual`_ · Docs: https://gettr.com

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Truth Social
_Route: `manual`_ · Docs: https://www.globenewswire.com/news-release/2025/09/09/3146910/0/en/Truth-Social-Enhances-Platform.html

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Substack
_Route: `manual`_ · Docs: https://support.substack.com/hc/en-us/articles/360037870412-How-do-I-schedule-a-post-for-a-future-date

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## BeReal
_Route: `manual`_ · Docs: https://bereal.com

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Spotify for Creators
_Route: `manual`_ · Docs: https://support.spotify.com/us/creators/article/publishing-audio-episodes/

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Behance
_Route: `manual`_ · Docs: https://www.behance.net/dev

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Quora
_Route: `manual`_ · Docs: https://help.quora.com/hc/en-us/articles/360000470706-Platform-Policies

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Likee
_Route: `manual`_ · Docs: https://likee.video

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Rumble
_Route: `manual`_ · Docs: https://rumblefaq.groovehq.com/help/how-to-use-rumble-s-live-stream-api

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

## Triller
_Route: `manual`_ · Docs: https://en.wikipedia.org/wiki/Triller_(app)

**Human does**
1. Post in the app or website.

**Agent does**
- Prepare the text and media for this platform.

