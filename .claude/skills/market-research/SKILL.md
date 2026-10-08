---
name: market-research
description: Find trending products and top-performing sales videos and ad scripts, compare the market, and decide whether to sell, undercut or promote as an affiliate. Includes a weekly agent pipeline, 125 sources (trend and ad libraries, product data, affiliate programs, suppliers, marketplace fees), product scoring, margin, minimum-price and break-even ROAS formulas, and 32 script frameworks. Use when a user asks what to sell, what's trending, how competitors advertise, or whether a price or affiliate deal makes money.
---

# Market research

Files: `marketing/MARKET-RESEARCH.md` (the full plan and every source) and
`marketing/data/market.json`, which has:
- `pipeline`: 7 steps, each with inputs, tools, outputs, `human`, cost and cautions
- `scoring`
- `sources[]`: name, category, url, api, free, notes; `category` includes
  affiliate
- `frameworks[]`
- `snapshot`
- `fee_presets`
- `rules`

Web: the Market research tab, which has a calculator.

## Weekly pipeline (Monday; review Mon–Tue; post Wed–Sun)
1. **Collect signals.**
   - APIs: YouTube Data, Google Ads keyword ideas, Keepa, Meta Ad Library
     (EU/UK), TikTok Commercial Content (EU), Reddit.
   - The human does a 15–30 minute manual export of TikTok Creative Center Top
     Products/Ads, Kalodata/FastMoss and the US Meta Ad Library.
2. **Normalize and score.** Cluster titles into products, then score:
   - demand growth 30%
   - margin or commission 25%
   - competition 20%
   - ad saturation 15%
   - affiliate availability 10%
3. **Compare the market** for the top 20: competitor prices (p25 and median),
   ratings, shipping, active ads and the longest-running ad.
4. **Decide sell, affiliate or skip** with the formulas below. A human
   approves every "sell" (inventory risk).
5. **Draft scripts:** hand off to the `script-engine` skill.
6. **Human review:** FTC disclosure, claims, originality, ad policy.
7. **Hand off to posting:** the `social-posting` skill.

## Formulas (P = price)
- **Fees:** P × (platform% + payment%) + fixed
- **Profit per sale:** P − fees − unit cost (product + shipping) − ad cost per
  sale
- **Minimum price:** (unit + CPA + fixed) / (1 − platform% − payment% −
  target margin%)
- **Break-even ROAS:** P / (P − fees − unit)
- **Undercut:** feasible only if the minimum price is below the competitor's
  price by the amount you plan to cut.
- **Affiliate:** compare commission% × P against profit per sale minus capital
  risk. With no supplier edge, affiliate usually wins.

## Rules
- **Prefer APIs and manual exports.** Scraping TikTok, Meta or Amazon breaks
  their terms; flag any scraper as a ToS risk and let the human decide.
- **Study patterns, never copy ads.** Store structure, not text; the
  script-engine enforces this.
- **Disclose.** Affiliate and paid posts need #ad or the platform's
  paid-partnership toggle. Check MAP pricing and trademark rules before
  undercutting.
- **Mark prices as dated.** The snapshot is from 2026-10. Re-check prices and
  fees before advising money decisions.
