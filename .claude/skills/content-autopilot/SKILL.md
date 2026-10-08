---
name: content-autopilot
description: Run a user's whole content operation end to end - pick what to promote, write original scripts, make videos (AI video for ads, licensed compilations for daily/weekly posts), and publish on a schedule to their own accounts. Chains the market-research, script-engine, video-sourcing and social-posting skills with human approval gates. Use when a user says "automate my content", "post daily/weekly for me", or wants a full marketing pipeline.
---

# Content autopilot

This skill chains the four marketing skills. Load each one when you reach its
step.

## One-time setup (with the human)
1. **Accounts and posting routes.** Use the `social-posting` skill. For each
   platform, the human does the `human_steps` from `marketing/data/setup.json`,
   and you do the `agent_steps` and a test post. Prefer one hub (Postiz or
   Buffer).
2. **Product facts.** For each product, write `product.json` (name,
   description, audience, approved `facts[]`, offer). The human signs off on
   the facts.
3. **Keys.** `ANTHROPIC_API_KEY` (script engine), stock API keys (Pexels,
   Pixabay), the hub API key. All of them go in a secret store.
4. **Cadence.** Agree on posts per platform per day or week, within each
   platform's `limits`. Agree on the review window, for example Mon–Tue
   review and Wed–Sun posting.
5. **Ad vs post split.** Ads use an AI-generated video. Daily and weekly
   organic posts use a compiled video from licensed footage.

## Each week
1. **Research** (`market-research`). Refresh trends, score the products, and
   decide sell, affiliate or skip. The human approves every "sell".
2. **Learn** (`script-engine`). `add` this week's top-performing scripts or
   transcripts as sources (structure only).
3. **Write** (`script-engine`). Run
   `recreate --product product.json --from <id> --count <posts this week> --save`.
   Every script must pass at `original` with a score of at least 75.
4. **Approve.** Send the scripts to the human, through Telegram, email or the
   hub's approval queue. Edit, then run `check` again.
5. **Make videos.**
   - Organic: `video-sourcing`, giving final.mp4, captions, a license log and
     a compliance gate.
   - Ads: the user's AI video generator, from the same script.
6. **Publish** (`social-posting`). Queue in the hub, or call the APIs on
   schedule. Use a per-platform caption, hashtags and #ad or the
   paid-partnership toggle where it applies. Turn on AI labels.
7. **Record.** Run `accept` on each posted script, so it never repeats. Log
   the post URLs.
8. **Measure.** Pull views, CTR and sales from the platform APIs or the hub.
   Feed the winners back as sources next week; their structure, not their
   text.

## Schedule options
- cron or a systemd timer on the user's server
- an n8n Schedule Trigger with a Wait node for approvals
- GitHub Actions on a schedule
- the hub's own queue

## Never
- Post without the human's approval of the script and the video, unless they
  explicitly turn that off for organic posts.
- Use copied scripts, other creators' videos, unlicensed music, or claims
  outside `facts`.
- Automate a normal user account through browser bots.
