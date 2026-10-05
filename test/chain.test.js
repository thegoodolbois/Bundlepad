'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const CLI = path.join(__dirname, '..', 'src', 'index.js');

function sh(cwd, cmd, ...args) {
  return execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
}

function chain(cwd, ...args) {
  const r = spawnSync('node', [CLI, ...args], { cwd });
  return { code: r.status, out: r.stdout.toString() + r.stderr.toString() };
}

function commit(dir, files, message) {
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  }
  sh(dir, 'git', 'add', '-A');
  sh(dir, 'git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', message);
}

// A bare "public" remote with a clone that holds the chain.
function setup() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'chain-test-'));
  const remote = path.join(base, 'remote.git');
  const work = path.join(base, 'work');
  sh(base, 'git', 'init', '-q', '--bare', '-b', 'main', remote);
  sh(base, 'git', 'clone', '-q', remote, work);
  sh(work, 'git', 'checkout', '-qb', 'main');
  commit(work, { 'README.md': '# hello\n', 'src/app.js': 'console.log(1)\n' }, 'first');
  sh(work, 'git', 'push', '-q', 'origin', 'main');
  assert.strictEqual(chain(work, 'init', '--difficulty', '8').code, 0);
  return { base, remote, work };
}

test('track, verify, tamper detection and restore', () => {
  const { base, work } = setup();
  assert.strictEqual(chain(work, 'track').code, 0);
  commit(work, { 'src/app.js': 'console.log(2)\n' }, 'second');
  assert.match(chain(work, 'track').out, /sealed block/);

  assert.match(chain(work, 'verify').out, /verify: OK/);
  fs.writeFileSync(path.join(work, 'src/app.js'), 'evil()\n');
  const bad = chain(work, 'verify');
  assert.strictEqual(bad.code, 2);
  assert.match(bad.out, /changed {2}src\/app\.js/);

  const out = path.join(base, 'restored');
  assert.strictEqual(chain(work, 'export', '--out', out, '--ref', 'main').code, 0);
  assert.strictEqual(fs.readFileSync(path.join(out, 'src/app.js'), 'utf8'), 'console.log(2)\n');
  assert.strictEqual(fs.readFileSync(path.join(out, 'README.md'), 'utf8'), '# hello\n');

  assert.match(chain(work, 'verify-chain').out, /chain: OK/);
  const events = fs.readFileSync(path.join(work, '.chain/events.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  for (const s of ['chain.genesis', 'git.commit', 'snapshot.created', 'ref.update', 'verify.ok', 'verify.mismatch', 'restore.done']) {
    assert.ok(events.some((e) => e.subject === s), `missing ${s} in events.jsonl`);
  }
});

test('poll alerts on force-pushed history and deleted refs', () => {
  const { remote, base, work } = setup();
  commit(work, { 'b.txt': 'b\n' }, 'feature');
  sh(work, 'git', 'push', '-q', 'origin', 'HEAD:refs/heads/feature');
  assert.strictEqual(chain(work, 'poll').code, 0);

  // An attacker rewrites main and deletes the feature branch on the remote.
  const attacker = path.join(base, 'attacker');
  sh(base, 'git', 'clone', '-q', remote, attacker);
  fs.writeFileSync(path.join(attacker, 'README.md'), '# pwned\n');
  sh(attacker, 'git', 'add', '-A');
  sh(attacker, 'git', '-c', 'user.name=x', '-c', 'user.email=x@x', 'commit', '-q', '--amend', '-m', 'first');
  sh(attacker, 'git', 'push', '-qf', 'origin', 'main');
  sh(attacker, 'git', 'push', '-q', 'origin', ':feature');

  const check = chain(work, 'verify', '--remote');
  assert.strictEqual(check.code, 2);
  assert.match(check.out, /REWRITTEN origin\/heads\/main/);
  assert.match(check.out, /DELETED {2}origin\/heads\/feature/);

  const polled = chain(work, 'poll');
  assert.strictEqual(polled.code, 2);
  assert.match(polled.out, /ALERT ref.rewrite/);
  assert.match(polled.out, /ALERT ref.delete/);

  // The pre-attack state is still restorable from the chain.
  const first = sh(work, 'git', 'rev-parse', 'origin/main').trim();
  const out = path.join(base, 'restored');
  assert.strictEqual(chain(work, 'export', '--out', out, '--commit', first).code, 0);
  assert.strictEqual(fs.readFileSync(path.join(out, 'README.md'), 'utf8'), '# hello\n');
});

test('verify-chain detects edited blocks and corrupted objects', () => {
  const { work } = setup();
  chain(work, 'track');
  const file = path.join(work, '.chain/blocks/1.json');
  const block = JSON.parse(fs.readFileSync(file, 'utf8'));
  block.events[0].body.message = 'forged';
  fs.writeFileSync(file, JSON.stringify(block));
  const r = chain(work, 'verify-chain');
  assert.strictEqual(r.code, 2);
  assert.match(r.out, /event id mismatch/);
});

test('proof-of-work is enforced', () => {
  const { work } = setup();
  const genesis = JSON.parse(fs.readFileSync(path.join(work, '.chain/blocks/0.json'), 'utf8'));
  assert.ok(genesis.hash.startsWith('00'), 'difficulty 8 means two leading zero hex digits');
  genesis.header.difficulty = 255;
  fs.writeFileSync(path.join(work, '.chain/blocks/0.json'), JSON.stringify(genesis));
  assert.match(chain(work, 'verify-chain').out, /insufficient proof-of-work|header hash mismatch/);
});
