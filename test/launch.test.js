'use strict';

const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const base58 = require('../src/launch/base58');
const { verifyGoogleIdToken, verifyWalletSignature } = require('../src/launch/crypto');
const { Launches, messages, validateManifest, withWeights, split } = require('../src/launch/launch');
const { Store } = require('../src/store');
const chain = require('../src/chain');
const { handle } = require('../src/server');

const T0 = Date.parse('2026-11-01T12:00:00Z');

function newWallet() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const raw = Buffer.from(publicKey.export({ format: 'jwk' }).x, 'base64url');
  return {
    address: base58.encode(raw),
    sign: (text) => crypto.sign(null, Buffer.from(text), privateKey).toString('base64'),
  };
}

function manifest(creator, overrides = {}) {
  return {
    id: 'bp-001',
    label: 'Bundlepad launch bp-001',
    token: { name: 'Test', symbol: 'TST', metadataUri: '' },
    creatorWallet: creator,
    caps: { minSol: 0.1, maxSolPerInvestor: 2, targetSol: 3, maxInvestors: 3 },
    platformFeeBps: 1000,
    commitWindow: { opens: '2026-11-01T00:00:00Z', closes: '2026-11-02T00:00:00Z' },
    launchAt: '2026-11-02T01:00:00Z',
    proposals: [{ id: 'slippage', title: 'Max slippage', options: ['5%', '10%'] }],
    ...overrides,
  };
}

function setup() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'launch-test-'));
  const store = new Store(root);
  store.create({ version: 1, remote: 'origin', difficulty: 4, backup: { dir: null } });
  chain.genesis(store, { repo: 'test' });
  let now = T0;
  const launches = new Launches(root, { chainStore: store, salt: 'test-salt', now: () => now });
  return { root, store, launches, setNow: (t) => { now = t; } };
}

function bind(launches, w, sub) {
  const { nonce } = launches.issueNonce();
  return launches.bind('bp-001', { sub, wallet: w.address, nonce, signature: w.sign(messages.bind(sub, w.address, nonce)) });
}

function commit(launches, w, sub, sol) {
  const { manifestHash } = launches.state('bp-001');
  return launches.commit('bp-001', { sub, wallet: w.address, sol, signature: w.sign(messages.commit('bp-001', sol, w.address, manifestHash)) });
}

test('base58 round-trips, including leading zero bytes', () => {
  for (const bytes of [[0, 0, 1, 2], [255, 254], [0], crypto.randomBytes(32)]) {
    assert.deepStrictEqual(base58.decode(base58.encode(Buffer.from(bytes))), Buffer.from(bytes));
  }
  assert.strictEqual(base58.encode(Buffer.alloc(32)), '1'.repeat(32));
});

test('wallet signatures verify in base64 and base58, and reject other messages', () => {
  const w = newWallet();
  const sig = w.sign('hello');
  assert.ok(verifyWalletSignature(w.address, 'hello', sig));
  assert.ok(verifyWalletSignature(w.address, 'hello', base58.encode(Buffer.from(sig, 'base64'))));
  assert.ok(!verifyWalletSignature(w.address, 'hellO', sig));
  assert.ok(!verifyWalletSignature(newWallet().address, 'hello', sig));
});

test('Google ID tokens are checked for signature, audience, issuer and expiry', async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256' };
  const getKeys = async () => [jwk];
  const token = (payload) => {
    const h = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'k1' })).toString('base64url');
    const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${h}.${p}.${crypto.sign('RSA-SHA256', Buffer.from(`${h}.${p}`), privateKey).toString('base64url')}`;
  };
  const good = { iss: 'https://accounts.google.com', aud: 'client', sub: '123', exp: T0 / 1000 + 60 };
  assert.strictEqual((await verifyGoogleIdToken(token(good), 'client', { getKeys, now: T0 })).sub, '123');
  await assert.rejects(verifyGoogleIdToken(token(good), 'other', { getKeys, now: T0 }), /different client/);
  await assert.rejects(verifyGoogleIdToken(token({ ...good, iss: 'evil' }), 'client', { getKeys, now: T0 }), /issuer/);
  await assert.rejects(verifyGoogleIdToken(token({ ...good, exp: T0 / 1000 - 1 }), 'client', { getKeys, now: T0 }), /expired/);
  const forged = token(good).split('.');
  forged[1] = Buffer.from(JSON.stringify({ ...good, sub: '999' })).toString('base64url');
  await assert.rejects(verifyGoogleIdToken(forged.join('.'), 'client', { getKeys, now: T0 }), /signature/);
});

test('manifest validation catches bad caps, fees and windows', () => {
  const creator = newWallet().address;
  assert.deepStrictEqual(validateManifest(manifest(creator)), []);
  const bad = validateManifest(manifest('nope', { platformFeeBps: 5000, caps: { minSol: 3, maxSolPerInvestor: 2, targetSol: 1, maxInvestors: 0 }, launchAt: '2026-10-01T00:00:00Z' }));
  assert.ok(bad.some((e) => /creatorWallet/.test(e)));
  assert.ok(bad.some((e) => /platformFeeBps/.test(e)));
  assert.ok(bad.some((e) => /minSol must not exceed/.test(e)));
  assert.ok(bad.some((e) => /maxInvestors/.test(e)));
  assert.ok(bad.some((e) => /launchAt/.test(e)));
});

test('split is 1:1 by SOL and early commits weigh more in votes', () => {
  const rows = split([{ wallet: 'a', sol: 1 }, { wallet: 'b', sol: 3 }], 1000);
  assert.deepStrictEqual(rows.map((r) => r.tokens), [250, 750]);
  const [a, b] = withWeights([{ sol: 1 }, { sol: 1 }]);
  assert.strictEqual(a.weight, 2);
  assert.ok(b.weight < a.weight);
});

test('full launch: publish → bind → commit → vote → cancel → close, all on the chain', () => {
  const { store, launches, setNow } = setup();
  const [alice, bob, carol, dave] = [newWallet(), newWallet(), newWallet(), newWallet()];
  launches.create(manifest(newWallet().address));
  assert.throws(() => commit(launches, alice, 'g-alice', 1), /not open/);

  const published = launches.publish('bp-001');
  assert.match(published.manifestHash, /^[0-9a-f]{64}$/);
  assert.strictEqual(chain.tip(store).events[0].subject, 'launch.manifest');
  assert.throws(() => launches.create(manifest(alice.address)), /frozen/);
  assert.strictEqual(launches.status('bp-001'), 'open');

  // Identity: one Google account ↔ one wallet, nonces are single-use.
  bind(launches, alice, 'g-alice');
  assert.throws(() => bind(launches, bob, 'g-alice'), /already bound to another wallet/);
  assert.throws(() => bind(launches, alice, 'g-bob'), /already bound to another Google account/);
  const { nonce } = launches.issueNonce();
  launches.bind('bp-001', { sub: 'g-bob', wallet: bob.address, nonce, signature: bob.sign(messages.bind('g-bob', bob.address, nonce)) });
  assert.throws(() => launches.bind('bp-001', { sub: 'g-bob', wallet: bob.address, nonce, signature: bob.sign(messages.bind('g-bob', bob.address, nonce)) }), /nonce/);
  assert.ok(!JSON.stringify(launches.state('bp-001')).includes('g-alice'), 'Google subjects are stored hashed');

  // Commitments: signature, binding and caps.
  assert.throws(() => commit(launches, carol, 'g-carol', 1), /bind this wallet/);
  assert.throws(() => commit(launches, alice, 'g-bob', 1), /bind this wallet/);
  assert.throws(() => commit(launches, alice, 'g-alice', 2.5), /between/);
  const { manifestHash } = launches.state('bp-001');
  assert.throws(() => launches.commit('bp-001', { sub: 'g-alice', wallet: alice.address, sol: 1, signature: alice.sign(messages.commit('bp-001', 2, alice.address, manifestHash)) }), /signature is invalid/);
  commit(launches, alice, 'g-alice', 1);
  assert.throws(() => commit(launches, alice, 'g-alice', 1), /already committed/);
  commit(launches, bob, 'g-bob', 2);
  bind(launches, carol, 'g-carol');
  assert.throws(() => commit(launches, carol, 'g-carol', 0.5), /left before the target/);

  // Votes are weighted and replace earlier votes by the same wallet.
  const vote = (w, choice) => launches.vote('bp-001', { wallet: w.address, proposal: 'slippage', choice, signature: w.sign(messages.vote('bp-001', 'slippage', ['5%', '10%'][choice], w.address)) });
  assert.throws(() => vote(carol, 0), /commit to this launch/);
  vote(alice, 1);
  vote(alice, 0);
  vote(bob, 1);
  const [tally] = launches.tally('bp-001');
  assert.strictEqual(tally.tally[0], 2);
  assert.ok(Math.abs(tally.tally[1] - 2 * (1 + 1 / Math.log2(3))) < 1e-9);

  // Cancelling frees capacity and drops the votes.
  launches.cancel('bp-001', { wallet: bob.address, signature: bob.sign(messages.cancel('bp-001', bob.address, manifestHash)) });
  assert.strictEqual(launches.tally('bp-001')[0].tally[1], 0);
  commit(launches, carol, 'g-carol', 0.5);

  const d = launches.dashboard();
  assert.strictEqual(d.launch.status, 'open');
  assert.deepStrictEqual(d.investors.map((i) => i.sol), [1, 0.5]);
  assert.ok(!JSON.stringify(d).includes('subHash'), 'dashboard never exposes identities');

  setNow(Date.parse('2026-11-02T00:00:01Z'));
  assert.strictEqual(launches.status('bp-001'), 'closing');
  assert.throws(() => bind(launches, dave, 'g-dave'), /not taking sign-ups/);
  const closed = launches.close('bp-001');
  const block = store.readBlock(closed.commitmentsBlock);
  const subjects = block.events.map((e) => e.subject);
  assert.ok(subjects.includes('launch.commit') && subjects.includes('launch.cancel') && subjects.includes('launch.vote'));
  assert.deepStrictEqual(block.events.find((e) => e.subject === 'launch.commitments').body.commitments,
    [{ wallet: alice.address, sol: 1 }, { wallet: carol.address, sol: 0.5 }]);
  assert.deepStrictEqual(chain.verifyChain(store), []);
});

test('HTTP API requires a verified Google token for bind and commit', async () => {
  const { store, launches } = setup();
  launches.create(manifest(newWallet().address));
  launches.publish('bp-001');
  const w = newWallet();
  const verifyGoogle = async (token) => {
    if (token !== 'valid-token') throw new Error('ID token signature is invalid');
    return { sub: 'g-1' };
  };
  const call = (method, url, body) => handle(store, { method, url }, body === undefined ? '' : JSON.stringify(body), { launches, verifyGoogle });

  const [, { nonce }] = await call('GET', '/api/launch/nonce');
  await assert.rejects(call('POST', '/api/launch/bp-001/bind', { google: 'forged', wallet: w.address, nonce, signature: w.sign(messages.bind('g-1', w.address, nonce)) }), /invalid/);
  const [status] = await call('POST', '/api/launch/bp-001/bind', { google: 'valid-token', wallet: w.address, nonce, signature: w.sign(messages.bind('g-1', w.address, nonce)) });
  assert.strictEqual(status, 200);
  const { manifestHash } = launches.state('bp-001');
  await call('POST', '/api/launch/bp-001/commit', { google: 'valid-token', wallet: w.address, sol: 1, signature: w.sign(messages.commit('bp-001', 1, w.address, manifestHash)) });
  const [, dash] = await call('GET', '/api/launch/dashboard');
  assert.deepStrictEqual(dash.investors.map((i) => i.wallet), [w.address]);
  const [, tpl] = await call('GET', '/api/chain/template');
  assert.strictEqual(tpl.height, store.height() + 1);
});
