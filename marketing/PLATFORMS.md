# Social platforms: posting automation, at a glance

Researched 2026-10-07. The full data, with 17 fields per platform (what you
can post, auth, limits, which schedulers support it, docs links), is in
[`data/platforms.csv`](data/platforms.csv) and
[`data/platforms.json`](data/platforms.json). The table below is the summary.
Explanations for each platform follow it.

**How sure is this?** Most official doc sites were blocked from the research
sandbox. Facts were taken from search-engine summaries of the official pages
where possible, and from third-party write-ups otherwise. The `verification`
column in the data says which. Prices and policies change often, so check the
linked page before you spend money or build on a claim.

**Siri Shortcuts column:**
- **Easy:** one or two "Get Contents of URL" calls with a key you paste in once
  ([SHORTCUTS.md](SHORTCUTS.md) has the recipes).
- **Medium:** works once a developer app or token is set up.
- **Hard:** needs OAuth refresh or a video upload. Use a scheduler or webhook
  instead.
- **—:** no way to post from a Shortcut.

| Platform | Posting API | API cost | Native scheduling | API scheduling | Siri Shortcuts | Paid crypto ads | Automation risk |
|---|---|---|---|---|---|---|---|
| X (Twitter) | Yes | Pay-per-use: ~$0.015/post, ~$0.20/post with a URL (since Apr 2026); Free tier discontinued Feb 2026 | Web composer schedule (reportedly Premium); X Pro (Premium+) | No (only the Ads API schedules) | Hard | Only with X certification + country licences; ICO/IDO-style token sales prohibited | High: scripting the website = suspension; must set the 'Automated' label; no duplicate posts |
| Bluesky | Yes | Free | No | No | Easy | No ad product; no specific crypto rule found (unverified) | Low with the API; spam and bulk interactions banned; bot self-label recommended |
| Mastodon / Fediverse | Yes | Free | Via apps | Yes: scheduled_at (≥5 min ahead) | Easy | No ad product; many servers ban commercial/promotional posting | Server rules: tick 'automated account'; server can suspend/defederate |
| Farcaster | Yes (via Neynar) | Neynar free tier (200K compute units); $9–$249/mo plans | No | No | Medium | No ad product; crypto-native audience | Low; spam labels cut reach |
| Nostr | Protocol only | Free (some relays paid) | No | No | Hard | No central rules | Minimal; leaked nsec = permanent identity loss |
| Lens | Yes | Unverified (likely gasless/sponsored) | No (unverified) | No (unverified) | Hard | App-level moderation | Unverified |
| Facebook Pages | Yes | Free | Meta Business Suite Planner | Yes: published=false + scheduled_publish_time (10 min–30 days) | Medium | ICOs banned outright; exchanges/wallets need prior written permission + licence — a token launch is very likely refused | Automated access without permission banned by Meta terms |
| Instagram | Yes | Free | Meta Business Suite Planner | No native parameter (schedulers hold posts) | Medium | Same as Meta (ICOs banned) | Automated collection/accounts banned without permission |
| Threads | Yes | Free | In-app scheduling reported (unverified) | No (schedulers hold posts) | Easy (intent) | Same as Meta (ICOs banned) | Same as Meta |
| WhatsApp | Partial | Per delivered template (~$0.025 US marketing) | Unverified | No | Easy (manual send) | Business Policy bans 'real, virtual or fake currency incl. ICOs' regardless of licence | Bulk/auto messaging and unofficial clients = bans |
| Messenger | Partial | Free | No | No | — | Same as Meta | Same as Meta |
| YouTube | Yes | Free | YouTube Studio scheduled publish | Yes: status.publishAt (private, never published) | Hard | Google Ads: certified exchanges/wallets only; DeFi/DEX/token offerings banned | Automated access outside the API banned |
| TikTok | Yes | Free | TikTok Studio (web, 10 days ahead) | Unverified | Hard | Crypto ads only with licence + rep pre-approval; branded crypto content banned | Scripts/scraping banned without approval |
| Snapchat | Allowlist only | Unverified | Unverified | No (unverified) | — | Financial products need prior approval; ICO ads banned since 2018 | Automated means banned |
| Twitch | Metadata only | Free | Stream schedule | Yes (schedule segments) | — | Branded content can't promote ICOs/get-rich-quick | Viewbots sued; ToS bans automation |
| Kick | Metadata only | Free | Unverified | Unverified | — | No specific crypto rule found; FTC disclosure required | ToS bans automated systems |
| Rumble | No (read-only live API) | Free | Unverified | No | — | No specific crypto policy found | Automation needs written permission |
| Telegram | Yes | Free | Yes, in apps (incl. channels) | No (schedule on your side) | Easy | No ad product here; ToS bans scams/spam | Userbots that DM strangers get limited; spam labels |
| Discord | Yes | Free | Scheduled events only | No | Easy | No ads; deceptive financial content banned | Self-bots (automating a user account) = termination |
| Reddit | Yes (approval required) | Free tier 100 QPM; commercial use needs permission | Mods only (scheduled & recurring posts) | No | Hard | Single-token/ICO/token-sale ads never allowed; exchanges/wallets with pre-approval | High: self-promotion bots and cross-posting are spam |
| LinkedIn | Yes | Free | Yes (10 min–3 months) | Unverified | Hard | Crypto is restricted content (details unread) | Bots that post/like/share banned |
| Pinterest | Yes | Free | Yes (30 days, max 10 scheduled) + RSS auto-publish | Unverified | Hard | Crypto generally prohibited; licensed exchanges/wallets with approval only | Get-rich-quick content banned; poor fit |
| Tumblr | Yes | Free (unverified) | Queue | Yes: state=queue + publish_on | Hard | ICO ads prohibited; exchanges/wallets need approval | Spam banned |
| Medium | No (closed to new integrations) | — | Unverified | — | — | Unverified | Unverified |
| Substack | No | — | Yes (posts up to 3 months; Notes since Apr 2026, 3rd-party) | — | — | Unverified | Unofficial API use = ToS risk (unverified) |
| Quora | No | — | No | — | — | Ads: exchanges/wallets/ICOs with disclosure; single tokens no | Promotional spam banned |
| Signal | No | — | Unverified | — | — | Unverified | Unofficial clients fragile/unsanctioned |
| Binance Square | Yes | Free (unverified) | Unverified | Unverified | Medium | Unverified | Unverified |
| pump.fun | No (unofficial only) | Free | No | No | — | n/a | Unofficial API use may break or violate terms (unverified) |

## What this means for a Bundlepad launch

1. **Free, simple, automatable from anywhere, even Siri:** Telegram (bot),
   Discord (webhook), Bluesky and Mastodon. Mastodon can even schedule through
   its API.
2. **Worth automating, but it costs money or setup:**
   - **X:** each API post costs money, and a post with a link costs about
     $0.20. You must label the account "Automated", and duplicate posts aren't
     allowed.
   - **Threads, Instagram and Facebook:** these need a Meta developer app and
     App Review. Threads also has a one-tap web intent link.
   - **Farcaster:** through the Neynar free tier.
   - **Binance Square:** has an official posting key.
3. **Video:** YouTube and TikTok have real upload APIs, but both force uploads
   private until your app passes an audit. Until then, schedule them through
   Buffer, Later, Publer or Metricool.
4. **Manual only:** Medium, Substack, Quora, Signal, Rumble and Snapchat
   (Snapchat's API is allowlist-only). On Twitch and Kick you can change only
   live-stream titles and categories, not post.
5. **Paid ads:** almost every major network bans ads for a single token or
   token sale:
   - **Banned:** Meta, Google/YouTube, Reddit, Pinterest and Snapchat (ICOs).
     TikTok bans branded crypto content.
   - **Only for licensed exchanges and wallets, with certification:** X,
     LinkedIn and Tumblr.

   Realistic paid options are crypto ad networks and crypto-native listings
   (see [CRYPTO-CHANNELS.md](CRYPTO-CHANNELS.md)). Read
   [COMPLIANCE.md](COMPLIANCE.md) first, especially the UK and EU rules.
6. **Never use browser bots or self-bots.** Every platform here bans
   automating the website or app without permission. Use the official APIs or
   a scheduler that uses them.

---

## Platform by platform

### X (Twitter)
- **Posting API:** API v2 `POST /2/tweets`. You can post text, media, polls,
  threads and links. As of 2026 it is pay-per-use, with no free tier: roughly
  $0.015 per post, and roughly $0.20 per post containing a URL.
- **Scheduling:** the API has no scheduling, so a scheduler has to hold the
  posts. In the app, scheduling reportedly needs Premium; X Pro needs Premium+.
- **Schedulers:** Typefully, Buffer, Hootsuite, Publer, Ayrshare and Postiz all
  post to X. Zapier needs you to bring your own paid X API access.
- **Siri:** an IFTTT applet triggered by a Shortcut is the simplest route.
  Calling the API directly means refreshing an OAuth token every ~2 hours,
  which Shortcuts can't do well.
- **Rules:**
  - Turn on the account's **"Automated" label**.
  - Never post the same text twice, or across several accounts.
  - Crypto ads need X certification plus licences for each country.
  - Token sales (ICOs and the like) are banned in ads.
  - Paid influencer crypto posts reportedly became allowed in March 2026 with a
    "Paid Partnership" label. Sources conflict, so treat it as unconfirmed.

### Bluesky
- **Posting API:** free, two HTTPS calls: `createSession`, then `createRecord`.
  You can post text, images, video, link cards and threads.
- **Scheduling:** neither the app nor the API schedules. Use Buffer (an
  official partner), Typefully, Ayrshare or Postiz.
- **Siri:** works directly. A Shortcut with an app password can post; see the
  recipe. Note that Bluesky prefers OAuth for new apps.
- **Rules:** no bulk interactions or automated follows. Self-label bot
  accounts. There is no crypto-specific rule.

### Mastodon / Fediverse
- **Posting API:** `POST /api/v1/statuses` on your server. It is free, and
  `scheduled_at` schedules posts natively, at least 5 minutes ahead.
- **Siri:** an easy single call that can include `scheduled_at`.
- **Rules:** tick "This is an automated account". Each server sets its own
  rules, and many ban promotion. Pick a crypto-friendly server, or run your
  own.

### Farcaster
- **Posting API:** through Neynar's API (Neynar reportedly acquired Farcaster
  in Jan 2026). You need an API key plus a "managed signer" that you approve
  once in the Farcaster app. The free tier is 200K compute units. The audience
  is crypto-native, so it's a good fit.
- **Scheduling:** none native. Postiz supports it.

### Nostr
- **How it works:** a protocol, not a company. You sign events with your
  private key and send them to relays. Postiz can schedule. It can't be done
  from Shortcuts directly.
- **Main risk:** a leaked key permanently loses the identity.

### Lens
- **Posting:** wallet-signed GraphQL posting. Third-party scheduler support
  isn't confirmed, so it's effectively manual unless you write code.

### Facebook Pages
- **Posting API:** Graph API `POST /{page-id}/feed`, for text, links, photos
  and video.
- **Scheduling:** the API **can schedule**, with `published=false` and
  `scheduled_publish_time`, from 10 minutes to 30 days ahead. Meta Business
  Suite's Planner also schedules natively.
- **Setup:** needs a Meta developer app, plus App Review for
  `pages_manage_posts`.
- **Rules:** Meta bans ICO ads outright. Crypto ads otherwise need prior
  written permission and a licence. Treat **paid** promotion of a token launch
  as not allowed.

### Instagram
- **Posting API:** the Content Publishing API, for images, video, Reels,
  Stories and carousels. It needs a Business or Creator account and App
  Review.
- **Limits:** 50 API posts a day. Media must be at a public URL first. Captions
  can't have clickable links.
- **Scheduling:** native through Business Suite. Through Buffer, Later or
  Hootsuite.

### Threads
- **Posting API:** a two-step publish, for text, images, video, carousels,
  polls and links. The limit is 250 API posts a day. The API can't schedule.
- **Siri:** the easiest route is the **web intent**. "Open URL"
  `https://www.threads.com/intent/post?text=...` opens a ready-to-send post,
  and you tap once.

### WhatsApp
- **Channels:** there's no official API, so posting is manual.
- **Cloud API:** sends paid 1:1 template messages to people who opted in. It
  isn't a broadcast tool.
- **Rules:** WhatsApp's Business Policy bans "real, virtual or fake currency,
  including ICOs" whatever licence you hold. Use it for personal sharing at
  most. For example, a `wa.me/?text=` link from a Shortcut prefills a message.

### Messenger
- **What it is:** a conversation API only. Marketing broadcasts were mostly
  deprecated in February 2026. Not a channel for announcements.

### YouTube (incl. Shorts)
- **Posting API:** `videos.insert`. Shorts are decided by format (vertical and
  short). It **can schedule**, with `status.publishAt` on a private video.
- **Audit:** unaudited API projects get their uploads forced private, so pass
  the audit or use Buffer, Later, Publer or Metricool.
- **Siri:** no upload action. Share to the app, or call an n8n or Zapier
  webhook.
- **Rules:** Google Ads bans DeFi, DEX and token offerings.

### TikTok
- **Posting API:** the Content Posting API, for videos and photo posts.
  Unaudited apps can only post privately, to at most 5 users a day.
- **Scheduling:** TikTok Studio on the web schedules up to 10 days ahead.
- **Rules:** paid crypto ads need a licence plus sales-rep approval. Branded
  creator content promoting crypto is banned. Treat TikTok as organic,
  educational content only.

### Snapchat
- **Posting API:** the Public Profile API is **allowlist-only**. Use Creative
  Kit or the share sheet, and Later or Ayrshare for scheduling.
- **Rules:** ICO ads have been banned since 2018.

### Twitch / Kick / Rumble
- **Twitch and Kick:** their APIs can change stream titles and categories,
  post chat, and (Twitch only) set the stream schedule. Neither can upload
  video.
- **Rumble:** has only a read-only live API, so upload by hand.
- **Rules:** Twitch bans branded content that promotes ICOs or get-rich-quick
  schemes.

### Telegram
- **Posting API:** the best automation target. Create a bot with @BotFather,
  add it as a channel admin, and send `POST /bot<TOKEN>/sendMessage` with
  `chat_id=@yourchannel`. It's free.
- **Limits:** about 1 message a second per chat, and 20 a minute in groups.
- **Scheduling:** the Telegram apps can schedule messages in channels. With
  the API, schedule on your side (cron, n8n, a Shortcut automation).
- **Siri:** one HTTPS call; see the recipe.
- **Rules:** no spam, no scams, and don't DM strangers from a user account.

### Discord
- **Posting API:** a channel **webhook** URL is all you need: POST JSON with
  `content` and up to 10 embeds. It's free. The API has no scheduling.
- **Siri:** one HTTPS call; see the recipe.
- **Rules:** never automate a normal user account (a "self-bot"); that leads
  to termination.

### Reddit
- **Posting API:** API access now needs **explicit approval** under the
  Responsible Builder Policy (November 2025). Only subreddit mods can schedule
  natively.
- **Rules:**
  - Ads for single tokens, ICOs or token sales are never allowed.
  - Self-promotion bots and cross-posting count as spam.
  - Post by hand, follow each subreddit's self-promotion rules, and take part
    in the community first.

### LinkedIn
- **Posting API:** posting as yourself is self-serve (`w_member_social`).
  Posting as a company page needs an access request from a registered
  business.
- **Scheduling:** native, from 10 minutes to 3 months ahead.
- **Rules:** crypto ads are restricted.

### Pinterest
- **Posting API:** API v5 `POST /v5/pins`. Native scheduling holds up to
  10 Pins, 30 days ahead, and RSS auto-publish is available.
- **Rules:** crypto ads are generally prohibited. It's a weak fit for a token
  launch.

### Tumblr
- **Posting API:** API v2 **supports scheduling**, with `state=queue` plus
  `publish_on`. The limit is 250 posts a day.
- **Rules:** ICO ads are prohibited.

### Medium / Substack / Quora / Signal
- **Medium:** the API is closed to new integrations, so post by hand.
- **Substack:** no API. Its web editor schedules posts, and reportedly Notes.
- **Quora:** no API. Promotional spam is banned. Quora ads allow ICOs with
  disclosures but not single tokens.
- **Signal:** no bot API. The unofficial `signal-cli` is fragile.

### Binance Square
- **Posting API:** an official posting key, created in Creator Center. Calls
  go to `POST …/pgc/openApi/content/add` with the `X-Square-OpenAPI-Key`
  header. You can post text, images, articles and video. The audience is
  crypto-native. Rate limits and content rules are unconfirmed.

### pump.fun
- **Posting:** comments and livestreams happen on the coin page. The only
  posting API is unofficial and undocumented, so post by hand.
