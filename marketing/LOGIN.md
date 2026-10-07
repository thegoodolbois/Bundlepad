# Users signing in so an app can post for them

**Question:** can an app have the user log in, with Google or with the
platform's own login, and then upload content to *their* account with their
permission?

**Short answer:**
- **Yes, on most platforms with an upload API,** through that platform's own
  sign-in (OAuth). Exceptions:
  - **Password-only:** PeerTube and Lemmy.
  - **Your bot or webhook instead of a user login:** Telegram and Discord.
  - **Personal key only:** Binance Square and Ghost.
  - **No:** LINE, Patreon, Imgur (closed to new apps) and Twitch (no uploads).
- **Google sign-in covers only Google services.** One Google consent screen
  can grant YouTube (`youtube.upload`), Blogger (`blogger`) and Business
  Profile (`business.manage`) together. A Google login can **never** grant
  posting rights on Facebook, Instagram, Threads, X, TikTok or anything else.
  Each needs its own sign-in.
- **Your own account vs other people's.** Almost every platform lets the app's
  developer and listed testers use it right away. Opening it to the public
  needs a review:
  - **Meta:** App Review, usually plus Business Verification.
  - **Google:** OAuth verification. Before it, there's a 100-user cap, and
    Testing-mode sign-ins expire after 7 days.
  - **YouTube and TikTok:** uploads stay private until their audits pass.
  - **Pinterest:** Standard access.
  - **Reddit:** manual approval.
  - **LinkedIn:** company pages only.
- **Can it run in a browser with no server?**
  - **Yes:** X (PKCE public client), Bluesky, Nostr, Lens, Twitch.
  - **Probably, with a caveat:** Facebook Login (PKCE).
  - **No, needs a server for the secret:** LinkedIn, TikTok, Pinterest,
    Tumblr, Snapchat, Discord, Telegram, Vimeo, Dailymotion, Flickr,
    SoundCloud and most Google long-lived access.

**For automating your own content:** register a developer app on each
platform, sign in once yourself, and keep the refresh token. No public review
is needed, except that YouTube and TikTok keep posts private until audited.
For those two, connect them through a scheduler that has already passed the
audit (Buffer, Later, Publer, Metricool).

## Platform by platform

| Platform | How the user signs in | Can the app post for them? | Permissions (scopes) | Review needed before other people can use it | Token lifetime | Needs a server secret? |
|---|---|---|---|---|---|---|
| Apple Podcasts | None for creators — Apple has no public publish API; Podcasts Connect API keys (Account tab, Apple Podcasters Program members) are shared with Delegated Delivery hosts only | Not directly — episodes reach Apple via your RSS feed (host). Hosts with Delegated Delivery (e.g. Acast, ART19, Blubrry, Buzzsprout, Libsyn, Omny, RSS.com) can publish to Apple on your behalf | — | — | — | — |
| Bilibili | Bilibili OAuth 2.0 (token: POST https://api.bilibili.com/x/account-oauth2/v1/token) | Yes - video submission (arcopen/fn/archive: init -> upload -> complete -> add-by-utoken) for authorizing users, if the app has the submission capability | — | — | access_token with expires_in + refresh_token (exact durations unverified) | Yes (client_secret) |
| Binance Square | No third-party login — user pastes a personal key | Limited — with the user's own key | — | None | Key can expire (error 220004 'API key expired'); regenerate in Creator Center | Yes (keep the key secret) |
| Blogger | Google OAuth 2.0 (same consent can include YouTube + Business Profile) | Yes — blogs the user writes for | blogger | Google OAuth verification (blogger is a sensitive scope); Testing mode: 100 test users, refresh tokens expire after 7 days | Same as YouTube | For long-lived access |
| Bluesky | atproto OAuth (PAR + PKCE + DPoP) | Yes — the user's account | atproto + transition:generic, or granular: atproto repo:app.bsky.feed.post blob:*/* (blob scope needed for image/video uploads) | None | Browser sessions 2 weeks; longer with a backend | No |
| Dailymotion | Dailymotion OAuth 2.0 (public API key) | Yes — the user's channel | manage_videos | None documented | 10h access + refresh | Yes |
| DeviantArt | DeviantArt OAuth 2.0 | Yes — Sta.sh submit + publish | stash publish (plus basic/user implied); unchanged but still not confirmed from an official page this pass | None known | 1h + ~3-month refresh | Yes |
| Discord | Discord OAuth2 with webhook.incoming | Yes — the user picks a channel and you get its webhook | webhook.incoming | None | Webhook URL doesn't expire | Yes (client secret) |
| Douyin | Douyin OAuth 2.0 (open.douyin.com/platform/oauth/connect) | Yes - video publish to the authorizing user's account with video.create scope (app must hold the capability) | user_info,video.create | — | access_token 15 days; refresh_token 30 days (refresh does not extend refresh_token) | Yes (client_secret for token exchange) |
| Dribbble | Dribbble OAuth 2.0 (authorization code) | Yes — create shots for the authenticated user (upload scope) | public upload | — | — | — |
| Facebook Pages | Facebook Login (PKCE supported) | Yes — Pages the user manages (not personal profiles) | pages_manage_posts, pages_read_engagement, pages_show_list | App Review (Advanced Access) + usually Business Verification; before that only app roles/testers | Page token from a long-lived user token doesn't expire | Recommended |
| Farcaster | Sign In With Farcaster + signer approval (or Neynar managed signer) | Yes — via a signer the user approves | Signer (all message types) | None (needs your app's own Farcaster ID) | Until the user revokes the signer | Yes (signer/API key) |
| Flickr | OAuth 1.0a | Yes — photos and video | perms=write | Key request needs Flickr Pro; commercial keys reviewed | Until revoked | Yes (request signing) |
| Ghost | No user OAuth — Admin API key per site | Limited — with the site owner's key | — | None | Key until revoked | Yes (JWT signing) |
| Google Business Profile | Google OAuth 2.0 | Yes — the user's business locations | business.manage | API access application (~14 days) + OAuth verification | Same as YouTube | For long-lived access |
| Hive | Posting-key authority (e.g. via HiveSigner/Keychain) | Yes — signed by the user's key | Posting authority | None | Until revoked | No |
| Imgur | Imgur OAuth 2.0 | No for new apps — registration closed Aug 2026 | No scopes — OAuth 2.0 grants full account access | Closed to new apps | Access token ~1 month (28 days) + refresh token | — |
| Instagram | Instagram Login or Facebook Login | Yes — Business/Creator accounts only | instagram_business_basic, instagram_business_content_publish | App Review + likely Business Verification; testers only before | 60-day long-lived token, refreshable | Yes |
| KakaoTalk | Kakao Login | Limited — 'send to me' chat; Kakao Story API ended | talk_message | Review for friend messaging | 6h + ~2-month refresh | Yes |
| Kuaishou / Kwai | Kuaishou OAuth 2.0 (open.kuaishou.com) | Yes (China) - video publish via Open Platform content-publishing API for authorizing users; international Kwai has no public posting API found | — | — | — | Yes (app_secret) |
| Lemmy | Username/password login → JWT | Limited — app must handle the user's password | Full account | None | JWT login token stays valid until logout or password change (no fixed expiry in 0.19) | No |
| Lens | Wallet sign-in (SIWE) | Yes — as account owner/manager | Account Owner or Account Manager role (manager permissions: canExecuteTransactions, canSetMetadataUri, canTransferTokens, canTransferNative) | Register your app address | 10-min access, 7-day refresh | No |
| LINE | LINE Login (OAuth + OIDC, PKCE) | No — no API for user timeline posts; share picker only | profile openid | — | 30 days | — |
| LinkedIn | Sign In with LinkedIn (OIDC) + Share on LinkedIn | Yes — personal profile; company pages need Community Management API | openid profile w_member_social (email optional); w_organization_social for pages requires Community Management API | None for personal; pages need an approved application | 60-day access token; no refresh token for self-serve 'Share on LinkedIn' apps (programmatic refresh tokens, 365 days, only for approved partner programs) — user re-authorizes every 60 days | Yes (client secret) |
| Mastodon / Fediverse | Mastodon OAuth 2 per server (POST /api/v1/apps on each server); PKCE (S256) supported from 4.3.0; /.well-known/oauth-authorization-server from 4.3.0 | Yes — the user's account | write:statuses write:media | None | Tokens don't expire until revoked | No |
| Messenger | Facebook Login (Page token) | No — messages as a Page to people who contacted it; no feed/post publishing | pages_messaging, pages_show_list (pages_manage_metadata for webhooks) | App Review (Advanced Access for pages_messaging) + Business Verification; own Page works in Development mode | Page token from long-lived user token doesn't expire | Yes (webhook verification + app secret) |
| MeWe | MeWe OAuth (beta) | Yes — timeline and groups | Unverified | Developer program approval | Unverified | Yes |
| Nextdoor | Nextdoor OAuth (Publish API) | Yes — once access is granted | Publish | Access is aimed at organizations, public agencies, businesses and news partners; individual hobby use is unlikely to be approved | Bearer token from OAuth2 client_id/secret; the token response includes an expiry time (exact duration not published publicly) | Yes |
| Nostr | NIP-07 extension or NIP-46 remote signer | Yes — the user's signer signs each post | Per-connection permissions in NIP-46 (e.g. sign_event:1, sign_event:24242); NIP-07 extensions prompt per site | None | Until revoked | No |
| Odysee | None — no OAuth; posting is done by a self-run lbrynet daemon holding the channel's wallet/keys | Only for your own channel via your own lbrynet wallet (no third-party auth) | — | — | — | — |
| OK.ru | OK OAuth 2.0 (connect.ok.ru/oauth/authorize) | Yes - mediatopic.post to the user's own feed or groups they admin, once OK support grants the permissions | VALUABLE_ACCESS;GROUP_CONTENT;PHOTO_CONTENT;VIDEO_CONTENT;LONG_ACCESS_TOKEN | Permissions granted manually by OK support (api-support@ok.ru); app approval | Standard OAuth access_token ~30 min; with LONG_ACCESS_TOKEN 30 days, auto-extended when used regularly; refresh_token available | Yes - application secret key used to derive session_secret_key = md5(access_token + application_secret_key) for MD5 request signatures |
| Patreon | Patreon OAuth 2.0 | No — no post-creation endpoint | — | — | — | — |
| PeerTube | Password grant only | Limited — app must handle the user's password | Full account | None | Access token 1 day, refresh token 2 weeks (refresh with grant_type=refresh_token) | No |
| Pinterest | Pinterest OAuth 2.0 | Yes — the user's boards | pins:write, boards:read | Standard access review (Trial pins are sandbox-only) | 30-day access token; 60-day continuous refresh token, renewable indefinitely | Yes |
| Pixelfed | Mastodon-compatible OAuth per server | Yes | read write | None | Long-lived | No |
| Reddit | Reddit OAuth2 | Yes — the user's account | submit, identity | Manual approval (Responsible Builder Policy) | 1h; refresh with duration=permanent | Optional (installed-app type) |
| Snapchat | Snap Login Kit / Public Profile API | Limited — allowlisted apps; otherwise Creative Kit (user taps share) | snapchat-profile-api | Allowlist via Snap partner contact | 1h access + refresh | Yes |
| SoundCloud | OAuth 2.1 + PKCE (secret also needed) | Yes — track uploads | User access | Self-serve, but the developer needs Artist Pro | 1h; single-use refresh | Yes |
| Telegram | Log In With Telegram: standard OIDC authorization-code flow with PKCE (S256); discovery at https://oauth.telegram.org/.well-known/openid-configuration; client ID/secret from @BotFather; scopes openid, profile, phone. Identity only - grants no posting rights. | Limited — the user adds your bot as channel admin; posts appear as the channel | Channel admin right: post messages | None | Until the bot is removed | Yes (bot token) |
| Threads | Threads OAuth (threads.net/oauth/authorize; tokens via graph.threads.net) | Yes — the user's own profile | threads_basic, threads_content_publish | Own + tester accounts without review; App Review for everyone | 60-day token, refresh after 24h | Yes |
| TikTok | TikTok Login Kit | Yes — direct post or to the user's drafts | video.publish and/or video.upload | App review + Content Posting audit (before: private posts only, 5 users/day) | Access token 24h; refresh token 365 days (refresh without user consent) | Yes (client secret) |
| Tumblr | Tumblr OAuth 2 | Yes — the user's blogs | basic write offline_access | None documented | Short-lived access token (expires_in seconds in response); refresh token only with offline_access | Yes |
| Twitch | Twitch OAuth (public client possible) | No uploads — clips and channel info only | channel:manage:broadcast, channel:manage:schedule, clips:edit, user:write:chat (as needed) | None | ~4h, refreshable | No |
| Vimeo | Vimeo OAuth 2.0 | Yes — the user's videos | upload (+ public private edit) | Upload access review if your developer account is on the free plan | Historically non-expiring | Yes |
| VK | VK ID (OAuth 2.1 + PKCE) | Yes — wall posts, photos, video | wall photos video | VK ID app: developer verification (individual: passport + face check on camera; business: VK Business ID with company details verified via bank or documents) | ~60 min access + ~180-day refresh | Yes |
| WeChat | None for publishing (own account via AppID/AppSecret; service providers use Third-party Platform authorization) | No - own Official Account only (or via WeChat Open Platform third-party authorization) | — | — | access_token 7200 s (cgi-bin/token or cgi-bin/stable_token) | Yes - AppSecret plus server IP on the API IP whitelist |
| Weibo | Weibo OAuth 2.0 | Limited — statuses/share with your domain link only | Default | Real-name developer verification + app review | Depends on app review level; developer's own authorization reportedly long-lived (up to 5 years); no refresh token for web apps | Yes |
| WhatsApp | Embedded Signup (Facebook Login for Business) | No posting — Cloud API sends 1:1 messages as the business number to opted-in contacts; no Channels or Status API | whatsapp_business_management, whatsapp_business_messaging | Tech Provider + Business Verification + App Review | System-user token (long-lived) | Yes |
| WordPress (.com and self-hosted) | WordPress.com OAuth 2.0; self-hosted: application passwords | Yes — posts, pages, media | WordPress.com OAuth: default = one blog chosen at authorize time; scope=global = all the user's sites (incl. Jetpack sites); also auth, media, posts, sites etc. | None | WordPress.com: implicit-grant tokens last 2 weeks; authorization-code tokens are long-lived with no refresh token (re-auth if revoked). Self-hosted application passwords: until revoked. | Optional |
| X (Twitter) | OAuth 2.0 Authorization Code + PKCE; app can be a confidential client ('Web App/Automated App or Bot', has Client Secret) or public client ('Native App', no secret). OAuth 1.0a user tokens also still work. | Yes — the user's own account | tweet.write tweet.read users.read media.write offline.access | No app review; developer account + Project | Access token 2h; refresh token issued only with offline.access; refresh tokens are single-use (each refresh returns a new one), so always store the newest | No (but API calls may need a proxy) |
| YouTube | Google OAuth 2.0 | Yes — the user's channel | youtube.upload | Google OAuth app verification for sensitive scope (Testing mode: max 100 test users, refresh tokens expire 7 days after consent) + YouTube API Services compliance audit, otherwise uploads stay private | 1h access; refresh token | For long-lived access |

## Notes for the harder platforms
- **X:** posts made with users' tokens are billed to *your* developer
  account. That's about $0.015 per post, or $0.20 with a link.
- **LinkedIn:** tokens last 60 days with no refresh for self-serve apps, so
  the user signs in again every 60 days.
- **Bluesky:** browser-only sessions end after 2 weeks. A small backend
  (confidential client) gets longer sessions.
- **TikTok:** before a direct post, the app must show the creator's info, let
  the user pick the privacy setting with no default, and get explicit consent.
  The audit checks this.
- **Telegram:** posts appear as the *channel*, not the person. The user adds
  your bot as a channel admin with "Post messages".
- **Discord:** the `webhook.incoming` scope lets the user pick a channel on
  the consent screen, and you receive that channel's webhook URL. Store it as
  a secret.
- **Farcaster:** the user approves your app's signer once in the Farcaster
  app. It can post until they revoke it.
- **Nostr:** use the user's NIP-07 extension or NIP-46 remote signer. Never
  ask for their private key (nsec).
- **PeerTube and Lemmy:** only a username and password login exists. Warn
  the user, and prefer a dedicated account.
