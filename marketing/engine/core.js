/*
 * Script engine core: digest, rate and originality-check ad/video scripts.
 * No dependencies; works in Node (require) and in the browser (window.ScriptEngine).
 *
 * Originality uses fingerprints: an ordered list of hashed 5-word shingles.
 * A fingerprint can detect copied passages (shared shingles and the longest
 * run of consecutive shared words) without storing the original text.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ScriptEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SHINGLE = 5;               // words per shingle
  const WORDS_PER_SECOND = 2.5;    // typical voiceover pace
  // Verdict thresholds (tunable). containment = share of the candidate's shingles found in a source.
  const LIMITS = { duplicate: { containment: 0.15, run: 10 }, tooClose: { containment: 0.06, run: 7 } };

  // ---- text basics --------------------------------------------------------------
  function normalize(text) {
    return String(text || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const words = (text) => (normalize(text) ? normalize(text).split(' ') : []);
  function sentences(text) {
    return String(text || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  }

  // 32-bit FNV-1a, as an 8-char hex string.
  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }

  // Ordered shingle hashes. Short texts (< SHINGLE words) get one shingle of all their words.
  function fingerprint(text) {
    const w = words(text);
    if (!w.length) return [];
    if (w.length < SHINGLE) return [fnv1a(w.join(' '))];
    const out = [];
    for (let i = 0; i + SHINGLE <= w.length; i++) out.push(fnv1a(w.slice(i, i + SHINGLE).join(' ')));
    return out;
  }

  // ---- similarity between a candidate and one source -----------------------------
  // Accepts texts or fingerprints (arrays of hashes).
  function compare(candidate, source) {
    const a = Array.isArray(candidate) ? candidate : fingerprint(candidate);
    const b = Array.isArray(source) ? source : fingerprint(source);
    if (!a.length || !b.length) return { containment: 0, jaccard: 0, longestRunWords: 0, sharedShingles: 0 };
    const setB = new Set(b);
    let shared = 0;
    for (const h of new Set(a)) if (setB.has(h)) shared++;
    const union = new Set([...a, ...b]).size;
    // Longest run of consecutive candidate shingles that appear consecutively in the source.
    const pos = new Map();
    b.forEach((h, i) => { if (!pos.has(h)) pos.set(h, []); pos.get(h).push(i); });
    let best = 0;
    let prev = new Map(); // source index -> current run length ending there
    for (const h of a) {
      const next = new Map();
      for (const j of pos.get(h) || []) {
        const len = (prev.get(j - 1) || 0) + 1;
        next.set(j, len);
        if (len > best) best = len;
      }
      prev = next;
    }
    const uniqA = new Set(a).size;
    return {
      containment: shared / uniqA,
      jaccard: shared / union,
      longestRunWords: best ? best + SHINGLE - 1 : 0,
      sharedShingles: shared,
    };
  }

  // Checks a candidate against a library of sources (originals) and your own past scripts.
  // library: [{ id, kind: 'source'|'history', title, fingerprint: [...] } | { ..., text }]
  function originality(candidate, library, limits = LIMITS) {
    const fp = fingerprint(candidate);
    const matches = (library || []).map((entry) => {
      const m = compare(fp, entry.fingerprint || fingerprint(entry.text || ''));
      return { id: entry.id, kind: entry.kind || 'source', title: entry.title || entry.id, ...m };
    }).sort((x, y) => (y.containment - x.containment) || (y.longestRunWords - x.longestRunWords));
    const worst = matches[0] || { containment: 0, longestRunWords: 0 };
    let verdict = 'original';
    if (worst.containment >= limits.duplicate.containment || worst.longestRunWords >= limits.duplicate.run) verdict = 'duplicate';
    else if (worst.containment >= limits.tooClose.containment || worst.longestRunWords >= limits.tooClose.run) verdict = 'too_close';
    return { verdict, worst: matches[0] || null, matches: matches.slice(0, 5), limits };
  }

  // The candidate's own phrases that overlap a source fingerprint (so they can be rewritten).
  // Returns merged word ranges from the candidate text; the source text is never needed.
  function overlaps(candidate, sourceFingerprint) {
    const w = words(candidate);
    const src = new Set(sourceFingerprint || []);
    const hit = new Array(w.length).fill(false);
    if (w.length < SHINGLE) { if (src.has(fnv1a(w.join(' ')))) hit.fill(true); }
    else for (let i = 0; i + SHINGLE <= w.length; i++) if (src.has(fnv1a(w.slice(i, i + SHINGLE).join(' ')))) for (let k = i; k < i + SHINGLE; k++) hit[k] = true;
    const out = [];
    for (let i = 0; i < w.length; i++) {
      if (!hit[i]) continue;
      let j = i; while (j < w.length && hit[j]) j++;
      out.push(w.slice(i, j).join(' ')); i = j;
    }
    return out;
  }

  // ---- digest: structure of a script --------------------------------------------
  // Checked in order; the first match wins.
  const BEAT_RULES = [
    ['cta', /\b(link in bio|shop now|tap|click|order|grab yours|get yours|buy|use code|comment|follow|save this|try it|check out|add to cart|before it'?s gone)\b/i],
    ['offer', /\b(\d+%\s*off|discount|deal|sale|free shipping|bundle|limited|only \$?\d|price|bonus|code)\b/i],
    ['proof', /\b(reviews?|stars?|customers?|sold|tested|results?|before and after|clinically|studies|proven|people (are|have))\b/i],
    ['solution', /^(then|so|now|that'?s why|meet|introducing|until|enter)\b|\b(i found|i tried|i switched|this (little|tiny|new|one))\b/i],
    ['agitate', /\b(worse|tired|sick of|waste|every (single )?(time|day|morning|night)|nothing (works|worked|helped)|again and again|frustrat|annoying|hate)\b/i],
    ['problem', /\b(problem|struggle|can'?t|don'?t|never|hard to|hurts?|pain|stiff|issue|mess|forever|stuck)\b/i],
    ['solution', /\b(this|with (this|the)|it (just|actually|literally)|works?|fix(es)?|solves?|changed)\b/i],
  ];
  const HOOK_TYPES = [
    ['question', /\?\s*$/],
    ['stop/command', /^(stop|wait|don'?t|never|quit|listen|watch)\b/i],
    ['number/stat', /\b\d+(\.\d+)?(%|x|k)?\b/i],
    ['secret/curiosity', /\b(secret|nobody|no one|hidden|didn'?t know|weird|trick|hack|why)\b/i],
    ['pain point', /\b(tired of|sick of|hate|struggle|can'?t|problem)\b/i],
    ['bold claim', /\b(best|only|changed my|game ?changer|life ?changing|obsessed|must[- ]have)\b/i],
    ['pov/story', /^(pov|me when|story ?time|so i|i (just|finally|tried))\b/i],
  ];
  function classifySentence(s, index) {
    if (index === 0) return 'hook';
    for (const [beat, re] of BEAT_RULES) if (re.test(s)) return beat;
    return 'body';
  }
  function digest(text) {
    const sents = sentences(text);
    const w = words(text);
    const hook = sents[0] || '';
    const hookType = (HOOK_TYPES.find(([, re]) => re.test(hook)) || ['statement'])[0];
    const beats = sents.map((s, i) => ({ beat: classifySentence(s, i), text: s, words: words(s).length }));
    const order = beats.map((b) => b.beat).filter((b, i, arr) => b !== arr[i - 1]);
    const you = w.filter((x) => x === 'you' || x === 'your' || x === "you're").length;
    return {
      words: w.length,
      seconds: Math.round((w.length / WORDS_PER_SECOND) * 10) / 10,
      sentences: sents.length,
      hook, hookType, hookWords: words(hook).length,
      structure: order,
      beats,
      hasCta: beats.some((b) => b.beat === 'cta'),
      hasProof: beats.some((b) => b.beat === 'proof'),
      hasOffer: beats.some((b) => b.beat === 'offer'),
      youRatio: w.length ? Math.round((you / w.length) * 1000) / 10 : 0,
      numbers: (String(text).match(/\b\d[\d,.%x]*\b/g) || []).length,
    };
  }

  // ---- rate: 0-100 with reasons and fixes ----------------------------------------
  const RISKY = /\b(guarantee[ds]?|cures?|miracle|100% (safe|effective|natural)|risk[- ]free|instant(ly)? (results|weight)|lose \d+ ?(lbs|pounds|kg)|doctors hate|fda approved|get rich|overnight)\b/i;
  function rate(text, opts = {}) {
    const target = opts.targetSeconds || 30;
    const d = digest(text);
    const scores = {};
    const fixes = [];
    // Hook: short (<= 12 words), a recognized hook type, spoken within ~2-3 s.
    scores.hook = Math.max(0, 100 - Math.max(0, d.hookWords - 8) * 8 - (d.hookType === 'statement' ? 30 : 0));
    if (d.hookType === 'statement') fixes.push('Open with a stronger hook: a question, a number, a pain point or a bold claim.');
    if (d.hookWords > 12) fixes.push(`Shorten the hook to under 12 words (now ${d.hookWords}).`);
    // Length fit vs target.
    const diff = Math.abs(d.seconds - target) / target;
    scores.length = Math.round(Math.max(0, 100 - diff * 150));
    if (diff > 0.25) fixes.push(`Aim for about ${target}s (now ~${d.seconds}s, ${d.words} words).`);
    // Structure: problem/solution/proof/CTA present.
    const need = ['problem', 'solution', 'proof', 'cta'];
    const have = need.filter((b) => d.structure.includes(b) || (b === 'problem' && d.structure.includes('agitate')));
    scores.structure = Math.round((have.length / need.length) * 100);
    for (const b of need.filter((x) => !have.includes(x))) fixes.push(`Add a ${b === 'cta' ? 'clear call to action' : b} beat.`);
    // Clarity: average sentence length 6-14 words.
    const avg = d.sentences ? d.words / d.sentences : 0;
    scores.clarity = Math.round(Math.max(0, 100 - Math.max(0, avg - 14) * 7 - Math.max(0, 5 - avg) * 10));
    if (avg > 14) fixes.push(`Shorter sentences read better on video (average now ${avg.toFixed(1)} words).`);
    // Viewer focus and specificity.
    scores.viewer = Math.min(100, Math.round(d.youRatio * 12));
    if (d.youRatio < 4) fixes.push('Talk to the viewer more ("you", "your").');
    scores.specific = Math.min(100, 40 + d.numbers * 20);
    if (!d.numbers) fixes.push('Add one concrete detail (a number, a time, a result you can prove).');
    // Claims that get ads rejected.
    const risky = sentences(text).filter((s) => RISKY.test(s));
    scores.safety = risky.length ? Math.max(0, 100 - risky.length * 40) : 100;
    if (risky.length) fixes.push(`Remove or prove risky claims: ${risky.map((s) => `"${s}"`).join(' ')}`);
    const weights = { hook: 0.25, structure: 0.2, length: 0.1, clarity: 0.15, viewer: 0.1, specific: 0.05, safety: 0.15 };
    const total = Math.round(Object.entries(weights).reduce((s, [k, wt]) => s + scores[k] * wt, 0));
    return { total, scores, fixes, digest: d };
  }

  // ---- prompt for recreating a script (used by the CLI and by copy-paste) -----------
  function recreatePrompt({ sourceDigest, product, targetSeconds = 30, style = '', avoid = [], feedback = '', previous = '' }) {
    const beats = (sourceDigest && sourceDigest.structure || []).join(' → ');
    return [
      'Write an ORIGINAL short-form video ad script (TikTok/Reels/Shorts voiceover).',
      `Product: ${product.name}${product.description ? ' — ' + product.description : ''}`,
      product.audience ? `Audience: ${product.audience}` : '',
      product.facts && product.facts.length ? `Approved facts you may use (use no other claims):\n- ${product.facts.join('\n- ')}` : 'Make no claims you cannot prove.',
      product.offer ? `Offer / call to action: ${product.offer}` : '',
      sourceDigest ? `Follow this proven STRUCTURE only (not its words): ${beats}. Hook type: ${sourceDigest.hookType}. Length ≈ ${targetSeconds}s (~${Math.round(targetSeconds * WORDS_PER_SECOND)} words).` : `Length ≈ ${targetSeconds}s.`,
      style ? `Style: ${style}` : '',
      'Rules: write every sentence in your own words; do not reuse phrases from any reference ad; hook under 12 words; short spoken sentences; talk to the viewer; end with one clear call to action; no fake testimonials, no guarantees, no health or income claims.',
      avoid.length ? `Do NOT use these phrases (they are too close to existing scripts): ${avoid.map((p) => `"${p}"`).join(', ')}` : '',
      previous ? `Previous draft:\n${previous}` : '',
      feedback ? `Revise the previous draft. Fix these issues:\n${feedback}` : '',
      'Return only the script text, one spoken sentence per line, no stage directions.',
    ].filter(Boolean).join('\n\n');
  }

  return { SHINGLE, LIMITS, normalize, words, sentences, fingerprint, compare, overlaps, originality, digest, rate, recreatePrompt };
});
