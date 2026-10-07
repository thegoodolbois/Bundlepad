# Bundlepad marketing

The advertising side of Bundlepad: every platform worth posting to, how to
automate posting on each, and the rules for promoting a token launch.
Researched 2026-10-07 by six parallel research agents.

| File | What it is |
|---|---|
| [PLATFORMS.md](PLATFORMS.md) | **Start here.** Summary table of 29 platforms, then a plain explanation for each |
| [data/platforms.csv](data/platforms.csv) / [.json](data/platforms.json) | The full dataset, 17 fields per platform, for sorting and filtering in a spreadsheet |
| [SHORTCUTS.md](SHORTCUTS.md) | Siri / Apple Shortcuts: ready recipes for Telegram, Discord, Bluesky, Mastodon, Threads, WhatsApp, Farcaster, Binance Square, and a "Hey Siri, announce launch" shortcut |
| [METHODS.md](METHODS.md) | Schedulers (Buffer, Hootsuite…), posting APIs (Ayrshare, Postiz…), no-code tools (n8n, Zapier…), AI-agent pipelines, and posts driven by Bundlepad events |
| [CRYPTO-CHANNELS.md](CRYPTO-CHANNELS.md) | DEX Screener, CoinGecko and CoinMarketCap, Birdeye, Jupiter, pump.fun, Binance Square, crypto ad networks, with costs |
| [COMPLIANCE.md](COMPLIANCE.md) | Platform automation rules, paid-ad bans, FTC, UK FCA and EU MiCA, and safe wording |
| [SOURCES.md](SOURCES.md) | Where every claim came from |

## The short version

1. **Automate for free now:** Telegram (bot), Discord (webhook), Bluesky and
   Mastodon. Each is one HTTPS call, so Siri can do it.
2. **One hub for everything else:** self-host **Postiz** (free) or use
   **Buffer** (cheap, with an API). Add **n8n** so one webhook posts
   everywhere, and post automatically when Bundlepad's chain shows a new
   launch event.
3. **X costs money per API post** (about $0.20 with a link). Label the
   account "Automated" and never repeat a post.
4. **Video:** YouTube and TikTok uploads stay private until your app passes
   their audit. Use a scheduler meanwhile.
5. **Paid ads for a token launch are banned** on Meta, Google, Reddit,
   Pinterest, TikTok and Snapchat. Use Brave Ads, crypto ad networks and
   DEX Screener's paid token info, after the legal check.
6. **No browser bots or self-bots**, on any platform.

## How reliable this is

Most official doc sites were blocked from the research sandbox. Facts were
taken from search summaries of the official pages where possible. Each row's
`verification` field says how solid it is, and anything unconfirmed says
"unverified". Prices and ad policies change often, so open the linked page
before acting.
