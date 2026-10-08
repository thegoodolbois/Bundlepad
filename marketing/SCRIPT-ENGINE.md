# Script engine: digest → recreate → rate → adjust → no duplicates

A program that learns from scripts that already sell, writes a new script for
your product, and refuses to hand you anything copied, whether from a source or
from your own past posts.

- **Code:** [`engine/`](engine/). [`core.js`](engine/core.js) has no
  dependencies and runs in Node and in the browser. [`cli.js`](engine/cli.js) is
  the command line, and [`recreate.js`](engine/recreate.js) is the Claude rewrite
  loop.
- **In the browser:** the **Script engine** tab on the guide page (`#script`).
  It digests, rates and checks scripts, and builds the prompt. The CLI runs the
  full automatic loop.

## The loop

1. **Ingest.** Add scripts that work for someone else: ad transcripts, ad-library
   copy, your own notes. `node cli.js add ad.txt --title "posture ad" --origin <url>`
   The library keeps only the **structure** (beats, hook type, length) and a
   **fingerprint**, which is hashed 5-word phrases. The source text is never
   stored, so the library can't republish it.
2. **Digest.** `node cli.js digest ad.txt` splits the script into beats: hook
   (with its type: question, stop/command, number, curiosity, pain point, bold
   claim, POV), problem, agitate, solution, proof, offer, CTA. It also reports
   words and seconds at 2.5 words a second.
3. **Recreate.**
   `node cli.js recreate --product product.json --from <library id | ad.txt>`
   Claude writes a new script for your product that follows the source's
   **structure only**. It uses only the facts you list in `product.json` (see
   [`engine/examples/product.json`](engine/examples/product.json)).
4. **Rate.** Each draft gets a score from 0 to 100:
   - hook 25%
   - structure 20%: problem, solution, proof and CTA all present
   - clarity 15%: sentence length
   - claim safety 15%: flags guarantees, "cures", income and weight claims
   - length vs target 10%
   - talking to the viewer 10%
   - specificity 5%

   Every lost point comes with a fix.
5. **Adjust.** If the draft scores under `--min-score` (75 by default), or is
   too close to anything in the library, the fixes go back to Claude. The
   copied phrases are listed as "do not use", and Claude revises. This repeats
   for up to `--rounds` rounds (4 by default).
6. **No duplicates.** A draft passes only when its verdict is **original**. The
   engine never returns a duplicate, even as a fallback.
7. **History.** `--save` (or `node cli.js accept posted.txt`) adds the scripts
   you post to history. Every later script is checked against them too, so
   daily and weekly posts don't repeat. `--count 7` writes a week of scripts,
   and each one must also differ from the others in the batch.

## How "original" is decided

The engine compares the candidate's 5-word phrases with each source and each
past post. Two measures are used:
- **shared:** the share of the candidate's phrases found in one source;
- **run:** the longest run of consecutive words copied from it.

| Verdict | Rule (tunable in `core.js` `LIMITS`) | What happens |
|---|---|---|
| `original` | under 6% shared and under a 7-word run | passes |
| `too_close` | 6% shared or more, or a 7-word run | the copied phrases are listed for rewording |
| `duplicate` | 15% shared or more, or a 10-word run | rejected; `check` exits with code 2 |

Light edits don't get past it. Swapping a few words in a copied ad still
leaves long matching runs.

## Commands

```bash
cd marketing/engine && npm install          # once; installs @anthropic-ai/sdk
export ANTHROPIC_API_KEY=...                # only needed for recreate
node cli.js add examples/source-ad.txt --title "posture ad"
node cli.js list
node cli.js digest examples/source-ad.txt
node cli.js recreate --product examples/product.json --from examples/source-ad.txt --count 7 --save
node cli.js rate my-script.txt --seconds 30
node cli.js check my-script.txt             # original | too_close | duplicate (exit 2)
node cli.js accept my-script.txt            # I posted this; refuses a repeat
node cli.js recreate --product examples/product.json --prompt-only   # no key: paste the prompt into any AI
```

Options:
- `--library <path>` (default `./script-library.json` or `$SCRIPT_LIBRARY`)
- `--json` for machine-readable output
- `--effort low|medium|high|xhigh|max`
- `--style "casual, first person"`

## Claude settings

- **Model:** `claude-opus-5-5`. Override it with `SCRIPT_ENGINE_MODEL`.
- **Effort:** `medium` by default.
- **Request:** streamed, up to 16,000 output tokens.
- **Fallbacks:** server-side fallbacks are on (`fallbacks: "default"`, beta
  `server-side-fallback-2026-07-01`). If Claude declines a request, the API
  re-runs it on Anthropic's recommended fallback model in the same call. A
  refusal from the whole chain stops with a clear message. To turn fallbacks
  off, delete the `betas` and `fallbacks` lines in `recreate.js`.

## Which video goes where

- **Ads:** the recreated script plus an AI-generated video (your generator of
  choice).
- **Daily and weekly posts:** the recreated script plus a compilation cut from
  licensed footage, following the procedure in
  [VIDEO-SOURCING.md](VIDEO-SOURCING.md).

Run `check` on each day's script before posting, and `accept` it after posting.

## Tests

`cd marketing/engine && npm test` covers fingerprinting, duplicate and
too-close detection (including lightly edited copies), the digest, the rating,
the recreate loop (with a fake writer, so no API key is needed), and the CLI.
The CLI tests check that the library never contains source text and that
repeats are refused.
