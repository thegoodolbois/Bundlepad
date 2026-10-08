#!/usr/bin/env node
'use strict';
const fs = require('fs');
const core = require('./core');
const lib = require('./library');

const HELP = `script-engine: digest, recreate, rate and originality-check video ad scripts

Usage: node cli.js <command> [file|-] [options]      (- or no file = read stdin)

  add <file>        Add a source script (someone else's ad/transcript). Stores only its
                    structure and a hashed fingerprint, never the text.  --title --origin
  digest <file>     Show the structure: hook type, beats, length.
  rate <file>       Score 0-100 with fixes.  --seconds 30
  check <file>      Originality vs every source and past script: original | too_close | duplicate
  recreate          Write a new script for your product with Claude, rate it, check it,
                    and revise until it passes.
                      --product product.json   (name, description, audience, facts[], offer)
                      --from <id|file>         structure to follow (a library id or a script file)
                      --seconds 30 --min-score 75 --rounds 4 --count 1 --style "..."
                      --effort medium          (low|medium|high|xhigh|max)
                      --prompt-only            print the prompt to paste into any AI; no API key needed
                      --save                   add the passing scripts to history
  accept <file>     Add a script you published to history so future scripts can't repeat it.
                    --title --date
  list              Show the library.

Options: --library <path> (default ./script-library.json or $SCRIPT_LIBRARY), --json
Needs ANTHROPIC_API_KEY for recreate (unless --prompt-only).`;

function parse(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || (next.startsWith('--'))) args[key] = true;
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}

const readInput = (file) => (!file || file === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(file, 'utf8'));
const pct = (x) => `${Math.round(x * 100)}%`;

function printCheck(c) {
  console.log(`Verdict: ${c.verdict.toUpperCase()}`);
  for (const m of c.matches.filter((x) => x.sharedShingles > 0)) {
    console.log(`  ${m.kind.padEnd(7)} ${m.id}  shared ${pct(m.containment)}  longest copied run ${m.longestRunWords} words  "${m.title}"`);
  }
  if (c.verdict !== 'original') console.log(`Limits: too_close at ${pct(c.limits.tooClose.containment)} or ${c.limits.tooClose.run}-word run; duplicate at ${pct(c.limits.duplicate.containment)} or ${c.limits.duplicate.run}-word run.`);
}

function printRate(r) {
  console.log(`Score: ${r.total}/100   ` + Object.entries(r.scores).map(([k, v]) => `${k} ${v}`).join(' · '));
  for (const f of r.fixes) console.log(`  - ${f}`);
}

function printDigest(d) {
  console.log(`${d.words} words, ~${d.seconds}s, ${d.sentences} sentences`);
  console.log(`Hook (${d.hookType}, ${d.hookWords} words): ${d.hook}`);
  console.log(`Structure: ${d.structure.join(' → ')}`);
  for (const b of d.beats) console.log(`  [${b.beat}] ${b.text}`);
}

async function main() {
  const args = parse(process.argv.slice(2));
  const [cmd, file] = args._;
  const libPath = args.library || lib.DEFAULT_PATH;
  const out = (obj, human) => (args.json ? console.log(JSON.stringify(obj, null, 2)) : human(obj));

  switch (cmd) {
    case 'add':
    case 'accept': {
      const text = readInput(file);
      const library = lib.load(libPath);
      const kind = cmd === 'add' ? 'source' : 'history';
      if (kind === 'history') {
        const c = core.originality(text, library.entries);
        if (c.verdict !== 'original' && !args.force) { printCheck(c); console.error('Not added: too close to an existing script. Use --force to add anyway.'); process.exitCode = 1; return; }
      }
      const { entry, added } = lib.add(library, text, { kind, title: args.title, origin: args.origin, date: args.date });
      lib.save(library, libPath);
      console.log(`${added ? 'Added' : 'Already in library'}: ${entry.kind} ${entry.id} (${entry.structure.join(' → ')})`);
      return;
    }
    case 'digest': return out(core.digest(readInput(file)), printDigest);
    case 'rate': return out(core.rate(readInput(file), { targetSeconds: Number(args.seconds) || 30 }), printRate);
    case 'check': {
      const c = core.originality(readInput(file), lib.load(libPath).entries);
      out(c, printCheck);
      if (c.verdict === 'duplicate') process.exitCode = 2;
      return;
    }
    case 'list': {
      const entries = lib.load(libPath).entries;
      if (args.json) return console.log(JSON.stringify(entries.map(({ fingerprint, ...e }) => e), null, 2));
      for (const e of entries) console.log(`${e.kind.padEnd(7)} ${e.id}  ${e.date.slice(0, 10)}  ${String(e.seconds).padStart(5)}s  ${e.structure.join('→')}  ${e.title}`);
      if (!entries.length) console.log('(empty) Add sources with: node cli.js add ad.txt');
      return;
    }
    case 'recreate': return recreateCmd(args, libPath);
    default: console.log(HELP);
  }
}

async function recreateCmd(args, libPath) {
  if (!args.product) throw new Error('--product product.json is required');
  const product = JSON.parse(fs.readFileSync(args.product, 'utf8'));
  const library = lib.load(libPath);
  let sourceDigest = null;
  if (args.from) {
    const entry = lib.find(library, args.from);
    if (entry) sourceDigest = { structure: entry.structure, hookType: entry.hookType };
    else if (fs.existsSync(args.from)) {
      const text = fs.readFileSync(args.from, 'utf8');
      sourceDigest = core.digest(text);
      lib.add(library, text, { kind: 'source', origin: args.from }); // so the result is checked against it
      lib.save(library, libPath);
    } else throw new Error(`--from: no library id or file named ${args.from}`);
  }
  const targetSeconds = Number(args.seconds) || 30;
  if (args['prompt-only']) {
    console.log(core.recreatePrompt({ sourceDigest, product, targetSeconds, style: args.style || '' }));
    console.log('\n# Paste the result into a file, then run: node cli.js check <file> && node cli.js rate <file>');
    return;
  }
  const { recreate } = require('./recreate');
  const count = Number(args.count) || 1;
  const results = [];
  for (let n = 1; n <= count; n++) {
    const r = await recreate({
      product, sourceDigest, library: library.entries, targetSeconds,
      minScore: Number(args['min-score']) || 75, rounds: Number(args.rounds) || 4,
      style: args.style || '', effort: args.effort || 'medium',
    });
    results.push(r);
    if (args.json) continue;
    console.log(`\n=== Script ${n}/${count}: ${r.ok ? 'PASSED' : 'did not pass'} after ${r.attempts.length} round(s) ===`);
    for (const a of r.attempts) console.log(`  round ${a.round}: score ${a.score}, ${a.verdict}`);
    if (r.script) console.log('\n' + r.script + '\n');
    else console.log('No original draft was produced. Try a different --from structure or more --rounds.');
    // Later scripts in the same batch must not repeat this one (daily/weekly variety).
    if (r.script) {
      const { entry } = lib.add(library, r.script, { kind: 'history', title: `${product.name} #${n}` });
      if (!r.ok) entry.unsaved = true; // kept in memory for this batch only
    }
  }
  if (args.save) {
    library.entries = library.entries.filter((e) => !e.unsaved);
    library.entries.forEach((e) => delete e.unsaved);
    lib.save(library, libPath);
    console.log(`Saved passing scripts to history in ${libPath}.`);
  }
  if (args.json) console.log(JSON.stringify(results, null, 2));
  if (results.some((r) => !r.ok)) process.exitCode = 1;
}

main().catch((err) => {
  const Anthropic = (() => { try { return require('@anthropic-ai/sdk'); } catch { return null; } })();
  if (Anthropic && err instanceof Anthropic.AuthenticationError) console.error('Error: ANTHROPIC_API_KEY is missing or invalid. Use --prompt-only to work without it.');
  else if (Anthropic && err instanceof Anthropic.RateLimitError) console.error('Error: rate limited by the API. Wait a minute and retry.');
  else console.error(`Error: ${err.message}`);
  process.exitCode = 1;
});
