# Every platform, every way to automate posting

Covers 71 platforms, researched 2026-10-07. For each one, this page lists
what you can upload, whether an API exists, what the API can upload, whether
it's free, whether users can sign in and let an app post for them, and
**every route to automate posting**, best first.

- **Machine-readable data:** [`data/platforms.json`](data/platforms.json)
  (each platform has an `automation_options` list) and
  [`data/platforms.csv`](data/platforms.csv).
- **For agents:** start with [AGENT-GUIDE.md](AGENT-GUIDE.md). Step-by-step setup (human vs agent) for every platform is in [SETUP.md](SETUP.md).

**Reliability.** Official docs were used where reachable, otherwise search
summaries of the official pages. Anything marked "unverified" isn't
confirmed. Prices and access rules change, so check the docs link before
acting.

## Overview

| Platform | Category | Upload API | API free? | API can upload | Users can sign in & let an app post for them | Siri Shortcut |
|---|---|---|---|---|---|---|
| [DeviantArt](#deviantart) | Art | Yes | Free | Sta.sh submit + publish deviations | Yes — Sta.sh submit + publish | Hard |
| [SoundCloud](#soundcloud) | Audio | Yes | Paid (developer needs Artist Pro) | Tracks (≤4 GB), metadata, playlists | Yes — track uploads | Hard |
| [Hive](#hive) | Blockchain social | Yes | Free | Posts and comments signed with your posting key | Yes — signed by the user's key | Hard |
| [Blogger](#blogger) | Blog | Yes | Free | Posts and pages (HTML content; create/update/publish/schedule). No image-upload endpoint — images must be hosted elsewhere and referenced in HTML. | Yes — blogs the user writes for | Hard |
| [Tumblr](#tumblr) | Blog | Yes | Free | All post types (NPF) | Yes — the user's blogs | Hard |
| [WordPress (.com and self-hosted)](#wordpress-com-and-self-hosted) | Blog | Yes | Free | Posts, pages, media | Yes — posts, pages, media | Easy (self-hosted) / Hard (.com) |
| [Ghost](#ghost) | Blog/newsletter | Yes | Free tier + paid | Posts, pages, images, media, newsletters | Limited — with the site owner's key | Hard |
| [Discord](#discord) | Community | Yes | Free | Text, embeds, files (multipart), polls, components; can post into a forum/media channel thread via thread_id or thread_name | Yes — the user picks a channel and you get its webhook | Easy |
| [Reddit](#reddit) | Community | Yes | Free tier + paid | Text, link, image posts; comments | Yes — the user's account | Hard |
| [Lemmy](#lemmy) | Community (federated) | Yes | Free | Posts, comments, images | Limited — app must handle the user's password | Easy |
| [Binance Square](#binance-square) | Crypto social | Yes | Free (unverified) | Text, up to 4 images, articles, video | Limited — with the user's own key | Medium |
| [Farcaster](#farcaster) | Decentralized social | Yes | Free tier + paid | Text casts (320 bytes; longer for Pro), up to 2 embeds by URL (images/video must be hosted elsewhere - no blob upload), replies, quote casts, channels | Yes — via a signer the user approves | Medium |
| [Lens](#lens) | Decentralized social | Yes | API free to use; onchain actions need gas on Lens Chain unless the App sponsors them; optional Server API key (x-lens-app header) lifts rate limits | Posts with media metadata | Yes — as account owner/manager | Hard |
| [Nostr](#nostr) | Decentralized social | Yes | Free | Signed events to relays (kind 1 notes, kind 30023 long-form); media uploaded to Blossom servers (NIP-B7; NIP-96 now deprecated) and referenced by URL with imeta tags | Yes — the user's signer signs each post | Hard |
| [Dribbble](#dribbble) | Design | Yes | Free | Shots (upload scope) | Yes — create shots for the authenticated user (upload scope) | Hard |
| [Imgur](#imgur) | Image | Yes | Free (non-commercial) | Images, video, albums, gallery posts | No for new apps — registration closed Aug 2026 | Easy (existing apps only) |
| [Kick](#kick) | Live video | Yes | Free | No video/clip upload (Kick is live-only; VODs come from streams). Official API (docs.kick.com) can update stream title/category (channel:write), send chat messages (chat:write), read stream key, manage webhooks | Partial: own-channel metadata and chat messages via OAuth; no content upload | — |
| [Twitch](#twitch) | Live video | Yes | Free | No video uploads: v5 upload API removed, Helix never added uploads. API can update channel info, create clips from live, manage stream schedule, chat, polls | No uploads — clips and channel info only | — |
| [Nextdoor](#nextdoor) | Local | Yes | Free (unverified) | Media via publicly accessible URLs only (media/smartlink URLs must be valid public URLs); response returns share_link https://nextdoor.com/p/{post_share_id} | Yes — once access is granted | Hard (access gated) |
| [Google Business Profile](#google-business-profile) | Local business | Yes | Free | Posts, media, review replies | Yes — the user's business locations | Hard |
| [KakaoTalk](#kakaotalk) | Messaging | Yes | Free tier + paid | No API for Channel posts; business messages via paid dealers | Limited — 'send to me' chat; Kakao Story API ended | — |
| [LINE](#line) | Messaging | Yes | Free tier + paid | Push/broadcast messages (text, image, video, audio, flex) | No — no API for user timeline posts; share picker only | Easy |
| [Telegram](#telegram) | Messaging | Yes | Free | Text (4096 chars), photos (10 MB), video/files (50 MB via api.telegram.org; up to 2000 MB with a self-hosted Local Bot API server), albums of 2-10, polls to channels/groups; stories only on Business accounts that connected the bot | Limited — the user adds your bot as channel admin; posts appear as the channel | Easy |
| [Viber](#viber) | Messaging | Yes | Free (channels; unverified) | Channel posts by URL media | Unverified | Easy |
| [WhatsApp](#whatsapp) | Messaging | Yes | Paid | 1:1 template/session messages only; Channel posts are manual | No posting — Cloud API sends 1:1 messages as the business number to opted-in contacts; no Channels or Status API | Easy (manual send) |
| [WeChat](#wechat) | Messaging/publishing | Yes | Free | Official Accounts: permanent media, drafts (draft/add), publish (freepublish/submit). Since July 2025 publish APIs revoked for individual-entity accounts, unverified enterprise accounts and accounts that cannot be verified. | No - own Official Account only (or via WeChat Open Platform third-party authorization) | Hard |
| [Bluesky](#bluesky) | Microblog | Yes | Free | Text, images, video, link cards, threads | Yes — the user's account | Easy |
| [Mastodon / Fediverse](#mastodon--fediverse) | Microblog | Yes | Free | Text, media, polls, threads | Yes — the user's account | Easy |
| [Threads](#threads) | Microblog | Yes | Free | Text (500 chars), images, video, carousels (2–20 items), polls (2–4 options, text posts only), GIFs (gif_attachment), link_attachment, quote posts (quote_post_id), replies | Yes — the user's own profile | Easy |
| [Weibo](#weibo) | Microblog | Yes | Free | Only statuses/share: ≤140 chars + image, must contain your bound domain URL | Limited — statuses/share with your domain link only | Hard |
| [X (Twitter)](#x-twitter) | Microblog | Yes | Paid | Text, images, video, polls, threads, links | Yes — the user's own account | Hard |
| [Flickr](#flickr) | Photo | Yes | Free tier + paid | Photos, video, metadata, albums | Yes — photos and video | Hard |
| [Pixelfed](#pixelfed) | Photo (federated) | Yes | Free | Photos (and video if enabled by the instance) via POST /api/v1/media or /api/v2/media, then POST /api/v1/statuses with media_ids; top-level posts must include media; 'direct' visibility rejected | Yes | Easy |
| [Apple Podcasts](#apple-podcasts) | Podcast | Yes | Free | Episodes via your RSS feed; Delegated Delivery for participating hosts | Not directly — episodes reach Apple via your RSS feed (host). Hosts with Delegated Delivery (e.g. Acast, ART19, Blubrry, Buzzsprout, Libsyn, Omny, RSS.com) can publish to Apple on your behalf | — |
| [LinkedIn](#linkedin) | Professional | Yes | Free | Text, images, video, articles, carousels, polls | Yes — personal profile; company pages need Community Management API | Hard |
| [Facebook Pages](#facebook-pages) | Social network | Yes | Free | Text, links, photos, video, Reels (/video_reels, 30 API Reels per 24h), Stories (/photo_stories, /video_stories) | Yes — Pages the user manages (not personal profiles) | Medium |
| [Instagram](#instagram) | Social network | Yes | Free | Images (JPEG), videos, Reels, Stories, carousels (≤10 items) | Yes — Business/Creator accounts only | Medium |
| [MeWe](#mewe) | Social network | Yes | Free (unverified) | Posts to your own timeline and to groups you belong to, with photo attachments (as exposed via Postiz) | Yes — timeline and groups | Hard |
| [OK.ru](#okru) | Social network | Yes | Free | Media topics with text, photos, links, polls | Yes - mediatopic.post to the user's own feed or groups they admin, once OK support grants the permissions | Hard |
| [VK](#vk) | Social network | Yes | Free (reported 10k calls/month until business verification, unverified) | Wall posts, photos, video, docs | Yes — wall posts, photos, video | Easy |
| [Bilibili](#bilibili) | Video | Yes | Free (unverified) | Video submission | Yes - video submission (arcopen/fn/archive: init -> upload -> complete -> add-by-utoken) for authorizing users, if the app has the submission capability | Hard |
| [Dailymotion](#dailymotion) | Video | Yes | Free | Video (upload URL → upload → publish), live events | Yes — the user's channel | Medium |
| [Douyin](#douyin) | Video | Yes | Free | Video publish (video.create), may be limited to approved apps | Yes - video publish to the authorizing user's account with video.create scope (app must hold the capability) | Hard |
| [Kuaishou / Kwai](#kuaishou--kwai) | Video | Yes | Free (unverified) | Video create/publish (China; international unverified) | Yes (China) - video publish via Open Platform content-publishing API for authorizing users; international Kwai has no public posting API found | Hard |
| [Odysee](#odysee) | Video | Yes | Free | Any file via a self-run daemon + wallet | Only for your own channel via your own lbrynet wallet (no third-party auth) | — |
| [Snapchat](#snapchat) | Video | Yes | Unverified | Stories, Saved Stories, Spotlight (allowlisted apps only) | Limited — allowlisted apps; otherwise Creative Kit (user taps share) | — |
| [TikTok](#tiktok) | Video | Yes | Free | Videos, photo posts (direct or to drafts) | Yes — direct post or to the user's drafts | Hard |
| [Vimeo](#vimeo) | Video | Yes | Free | Video (resumable, form, or pull from URL), thumbnails, captions, metadata | Yes — the user's videos | Easy |
| [YouTube](#youtube) | Video | Yes | Free | Videos (Shorts are ordinary uploads ≤3 min, vertical/square; no Shorts flag), thumbnails, captions, playlists, live broadcasts (liveBroadcasts API). Not Community/text/image posts. | Yes — the user's channel | Hard |
| [PeerTube](#peertube) | Video (federated) | Yes | Free | Video (incl. resumable), live, import by URL, playlists | Limited — app must handle the user's password | Medium |
| [Pinterest](#pinterest) | Visual | Yes | Free | Image and video Pins | Yes — the user's boards | Hard |
| [Clubhouse](#clubhouse) | Audio | No | — | Nothing | No (no posting API) | — |
| [Medium](#medium) | Blog | No | — | Nothing for new users | No (no posting API) | — |
| [Naver Blog](#naver-blog) | Blog | No | — | Nothing | No (no posting API) | — |
| [Patreon](#patreon) | Creator | Partial | Free | Posting not supported: API v2 reads campaigns/members/posts and webhooks; no public create-post endpoint | No — no post-creation endpoint | — |
| [Lemon8](#lemon8) | Lifestyle | No | — | Nothing | No (no posting API) | — |
| [Xiaohongshu (RedNote)](#xiaohongshu-rednote) | Lifestyle | No | — | Nothing | No (no posting API) | — |
| [Messenger](#messenger) | Messaging | Partial | Free | Send API: text/media replies to users who messaged the Page within 24h (plus HUMAN_AGENT tag 7 days); Recurring Notifications discontinued 10 Feb 2026 (except AU, EU, JP, KR, UK); tags CONFIRMED_EVENT_UPDATE/ACCOUNT_UPDATE/POST_PURCHASE_UPDATE removed (2026); paid Marketing Messages API replaces broadcasts | No — messages as a Page to people who contacted it; no feed/post publishing | — |
| [Signal](#signal) | Messaging | No | — | Nothing official | No (no posting API) | — |
| [Gab](#gab) | Microblog | No | Free | Statuses and media (unverified) | No (no posting API) | Hard (no sanctioned API) |
| [Gettr](#gettr) | Microblog | No | — | Nothing | No (no posting API) | — |
| [Truth Social](#truth-social) | Microblog | No | — | Unofficial only | No (no posting API) | Hard |
| [Substack](#substack) | Newsletter | No | — | Nothing | No (no posting API) | — |
| [BeReal](#bereal) | Photo | No | — | Nothing | No (no posting API) | — |
| [Spotify for Creators](#spotify-for-creators) | Podcast | No | — | No public upload API for individuals; Spotify's video Distribution API is for hosting partners (Acast, Audioboom, Libsyn, Omny, Podigee) so creators can publish video to Spotify from those hosts | No (no posting API) | — |
| [Behance](#behance) | Portfolio | No | — | Nothing | No (no posting API) | — |
| [Quora](#quora) | Q&A | No | — | Nothing | No (no posting API) | — |
| [Minds](#minds) | Social network | No | Free | Unofficial only (unofficial Python client supports posts/blogs via password login) | No (no posting API) | Hard |
| [Likee](#likee) | Video | No | — | Nothing | No (no posting API) | — |
| [Rumble](#rumble) | Video | No | — | Nothing — uploads are manual | No (no posting API) | — |
| [Triller](#triller) | Video | No | — | Nothing | No (no posting API) | — |

## Platform by platform

The numbered routes are in order of preference. The **Manual** route is always available. Full setup steps for each platform are in [SETUP.md](SETUP.md).

### DeviantArt
*Art* · Can upload: Art, literature, journals, status updates · Docs: https://www.deviantart.com/developers/

1. **Official API (your own account)**: Post to your own account with the official API (DeviantArt API v1): Sta.sh submit + publish deviations.  
   _access: App + OAuth2; cost: Free; scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with DeviantArt OAuth 2.0 and grants permission; the app then posts for them. Yes — Sta.sh submit + publish.  
   _scopes: stash publish (plus basic/user implied); unchanged but still not confirmed from an official page this pass; review to open to other users: None known; token lifetime: 1h + ~3-month refresh; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Isekai Core (self-hosted, unofficial).
4. **Siri Shortcut**: Not practical directly (OAuth). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### SoundCloud
*Audio* · Can upload: Tracks, playlists, albums · Docs: https://developers.soundcloud.com/docs/api

1. **Official API (your own account)**: Post to your own account with the official API (SoundCloud API): Tracks (≤4 GB), metadata, playlists.  
   _access: Self-serve at soundcloud.com/you/apps (or the sc-api-auth.mjs CLI) — requires Artist Pro; OAuth 2.1 Authorization Code + PKCE (secure.soundcloud.com); cost: Paid (developer needs Artist Pro); scheduling: No — POST /tracks has track[release_date] (yyyy-mm-dd metadata) and track[sharing]=public|private, but no publish-at field; schedule by uploading private and PUT sharing=public later; limits: Upload ≤4 GB and ≤24 h per file (AIFF/WAV/FLAC/OGG/MP2/MP3/AAC/AMR/WMA); play-stream requests 15,000/24 h per client_id; tokens ~1 h_
2. **User signs in, app posts for them**: The user signs in with OAuth 2.1 + PKCE (secret also needed) and grants permission; the app then posts for them. Yes — track uploads.  
   _scopes: User access; review to open to other users: Self-serve, but the developer needs Artist Pro; token lifetime: 1h; single-use refresh; needs server secret: Yes_
3. **Siri Shortcut**: Not practical directly (OAuth with short-lived tokens). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Built-in scheduler**: Schedule inside the platform itself: Yes (Artist Pro, private tracks).
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Verified against official docs (Oct 2026 review)_

### Hive
*Blockchain social* · Can upload: Long-form posts, comments, images, video (3Speak) · Docs: https://developers.hive.io/

1. **Official API (your own account)**: Post to your own account with the official API (Hive JSON-RPC): Posts and comments signed with your posting key.  
   _access: Hive account + posting key; cost: Free (Uses Resource Credits (staked HP)); scheduling: No; limits: Minimum 5 minutes between root posts and 3 seconds between replies per account (chain constants); every action costs Resource Credits from staked HP_
2. **User signs in, app posts for them**: The user signs in with Posting-key authority (e.g. via HiveSigner/Keychain) and grants permission; the app then posts for them. Yes — signed by the user's key.  
   _scopes: Posting authority; review to open to other users: None; token lifetime: Until revoked; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: PeakD, Ecency (built-in schedulers).
4. **Siri Shortcut**: Not practical directly (Needs key signing). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes in front-ends (PeakD, Ecency); not in the chain API.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Blogger
*Blog* · Can upload: Posts, pages, images, embedded video · Docs: https://developers.google.com/blogger/docs/3.0/reference/posts/publish

1. **Official API (your own account)**: Post to your own account with the official API (Blogger API v3): Posts and pages (HTML content; create/update/publish/schedule). No image-upload endpoint — images must be hosted elsewhere and referenced in HTML..  
   _access: Google OAuth (blogger scope); cost: Free; scheduling: Yes — posts.publish with optional publishDate (POST /blogger/v3/blogs/{blogId}/posts/{postId}/publish); limits: Default 10,000 requests/day per project; 100 requests/100 s per user (Cloud Console quota page shows exact values)_
2. **User signs in, app posts for them**: The user signs in with Google OAuth 2.0 (same consent can include YouTube + Business Profile) and grants permission; the app then posts for them. Yes — blogs the user writes for.  
   _scopes: blogger; review to open to other users: Google OAuth verification (blogger is a sensitive scope); Testing mode: 100 test users, refresh tokens expire after 7 days; token lifetime: Same as YouTube; needs server secret: For long-lived access_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Zapier/Make (unverified).
4. **Siri Shortcut**: Not practical directly (Google OAuth). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Tumblr
*Blog* · Can upload: Text, photos, video, audio, links, quotes, chat posts · Docs: https://www.tumblr.com/docs/en/api/v2

1. **Official API (your own account)**: Post to your own account with the official API (API v2): All post types (NPF).  
   _access: OAuth; cost: Free; scheduling: Yes — POST /v2/blog/{blog}/posts with state=queue and publish_on (ISO 8601) for a set time; state values published|queue|draft|private; limits: 250 published posts/day per user (incl. reblogs); 250 image uploads/day per user; queue limit exists (error 403.8022) but number not stated in API docs_
2. **User signs in, app posts for them**: The user signs in with Tumblr OAuth 2 and grants permission; the app then posts for them. Yes — the user's blogs.  
   _scopes: basic write offline_access; review to open to other users: None documented; token lifetime: Short-lived access token (expires_in seconds in response); refresh token only with offline_access; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Native queue/scheduler; IFTTT, Zapier (Ayrshare no longer lists Tumblr).
4. **Siri Shortcut**: Not practical directly (OAuth needed). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (queue).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Verified against official docs (Oct 2026 review)_

### WordPress (.com and self-hosted)
*Blog* · Can upload: Posts, pages, media, comments · Docs: https://developer.wordpress.com/docs/api/

1. **Official API (your own account)**: Post to your own account with the official API (WordPress REST API): Posts, pages, media.  
   _access: WordPress.com: OAuth app; self-hosted: application password; cost: Free; scheduling: Yes — status=future + date; limits: Self-hosted: no rate limit in core (host/WAF/security plugins may throttle); per_page max 100; upload size capped by PHP upload_max_filesize/post_max_size. WordPress.com: rate limits exist but numbers are not published (watch X-WS-RateLimit-Remaining header, back off on 429)._
2. **User signs in, app posts for them**: The user signs in with WordPress.com OAuth 2.0; self-hosted: application passwords and grants permission; the app then posts for them. Yes — posts, pages, media.  
   _scopes: WordPress.com OAuth: default = one blog chosen at authorize time; scope=global = all the user's sites (incl. Jetpack sites); also auth, media, posts, sites etc.; review to open to other users: None; token lifetime: WordPress.com: implicit-grant tokens last 2 weeks; authorization-code tokens are long-lived with no refresh token (re-auth if revoked). Self-hosted application passwords: until revoked.; needs server secret: Optional_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Publer, Jetpack Social, Zapier, n8n.
4. **Siri Shortcut**: Self-hosted: one call with an application password  
   _ease: Easy (self-hosted) / Hard (.com)_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Ghost
*Blog/newsletter* · Can upload: Posts, pages, newsletters, images, media · Docs: https://docs.ghost.org/admin-api

1. **Official API (your own account)**: Post to your own account with the official API (Admin API): Posts, pages, images, media, newsletters.  
   _access: Admin API key (signs a 5-min JWT); cost: Free tier + paid (Admin API itself is free; self-hosted free. Ghost(Pro) Starter does not include custom integrations - need Publisher (about $29/mo) or higher.); scheduling: Yes — status=scheduled + published_at; limits: No published per-key quota; Ghost(Pro) applies undocumented rate limiting (back off on 429). JWT must expire within 5 minutes. Image upload size limited by plan (Starter 5MB)._
2. **User signs in, app posts for them**: The user signs in with No user OAuth — Admin API key per site and grants permission; the app then posts for them. Limited — with the site owner's key.  
   _review to open to other users: None; token lifetime: Key until revoked; needs server secret: Yes (JWT signing)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Zapier.
4. **Siri Shortcut**: Not practical directly (Needs JWT signing (helper needed)). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Discord
*Community* · Can upload: Messages, images, video, files, polls, threads, events · Docs: https://docs.discord.com/developers/resources/webhook

1. **Official API (your own account)**: Post to your own account with the official API (Webhooks + bot API): Text, embeds, files (multipart), polls, components; can post into a forum/media channel thread via thread_id or thread_name.  
   _access: Webhook URL (no review); cost: Free; scheduling: No; limits: Rate limits are dynamic - read X-RateLimit-* headers and back off on 429 (retry_after). Observed per-webhook bucket ~5 req/2 s and ~30 messages/min per webhook/channel; message content <=2000 chars, <=10 embeds; attachments 10 MB on non-boosted servers_
2. **User signs in, app posts for them**: The user signs in with Discord OAuth2 with webhook.incoming and grants permission; the app then posts for them. Yes — the user picks a channel and you get its webhook.  
   _scopes: webhook.incoming; review to open to other users: None; token lifetime: Webhook URL doesn't expire; needs server secret: Yes (client secret)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: n8n, Postiz, Zapier, IFTTT.
4. **Siri Shortcut**: One call to the webhook URL  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Reddit
*Community* · Can upload: Text, links, images, video, polls · Docs: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki

1. **Official API (your own account)**: Post to your own account with the official API (Data API (approval required)): Text, link, image posts; comments.  
   _access: Self-service API access closed (Responsible Builder Policy, Nov 2025): new apps, including personal script apps, must request approval via a support ticket; existing approved access unaffected; Reddit targets ~7-day turnaround but many requests reportedly denied/unanswered; Devvit recommended for in-Reddit apps; cost: Free tier + paid (Free 100 queries/min; commercial use needs a paid agreement); scheduling: No; limits: 100 QPM_
2. **User signs in, app posts for them**: The user signs in with Reddit OAuth2 and grants permission; the app then posts for them. Yes — the user's account.  
   _scopes: submit, identity; review to open to other users: Manual approval (Responsible Builder Policy); token lifetime: 1h; refresh with duration=permanent; needs server secret: Optional (installed-app type)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Postpone, Postiz, Ayrshare, n8n (Buffer/Hootsuite do not support Reddit posting).
4. **Siri Shortcut**: Not practical directly (OAuth needed — use a scheduler). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Lemmy
*Community (federated)* · Can upload: Link, text, image posts; comments · Docs: https://join-lemmy.org/api/main

1. **Official API (your own account)**: Post to your own account with the official API (Lemmy HTTP API (per server)): Posts, comments, images.  
   _access: Log in with username/password → JWT; cost: Free; scheduling: No on API v3 (CreatePost has no schedule field); API v4 / Lemmy 1.0 adds a scheduled publish time; limits: 6 posts/10 min default_
2. **User signs in, app posts for them**: The user signs in with Username/password login → JWT and grants permission; the app then posts for them. Limited — app must handle the user's password.  
   _scopes: Full account; review to open to other users: None; token lifetime: JWT login token stays valid until logout or password change (no fixed expiry in 0.19); needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Lemmy Schedule, Poster.ly, Postiz.
4. **Siri Shortcut**: Login POST then Bearer call  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Binance Square
*Crypto social* · Can upload: Posts, images, articles, video, live · Docs: https://github.com/binance/binance-skills-hub (skills/binance/square-post)

1. **Official API (your own account)**: Post to your own account with the official API (Square OpenAPI): Text, up to 4 images, articles, video.  
   _access: Self-serve: create a Square OpenAPI key at https://www.binance.com/square/creator-center/home; cost: Free (unverified); scheduling: None documented (post immediately; schedule on the agent side); limits: 100 posts/day, 400 uploads/day per key; max 4 images per post; article = exactly 1 cover; images and video mutually exclusive_
2. **User signs in, app posts for them**: The user signs in with No third-party login — user pastes a personal key and grants permission; the app then posts for them. Limited — with the user's own key.  
   _review to open to other users: None; token lifetime: Key can expire (error 220004 'API key expired'); regenerate in Creator Center; needs server secret: Yes (keep the key secret)_
3. **Siri Shortcut**: One API call with the key header  
   _ease: Medium_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Verified against official docs (Oct 2026 review)_

### Farcaster
*Decentralized social* · Can upload: Text casts, images, links, channels, mini apps · Docs: https://docs.neynar.com/docs/integrate-managed-signers

1. **Official API (your own account)**: Post to your own account with the official API (via Neynar API): Text casts (320 bytes; longer for Pro), up to 2 embeds by URL (images/video must be hosted elsewhere - no blob upload), replies, quote casts, channels.  
   _access: Neynar API key + a signer approved once in the Farcaster app; creating a managed signer requires a signed key request from an app FID (custody mnemonic) or using Sign In With Neynar; cost: Free tier + paid (Free 200K compute units; $9–$249/mo plans); scheduling: No; limits: Plan-based_
2. **User signs in, app posts for them**: The user signs in with Sign In With Farcaster + signer approval (or Neynar managed signer) and grants permission; the app then posts for them. Yes — via a signer the user approves.  
   _scopes: Signer (all message types); review to open to other users: None (needs your app's own Farcaster ID); token lifetime: Until the user revokes the signer; needs server secret: Yes (signer/API key)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Postiz.
4. **Siri Shortcut**: One API call with key + signer  
   _ease: Medium_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Lens
*Decentralized social* · Can upload: Posts, images, video metadata · Docs: https://lens.xyz/docs/protocol

1. **Official API (your own account)**: Post to your own account with the official API (Lens API/SDK): Posts with media metadata.  
   _access: Wallet signature; cost: API free to use; onchain actions need gas on Lens Chain unless the App sponsors them; optional Server API key (x-lens-app header) lifts rate limits; scheduling: Unverified; limits: API rate limits apply without a Server API key (numbers unverified)_
2. **User signs in, app posts for them**: The user signs in with Wallet sign-in (SIWE) and grants permission; the app then posts for them. Yes — as account owner/manager.  
   _scopes: Account Owner or Account Manager role (manager permissions: canExecuteTransactions, canSetMetadataUri, canTransferTokens, canTransferNative); review to open to other users: Register your app address; token lifetime: 10-min access, 7-day refresh; needs server secret: No_
3. **Siri Shortcut**: Not practical directly (Not practical). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Partly unverified (Oct 2026 review)_

### Nostr
*Decentralized social* · Can upload: Text notes, images/video by URL, long-form · Docs: https://github.com/nostr-protocol/nips

1. **Official API (your own account)**: Post to your own account with the official API (Protocol (no company API)): Signed events to relays (kind 1 notes, kind 30023 long-form); media uploaded to Blossom servers (NIP-B7; NIP-96 now deprecated) and referenced by URL with imeta tags.  
   _access: Your private key; cost: Free (Some relays charge); scheduling: No; limits: Per relay_
2. **User signs in, app posts for them**: The user signs in with NIP-07 extension or NIP-46 remote signer and grants permission; the app then posts for them. Yes — the user's signer signs each post.  
   _scopes: Per-connection permissions in NIP-46 (e.g. sign_event:1, sign_event:24242); NIP-07 extensions prompt per site; review to open to other users: None; token lifetime: Until revoked; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Postiz.
4. **Siri Shortcut**: Not practical directly (Not directly (needs signing)). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Verified against official docs (Oct 2026 review)_

### Dribbble
*Design* · Can upload: Shots (images, GIF, video), projects · Docs: https://developer.dribbble.com/v2/

1. **Official API (your own account)**: Post to your own account with the official API (API v2): Shots (upload scope).  
   _access: Self-serve OAuth2 app at developer.dribbble.com; shot creation needs the 'upload' scope and the user must be an eligible uploader (Pro/team, per third-party reports); cost: Free; scheduling: No; limits: Shot image exactly 400x300 or 800x600 (or larger multiples per newer UI, unverified), ≤8 MB, GIF/JPG/PNG; API rate limits unverified_
2. **User signs in, app posts for them**: The user signs in with Dribbble OAuth 2.0 (authorization code) and grants permission; the app then posts for them. Yes — create shots for the authenticated user (upload scope).  
   _scopes: public upload_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: TimeToPost (3rd-party claim).
4. **Siri Shortcut**: Not practical directly (OAuth (feasible with a pasted long-lived token)). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Imgur
*Image* · Can upload: Images, GIFs, short video, albums, gallery posts · Docs: https://apidocs.imgur.com/

1. **Official API (your own account)**: Post to your own account with the official API (Imgur API v3): Images, video, albums, gallery posts.  
   _access: New app registration closed (Aug 2026); existing apps keep working; cost: Free (non-commercial) (Non-commercial free; commercial terms unverified); scheduling: No; limits: ~12,500 requests/day per client (≈1,250 uploads/day; uploads cost 10 credits); X-RateLimit-ClientRemaining header_
2. **Siri Shortcut**: Anonymous upload with Client-ID is one call; account posting needs OAuth  
   _ease: Easy (existing apps only)_
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Kick
*Live video* · Can upload: Live streams, clips, chat · Docs: https://docs.kick.com

1. **Official API (your own account)**: Post to your own account with the official API (Kick API): No video/clip upload (Kick is live-only; VODs come from streams). Official API (docs.kick.com) can update stream title/category (channel:write), send chat messages (chat:write), read stream key, manage webhooks.  
   _access: OAuth 2.1; cost: Free; scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with — and grants permission; the app then posts for them. Partial: own-channel metadata and chat messages via OAuth; no content upload.  
   _scopes: user:read, channel:read, channel:write, chat:write, chat:delete, streamkey:read, events:subscribe, moderation:manage_
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Twitch
*Live video* · Can upload: Live streams, clips, VODs, chat · Docs: https://dev.twitch.tv/docs/api/reference

1. **Official API (your own account)**: Post to your own account with the official API (Helix API): No video uploads: v5 upload API removed, Helix never added uploads. API can update channel info, create clips from live, manage stream schedule, chat, polls.  
   _access: OAuth; cost: Free; scheduling: Yes: Create Channel Stream Schedule Segment (POST /helix/schedule/segment); non-recurring segments only for Affiliates/Partners; limits: Points-per-minute_
2. **Built-in scheduler**: Schedule inside the platform itself: Yes (stream schedule).
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Nextdoor
*Local* · Can upload: Posts, photos, video, events, For Sale & Free · Docs: https://developer.nextdoor.com/docs/sharing-overview

1. **Official API (your own account)**: Post to your own account with the official API (Publish API (partner access by request). Create post endpoint supports neighbor profile, business profile and entity pages; requires post:write scope. Other endpoints: event post, FSF post, agency post, news articles.): Media via publicly accessible URLs only (media/smartlink URLs must be valid public URLs); response returns share_link https://nextdoor.com/p/{post_share_id}.  
   _access: Submit the Publishing API request form at developer.nextdoor.com; Nextdoor reviews every request; on approval they email a client ID and secret; cost: Free (unverified); scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Nextdoor OAuth (Publish API) and grants permission; the app then posts for them. Yes — once access is granted.  
   _scopes: Publish; review to open to other users: Access is aimed at organizations, public agencies, businesses and news partners; individual hobby use is unlikely to be approved; token lifetime: Bearer token from OAuth2 client_id/secret; the token response includes an expiry time (exact duration not published publicly); needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: None verified among mainstream schedulers.
4. **Siri Shortcut**: Not practical directly (Not practical: requires approved partner access). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard (access gated)_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Google Business Profile
*Local business* · Can upload: Posts (updates, offers, events), photos, video, review replies · Docs: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/create

1. **Official API (your own account)**: Post to your own account with the official API (Business Profile API (v4 localPosts)): Posts, media, review replies.  
   _access: Apply for API access (allowlist form, ~14 days) + Google OAuth (business.manage); cost: Free; scheduling: Partial — recurring posts via RecurrenceInfo on LocalPost (since 7 Apr 2026); no one-off future publish time — agent must hold one-off posts; limits: 0 QPM until the API access request is approved; after approval default 300 QPM (Business Information) and per-endpoint quotas_
2. **User signs in, app posts for them**: The user signs in with Google OAuth 2.0 and grants permission; the app then posts for them. Yes — the user's business locations.  
   _scopes: business.manage; review to open to other users: API access application (~14 days) + OAuth verification; token lifetime: Same as YouTube; needs server secret: For long-lived access_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Publer, Hootsuite, SocialPilot.
4. **Siri Shortcut**: Not practical directly (OAuth + allowlist). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes — built-in post scheduler and multi-location publishing (rolled out ~Apr–May 2026).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### KakaoTalk
*Messaging* · Can upload: Channel posts, messages; Kakao Story (API ended 2023) · Docs: https://developers.kakao.com/docs/latest/en/kakaotalk-channel/common

1. **Official API (your own account)**: Post to your own account with the official API (Kakao Channel API): No API for Channel posts; business messages via paid dealers.  
   _access: Biz app + Korean business registration; cost: Free tier + paid (Dealer messages paid per message); scheduling: No; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Kakao Login and grants permission; the app then posts for them. Limited — 'send to me' chat; Kakao Story API ended.  
   _scopes: talk_message; review to open to other users: Review for friend messaging; token lifetime: 6h + ~2-month refresh; needs server secret: Yes_
3. **Built-in scheduler**: Schedule inside the platform itself: Yes.
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Partly unverified (Oct 2026 review)_

### LINE
*Messaging* · Can upload: Official Account messages/broadcasts (LINE VOOM shut down Sept 2026) · Docs: https://developers.line.biz/en/reference/messaging-api/

1. **Official API (your own account)**: Post to your own account with the official API (Messaging API): Push/broadcast messages (text, image, video, audio, flex).  
   _access: Official Account + Messaging API channel; cost: Free tier + paid (Japan: free 200 msgs/month; ¥5,000 for 5,000; ¥15,000+ with overage); scheduling: No; limits: Monthly message cap by plan; broadcast endpoint rate limit 60 requests/hour; other endpoints ~2,000 req/s (unverified - official site blocked)_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: respond.io and CRM tools.
3. **Siri Shortcut**: Long-lived channel token, one broadcast call  
   _ease: Easy_
4. **Built-in scheduler**: Schedule inside the platform itself: Yes (scheduled broadcasts).
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Partly unverified (Oct 2026 review)_

### Telegram
*Messaging* · Can upload: Messages, photos, video, files, polls, stories, channels · Docs: https://core.telegram.org/bots/api

1. **Official API (your own account)**: Post to your own account with the official API (Bot API): Text (4096 chars), photos (10 MB), video/files (50 MB via api.telegram.org; up to 2000 MB with a self-hosted Local Bot API server), albums of 2-10, polls to channels/groups; stories only on Business accounts that connected the bot.  
   _access: Bot token from @BotFather; bot is channel admin; cost: Free; scheduling: No; limits: Avoid >1 msg/s in a single chat; max 20 msgs/min in a group/channel; ~30 msgs/s across all chats (more only with paid broadcasts). On 429 obey retry_after._
2. **User signs in, app posts for them**: The user signs in with Log In With Telegram: standard OIDC authorization-code flow with PKCE (S256); discovery at https://oauth.telegram.org/.well-known/openid-configuration; client ID/secret from @BotFather; scopes openid, profile, phone. Identity only - grants no posting rights. and grants permission; the app then posts for them. Limited — the user adds your bot as channel admin; posts appear as the channel.  
   _scopes: Channel admin right: post messages; review to open to other users: None; token lifetime: Until the bot is removed; needs server secret: Yes (bot token)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Ayrshare, n8n, Postiz, IFTTT.
4. **Siri Shortcut**: One API call with the bot token  
   _ease: Easy_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (in apps).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Viber
*Messaging* · Can upload: Channel posts (text, photos, video, files, polls), bot messages · Docs: https://developers.viber.com/docs/tools/channels-post-api/

1. **Official API (your own account)**: Post to your own account with the official API (Channels Post API / Bot API): Channel posts by URL media.  
   _access: Channel super admin token + webhook with SSL; cost: Free (channels; unverified) (Bot chats may be paid); scheduling: No; limits: Unverified_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: SMMplanner, postmypost.
3. **Siri Shortcut**: Static auth-token header, one call  
   _ease: Easy_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Partly unverified (Oct 2026 review)_

### WhatsApp
*Messaging* · Can upload: Messages, photos, video, status, Channels · Docs: https://developers.facebook.com/docs/whatsapp/pricing

1. **Official API (your own account)**: Post to your own account with the official API (Cloud API (no Channels API)): 1:1 template/session messages only; Channel posts are manual.  
   _access: Meta Business + WhatsApp Business account; cost: Paid (Per-message pricing since 1 Jul 2025: marketing/utility/authentication templates charged per delivered message (rates by country; US marketing ≈ $0.025); non-template replies in the 24h service window are free); scheduling: No; limits: Messaging tiers_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Hootsuite (inbox).
3. **Siri Shortcut**: Open URL wa.me/?text=… (prefill, tap send)  
   _ease: Easy (manual send)_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### WeChat
*Messaging/publishing* · Can upload: Official Account articles, images, video, audio; Channels short video, live · Docs: https://developers.weixin.qq.com/doc/offiaccount/en/Getting_Started/Overview.html

1. **Official API (your own account)**: Post to your own account with the official API (Official Account API (no Channels API)): Official Accounts: permanent media, drafts (draft/add), publish (freepublish/submit). Since July 2025 publish APIs revoked for individual-entity accounts, unverified enterprise accounts and accounts that cannot be verified..  
   _access: Verified corporate/sole-proprietor account; IP whitelist; cost: Free (WeChat verification ¥300 per year (annual re-verification)); scheduling: No; limits: 1 mass send/day (subscription accounts)_
2. **Siri Shortcut**: Not practical directly (appid+secret token + IP whitelist). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
3. **Built-in scheduler**: Schedule inside the platform itself: Yes (scheduled mass send).
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Bluesky
*Microblog* · Can upload: Text, photos, video, links, threads · Docs: https://docs.bsky.app/docs/get-started

1. **Official API (your own account)**: Post to your own account with the official API (AT Protocol): Text, images, video, link cards, threads.  
   _access: App password or OAuth; no review; cost: Free; scheduling: No; limits: 5,000 points/hour and 35,000 points/day per account (create=3, update=2, delete=1 -> max ~1,666 posts/h, ~11,666/day); createSession 30 per 5 min and 300/day; 3,000 requests/5 min per IP; images <=1,000,000 bytes each, 4 per post; video <=100 MB / 3 min, 25 videos or 10 GB per day, verified email required_
2. **User signs in, app posts for them**: The user signs in with atproto OAuth (PAR + PKCE + DPoP) and grants permission; the app then posts for them. Yes — the user's account.  
   _scopes: atproto + transition:generic, or granular: atproto repo:app.bsky.feed.post blob:*/* (blob scope needed for image/video uploads); review to open to other users: None; token lifetime: Browser sessions 2 weeks; longer with a backend; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Typefully, Ayrshare, Postiz.
4. **Siri Shortcut**: Two API calls with an app password  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Verified against official docs (Oct 2026 review)_

### Mastodon / Fediverse
*Microblog* · Can upload: Text, photos, video, audio, polls · Docs: https://docs.joinmastodon.org/methods/statuses/

1. **Official API (your own account)**: Post to your own account with the official API (Mastodon API): Text, media, polls, threads.  
   _access: Token from your server's settings; no review; cost: Free; scheduling: Yes — scheduled_at; limits: 300 requests / 5 min per account and per IP; POST /api/v1/media (and v2) 30 per 30 min; deletes/unreblogs 30 per 30 min; check X-RateLimit-* headers. scheduled_at must be >=5 min in the future_
2. **User signs in, app posts for them**: The user signs in with Mastodon OAuth 2 per server (POST /api/v1/apps on each server); PKCE (S256) supported from 4.3.0; /.well-known/oauth-authorization-server from 4.3.0 and grants permission; the app then posts for them. Yes — the user's account.  
   _scopes: write:statuses write:media; review to open to other users: None; token lifetime: Tokens don't expire until revoked; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Typefully, Postiz, Mixpost.
4. **Siri Shortcut**: One API call with a token (can schedule)  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Verified against official docs (Oct 2026 review)_

### Threads
*Microblog* · Can upload: Text, photos, video, carousels, polls, GIFs, links · Docs: https://developers.facebook.com/docs/threads/posts

1. **Official API (your own account)**: Post to your own account with the official API (Threads API): Text (500 chars), images, video, carousels (2–20 items), polls (2–4 options, text posts only), GIFs (gif_attachment), link_attachment, quote posts (quote_post_id), replies.  
   _access: OAuth threads_content_publish; cost: Free; scheduling: No; limits: 250 API posts / 24h_
2. **User signs in, app posts for them**: The user signs in with Threads OAuth (threads.net/oauth/authorize; tokens via graph.threads.net) and grants permission; the app then posts for them. Yes — the user's own profile.  
   _scopes: threads_basic, threads_content_publish; review to open to other users: Own + tester accounts without review; App Review for everyone; token lifetime: 60-day token, refresh after 24h; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Sprout, Ayrshare, IFTTT, Publer.
4. **Siri Shortcut**: Open URL threads.com/intent/post?text=… (one tap)  
   _ease: Easy_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes — in-app scheduler (three-dot menu in composer; single posts, not thread chains).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Weibo
*Microblog* · Can upload: Text, images, video, live, articles · Docs: https://open.weibo.com/wiki/

1. **Official API (your own account)**: Post to your own account with the official API (Weibo Open Platform): Only statuses/share: ≤140 chars + image, must contain your bound domain URL.  
   _access: Real-name developer verification + app review (likely China identity); cost: Free; scheduling: No; limits: statuses/share: text URL-encoded, <=140 Chinese characters, must contain >=1 URL under the app's bound secure domain (else error 10017); one image per post; undisclosed frequency limits._
2. **User signs in, app posts for them**: The user signs in with Weibo OAuth 2.0 and grants permission; the app then posts for them. Limited — statuses/share with your domain link only.  
   _scopes: Default; review to open to other users: Real-name developer verification + app review; token lifetime: Depends on app review level; developer's own authorization reportedly long-lived (up to 5 years); no refresh token for web apps; needs server secret: Yes_
3. **Siri Shortcut**: Not practical directly (OAuth + domain binding). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Built-in scheduler**: Schedule inside the platform itself: Yes (scheduled posts).
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### X (Twitter)
*Microblog* · Can upload: Text, photos, video, GIFs, polls, threads, live (Spaces) · Docs: https://docs.x.com/x-api/getting-started/pricing

1. **Official API (your own account)**: Post to your own account with the official API (X API v2): Text, images, video, polls, threads, links.  
   _access: Developer account; OAuth 2.0 or 1.0a; cost: Paid (Pay-per-use credits only for new developers since 6 Feb 2026 (Basic/Pro legacy, closed to new signups; Enterprise otherwise). Post create $0.015/request; post containing a URL $0.20/request (April 2026 repricing). Reads capped at 2M/month. Prices change: Developer Console is the source of truth.); scheduling: No; limits: 2M post reads/month cap_
2. **User signs in, app posts for them**: The user signs in with OAuth 2.0 Authorization Code + PKCE; app can be a confidential client ('Web App/Automated App or Bot', has Client Secret) or public client ('Native App', no secret). OAuth 1.0a user tokens also still work. and grants permission; the app then posts for them. Yes — the user's own account.  
   _scopes: tweet.write tweet.read users.read media.write offline.access; review to open to other users: No app review; developer account + Project; token lifetime: Access token 2h; refresh token issued only with offline.access; refresh tokens are single-use (each refresh returns a new one), so always store the newest; needs server secret: No (but API calls may need a proxy)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Typefully, Publer, Ayrshare, Postiz, Zapier (several tools now charge an X add-on, e.g. Vista Social $29/mo per X profile since 1 Mar 2026).
4. **Siri Shortcut**: Not practical directly (IFTTT applet, or API with an OAuth token that expires every ~2h). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes — scheduler in the x.com web composer (calendar icon); mobile/X Pro scheduling tied to Premium.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Flickr
*Photo* · Can upload: Photos, video, albums · Docs: https://www.flickr.com/services/api/

1. **Official API (your own account)**: Post to your own account with the official API (Flickr API): Photos, video, metadata, albums.  
   _access: OAuth 1.0a; cost: Free tier + paid (Requesting API keys is limited to Flickr Pro subscribers; choose Non-Commercial or Commercial key (commercial reviewed)); scheduling: No; limits: 3,600 queries/hour per API key (aggregate across users); abuse can get the key disabled_
2. **User signs in, app posts for them**: The user signs in with OAuth 1.0a and grants permission; the app then posts for them. Yes — photos and video.  
   _scopes: perms=write; review to open to other users: Key request needs Flickr Pro; commercial keys reviewed; token lifetime: Until revoked; needs server secret: Yes (request signing)_
3. **Siri Shortcut**: Not practical directly (OAuth 1.0a signing). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Pixelfed
*Photo (federated)* · Can upload: Photos, video, carousels, stories · Docs: https://docs.pixelfed.org/

1. **Official API (your own account)**: Post to your own account with the official API (Mastodon-compatible API): Photos (and video if enabled by the instance) via POST /api/v1/media or /api/v2/media, then POST /api/v1/statuses with media_ids; top-level posts must include media; 'direct' visibility rejected.  
   _access: Personal Access Token created at https://<server>/settings/applications; cost: Free; scheduling: No - POST /api/v1/statuses accepts no scheduled_at; limits: Code defaults: 1,000 statuses/day and 1,250 media uploads/day per account; 4 media per post, 15 MB per photo, 500-char caption, image types jpeg/png/gif unless the admin enables video (all instance-configurable; read GET /api/v1/instance)_
2. **User signs in, app posts for them**: The user signs in with Mastodon-compatible OAuth per server and grants permission; the app then posts for them. Yes.  
   _scopes: read write; review to open to other users: None; token lifetime: Long-lived; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Fedica, Postpone (third-party claims).
4. **Siri Shortcut**: Bearer token + multipart upload  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Verified against official docs (Oct 2026 review)_

### Apple Podcasts
*Podcast* · Can upload: Podcast episodes (audio/video) via RSS · Docs: https://podcasters.apple.com/support/823-podcast-requirements

1. **Official API (your own account)**: Post to your own account with the official API (RSS feed / Delegated Delivery (hosts only)): Episodes via your RSS feed; Delegated Delivery for participating hosts.  
   _access: Podcasts Connect account; cost: Free; scheduling: Via your host; limits: Show needs ≥1 episode, 1400–3000 px square artwork, description, owner email; RSS changes appear within hours (refresh after 24–48 h)_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Any podcast host.
3. **Siri Shortcut**: Edit a self-hosted RSS feed
4. **Built-in scheduler**: Schedule inside the platform itself: Yes (pubDate / host).
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Verified against official docs (Oct 2026 review)_

### LinkedIn
*Professional* · Can upload: Text, photos, video, documents, articles, polls, newsletters · Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin

1. **Official API (your own account)**: Post to your own account with the official API (Posts API / Share on LinkedIn): Text, images, video, articles, carousels, polls.  
   _access: Personal: self-serve; company pages: access request; cost: Free; scheduling: No — POST /rest/posts publishes immediately (lifecycleState PUBLISHED; DRAFT exists but no scheduled-publish field). Agent must hold posts until due.; limits: 150 req/member/day_
2. **User signs in, app posts for them**: The user signs in with Sign In with LinkedIn (OIDC) + Share on LinkedIn and grants permission; the app then posts for them. Yes — personal profile; company pages need Community Management API.  
   _scopes: openid profile w_member_social (email optional); w_organization_social for pages requires Community Management API; review to open to other users: None for personal; pages need an approved application; token lifetime: 60-day access token; no refresh token for self-serve 'Share on LinkedIn' apps (programmatic refresh tokens, 365 days, only for approved partner programs) — user re-authorizes every 60 days; needs server secret: Yes (client secret)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Ayrshare, n8n.
4. **Siri Shortcut**: Not practical directly (OAuth needed — use a scheduler). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (up to 3 months).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Facebook Pages
*Social network* · Can upload: Text, photos, video, Reels, Stories, links, live, events · Docs: https://developers.facebook.com/docs/pages-api/posts

1. **Official API (your own account)**: Post to your own account with the official API (Graph API (Pages API)): Text, links, photos, video, Reels (/video_reels, 30 API Reels per 24h), Stories (/photo_stories, /video_stories).  
   _access: Meta developer app; own Pages work in Development mode via app role (Standard Access); App Review (Advanced Access) for pages_manage_posts only to serve other people's Pages; cost: Free; scheduling: Yes — scheduled_publish_time (10 min–30 days); limits: 4,800 calls × engaged users / 24h_
2. **User signs in, app posts for them**: The user signs in with Facebook Login (PKCE supported) and grants permission; the app then posts for them. Yes — Pages the user manages (not personal profiles).  
   _scopes: pages_manage_posts, pages_read_engagement, pages_show_list; review to open to other users: App Review (Advanced Access) + usually Business Verification; before that only app roles/testers; token lifetime: Page token from a long-lived user token doesn't expire; needs server secret: Recommended_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Ayrshare, n8n, IFTTT.
4. **Siri Shortcut**: API call with a stored Page token  
   _ease: Medium_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (Meta Business Suite).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Instagram
*Social network* · Can upload: Photos, video, Reels, Stories, carousels, live · Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing

1. **Official API (your own account)**: Post to your own account with the official API (Instagram Content Publishing API): Images (JPEG), videos, Reels, Stories, carousels (≤10 items).  
   _access: Professional (Business or Creator) account; own account works in Development mode with Standard Access (app role + Instagram tester); App Review/Advanced Access only for other users; cost: Free; scheduling: No (schedulers hold the post); limits: 100 API-published posts per 24h rolling (carousels count as 1; check GET /{ig-id}/content_publishing_limit); media must be at a public URL (or resumable upload for video via rupload)_
2. **User signs in, app posts for them**: The user signs in with Instagram Login or Facebook Login and grants permission; the app then posts for them. Yes — Business/Creator accounts only.  
   _scopes: instagram_business_basic, instagram_business_content_publish; review to open to other users: App Review + likely Business Verification; testers only before; token lifetime: 60-day long-lived token, refreshable; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Later, Hootsuite, Ayrshare.
4. **Siri Shortcut**: API call with a token (media hosted at a URL)  
   _ease: Medium_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes — in the Instagram app for professional accounts (up to 75 days) and Meta Business Suite.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### MeWe
*Social network* · Can upload: Text, photos, video, groups, stories · Docs: https://docs.postiz.com/providers/mewe (MeWe's own developer docs are behind the developer program login)

1. **Official API (your own account)**: Post to your own account with the official API (MeWe Developer Program (beta, limited spots, application reviewed)): Posts to your own timeline and to groups you belong to, with photo attachments (as exposed via Postiz).  
   _access: Apply in the MeWe Developer Portal; MeWe team reviews; then create a 'Standalone App' to get App ID + API Key; cost: Free (unverified); scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with MeWe OAuth (beta) and grants permission; the app then posts for them. Yes — timeline and groups.  
   _scopes: Unverified; review to open to other users: Developer program approval; token lifetime: Unverified; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Postiz (cloud and self-hosted).
4. **Siri Shortcut**: Not practical directly (OAuth (beta access)). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### OK.ru
*Social network* · Can upload: Text, photos, video, Moments, live, polls · Docs: https://apiok.ru/en/dev/sdk/js/ui.postMediatopic/

1. **Official API (your own account)**: Post to your own account with the official API (OK REST API): Media topics with text, photos, links, polls.  
   _access: Register as developer and create an app, then email api-support@ok.ru with app ID + needed permissions (VALUABLE_ACCESS, GROUP_CONTENT, PHOTO_CONTENT, LONG_ACCESS_TOKEN) and use case; cost: Free; scheduling: Yes - publishAt inside the attachment JSON ('YYYY-MM-DD HH:MM:SS'); limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with OK OAuth 2.0 (connect.ok.ru/oauth/authorize) and grants permission; the app then posts for them. Yes - mediatopic.post to the user's own feed or groups they admin, once OK support grants the permissions.  
   _scopes: VALUABLE_ACCESS;GROUP_CONTENT;PHOTO_CONTENT;VIDEO_CONTENT;LONG_ACCESS_TOKEN; review to open to other users: Permissions granted manually by OK support (api-support@ok.ru); app approval; token lifetime: Standard OAuth access_token ~30 min; with LONG_ACCESS_TOKEN 30 days, auto-extended when used regularly; refresh_token available; needs server secret: Yes - application secret key used to derive session_secret_key = md5(access_token + application_secret_key) for MD5 request signatures_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: SMMplanner.
4. **Siri Shortcut**: Not practical directly (MD5 signature + token). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### VK
*Social network* · Can upload: Text, photos, video, clips, stories, live, audio, articles, polls · Docs: https://dev.vk.ru/en/method/wall.post

1. **Official API (your own account)**: Post to your own account with the official API (VK API): Wall posts, photos, video, docs.  
   _access: VK ID app or community token; cost: Free (reported 10k calls/month until business verification, unverified); scheduling: Yes — publish_date; limits: User token: 3 requests/s; community token: 20 requests/s; reported cap of ~50 wall posts per day per community; quantity limits on same-type methods are undisclosed (captcha/temporary block when exceeded)._
2. **User signs in, app posts for them**: The user signs in with VK ID (OAuth 2.1 + PKCE) and grants permission; the app then posts for them. Yes — wall posts, photos, video.  
   _scopes: wall photos video; review to open to other users: VK ID app: developer verification (individual: passport + face check on camera; business: VK Business ID with company details verified via bank or documents); token lifetime: ~1h + refresh; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: SMMplanner, Postiz, Make.
4. **Siri Shortcut**: Community token in one call  
   _ease: Easy_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (deferred posts).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Bilibili
*Video* · Can upload: Video, image/text posts, articles, live · Docs: https://openhome.bilibili.com/doc

1. **Official API (your own account)**: Post to your own account with the official API (Bilibili Open Platform): Video submission.  
   _access: Approved Open Platform developer (likely business) + user OAuth; cost: Free (unverified); scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Bilibili OAuth 2.0 (token: POST https://api.bilibili.com/x/account-oauth2/v1/token) and grants permission; the app then posts for them. Yes - video submission (arcopen/fn/archive: init -> upload -> complete -> add-by-utoken) for authorizing users, if the app has the submission capability.  
   _token lifetime: access_token with expires_in + refresh_token (exact durations unverified); needs server secret: Yes (client_secret)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: None (unofficial biliup CLI).
4. **Siri Shortcut**: Not practical directly (OAuth + approval). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (timed publish).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Dailymotion
*Video* · Can upload: Video, live (partners), playlists · Docs: https://developers.dailymotion.com/guides/upload/

1. **Official API (your own account)**: Post to your own account with the official API (Data API / Partner API): Video (upload URL → upload → publish), live events.  
   _access: Public API key created self-serve in Dailymotion Studio (Organization → API keys → Create API key, Owner/Admin role) + OAuth user token with manage_videos. Private API keys only work with partner.api.dailymotion.com.; cost: Free; scheduling: Unverified — publish_date field not confirmed in current docs; mandatory publish fields are url, title, is_created_for_kids (+ published=true); limits: Standard accounts: ≤2 h and ≤4 GB per video; 15 videos / 10 h total per 24 h. Verified Partners: no per-video limit, up to 96 videos/24 h. Check GET /user/<id>?fields=limits._
2. **User signs in, app posts for them**: The user signs in with Dailymotion OAuth 2.0 (public API key) and grants permission; the app then posts for them. Yes — the user's channel.  
   _scopes: manage_videos; review to open to other users: None documented; token lifetime: 10h access + refresh; needs server secret: Yes_
3. **Siri Shortcut**: Several API steps  
   _ease: Medium_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Douyin
*Video* · Can upload: Short video, image posts, live · Docs: https://developer.open-douyin.com/

1. **Official API (your own account)**: Post to your own account with the official API (Douyin Open Platform): Video publish (video.create), may be limited to approved apps.  
   _access: Open Platform app (Chinese entity, unverified) + scope approval; cost: Free; scheduling: No schedule parameter found in public docs (native creator-center timed publish only); limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Douyin OAuth 2.0 (open.douyin.com/platform/oauth/connect) and grants permission; the app then posts for them. Yes - video publish to the authorizing user's account with video.create scope (app must hold the capability).  
   _scopes: user_info,video.create; token lifetime: access_token 15 days; refresh_token 30 days (refresh does not extend refresh_token); needs server secret: Yes (client_secret for token exchange)_
3. **Siri Shortcut**: Not practical directly (OAuth). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Built-in scheduler**: Schedule inside the platform itself: Yes.
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Kuaishou / Kwai
*Video* · Can upload: Short video, live · Docs: https://open.kuaishou.com

1. **Official API (your own account)**: Post to your own account with the official API (Kuaishou Open Platform (China)): Video create/publish (China; international unverified).  
   _access: Developer app + OAuth + review; cost: Free (unverified); scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Kuaishou OAuth 2.0 (open.kuaishou.com) and grants permission; the app then posts for them. Yes (China) - video publish via Open Platform content-publishing API for authorizing users; international Kwai has no public posting API found.  
   _needs server secret: Yes (app_secret)_
3. **Siri Shortcut**: Not practical directly (OAuth). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Partly unverified (Oct 2026 review)_

### Odysee
*Video* · Can upload: Video, audio, images, files, articles, live · Docs: https://lbry.tech/api/sdk

1. **Official API (your own account)**: Post to your own account with the official API (LBRY SDK (lbrynet JSON-RPC)): Any file via a self-run daemon + wallet.  
   _access: None (livestream needs 50 LBC); cost: Free (Small LBC blockchain fees); scheduling: No — release_time can only be set to the current or a past time; limits: Web upload ≤4 GB_
2. **User signs in, app posts for them**: The user signs in with None — no OAuth; posting is done by a self-run lbrynet daemon holding the channel's wallet/keys and grants permission; the app then posts for them. Only for your own channel via your own lbrynet wallet (no third-party auth).
3. **Siri Shortcut**: Not practical (needs a local daemon)
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Snapchat
*Video* · Can upload: Snaps, Stories, Spotlight · Docs: https://developers.snap.com/marketing-api/Public-Profile-API/Introduction

1. **Official API (your own account)**: Post to your own account with the official API (Public Profile API (allowlist)): Stories, Saved Stories, Spotlight (allowlisted apps only).  
   _access: Public Profile API is allowlist-only: create an OAuth app in Snap Business Manager, email your Snap point of contact the OAuth client ID and intended use; cost: Unverified; scheduling: No; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Snap Login Kit / Public Profile API and grants permission; the app then posts for them. Limited — allowlisted apps; otherwise Creative Kit (user taps share).  
   _scopes: snapchat-profile-api; review to open to other users: Allowlist via Snap partner contact; token lifetime: 1h access + refresh; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Later, Ayrshare, Metricool, OneUp, Sked Social.
4. **Siri Shortcut**: Share sheet only
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### TikTok
*Video* · Can upload: Short video, photo posts, Stories, live · Docs: https://developers.tiktok.com/doc/content-posting-api-get-started

1. **Official API (your own account)**: Post to your own account with the official API (Content Posting API): Videos, photo posts (direct or to drafts).  
   _access: App review (Login Kit + Content Posting API) then Content Posting audit for public posting. Unaudited clients: max 5 users posting per 24h, accounts must be private at posting time, content SELF_ONLY only; cost: Free; scheduling: No (no scheduled-publish parameter in Direct Post; agent holds posts until due); limits: Per-creator Direct Post cap typically ~15 posts/24h (shared across all API clients); per-client daily active-creator cap set from audit estimates_
2. **User signs in, app posts for them**: The user signs in with TikTok Login Kit and grants permission; the app then posts for them. Yes — direct post or to the user's drafts.  
   _scopes: video.publish and/or video.upload; review to open to other users: App review + Content Posting audit (before: private posts only, 5 users/day); token lifetime: Access token 24h; refresh token 365 days (refresh without user consent); needs server secret: Yes (client secret)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Later, Publer, Metricool, Ayrshare.
4. **Siri Shortcut**: Not practical directly (Share sheet or webhook). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (TikTok Studio web, 10 days).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Vimeo
*Video* · Can upload: Video, live (paid), showcases · Docs: https://developer.vimeo.com/api/upload/videos

1. **Official API (your own account)**: Post to your own account with the official API (Vimeo API): Video (resumable, form, or pull from URL), thumbnails, captions, metadata.  
   _access: Self-serve app at developer.vimeo.com/apps. Upload access is automatic for paid plans; free-plan developers must click 'Request Additional Access' under Permissions → Upload Access (manual review, up to 5 business days).; cost: Free (Free API; paid plans get higher limits); scheduling: No (core API has no publish-at field; workaround: upload with privacy.view=nobody/unlisted, then PATCH privacy at the desired time from the agent's own scheduler); limits: Rolling 15-min window by plan: Basic/Free 250, Plus 250, Pro 500, Business 1,000 requests (x-ratelimit-* headers; 429 when exceeded). Upload storage/quota depends on plan (see GET /me upload_quota)._
2. **User signs in, app posts for them**: The user signs in with Vimeo OAuth 2.0 and grants permission; the app then posts for them. Yes — the user's videos.  
   _scopes: upload (+ public private edit); review to open to other users: Upload access review if your developer account is on the free plan; token lifetime: Historically non-expiring; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Zapier (Upload Video), Make/n8n (unverified).
4. **Siri Shortcut**: One API call with a personal token (pull upload from a link)  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### YouTube
*Video* · Can upload: Long video, Shorts, live, Community posts · Docs: https://developers.google.com/youtube/v3/docs/videos/insert

1. **Official API (your own account)**: Post to your own account with the official API (YouTube Data API v3): Videos (Shorts are ordinary uploads ≤3 min, vertical/square; no Shorts flag), thumbnails, captions, playlists, live broadcasts (liveBroadcasts API). Not Community/text/image posts..  
   _access: Google OAuth (youtube.upload is a sensitive scope; Testing mode OK for own account). Projects created after 28 Jul 2020 that haven't passed the YouTube API compliance audit have all uploads forced to private.; cost: Free; scheduling: Yes — status.publishAt (only while privacyStatus=private and the video has never been public); limits: Since 1 Jun 2026 granular quota: videos.insert has its own bucket of 100 calls/day (1 unit per upload); search.list its own 100/day; 10,000 units/day for all other endpoints. Increases via quota extension form (requires compliance audit)._
2. **User signs in, app posts for them**: The user signs in with Google OAuth 2.0 and grants permission; the app then posts for them. Yes — the user's channel.  
   _scopes: youtube.upload; review to open to other users: Google OAuth app verification for sensitive scope (Testing mode: max 100 test users, refresh tokens expire 7 days after consent) + YouTube API Services compliance audit, otherwise uploads stay private; token lifetime: 1h access; refresh token; needs server secret: For long-lived access_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Later, Publer, Metricool, Ayrshare, n8n, Zapier.
4. **Siri Shortcut**: Not practical directly (No upload action; share sheet or webhook). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (YouTube Studio).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### PeerTube
*Video (federated)* · Can upload: Video, live, playlists · Docs: https://docs.joinpeertube.org/api-rest-reference.html

1. **Official API (your own account)**: Post to your own account with the official API (PeerTube REST API (per server)): Video (incl. resumable), live, import by URL, playlists.  
   _access: Account on a server; OAuth password grant (client id/secret from GET /api/v1/oauth-clients/local); x-peertube-otp header if 2FA is on; cost: Free (Open source); scheduling: Yes — scheduleUpdate; limits: Per-server quota_
2. **User signs in, app posts for them**: The user signs in with Password grant only and grants permission; the app then posts for them. Limited — app must handle the user's password.  
   _scopes: Full account; review to open to other users: None; token lifetime: Access token 1 day, refresh token 2 weeks (refresh with grant_type=refresh_token); needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Fedica, n8n (HTTP).
4. **Siri Shortcut**: Two POSTs for a token, then multipart upload  
   _ease: Medium_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (private → scheduled public).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Verified against official docs (Oct 2026 review)_

### Pinterest
*Visual* · Can upload: Image Pins, video Pins, idea Pins, boards · Docs: https://developers.pinterest.com/docs/api/v5/pins-create/

1. **Official API (your own account)**: Post to your own account with the official API (API v5): Image and video Pins.  
   _access: App request approval → Trial access (Pins sandbox-only, visible only to creator) → Standard access via upgrade request with a video of the OAuth flow + a Pin being created (required even for single-user apps; Postman/terminal recordings accepted); cost: Free; scheduling: No (no publish-at parameter for organic Pins in v5; agent holds Pins until due); limits: Trial: 1,000 requests/day per app universal cap plus per-category caps (pin creation in write category ~300/day); Standard: per-minute per-user limits_
2. **User signs in, app posts for them**: The user signs in with Pinterest OAuth 2.0 and grants permission; the app then posts for them. Yes — the user's boards.  
   _scopes: pins:write, boards:read; review to open to other users: Standard access review (Trial pins are sandbox-only); token lifetime: Access token 30 days; refresh token 365 days (continuous refresh available); needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Ayrshare, Later, Buffer, Hootsuite.
4. **Siri Shortcut**: Not practical directly (OAuth needed — use a scheduler). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes — up to 30 days ahead, max 10 scheduled Pins at a time.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Clubhouse
*Audio* · Can upload: Product pivoted (2023) from drop-in live audio rooms to asynchronous voice chats among friends/groups; live rooms/Houses still exist in the app · Docs: https://www.clubhouse.com

1. **Built-in scheduler**: Schedule inside the platform itself: Yes for live events (create event with name, date/time, co-hosts); voice messages cannot be scheduled.
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Medium
*Blog* · Can upload: Articles, images, embeds · Docs: https://help.medium.com/hc/en-us/articles/213480228-API-Importing

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Official import tool: Stories > Import a story from a URL (backdates + adds canonical link); outbound RSS available.
2. **Built-in scheduler**: Schedule inside the platform itself: Yes: Publish > Schedule for later; publishes within ~5 min of set time (local timezone); edits before publish time are included.
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Naver Blog
*Blog* · Can upload: Blog posts, clips (Naver Post service is being shut down; Naver focusing on Blog) · Docs: https://developers.naver.com/

1. **Built-in scheduler**: Schedule inside the platform itself: Yes: SmartEditor ONE publish options include 예약 발행 (scheduled publish).
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Patreon
*Creator* · Can upload: Posts (text, image, video, audio, polls), shop · Docs: https://docs.patreon.com/

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Official podcast RSS sync: Settings > Podcast and audio > New podcast > Sync with another platform; new episodes auto-sync from your host (publish immediately or as drafts); audio only, video not imported.
2. **Built-in scheduler**: Schedule inside the platform itself: Yes: post editor > set publish date/time (web and mobile); scheduled posts listed in Library.
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Lemon8
*Lifestyle* · Can upload: Photo carousels, ≤60s video, text+image posts · Docs: https://www.lemon8-app.com

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: None; TikTok account login and in-app content repurposing between TikTok and Lemon8 exist, but no API.
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Partly unverified (Oct 2026 review)_

### Xiaohongshu (RedNote)
*Lifestyle* · Can upload: Image notes, video notes, live · Docs: https://open.xiaohongshu.com/

1. **Built-in scheduler**: Schedule inside the platform itself: Yes: creator web platform creator.xiaohongshu.com supports image/video/long-form notes, batch upload, drafts and 定时发布 (scheduled publishing).
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Messenger
*Messaging* · Can upload: Messages, photos, video · Docs: https://developers.facebook.com/docs/messenger-platform/send-messages

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Inbox tools only.
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Signal
*Messaging* · Can upload: Messages, media, stories · Docs: https://support.signal.org/hc/articles/5365881590682-Schedule-a-Message-on-Signal-Android (signal-cli is unofficial)

1. **Siri Shortcut**: Manual send only
2. **Built-in scheduler**: Schedule inside the platform itself: Yes on Android only: long-press send > schedule; queued on device (device must be on); not on Desktop/iOS.
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Gab
*Microblog* · Can upload: Text, images, video, groups · Docs: https://gab.com

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: None found: mainstream schedulers (Buffer, Publer, Postiz, Ayrshare, Metricool, Later) do not list Gab.
2. **Siri Shortcut**: Not practical directly (Manual share-sheet to the Gab app/web; token route is unofficial). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard (no sanctioned API)_
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Partly unverified (Oct 2026 review)_

### Gettr
*Microblog* · Can upload: Text, images, video, live; company reported mass layoffs and near-shutdown in 2024; current operating status unclear · Docs: https://gettr.com

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Partly unverified (Oct 2026 review)_

### Truth Social
*Microblog* · Can upload: Text, images, video · Docs: https://www.globenewswire.com/news-release/2025/09/09/3146910/0/en/Truth-Social-Enhances-Platform.html

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: None verified (FS Poster claim unverified and would rely on unofficial access).
2. **Siri Shortcut**: Not practical directly (Unofficial). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
3. **Built-in scheduler**: Schedule inside the platform itself: Yes — 'Schedule Truths' is a premium feature for Patriot Package (Truth+) subscribers (announced 9 Sep 2025).
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Substack
*Newsletter* · Can upload: Posts, newsletters, podcasts, video, Notes · Docs: https://support.substack.com/hc/en-us/articles/360037870412-How-do-I-schedule-a-post-for-a-future-date

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Official post importer: Settings > Import/Export > Import posts (WordPress, Medium, Ghost, Mailchimp, Beehiiv, Tumblr, Blogspot, or any RSS feed); podcast import by RSS; Buffer offers Notes scheduling.
2. **Built-in scheduler**: Schedule inside the platform itself: Yes: posts scheduled in editor; Notes scheduling native since 2026 (up to ~3 months, one at a time).
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### BeReal
*Photo* · Can upload: Dual-camera daily photo, captions · Docs: https://bereal.com

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Spotify for Creators
*Podcast* · Can upload: Audio/video podcast episodes, polls, Q&A · Docs: https://support.spotify.com/us/creators/article/publishing-audio-episodes/

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Via your podcast host.
2. **Built-in scheduler**: Schedule inside the platform itself: Yes: set a scheduled publish time for audio and video episodes.
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Behance
*Portfolio* · Can upload: Projects (images, video), moodboards, livestreams · Docs: https://www.behance.net/dev

1. **Built-in scheduler**: Schedule inside the platform itself: Yes with Behance Pro: Project Scheduling in Advanced Project Settings.
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Quora
*Q&A* · Can upload: Questions, answers, posts in Spaces · Docs: https://help.quora.com/hc/en-us/articles/360000470706-Platform-Policies

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Minds
*Social network* · Can upload: Text, images, video, blogs, groups · Docs: https://gitlab.com/minds

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: None found among mainstream schedulers.
2. **Siri Shortcut**: Not practical directly (Session login). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
3. **Built-in scheduler**: Schedule inside the platform itself: Yes — post scheduler built into Minds for channels and groups (shipped ~2019).
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Likee
*Video* · Can upload: Short video, live · Docs: https://likee.video

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Rumble
*Video* · Can upload: Video, live · Docs: https://rumblefaq.groovehq.com/help/how-to-use-rumble-s-live-stream-api

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Outbound auto syndication from Rumble to YouTube/Facebook/Vimeo; YouTube-to-Rumble sync no longer works (blocked).
2. **Built-in scheduler**: Schedule inside the platform itself: Yes: schedule publish in Upload Video > Visibility; livestreams schedulable in Rumble Studio.
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

### Triller
*Video* · Can upload: App non-functional since Dec 2025 (fails to load videos), $0 media revenue 2025, delisted by Nasdaq; treat as defunct · Docs: https://en.wikipedia.org/wiki/Triller_(app)

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search (Oct 2026 review)_

