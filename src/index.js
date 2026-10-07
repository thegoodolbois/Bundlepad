#!/usr/bin/env node
'use strict';

// Entrypoint. Loads memory.json on every run so plan/execution state persists
// across runs, and gates implementation commands behind plan approval.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parseArgs } = require('node:util');
const memory = require('./memory');
const git = require('./git');
const { Store } = require('./store');
const { makeEvent } = require('./events');
const chain = require('./chain');
const snapshot = require('./snapshot');
const { localRefs, remoteRefs, diffRefs, track } = require('./track');
const { Launches } = require('./launch/launch');

const DEFAULT_DIFFICULTY = 16;

const USAGE = `usage: chain <command> [options]
  status                         plan stage, chain tip and memory tasks
  init [--difficulty N]          create .chain/ with a genesis block
  track                          record local branches/tags, commits and snapshots
  poll                           fetch the remote's public refs and record them; alerts on rewrites
  verify [--remote]              check the worktree (or the remote) against the chain
  verify-chain                   recompute every block hash, root, PoW and object
  log --type T --subject S [--body JSON]   append an event (alerts seal immediately)
  seal                           seal pending events into a block
  export --out DIR | --tar FILE [--commit SHA | --ref REF] [--force]
  backup [DIR]                   copy .chain/ to DIR (commit + push if DIR is a git clone)
  install-hooks                  run "track" after every commit/merge
  serve [--port N] [--host H]    chain + launch API (default 127.0.0.1:8787)
  launch create --file F         save a draft launch manifest (launches/<id>/manifest.json)
  launch publish ID              freeze the manifest and log its hash on the chain
  launch close ID                freeze the commitment list and log it on the chain
  launch show [ID]               print a launch's status, commitments and votes
  launch onchain ID --mint M [--slippage BPS] [--refund-after SECS]
                                 fix the on-chain terms of a closed launch (see onchain/client)
  launch tx ID --kind K --sig S  record a landed launch transaction (the launcher does this)
  buyback --kind swap|burn --sig S [--sol N] [--tokens N]   record a buyback swap or burn
  pages                          write data/dashboard.json and refresh the chain in index.html
  configure [--api-url U] [--rpc-url U] [--google-client-id ID] [--require-google true|false]
            [--program ID] [--buyback ADDR] [--bundlepad-mint MINT] [--allow-origin URL]
                                 set launches/config.json and the dashboard's CONFIG together`;

function openStore() {
  const store = new Store(git.toplevel(process.cwd()));
  if (!store.exists()) throw new Error('no chain here; run "chain init" first');
  return store;
}

function openLaunches(store = openStore()) {
  return new Launches(store.repoRoot, { chainStore: store });
}

// launches/config.json → the CONFIG line in index.html (one source of truth).
const CONFIG_FLAGS = {
  'api-url': 'apiUrl', 'rpc-url': 'rpcUrl', 'google-client-id': 'googleClientId', 'require-google': 'requireGoogle',
  program: 'groupBuyProgramId', buyback: 'buybackWallet', 'bundlepad-mint': 'bundlepadMint', 'allow-origin': 'allowOrigin',
};

function dashboardConfigLine(cfg) {
  const page = {
    dataUrl: 'data/dashboard.json',
    apiUrl: cfg.apiUrl ?? '',
    rpcUrl: cfg.rpcUrl ?? '',
    googleClientId: cfg.googleClientId ?? '',
    requireGoogle: cfg.requireGoogle !== false,
    platformFeeBps: 1000,
  };
  const body = Object.entries(page).map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v.replace(/['\\]/g, '')}'` : v}`).join(', ');
  return `const CONFIG = { ${body} };`;
}

// The dashboard's offline fallback: block headers plus event subjects.
function chainSummary(store) {
  return [...store.blocks()].map((b) => ({ header: b.header, hash: b.hash, subjects: b.events.map((e) => e.subject) }));
}

function sealAndReport(store) {
  const block = chain.seal(store);
  if (block) console.log(`sealed block ${block.header.height} (${block.events.length} events, nonce ${block.header.nonce}) ${block.hash}`);
  return block;
}

function printAlerts(alerts) {
  for (const a of alerts) console.error(`ALERT ${a.subject}: ${a.body.ref} ${a.body.from ?? ''} -> ${a.body.to ?? '(deleted)'} ${a.body.reason ?? ''}`);
}

// Resolves which snapshot an export/verify should use.
function pickSnapshot(store, { commit, ref }) {
  const st = chain.state(store);
  if (!commit && ref) {
    const name = Object.keys(st.refs).find((n) => n === ref || n.endsWith('/' + ref) || n.endsWith('/heads/' + ref));
    if (!name) throw new Error(`ref ${ref} is not recorded in the chain`);
    commit = st.refs[name].commit;
  }
  if (!commit) {
    const remote = store.config().remote;
    commit = (st.refs[`${remote}/heads/main`] ?? st.refs['local/heads/main'] ?? Object.values(st.refs)[0])?.commit;
  }
  const match = Object.keys(st.snapshots).filter((c) => c.startsWith(commit ?? '\0'));
  if (match.length !== 1) throw new Error(`no unique snapshot for ${commit}`);
  return { commit: match[0], manifest: snapshot.loadManifest(store, st.snapshots[match[0]].manifest) };
}

function printDiff(result) {
  for (const p of result.missing) console.log(`  missing  ${p}`);
  for (const p of result.changed) console.log(`  changed  ${p}`);
  for (const p of result.extra) console.log(`  extra    ${p}`);
}

const commands = {
  status() {
    const mem = memory.load();
    console.log(`plan: ${mem.current_plan}  stage: ${mem.stage}`);
    console.log(`approval: ${memory.isApproved(mem) ? 'approved' : 'pending'}`);
    for (const t of mem.tasks) console.log(`  [${t.status}] ${t.id}. ${t.title}`);
    try {
      const store = openStore();
      const t = chain.tip(store);
      console.log(`chain tip: height ${t.header.height} ${t.hash}`);
      console.log(`pending events: ${store.mempool().length}`);
    } catch (err) {
      console.log(`chain: ${err.message}`);
    }
  },

  init(opts) {
    const root = git.toplevel(process.cwd());
    const store = new Store(root);
    if (store.exists()) throw new Error('.chain already exists');
    const remote = 'origin';
    store.create({ version: 1, remote, difficulty: Number(opts.difficulty ?? DEFAULT_DIFFICULTY), backup: { dir: null } });
    const block = chain.genesis(store, { repo: git.remoteUrl(root, remote), remote, createdAt: new Date().toISOString() });
    console.log(`genesis ${block.hash}`);
  },

  track() {
    const store = openStore();
    const root = store.repoRoot;
    store.withLock(() => {
      const { events, alerts } = track(store, root, { namespace: 'local', refs: localRefs(root), source: 'local-cli' });
      printAlerts(alerts);
      if (!sealAndReport(store)) console.log('nothing new');
      else console.log(`${events.length} events recorded`);
    });
  },

  poll() {
    const store = openStore();
    const root = store.repoRoot;
    const { remote } = store.config();
    store.withLock(() => {
      const refs = remoteRefs(root, remote);
      const { events, alerts } = track(store, root, { namespace: remote, refs, source: 'github-poll' });
      printAlerts(alerts);
      if (!sealAndReport(store)) console.log(`${remote}: no changes`);
      else console.log(`${events.length} events recorded`);
      if (alerts.length) process.exitCode = 2;
    });
  },

  verify(opts) {
    const store = openStore();
    const root = store.repoRoot;
    let ok;
    let body;
    if (opts.remote) {
      const { remote } = store.config();
      const st = chain.state(store);
      const diff = diffRefs(root, st.refs, remote, remoteRefs(root, remote));
      const content = [];
      for (const [name, { commit }] of Object.entries(st.refs)) {
        if (!name.startsWith(remote + '/') || !git.hasObject(root, commit) || !st.snapshots[commit]) continue;
        const r = snapshot.verifyCommit(root, commit, snapshot.loadManifest(store, st.snapshots[commit].manifest));
        if (!r.ok) content.push({ ref: name, ...r });
      }
      ok = !diff.rewritten.length && !diff.deleted.length && !content.length;
      body = { target: remote, ...diff, content };
      for (const c of diff.created) console.log(`  new      ${c.ref} ${c.to}`);
      for (const c of diff.moved) console.log(`  advanced ${c.ref} ${c.from} -> ${c.to}`);
      for (const c of diff.rewritten) console.log(`  REWRITTEN ${c.ref} ${c.from} -> ${c.to}`);
      for (const c of diff.deleted) console.log(`  DELETED  ${c.ref} (was ${c.from})`);
      for (const c of content) { console.log(`  CONTENT  ${c.ref}`); printDiff(c); }
    } else {
      const commit = git.head(root);
      const st = chain.state(store);
      if (!st.snapshots[commit]) throw new Error(`HEAD ${commit} has no snapshot; run "chain track" first`);
      const result = snapshot.verifyWorktree(root, snapshot.loadManifest(store, st.snapshots[commit].manifest));
      ok = result.ok;
      body = { target: 'worktree', commit, ...result };
      printDiff(result);
    }
    store.withLock(() => {
      chain.enqueue(store, makeEvent(ok
        ? { type: 'reply', subject: 'verify.ok', body }
        : { type: 'alert', subject: 'verify.mismatch', body }));
      chain.seal(store);
    });
    console.log(ok ? 'verify: OK' : 'verify: MISMATCH');
    if (!ok) process.exitCode = 2;
  },

  'verify-chain'() {
    const store = openStore();
    const errors = chain.verifyChain(store);
    for (const e of errors) console.log(`  ${e}`);
    console.log(errors.length ? `chain: INVALID (${errors.length} problems)` : `chain: OK (height ${store.height()})`);
    if (errors.length) process.exitCode = 2;
  },

  log(opts) {
    const store = openStore();
    const event = makeEvent({ type: opts.type, subject: opts.subject, body: opts.body ? JSON.parse(opts.body) : {} });
    store.withLock(() => {
      chain.enqueue(store, event);
      if (event.type === 'alert') sealAndReport(store);
    });
    console.log(`queued ${event.id}`);
  },

  seal() {
    const store = openStore();
    store.withLock(() => { if (!sealAndReport(store)) console.log('nothing to seal'); });
  },

  export(opts) {
    const store = openStore();
    const { commit, manifest } = pickSnapshot(store, opts);
    if (opts.tar) {
      snapshot.exportTar(store, manifest, opts.tar, fs.mkdtempSync(path.join(os.tmpdir(), 'chain-export-')));
    } else if (opts.out) {
      snapshot.exportManifest(store, manifest, opts.out, { force: opts.force });
    } else {
      throw new Error('export needs --out DIR or --tar FILE');
    }
    store.withLock(() => {
      chain.enqueue(store, makeEvent({ type: 'file', subject: 'restore.done', body: { commit, files: manifest.files.length, to: opts.tar ?? opts.out } }));
      chain.seal(store);
    });
    console.log(`restored ${manifest.files.length} files from ${commit} to ${opts.tar ?? opts.out}`);
  },

  backup(opts, [dir]) {
    const store = openStore();
    const config = store.config();
    const target = dir ?? config.backup.dir;
    if (!target) throw new Error('no backup dir; pass one (e.g. a clone of an empty backup repo)');
    if (dir) store.setConfig({ ...config, backup: { dir: path.resolve(dir) } });
    fs.mkdirSync(target, { recursive: true });
    fs.cpSync(store.dir, path.join(target, '.chain'), { recursive: true, filter: (src) => path.basename(src) !== 'LOCK' });
    console.log(`copied chain to ${target}`);
    if (fs.existsSync(path.join(target, '.git'))) {
      git.git(target, ['add', '-A', '.chain']);
      const t = chain.tip(store);
      try {
        git.git(target, ['commit', '-m', `chain backup: height ${t.header.height} ${t.hash}`]);
      } catch { console.log('backup repo already up to date'); return; }
      try { git.git(target, ['push']); console.log('pushed backup'); } catch (err) { console.log(`committed; push failed: ${err.stderr?.toString().trim()}`); }
    }
  },

  'install-hooks'() {
    const root = git.toplevel(process.cwd());
    const hooksDir = path.join(root, git.git(root, ['rev-parse', '--git-path', 'hooks']).trim());
    const script = `#!/bin/sh\nnode ${JSON.stringify(path.resolve(__filename))} track || true\n`;
    for (const hook of ['post-commit', 'post-merge']) {
      fs.writeFileSync(path.join(hooksDir, hook), script, { mode: 0o755 });
    }
    console.log(`installed post-commit and post-merge hooks in ${hooksDir}`);
  },

  serve(opts) {
    const port = Number(opts.port ?? 8787);
    const host = opts.host ?? '127.0.0.1';
    const store = openStore();
    const launches = openLaunches(store);
    require('./server').serve(store, port, { host, launches, allowOrigin: launches.config().allowOrigin });
    console.log(`listening on http://${host}:${port}`);
  },

  launch(opts, [action, id]) {
    const launches = openLaunches();
    if (action === 'create') {
      if (!opts.file) throw new Error('launch create needs --file manifest.json');
      const m = launches.create(JSON.parse(fs.readFileSync(opts.file, 'utf8')));
      console.log(`saved draft ${m.id}; run "chain launch publish ${m.id}" to freeze it`);
    } else if (action === 'publish') {
      const st = launches.publish(id);
      console.log(`published ${id}: manifest ${st.manifestHash} in block ${st.manifestBlock}`);
    } else if (action === 'close') {
      const st = launches.close(id);
      const total = st.commitments.reduce((s, c) => s + c.sol, 0);
      console.log(`closed ${id}: ${st.commitments.length} commitments, ${total} SOL, block ${st.commitmentsBlock}`);
    } else if (action === 'onchain') {
      const cfg = launches.config();
      const plan = launches.planOnchain(id, {
        programId: opts.program ?? cfg.groupBuyProgramId,
        mint: opts.mint,
        maxSlippageBps: opts.slippage ? Number(opts.slippage) : undefined,
        refundAfterSecs: opts['refund-after'] ? Number(opts['refund-after']) : undefined,
      });
      console.log(`launch ${id}: on-chain account ${plan.launch}, ${plan.commitments.length} commitments, vault ${plan.vault}`);
    } else if (action === 'tx') {
      if (!opts.kind || !opts.sig) throw new Error('launch tx needs --kind and --sig');
      launches.recordTx(id, opts.kind, opts.sig);
      console.log(`recorded ${opts.kind} ${opts.sig}`);
    } else if (action === 'show') {
      const d = launches.dashboard(id);
      if (!d.launch) { console.log('no published launch'); return; }
      console.log(`${d.launch.id} ${d.launch.status} manifest ${d.launch.manifestHash ?? '(draft)'}`);
      for (const i of d.investors) console.log(`  ${i.wallet} ${i.sol} SOL`);
      for (const p of d.proposals) console.log(`  vote ${p.id}: ${p.options.map((o, k) => `${o}=${p.tally[k].toFixed(3)}`).join(' ')}`);
    } else {
      throw new Error('usage: chain launch create|publish|close|show|onchain|tx');
    }
  },

  buyback(opts) {
    const bb = openLaunches().recordBuyback({ kind: opts.kind, signature: opts.sig, sol: Number(opts.sol ?? 0), tokens: Number(opts.tokens ?? 0) });
    console.log(`buyback totals: ${bb.feesSol} SOL in, ${bb.boughtTokens} bought, ${bb.burnedTokens} burned`);
  },

  configure(opts) {
    const root = git.toplevel(process.cwd());
    const launches = new Launches(root);
    const file = path.join(launches.dir, 'config.json');
    const cfg = launches.config();
    for (const [flag, k] of Object.entries(CONFIG_FLAGS)) {
      if (opts[flag] === undefined) continue;
      cfg[k] = k === 'requireGoogle' ? opts[flag] !== 'false' : opts[flag];
    }
    for (const k of ['groupBuyProgramId', 'buybackWallet', 'bundlepadMint']) {
      if (cfg[k] && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cfg[k])) throw new Error(`${k} is not a Solana address: ${cfg[k]}`);
    }
    for (const k of ['apiUrl', 'rpcUrl', 'allowOrigin']) {
      if (cfg[k] && !/^https?:\/\/[^\s'"]+$/.test(cfg[k])) throw new Error(`${k} must be an http(s) URL`);
    }
    if (cfg.apiUrl && !cfg.apiUrl.startsWith('https://') && !/^http:\/\/(localhost|127\.0\.0\.1)/.test(cfg.apiUrl)) {
      throw new Error('apiUrl must be https:// (the dashboard is served over HTTPS)');
    }
    fs.mkdirSync(launches.dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n');
    const html = path.join(root, 'index.html');
    const src = fs.readFileSync(html, 'utf8');
    if (!/^const CONFIG = \{.*\};$/m.test(src)) throw new Error('could not find the CONFIG line in index.html');
    fs.writeFileSync(html, src.replace(/^const CONFIG = \{.*\};$/m, () => dashboardConfigLine(cfg)));
    for (const [k, v] of Object.entries(cfg)) console.log(`  ${k}: ${v === '' || v === null ? '(not set)' : v}`);
    const missing = ['apiUrl', 'rpcUrl', 'groupBuyProgramId', 'buybackWallet'].filter((k) => !cfg[k]);
    if (cfg.requireGoogle && !cfg.googleClientId) missing.push('googleClientId (or --require-google false)');
    console.log(missing.length ? `still needed before going live: ${missing.join(', ')}` : 'all set');
  },

  pages() {
    const store = openStore();
    const launches = openLaunches(store);
    const out = path.join(store.repoRoot, 'data', 'dashboard.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(launches.dashboard(), null, 2) + '\n');
    const html = path.join(store.repoRoot, 'index.html');
    if (fs.existsSync(html)) {
      const src = fs.readFileSync(html, 'utf8');
      const next = src.replace(/^let CHAIN = .*;$/m, () => `let CHAIN = ${JSON.stringify(chainSummary(store))};`);
      fs.writeFileSync(html, next);
    }
    console.log(`wrote ${path.relative(store.repoRoot, out)}; index.html chain at height ${store.height()}`);
  },
};

function main(argv) {
  const { values: opts, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      difficulty: { type: 'string' }, remote: { type: 'boolean' }, type: { type: 'string' },
      subject: { type: 'string' }, body: { type: 'string' }, out: { type: 'string' },
      tar: { type: 'string' }, commit: { type: 'string' }, ref: { type: 'string' },
      force: { type: 'boolean' }, port: { type: 'string' }, help: { type: 'boolean' },
      host: { type: 'string' }, file: { type: 'string' }, mint: { type: 'string' }, program: { type: 'string' },
      slippage: { type: 'string' }, 'refund-after': { type: 'string' }, kind: { type: 'string' }, sig: { type: 'string' },
      sol: { type: 'string' }, tokens: { type: 'string' },
      'api-url': { type: 'string' }, 'rpc-url': { type: 'string' }, 'google-client-id': { type: 'string' },
      'require-google': { type: 'string' }, buyback: { type: 'string' }, 'bundlepad-mint': { type: 'string' },
      'allow-origin': { type: 'string' },
    },
  });
  const [command = 'status', ...rest] = positionals;
  if (opts.help || !commands[command]) {
    console.log(USAGE);
    return opts.help ? 0 : 1;
  }

  const mem = memory.load();
  if (command !== 'status' && !memory.isApproved(mem)) {
    console.error(`Plan ${mem.current_plan} is awaiting human approval; see ${mem.plan_file}.`);
    return 1;
  }

  try {
    commands[command](opts, rest);
  } catch (err) {
    console.error(`error: ${err.message}`);
    return 1;
  }
  return process.exitCode ?? 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { main };
