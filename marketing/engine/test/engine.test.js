'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const core = require('../core');
const lib = require('../library');
const { recreate } = require('../recreate');

const SOURCE = fs.readFileSync(path.join(__dirname, '../examples/source-ad.txt'), 'utf8');
const ORIGINAL = `Studying at midnight with a lamp that hurts your eyes?
Your old desk light flickers and the glare gives you a headache by ten.
So I switched to the Lumi Desk Lamp.
Three color temperatures and five brightness levels, so you pick what feels right.
One charge runs up to 40 hours on low, and it charges over USB-C.
Use code LUMI15 for 15% off, link in bio.`;

test('fingerprint does not contain the text and is stable', () => {
  const fp = core.fingerprint(SOURCE);
  assert.ok(fp.length > 10);
  assert.ok(fp.every((h) => /^[0-9a-f]{8}$/.test(h)));
  assert.deepStrictEqual(fp, core.fingerprint(SOURCE.toUpperCase().replace(/\./g, ' . ')));
});

test('exact copy and light edits are duplicates; new writing is original', () => {
  const library = [{ id: 's1', kind: 'source', fingerprint: core.fingerprint(SOURCE) }];
  assert.strictEqual(core.originality(SOURCE, library).verdict, 'duplicate');
  const spun = SOURCE.replace('Stop scrolling', 'Hold on').replace('posture corrector', 'desk lamp');
  assert.strictEqual(core.originality(spun, library).verdict, 'duplicate');
  // One lifted 8-word sentence inside otherwise new text is flagged as too close.
  const lifted = ORIGINAL + '\nOver 20,000 customers have left five star reviews.';
  assert.notStrictEqual(core.originality(lifted, library).verdict, 'original');
  assert.strictEqual(core.originality(ORIGINAL, library).verdict, 'original');
});

test('overlaps returns the candidate phrases to rewrite', () => {
  const lifted = 'Here is my lamp. Over 20,000 customers have left five star reviews. Buy it.';
  const phrases = core.overlaps(lifted, core.fingerprint(SOURCE));
  assert.deepStrictEqual(phrases, ['over 20 000 customers have left five star reviews']);
});

test('digest finds hook type and beats', () => {
  const d = core.digest(SOURCE);
  assert.strictEqual(d.hookType, 'stop/command');
  assert.deepStrictEqual(d.structure.slice(0, 4), ['hook', 'agitate', 'solution', 'proof']);
  assert.ok(d.hasCta);
});

test('rate rewards structure and flags risky claims', () => {
  const good = core.rate(SOURCE);
  const risky = core.rate(SOURCE + ' Guaranteed results or your money back, it cures back pain.');
  assert.ok(good.total >= 75, `good score ${good.total}`);
  assert.ok(risky.scores.safety < 100);
  assert.ok(risky.fixes.some((f) => f.includes('risky')));
  assert.ok(core.rate('Nice lamp.').total < 50);
});

test('recreate loop revises until original and good enough', async () => {
  const library = [{ id: 's1', kind: 'source', title: 'src', fingerprint: core.fingerprint(SOURCE) }];
  const prompts = [];
  const drafts = [SOURCE, 'Nice lamp. Buy it.', ORIGINAL];
  const write = async (p) => { prompts.push(p); return drafts[prompts.length - 1]; };
  const r = await recreate({ product: { name: 'Lumi Desk Lamp' }, sourceDigest: core.digest(SOURCE), library, write, rounds: 4 });
  assert.ok(r.ok);
  assert.strictEqual(r.script, ORIGINAL);
  assert.deepStrictEqual(r.attempts.map((a) => a.verdict), ['duplicate', 'original', 'original']);
  assert.match(prompts[1], /Do NOT use these phrases/);
  assert.match(prompts[1], /stop scrolling if your back hurts/);
  assert.match(prompts[2], /Revise the previous draft/);
  assert.ok(!prompts[0].includes('posture corrector'), 'source text never goes into the prompt');
});

test('recreate never returns a duplicate as the result', async () => {
  const library = [{ id: 's1', kind: 'source', fingerprint: core.fingerprint(SOURCE) }];
  const r = await recreate({ product: { name: 'X' }, library, write: async () => SOURCE, rounds: 2 });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.script, null);
});

test('CLI: add stores no source text; accept blocks repeats; check exits 2 on duplicate', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'se-'));
  const libPath = path.join(dir, 'lib.json');
  const cli = path.join(__dirname, '../cli.js');
  const src = path.join(__dirname, '../examples/source-ad.txt');
  const mine = path.join(dir, 'mine.txt');
  fs.writeFileSync(mine, ORIGINAL);
  const run = (...a) => execFileSync('node', [cli, ...a, '--library', libPath], { encoding: 'utf8' });
  run('add', src, '--title', 'posture ad');
  const raw = fs.readFileSync(libPath, 'utf8');
  assert.ok(!raw.includes('posture corrector') && !raw.includes('Stop scrolling'));
  assert.match(run('check', mine), /ORIGINAL/);
  run('accept', mine);
  assert.throws(() => run('accept', mine), (e) => e.status === 1); // a repeat of a past post is refused
  assert.throws(() => run('check', mine), (e) => e.status === 2);
  assert.throws(() => run('check', src), (e) => e.status === 2);
  assert.match(run('list'), /history/);
  const prompt = run('recreate', '--product', path.join(__dirname, '../examples/product.json'), '--from', src, '--prompt-only');
  assert.match(prompt, /Lumi Desk Lamp/);
  assert.match(prompt, /STRUCTURE only/);
});
