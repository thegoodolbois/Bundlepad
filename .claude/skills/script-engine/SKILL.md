---
name: script-engine
description: Digest sales and ad scripts that work, recreate an original script for the user's product with Claude, rate it 0-100, revise until it passes, and block duplicates of any source or of the user's past posts (plagiarism and repeat protection for daily/weekly content). Use when a user gives you a script, transcript or ad copy to learn from, wants a new script for their product, wants a script rated, or wants to check a script isn't copied or repeated.
---

# Script engine

Code: `marketing/engine/` (`core.js`, `cli.js`, `recreate.js`, `library.js`).
Docs: `marketing/SCRIPT-ENGINE.md`. Web: the Script engine tab, which does
digest, rate, check and builds the prompt, but has no API calls.

## Setup
```sh
cd marketing/engine && npm install       # @anthropic-ai/sdk
export ANTHROPIC_API_KEY=...             # the human creates it at console.anthropic.com; only `recreate` needs it
```
The library is `./script-library.json`; change it with `--library <path>` or
`$SCRIPT_LIBRARY`. Add `--json` to any command for machine-readable output.

## Loop
1. **Ingest** each source:
   `node cli.js add source.txt --title "..." --origin <url>`.
   Only structure and hashed 5-word fingerprints are stored, never the text.
2. **Digest** with `node cli.js digest source.txt`, which gives:
   - the hook type: question, stop/command, number, curiosity, pain point,
     bold claim, POV
   - beats: problem, agitate, solution, proof, offer, CTA
   - words and seconds
3. **Product file.** Write `product.json`:
   `{name, description, audience, facts[], offer}`.
   - `facts` are the only claims the script may use. Get them from the human.
   - Template: `engine/examples/product.json`.
4. **Recreate:**
   `node cli.js recreate --product product.json --from <library id|file> [--seconds 30] [--count 7] [--min-score 75] [--rounds 4] [--style "..."] [--effort medium] --save`
   - Claude writes the script, and the engine rates it and checks
     originality.
   - The fixes and copied phrases are fed back, and Claude revises, until the
     score reaches `--min-score` and the verdict is `original`.
   - Exit code 1 means some script didn't pass.
5. **Check before posting:** `node cli.js check script.txt`.
   - The verdict is `original`, `too_close` (6% shared or a 7-word run) or
     `duplicate` (15% shared or a 10-word run; exit code 2).
   - Only post `original`.
6. **Accept after posting:** `node cli.js accept posted.txt` (refuses a
   repeat). Every future script is checked against it, which is what keeps
   daily and weekly posts from repeating.

**No API key:** run `recreate ... --prompt-only` and paste the prompt into any
AI. Then save the reply, and run `rate` and `check` on it.

## Rules
- Hand the human the script for approval before it's posted. Claims must come
  from `facts`.
- Never bypass a `duplicate` verdict. `--force` on `accept` is for the human
  only.
- Claude settings in `recreate.js`:
  - model `claude-opus-5-5` (override: `SCRIPT_ENGINE_MODEL`)
  - effort `medium`
  - streaming
  - server-side fallbacks (`fallbacks: "default"`, beta
    `server-side-fallback-2026-07-01`)
  - a refusal stops with a message
