# Market research: trends, products, affiliates, scripts

Find what is trending, compare the market, decide whether to sell (or undercut) or promote as an affiliate, and write your own scripts from winning patterns. Researched 2026-10-08 by seven agents.

Web view: the **Market research** tab of the guide page. Data: [data/market.json](data/market.json).

## The plan (weekly agent pipeline)

A weekly n8n-orchestrated pipeline can run the research with Google Sheets as the datastore and Claude for normalization and script drafting, at roughly $5-60/month in tools plus optional Keepa/Kalodata subscriptions. Official APIs cover search demand (YouTube, Google Ads keyword ideas, Google Trends alpha), prices/fees (Amazon Creators API, SP-API fees, eBay Browse, SerpApi, Keepa) and EU-only ad libraries (Meta, TikTok), but the highest-signal sources for US short-form ads and TikTok Shop products (TikTok Creative Center, Meta Ad Library UI for US commercial ads, Kalodata/FastMoss) have no open API and need a 15-30 minute manual export or Apify scrapers that conflict with platform ToS. The scoring model weights demand growth 30%, margin/commission 25%, competition 20%, ad saturation 15%, affiliate availability 10%, with hard gates and an undercut formula that subtracts fees, CPA and returns. Humans must set up accounts and API approvals once, approve every 'sell' decision and every script (FTC disclosure, claims, originality) before hand-off to posting automation. Schedule: Weekly, Monday 06:00 local (n8n Schedule Trigger); review window Mon-Tue; posting Wed-Sun.

### 1. Collect trend signals (Mon 06:00)
- **Inputs:** category watchlist (Sheet tab config), keyword seeds, last week's products tab
- **Tools / APIs:** API: YouTube Data API, Google Ads KeywordPlanIdeaService, Google Trends API alpha (if granted), Keepa best sellers, Meta Ad Library API (EU/UK), TikTok Commercial Content API (EU), Reddit API; manual export: TikTok Creative Center Top Products/Top Ads, Kalodata/FastMoss CSV, Meta Ad Library UI (US), Pinterest Trends, Google Trends CSV if no API; scraper fallback ToS risk: Apify actors for Creative Center / TikTok Shop / Amazon movers
- **Outputs:** raw signal: signal_id, run_id, collected_at, source, source_type(api|manual|scraper), region, raw_product_title, category_hint, metric_name, metric_value, period_days, url, ad_id(optional)
- **Human does:** Create accounts/keys once; do 15-30 min manual exports Monday morning into manual_import tab; approve list of allowed scrapers.
- **Cost:** $0-15 (Apify usage if used; Keepa sub is monthly)
- **Cautions:** YouTube 10k units/day; Sheets 60 writes/min/user; Keepa token bucket; TikTok/Meta/Amazon ToS prohibit scraping - prefer API/manual.

### 2. Normalize and score shortlist
- **Inputs:** raw_signals for run_id
- **Tools / APIs:** LLM: Claude Haiku: cluster titles into canonical products (JSON schema); compute: n8n Code node calculates sub-scores
- **Outputs:** product: product_id, run_id, canonical_name, category, signal_count, sources[], demand_growth_pct, search_volume, video_views_30d, competition_sellers, ad_advertisers_30d, est_price, est_landed_cost, est_margin_pct, affiliate_available, best_commission_pct, score_demand, score_competition, score_margin, score_saturation, score_affiliate, total_score, status
- **Human does:** Review the weights in config tab once; spot-check merged clusters weekly.
- **Cost:** $0.20-1 LLM
- **Cautions:** Anthropic API rate limits by tier; batch 50 titles per call.

### 3. Market comparison and undercut check (top 20 by total_score)
- **Inputs:** products with total_score >= 60 (max 20)
- **Tools / APIs:** API: SerpApi Google Shopping, eBay Browse API, Amazon Creators API / Keepa, AliExpress Affiliate API (supplier cost), Amazon SP-API Product Fees; manual: Meta Ad Library UI longest-running ads, TikTok Shop listing check
- **Outputs:** comparison: product_id, competitor_name, channel, price, rating, review_count, shipping_days, active_ads_count, longest_ad_days, offer_angle; undercut: product_id, market_p25_price, market_median_price, our_target_price, landed_cost, platform_fees, est_cpa, unit_profit_at_target, undercut_feasible(bool), differentiation_ideas[]
- **Human does:** Confirm landed cost from real supplier quote before any 'sell' decision.
- **Cost:** $0 (free tiers) to $25
- **Cautions:** SP-API fees 1 req/s; SerpApi free 250/mo; eBay call limits.

### 4. Decide sell vs affiliate
- **Inputs:** undercut rows, affiliate_available, best_commission_pct
- **Tools / APIs:** compute: rules in n8n Code node; LLM: Sonnet writes 3-line rationale
- **Outputs:** decision: product_id, path(sell|affiliate|skip), expected_profit_per_sale, expected_commission_per_sale, capital_required, risk_flags[], rationale
- **Human does:** Human approves every 'sell' (inventory risk); affiliates can be auto-approved if commission >= threshold.
- **Cost:** <$0.50
- **Cautions:** None technical.

### 5. Draft original scripts from patterns
- **Inputs:** approved decisions, pattern library (abstracted hooks/structures from top ads), product facts sheet, Reddit pain points
- **Tools / APIs:** LLM: Claude Sonnet (Batch API)
- **Outputs:** script: script_id, product_id, path, pattern_used, hook, body_beats[], cta, on_screen_text[], duration_s, disclosure_text, claims[], claim_evidence[], similarity_check_passed, status=drafted
- **Human does:** Maintain product facts and allowed claims; never supply competitor scripts verbatim.
- **Cost:** $1-4
- **Cautions:** Prompt includes rule: do not reproduce text from any real ad; LLM similarity check vs stored ad metadata.

### 6. Human review
- **Inputs:** scripts with status=drafted
- **Tools / APIs:** tools: Google Sheets review_queue view, Slack/Gmail notification from n8n, n8n Wait node resume webhook
- **Outputs:** review: script_id, reviewer, decision(approved|edit|rejected), edited_script, compliance_checklist{disclosure,claims_substantiated,no_fake_testimonial,no_copied_copy}, approved_at
- **Human does:** Mandatory: reviewer checks FTC disclosure, claims, originality, platform ad policy.
- **Cost:** Human time ~30-60 min/week
- **Cautions:** FTC 16 CFR 255 / 465.

### 7. Hand off to posting automation
- **Inputs:** approved scripts, affiliate links / product page URLs
- **Tools / APIs:** tools: n8n webhook to existing posting automation (Bundlepad posting tab), Google Drive folder for briefs
- **Outputs:** handoff: script_id, product_id, platforms[], asset_brief, caption, hashtags[], link, disclosure_text, schedule_at, utm_campaign, status=queued
- **Human does:** Human records/edits video or approves AI video; posting tool credentials configured.
- **Cost:** $0 incremental
- **Cautions:** Each platform's posting API limits and branded-content toggles (TikTok/Instagram paid-partnership labels).

### Product score

Normalize each metric to 0-100 within this week's candidate set (percentile rank) unless an absolute cap is given., D = demand score: 0.5*pct_rank(demand_growth_pct) + 0.3*pct_rank(video_views_30d) + 0.2*pct_rank(search_volume)., C = competition score (inverse): 100 - pct_rank(competition_sellers) (Keepa/eBay/Shopping seller counts)., M = margin score: sell path -> clamp(est_margin_pct/40*100, 0, 100) (40% net margin = full marks); affiliate path -> clamp(commission_per_sale_usd/10*100,0,100)., S = ad saturation (inverse): 100 - clamp(ad_advertisers_30d/50*100,0,100); +10 bonus (cap 100) if longest-running competitor ad > 30 days (proof the angle sells) but advertisers < 20., A = affiliate availability: 100 if program with >= 10% commission, 60 if 5-10%, 30 if < 5%, 0 if none., TOTAL = 0.30*D + 0.20*C + 0.25*M + 0.15*S + 0.10*A., Gates (hard filters before scoring): signal_count >= 2 distinct sources; no restricted category (supplements health claims, weapons, IP-branded knockoffs); est_price >= $15., Shortlist = TOTAL >= 60, max 20 per week; tune weights in config tab after 4-6 weeks using actual results.

## Rules

- Learn from winning ads (hooks, structure, angles), then write your own script. Never copy another ad's words, footage or music: that is copyright infringement and gets ads rejected.
- Prefer official APIs, exports and ad libraries. Scraping TikTok, Meta or Amazon breaks their terms; use manual exports where no API exists.
- Disclose affiliate links and paid promotion clearly in the post itself (#ad, "Paid partnership", "I earn a commission").
- No fake reviews, fake testimonials or made-up results. Health, money and before/after claims need proof and are restricted on every platform.
- Check trademarks and brand rules before selling or undercutting: no knock-offs of branded products, and respect MAP (minimum advertised price) agreements where you have one.
- Prices, fees and commission rates change often. Items marked "(unverified)" need checking on the official page before you rely on them.

## Trending videos

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [TikTok Creative Center - Trends (Hashtags, Songs, Creators, Videos)](https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en) | Trending hashtags, songs, creators and organic videos by region and industry. Hashtags show popularity over time, the audience's age and interests, and related videos. Songs can be filtered to those approved for business use and show an analytics curve. Creators are ranked by followers and engagement per region. | No official API. Partial organic data is available through the TikTok Research API, but only for approved academic researchers. | Free | Partly. Weekly screenshot or browser capture works. Third-party scrapers exist but are unofficial. |
| [TikTok Creative Center - Keyword Insights](https://ads.tiktok.com/business/creativecenter/keyword-insights/pc/en) | Keywords and phrases used in TikTok ad scripts, ranked by popularity, CTR, CVR, CPA and 6s view rate. Filters cover region, industry, objective, keyword type (selling points, pain points, audience, CTAs, product) and time. The data comes from ads, not organic posts. | No official API. | Free | Partly. Browser capture into a phrase-bank sheet works. Writing the scripts can be automated with an LLM, as long as it follows your own originality rules. |
| [TikTok Research API](https://developers.tiktok.com/products/research-api/) | Public organic video data: video metadata, views, likes, shares, comments, hashtags, music and user info. It is query-based. | Yes, but restricted to approved non-profit academic researchers in eligible regions (US, EEA, UK, CH and others). Not available for commercial use. | Free for approved researchers | No for commercial users. |
| [YouTube Charts and Explore (replaces Trending page)](https://charts.youtube.com/) | YouTube retired the Trending page and Trending Now list in July 2025. It was replaced by category charts (Trending Music Videos, Top Podcast Shows, Trending Movie Trailers, Gaming Explore) and the Explore menu. These show organic popularity, not ads. | No for the charts site. Use the YouTube Data API mostPopular chart (next entry). | Free | Partly. Use the Data API search and video lists instead of the charts site. |
| [YouTube Data API v3 (videos.list chart=mostPopular, search.list)](https://developers.google.com/youtube/v3/docs/videos/list) | The most popular videos by region (regionCode) and category (videoCategoryId), with view, like and comment counts, publish date, tags and duration. search.list finds videos by keyword, ordered by viewCount or date. | Yes. YouTube Data API v3 with an API key from Google Cloud. | Free within quota. The default is 10,000 units/day. videos.list costs about 1 unit per call. search.list costs 100 units per call. Extra quota requires an audit application. | Yes. This is a fully official API and a good candidate for scheduled agents. |
| [Pinterest Trends (web) + Pinterest Trends API](https://trends.pinterest.com/) | Pinterest search-term trends by region, with weekly, monthly and yearly growth, filters for interests, age and gender, and top Pins per term. Trend types include growing, monthly, yearly and seasonal. Strong signal for home, decor, fashion, beauty, DIY and gifts. | Partial. The Pinterest API v5 'List trending keywords' endpoint (GET /trends/keywords/{region}/top/{trend_type}) returns up to 50 keywords with WoW, MoM and YoY growth for today's date only. Access is limited and needs app review. | Free | Partly. The API is automatable if access is granted. Otherwise use a browser agent. |
| [Google Trends + Google Trends API (alpha)](https://trends.google.com/) | Relative search interest (0-100) over time by region and sub-region, related queries and topics (rising and top), and a YouTube Search and Google Shopping filter. 'Trending now' shows real-time breakout searches. The API alpha (launched July 2025) gives consistently scaled data over a rolling 5-year window with daily, weekly, monthly and yearly aggregation. | Partial. The Google Trends API is in alpha and limited to approved testers through an application form. There is no official API otherwise. pytrends-style libraries are unofficial. | Free (no published API pricing) | Partly. Yes through the alpha API if approved. Otherwise a browser agent or the CSV download button. |
| [Reddit (Pro Trends, Top posts, Promoted posts)](https://www.reddit.com/reddit-pro/) | Reddit Pro Trends (free, launched January 2025) charts conversation volume for tracked keywords and brands across Reddit. Subreddit 'Top' views (week or month) show which products people recommend or complain about. Reddit has no public ad library for commercial ads (unverified as of 2026). | Partial. The Reddit Data API (OAuth) covers posts and comments. Free use is limited to about 100 queries per minute for non-commercial use, and commercial use needs a paid agreement. Pro Trends has no API. | Pro Trends: free. Data API: free tier for non-commercial use; commercial use is priced per agreement (historically about $0.24 per 1K calls, unverified). | Partly. API reads for subreddit monitoring are possible within its terms. Pro Trends is manual. |
| [Instagram Reels trends (Professional dashboard, Trending audio, Edits app)](https://www.instagram.com/) | In-app only. The Reels audio picker marks trending audio with an arrow. Professional accounts get a trends and inspiration area in the Professional dashboard. The Edits app shows trending audio and inspiration (unverified details). No product sales data. | No for trends. The Instagram Graph API covers only your own account's insights and hashtag search (limited to 30 unique hashtags per 7 days). | Free | No. It is in-app and manual. Hashtag search via the Graph API is limited. |
| [TikTok Creative Center (Top Ads, Top Products, Trends)](https://ads.tiktok.com/business/creativecenter) | Top-performing ads by region/industry/period with CTR, likes and budget tier; Top Products with popularity/CTR/CVR/impressions; trending hashtags, songs, creators. | No official export API for Top Ads/Top Products. TikTok Commercial Content API covers ad-library data but EU-scoped and application-gated. | Free (TikTok For Business account). | Partly - manual weekly export (~15 min) is ToS-safe; automation only via third-party scrapers (ToS risk). |
| [YouTube Data API v3](https://developers.google.com/youtube/v3/determine_quota_cost) | Search for product review/unboxing videos, views, likes, comment counts, publish dates; mostPopular chart by region/category. | Yes - API key; default 10,000 units/day per project. | Free within quota. search.list = 100 units (~100 searches/day); videos.list = 1 unit. | Yes - fully via API. |
| [Google Trends (UI export) and Google Trends API (alpha)](https://developers.google.com/search/blog/2025/07/trends-api) | Relative search interest over time by region; rising related queries. Alpha API gives ~5 years (1,800 days) rolling, ~48h lag. | Partial - official Trends API in gated alpha (apply); pytrends archived April 2025 and unreliable. | Free. | Partly - automated only with alpha access; otherwise manual CSV (or third-party SERP APIs). |
| [Pinterest Trends (site) and Trends API](https://developers.pinterest.com/docs/analytics-and-reports/trends/) | Trending keywords with WoW/MoM/YoY growth by region, interest, age, gender. | Partial - 'List trending keywords' endpoint limited to selected partners; site trends.pinterest.com free to browse. | Free. | Partly. |
| [Reddit Data API](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki) | Posts/comments in product subreddits (r/BuyItForLife, r/TikTokShop, niche hobby subs): mentions and complaints, useful for pain points to address in scripts. | Yes - OAuth; free tier ~100 queries/min per client for non-commercial use; commercial use needs agreement. | Free non-commercial; commercial pricing negotiated (unverified ~$0.24/1k calls). | Yes within terms; commercial use may need approval. |

## Ad libraries

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [TikTok Creative Center - Top Ads](https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en) | Best-performing TikTok ads with filters for region, industry, objective, ad format (Spark / non-Spark), language, likes band and period (7/30/180 days). You can sort by For You, Reach, CTR, 2s and 6s view rate, CVR and likes. CTR is shown as a percentile within the industry (e.g. 'Top 10%'), not a raw rate. The detail view adds a second-by-second engagement and drop-off timeline, keyframe analysis and the landing page. | No official API for Top Ads. Third-party Apify actors scrape it (unofficial). | Free | Partly. There is no API, so an agent can drive a logged-in browser session or use a paid third-party scraper. Copying data by hand into a spreadsheet works reliably. Judging the creative stays human or needs a vision model. |
| [TikTok Commercial Content Library + Commercial Content API](https://developers.tiktok.com/products/commercial-content-api) | A searchable library of ads shown in the EU/EEA (plus Switzerland and the UK, per TikTok's library pages) with advertiser, first and last shown dates, targeting parameters, the number of unique users reached (ranges) and removed ads. Ads stay searchable until one year after they were last shown. It does not include CTR or spend. | Yes. The Commercial Content API (query ads by advertiser name or keyword). Access requires a TikTok for Developers account plus an application that is reviewed in about 1-2 weeks. | Free | Yes for the API once approved, including scheduled queries on competitor names and keywords. The web library is manual. |
| [Meta Ad Library (web)](https://www.facebook.com/ads/library/) | All active ads running across Facebook, Instagram, Messenger and Audience Network in every country. You see the creative, copy, start date, platforms, number of ad versions and the landing link. Ads delivered in the EU also show EU reach, age/gender/location breakdowns and the payer. Political and issue ads show spend and impression ranges. Commercial ads show no spend, CTR or likes. | Partial. The web UI covers all active commercial ads worldwide, but the API (see next entry) returns commercial ads only if they delivered in the EU. | Free | Partly. A browser agent can search and summarize. Bulk access is only through the API (EU data) or third-party tools. |
| [Meta Ad Library API](https://www.facebook.com/ads/library/api/) | Programmatic search (Graph API ads_archive endpoint) of political and issue ads globally, plus all ads delivered in the EU (and associated territories). Commercial ads return creative text, links, delivery dates, EU reach and demographic breakdowns. Spend and impressions are returned only for political ads. | Yes. The ads_archive Graph API endpoint. Requires a Meta developer account, identity confirmation and an app with an access token. | Free | Yes for EU-delivered commercial ads and political ads. No for US-only commercial ads. |
| [Google Ads Transparency Center](https://adstransparency.google.com/) | Ads from verified advertisers across Search, YouTube, Display, Shopping/Maps and Play. Filters cover advertiser or domain, region, date and format (text, image, video). Shows the creative, first and last shown dates and regions. For EU, it adds impression ranges and targeting. No CTR or spend for commercial ads. | Partial. There is no official REST API for commercial ads. Google's political ads data is in a public BigQuery dataset. A BigQuery dataset for EEA creative stats is reported by third parties (unverified). Third-party scrapers exist. | Free (BigQuery queries are billed per bytes scanned beyond the free tier of 1 TB/month) | Partly. The web is manual or uses a browser agent. BigQuery is automatable if the dataset is confirmed. |
| [LinkedIn Ad Library](https://www.linkedin.com/ad-library) | Ads run on LinkedIn in the last 12 months, searchable by advertiser, keyword, country and date. Shows the creative, copy, CTA and format. EU-served ads add impression ranges, impressions by country and targeting parameters. | No official public API (unverified). Third-party Apify scrapers exist. | Free | Partly. A browser agent or third-party scraper. Impressions load after the page renders, so a full browser is needed. |
| [X (Twitter) Ads Repository](https://ads.twitter.com/ads-repository) | A DSA compliance repository of ads served in the EU: advertiser, funding entity, targeting parameters, impressions and reach, and halted ads. Search results have historically been delivered as CSV/Excel exports. | No (as of mid-2026). In July 2026 X committed to the European Commission to add an API, show results in the interface and include the full ad content and destination URLs (status unverified). | Free | Partly. CSV parsing is automatable. The request step is manual until the API ships. |
| [Snap Ads Gallery (EU) + Snap Political Ads Library](https://adsgallery.snap.com/) | Ads Gallery: commercial ads delivered in the EU (and Turkiye, per third-party sources) in the last 12 months, with creative, advertiser, dates and targeting. No spend. The Political Ads Library (snap.com/political-ads) has downloadable yearly files with spend and impressions for political ads only. | No official API for the Ads Gallery (unverified). The political library offers CSV downloads. | Free | Partly. A browser agent or unofficial scrapers. |
| [TikTok Creative Center (Top Ads, Keyword Insights, Top Products, Trends)](https://ads.tiktok.com/business/creativecenter) | Top-performing TikTok ads filterable by country, industry, objective, format, period; Keyword Insights shows phrases used in ads with average CTR/CVR; Top Products; trending hashtags/songs/creators. | No public API for Creative Center (TikTok Commercial Content API covers ad transparency in EU, application required) | Free | Partly - no official API; an agent can guide a human through filters and summarise notes the human pastes in. Automated scraping is against TikTok terms. |
| [Meta Ad Library](https://www.facebook.com/ads/library/) | All active ads running on Facebook/Instagram/Messenger/Audience Network for any Page; start date (longevity is a proxy for profitability), creative variations, platforms. EU-delivered ads show reach and targeting summary. | Partial - Ad Library API (ads_archive endpoint): requires Meta developer app + identity verification; commercial ads only returned for EU/UK delivery, otherwise political/issue ads | Free | Partly - API for EU/UK commercial ads; elsewhere manual browsing. Do not scrape the web UI. |
| [TikTok Commercial Content API](https://developers.tiktok.com/products/commercial-content-api) | Ads and advertiser metadata: first/last shown dates, targeting info, reach; data kept up to one year after last shown. | Yes - Commercial Content API; requires TikTok for Developers account and an approved application (1-2 weeks reported). | Free. | Yes once approved; approval itself is manual. |
| [Meta Ad Library (UI) and Ad Library API](https://www.facebook.com/ads/library/) | All active ads on Facebook/Instagram searchable in the UI; API returns political/issue ads globally and all ads delivered to EU/UK (1 year). No spend for commercial ads; no image/video in API. | Partial - Graph API /ads_archive; needs Meta developer app, identity verification (facebook.com/ID), Ad Library API product. | Free. | Partly - API for EU/UK commercial ads; US commercial ads require manual UI review (or scrapers with ToS risk). |

## Product & sales data

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [TikTok Creative Center - Top Products](https://ads.tiktok.com/business/creativecenter/top-products/pc/en) | Products ranked by how their ads perform on TikTok, filterable by region, category and period (1/7/30 days). Product detail shows popularity, CTR, CVR, CPA, an impressions trend chart and the top ads for that product. | No official API. | Free | Partly. An agent can do a weekly browser-assisted export into a sheet. Deciding which product to pursue stays human. |
| [Amazon Best Sellers / Movers & Shakers / Most Wished For](https://www.amazon.com/gp/movers-and-shakers) | Best Sellers is updated hourly from sales rank. Movers & Shakers shows the biggest sales-rank gainers over the last 24 hours. Most Wished For and New Releases are also available. Each list covers the top 100 per category and shows price, rating and review count, which together give the undercut price baseline. | Partial. The Amazon Product Advertising API 5.0 (for Associates) returns item info including sales rank and price, but it does not return the Movers & Shakers lists. The SP-API is for sellers. Third-party tools (Keepa, Jungle Scout, Helium 10) provide BSR history (paid). | Free to browse. PA-API is free but needs an active Associates account with qualifying sales. Keepa costs about EUR 19/month (unverified). | Partly. PA-API covers known ASINs. The lists themselves need a browser agent or Keepa's API (paid). |
| [Amazon Best Sellers / Movers & Shakers / New Releases / Most Wished For / Gift Ideas](https://www.amazon.com/gp/bestsellers) | Top 100 products per category and subcategory ranked by sales (Best Sellers), biggest % jump in sales rank over ~24h (Movers & Shakers), best-selling new items (New Releases), most added to wish lists (Most Wished For), most gifted (Gift Ideas). Shows price, rating count, rank; no unit numbers. | No direct API for the lists. Equivalent data: BrowseNodes and SalesRank via Amazon Creators API (formerly PA-API 5), or Keepa API (best-seller lists per category). | Free to view | Partly. Use Keepa API 'best sellers' request (ASIN list per category) or Creators API instead of scraping; manual browsing for Movers & Shakers. |
| [Jungle Scout](https://www.junglescout.com) | Amazon estimated monthly units and revenue per ASIN, Product Database and Opportunity Finder (niche demand vs competition), keyword search volume, supplier database (import records), Chrome extension. | Partial - Jungle Scout API (sales estimates, keywords, share of voice) on higher/Cobalt enterprise tiers. | Older tiers Basic $49/mo, Suite $69/mo, Professional $129/mo (annual cheaper); 2026 product lines appear as Catalyst and Cobalt with undisclosed pricing (verify on site). | Partly - CSV export on all plans; API only on higher tiers. |
| [Helium 10](https://www.helium10.com) | Black Box product finder, Xray sales estimates per ASIN, Cerebro/Magnet keyword volumes, Trendster trends, also Walmart and TikTok Shop data modules. | Partial - no general public API; enterprise integrations only (unverified). | Free plan (limited). Platinum $129/mo ($99/mo annual), Diamond $359/mo ($279/mo annual); Starter plan removed in 2026; Enterprise custom (third-party sources). | Partly - CSV export; no open API, so agent work is downstream of exports. |
| [eBay Product Research (formerly Terapeak)](https://www.ebay.com/sh/research) | Real eBay sold data up to 3 years: average sold price, total sold, sell-through rate (90 days), shipping, top listings by sales; Sourcing Insights for store subscribers. | No API for Product Research. Related: Browse API (active listings), Marketplace Insights API (sold items; restricted access). | Free in Seller Hub | No for Product Research (manual UI). Browse API covers active listings only. |
| [eBay Browse API](https://developer.ebay.com/api-docs/buy/browse/overview.html) | Search active eBay listings by keyword/category/GTIN with price, seller, condition, item specifics; up to 200 items per call. | Yes - Browse API (OAuth client credentials). Marketplace Insights API (sold data) is limited-release. | Free | Yes - API. |
| [Etsy Open API v3](https://developers.etsy.com/documentation/) | Active listings search (keywords, price, views, favorites count on listing), shop data, your own shop's receipts. | Yes - Open API v3 (OAuth 2.0, API key approval). | Free | Yes - API (no other shops' sales data). |
| [Walmart Best Sellers + Top Trending Items API + Walmart Affiliates](https://developer.walmart.com/us-marketplace/docs/top-trending-items) | walmart.com best seller sort per category; Seller Center Analytics > Growth Opportunities > Best Sellers (rank, brand, reviews, number of sellers); Top Trending Items API returns top 20 current best-sellers. | Partial - Top Trending Items API (Marketplace Insights API, seller credentials). Affiliate data feeds via Impact. | Free | Partly - API needs approved seller account; affiliate feeds via Impact. |
| [Google Merchant Center Best Sellers report + Google Trends](https://support.google.com/merchants/answer/9488679) | Best Sellers: popularity rank of products/brands on Google Shopping by country and Google product category, rank change, relative demand, whether you carry it. Google Trends: relative search interest over time and rising queries. | Yes - Best Sellers via Merchant API / Content API reports and BigQuery Data Transfer (weekly/monthly tables). Google Trends API is application-only alpha (no public pricing); trends.google.com UI free. | Free (BigQuery storage/query costs apply) | Yes for Best Sellers (API/BigQuery). Trends: manual or alpha API; unofficial pytrends is unreliable. |
| [Kalodata (Video & Ads / creative module)](https://www.kalodata.com/) | TikTok Shop products, shops, creators and the videos/livestreams driving GMV; video revenue estimates, hook/format behind sales curves. | No public API (unverified) | ~$45.99-$129.99/mo published plans (third-party); 7-day trial without card (third-party, verify) | Partly - UI; exports on higher tiers (unverified). |
| [Amazon Creators API (replaces PA-API 5)](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation) | Product info, images, and price/offers (OffersV2) for affiliate linking. | Yes - Creators API, OAuth 2.0; PA-API 5 deprecated (retired May 2026, calls return 403). | Free with Amazon Associates; access likely requires qualifying sales (unverified). | Yes - if eligible. |
| [eBay Browse API / Marketplace Insights API](https://developer.ebay.com/develop/buying-apps/research-apis) | Browse: current listings and prices. Marketplace Insights: sold items up to 90 days (limited release). | Yes for Browse (standard keyset); Marketplace Insights is Limited Release, approval only. | Free. | Yes for active listings; sold data mostly manual. |
| [Kalodata / FastMoss (TikTok Shop analytics)](https://www.fastmoss.com) | TikTok Shop product GMV, units sold, top creators and videos per product, shop rankings. | No public API (unverified); CSV export on paid plans. | FastMoss reported from ~$59/mo (TrustRadius); Kalodata pricing not confirmed. | Partly - human export, agent ingests. |

## Affiliate programs

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [Amazon Creators API (successor to Product Advertising API 5.0)](https://affiliate-program.amazon.com/creatorsapi) | Product search, item details (title, price/offers via OffersV2, images, sales rank, browse nodes), variations; returns affiliate-tagged links. | Yes - Creators API. PA-API 5.0 was deprecated/retired (Apr 30 / May 15 2026 dates appear in Amazon docs); old PA-API credentials do not carry over and calls return 403. | Free with an Amazon Associates account | Yes via API for product lookups and affiliate links; approval and sales thresholds are manual. |
| [TikTok Shop (Seller Center + Affiliate / Creator Marketplace)](https://seller-us.tiktok.com) | Seller Center analytics show only your own shop; the Affiliate center (for creators) shows product commission rates, sample availability and product-level sales hints; the in-app Shop tab shows 'best sellers'/'sold' counts per product. | Partial - TikTok Shop Partner/Open API (orders, products, affiliate endpoints for approved partners); no public cross-market best-seller API. | Free to join; referral fees charged to sellers (roughly 6-8% US, unverified) | Partly - Open API for your own shop/affiliate ops after partner approval; competitor data needs third-party tools. |
| [AliExpress Affiliate (Portals) API + Hot Products](https://portals.aliexpress.com) | Hot products per category, product search with sale price, commission rate and 'orders' count, affiliate link generation; also supplier cost baseline for undercut math. | Yes - AliExpress Open Platform affiliate API: aliexpress.affiliate.product.query, aliexpress.affiliate.hotproduct.query (Advanced API access, needs approval with 100+ word use case), aliexpress.affiliate.link.generate. Signed requests (HMAC). | Free | Yes - API (server-side signing). |
| [Amazon Associates](https://affiliate-program.amazon.com/) | Per-category commission on almost any Amazon product; earnings/click/order reports; product data via Creators API. | Partial - Creators API (replaced PA-API 5.0, which was retired around Apr 30 - May 15 2026 and now returns 403). Access reportedly requires ~10 qualified sales in trailing 30 days per marketplace (unverified). | Free | Partly - Creators API for product lookups/links once eligible; reports are download only; posting content and disclosure stay manual. |
| [TikTok Shop Affiliate](https://affiliate-us.tiktok.com/) | Products with seller-set commission %, sample offers, open vs targeted collaborations, your affiliate orders and GMV. | Partial - TikTok Shop Partner/Open API has affiliate-creator endpoints (search open-collaboration products, target collaborations, affiliate orders, showcase) but requires registered app/partner approval (unverified); third-party scrapers (Apify, ScrapeCreators) exist but are unofficial. | Free | Partly - product discovery can be read via official API only if approved as a partner, otherwise manual or via unofficial scrapers (ToS risk); video creation/posting manual. |
| [YouTube Shopping affiliate program](https://support.google.com/youtube/answer/13376398) | Tag products from participating merchants (Shopify/Google Merchant Center stores, Amazon in US since Aug 2026, Shopee in SE Asia) in videos, Shorts, lives; commissions shown in YouTube Studio. | No public creator affiliate API; YouTube Analytics API covers channel metrics, not shopping commissions (unverified). | Free | Partly - research can be automated with YouTube Data API for trending videos; tagging and joining stay manual. |
| [Instagram / Facebook affiliate (Meta affiliate partnerships)](https://www.facebook.com/business/) | Tag affiliate products from Amazon (US), Shopee (Asia), later Temu, eBay, Mercado Libre in Reels/posts; native Instagram creator commission links were retired in 2023. | No public affiliate API (unverified) | Free | No - manual in-app tagging; earnings data lives in the partner network. |
| [Walmart Creator / Walmart Affiliates (Impact)](https://creator.walmart.com/) | Commission on Walmart.com purchases; Walmart Creator has storefronts, collections, campaigns; standard affiliate program on Impact. | Partial - Walmart Affiliate API at walmart.io (product lookup/search, trending, taxonomy) for approved affiliates (unverified); reporting via Impact API. | Free | Partly - product search via walmart.io API and Impact reporting API; content manual. |
| [eBay Partner Network (EPN)](https://partnernetwork.ebay.com/) | Commission on eBay purchases (new and used, auctions); Smart Share link generator; performance reports. | Yes - eBay Buy Browse API (search items, returns itemAffiliateWebUrl when X-EBAY-C-ENDUSERCTX header carries affiliateCampaignId) plus EPN reporting API; needs eBay developer account. | Free | Yes - Browse API search + affiliate URLs fully automatable; posting manual. |
| [Etsy Affiliate Program (Awin) / Creator Collective](https://www.etsy.com/affiliates) | Commission on Etsy purchases from your link; Awin product feeds. | Partial - via Awin Publisher API and Etsy product feeds in Awin; Etsy Open API v3 for listing data needs separate app approval (unverified). | Free (Awin may take refundable ~$5/£5 deposit) | Partly - Awin feed/API automatable once approved. |
| [Shopify Collabs](https://www.shopify.com/collabs) | Marketplace of Shopify DTC brands that pay creators commission, gifts, affiliate links/discount codes. | No public creator API (unverified) | Free for creators | No - in-app; manual. |
| [ClickBank](https://www.clickbank.com/) | Digital-product and supplement offers with gravity score, avg $/conversion, initial and recurring commissions. | Partial - ClickBank API (orders, analytics); marketplace browsing manual (unverified) | Free for affiliates (vendors pay $49.95 activation + $1 + 7.5% per sale) | Partly - order/analytics API; marketplace stats manual. |
| [Digistore24](https://www.digistore24.com/) | Marketplace of 8,000-10,000+ digital and physical offers with commission %, earnings per sale, conversion stats. | Partial - Digistore24 IPN/API for vendors and affiliates (unverified) | Free for affiliates | Partly - API exists; marketplace research manual. |
| [Impact.com (partner/publisher marketplace)](https://impact.com/) | Thousands of brand programs (Walmart, Target-like retailers, SaaS, Uber, etc.) with per-program terms; Product Marketplace for creators. | Yes - Impact Partner (Mediapartner) REST API: campaigns, catalogs/products, actions, tracking links (API keys in account settings) (unverified) | Free for partners | Yes - API covers catalogs, links, reports. |
| [Awin (now includes ShareASale)](https://www.awin.com/) | ~30,000 advertisers incl. Etsy and former ShareASale merchants; product feeds; commission per program. | Yes - Awin Publisher API (OAuth2 bearer token; programmes, transactions, links) and Enhanced Feed API (.jsonl per advertiser, retail only); 20 calls/min per user. Create-a-Feed uses separate key. | Free (refundable ~£5/$5 signup deposit in some regions) | Yes - feeds, links, transactions via API. |
| [ShareASale (legacy, now Awin)](https://www.shareasale.com/) | Legacy network - merchants and publishers moved to Awin. | Legacy ShareASale API retired; use Awin API (unverified) | Free | See Awin. |
| [CJ Affiliate](https://www.cj.com/) | Large retailer/brand programs; product catalogs; link search; commission detail. | Yes - CJ developer APIs with personal access token: Product Search (GraphQL at ads.api.cj.com - availability disputed), Link Search, Advertiser Lookup, Commission Detail. | Free | Yes - APIs for products, links, commissions. |
| [Rakuten Advertising](https://rakutenadvertising.com/) | Premium retail brand programs, product feeds, deep links. | Partial - Rakuten Advertising APIs (product search, link locator, reports) with token (unverified) | Free | Partly/Yes - APIs once approved. |
| [PartnerStack (SaaS)](https://partnerstack.com/) | B2B SaaS partner programs (recurring commissions) in one marketplace. | Partial - partner API limited; mostly vendor API (unverified) | Free for partners | Partly. |
| [AliExpress Portals](https://portals.aliexpress.com/) | Commission on AliExpress products, hot-product lists, link generator. | Yes - AliExpress Affiliate API via Open Platform (product query, hot products, link generate) with app key (unverified) | Free | Yes - API automatable (unverified) |
| [Temu Affiliate / Influencer Program](https://www.temu.com/affiliate) | Commission on referred orders plus new-user bonuses. | No public API (unverified) | Free | No - manual. |
| [TikTok Shop Affiliate / Creator marketplace (for licensed creator content)](https://seller-us.tiktok.com/) | Sellers set commission for creators; creators earn by posting videos; sellers can get authorization codes (Spark Ads) to boost creators' videos with permission. | Partial - TikTok Shop Partner API (approval needed) | Free to join; commission set by seller (often 10-20%, unverified) | Partly - API for approved partners. |
| [Amazon Associates commission rates](https://affiliate-program.amazon.com/help/operating/schedule) | Fixed commission % by product category. | N/A (rates table); reports in Associates Central. | Free to join. | Partly - static table. |
| [Amazon Creators API (successor to PA-API 5.0)](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation) | Product details, prices/offers (OffersV2), images, browse nodes and affiliate links for Amazon products. | Yes - Creators API; PA-API 5.0 retired (Apr 30 / May 15 2026), old calls get 403; new credentials required. | Free; access reportedly needs an approved Associates account with ~10 qualified sales in trailing 30 days (unverified third-party). | Yes once eligible. |
| [TikTok Shop Affiliate APIs (Partner Center)](https://developers.tiktok.com/blog/2024-tiktok-shop-affiliate-apis-launch-developer-opportunity) | Products with open collaborations filtered by category, commission rate, keyword; affiliate link generation; affiliate orders. | Partial - partner-approved TikTok Shop Partner APIs; not self-serve. | Free; commission deducted from seller payout. | Partly - automated only if approved as partner; else manual. |

## Ad research tools

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [Third-party scrapers for ad libraries (e.g. Apify actors)](https://apify.com/store) | Community actors that extract TikTok Creative Center, Meta Ad Library, Google Ads Transparency, LinkedIn and Snap data into JSON or CSV. | Yes. The Apify API runs the actors and returns datasets. | Free tier of $5/month platform credit. Paid plans start at about $39/month (unverified). Some actors charge per result. | Yes technically, but it is the riskiest route under platform ToS. |
| [Foreplay](https://www.foreplay.co/pricing) | Swipe file (save ads from Meta/TikTok/LinkedIn libraries via Chrome extension), Discovery library of ads, Spyder brand tracking, Lens creative analytics on your own ad account, briefs/script tools. | Partial - API credits included on annual plans (per third-party reports) | Basic $59/mo ($49 annual), Workflow $175/mo ($149 annual), Agency $459/mo ($389 annual), Enterprise custom; 7-day trial (third-party, unverified) | Partly - API on annual plans; saving via extension is manual. |
| [Atria](https://www.tryatria.com/pricing) | Ad library/inspiration search with AI tagging of hooks and angles, competitor tracking, creative analytics, AI script/brief generation. | No (unverified) | Third-party reviews: Core about $129/mo annual (~$159 monthly), Plus ~$599/mo, Business ~$959/mo; 7-day free trial; official page lists lower entry tiers ($29-$99, unclear) - verify | Partly - UI-driven. |
| [Minea](https://www.minea.com/pricing) | Ads from Meta, TikTok, Pinterest; product ads with engagement, store links, influencer placements; credit-based. | No (unverified) | Free ~200-250 credits; Starter $49/mo (~$34 annual, 10k credits); Premium $99/mo (~$69 annual, 100k credits); Business $399/mo (~$299 annual) - third-party, verify | Partly - manual UI. |
| [PiPiAds](https://www.pipiads.com/pricing) | TikTok (and Meta) ad database: impressions, likes, days running, ad copy, landing pages, TikTok Shop products. | No (unverified) | New 2.0 credit plans: Basic ~$49/mo, Advanced ~$99/mo, Flexible from ~$180/mo, Enterprise ~$900/mo; legacy Starter $77/VIP $155/Pro $263 for existing users; $1 3-day or free 500-credit trial (third-party, conflicting - verify) | Partly - manual UI. |
| [BigSpy](https://bigspy.com/pricing) | Multi-network ad database (Facebook, Instagram, TikTok, YouTube, Pinterest, Twitter/X, AdMob, Unity etc.). | No (unverified) | Free limited tier; Basic ~$9-19/mo; Pro ~$99-149/mo (~$104 annual) with $1 3-day trial auto-renewing; Group ~$249/mo; Enterprise custom (third-party, conflicting) | Partly - manual UI. |
| [AdSpy](https://adspy.com/) | Large Facebook/Instagram ad database searchable by ad text, comments, URL, affiliate network, likes. | No | $149/mo single plan, no free trial (third-party, verify) | Partly - manual UI. |

## Script & transcript tools

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [OpenAI Whisper (open-source) / OpenAI transcription API](https://platform.openai.com/docs/guides/speech-to-text) | Speech-to-text for audio you own or have rights to (your recordings, your UGC creators' deliveries, licensed content). | Yes - OpenAI Audio API (whisper-1, gpt-4o-transcribe, gpt-4o-mini-transcribe); open-source Whisper runs locally | Open-source model free (your compute); API about $0.006/min (whisper-1, gpt-4o-transcribe), $0.003/min (gpt-4o-mini-transcribe) per third-party price trackers; 25 MB file limit | Yes - fully scriptable on your own files. |
| [Descript](https://www.descript.com/pricing) | Transcribe-and-edit video by editing text; script drafts, captions, filler-word removal for your own footage. | Partial (limited API/integrations, unverified) | Free plan; Hobbyist ~$16/user/mo annual ($24 monthly); Creator ~$24 annual ($35 monthly); Business ~$50 annual ($65 monthly); Enterprise custom (third-party sources, verify) | Partly - editing is manual/UI-driven. |
| [Anthropic Claude API (LLM steps)](https://www.anthropic.com/pricing) | LLM used to: cluster/normalize product names, extract hook/structure patterns from ad metadata and transcripts you are allowed to use, write original script drafts, and summarize the weekly report. | Yes - Messages API and Message Batches API; n8n has an Anthropic node or use HTTP Request. | Haiku 4.5 ~$1 in / $5 out per million tokens; Sonnet ~$3 / $15 per million tokens; Batch API 50% off; prompt caching cuts repeated input cost (third-party aggregator figures, verify on anthropic.com/pricing). Weekly pipeline (~200 products normalized + 20 products x 3 scripts) estimated $1-6/week. | Yes - fully; human reviews all generated scripts before anything is posted. |

## Suppliers & dropship

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [Alibaba.com (Trending / Top-ranking products, Alibaba Product Insights)](https://www.alibaba.com) | Top-ranking and 'hot selling' supplier products by category, MOQ, tiered wholesale price, supplier verification; used to price an undercut. | Partial - no open public buyer API for rankings (unverified); Alibaba Open Platform aimed at sellers/ISVs. | Free to browse; samples/orders paid | Partly - manual; scraping restricted by ToS. |
| [CJ Dropshipping](https://cjdropshipping.com) | Product catalog with supplier price, per-country shipping quotes, US/EU warehouse stock, sourcing requests, POD, custom packaging. | Yes - CJ Developer API (developers.cjdropshipping.com): product list/detail, freight calculate, orders, inventory; API key from account. | Free to join; paid CJ PLUS/VIP tiers reported at ~$16-$60/month (verify). You pay product + shipping per order; warehouse storage free ~30-90 days then per-day fee. | Yes - the API returns product price and freight quotes, so an agent can compute landed cost per SKU automatically. |
| [Spocket](https://www.spocket.co/pricing) | US/EU supplier catalog with wholesale price, retail suggestion, shipping time; branded invoicing. | No public API (unverified) - works as a Shopify/Wix/Woo app. | Starter $39.99, Pro $59.99, Empire $99.99, Unicorn $299.99 per month; annual billing cheaper; 14-day free trial. | Partly - catalog browsing is manual inside the app; prices can be exported by hand. |
| [Zendrop](https://www.zendrop.com/pricing) | Product catalog with US fulfillment, branded packaging, auto-fulfillment. | No public API (unverified). | Free plan (limited); Pro ~$49/mo; Plus ~$79/mo (~$549/yr); usage-based Shopify billing option. | Partly - manual catalog; fulfillment auto after import. |
| [AutoDS](https://www.autods.com/pricing/) | Product research hub, multi-supplier import (AliExpress, CJ, Amazon, Walmart), price/stock monitoring and automatic repricing. | Partial - no public general API (unverified); built-in price/stock monitoring rules. | Shopify/Woo/Etsy: Import 200 $26.90, Starter 500 $39.90, Advanced 1,000 $66.90 per month ($19.90/$29.90/$49.90 annual); Amazon channel higher ($64.90-$149.90). | Yes - repricing rules run automatically inside AutoDS. |
| [Printful](https://www.printful.com/pricing) | Print-on-demand base cost per product/technique, shipping rates, branding add-ons. | Yes - Printful API (developers.printful.com): catalog, product prices, shipping rates, orders; token from dashboard. | Free to use; pay base cost + shipping per order. Bella+Canvas 3001 tee ~$11.50 base; US t-shirt shipping ~$4.69 first item (verify). Optional Printful Growth membership for discounts. | Yes - API gives catalog prices and shipping rate quotes. |
| [Printify](https://printify.com/pricing/) | POD base cost per print provider, shipping, Premium discount. | Yes - Printify API (developers.printify.com): catalog, print providers, variants with cost, shipping; personal access token. | Free plan; Premium ~$29/mo (~$24.99 annual) for up to ~20% off base costs. BC3001 tee ~$8.80-$11.40 base by provider; US tee shipping ~$3.99. | Yes - API lists every provider's cost, so an agent can pick the cheapest provider automatically. |
| [Alibaba.com](https://www.alibaba.com) | Factory/wholesale prices with MOQ tiers, supplier verification, Trade Assurance, RFQ. | No open buyer API for general use (unverified); Alibaba Open Platform is mainly for sellers/partners. | Free to browse and buy. Trade Assurance free to buyers (suppliers pay ~2-3%, often baked into price). Card/PayPal fees ~2.99-3.49% + fixed. | Partly - agent can draft RFQs and compute landed cost; supplier negotiation and sampling stay manual. |
| [AliExpress (Dropshipping Center)](https://ds.aliexpress.com) | Retail single-unit prices, shipping options and times, orders/reviews count, dropshipping product analytics. | Partial - AliExpress Open Platform (openservice.aliexpress.com) dropshipping APIs for product info, freight, and order placement; app approval needed. | Free; pay per order. Choice items often include faster/free shipping. | Partly - via Open Platform APIs if approved; otherwise manual. |
| [AliExpress Affiliate (Portals) API](https://portals.aliexpress.com) | Hot products, product details, supplier prices, affiliate links and commissions; doubles as landed-cost estimate for 'sell' path. | Yes - AliExpress Open Platform affiliate methods; hot product catalog may need Advanced API access. | Free; commissions typically ~2-9% by category (third-party). | Yes. |

## Marketplace fees

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [Amazon US referral + FBA fees](https://sell.amazon.com/pricing) | Category referral percentages, per-unit FBA fulfillment fee by size/weight tier, storage, aged-inventory and returns fees; 2026 schedule effective Jan 15 2026. | Partial - SP-API Product Fees API (getMyFeesEstimate) returns fee estimates for an ASIN at a price; needs a Professional seller account + registered SP-API developer app. | Individual plan $0.99 per item sold; Professional $39.99/month. Referral and FBA fees per sale. | Partly - with a Professional account an agent can call SP-API getMyFeesEstimateForASIN per ASIN/price. Without an account, the agent uses a fee table maintained by hand from the official page. |
| [TikTok Shop US seller fees](https://seller-us.tiktok.com/university) | Referral fee by category, new-seller discount, Fulfilled by TikTok (FBT) fees, and seller-set creator affiliate commission. | Partial - TikTok Shop Partner API (partner.tiktokshop.com) exposes orders, settlements and finance statements per order; requires approved app + seller authorization. | No monthly fee. Referral 6% on most categories (5% jewelry/pre-owned) per TikTok's public category table revised May 2026; a rise to 8% for most non-food categories effective Aug 4 2026 is reported by agencies (unverified on an official page). | Partly - with Partner API authorization an agent can read settlement lines and compute effective take rate; category table updates are manual. |
| [Etsy seller fees](https://www.etsy.com/legal/fees/) | Listing fee, transaction fee, payment-processing fee, Offsite Ads fee, currency conversion. | Partial - Etsy Open API v3 returns receipts/transactions and ledger entries (payment fees) for your own shop; requires OAuth app approval. | $0.20 per listing (4-month renewal); 6.5% transaction fee on item + shipping + gift wrap; US payment processing 3% + $0.25 per order; Offsite Ads 15% (12% for shops >$10k/yr) capped $100 per order; 2.5% currency conversion. | Partly - fee math is deterministic; Open API can reconcile actual fees for your own shop. |
| [eBay final value fees](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822) | Final value fee % by category, per-order fee, Store subscription discounts, promoted listings ad rate. | Partial - eBay Sell Finances API returns transaction fees; Browse API returns active listing prices for comparison (developer program, OAuth). | Most categories 13.6% of total sale (item + shipping + sales tax) up to $7,500, plus $0.30 per order if total <= $10 or $0.40 if > $10. 250 free listings/month; insertion $0.35 beyond. | Yes for comparison - Browse API search gives current competitor price + shipping; Marketplace Insights (sold data) is restricted access. |
| [Shopify plans + Shopify Payments](https://www.shopify.com/pricing) | Monthly plan fees, online card rates per plan, third-party gateway surcharge. | Yes - Shopify Admin API (GraphQL) for orders and transactions incl. fees on your store; Partner/custom app. | Basic $39/mo ($29 annual), Grow $105/mo ($79 annual), Advanced $399/mo ($299 annual); online cards 2.9%+$0.30 / 2.7%+$0.30 / 2.5%+$0.30; premium/Amex cards higher (~3.5/3.3/3.1%); +1% international cards (reported); third-party gateway surcharge 2% / 1% / 0.6%; 3-day free trial. | Yes - Admin API gives order + transaction fees for your own store; plan pricing is static. |
| [Walmart Marketplace referral + WFS fees](https://marketplace.walmart.com/referral-fees/) | Referral fee % by category (some price-tiered), WFS fulfillment and storage fees, new-seller incentives. | Partial - Walmart Marketplace APIs (developer.walmart.com) for items, orders, reports, settlement; approved sellers only. | No setup or monthly fee. Referral 6-20% by category (most 15%; electronics 8%; PCs 6%; jewelry 20%/5% split); WFS fulfillment from ~$3.45/unit; storage ~$0.75/cu ft/month. | Partly - fee table manual; settlement via API once approved. |
| [Amazon SP-API Product Fees API](https://developer-docs.amazon.com/sp-api/docs/product-fees-api-v0-reference) | Estimated referral + FBA fees for an ASIN at a given price. | Yes - getMyFeesEstimateForASIN (1 req/s, burst 2); batch getMyFeesEstimates (0.5 req/s). | Free with Professional seller account ($39.99/mo). | Yes once registered. |

## Price tracking

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [Keepa](https://keepa.com) | Full Amazon price history, sales-rank history (proxy for sales velocity), offer counts, Buy Box history, 'Product Finder' filters, category best-seller lists, deals; covers ~11 Amazon marketplaces. | Yes - Keepa API (REST), token-based. Product request ~1 token per ASIN (+6 per offer page). Also Best Sellers, Product Finder, Deals, Category endpoints. | Website Data subscription about EUR 19-29/mo (sources conflict). API: EUR 49/mo for 20 tokens/min, EUR 129 for 60/min, EUR 459 for 250/min, EUR 879 for 500/min, EUR 2,499 for 2,000/min, EUR 11,099 for 10,000/min (third-party list, July 2026). No free API tier. | Yes - API with Python lib 'keepa'. Tokens refill per minute and expire after 60 min, so batch jobs must pace. |
| [CamelCamelCamel](https://camelcamelcamel.com) | Free Amazon price history charts (Amazon, 3P new, used) and email price-drop alerts; Camelizer browser extension. | No public API. | Free (affiliate-funded). | Partly - alerts by email can be parsed; no API; scraping discouraged. |
| [Prisync](https://prisync.com/pricing/) | Competitor price and stock tracking across any web store by URL, dynamic pricing rules. | Yes on Premium+ - Prisync API. | Professional $99/mo (100 products), Premium $199/mo (API, dynamic pricing), Platinum $399/mo; free trial. | Yes - via API or exports. |
| [Price2Spy](https://www.price2spy.com) | URL-based competitor price monitoring, history, alerts, repricing. | Partial - API on higher/custom plans. | Starter ~$39.95/mo (500 URLs), Basic ~$157.95/mo (2,000 URLs), Premium custom; 14-day trial (third-party figures). | Yes - exports and API on higher plans. |
| [Keepa API](https://keepa.com/api-docs/plans-tokens.html) | Amazon price history, sales rank history (sales velocity proxy), offer counts, best seller lists, deals. | Yes - token-based REST API. | Paid: ~EUR49/mo for 20 tokens/min; ~EUR129/mo for 60 tokens/min (third-party figures). Product = 1 token; Best Sellers list ~50 tokens; offers +6 per page. | Yes - fully. |
| [SerpApi (Google Shopping / Google search)](https://serpapi.com/pricing) | Structured Google Shopping results: sellers, prices, ratings for a product query; also Google Trends engine. | Yes - REST API. | Free 250 searches/mo; Starter $25/mo 1,000; Developer $75/mo 5,000 (third-party 2026 figures). | Yes. |

## Analytics & demand

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [Kalodata](https://www.kalodata.com) | TikTok Shop product, shop, creator and video rankings with estimated GMV, units, trend, top-selling videos and livestreams; many countries. | No public API (unverified); exports on paid plans. | 7-day free trial (no card). App Store US list: Basic $45.99, Starter $49.99, Global Standard $61.99, UK Standard $89.99, US Standard $99.99, Professional $129.99 /mo; Enterprise ~$569-600/mo; extra AI credits paid. Japan moved to yen pricing May 2026. | Partly - export CSV; agent can analyze exports. No API so pulls are manual. |
| [FastMoss](https://www.fastmoss.com) | TikTok Shop products, shops, creators, videos and ad rankings with sales estimates and trends across ~15+ regions. | No public API (unverified). | Free limited tier; Basic ~$47-49/mo, Pro ~$72-89/mo, Ultimate ~$91-139/mo (annual vs monthly); extra seats $30-70/mo; 7-day trial (third-party, Sep 2026). | Partly - export only. |
| [EchoTik](https://echotik.live) | TikTok Shop products, creators, shops, videos and live data across 13+ countries; has a developer API. | Yes - EchoTik API (api.echotik.live) for product/creator/video data (paid, terms unverified). | Free plan; Basic ~$9.90-13.90/mo, Pro ~$19/mo, Enterprise ~$29/mo per user (third-party/vendor blog; unverified). | Yes - API available (cheapest programmatic TikTok Shop data found). |
| [Shoplus](https://www.shoplus.net) | TikTok Shop product, video, influencer and store analytics, trending products and ad data. | No public API (unverified). | Free tier; Basic ~$39, Premium ~$49, Professional ~$79 /mo (third-party). | Partly - export/manual. |
| [eRank](https://erank.com) | Etsy keyword search volume, trend buzz, top sellers, listing audits, monthly trending searches. | No public API. | Free plan; paid ~$5.99/mo Basic and ~$9.99/mo Pro (sources conflict; one lists $29.99 Pro). | Partly - manual/exports. |
| [Marmalead](https://marmalead.com) | Etsy keyword engagement, competition, seasonality and search trends. | No. | $19/mo monthly or ~$18/mo quarterly ($53/quarter); 14-day free trial; no free plan (official pricing page). | No - manual. |
| [EHunt (formerly EtsyHunt)](https://ehunt.ai) | Etsy product database with estimated sales and revenue per listing/shop, trending products, keyword tool. | No public API (unverified). | Free plan; paid $9.99-59.99/mo; Team $79.99/mo (annual 20-50% off). | Partly - export. |
| [Exploding Topics](https://explodingtopics.com) | Curated fast-growing topics and products before they peak, with growth %, search volume, category, and 'Trending Products' database (Amazon/TikTok linked). | Yes - Exploding Topics API on higher plans (unverified). | Free limited browsing; Entrepreneur ~$97/mo ($67 annual), Investor ~$197/mo ($147 annual), Business/Enterprise custom (2026 third-party; older listings $39-249). | Partly - API on top tier; else manual. |
| [Glimpse](https://meetglimpse.com) | Chrome extension adding absolute search volume, growth rate and forecasts to Google Trends; trend database and alerts. | Partial - API on paid tiers (unverified). | Free signup/extension with limits; paid tiers inside app (~$50+/mo, unverified). | Partly. |
| [Similarweb](https://www.similarweb.com) | Website traffic estimates, top products/brands on retailer sites (Shopper Intelligence for Amazon/Walmart), traffic sources incl. paid/social, top competitors. | Yes - Similarweb API (paid add-on / enterprise). | Free limited; Starter ~$149/mo ($125 annual), Professional ~$399/mo ($333 annual); Shopper Intelligence/enterprise ~$16k+/yr (third-party). | Partly - API costly; free UI manual. |
| [Semrush / Ahrefs (keyword demand)](https://www.semrush.com) | Search volume, CPC (proxy for buyer intent), keyword difficulty, competitor organic/paid keywords and ad copies (Semrush Advertising Research), Google Shopping/PLA research. | Yes - Semrush API (Business plan + API units); Ahrefs API (Enterprise). | Semrush Pro ~$139.95/mo, Guru ~$249.95, Business ~$499.95 (free account 10 queries/day). Ahrefs Starter $29/mo, base plans ~$129/mo, per-seat pricing from 2026; Ahrefs free Webmaster Tools and free keyword generator. | Partly - API on high tiers; CSV export otherwise. |
| [Motion (Creative Analytics)](https://motionapp.com/pricing) | Connects to YOUR ad accounts (Meta, TikTok, YouTube, LinkedIn) and visualises which creatives, hooks and formats win (hook rate, hold rate, ROAS); also competitor inspiration. | No public API (unverified) | Third-party reports conflict: Starter $250/mo (older page) vs $750/mo, Pro $1,200/mo, Growth quote-only; no free plan - verify | Partly - data pulls automatic once connected; analysis UI. |
| [Google Ads API - KeywordPlanIdeaService](https://developers.google.com/google-ads/api/docs/api-policy/access-levels) | Average monthly searches, 12-month search volume, competition index, top-of-page bid range per keyword. | Yes - requires Google Ads manager account, developer token with Basic access (Explorer/test tokens cannot use it) and permissible use 'Researching keywords'. | Free API; Basic access up to 15,000 operations/day. | Yes once token approved. |

## Other

| Name | What it shows | API | Cost | Agent can automate |
|---|---|---|---|---|
| [FTC Endorsement Guides (affiliate disclosure)](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking) | Legal disclosure rules for affiliate links and endorsements (revised 2023). | No | Free | Partly - agent can lint captions for a disclosure phrase. |
| [YouTube Data API v3 - captions](https://developers.google.com/youtube/v3/docs/captions/download) | captions.list lists caption tracks for any video; captions.download returns caption text only for videos you can edit (or where owner enabled third-party contributions). | Yes - YouTube Data API v3 (OAuth, scope youtube.force-ssl); captions.download costs 200 quota units of the 10,000/day default | Free (quota-limited) | Yes for own videos (API). No for others' videos - API returns 403 forbidden. |
| [TikTok auto-captions / Display API](https://developers.tiktok.com/) | TikTok in-app auto-captions show spoken words on screen for viewers; creators can edit captions on their own videos. Display API returns basic metadata of the authorised user's own videos. | Partial - Display API (own account video list/metadata); Research API for approved academic researchers only; no public caption export for others' videos (unverified) | Free | No for others' content; Yes for your own source files. |
| [FTC Endorsement Guides + Rule on Consumer Reviews and Testimonials](https://www.ftc.gov/legal-library/browse/rules/rule-use-consumer-reviews-testimonials) | US legal rules: disclose material connections (#ad, affiliate links), no fake or AI-generated reviews/testimonials, no undisclosed insider reviews, no buying positive reviews. | No | Free | Yes - an agent can run a compliance checklist on each script. |
| [TikTok Advertising Policies](https://ads.tiktok.com/help/article/tiktok-advertising-policies) | Rules for ad content: misleading claims, before/after, weight management (18+, no body shaming), health claims, prohibited products, branded content disclosure. | No | Free | Yes - agent can apply a checklist. |
| [Meta Advertising Standards](https://transparency.meta.com/policies/ad-standards/) | Rules for Facebook/Instagram ads: no personal attributes ('Are you overweight?'), restricted before/after imagery, misleading claims, branded content tool for creator partnerships. | No | Free | Yes - checklist. |
| [Copyright - using others' footage, music and scripts](https://www.copyright.gov/fair-use/) | Ad scripts, videos and music are copyrighted; reusing them in ads is commercial use and generally not fair use. | No | Free | No - legal judgement; agent can flag risk. |
| [USPS Ground Advantage / Pirate Ship rates](https://support.pirateship.com/en/articles/15453569-july-2026-usps-rate-and-rule-changes) | US domestic parcel shipping norms by weight and zone; 2026 rate changes. | Partial - USPS Web Tools/APIs (developer.usps.com) for rates; EasyPost/Shippo APIs. | 1 lb commercial ~ $7.61 (zone 1) to ~$10.67 (zone 8), zone 5 ~ $8.74; retail zone 5 ~ $10.95; includes temporary 8% adjustment from April 26 2026. | Yes - via rate APIs. |
| [US CBP de minimis end + duties](https://www.cbp.gov/trade/trade-enforcement/tftea/de-minimis) | Status of the $800 duty-free exemption and duty basis on low-value imports. | No - policy page; HTS lookup at hts.usitc.gov. | Free. | Partly - HTS lookup manual, then formula. |
| [Amazon Brand Registry / IP policy](https://brandservices.amazon.com) | How brand owners file trademark, copyright, counterfeit complaints; consequences for resellers. | No. | Free for brand owners with a registered/pending trademark. | Partly - trademark search can be automated via USPTO data; legal judgment is manual. |
| [n8n (Cloud or self-hosted) - pipeline orchestrator](https://n8n.io/pricing) | Workflow engine that runs the weekly pipeline: Schedule Trigger, HTTP Request, Apify node, Google Sheets node, LLM nodes, Wait/approval steps, webhooks. | Yes - n8n public REST API and webhooks; native nodes for Google Sheets, Apify, Anthropic/OpenAI, Slack, Gmail. | Self-hosted Community edition free (you pay server, ~$5-20/mo VPS). Cloud Starter ~EUR20-24/mo (2,500 executions, ~5 active workflows), Pro ~EUR50-60/mo (10,000 executions). One run = one execution regardless of step count (third-party 2026 figures, verify on n8n.io/pricing). | Yes - the whole schedule runs unattended; human only sets credentials once and approves rows weekly. |
| [Apify platform + Store Actors](https://apify.com/pricing) | Hosted scrapers (Actors) for TikTok Creative Center top ads, TikTok Shop products, Amazon best sellers, Meta Ad Library, Google Shopping, etc. Results land in a Dataset readable by API as JSON/CSV. | Yes - Apify REST API (run actor, waitForFinish, get dataset items) and official n8n Apify node; webhooks on run finish. | Free plan $5/mo platform credit; Starter $29/mo; Scale $199/mo; Business $999/mo. Compute ~$0.20/CU on Free/Starter. Many Store actors add per-result fees, e.g. TikTok Creative Center top-ads actors listed from ~$0.11 to ~$2.00 per 1,000 records (third-party/actor-page figures, verify). | Yes - fully via API; human approves which actors are allowed and sets spend caps. |
| [Google Sheets API (pipeline datastore)](https://developers.google.com/sheets/api/limits) | Acts as the database: tabs raw_signals, products, comparisons, decisions, scripts, review_queue, run_log. | Yes - Google Sheets API v4; native n8n Google Sheets node. | Free. Quotas: 300 read and 300 write requests/min per project, 60/min per user per project; no daily cap; batch requests count as 1. | Yes - read/write fully automated; humans review in the Sheet UI. |
| [FTC Endorsement Guides and Consumer Reviews Rule](https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews) | Rules for disclosing affiliate/material connections and banning fake reviews/testimonials - drives the compliance checklist in human review. | No | Free | Partly - LLM pre-check against checklist; human signs off. |

## Script frameworks and formulas

### Swipe-file to original script workflow
1. Collect 20-50 winning ads in your niche (Creative Center, Meta Ad Library, Kalodata, PiPiAds) - prefer ads running 30+ days or with high revenue.
2. Tag each: hook type, angle (pain, desire, curiosity), format (UGC talking head, demo, unboxing, green screen, before/after), length, offer, CTA.
3. Count which tags repeat most - that is the pattern, not any single ad.
4. Write your own script using the pattern + your product's real USP, your own words and your own footage.
5. Make 3-5 hook variants per body; test with small budgets; keep winners, kill losers in 48-72h.
6. Run each script through the compliance checklist (FTC, platform policy, copyright).

_Example (original):_ Pattern found: 7 of 10 top desk-organiser ads open on a messy-to-tidy reveal under 2 s and end with a bundle offer. Original script: [0-2s] hand sweeps clutter into a drawer that clicks shut - 'Thirty seconds. That's all my desk gets now.' [2-15s] show three compartments, cable slot, magnet lid. [15-22s] 'Two-pack is cheaper than one at the mall.' [CTA] 'Grab the bundle from the orange cart.'

### Hook types (first 1-3 seconds)
1. Call-out: name the audience ('Night-shift nurses...').
2. Bold claim/result (provable only).
3. Curiosity gap / open loop ('I didn't expect the cheap one to win').
4. Problem shown visually (spill, tangle, mess).
5. Pattern interrupt (unexpected motion, prop, sound).
6. Question ('Why does your phone die by 3pm?').
7. Negative/warning ('Stop buying refill pads until you see this').
8. Social proof (real number: 'Our 2,000th order shipped today').

_Example (original):_ 'If your dog treats your sofa like a napkin, watch this.' (on screen: dog wipes face on a cover, owner peels it off and tosses it in the wash)

### 3-second hook rules
1. Movement or a face in frame 0.
2. On-screen text that restates the hook (many watch muted).
3. Show the product or the problem within 2 s.
4. No logo intro or slow pans.
5. Measure: 3-second view rate / thumb-stop rate (aim to beat your account average; >25-30% is commonly cited as good, unverified).

_Example (original):_ Frame 0: close-up of cold coffee being poured out. Text: 'Never microwaving coffee again.' Voice: 'This mug keeps it hot for three hours.'

### Problem-Agitate-Solution (PAS)
1. Problem: state the pain plainly.
2. Agitate: make the cost of the pain concrete.
3. Solution: product as relief, with proof (demo).
4. CTA.

_Example (original):_ P: 'Charging cables everywhere?' A: 'Three chargers, still hunting one at midnight.' S: 'One stand, three devices, one cable.' CTA: 'Tap to get yours.'

### Before-After-Bridge (BAB)
1. Before: life with the problem.
2. After: life without it (realistic, not exaggerated).
3. Bridge: the product is how you get there.
4. Avoid body/weight before-after (restricted on TikTok/Meta).

_Example (original):_ Before: 'Sunday used to be three hours of meal prep.' After: 'Now it's forty minutes and I'm on the couch by noon.' Bridge: 'This stackable container set with the portion lids.'

### AIDA
1. Attention: hook.
2. Interest: surprising feature or fact.
3. Desire: benefit + proof + social proof.
4. Action: clear CTA with offer/urgency that is true.

_Example (original):_ A: 'This flashlight is also a power bank.' I: 'Charges your phone twice.' D: 'Fits in a glovebox, waterproof, real buyer reviews on screen.' A: 'Weekend price ends Sunday - link below.'

### UGC testimonial format
1. Use a REAL customer or a creator who actually received and used the product.
2. Selfie-style, natural light, talk to camera.
3. Structure: hook -> my problem -> what I tried -> this product -> results I saw -> who it's for -> CTA.
4. Disclose: #ad / Paid partnership if creator was compensated or got free product.
5. Never script false results or invented personas.

_Example (original):_ Creator (gifted product, disclosed): 'I've tried four pillow sprays and this is the first one my partner didn't complain about. Lavender, not perfume-y. It's in my cart now - #ad.'

### Demo / 'show don't tell'
1. Lead with the most visual feature.
2. One feature per 3-5 s cut.
3. Use real-time (uncut) demo for credibility.
4. End on the result shot + CTA.

_Example (original):_ 0-3s: knife sharpener, dull tomato squish. 3-10s: five pulls through the sharpener. 10-15s: same knife glides through tomato. Text: 'Five pulls.' CTA: 'Shop now.'

### CTA patterns
1. Direct: 'Tap Shop Now' / 'Tap the orange cart'.
2. Offer-led: 'Bundle saves 20% today' (must be true).
3. Low-friction: 'See colours' / 'Check if it fits your car'.
4. Affiliate: 'Link in bio - I earn a small commission'.
5. Repeat CTA in on-screen text and caption.

_Example (original):_ 'Check the two-pack price - it's in the yellow basket below. (I get a commission if you buy.)'

### Length norms (TikTok/Reels/Shorts)
1. TikTok in-feed direct response: 9-15 s for simple impulse products; 21-34 s often cited as TikTok's sweet spot (originates from a 2021 organic-video finding, not hard ad data).
2. Reels: 15-30 s; Stories 5-15 s.
3. YouTube Shorts ads: under 60 s, keep 15-30 s.
4. Test 3 lengths of the same script (short/medium/long) rather than trusting benchmarks.

_Example (original):_ Cut A 12 s (hook + demo + CTA), Cut B 24 s (adds 2 real reviews), Cut C 35 s (adds problem story). Same hook, compare CPA.

### Undercut / affiliate decision from ad research
1. For each winning product: note retail price in ads, number of active advertisers, ad run length, TikTok Shop affiliate commission.
2. If many sellers + high commission -> affiliate route (make your own video, earn commission, no inventory).
3. If few sellers, high price, cheap supplier -> own store at lower price or better bundle, with your own creatives.
4. Differentiate on offer (bundle, warranty, faster shipping) not on copying their ad.
5. Never use their brand name, logo or trademarked product name in your ad.

_Example (original):_ Competitor sells a heated eye mask at $39 with 12 active ads; supplier cost $8; TikTok Shop commission 15%. Options: affiliate at ~$5.85/sale, or own listing at $29 + free travel pouch with your own unboxing demo.

### Compliance checklist per script
1. All claims true and substantiated?
2. Any testimonial from a real user, with consent and disclosure?
3. Material connection disclosed (#ad, affiliate)?
4. No personal-attribute call-outs (Meta) or body shaming / weight before-after (TikTok)?
5. All footage, music, fonts owned or licensed?
6. No competitor trademark/footage?
7. Urgency/discount real?

_Example (original):_ Flagged: 'Are you diabetic? This tea fixes it.' -> rewrite: 'A caffeine-free evening tea with no added sugar.'

### Landed cost per unit
1. L = unit_cost + inbound_freight_per_unit + duty + broker_fees_per_unit + prep_packaging_per_unit + inspection_per_unit
2. duty = customs_value_per_unit x (base_HTS_rate + additional_tariff_rate)  (customs_value usually FOB price)
3. inbound_freight_per_unit = total_freight_quote / units  (or by volume share: freight_total x unit_cbm / total_cbm)
4. Dropship variant: L = supplier_price + supplier_shipping_to_customer (+ duty if not DDP); ship_cost below = 0 because supplier ships

_Example (original):_ Factory $4.00 FOB, freight $0.90/unit, duty 4.00 x 0.30 = $1.20, prep $0.40 -> L = $6.50.

### Per-platform fee functions F(P, S) where P = item price, S = shipping charged
1. Amazon FBA: F = max(r_cat x (P+S), 0.30) + fba_fee_tier (+ monthly storage share). r_cat = 0.15 most.
2. TikTok Shop: F = r_tt x (P+S) + c_creator x P + fbt_fee. r_tt = 0.06 (stress-test 0.08), c_creator seller-set e.g. 0.15.
3. Etsy: F = 0.20 + 0.065 x (P+S) + (0.03 x (P+S) + 0.25) [+ 0.15 x (P+S) capped 100 if Offsite Ads sale]
4. eBay: F = 0.136 x (P+S+tax) + (0.30 if P+S <= 10 else 0.40) [+ promoted_rate x (P+S)]
5. Shopify Basic: F = 0.029 x (P+S) + 0.30 + plan_monthly / orders_per_month + apps_monthly / orders_per_month
6. Walmart: F = r_wm x (P+S) + wfs_fee (r_wm 0.06-0.20)
7. Generic: F = pct x (P+S) + fixed_per_order

_Example (original):_ Etsy $20 item + $5 shipping: 0.20 + 1.625 + 1.00 = $2.83 fees.

### Contribution margin and break-even ROAS / CPA
1. Revenue R = P + S
2. CM_pre_ads = R - L - ship_cost - F(P,S) - return_rate x (L_lost + return_ship) - payment/other variable
3. CM% = CM_pre_ads / R
4. Break-even ROAS = R / CM_pre_ads = 1 / CM%
5. Break-even CPA = CM_pre_ads (max ad spend per order before loss)
6. Target ROAS = R / (CM_pre_ads - target_profit_per_order)
7. Profit per order at actual ROAS = CM_pre_ads - R / ROAS
8. Markup <-> margin: margin = markup / (1 + markup); markup = margin / (1 - margin)

_Example (original):_ R $30, L $6.50, ship $5, fees $3.90, returns $0.60 -> CM $14.00 (46.7%) -> BE ROAS 2.14, BE CPA $14.00; for $5 profit target ROAS = 30/9 = 3.33.

### Minimum viable price (solve for P)
1. Let all percentage costs on revenue be p_total = platform_pct + creator_pct + payment_pct + returns_pct + ad_pct, where ad_pct = 1 / planned_ROAS
2. Let all fixed per-order costs be C_fixed = L + ship_cost + fixed_fees + packaging
3. Require profit margin m on revenue: P_min = C_fixed / (1 - p_total - m)
4. Valid only if p_total + m < 1; otherwise product cannot work at that ROAS
5. If shipping is charged separately, solve for R and subtract S

_Example (original):_ C_fixed $11.80, platform 6% + creator 15% + returns 3% + ads 1/3 (ROAS 3) = 57.3%, m = 10% -> P_min = 11.80 / 0.327 = $36.12.

### Undercut test vs a competitor offer
1. Competitor effective price E = (price + shipping - coupon/discount) / units_in_bundle
2. Your effective price Y = (P + S - discount) / your_units
3. Candidate undercut P_u = E x (1 - u) with u e.g. 5-10%, or E - $1
4. Undercut is viable if P_u >= P_min and CM at P_u gives BE ROAS <= the ROAS you can realistically get (assume 1.5-2.5 for cold traffic)
5. If not viable: change offer instead of price (bundle 2-pack, faster shipping, better warranty) - compare value not price alone
6. Price-war guard: if competitor's 90-day Keepa low < P_min, do not enter on price

_Example (original):_ Competitor $34.99 free ship; P_min $36.12 -> straight undercut fails; sell a 2-pack at $54.99 ($27.50/unit) where L doubles but shipping/fees per order stay ~flat.

### Offer comparison score (rank competing offers)
1. Collect for each offer: effective unit price E, rating r (1-5), review_count n, delivery_days d, bundle/extras, return policy
2. Price score = min_E / E
3. Trust score = (r / 5) x min(1, log10(n+1) / 3)  (1,000 reviews = full credit)
4. Speed score = min(1, 3 / d)  (3 days or faster = 1)
5. Total = 0.40 price + 0.30 trust + 0.20 speed + 0.10 extras (0-1 judged)
6. Your offer must beat the leader on total, not only on price; weights editable

_Example (original):_ Leader $30, 4.5 stars, 2,000 reviews, 2 days vs you $27, 0 reviews, 7 days: you win price but lose trust and speed - fix by US warehouse and seeding reviews via creators.

### Affiliate vs sell decision
1. Affiliate earnings per sale A = price x commission_rate (TikTok creator commission or Amazon Associates rate)
2. Seller profit per sale = CM_pre_ads - ad_cost_per_order
3. Affiliate has no inventory, refund or IP risk; choose affiliate when A >= 50% of seller profit or when you lack capital/brand rights
4. Choose sell/undercut when you can reach P_min below market and own the listing (private label or authorized)

_Example (original):_ $30 item at 15% creator commission = $4.50 per sale risk-free vs ~$5 seller profit after ads with inventory risk -> start as affiliate, switch if volume proves out.

### MAP / trademark risk gate
1. Is the item a branded product? Check USPTO and Amazon Brand Registry signals.
2. If yes and you are not authorized: do not list it as that brand; build an unbranded/private-label equivalent with your own photos and copy.
3. If authorized reseller under MAP: advertised price must be >= MAP; undercut only via bundles/value if policy allows.
4. Never reuse competitor images, video, or ad script text; model the pattern only.
5. Avoid patented designs (search Google Patents for design patents).

_Example (original):_ A trending branded massage gun: sell an unbranded equivalent from a factory with your own name and photos, not the brand's listing.

### Undercut feasibility check
1. market_p25_price = 25th percentile of competitor prices across Amazon/Shopping/eBay/TikTok Shop.
2. our_target_price = market_p25_price * 0.95 (or match p25 with a differentiator such as bundle/faster shipping).
3. unit_profit = target_price - landed_cost - platform_fees - payment_fees - est_cpa - returns_allowance(5% of price).
4. undercut_feasible = unit_profit >= max($5, 20% of target_price).
5. If not feasible -> try affiliate path; if no affiliate >= 5% -> skip.

_Example (original):_ p25 $29.99 -> target $28.49; landed $7.80, fees $5.40, CPA $9, returns $1.42 -> profit $4.87 -> below $5 floor -> choose affiliate at 15% ($4.27/sale, no inventory) or skip.

### Sell vs affiliate decision rules
1. If undercut_feasible and capital_required <= budget and supplier sample approved -> sell.
2. Else if affiliate commission_per_sale >= $3 and program allows paid ads/organic content you plan -> affiliate.
3. Else if both possible: pick higher expected_profit_per_sale x estimated conversions, penalizing sell by 20% for inventory risk.
4. Otherwise skip and keep on watchlist 4 weeks.

_Example (original):_ Desk organizer: sell profit $8.10 vs affiliate $2.40 -> sell, pending sample.

### Pattern-to-original-script method
1. Extract only structure from top ads: hook type (problem callout, before/after, demo, contrarian), length, beat order, CTA type, visual style.
2. Store patterns as abstract labels, never the ad text.
3. Feed LLM: pattern label + your product facts + allowed claims + disclosure rule.
4. Generate 3 variants with different hooks; run similarity check against stored competitor captions; reject > 0.8 similarity.
5. Human edits for voice and compliance.

_Example (original):_ Pattern 'problem callout -> 3-second demo -> one proof point -> CTA'. Draft: 'Cables everywhere on your desk? This clips under in ten seconds. Holds six cords, no tools. Link below - I earn a commission if you buy.'

### Weekly cross-source trend sweep (agent plan)
1. Agent A (TikTok): pull Top Products (7d) and Top Ads sorted by CTR and CVR for 3 target categories in the US. Log the top 20 products and the hooks of the top 10 ads.
2. Agent B (search demand): for each product, query Google Trends (12 months, Shopping) and the YouTube Data API (review videos from the last 30 days). Tag each as Rising, Flat or Spiking-decaying.
3. Agent C (market proof): check Amazon Movers & Shakers and Best Sellers for the product. Record price, rating, review count and the top 3 complaints.
4. Agent D (competition): search the Meta Ad Library (US, active) for the product keyword. Count advertisers and ads running 30+ days, and note the price and offer on each landing page.
5. Score each product on demand trend, ad proof, competition count, margin room and complaint-fixability. A human picks: affiliate, undercut, improved version or skip.

_Example (original):_ Product: cordless mini massager. TikTok Top Products shows impressions up week over week, Google Shopping interest is rising, it is #14 on Amazon Movers & Shakers at $39 with a 4.1 rating and battery complaints, and 9 Meta advertisers have ads running 30+ days. Decision: source a longer-battery version priced at $34 and lead with the battery angle.

### Ad pattern teardown (study patterns, write your own)
1. Pick 5 ads with high CTR percentiles or long run times in the same niche.
2. For each ad, label the hook type (problem callout, shocking demo, before/after, 'I tried X', price reveal), the length, the second when the product appears, proof elements and the CTA wording.
3. Use the TikTok engagement timeline to note where viewers drop off.
4. Find the pattern shared by 3 or more ads. That is the format to test.
5. Write 3 original scripts using that pattern, your own product angle and wording drawn from Keyword Insights and Reddit pain-point language. Never reuse their footage, voiceover or exact lines.

_Example (original):_ Pattern: a 2-second visible problem, the product fixing it within 4 seconds, then a price anchor. Original script: 'My desk cables looked like spaghetti. [snap the clip on] Thirty seconds, done. Ten clips for less than a coffee - link below.'

### Late-or-early check
1. Compare the TikTok Top Products 7-day vs 30-day popularity.
2. Check the slope of the Google Trends 90-day curve.
3. Count new Meta advertisers that started in the last 14 days.
4. If interest is rising and the advertiser count is still low, you are early: test it. If interest is flat or falling and many advertisers are running, the market is saturated: promote it as an affiliate or skip it.

_Example (original):_ Rising Trends slope plus 3 Meta advertisers means early, so test a $50 ad budget. A flat slope plus 40 advertisers means saturated, so skip it or promote it only as an affiliate.

### Trend-to-margin funnel
1. Spot: pull risers from Amazon Movers & Shakers, TikTok Creative Center Top Products, Kalodata/FastMoss 7-day growth, Exploding Topics.
2. Confirm demand: Google Trends 5-year line (not a one-week spike), Semrush/Ahrefs volume and CPC, Keepa rank stable or improving 30+ days.
3. Measure competition: number of sellers (Keepa/Walmart report), review counts, eBay sell-through.
4. Price the undercut: AliExpress/Alibaba unit cost + shipping + duty + marketplace fees + ad cost per sale vs current selling price.
5. Decide path: margin >30% after ad cost -> sell; otherwise -> affiliate (Amazon Associates, TikTok Shop affiliate, AliExpress Portals, Walmart/eBay affiliate).

_Example (original):_ A collapsible silicone kettle shows up on Movers & Shakers 4 days running, Keepa rank improves for 6 weeks, Google Trends rising. Sells at $34; AliExpress cost $9 + $5 shipping + ~$5 fees = $19, leaving $15 before ads. If test ads cost under $8 per sale, sell it; if not, promote the Amazon listing as an affiliate.

### Cross-platform price comparison table
1. For each candidate, record: Amazon price/rank (Creators API or Keepa), eBay avg sold price (Product Research), Etsy price range (Open API), TikTok Shop GMV and price (Kalodata), AliExpress cost and commission (affiliate API), Walmart presence.
2. Flag gaps: high price on one platform vs low cost on AliExpress = undercut opportunity; product absent from a platform = expansion gap.
3. Rank by (price - landed cost) x demand score.

_Example (original):_ Row: 'LED pet collar' - Amazon $22 (rank 1,800 in Pet), eBay sold avg $15, TikTok Shop $19 with $40k 7-day GMV, AliExpress $3.10 at 7% commission; not sold on Walmart -> candidate to list on Walmart and eBay at $17.

### Agent automation plan for this research
1. Agent 1 (daily): Keepa bestsellers + product endpoints for 10-20 target categories; store rank deltas.
2. Agent 2 (daily): AliExpress hotproduct.query for matching categories; store cost and commission.
3. Agent 3 (weekly): Google Merchant Center Best Sellers BigQuery table; eBay Browse API price spread; Etsy listings scan.
4. Human (weekly): export Kalodata/FastMoss top products and TikTok Creative Center Top Products (no API), drop CSVs in a folder for the agents.
5. Agent 4: merge into one comparison sheet, compute margin and demand score, shortlist top 10 with links to the top-selling videos for ad-pattern study.

_Example (original):_ Monday report: '3 new risers in Kitchen; best margin: magnetic spice rack ($27 Amazon vs $6 AliExpress, rank up 40% in 14 days); top TikTok video uses a before/after clutter reveal in the first 2 seconds.'

### Affiliate vs undercut decision
1. Find a trending product (TikTok Shop sales, Amazon Movers & Shakers).
2. Look up the same item via eBay Browse API, Awin/CJ feeds, AliExpress API for landed cost.
3. Compute affiliate earnings per sale = price x commission.
4. Compute own-sell margin = price - (supplier cost + shipping + marketplace fees + ad cost per sale).
5. If margin < 2x affiliate earnings or brand is trademarked/patented, choose affiliate; otherwise test selling.

_Example (original):_ A $30 posture corrector pays 15% on TikTok Shop ($4.50). AliExpress landed cost $7, fees ~$5, ads ~$9: own-sell margin ~$9. Affiliate first to validate, then sell a bundled variant.

### Program stacking per product
1. Check if the product is on TikTok Shop (highest rate).
2. Else Amazon or Walmart Creator link.
3. Add YouTube Shopping tag for long-form.
4. Track per-link EPC in a sheet weekly.

_Example (original):_ Video on TikTok uses showcase link; same review on YouTube tags the Amazon listing; blog links Walmart where cheaper.

### Disclosure template
1. Say it in the first seconds of the video.
2. Write it next to the link.
3. Turn on platform paid-partnership label.

_Example (original):_ Spoken: 'Heads up, I earn a small commission if you buy through my link.' Caption: '#ad - commission link below.'

## Trending now (snapshot, early October 2026)

As of 2026-10-08 the strongest evidence points to: (1) K-beauty collagen/PDRN skincare (medicube, Dr.Melaxin) - TikTok Shop #1 through July and featured by Amazon for Prime Big Deal Days, though cooling on TikTok in August; (2) wellness supplements, led by magnesium complexes (Toplux #1 on TikTok Shop in Aug) and GLP-1 companion nutrition (fiber, protein); (3) home cleaning and kitchen appliances (Shark, Ninja SLUSHi) rising into Q4; (4) holiday toys/collectibles (Pokemon 30th anniversary, KPop Demon Hunters licensed lines, squishy/sensory toys, blind boxes). Q4 context: Adobe forecasts $275.1B US online holiday spend (+6.7%), Black Friday Nov 27, Cyber Monday Nov 30, TikTok Shop campaign ~Nov 11-30; Halloween window is closing. Ad patterns performing: result-first hooks, honest unpolished UGC, talking-head 'yapper' and self-skit formats, with statics/carousels for retargeting. Much licensed/branded demand is IP-protected, so affiliate links are often safer than undercutting.

| Trend | Signal | Evidence |
|---|---|---|
| Adobe Digital Insights 2026 holiday forecast | strong | Adobe forecasts $275.1B US online spend Nov 1-Dec 31 2026 (+6.7% YoY); Cyber Week $47.5B (+7.4%, 17.3% of season); AI-referred retail traffic +130% YoY; BNPL $21.3B. Adobe also expects early-deal spending to pull demand into October. [source](https://secure.businesswire.com/news/home/20260928285775/en/Adobe-U.S.-Holiday-Shopping-Season-to-Hit-Record-%24275.1-Billion-Online-Rising-6.7-YoY) |
| Deloitte 2026-27 holiday retail forecast (via MarketScale) | strong | Deloitte projects US holiday e-commerce $316.1B-$318.9B (Nov 2026-Jan 2027, +7.5% to +8.4%) vs total holiday retail +4% to +4.8% ($1.70-1.71T). Online growing ~2x faster than retail overall. [source](https://www.marketscale.com/industries/retail/holiday-e-commerce-will-reach-up-to-319-billion-this-season-deloitte-forecasts) |
| NRF 2026 Halloween survey | strong | Record $13.5B expected (~$115/person). Costumes $4.4B (71% of shoppers), decor $4.3B, pet costumes $0.92B (pumpkin, hot dog, ghost top picks). ~1/3 compare prices; 34% want reusable items; 47% use AI tools to shop; online search for costume ideas down to 32% (decade low). [source](https://nrf.com/media-center/press-releases/nrf-halloween-survey-shows-consumer-spending-expected-to-reach-13-5-billion) |
| Amazon Prime Big Deal Days 2026 (Amazon newsroom) | strong | Event ran Oct 6-7 2026. Amazon featured up to 50% off trending K-beauty (medicube, Dr.Jart+), up to 40% off kitchen appliances (Ninja, Keurig, Crock-Pot), big-screen TVs. Amazon featuring medicube corroborates the K-beauty trend seen on TikTok Shop. [source](https://www.aboutamazon.com/news/retail/prime-big-deal-days-best-deals-savings-2026) |
| FastMoss - Best-selling TikTok Shop products US Q2 2026 | strong | #1 medicube PDRN Pink Collagen Volume Multi Balm ~$16.99M; #2 Toplux Magnesium Complex 8-in-1 ~$14.23M; #3 medicube Glass Glow set ~$10.24M; #4 Dr.Melaxin collagen set ~$9.26M. Top 10 = $89.3M spanning skincare, supplements, home appliances. Skincare 3 of top 4, supplements 3 of top 9. [source](https://www.fastmoss.com/blog/best-selling-tiktok-shop-products-us-q2-2026/) |
| NetInfluencer - Top 10 TikTok Shop products August 2026 | strong | Toplux (magnesium) took #1 in Aug despite revenue down 2nd straight month; medicube's 4-month #1 run ended and its 3 listings fell out of top 10; Shark returned with 2 products incl. a stain cleaner (#9); Ninja SLUSHi frozen drink maker returned higher; ADDWIN Fascia Ring R10 #10 at $1.58M (down from #6, $1.78M in July). [source](https://www.netinfluencer.com/?p=53276) |
| NetInfluencer - Top 10 highest-revenue TikTok Shops August 2026 | medium | Shark Home jumped from #10 to #2 shop by revenue in Aug 2026 - home cleaning appliances are a rising TikTok Shop category heading into Q4. [source](https://www.netinfluencer.com/top-10-highest-revenue-tiktok-shops-in-august-2026/) |
| Amazon Toys We Love 2026 list | strong | Top 100+ toys: Pokemon (30th anniversary), Marvel, PAW Patrol; Pokemon Guess Who?, Peekimo interactive creature, Shrek holiday plush, Magna-Tiles; squishy/sensory toys called a major trend (also via GMA/Today coverage). [source](https://www.aboutamazon.com/news/retail/best-gifts-kids-amazon-toys-we-love-list-2026) |
| Pokemon TCG 30th Celebration set - demand and scalping coverage | medium | Set launched Sept 16 2026; Pokemon Center pre-orders sold out almost instantly; reports of resale well above MSRP (e.g. top-trainer box >200 EUR vs 55 EUR MSRP, single report); retailers got 2-3x usual stock. [source](https://games.gg/news/pokemon-tcg-30th-celebration-where-to/) |
| Exploding Topics - Blind box trends (Labubu / Pop Mart) | medium | Pop Mart 2025 revenue reported >$4-5B (sources differ), 20+ US mall/outlet openings planned 2026; Labubu blind box $27.99, resale often 2x. Bag-charm/wearable mini collectibles spreading (Build-A-Bear bag charms). Counterfeit 'lafufu' risk high. [source](https://explodingtopics.com/blog/blind-box-trends) |
| Exploding Topics - trending topics pages | weak | Topic pages showed e.g. remineralizing gum (+5100%), GLP-1 supplement (+1150%), soursop bitters (+1011%). Page undated - treat as directional. [source](https://explodingtopics.com/blog/find-trending-products) |
| GLP-1 companion products (NutritionInsight + ASInsight Amazon ranking) | medium | Demand shifting to fiber, protein, hydration, lean-muscle support for GLP-1 users; ASInsight Amazon tracker (June 2026) shows psyllium (~50K units/mo est.) and prebiotic fiber (~40K) leading 'GLP-1 support'. Herbalife launched GLP-1 companion combos. [source](https://www.nutritioninsight.com/news/glp1-companion-products-metabolic-health-innovations.html) |
| Magnesium trend (Cosmetics Business) | medium | >725K TikTok posts under #magnesium; 'sleepy girl mocktail' drove search; spread to powders, gels, bath products. Still alive in 2026 given Toplux magnesium #1-#2 on TikTok Shop. [source](https://cosmeticsbusiness.com/how-magnesium-mania-hit-the-beauty-industry-2025) |
| EchoTik / third-party TikTok Shop 2026 trending lists | weak | Lists liquid multivitamins, magnetic eyelashes, posture correctors, skincare kits, magnetic phone chargers, snail mucin serum, heatless curling sets. NexScope adds that $20-40 demonstrable products with visible transformation do best. [source](https://www.echotik.live/blog/best-tiktok-shop-products-trending-2026-top-ecommerce-picks/) |
| TikTok Shop BFCM 2026 seller playbooks (AfterShip / Nexscope) | medium | Expected campaign ~Nov 11-30; Black Friday Nov 27, Cyber Monday Nov 30; creator sample selection reportedly opens Oct 18; US creator challenge Nov 1-Dec 1; eligibility rules (performance score >=3.5, free-ship threshold <=$30). TikTok reported >$500M peak BFCM 2025 GMV (secondary). [source](https://www.aftership.com/blog/tiktok-shop-bfcm-2026-playbook) |
| ShopBack Black Friday 2026 category timing | weak | Deepest BF categories: TVs, laptops, headphones, consoles, kitchen appliances (air fryers, espresso, blenders), sneakers, gift beauty sets. Predicted hot items: Beyblade X, Jellycat, KPop Demon Hunters toys, LEGO Pokemon, Nintendo Switch 2. Real median discounts ~25-40%. [source](https://www.shopback.com/blog/savings/black-friday-2026-us-playbook) |
| KPop Demon Hunters toy rollout (Outlook Respawn / Bloomberg) | medium | After 2025 shortage (Bloomberg Nov 2025), lines from Mattel/Hasbro/Spin Master/Funko rolling out through holiday 2026. Expected top Q4 licensed gift; no 2026 sell-through data found. [source](https://respawn.outlookindia.com/pop-culture/pop-culture-news/kpop-demon-hunters-collectibles-update-toy-fair-2026) |
| Hook performance 2026 (GetHookd / Benly / Motion) | medium | Result-first hooks top early-2026 analysis (~2x views of lowest type); other reliable types: question, creator testimonial, pattern interrupt, authentic/unpolished. Benly benchmark: UGC-style TikTok hook rate 41% vs 29% polished; CTR 1.02% vs 0.71% (polished wins recall). Motion talk (Jul 2026) highlights 'yapper' talking-head, self-skit and fast-cut formats. [source](https://www.gethookd.ai/learn/5-best-hooks-for-tiktok-ads-in-2026-types-examples-tips/) |
| UGC fatigue and TikTok Next 2026 (Pixis / Segwise) | medium | TikTok Next 2026 trend themes summarized as shift to honest, lived-in content; scripted ring-lit testimonials and faux-enthusiastic demos wearing out (Pixis). Cited claim ads lose ~half effectiveness in ~72h (Sovran via Segwise) - weak. [source](https://segwise.ai/blog/tiktok-next-2026-trend-report-performance-marketer-playbook) |
| Meta static vs video 2026 (Segwise 67K-ad study) | medium | Median account ~61% static / 39% video (2025 data). Consensus 2026: phone-shot UGC video for cold prospecting, statics/carousels for retargeting and visual products; statics are fast to iterate. [source](https://segwise.ai/blog/static-video-ratio-meta-ads) |
| Google Trends (Shopping category, Rising) | weak | No dated Sept/Oct 2026 rising-shopping list found in public stories; tool must be checked directly. Seasonal norm: Sept-Nov rising queries for cozy home, holiday prep, gifts. [source](https://trends.google.com/trends/explore?cat=18&geo=US) |
| Kalodata Japan weekly TikTok Shop report | weak | Week of Feb 23 2026: GMV 1.36B JPY (+36.7% WoW), beauty +108.8%, health +94.7%, food +58.1%. Shows Kalodata publishes weekly; no Sept 2026 US report found. [source](https://netshop.impress.co.jp/index%2Ephp/r/prtimes/items/000000013.000167462) |

## Sources

- https://adlibrary.com/posts/eu-dsa-ad-repositories-developers
- https://admakeai.com/blog/google-ads-transparency-center
- https://admanage.ai/blog/facebook-ads-library-api
- https://ads.tiktok.com/business/creativecenter
- https://ads.tiktok.com/help/article/about-target-collaborations-in-seller-center
- https://ads.tiktok.com/help/article/creative-center
- https://ads.tiktok.com/help/article/how-to-use-top-products
- https://ads.tiktok.com/help/article/top-products
- https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-weight-management
- https://adstransparency.google.com/
- https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/api-rates
- https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation
- https://affiliate-program.amazon.com/help/operating/schedule
- https://affiliate.amazon.co.jp/creatorsapi
- https://affiliates.walmart.com/faqs
- https://affiliatexblocks.com/docs/amazon-creators-api/
- https://affmaven.com/minea-pricing/
- https://affninja.com/adspy-pricing-plans/
- https://affninja.com/pipiads-pricing/
- https://afftank.com/blog/clickbank-affiliate-marketing
- https://amazonsellerslawyer.com/amazon-ip-complaint-trademark
- https://api.echotik.live/guides/echotik-vs-kalodata
- https://apify.com/fetch_cat/tiktok-ads-library-scraper
- https://apify.com/pricing
- https://apify.com/store
- https://benly.ai/learn/ad-creative/ad-creative-benchmarks-2026
- https://blog.youtube/news-and-events/youtube-shopping-amazon-creator-affiliates/
- https://botize.com/en/method/aliexpress_associates/search_hotproduct
- https://brandservices.amazon.com
- https://branvas.com/blogs/news/printful-vs-printify
- https://camelcamelcamel.com
- https://checkoutpage.com/blog/etsy-fees
- https://cjdropshipping.com
- https://cloud.google.com/blog/topics/developers-practitioners/how-get-started-political-ads-transparency-report-dataset
- https://community.ebay.com/t5/RESTful-Buy-APIs-Browse/itemAffiliateWebUrl-not-returned-in-browse-search-request-when/m-p/34694673
- https://community.pinterest.biz/t/list-trending-keywords-access/2617
- https://conductatlas.com/platform/tiktok/tiktok-terms-of-service/prohibition-on-scraping-and-data-extraction/
- https://content.dash.fi/blog/rakuten-affiliate-advertising-program-review-2023
- https://contentstudio.io/blog/affiliate-disclosure-on-social-media
- https://cosmeticsbusiness.com/how-magnesium-mania-hit-the-beauty-industry-2025
- https://costbench.com/software/web-scraping/apify/
- https://costbench.com/software/web-scraping/serpapi/
- https://creatify.ai/blog/foreplay-pricing-(2026)-plans-credits-and-what-you-ll-actually-pay
- https://creatify.ai/blog/kalodata-pricing-plans-and-what-you-ll-actually-pay-in-2026
- https://creatify.ai/blog/motion-pricing-(2026)-plans-credits-and-what-you-ll-actually-pay
- https://creatorflow.so/blog/walmart-creator-program/
- https://creatorsagency.co/blog/tiktok-shop-affiliate-requirements-2026
- https://delzonic.com/blogs/fastmoss-pricing-2026/
- https://dev.to/esteban_ortega/pytrends-is-dead-heres-how-to-get-google-trends-data-in-2026-1a18
- https://dev.to/pavithran_25/how-to-legally-scrape-youtube-videos-using-the-youtube-data-api-5bk0
- https://dev.to/th3nate/amazon-pa-api-v5-is-shutting-down-april-30-2026-here-is-what-changes-at-the-auth-layer-22ek
- https://developer-docs.amazon.com/sp-api/docs/product-fees-api-v0-reference
- https://developer.awin.com/apidocs/retail-publisher-productapidocumentation-1
- https://developer.ebay.com/api-docs/buy/browse/overview.html
- https://developer.ebay.com/api-docs/buy/marketplace-insights/overview.html
- https://developer.ebay.com/develop/buying-apps/research-apis
- https://developer.ebay.com/develop/get-started/api-call-limits
- https://developer.walmart.com/us-marketplace/docs/top-trending-items
- https://developers.google.com/google-ads/api/docs/api-policy/access-levels
- https://developers.google.com/search/apis/trends
- https://developers.google.com/search/blog/2025/07/trends-api
- https://developers.google.com/sheets/api/limits
- https://developers.google.com/youtube/v3/determine_quota_cost
- https://developers.google.com/youtube/v3/docs/captions/download
- https://developers.google.com/youtube/v3/docs/errors
- https://developers.google.com/youtube/v3/getting-started
- https://developers.google.com/youtube/v3/guides/implementation/videos
- https://developers.pinterest.com/docs/analytics-and-reports/trends/
- https://developers.tiktok.com/blog/2024-tiktok-shop-affiliate-apis-launch-developer-opportunity
- https://developers.tiktok.com/products/commercial-content-api
- https://dig.watch/?p=263096
- https://digistore24.com/pricing
- https://diyai.io/ai-tools/speech-to-text/openai-whisper-api-pricing-2026/
- https://docs.apify.com/legal/data-processing-addendum
- https://docs.celigo.com/hc/en-us/articles/18704697472667
- https://docs.cloud.google.com/bigquery/docs/merchant-center-best-sellers-schema
- https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.googlesheetstrigger/
- https://ds.aliexpress.com
- https://ecomcircles.com/blog/walmart-marketplace-fees/
- https://entreresource.com/fastmoss-vs-kalodata/
- https://explodingtopics.com/blog/blind-box-trends
- https://explodingtopics.com/blog/find-trending-products
- https://flowlister.com/blog/ebay-final-value-fees-explained/
- https://games.gg/news/pokemon-tcg-30th-celebration-where-to/
- https://getlasso.co/amazon-affiliate-commission-rate/
- https://getpulsesignal.com/alternatives/erank
- https://getpulsesignal.com/pricing/fastmoss
- https://ggb-law.com/?p=7724
- https://goodmorningamerica.com/shop/story/top-trending-toys-2026-136566666
- https://guidedimports.com/blog/alibaba-trade-assurance-overview/
- https://help.shopify.com/en/manual/promoting-marketing/collabs/creators/payments
- https://impact.com/news/impact-com-creator-platform-product-marketplace-july-september/
- https://jentic.com/apis/aliexpress.com/aliexpress.md
- https://joinotto.com/influencer-programs/temu
- https://keepa.com
- https://keepa.com/api-docs/plans-tokens.html
- https://marketplace.walmart.com/nss-influencer
- https://marketplace.walmart.com/referral-fees/
- https://marmalead.com/pricing
- https://metapi.io/compare/facebook-ad-library-api
- https://moda.app/blog/linkedin-ad-library
- https://moda.app/blog/tiktok-creative-center
- https://motionapp.com/library/talk/15-proven-ugc-ad-hooks-that-are-working-right-now-savannah-sanchez/
- https://n8n.io/pricing
- https://nbcnews.com/select/shopping/october-prime-day-dates-2026-rcna597737
- https://netshop.impress.co.jp/index%2Ephp/r/prtimes/items/000000013.000167462
- https://news.adobe.com/news/downloads/pdfs/2026/09/adi-holiday-forecast-release-9-26.pdf
- https://newsroom.tiktok.com/en-ie/support-body-positivity-on-tiktok
- https://newsroom.tiktok.com/tiktoks-research-api-and-commercial-content-library?lang=en-GB
- https://novoads.ai/en/blog/snapchat-ads-library
- https://nrf.com/media-center/press-releases/nrf-halloween-survey-shows-consumer-spending-expected-to-reach-13-5-billion
- https://octolens.com/blog/reddit-api-pricing
- https://outlierkit.com/resources/glimpse-pricing/
- https://partnernetwork.ebay.com/solutions/step-1-understanding-cookies-commissions-and-getting-paid
- https://pixis.ai/blog/ugc-in-2026-whats-working-whats-stale-and-how-to-refresh-your-hook-library/
- https://ppc.land/a-deep-dive-into-the-google-ads-transparency-center/
- https://ppc.land/google-opens-alpha-testing-for-new-trends-api-targeting-developers-and-journalists/
- https://pricingsaas.com/companies/helium10
- https://pricingsaas.com/companies/junglescout
- https://printify.com/pricing/
- https://printify.com/printify-vs-printful/
- https://prisync.com/pricing/
- https://providers.apievangelist.com/providers/cj-affiliate/
- https://respawn.outlookindia.com/pop-culture/pop-culture-news/kpop-demon-hunters-collectibles-update-toy-fair-2026
- https://revenuegeeks.com/bigspy-pricing/
- https://revenuegeeks.com/helium-10-pricing/
- https://revenuegeeks.com/keepa-pricing/
- https://revenuegeeks.com/software/autods/pricing
- https://revenuegeeks.com/software/etsyhunt/pricing
- https://revenuegeeks.com/software/keepa/api
- https://secure.businesswire.com/news/home/20260928285775/en/Adobe-U.S.-Holiday-Shopping-Season-to-Hit-Record-%24275.1-Billion-Online-Rising-6.7-YoY
- https://segwise.ai/blog/static-video-ratio-meta-ads
- https://segwise.ai/blog/tiktok-next-2026-trend-report-performance-marketer-playbook
- https://sell.amazon.com/pricing
- https://seller-us.tiktok.com/university
- https://sellingpartners.aboutamazon.com/update-to-u-s-referral-and-fulfillment-by-amazon-fees-for-2026
- https://snap.com/political-ads
- https://softwarefinder.com/sales-tools/price2spy
- https://sonix.ai/resources/descript-pricing/
- https://stackmatix.com/blog/tiktok-creative-best-practices-2026
- https://storyboard18.com/amp/digital/youtube-opens-shopping-affiliate-program-to-creators-with-500-subscribers-93649.htm
- https://success.awin.com/articles/en_US/Knowledge/What-are-the-payment-thresholds
- https://superscale.ai/alternatives/foreplay/pricing
- https://superscale.ai/alternatives/motion/pricing
- https://support.google.com/merchants/answer/14815514
- https://support.google.com/merchants/answer/6288242?hl=en
- https://support.google.com/youtube/answer/13376398?hl=en
- https://support.pirateship.com/en/articles/15453569-july-2026-usps-rate-and-rule-changes
- https://talkbusiness.net/2026/09/nrf-2026-halloween-spending-expected-to-rise-3-82/
- https://techcrunch.com/2025/07/10/youtube-is-getting-rid-of-its-trending-page-and-trending-now-list
- https://transparency.meta.com/en-us/researchtools/ad-library-tools
- https://trends.google.com/trends/explore?cat=18&geo=US
- https://tryatria.com/pricing
- https://uppromote.com/affiliate-directory/aliexpress/
- https://uppromote.com/affiliate-program-directory/aliexpress
- https://uppromote.com/affiliate-program-directory/partnerstack
- https://use-apify.com/docs/apify-for-developers/apify-n8n-integration
- https://wsgr.com/en/insights/ftc-issues-final-rule-banning-fake-and-misleading-consumer-reviews-and-testimonials.html
- https://www.aboutamazon.com/news/retail/best-gifts-kids-amazon-toys-we-love-list-2026
- https://www.aboutamazon.com/news/retail/prime-big-deal-days-best-deals-savings-2026
- https://www.admapix.com/blog/ad-intelligence/google-ads-transparency-center-guide
- https://www.affiversemedia.com/meta-launches-facebook-affiliate-partnerships-what-it-means-for-your-program/
- https://www.aftership.com/blog/tiktok-shop-bfcm-2026-playbook
- https://www.alibaba.com
- https://www.amazon.com/gp/bestsellers
- https://www.anthropic.com/pricing
- https://www.asinsight.com/report/US/glp1-support
- https://www.autods.com/pricing/
- https://www.awin.com/us/news-and-events/awin-news/shareasale-to-awin-upgrade
- https://www.bebolddigital.com/news/tiktok-shop-8-percent-referral-fee
- https://www.capterra.com/p/153451/Prisync/pricing/
- https://www.cbp.gov/trade/trade-enforcement/tftea/de-minimis
- https://www.cometly.com/post/how-long-should-a-tiktok-ad-be
- https://www.dashboardly.io/post/tiktok-shop-affiliate-commissions-2026-payouts-clawbacks-profit-math
- https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822
- https://www.ebay.com/help/selling/selling-tools/terapeak-research-and-SEO?id=4853
- https://www.echotik.live/blog/best-tiktok-shop-products-trending-2026-top-ecommerce-picks/
- https://www.echotik.live/blog/echotik-pricing-plans-features-2025-comparison/
- https://www.edesk.com/blog/amazon-movers-and-shakers/
- https://www.emarketer.com/content/reddit-launches-ama-ads-pro-trends-boost-ad-capabilities
- https://www.etsy.com/developers/documentation/getting_started/api_basics
- https://www.etsy.com/legal/fees/
- https://www.facebook.com/ads/library/
- https://www.facebook.com/ads/library/api/
- https://www.fastmoss.com/blog/best-selling-tiktok-shop-products-us-q2-2026/
- https://www.fastmoss.com/blog/tiktok-shop-seller-costs-in-the-us-2026-fees-creator-commissions-fulfillment-returns-real-profit/
- https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews
- https://www.gethookd.ai/learn/5-best-hooks-for-tiktok-ads-in-2026-types-examples-tips/
- https://www.hackceleration.com/labs/atria-pricing
- https://www.hackceleration.com/labs/compare/semrush-vs-ahref
- https://www.helium10.com/pricing/
- https://www.hubfluence.io/blog/kalodata-review-alternative
- https://www.jetadmin.io/blog/n8n-pricing/
- https://www.junglescout.com/pricing/
- https://www.khlaw.com/insights/ftc-finalizes-rule-against-fake-reviews-and-testimonials
- https://www.makeinfluence.com/en/academy/amazon-associates-vs-amazon-influencer-program-whats-actually-different
- https://www.makeinfluence.com/en/academy/etsys-creator-collective-and-affiliate-program-how-creators-actually-earn-from-etsy
- https://www.makeinfluence.com/en/academy/the-ebay-partner-network-ebays-native-affiliate-program-for-creators
- https://www.manatt.com/insights/newsletters/advertising-law/an-in-depth-look-at-the-ftcs-updates-2
- https://www.manatt.com/insights/newsletters/advertising-law/an-in-depth-look-at-the-ftcs-updates-to-the-endor
- https://www.marketscale.com/industries/retail/holiday-e-commerce-will-reach-up-to-319-billion-this-season-deloitte-forecasts
- https://www.morphllm.com/anthropic-claude-api-pricing
- https://www.nerdwallet.com/article/small-business/shopify-pricing
- https://www.netinfluencer.com/?p=53276
- https://www.netinfluencer.com/meta-expands-facebook-creator-affiliate-program-as-part-of-deeper-push-into-social-commerce/
- https://www.netinfluencer.com/top-10-highest-revenue-tiktok-shops-in-august-2026/
- https://www.netinfluencer.com/top-10-products-sold-on-tiktok-in-june-2026/
- https://www.nexscope.ai/blog/tiktok-shop-trending-products
- https://www.nutritioninsight.com/news/glp1-companion-products-metabolic-health-innovations.html
- https://www.omnisend.com/blog/shopify-collabs/
- https://www.ordio.com/en/tools/roas-calculator
- https://www.price2spy.com
- https://www.printful.com/pricing
- https://www.relevantaudience.com/google-ads-en/what-is-roas-formula-break-even-roas-target-roas/
- https://www.saaspricepulse.com/tools/similarweb
- https://www.sellersprite.com/en/blog/helium-10-pricing-2026-guide
- https://www.ship.com/post/cheapest-way-to-ship-a-package-2026
- https://www.shopback.com/blog/savings/black-friday-2026-us-playbook
- https://www.shopifreaks.com/amazon-quietly-slashed-associates-affiliate-commission-rates-by-up-to-50-across-publisher-ecosystem-and-gutted-reporting-tools/
- https://www.shopify.com/blog/how-long-can-a-tiktok-be
- https://www.shopify.com/pricing
- https://www.sirency.com/blog/walmart-creator-program
- https://www.socialmediatoday.com/news/TikTok-Adds-Top-Products-info-to-Creative-Center/643190/
- https://www.spocket.co/blogs/cjdropshipping-overview
- https://www.spocket.co/pricing
- https://www.stackscored.com/pricing/dropshipping-suppliers/cjdropshipping/
- https://www.today.com/shop/amazon-top-toys-2026-rcna596578
- https://www.toolsurf.com/exploding-topics-review-2026-trend-discovery-tool-features-pricing-worth-it-2026-plans-features-best-deals-compared/
- https://www.toolsurf.com/shoplus-review-2026-tiktok-analytics-product-research-tool-group-buy-2026-premium-access-for-just-0-99/
- https://www.trendtrack.io/blog-post/minea-pricing
- https://www.trustradius.com/compare-products/fastmoss
- https://www.trustradius.com/products/pipiads/pricing
- https://www.vatcalc.com/united-states/us-ends-800-duty-free-de-minimis-on-chinese-imports/
- https://www.zendrop.com/pricing
