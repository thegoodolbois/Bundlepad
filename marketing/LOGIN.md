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
| Binance Square | No third-party login — user pastes a personal key | Limited — with the user's own key | — | None | Until the user regenerates the key | Yes (keep the key secret) |
| Blogger | Google OAuth 2.0 (same consent can include YouTube + Business Profile) | Yes — blogs the user writes for | blogger | Google OAuth verification | Same as YouTube | For long-lived access |
| Bluesky | atproto OAuth (PAR + PKCE + DPoP) | Yes — the user's account | atproto transition:generic (or granular repo:app.bsky.feed.post) | None | Browser sessions 2 weeks; longer with a backend | No |
| Dailymotion | Dailymotion OAuth 2.0 (public API key) | Yes — the user's channel | manage_videos | None documented | 10h access + refresh | Yes |
| DeviantArt | DeviantArt OAuth 2.0 | Yes — Sta.sh submit + publish | stash publish (unverified) | None known | 1h + ~3-month refresh | Yes |
| Discord | Discord OAuth2 with webhook.incoming | Yes — the user picks a channel and you get its webhook | webhook.incoming | None | Webhook URL doesn't expire | Yes (client secret) |
| Facebook Pages | Facebook Login (PKCE supported) | Yes — Pages the user manages (not personal profiles) | pages_manage_posts, pages_read_engagement, pages_show_list | App Review (Advanced Access) + usually Business Verification; before that only app roles/testers | Page token from a long-lived user token doesn't expire | Recommended |
| Farcaster | Sign In With Farcaster + signer approval (or Neynar managed signer) | Yes — via a signer the user approves | Signer (all message types) | None (needs your app's own Farcaster ID) | Until the user revokes the signer | Yes (signer/API key) |
| Flickr | OAuth 1.0a | Yes — photos and video | perms=write | Key request needs Flickr Pro; commercial keys reviewed | Until revoked | Yes (request signing) |
| Ghost | No user OAuth — Admin API key per site | Limited — with the site owner's key | — | None | Key until revoked | Yes (JWT signing) |
| Google Business Profile | Google OAuth 2.0 | Yes — the user's business locations | business.manage | API access application (~14 days) + OAuth verification | Same as YouTube | For long-lived access |
| Hive | Posting-key authority (e.g. via HiveSigner/Keychain) | Yes — signed by the user's key | Posting authority | None | Until revoked | No |
| Imgur | Imgur OAuth 2.0 | No for new apps — registration closed Aug 2026 | — | Closed to new apps | ~1 month + refresh | — |
| Instagram | Instagram Login or Facebook Login | Yes — Business/Creator accounts only | instagram_business_basic, instagram_business_content_publish | App Review + likely Business Verification; testers only before | 60-day long-lived token, refreshable | Yes |
| KakaoTalk | Kakao Login | Limited — 'send to me' chat; Kakao Story API ended | talk_message | Review for friend messaging | 6h + ~2-month refresh | Yes |
| Lemmy | Username/password login → JWT | Limited — app must handle the user's password | Full account | None | JWT session | No |
| Lens | Wallet sign-in (SIWE) | Yes — as account owner/manager | Account Manager | Register your app address | 10-min access, 7-day refresh | No |
| LINE | LINE Login (OAuth + OIDC, PKCE) | No — no API for user timeline posts; share picker only | profile openid | — | 30 days | — |
| LinkedIn | Sign In with LinkedIn (OIDC) + Share on LinkedIn | Yes — personal profile; company pages need Community Management API | w_member_social (w_organization_social for pages) | None for personal; pages need an approved application | 60 days, no refresh (re-login every 60 days) | Yes (client secret) |
| Mastodon / Fediverse | Mastodon OAuth (register app per server; PKCE from 4.3) | Yes — the user's account | write:statuses write:media | None | Tokens don't expire until revoked | No |
| MeWe | MeWe OAuth (beta) | Yes — timeline and groups | Unverified | Developer program approval | Unverified | Yes |
| Nextdoor | Nextdoor OAuth (Publish API) | Yes — once access is granted | Publish | Publish API access request | Unverified | Yes |
| Nostr | NIP-07 extension or NIP-46 remote signer | Yes — the user's signer signs each post | Per-connection permissions | None | Until revoked | No |
| Patreon | Patreon OAuth 2.0 | No — no post-creation endpoint | — | — | — | — |
| PeerTube | Password grant only | Limited — app must handle the user's password | Full account | None | Access + refresh | No |
| Pinterest | Pinterest OAuth 2.0 | Yes — the user's boards | pins:write, boards:read | Standard access review (Trial pins are sandbox-only) | 30-day access; 60-day rolling refresh | Yes |
| Pixelfed | Mastodon-compatible OAuth per server | Yes | read write | None | Long-lived | No |
| Reddit | Reddit OAuth2 | Yes — the user's account | submit, identity | Manual approval (Responsible Builder Policy) | 1h; refresh with duration=permanent | Optional (installed-app type) |
| Snapchat | Snap Login Kit / Public Profile API | Limited — allowlisted apps; otherwise Creative Kit (user taps share) | snapchat-profile-api | Allowlist via Snap partner contact | 1h access + refresh | Yes |
| SoundCloud | OAuth 2.1 + PKCE (secret also needed) | Yes — track uploads | User access | Self-serve, but the developer needs Artist Pro | 1h; single-use refresh | Yes |
| Telegram | Log In With Telegram (OIDC + PKCE) for identity | Limited — the user adds your bot as channel admin; posts appear as the channel | Channel admin right: post messages | None | Until the bot is removed | Yes (bot token) |
| Threads | Threads OAuth | Yes — the user's own profile | threads_basic, threads_content_publish | Own + tester accounts without review; App Review for everyone | 60-day token, refresh after 24h | Yes |
| TikTok | TikTok Login Kit | Yes — direct post or to the user's drafts | video.publish and/or video.upload | App review + Content Posting audit (before: private posts only, 5 users/day) | 24h access; 365-day refresh | Yes (client secret) |
| Tumblr | Tumblr OAuth 2 | Yes — the user's blogs | basic write offline_access | None documented | 1h; refresh with offline_access | Yes |
| Twitch | Twitch OAuth (public client possible) | No uploads — clips and channel info only | clips:edit, channel:manage:broadcast | None | ~4h, refreshable | No |
| Vimeo | Vimeo OAuth 2.0 | Yes — the user's videos | upload (+ public private edit) | Upload access review if your developer account is on the free plan | Historically non-expiring | Yes |
| VK | VK ID (OAuth 2.1 + PKCE) | Yes — wall posts, photos, video | wall photos video | VK ID business app with passport details and approval | ~1h + refresh | Yes |
| Weibo | Weibo OAuth 2.0 | Limited — statuses/share with your domain link only | Default | Real-name developer verification + app review | No refresh for web apps | Yes |
| WhatsApp | Embedded Signup (Facebook Login for Business) | Limited — messages as the business, not posts | whatsapp_business_management, whatsapp_business_messaging | Tech Provider + Business Verification + App Review | System-user token (long-lived) | Yes |
| WordPress (.com and self-hosted) | WordPress.com OAuth 2.0; self-hosted: application passwords | Yes — posts, pages, media | global or per-site; posts, media | None | Implicit 2 weeks; server long-lived | Optional |
| X (Twitter) | OAuth 2.0 + PKCE (public client, no secret possible) | Yes — the user's own account | tweet.write tweet.read users.read media.write offline.access | No app review; developer account + Project | 2h access; refresh with offline.access | No (but API calls may need a proxy) |
| YouTube | Google OAuth 2.0 | Yes — the user's channel | youtube.upload | Google OAuth verification (100-user cap before; Testing mode refresh tokens last 7 days) + YouTube audit or uploads stay private | 1h access; refresh token | For long-lived access |

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
