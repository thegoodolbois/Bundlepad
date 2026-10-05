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
  serve [--port N]               localhost API (default 8787)`;

function openStore() {
  const store = new Store(git.toplevel(process.cwd()));
  if (!store.exists()) throw new Error('no chain here; run "chain init" first');
  return store;
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
    require('./server').serve(openStore(), port);
    console.log(`listening on http://127.0.0.1:${port}`);
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
