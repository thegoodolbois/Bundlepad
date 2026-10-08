# Agent guide: helping a user automate their content

You are an agent helping one person automate posting to their own social
accounts. Use this guide with [`data/platforms.json`](data/platforms.json).
Each entry there has an `automation_options` list, ordered best first.

## 1. Ask the user
1. **Which platforms?** Match their answer to `platform` in the JSON.
2. **What content?** Text, images, short video, long video, audio,
   articles. Check each platform's `content_types` and `api_can_upload`.
3. **How often, and when?** One-off, a fixed schedule, or triggered by an
   event, such as a new blog post or a new video.
4. **What do they already have?** A scheduler account (Buffer, Hootsuite…),
   a server or computer that's always on, an iPhone with Shortcuts, a budget.
5. **Their own accounts only, or other people's too?** Most platforms make
   apps that post to *other* people's accounts pass a review first. Posting
   to your own account is much easier.

## 2. Choose a route for each platform
For each platform, take the first route in `automation_options` that fits the
user's situation:

| Route | When to use it | What you need from the user |
|---|---|---|
| `official_api_own_account` | The user is fine creating a developer app or token | They create the app or token themselves (see §3). Never ask for their password |
| `user_sign_in_post_on_behalf` | You're building an app other people sign into, or one OAuth login for the user | A registered app, a redirect URL, and the review listed under `review_to_open_to_other_users` |
| `scheduler_or_automation_tool` | The platform needs app review or an audit, or the user wants a calendar | The user connects their account in the tool (Buffer, Postiz, n8n…). Then you post through the tool's API with one key |
| `siri_shortcut` | The user wants to post from their iPhone, by voice, or on a timer | See [SHORTCUTS.md](SHORTCUTS.md). Only "Easy" platforms work directly |
| `native_scheduler` | Occasional posts, no setup | Nothing. Schedule in the app |
| `manual` | No API exists | Prepare the content and the user posts it |

**Good default set-up for one person:**
- **One hub.** Self-hosted **Postiz** (free, 30+ platforms) or **Buffer**
  (cheap, API on every plan). Connect every platform the hub supports, then
  post through the hub's one API.
- **Direct for the simple ones.** Telegram (bot), Discord (webhook),
  Bluesky (app password), Mastodon (token), VK, Viber and LINE (static
  tokens): one HTTPS call each.
- **Video.** Upload to YouTube and TikTok through a scheduler that has passed
  their audits. An unaudited app's uploads are forced private.
- **Manual.** Prepare content for the rest (see the No-API list below).

## 3. Setting up "own account" API access, by common pattern
- **Static token or key** (Telegram bot, Discord webhook, Mastodon/Pixelfed
  token, Bluesky app password, VK community token, Viber channel token, LINE
  channel token, Vimeo personal token, self-hosted WordPress application
  password, Binance Square key):
  1. The user creates it in that platform's settings.
  2. You store it as a secret.
  3. You make one HTTPS call per post.
- **OAuth for your own account** (X, Threads, Facebook Pages, Instagram,
  LinkedIn, Pinterest, Tumblr, YouTube, TikTok, Reddit, Dailymotion,
  DeviantArt…):
  1. The user registers a developer app on the platform.
  2. They sign in once through it.
  3. You keep the refresh token and renew access before it expires (see
     `token_lifetime`).
  4. Most platforms let an app's own developer or testers use it **without
     review**. Exceptions: YouTube (private uploads until the audit passes),
     TikTok (private posts until the audit passes), Reddit (manual approval)
     and Pinterest (sandbox until Standard access). Google "Testing" mode
     sign-ins expire after 7 days.
- **Password-only** (PeerTube, Lemmy): these platforms have no OAuth for
  apps. Prefer a dedicated account, and tell the user the risk before
  storing a password.
- **Key signing** (Nostr, Farcaster, Hive, Lens): use the user's signer or
  extension (NIP-07/46, a Farcaster signer, Hive Keychain). Never hold the raw
  private key.

## 4. Login questions
- **"Sign in with Google" only covers Google services.** One Google consent
  can include YouTube (`youtube.upload`), Blogger (`blogger`) and Business
  Profile (`business.manage`). It can **never** grant posting rights on
  Facebook, Instagram, X, TikTok or any other platform. Each of those needs
  its own sign-in. See [LOGIN.md](LOGIN.md).
- **Browser-only (no server secret):** possible on X (PKCE public client),
  Bluesky, Nostr, Lens and Twitch. Most others need a small server to hold a
  client secret.

## 5. Rules to follow
- **Use only official APIs, webhooks, bots or tools built on them.** Every
  platform bans browser bots, scraping, and automating a normal user account
  ("self-bots"). Accounts get suspended for it.
- **Don't post the same text repeatedly** (X bans duplicates). Label
  automated accounts where the platform asks for it (X's "Automated" label,
  Mastodon's bot flag).
- **Keep secrets secret.** Store tokens, keys and webhook URLs in a secret
  store, never in posts, logs or shared shortcuts.
- **Respect each platform's limits.** They're in `limits`, e.g. Instagram 50
  API posts/day, Threads 250/day, TikTok ~15/day.
- **Paid APIs:** X charges per post (~$0.015, or ~$0.20 with a link). Tell
  the user before turning it on.

## 6. Platforms with no posting API
Clubhouse, Medium, Naver Blog, Patreon, Lemon8, Xiaohongshu (RedNote), Messenger, Signal, Gab, Gettr, Truth Social, Substack, BeReal, Spotify for Creators, Behance, Quora, Minds, Likee, Rumble, Triller.

For each of these, SETUP.md gives the official automation-adjacent route where one exists (built-in scheduler, import from URL or RSS, podcast-host RSS) plus a manual workflow: the agent prepares the content to the platform's specs and the human posts it.

## 7. Beyond posting: finding what to sell and making the videos
- **Market research** ([MARKET-RESEARCH.md](MARKET-RESEARCH.md), [data/market.json](data/market.json)): a weekly pipeline to find trending products and winning ad patterns, score them, compare the market, decide sell vs affiliate, and write original scripts.
- **Video sourcing** ([VIDEO-SOURCING.md](VIDEO-SOURCING.md), [data/video.json](data/video.json)): turn a script and a product into a video from footage you are allowed to use: scene breakdown, sourcing order (own footage first), clip matching, voiceover and music, assembly, license log and compliance gate.
- Never compile other creators' videos without a written license, and never copy another ad's script word for word.
