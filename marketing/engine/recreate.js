'use strict';
// Recreate loop: write -> rate -> originality check -> revise, until the script passes.
const core = require('./core');

const MODEL = process.env.SCRIPT_ENGINE_MODEL || 'claude-opus-5-5';

// Default writer: Claude via the official SDK. Server-side fallbacks ("default") re-run a
// declined request on Anthropic's recommended fallback model inside the same call.
function claudeWriter({ effort = 'medium', model = MODEL } = {}) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY
  return async (prompt) => {
    const stream = client.beta.messages.stream({
      model,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort },
      messages: [{ role: 'user', content: prompt }],
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') throw new Error('The model declined to write this script. Change the product facts or style and retry.');
    const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    if (!text) throw new Error(`Empty response (stop_reason: ${msg.stop_reason}).`);
    return text;
  };
}

// opts: { product, sourceDigest, library: [entries], targetSeconds, minScore, rounds, style, write }
async function recreate(opts) {
  const { product, sourceDigest = null, library = [], targetSeconds = 30, minScore = 75, rounds = 4, style = '' } = opts;
  const write = opts.write || claudeWriter(opts);
  const attempts = [];
  let previous = '';
  let feedback = '';
  let avoid = [];
  for (let round = 1; round <= rounds; round++) {
    const prompt = core.recreatePrompt({ sourceDigest, product, targetSeconds, style, avoid, feedback, previous });
    const script = (await write(prompt)).trim();
    const rating = core.rate(script, { targetSeconds });
    const check = core.originality(script, library);
    attempts.push({ round, script, score: rating.total, verdict: check.verdict, fixes: rating.fixes, worst: check.worst });
    if (check.verdict === 'original' && rating.total >= minScore) {
      return { ok: true, script, rating, check, attempts };
    }
    // Build the revision brief for the next round.
    const notes = [];
    if (check.verdict !== 'original') {
      for (const m of check.matches.filter((x) => x.sharedShingles > 0)) {
        const entry = library.find((e) => e.id === m.id);
        for (const p of core.overlaps(script, entry && entry.fingerprint)) if (!avoid.includes(p)) avoid.push(p);
      }
      notes.push(`- Too similar to an existing script (${check.verdict}, ${Math.round(check.worst.containment * 100)}% shared phrasing). Reword the flagged phrases completely.`);
    }
    if (rating.total < minScore) notes.push(...rating.fixes.map((f) => `- ${f}`));
    feedback = notes.join('\n');
    previous = script;
  }
  const best = attempts.filter((a) => a.verdict === 'original').sort((a, b) => b.score - a.score)[0] || null;
  return { ok: false, script: best ? best.script : null, attempts };
}

module.exports = { MODEL, claudeWriter, recreate };
