# Crypto-native channels

Researched 2026-10-07 from search summaries. Third-party or memory-based
items are marked.

## Token pages and listings

These are the pages traders actually look at. Most of them are paid,
manual forms rather than APIs.

| Where | What you get | How | Cost | API |
|---|---|---|---|---|
| pump.fun coin page | Comments, replies, livestreams | Manually in the app | Free | Unofficial internal API only, so post manually |
| DEX Screener | **Enhanced Token Info**: logo, socials, description | Marketplace order | $299 | Read-only, no key (`api.dexscreener.com`) |
| DEX Screener Boosts | A temporary lift in Trending Score, 12–24h | Marketplace | Pack prices not confirmed | Read-only |
| Birdeye | Token info update | Form plus payment proof | $200 regular (7 business days), $300 Fast Track (2) | No |
| GeckoTerminal | Token info update | CoinGecko help-center form | Fast Pass $199 (24h response, approval not guaranteed) | No |
| CoinGecko | Listing; needs trading on a tracked exchange | Free form (up to 5 days) | Fast Pass $1,000 listing, $200 update | No posting API |
| CoinMarketCap | Listing | Forms | CMC Priority ~$5k; auto-listing pilot (<2h, SOL/ETH/BSC) | Community API is read-only |
| Jupiter | Verified tag | Discovered from organic score and "smart likes" (Jupiter Verify, V3); older strict-list and Catdets routes are deprecated | Free | — |
| Solscan / metadata | Name, symbol, image | **pump.fun tokens can't change metadata after launch** | — | — |

**Bundlepad implication:** set the token's socials and website correctly in
the launch manifest's `metadataUri` **before** launching. Afterwards, the only
way to change them is through the paid aggregator forms above.

## Crypto-native social

- **Binance Square:** has an official posting key (see `PLATFORMS.md`).
- **Farcaster, Nostr, Lens:** see `PLATFORMS.md`.
- **Phantom Explore:** shows trending tokens. No way for a project to submit
  or pay for placement was found.
- **Solana dApp Store:** lists the Bundlepad **app**, not tokens. It needs a
  publisher account plus KYC/KYB.
- **Quest platforms:**
  - **Galxe:** campaigns are built in its dashboard, and its credential API
    checks that tasks were done.
  - **Zealy:** community API key (third-party source).
  - **Layer3:** enterprise pricing, from mid-five figures up.

## Ad networks

| Network | Minimum | Notes |
|---|---|---|
| Coinzilla | €100 deposit, €50/day per campaign | Vets advertisers; has a MiCA/FCA guide |
| Bitmedia | $300 deposit | Has a stats and campaign API |
| A-ADS | $100 | CPA, CPD and CPM pricing |
| Cointraffic | €500–3,000 deposit (third-party figures) | Accepts about 20 cryptocurrencies |
| Persona | Not confirmed | Ads inside dApps, targeted by on-chain activity |
| **Brave Ads** | — | **Memecoins are in scope.** Requires a business address, a domain email, risk disclosures, a ToS and a privacy policy. No guaranteed returns, no "SEC-compliant" claims, no presale promotion |
| Google Ads | — | Only certified exchanges and wallets. Effectively closed to memecoins |
| X Ads | — | ICO/IEO/IDO banned. Exchanges and wallets need licences plus certification |
| Meta, Reddit, Pinterest, TikTok, Snapchat | — | Token-sale ads banned or effectively closed (see `PLATFORMS.md`) |

**Realistic paid mix:**
- Brave Ads
- one crypto ad network, after checking its terms for memecoin rules
- DEX Screener Enhanced Token Info

All of them come **after** the legal check in `COMPLIANCE.md`.
