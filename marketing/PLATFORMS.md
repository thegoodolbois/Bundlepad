# Every platform, every way to automate posting

Covers 71 platforms, researched 2026-10-07. For each one, this page lists
what you can upload, whether an API exists, what the API can upload, whether
it's free, whether users can sign in and let an app post for them, and
**every route to automate posting**, best first.

- **Machine-readable data:** [`data/platforms.json`](data/platforms.json)
  (each platform has an `automation_options` list) and
  [`data/platforms.csv`](data/platforms.csv).
- **For agents:** start with [AGENT-GUIDE.md](AGENT-GUIDE.md).

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
| [Blogger](#blogger) | Blog | Yes | Free | Posts and pages (publish/schedule) | Yes — blogs the user writes for | Hard |
| [Tumblr](#tumblr) | Blog | Yes | Free | All post types (NPF) | Yes — the user's blogs | Hard |
| [WordPress (.com and self-hosted)](#wordpress-com-and-self-hosted) | Blog | Yes | Free | Posts, pages, media | Yes — posts, pages, media | Easy (self-hosted) / Hard (.com) |
| [Ghost](#ghost) | Blog/newsletter | Yes | Free tier + paid | Posts, pages, images, media, newsletters | Limited — with the site owner's key | Hard |
| [Discord](#discord) | Community | Yes | Free | Text, embeds, files, polls | Yes — the user picks a channel and you get its webhook | Easy |
| [Reddit](#reddit) | Community | Yes | Free tier + paid | Text, link, image posts; comments | Yes — the user's account | Hard |
| [Lemmy](#lemmy) | Community (federated) | Yes | Free | Posts, comments, images | Limited — app must handle the user's password | Easy |
| [Binance Square](#binance-square) | Crypto social | Yes | Free (unverified) | Text, up to 4 images, articles, video | Limited — with the user's own key | Medium |
| [Farcaster](#farcaster) | Decentralized social | Yes | Free tier + paid | Text, embeds, replies, channels | Yes — via a signer the user approves | Medium |
| [Lens](#lens) | Decentralized social | Yes | Unverified | Posts with media metadata | Yes — as account owner/manager | Hard |
| [Nostr](#nostr) | Decentralized social | Yes | Free | Anything as signed events to relays | Yes — the user's signer signs each post | Hard |
| [Dribbble](#dribbble) | Design | Yes | Free | Shots (upload scope) | Unverified | Hard |
| [Imgur](#imgur) | Image | Yes | Free (non-commercial) | Images, video, albums, gallery posts | No for new apps — registration closed Aug 2026 | Easy (existing apps only) |
| [Nextdoor](#nextdoor) | Local | Yes | Free (unverified) | Neighbor/business/agency posts, events, listings | Yes — once access is granted | Easy |
| [Google Business Profile](#google-business-profile) | Local business | Yes | Free | Posts, media, review replies | Yes — the user's business locations | Hard |
| [KakaoTalk](#kakaotalk) | Messaging | Yes | Free tier + paid | No API for Channel posts; business messages via paid dealers | Limited — 'send to me' chat; Kakao Story API ended | — |
| [LINE](#line) | Messaging | Yes | Free tier + paid | Push/broadcast messages (text, image, video, audio, flex) | No — no API for user timeline posts; share picker only | Easy |
| [Messenger](#messenger) | Messaging | Yes | Free | Replies within 24h only; broadcasts mostly deprecated (Feb 2026) | Unverified | — |
| [Telegram](#telegram) | Messaging | Yes | Free | Text, photos, video, albums, files, polls to channels/groups | Limited — the user adds your bot as channel admin; posts appear as the channel | Easy |
| [Viber](#viber) | Messaging | Yes | Free (channels; unverified) | Channel posts by URL media | Unverified | Easy |
| [WhatsApp](#whatsapp) | Messaging | Yes | Paid | 1:1 template/session messages only; Channel posts are manual | Limited — messages as the business, not posts | Easy (manual send) |
| [WeChat](#wechat) | Messaging/publishing | Yes | Free | Official Accounts: media, drafts, publish (verified Chinese entity required to publish) | Unverified | Hard |
| [Bluesky](#bluesky) | Microblog | Yes | Free | Text, images, video, link cards, threads | Yes — the user's account | Easy |
| [Gab](#gab) | Microblog | Yes | Free | Statuses and media (unverified) | Unverified | Easy |
| [Mastodon / Fediverse](#mastodon--fediverse) | Microblog | Yes | Free | Text, media, polls, threads | Yes — the user's account | Easy |
| [Threads](#threads) | Microblog | Yes | Free | Text, images, video, carousels (≤20), polls, links, quotes | Yes — the user's own profile | Easy |
| [Weibo](#weibo) | Microblog | Yes | Free | Only statuses/share: ≤140 chars + image, must contain your bound domain URL | Limited — statuses/share with your domain link only | Hard |
| [X (Twitter)](#x-twitter) | Microblog | Yes | Paid | Text, images, video, polls, threads, links | Yes — the user's own account | Hard |
| [Flickr](#flickr) | Photo | Yes | Free tier + paid | Photos, video, metadata, albums | Yes — photos and video | Hard |
| [Pixelfed](#pixelfed) | Photo (federated) | Yes | Free | Media + posts | Yes | Easy |
| [Apple Podcasts](#apple-podcasts) | Podcast | Yes | Free | Episodes via your RSS feed; Delegated Delivery for participating hosts | Unverified | — |
| [LinkedIn](#linkedin) | Professional | Yes | Free | Text, images, video, articles, carousels, polls | Yes — personal profile; company pages need Community Management API | Hard |
| [Facebook Pages](#facebook-pages) | Social network | Yes | Free | Text, links, photos, video | Yes — Pages the user manages (not personal profiles) | Medium |
| [Instagram](#instagram) | Social network | Yes | Free | Images, video, Reels, Stories, carousels (≤10) | Yes — Business/Creator accounts only | Medium |
| [MeWe](#mewe) | Social network | Yes | Free (unverified) | Timeline and group posts with photos | Yes — timeline and groups | Hard |
| [Minds](#minds) | Social network | Yes | Free | Posts via unofficial clients | Unverified | Hard |
| [OK.ru](#okru) | Social network | Yes | Free | Media topics with text, photos, links, polls | Unverified | Hard |
| [VK](#vk) | Social network | Yes | Free (reported 10k calls/month until business verification, unverified) | Wall posts, photos, video, docs | Yes — wall posts, photos, video | Easy |
| [Bilibili](#bilibili) | Video | Yes | Free (unverified) | Video submission | Unverified | Hard |
| [Dailymotion](#dailymotion) | Video | Yes | Free | Video (upload URL → upload → publish), live events | Yes — the user's channel | Medium |
| [Douyin](#douyin) | Video | Yes | Free | Video publish (video.create), may be limited to approved apps | Unverified | Hard |
| [Kuaishou / Kwai](#kuaishou--kwai) | Video | Yes | Free (unverified) | Video create/publish (China; international unverified) | Unverified | Hard |
| [Odysee](#odysee) | Video | Yes | Free | Any file via a self-run daemon + wallet | Unverified | — |
| [Snapchat](#snapchat) | Video | Yes | Unverified | Stories, Spotlight video (allowlisted apps only) | Limited — allowlisted apps; otherwise Creative Kit (user taps share) | — |
| [TikTok](#tiktok) | Video | Yes | Free | Videos, photo posts (direct or to drafts) | Yes — direct post or to the user's drafts | Hard |
| [Vimeo](#vimeo) | Video | Yes | Free | Video (resumable, form, or pull from URL), thumbnails, captions, metadata | Yes — the user's videos | Easy |
| [YouTube](#youtube) | Video | Yes | Free | Videos and Shorts (by format), live broadcasts; not Community posts | Yes — the user's channel | Hard |
| [PeerTube](#peertube) | Video (federated) | Yes | Free | Video (incl. resumable), live, import by URL, playlists | Limited — app must handle the user's password | Medium |
| [Pinterest](#pinterest) | Visual | Yes | Free | Image and video Pins | Yes — the user's boards | Hard |
| [Clubhouse](#clubhouse) | Audio | No | — | Nothing | No (no posting API) | — |
| [Medium](#medium) | Blog | No | — | Nothing for new users | No (no posting API) | — |
| [Naver Blog](#naver-blog) | Blog | No | — | Nothing | No (no posting API) | — |
| [Patreon](#patreon) | Creator | Partial | Free | Posting not supported | No — no post-creation endpoint | — |
| [Lemon8](#lemon8) | Lifestyle | No | — | Nothing | No (no posting API) | — |
| [Xiaohongshu (RedNote)](#xiaohongshu-rednote) | Lifestyle | No | — | Nothing | No (no posting API) | — |
| [Kick](#kick) | Live video | Partial | Free | No uploads; title/category, chat | No (no posting API) | — |
| [Twitch](#twitch) | Live video | Partial | Free | No uploads; titles, schedule, chat, polls, clips | No uploads — clips and channel info only | — |
| [Signal](#signal) | Messaging | No | — | Nothing official | No (no posting API) | — |
| [Gettr](#gettr) | Microblog | No | — | Nothing | No (no posting API) | — |
| [Truth Social](#truth-social) | Microblog | No | — | Unofficial only | No (no posting API) | Hard |
| [Substack](#substack) | Newsletter | No | — | Nothing | No (no posting API) | — |
| [BeReal](#bereal) | Photo | No | — | Nothing | No (no posting API) | — |
| [Spotify for Creators](#spotify-for-creators) | Podcast | No | — | Nothing (RSS from your host; video distribution for partner hosts only) | No (no posting API) | — |
| [Behance](#behance) | Portfolio | No | — | Nothing | No (no posting API) | — |
| [Quora](#quora) | Q&A | No | — | Nothing | No (no posting API) | — |
| [Likee](#likee) | Video | No | — | Nothing | No (no posting API) | — |
| [Rumble](#rumble) | Video | No | — | Nothing — uploads are manual | No (no posting API) | — |
| [Triller](#triller) | Video | No | — | Nothing | No (no posting API) | — |

## Platform by platform

The numbered routes are in order of preference. The **Manual** route is
always available.

### DeviantArt
*Art* · Can upload: Art, literature, journals, status updates · Docs: https://www.deviantart.com/developers/

1. **Official API (your own account)**: Post to your own account with the official API (DeviantArt API v1): Sta.sh submit + publish deviations.  
   _access: App + OAuth2; cost: Free; scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with DeviantArt OAuth 2.0 and grants permission; the app then posts for them. Yes — Sta.sh submit + publish.  
   _scopes: stash publish (unverified); review to open to other users: None known; token lifetime: 1h + ~3-month refresh; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Isekai Core (self-hosted, unofficial).
4. **Siri Shortcut**: Not practical directly (OAuth). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### SoundCloud
*Audio* · Can upload: Tracks, playlists, albums · Docs: https://developers.soundcloud.com/docs/api

1. **Official API (your own account)**: Post to your own account with the official API (SoundCloud API): Tracks (≤4 GB), metadata, playlists.  
   _access: Self-serve app registration for Artist Pro subscribers; OAuth 2.1 + PKCE; cost: Paid (developer needs Artist Pro); scheduling: Unverified; limits: ~1h tokens, single-use refresh_
2. **User signs in, app posts for them**: The user signs in with OAuth 2.1 + PKCE (secret also needed) and grants permission; the app then posts for them. Yes — track uploads.  
   _scopes: User access; review to open to other users: Self-serve, but the developer needs Artist Pro; token lifetime: 1h; single-use refresh; needs server secret: Yes_
3. **Siri Shortcut**: Not practical directly (OAuth with short-lived tokens). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Built-in scheduler**: Schedule inside the platform itself: Yes (Artist Pro, private tracks).
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official help via search_

### Hive
*Blockchain social* · Can upload: Long-form posts, comments, images, video (3Speak) · Docs: https://developers.hive.io/

1. **Official API (your own account)**: Post to your own account with the official API (Hive JSON-RPC): Posts and comments signed with your posting key.  
   _access: Hive account + posting key; cost: Free (Uses Resource Credits (staked HP)); scheduling: No; limits: ~5 min between root posts (unverified)_
2. **User signs in, app posts for them**: The user signs in with Posting-key authority (e.g. via HiveSigner/Keychain) and grants permission; the app then posts for them. Yes — signed by the user's key.  
   _scopes: Posting authority; review to open to other users: None; token lifetime: Until revoked; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: PeakD, HiveVote.
4. **Siri Shortcut**: Not practical directly (Needs key signing). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (PeakD).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Blogger
*Blog* · Can upload: Posts, pages, images, embedded video · Docs: https://developers.google.com/blogger/docs/3.0/reference/posts/publish

1. **Official API (your own account)**: Post to your own account with the official API (Blogger API v3): Posts and pages (publish/schedule).  
   _access: Google OAuth (blogger scope); cost: Free; scheduling: Yes — posts.publish with publishDate; limits: ~10,000 requests/day (unverified)_
2. **User signs in, app posts for them**: The user signs in with Google OAuth 2.0 (same consent can include YouTube + Business Profile) and grants permission; the app then posts for them. Yes — blogs the user writes for.  
   _scopes: blogger; review to open to other users: Google OAuth verification; token lifetime: Same as YouTube; needs server secret: For long-lived access_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Zapier/Make (unverified).
4. **Siri Shortcut**: Not practical directly (Google OAuth). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Tumblr
*Blog* · Can upload: Text, photos, video, audio, links, quotes, chat posts · Docs: https://www.tumblr.com/docs/en/api/v2

1. **Official API (your own account)**: Post to your own account with the official API (API v2): All post types (NPF).  
   _access: OAuth; cost: Free; scheduling: Yes — state=queue + publish_on; limits: 250 posts/day; 1,000 queued_
2. **User signs in, app posts for them**: The user signs in with Tumblr OAuth 2 and grants permission; the app then posts for them. Yes — the user's blogs.  
   _scopes: basic write offline_access; review to open to other users: None documented; token lifetime: 1h; refresh with offline_access; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Unverified.
4. **Siri Shortcut**: Not practical directly (OAuth needed). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (queue).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### WordPress (.com and self-hosted)
*Blog* · Can upload: Posts, pages, media, comments · Docs: https://developer.wordpress.com/docs/api/

1. **Official API (your own account)**: Post to your own account with the official API (WordPress REST API): Posts, pages, media.  
   _access: WordPress.com: OAuth app; self-hosted: application password; cost: Free; scheduling: Yes — status=future + date; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with WordPress.com OAuth 2.0; self-hosted: application passwords and grants permission; the app then posts for them. Yes — posts, pages, media.  
   _scopes: global or per-site; posts, media; review to open to other users: None; token lifetime: Implicit 2 weeks; server long-lived; needs server secret: Optional_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Publer, Jetpack Social, Zapier, n8n.
4. **Siri Shortcut**: Self-hosted: one call with an application password  
   _ease: Easy (self-hosted) / Hard (.com)_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Ghost
*Blog/newsletter* · Can upload: Posts, pages, newsletters, images, media · Docs: https://docs.ghost.org/admin-api

1. **Official API (your own account)**: Post to your own account with the official API (Admin API): Posts, pages, images, media, newsletters.  
   _access: Admin API key (signs a 5-min JWT); cost: Free tier + paid (Free self-hosted; Ghost(Pro) above Starter for custom integrations); scheduling: Yes — status=scheduled + published_at; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with No user OAuth — Admin API key per site and grants permission; the app then posts for them. Limited — with the site owner's key.  
   _review to open to other users: None; token lifetime: Key until revoked; needs server secret: Yes (JWT signing)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Zapier.
4. **Siri Shortcut**: Not practical directly (Needs JWT signing (helper needed)). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Discord
*Community* · Can upload: Messages, images, video, files, polls, threads, events · Docs: https://docs.discord.com/developers/resources/webhook

1. **Official API (your own account)**: Post to your own account with the official API (Webhooks + bot API): Text, embeds, files, polls.  
   _access: Webhook URL (no review); cost: Free; scheduling: No; limits: ~5 requests/2s per webhook_
2. **User signs in, app posts for them**: The user signs in with Discord OAuth2 with webhook.incoming and grants permission; the app then posts for them. Yes — the user picks a channel and you get its webhook.  
   _scopes: webhook.incoming; review to open to other users: None; token lifetime: Webhook URL doesn't expire; needs server secret: Yes (client secret)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: n8n, Postiz, Zapier, IFTTT.
4. **Siri Shortcut**: One call to the webhook URL  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Reddit
*Community* · Can upload: Text, links, images, video, polls · Docs: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki

1. **Official API (your own account)**: Post to your own account with the official API (Data API (approval required)): Text, link, image posts; comments.  
   _access: Explicit approval (Responsible Builder Policy, Nov 2025); cost: Free tier + paid (Free 100 queries/min; commercial use needs a paid agreement); scheduling: No; limits: 100 QPM_
2. **User signs in, app posts for them**: The user signs in with Reddit OAuth2 and grants permission; the app then posts for them. Yes — the user's account.  
   _scopes: submit, identity; review to open to other users: Manual approval (Responsible Builder Policy); token lifetime: 1h; refresh with duration=permanent; needs server secret: Optional (installed-app type)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Ayrshare, n8n.
4. **Siri Shortcut**: Not practical directly (OAuth needed — use a scheduler). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official help pages via search_

### Lemmy
*Community (federated)* · Can upload: Link, text, image posts; comments · Docs: https://join-lemmy.org/api/main

1. **Official API (your own account)**: Post to your own account with the official API (Lemmy HTTP API (per server)): Posts, comments, images.  
   _access: Log in with username/password → JWT; cost: Free; scheduling: Unverified; limits: 6 posts/10 min default_
2. **User signs in, app posts for them**: The user signs in with Username/password login → JWT and grants permission; the app then posts for them. Limited — app must handle the user's password.  
   _scopes: Full account; review to open to other users: None; token lifetime: JWT session; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Lemmy Schedule, Poster.ly, Postiz.
4. **Siri Shortcut**: Login POST then Bearer call  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Binance Square
*Crypto social* · Can upload: Posts, images, articles, video, live · Docs: https://github.com/binance/binance-skills-hub

1. **Official API (your own account)**: Post to your own account with the official API (Square OpenAPI): Text, up to 4 images, articles, video.  
   _access: Key from Creator Center; cost: Free (unverified); scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with No third-party login — user pastes a personal key and grants permission; the app then posts for them. Limited — with the user's own key.  
   _review to open to other users: None; token lifetime: Until the user regenerates the key; needs server secret: Yes (keep the key secret)_
3. **Siri Shortcut**: One API call with the key header  
   _ease: Medium_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official repo via search_

### Farcaster
*Decentralized social* · Can upload: Text casts, images, links, channels, mini apps · Docs: https://docs.neynar.com/docs/integrate-managed-signers

1. **Official API (your own account)**: Post to your own account with the official API (via Neynar API): Text, embeds, replies, channels.  
   _access: Neynar key + signer approved once; cost: Free tier + paid (Free 200K compute units; $9–$249/mo plans); scheduling: No; limits: Plan-based_
2. **User signs in, app posts for them**: The user signs in with Sign In With Farcaster + signer approval (or Neynar managed signer) and grants permission; the app then posts for them. Yes — via a signer the user approves.  
   _scopes: Signer (all message types); review to open to other users: None (needs your app's own Farcaster ID); token lifetime: Until the user revokes the signer; needs server secret: Yes (signer/API key)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Postiz.
4. **Siri Shortcut**: One API call with key + signer  
   _ease: Medium_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Mixed official/3rd-party_

### Lens
*Decentralized social* · Can upload: Posts, images, video metadata · Docs: https://lens.xyz/docs/protocol/best-practices/transaction-lifecycle

1. **Official API (your own account)**: Post to your own account with the official API (Lens API/SDK): Posts with media metadata.  
   _access: Wallet signature; cost: Unverified; scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Wallet sign-in (SIWE) and grants permission; the app then posts for them. Yes — as account owner/manager.  
   _scopes: Account Manager; review to open to other users: Register your app address; token lifetime: 10-min access, 7-day refresh; needs server secret: No_
3. **Siri Shortcut**: Not practical directly (Not practical). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Mostly unverified_

### Nostr
*Decentralized social* · Can upload: Text notes, images/video by URL, long-form · Docs: https://d-central.tech/nostr-nips-reference/

1. **Official API (your own account)**: Post to your own account with the official API (Protocol (no company API)): Anything as signed events to relays.  
   _access: Your private key; cost: Free (Some relays charge); scheduling: No; limits: Per relay_
2. **User signs in, app posts for them**: The user signs in with NIP-07 extension or NIP-46 remote signer and grants permission; the app then posts for them. Yes — the user's signer signs each post.  
   _scopes: Per-connection permissions; review to open to other users: None; token lifetime: Until revoked; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Postiz.
4. **Siri Shortcut**: Not practical directly (Not directly (needs signing)). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Protocol docs via search_

### Dribbble
*Design* · Can upload: Shots (images, GIF, video), projects · Docs: https://developer.dribbble.com/v2/

1. **Official API (your own account)**: Post to your own account with the official API (API v2): Shots (upload scope).  
   _access: OAuth2; upload may need Pro (unverified); cost: Free; scheduling: No; limits: Unverified_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: TimeToPost (3rd-party claim).
3. **Siri Shortcut**: Not practical directly (OAuth (feasible with a pasted long-lived token)). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Imgur
*Image* · Can upload: Images, GIFs, short video, albums, gallery posts · Docs: https://apidocs.imgur.com/

1. **Official API (your own account)**: Post to your own account with the official API (Imgur API v3): Images, video, albums, gallery posts.  
   _access: New app registration closed (Aug 2026); existing apps keep working; cost: Free (non-commercial) (Non-commercial free; commercial terms unverified); scheduling: No; limits: ~12,500 requests/day per app_
2. **Siri Shortcut**: Anonymous upload with Client-ID is one call; account posting needs OAuth  
   _ease: Easy (existing apps only)_
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Docs via search_

### Nextdoor
*Local* · Can upload: Posts, photos, video, events, For Sale & Free · Docs: https://developer.nextdoor.com/docs/sharing-overview

1. **Official API (your own account)**: Post to your own account with the official API (Publish API (access by request)): Neighbor/business/agency posts, events, listings.  
   _access: Request Publish API access; cost: Free (unverified); scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Nextdoor OAuth (Publish API) and grants permission; the app then posts for them. Yes — once access is granted.  
   _scopes: Publish; review to open to other users: Publish API access request; token lifetime: Unverified; needs server secret: Yes_
3. **Siri Shortcut**: Bearer token once access is granted  
   _ease: Easy_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Google Business Profile
*Local business* · Can upload: Posts (updates, offers, events), photos, video, review replies · Docs: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/create

1. **Official API (your own account)**: Post to your own account with the official API (Business Profile API (v4 localPosts)): Posts, media, review replies.  
   _access: Apply for API access (allowlist form, ~14 days) + Google OAuth (business.manage); cost: Free; scheduling: Partial — recurring posts only; limits: Quota is 0 until approved_
2. **User signs in, app posts for them**: The user signs in with Google OAuth 2.0 and grants permission; the app then posts for them. Yes — the user's business locations.  
   _scopes: business.manage; review to open to other users: API access application (~14 days) + OAuth verification; token lifetime: Same as YouTube; needs server secret: For long-lived access_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Publer, Hootsuite, SocialPilot.
4. **Siri Shortcut**: Not practical directly (OAuth + allowlist). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (built-in scheduler, 2026).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### KakaoTalk
*Messaging* · Can upload: Channel posts, messages; Kakao Story (API ended 2023) · Docs: https://developers.kakao.com/docs/latest/en/kakaotalk-channel/common

1. **Official API (your own account)**: Post to your own account with the official API (Kakao Channel API): No API for Channel posts; business messages via paid dealers.  
   _access: Biz app + Korean business registration; cost: Free tier + paid (Dealer messages paid per message); scheduling: No; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Kakao Login and grants permission; the app then posts for them. Limited — 'send to me' chat; Kakao Story API ended.  
   _scopes: talk_message; review to open to other users: Review for friend messaging; token lifetime: 6h + ~2-month refresh; needs server secret: Yes_
3. **Built-in scheduler**: Schedule inside the platform itself: Yes.
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### LINE
*Messaging* · Can upload: Official Account messages/broadcasts (LINE VOOM shut down Sept 2026) · Docs: https://developers.line.biz/en/reference/messaging-api/

1. **Official API (your own account)**: Post to your own account with the official API (Messaging API): Push/broadcast messages (text, image, video, audio, flex).  
   _access: Official Account + Messaging API channel; cost: Free tier + paid (Japan: free 200 msgs/month; ¥5,000 for 5,000; ¥15,000+ with overage); scheduling: No; limits: Monthly plan cap_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: respond.io and CRM tools.
3. **Siri Shortcut**: Long-lived channel token, one broadcast call  
   _ease: Easy_
4. **Built-in scheduler**: Schedule inside the platform itself: Yes (scheduled broadcasts).
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Messenger
*Messaging* · Can upload: Messages, photos, video · Docs: https://developers.facebook.com/docs/messenger-platform/send-messages

1. **Official API (your own account)**: Post to your own account with the official API (Send API): Replies within 24h only; broadcasts mostly deprecated (Feb 2026).  
   _access: Page + App Review; cost: Free; scheduling: No_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Inbox tools only.
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Telegram
*Messaging* · Can upload: Messages, photos, video, files, polls, stories, channels · Docs: https://core.telegram.org/bots/api

1. **Official API (your own account)**: Post to your own account with the official API (Bot API): Text, photos, video, albums, files, polls to channels/groups.  
   _access: Bot token from @BotFather; bot is channel admin; cost: Free; scheduling: No; limits: ~1 msg/s per chat; 20/min in groups_
2. **User signs in, app posts for them**: The user signs in with Log In With Telegram (OIDC + PKCE) for identity and grants permission; the app then posts for them. Limited — the user adds your bot as channel admin; posts appear as the channel.  
   _scopes: Channel admin right: post messages; review to open to other users: None; token lifetime: Until the bot is removed; needs server secret: Yes (bot token)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Ayrshare, n8n, Postiz, IFTTT.
4. **Siri Shortcut**: One API call with the bot token  
   _ease: Easy_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (in apps).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Viber
*Messaging* · Can upload: Channel posts (text, photos, video, files, polls), bot messages · Docs: https://developers.viber.com/docs/tools/channels-post-api/

1. **Official API (your own account)**: Post to your own account with the official API (Channels Post API / Bot API): Channel posts by URL media.  
   _access: Channel super admin token + webhook with SSL; cost: Free (channels; unverified) (Bot chats may be paid); scheduling: No; limits: Unverified_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: SMMplanner, postmypost.
3. **Siri Shortcut**: Static auth-token header, one call  
   _ease: Easy_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### WhatsApp
*Messaging* · Can upload: Messages, photos, video, status, Channels · Docs: https://developers.facebook.com/docs/whatsapp/pricing

1. **Official API (your own account)**: Post to your own account with the official API (Cloud API (no Channels API)): 1:1 template/session messages only; Channel posts are manual.  
   _access: Meta Business + WhatsApp Business account; cost: Paid (Per delivered template (~$0.025 US marketing)); scheduling: No; limits: Messaging tiers_
2. **User signs in, app posts for them**: The user signs in with Embedded Signup (Facebook Login for Business) and grants permission; the app then posts for them. Limited — messages as the business, not posts.  
   _scopes: whatsapp_business_management, whatsapp_business_messaging; review to open to other users: Tech Provider + Business Verification + App Review; token lifetime: System-user token (long-lived); needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Hootsuite (inbox).
4. **Siri Shortcut**: Open URL wa.me/?text=… (prefill, tap send)  
   _ease: Easy (manual send)_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official pages via search_

### WeChat
*Messaging/publishing* · Can upload: Official Account articles, images, video, audio; Channels short video, live · Docs: https://developers.weixin.qq.com/doc/offiaccount/en/Getting_Started/Overview.html

1. **Official API (your own account)**: Post to your own account with the official API (Official Account API (no Channels API)): Official Accounts: media, drafts, publish (verified Chinese entity required to publish).  
   _access: Verified corporate/sole-proprietor account; IP whitelist; cost: Free (Account verification ~¥300/yr (unverified)); scheduling: No; limits: 1 mass send/day (subscription accounts)_
2. **Siri Shortcut**: Not practical directly (appid+secret token + IP whitelist). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
3. **Built-in scheduler**: Schedule inside the platform itself: Yes (scheduled mass send).
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Bluesky
*Microblog* · Can upload: Text, photos, video, links, threads · Docs: https://docs.bsky.app/docs/get-started

1. **Official API (your own account)**: Post to your own account with the official API (AT Protocol): Text, images, video, link cards, threads.  
   _access: App password or OAuth; no review; cost: Free; scheduling: No; limits: 5,000 points/h (~1,666 posts)_
2. **User signs in, app posts for them**: The user signs in with atproto OAuth (PAR + PKCE + DPoP) and grants permission; the app then posts for them. Yes — the user's account.  
   _scopes: atproto transition:generic (or granular repo:app.bsky.feed.post); review to open to other users: None; token lifetime: Browser sessions 2 weeks; longer with a backend; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Typefully, Ayrshare, Postiz.
4. **Siri Shortcut**: Two API calls with an app password  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Gab
*Microblog* · Can upload: Text, images, video, groups · Docs: https://gab.com

1. **Official API (your own account)**: Post to your own account with the official API (Mastodon-style API (no maintained docs)): Statuses and media (unverified).  
   _access: Developer app in settings; cost: Free; scheduling: Possibly scheduled_at (unverified); limits: Unverified_
2. **Siri Shortcut**: Bearer token, one call (if it still works)  
   _ease: Easy_
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Mastodon / Fediverse
*Microblog* · Can upload: Text, photos, video, audio, polls · Docs: https://docs.joinmastodon.org/methods/statuses/

1. **Official API (your own account)**: Post to your own account with the official API (Mastodon API): Text, media, polls, threads.  
   _access: Token from your server's settings; no review; cost: Free; scheduling: Yes — scheduled_at; limits: 300 requests / 5 min_
2. **User signs in, app posts for them**: The user signs in with Mastodon OAuth (register app per server; PKCE from 4.3) and grants permission; the app then posts for them. Yes — the user's account.  
   _scopes: write:statuses write:media; review to open to other users: None; token lifetime: Tokens don't expire until revoked; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Typefully, Postiz, Mixpost.
4. **Siri Shortcut**: One API call with a token (can schedule)  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Threads
*Microblog* · Can upload: Text, photos, video, carousels, polls, GIFs, links · Docs: https://developers.facebook.com/docs/threads/posts

1. **Official API (your own account)**: Post to your own account with the official API (Threads API): Text, images, video, carousels (≤20), polls, links, quotes.  
   _access: OAuth threads_content_publish; cost: Free; scheduling: No; limits: 250 API posts / 24h_
2. **User signs in, app posts for them**: The user signs in with Threads OAuth and grants permission; the app then posts for them. Yes — the user's own profile.  
   _scopes: threads_basic, threads_content_publish; review to open to other users: Own + tester accounts without review; App Review for everyone; token lifetime: 60-day token, refresh after 24h; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Sprout, Ayrshare, IFTTT, Publer.
4. **Siri Shortcut**: Open URL threads.com/intent/post?text=… (one tap)  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Weibo
*Microblog* · Can upload: Text, images, video, live, articles · Docs: https://open.weibo.com/wiki/

1. **Official API (your own account)**: Post to your own account with the official API (Weibo Open Platform): Only statuses/share: ≤140 chars + image, must contain your bound domain URL.  
   _access: Real-name developer verification + app review (likely China identity); cost: Free; scheduling: No; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Weibo OAuth 2.0 and grants permission; the app then posts for them. Limited — statuses/share with your domain link only.  
   _scopes: Default; review to open to other users: Real-name developer verification + app review; token lifetime: No refresh for web apps; needs server secret: Yes_
3. **Siri Shortcut**: Not practical directly (OAuth + domain binding). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Built-in scheduler**: Schedule inside the platform itself: Yes (scheduled posts).
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### X (Twitter)
*Microblog* · Can upload: Text, photos, video, GIFs, polls, threads, live (Spaces) · Docs: https://docs.x.com/x-api/getting-started/pricing

1. **Official API (your own account)**: Post to your own account with the official API (X API v2): Text, images, video, polls, threads, links.  
   _access: Developer account; OAuth 2.0 or 1.0a; cost: Paid (Pay-per-use: ~$0.015 per post, ~$0.20 per post with a link; no free tier since Feb 2026); scheduling: No; limits: 2M post reads/month cap_
2. **User signs in, app posts for them**: The user signs in with OAuth 2.0 + PKCE (public client, no secret possible) and grants permission; the app then posts for them. Yes — the user's own account.  
   _scopes: tweet.write tweet.read users.read media.write offline.access; review to open to other users: No app review; developer account + Project; token lifetime: 2h access; refresh with offline.access; needs server secret: No (but API calls may need a proxy)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Typefully, Publer, Ayrshare, Postiz, Zapier, IFTTT.
4. **Siri Shortcut**: Not practical directly (IFTTT applet, or API with an OAuth token that expires every ~2h). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (web; reportedly Premium) / X Pro (Premium+).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: 3rd-party summaries of official docs_

### Flickr
*Photo* · Can upload: Photos, video, albums · Docs: https://www.flickr.com/services/api/

1. **Official API (your own account)**: Post to your own account with the official API (Flickr API): Photos, video, metadata, albums.  
   _access: OAuth 1.0a; cost: Free tier + paid (API key requests need a Flickr Pro subscription; commercial keys reviewed); scheduling: No; limits: 3,600 queries/hour (unverified)_
2. **User signs in, app posts for them**: The user signs in with OAuth 1.0a and grants permission; the app then posts for them. Yes — photos and video.  
   _scopes: perms=write; review to open to other users: Key request needs Flickr Pro; commercial keys reviewed; token lifetime: Until revoked; needs server secret: Yes (request signing)_
3. **Siri Shortcut**: Not practical directly (OAuth 1.0a signing). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official help via search_

### Pixelfed
*Photo (federated)* · Can upload: Photos, video, carousels, stories · Docs: https://docs.pixelfed.org/

1. **Official API (your own account)**: Post to your own account with the official API (Mastodon-compatible API): Media + posts.  
   _access: Personal access token from your server; cost: Free; scheduling: Unverified; limits: Per server_
2. **User signs in, app posts for them**: The user signs in with Mastodon-compatible OAuth per server and grants permission; the app then posts for them. Yes.  
   _scopes: read write; review to open to other users: None; token lifetime: Long-lived; needs server secret: No_
3. **Siri Shortcut**: Bearer token + multipart upload  
   _ease: Easy_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Apple Podcasts
*Podcast* · Can upload: Podcast episodes (audio/video) via RSS · Docs: https://podcasters.apple.com/support/823-podcast-requirements

1. **Official API (your own account)**: Post to your own account with the official API (RSS feed / Delegated Delivery (hosts only)): Episodes via your RSS feed; Delegated Delivery for participating hosts.  
   _access: Podcasts Connect account; cost: Free; scheduling: Via your host; limits: Feed requirements_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Any podcast host.
3. **Siri Shortcut**: Edit a self-hosted RSS feed
4. **Built-in scheduler**: Schedule inside the platform itself: Yes (pubDate / host).
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### LinkedIn
*Professional* · Can upload: Text, photos, video, documents, articles, polls, newsletters · Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin

1. **Official API (your own account)**: Post to your own account with the official API (Posts API / Share on LinkedIn): Text, images, video, articles, carousels, polls.  
   _access: Personal: self-serve; company pages: access request; cost: Free; scheduling: Unverified; limits: 150 req/member/day_
2. **User signs in, app posts for them**: The user signs in with Sign In with LinkedIn (OIDC) + Share on LinkedIn and grants permission; the app then posts for them. Yes — personal profile; company pages need Community Management API.  
   _scopes: w_member_social (w_organization_social for pages); review to open to other users: None for personal; pages need an approved application; token lifetime: 60 days, no refresh (re-login every 60 days); needs server secret: Yes (client secret)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Ayrshare, n8n.
4. **Siri Shortcut**: Not practical directly (OAuth needed — use a scheduler). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (up to 3 months).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Facebook Pages
*Social network* · Can upload: Text, photos, video, Reels, Stories, links, live, events · Docs: https://developers.facebook.com/docs/pages-api/posts

1. **Official API (your own account)**: Post to your own account with the official API (Graph API (Pages API)): Text, links, photos, video.  
   _access: Meta developer app; App Review for pages_manage_posts; cost: Free; scheduling: Yes — scheduled_publish_time (10 min–30 days); limits: 4,800 calls × engaged users / 24h_
2. **User signs in, app posts for them**: The user signs in with Facebook Login (PKCE supported) and grants permission; the app then posts for them. Yes — Pages the user manages (not personal profiles).  
   _scopes: pages_manage_posts, pages_read_engagement, pages_show_list; review to open to other users: App Review (Advanced Access) + usually Business Verification; before that only app roles/testers; token lifetime: Page token from a long-lived user token doesn't expire; needs server secret: Recommended_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Ayrshare, n8n, IFTTT.
4. **Siri Shortcut**: API call with a stored Page token  
   _ease: Medium_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (Meta Business Suite).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Instagram
*Social network* · Can upload: Photos, video, Reels, Stories, carousels, live · Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing

1. **Official API (your own account)**: Post to your own account with the official API (Instagram Content Publishing API): Images, video, Reels, Stories, carousels (≤10).  
   _access: Business/Creator account; App Review; cost: Free; scheduling: No (schedulers hold the post); limits: 50 API posts / 24h; media must be at a public URL_
2. **User signs in, app posts for them**: The user signs in with Instagram Login or Facebook Login and grants permission; the app then posts for them. Yes — Business/Creator accounts only.  
   _scopes: instagram_business_basic, instagram_business_content_publish; review to open to other users: App Review + likely Business Verification; testers only before; token lifetime: 60-day long-lived token, refreshable; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Later, Hootsuite, Ayrshare.
4. **Siri Shortcut**: API call with a token (media hosted at a URL)  
   _ease: Medium_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (Meta Business Suite).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### MeWe
*Social network* · Can upload: Text, photos, video, groups, stories · Docs: https://docs.postiz.com/providers/mewe

1. **Official API (your own account)**: Post to your own account with the official API (Developer Program (limited beta)): Timeline and group posts with photos.  
   _access: Apply to developer program; cost: Free (unverified); scheduling: Unverified; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with MeWe OAuth (beta) and grants permission; the app then posts for them. Yes — timeline and groups.  
   _scopes: Unverified; review to open to other users: Developer program approval; token lifetime: Unverified; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Postiz.
4. **Siri Shortcut**: Not practical directly (OAuth (beta access)). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Minds
*Social network* · Can upload: Text, images, video, blogs, groups · Docs: https://gitlab.com/minds

1. **Official API (your own account)**: Post to your own account with the official API (unofficial/undocumented): Posts via unofficial clients.  
   _access: Login session; cost: Free; scheduling: Unofficial; limits: Unverified_
2. **Siri Shortcut**: Not practical directly (Session login). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
3. **Built-in scheduler**: Schedule inside the platform itself: Yes.
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### OK.ru
*Social network* · Can upload: Text, photos, video, Moments, live, polls · Docs: https://apiok.ru/en/dev/sdk/js/ui.postMediatopic/

1. **Official API (your own account)**: Post to your own account with the official API (OK REST API): Media topics with text, photos, links, polls.  
   _access: App + permissions requested from OK support; cost: Free; scheduling: Yes — publishAt; limits: Unverified_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: SMMplanner.
3. **Siri Shortcut**: Not practical directly (MD5 signature + token). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Built-in scheduler**: Schedule inside the platform itself: Yes.
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### VK
*Social network* · Can upload: Text, photos, video, clips, stories, live, audio, articles, polls · Docs: https://dev.vk.ru/en/method/wall.post

1. **Official API (your own account)**: Post to your own account with the official API (VK API): Wall posts, photos, video, docs.  
   _access: VK ID app or community token; cost: Free (reported 10k calls/month until business verification, unverified); scheduling: Yes — publish_date; limits: 3 requests/s per user token_
2. **User signs in, app posts for them**: The user signs in with VK ID (OAuth 2.1 + PKCE) and grants permission; the app then posts for them. Yes — wall posts, photos, video.  
   _scopes: wall photos video; review to open to other users: VK ID business app with passport details and approval; token lifetime: ~1h + refresh; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: SMMplanner, Postiz, Make.
4. **Siri Shortcut**: Community token in one call  
   _ease: Easy_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (deferred posts).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Bilibili
*Video* · Can upload: Video, image/text posts, articles, live · Docs: https://openhome.bilibili.com/doc

1. **Official API (your own account)**: Post to your own account with the official API (Bilibili Open Platform): Video submission.  
   _access: Approved Open Platform developer (likely business) + user OAuth; cost: Free (unverified); scheduling: Unverified; limits: Unverified_
2. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: None (unofficial biliup CLI).
3. **Siri Shortcut**: Not practical directly (OAuth + approval). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
4. **Built-in scheduler**: Schedule inside the platform itself: Yes (timed publish).
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Dailymotion
*Video* · Can upload: Video, live (partners), playlists · Docs: https://developers.dailymotion.com/guides/upload/

1. **Official API (your own account)**: Post to your own account with the official API (Data API / Partner API): Video (upload URL → upload → publish), live events.  
   _access: API key + OAuth user token; cost: Free; scheduling: Partial — publish_date field; limits: Daily upload quotas (figures unverified)_
2. **User signs in, app posts for them**: The user signs in with Dailymotion OAuth 2.0 (public API key) and grants permission; the app then posts for them. Yes — the user's channel.  
   _scopes: manage_videos; review to open to other users: None documented; token lifetime: 10h access + refresh; needs server secret: Yes_
3. **Siri Shortcut**: Several API steps  
   _ease: Medium_
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Douyin
*Video* · Can upload: Short video, image posts, live · Docs: https://developer.open-douyin.com/

1. **Official API (your own account)**: Post to your own account with the official API (Douyin Open Platform): Video publish (video.create), may be limited to approved apps.  
   _access: Open Platform app (Chinese entity, unverified) + scope approval; cost: Free; scheduling: Unverified; limits: Unverified_
2. **Siri Shortcut**: Not practical directly (OAuth). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
3. **Built-in scheduler**: Schedule inside the platform itself: Yes.
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Kuaishou / Kwai
*Video* · Can upload: Short video, live · Docs: https://open.kuaishou.com

1. **Official API (your own account)**: Post to your own account with the official API (Kuaishou Open Platform (China)): Video create/publish (China; international unverified).  
   _access: Developer app + OAuth + review; cost: Free (unverified); scheduling: Unverified; limits: Unverified_
2. **Siri Shortcut**: Not practical directly (OAuth). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Odysee
*Video* · Can upload: Video, audio, images, files, articles, live · Docs: https://lbry.tech/api/sdk

1. **Official API (your own account)**: Post to your own account with the official API (LBRY SDK (lbrynet JSON-RPC)): Any file via a self-run daemon + wallet.  
   _access: None (livestream needs 50 LBC); cost: Free (Small LBC blockchain fees); scheduling: Unverified; limits: Web upload ≤4 GB_
2. **Siri Shortcut**: Not practical (needs a local daemon)
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Snapchat
*Video* · Can upload: Snaps, Stories, Spotlight · Docs: https://developers.snap.com/marketing-api/Public-Profile-API/Introduction

1. **Official API (your own account)**: Post to your own account with the official API (Public Profile API (allowlist)): Stories, Spotlight video (allowlisted apps only).  
   _access: Allowlist via a Snap contact; cost: Unverified; scheduling: No; limits: Unverified_
2. **User signs in, app posts for them**: The user signs in with Snap Login Kit / Public Profile API and grants permission; the app then posts for them. Limited — allowlisted apps; otherwise Creative Kit (user taps share).  
   _scopes: snapchat-profile-api; review to open to other users: Allowlist via Snap partner contact; token lifetime: 1h access + refresh; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Later, Ayrshare, Metricool.
4. **Siri Shortcut**: Share sheet only
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### TikTok
*Video* · Can upload: Short video, photo posts, Stories, live · Docs: https://developers.tiktok.com/doc/content-posting-api-get-started

1. **Official API (your own account)**: Post to your own account with the official API (Content Posting API): Videos, photo posts (direct or to drafts).  
   _access: OAuth + audit (unaudited apps post privately, 5 users/day); cost: Free; scheduling: Unverified; limits: ~15 direct posts/day per account_
2. **User signs in, app posts for them**: The user signs in with TikTok Login Kit and grants permission; the app then posts for them. Yes — direct post or to the user's drafts.  
   _scopes: video.publish and/or video.upload; review to open to other users: App review + Content Posting audit (before: private posts only, 5 users/day); token lifetime: 24h access; 365-day refresh; needs server secret: Yes (client secret)_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Later, Publer, Metricool, Ayrshare.
4. **Siri Shortcut**: Not practical directly (Share sheet or webhook). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (TikTok Studio web, 10 days).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Vimeo
*Video* · Can upload: Video, live (paid), showcases · Docs: https://developer.vimeo.com/api/upload/videos

1. **Official API (your own account)**: Post to your own account with the official API (Vimeo API): Video (resumable, form, or pull from URL), thumbnails, captions, metadata.  
   _access: upload scope; automatic on paid plans, manual review (≤5 days) on free accounts; cost: Free (Free API; paid plans get higher limits); scheduling: Unverified; limits: 250 req/15 min (free), 1,000 (paid)_
2. **User signs in, app posts for them**: The user signs in with Vimeo OAuth 2.0 and grants permission; the app then posts for them. Yes — the user's videos.  
   _scopes: upload (+ public private edit); review to open to other users: Upload access review if your developer account is on the free plan; token lifetime: Historically non-expiring; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Zapier (Upload Video), Make/n8n (unverified).
4. **Siri Shortcut**: One API call with a personal token (pull upload from a link)  
   _ease: Easy_
5. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official help via search_

### YouTube
*Video* · Can upload: Long video, Shorts, live, Community posts · Docs: https://developers.google.com/youtube/v3/docs/videos/insert

1. **Official API (your own account)**: Post to your own account with the official API (YouTube Data API v3): Videos and Shorts (by format), live broadcasts; not Community posts.  
   _access: OAuth; uploads stay private until the app passes an audit; cost: Free; scheduling: Yes — status.publishAt; limits: 10,000 units/day; ~100 uploads/day bucket_
2. **User signs in, app posts for them**: The user signs in with Google OAuth 2.0 and grants permission; the app then posts for them. Yes — the user's channel.  
   _scopes: youtube.upload; review to open to other users: Google OAuth verification (100-user cap before; Testing mode refresh tokens last 7 days) + YouTube audit or uploads stay private; token lifetime: 1h access; refresh token; needs server secret: For long-lived access_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Buffer, Hootsuite, Later, Publer, Metricool, Ayrshare, n8n, Zapier.
4. **Siri Shortcut**: Not practical directly (No upload action; share sheet or webhook). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (YouTube Studio).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### PeerTube
*Video (federated)* · Can upload: Video, live, playlists · Docs: https://docs.joinpeertube.org/api-rest-reference.html

1. **Official API (your own account)**: Post to your own account with the official API (PeerTube REST API (per server)): Video (incl. resumable), live, import by URL, playlists.  
   _access: Account on a server; OAuth password grant; cost: Free (Open source); scheduling: Yes — scheduleUpdate; limits: Per-server quota_
2. **User signs in, app posts for them**: The user signs in with Password grant only and grants permission; the app then posts for them. Limited — app must handle the user's password.  
   _scopes: Full account; review to open to other users: None; token lifetime: Access + refresh; needs server secret: No_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Fedica, n8n (HTTP).
4. **Siri Shortcut**: Two POSTs for a token, then multipart upload  
   _ease: Medium_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (private → scheduled public).
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Pinterest
*Visual* · Can upload: Image Pins, video Pins, idea Pins, boards · Docs: https://developers.pinterest.com/docs/api/v5/pins-create/

1. **Official API (your own account)**: Post to your own account with the official API (API v5): Image and video Pins.  
   _access: OAuth; Trial then Standard access; cost: Free; scheduling: Unverified; limits: Trial 300 writes/day_
2. **User signs in, app posts for them**: The user signs in with Pinterest OAuth 2.0 and grants permission; the app then posts for them. Yes — the user's boards.  
   _scopes: pins:write, boards:read; review to open to other users: Standard access review (Trial pins are sandbox-only); token lifetime: 30-day access; 60-day rolling refresh; needs server secret: Yes_
3. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Ayrshare, Later, Buffer, Hootsuite.
4. **Siri Shortcut**: Not practical directly (OAuth needed — use a scheduler). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
5. **Built-in scheduler**: Schedule inside the platform itself: Yes (30 days, max 10) + RSS auto-publish.
6. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Clubhouse
*Audio* · Can upload: Voice chats, voicemails, audio rooms · Docs: https://www.clubhouse.com

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Medium
*Blog* · Can upload: Articles, images, embeds · Docs: https://github.com/Medium/medium-api-docs

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official GitHub_

### Naver Blog
*Blog* · Can upload: Blog posts, clips · Docs: https://developers.naver.com/

1. **Built-in scheduler**: Schedule inside the platform itself: Yes.
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Patreon
*Creator* · Can upload: Posts (text, image, video, audio, polls), shop · Docs: https://docs.patreon.com/

1. **Built-in scheduler**: Schedule inside the platform itself: Yes.
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official support via search_

### Lemon8
*Lifestyle* · Can upload: Photo carousels, ≤60s video, text+image posts · Docs: https://www.lemon8-app.com

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: 3rd-party_

### Xiaohongshu (RedNote)
*Lifestyle* · Can upload: Image notes, video notes, live · Docs: https://open.xiaohongshu.com/

1. **Built-in scheduler**: Schedule inside the platform itself: Yes.
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Kick
*Live video* · Can upload: Live streams, clips, chat · Docs: https://docs.kick.com

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Docs via search_

### Twitch
*Live video* · Can upload: Live streams, clips, VODs, chat · Docs: https://dev.twitch.tv/docs/api/reference

1. **Built-in scheduler**: Schedule inside the platform itself: Yes (stream schedule).
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official docs via search_

### Signal
*Messaging* · Can upload: Messages, media, stories · Docs: https://github.com/AsamK/signal-cli

1. **Siri Shortcut**: Manual send only
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: GitHub_

### Gettr
*Microblog* · Can upload: Text, images, video, live · Docs: https://gettr.com

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Truth Social
*Microblog* · Can upload: Text, images, video · Docs: https://www.globenewswire.com/news-release/2025/09/09/3146910/0/en/Truth-Social-Enhances-Platform.html

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: FS Poster (claimed).
2. **Siri Shortcut**: Not practical directly (Unofficial). Have the Shortcut call a scheduler's API or your own n8n/Zapier webhook instead.  
   _ease: Hard_
3. **Built-in scheduler**: Schedule inside the platform itself: Yes (paid feature).
4. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Substack
*Newsletter* · Can upload: Posts, newsletters, podcasts, video, Notes · Docs: https://support.substack.com/hc/en-us/articles/360037870412-How-do-I-schedule-a-post-for-a-future-date

1. **Built-in scheduler**: Schedule inside the platform itself: Yes (posts up to 3 months; Notes).
2. **Manual**: Post by hand in the app or website (always available).

_Reliability: Help center via search_

### BeReal
*Photo* · Can upload: Dual-camera daily photo, captions · Docs: https://bereal.com

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Spotify for Creators
*Podcast* · Can upload: Audio/video podcast episodes, polls, Q&A · Docs: https://support.spotify.com/us/creators/article/publishing-audio-episodes/

1. **Scheduler / automation tool**: Connect the account once in a tool that already has platform approval and schedule there: Via your podcast host.
2. **Built-in scheduler**: Schedule inside the platform itself: Yes (publish date).
3. **Manual**: Post by hand in the app or website (always available).

_Reliability: Official support via search_

### Behance
*Portfolio* · Can upload: Projects (images, video), moodboards, livestreams · Docs: https://www.behance.net/dev

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Adobe community via search_

### Quora
*Q&A* · Can upload: Questions, answers, posts in Spaces · Docs: https://help.quora.com/hc/en-us/articles/360000470706-Platform-Policies

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: 3rd-party_

### Likee
*Video* · Can upload: Short video, live · Docs: https://likee.video

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Rumble
*Video* · Can upload: Video, live · Docs: https://rumblefaq.groovehq.com/help/how-to-use-rumble-s-live-stream-api

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

### Triller
*Video* · Can upload: Short music video (app appears defunct since Dec 2025) · Docs: https://en.wikipedia.org/wiki/Triller_(app)

1. **Manual**: Post by hand in the app or website (always available).

_Reliability: Search snippets_

