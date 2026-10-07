'use strict';

// Transparent bundled launches (plan/follow_up/follow_up_2.md), off-chain part.
//
// On-disk layout under <repo>/launches:
//   config.json              googleClientId, allowOrigin, buyback wallet
//   buyback.json             running buyback & burn totals (logged by the buyback job)
//   <id>/manifest.json       the launch record; frozen once published
//   <id>/state.json          status, manifestHash, manifestBlock, commitments, bindings, votes
//   <id>/onchain.json        group-buy program accounts and init terms (after close)
//
// Nothing here holds or moves SOL. Investors sign messages with their own
// wallets; every state change is queued on the integrity chain.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { canonical, sha256 } = require('../hash');
const { makeEvent } = require('../events');
const chain = require('../chain');
const { verifyWalletSignature, walletKey } = require('./crypto');
const onchain = require('./onchain');

const ID_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;
const MAX_FEE_BPS = 1000;
const NONCE_TTL_MS = 10 * 60_000;

const messages = {
  bind: (sub, wallet, nonce) => `Bundlepad bind ${sub} ${wallet} ${nonce}`,
  commit: (id, sol, wallet, manifestHash) => `Bundlepad commit ${id} ${sol} SOL ${wallet} ${manifestHash}`,
  cancel: (id, wallet, manifestHash) => `Bundlepad cancel ${id} ${wallet} ${manifestHash}`,
  vote: (id, proposal, option, wallet) => `Bundlepad vote ${id} ${proposal} ${option} ${wallet}`,
};

// Vote weight = commit × (1 + 1/log2(SOL committed before this one + 2)).
function withWeights(commitments) {
  let before = 0;
  return commitments.map((c) => {
    const weight = c.sol * (1 + 1 / Math.log2(before + 2));
    before += c.sol;
    return { ...c, weight };
  });
}

// investorTokens = totalTokens × investorSol / totalSol (1:1 by SOL).
function split(commitments, totalTokens) {
  const totalSol = commitments.reduce((s, c) => s + c.sol, 0);
  return commitments.map((c) => ({ wallet: c.wallet, sol: c.sol, tokens: totalSol ? (totalTokens * c.sol) / totalSol : 0 }));
}

function isAddress(a) {
  try { walletKey(a); return true; } catch { return false; }
}

function validateManifest(m) {
  const errors = [];
  const num = (v) => typeof v === 'number' && Number.isFinite(v);
  if (!ID_RE.test(m.id ?? '')) errors.push('id must be lowercase letters, digits and dashes');
  if (!m.label) errors.push('label is required');
  if (!m.token?.name || !m.token?.symbol) errors.push('token.name and token.symbol are required');
  if (!isAddress(m.creatorWallet)) errors.push('creatorWallet must be a Solana address');
  const c = m.caps ?? {};
  for (const k of ['minSol', 'maxSolPerInvestor', 'targetSol', 'maxInvestors']) if (!(num(c[k]) && c[k] > 0)) errors.push(`caps.${k} must be a positive number`);
  if (c.minSol > c.maxSolPerInvestor) errors.push('caps.minSol must not exceed caps.maxSolPerInvestor');
  if (c.maxSolPerInvestor > c.targetSol) errors.push('caps.maxSolPerInvestor must not exceed caps.targetSol');
  if (!(Number.isInteger(m.platformFeeBps) && m.platformFeeBps >= 0 && m.platformFeeBps <= MAX_FEE_BPS)) errors.push(`platformFeeBps must be an integer from 0 to ${MAX_FEE_BPS}`);
  if (m.buybackToken && !isAddress(m.buybackToken)) errors.push('buybackToken must be a mint address');
  const opens = Date.parse(m.commitWindow?.opens), closes = Date.parse(m.commitWindow?.closes), at = Date.parse(m.launchAt);
  if (!(opens < closes)) errors.push('commitWindow.opens must be before commitWindow.closes');
  if (!(closes <= at)) errors.push('launchAt must not be before commitWindow.closes');
  for (const p of m.proposals ?? []) {
    if (!ID_RE.test(p.id ?? '') || !p.title || !(Array.isArray(p.options) && p.options.length >= 2)) errors.push(`proposal ${p.id}: needs id, title and 2+ options`);
    if (p.options?.some((o) => /\s/.test(o))) errors.push(`proposal ${p.id}: options may not contain spaces`);
  }
  return errors;
}

class Launches {
  constructor(repoRoot, { chainStore = null, salt = null, now = () => Date.now() } = {}) {
    this.repoRoot = repoRoot;
    this.dir = path.join(repoRoot, 'launches');
    this.chainStore = chainStore;
    this.now = now;
    this.salt = salt;
    this.nonces = new Map();
  }

  // Salt for hashing Google subjects. Kept out of git (see .gitignore).
  subSalt() {
    if (this.salt) return this.salt;
    if (process.env.BUNDLEPAD_SUB_SALT) return (this.salt = process.env.BUNDLEPAD_SUB_SALT);
    const file = path.join(this.repoRoot, '.secrets', 'sub-salt');
    if (!fs.existsSync(file)) {
      fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
      fs.writeFileSync(file, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
    }
    return (this.salt = fs.readFileSync(file, 'utf8').trim());
  }

  subHash(sub) {
    return sha256(this.subSalt() + ':' + sub);
  }

  read(file, fallback) {
    const p = path.join(this.dir, file);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback;
  }

  write(file, value) {
    const p = path.join(this.dir, file);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p + '.tmp', JSON.stringify(value, null, 2) + '\n');
    fs.renameSync(p + '.tmp', p);
  }

  config() { return this.read('config.json', { googleClientId: '', allowOrigin: '', buybackWallet: null }); }

  ids() {
    if (!fs.existsSync(this.dir)) return [];
    return fs.readdirSync(this.dir).filter((d) => ID_RE.test(d) && fs.existsSync(path.join(this.dir, d, 'manifest.json'))).sort();
  }

  manifest(id) {
    const m = this.read(`${id}/manifest.json`, null);
    if (!m) throw new Error(`no launch ${id}`);
    return m;
  }

  state(id) {
    return this.read(`${id}/state.json`, { status: 'draft', manifestHash: null, manifestBlock: null, commitments: [], bindings: [], votes: [], history: [] });
  }

  saveState(id, state) { this.write(`${id}/state.json`, state); }

  log(type, subject, body) {
    if (!this.chainStore) return null;
    const event = makeEvent({ type, subject, source: 'launch-api', body });
    this.chainStore.withLock(() => {
      chain.enqueue(this.chainStore, event);
      if (type === 'alert') chain.seal(this.chainStore);
    });
    return event;
  }

  sealChain() {
    if (!this.chainStore) return null;
    return this.chainStore.withLock(() => chain.seal(this.chainStore));
  }

  // --- owner actions (CLI) ---------------------------------------------------

  create(manifest) {
    const errors = validateManifest(manifest);
    if (errors.length) throw new Error('invalid manifest:\n  ' + errors.join('\n  '));
    if (this.state(manifest.id).status !== 'draft') throw new Error(`launch ${manifest.id} is already published and frozen`);
    this.write(`${manifest.id}/manifest.json`, manifest);
    return manifest;
  }

  // Freezes the manifest: hashes it, logs it on the chain and seals a block.
  publish(id) {
    const manifest = this.manifest(id);
    const errors = validateManifest(manifest);
    if (errors.length) throw new Error('invalid manifest:\n  ' + errors.join('\n  '));
    const state = this.state(id);
    if (state.status !== 'draft') throw new Error(`launch ${id} is already ${state.status}`);
    state.manifestHash = sha256(canonical(manifest));
    this.log('file', 'launch.manifest', { id, manifestHash: state.manifestHash, manifest });
    const block = this.sealChain();
    state.manifestBlock = block ? block.header.height : null;
    state.status = 'published';
    state.history.push({ ts: new Date(this.now()).toISOString(), status: 'published' });
    this.saveState(id, state);
    return state;
  }

  // Freezes the commitment list (the proportional allocation) and logs it.
  close(id) {
    const state = this.state(id);
    if (state.status !== 'published') throw new Error(`launch ${id} is ${state.status}, not published`);
    state.status = 'closed';
    const commitments = state.commitments.map(({ wallet, sol }) => ({ wallet, sol }));
    this.log('update', 'launch.commitments', { id, manifestHash: state.manifestHash, commitments, totalSol: commitments.reduce((s, c) => s + c.sol, 0) });
    const block = this.sealChain();
    state.commitmentsBlock = block ? block.header.height : null;
    state.history.push({ ts: new Date(this.now()).toISOString(), status: 'closed' });
    this.saveState(id, state);
    return state;
  }

  // Fixes the on-chain terms of a closed launch: program, launch PDA, mint,
  // buyback address and the frozen commitment list in lamports. The launcher
  // sends init_launch from this file; it is logged on the chain first.
  planOnchain(id, { programId, mint, buyback = this.config().buybackWallet, maxSlippageBps = 500, refundAfterSecs = 3600 }) {
    const manifest = this.manifest(id);
    const state = this.state(id);
    if (!programId || !isAddress(programId)) throw new Error('group-buy program id is required (launches/config.json groupBuyProgramId)');
    if (!isAddress(mint)) throw new Error('mint must be an address');
    if (!buyback || !isAddress(buyback)) throw new Error('buyback wallet is required (launches/config.json buybackWallet)');
    if (this.read(`${id}/onchain.json`, null)?.initTx) throw new Error(`launch ${id} is already initialized on chain`);
    const args = onchain.initArgsFromLaunch(manifest, state, { mint, buyback, maxSlippageBps, refundAfterSecs });
    const launch = onchain.launchAddress(programId, manifest.creatorWallet, id);
    const plan = {
      programId,
      launch,
      creator: manifest.creatorWallet,
      vault: onchain.vaultAddress(programId, launch),
      mint,
      tokenProgram: args.tokenProgram,
      buyback,
      manifestHash: state.manifestHash,
      feeBps: args.feeBps,
      maxSlippageBps,
      launchAt: args.launchAt,
      refundAfter: args.refundAfter,
      commitments: args.commitments.map((c) => ({ wallet: c.investor, lamports: c.lamports.toString(), escrow: onchain.escrowAddress(programId, launch, c.investor) })),
      txs: [],
    };
    this.write(`${id}/onchain.json`, plan);
    this.log('update', 'launch.onchain', { id, ...plan, txs: undefined });
    this.sealChain();
    return plan;
  }

  onchain(id) { return this.read(`${id}/onchain.json`, null); }

  // Records a landed transaction (init, deposit batch, buy, settle, refund).
  recordTx(id, kind, signature, extra = {}) {
    const plan = this.onchain(id);
    if (!plan) throw new Error(`launch ${id} has no on-chain plan`);
    plan.txs.push({ kind, signature, ts: new Date(this.now()).toISOString(), ...extra });
    if (kind === 'init') plan.initTx = signature;
    this.write(`${id}/onchain.json`, plan);
    this.log('update', 'launch.tx', { id, kind, signature, ...extra });
    this.sealChain();
    if (kind === 'buy') {
      const state = this.state(id);
      state.status = 'launched';
      state.history.push({ ts: new Date(this.now()).toISOString(), status: 'launched' });
      this.saveState(id, state);
    }
    return plan;
  }

  // Buyback & burn is done by the owner's buyback wallet; each step is recorded.
  recordBuyback({ kind, signature, sol = 0, tokens = 0 }) {
    if (!['swap', 'burn'].includes(kind)) throw new Error('kind must be swap or burn');
    if (!signature) throw new Error('transaction signature is required');
    const bb = this.read('buyback.json', { feesSol: 0, boughtTokens: 0, burnedTokens: 0 });
    bb.history = bb.history ?? [];
    if (bb.history.some((h) => h.signature === signature)) throw new Error('this transaction is already recorded');
    if (kind === 'swap') { bb.feesSol += sol; bb.boughtTokens += tokens; }
    else bb.burnedTokens += tokens;
    bb.history.push({ kind, signature, sol, tokens, ts: new Date(this.now()).toISOString() });
    this.write('buyback.json', bb);
    this.log('update', `buyback.${kind}`, { signature, sol, tokens });
    this.sealChain();
    return bb;
  }

  // Public status, derived from the stored status and the commit window.
  status(id) {
    const state = this.state(id);
    if (state.status !== 'published') return state.status;
    const { opens, closes } = this.manifest(id).commitWindow;
    const t = this.now();
    if (t < Date.parse(opens)) return 'scheduled';
    if (t >= Date.parse(closes)) return 'closing';
    return 'open';
  }

  // --- investor actions (HTTP API) -----------------------------------------

  issueNonce() {
    const t = this.now();
    for (const [n, exp] of this.nonces) if (exp < t) this.nonces.delete(n);
    const nonce = crypto.randomBytes(16).toString('hex');
    this.nonces.set(nonce, t + NONCE_TTL_MS);
    return { nonce, expiresAt: new Date(t + NONCE_TTL_MS).toISOString() };
  }

  takeNonce(nonce) {
    const exp = this.nonces.get(nonce);
    this.nonces.delete(nonce);
    if (!exp || exp < this.now()) throw new Error('nonce is unknown or expired; request a new one');
  }

  // One Google account ↔ one wallet per launch. `sub` comes from a verified ID token.
  bind(id, { sub, wallet, nonce, signature }) {
    const status = this.status(id);
    if (!['open', 'scheduled'].includes(status)) throw new Error(`launch ${id} is not taking sign-ups (${status})`);
    if (!isAddress(wallet)) throw new Error('wallet must be a Solana address');
    this.takeNonce(nonce);
    if (!verifyWalletSignature(wallet, messages.bind(sub, wallet, nonce), signature)) throw new Error('bind signature is invalid');
    const subHash = this.subHash(sub);
    const state = this.state(id);
    const existing = state.bindings.find((b) => b.subHash === subHash || b.wallet === wallet);
    if (existing) {
      if (existing.subHash === subHash && existing.wallet === wallet) return existing;
      throw new Error(existing.subHash === subHash ? 'this Google account is already bound to another wallet' : 'this wallet is already bound to another Google account');
    }
    const binding = { subHash, wallet, boundAt: new Date(this.now()).toISOString() };
    state.bindings.push(binding);
    this.saveState(id, state);
    this.log('update', 'launch.bind', { id, ...binding });
    return binding;
  }

  commit(id, { sub, wallet, sol, signature }) {
    if (this.status(id) !== 'open') throw new Error(`launch ${id} is not open for commitments`);
    const manifest = this.manifest(id);
    const state = this.state(id);
    const { caps } = manifest;
    const binding = state.bindings.find((b) => b.wallet === wallet);
    if (!binding || binding.subHash !== this.subHash(sub)) throw new Error('bind this wallet to your Google account first');
    if (state.commitments.some((c) => c.wallet === wallet)) throw new Error('this wallet has already committed to this launch');
    if (!(typeof sol === 'number' && sol >= caps.minSol && sol <= caps.maxSolPerInvestor)) throw new Error(`commit between ${caps.minSol} and ${caps.maxSolPerInvestor} SOL`);
    if (state.commitments.length >= caps.maxInvestors) throw new Error('this launch has reached its investor limit');
    const committed = state.commitments.reduce((s, c) => s + c.sol, 0);
    if (committed + sol > caps.targetSol + 1e-9) throw new Error(`only ${caps.targetSol - committed} SOL is left before the target`);
    if (!verifyWalletSignature(wallet, messages.commit(id, sol, wallet, state.manifestHash), signature)) throw new Error('commit signature is invalid');
    const commitment = { wallet, sol, signature, ts: this.now() };
    state.commitments.push(commitment);
    this.saveState(id, state);
    this.log('request', 'launch.commit', { id, wallet, sol, signature, manifestHash: state.manifestHash });
    return commitment;
  }

  cancel(id, { wallet, signature }) {
    if (this.status(id) !== 'open') throw new Error(`launch ${id} is not open; cancel by advancing your nonce account instead`);
    const state = this.state(id);
    const i = state.commitments.findIndex((c) => c.wallet === wallet);
    if (i < 0) throw new Error('this wallet has no commitment');
    if (!verifyWalletSignature(wallet, messages.cancel(id, wallet, state.manifestHash), signature)) throw new Error('cancel signature is invalid');
    state.commitments.splice(i, 1);
    state.votes = state.votes.filter((v) => v.wallet !== wallet);
    this.saveState(id, state);
    this.log('request', 'launch.cancel', { id, wallet, signature });
    return { ok: true };
  }

  vote(id, { wallet, proposal, choice, signature }) {
    const manifest = this.manifest(id);
    const state = this.state(id);
    if (!['open', 'closing', 'closed'].includes(this.status(id))) throw new Error(`launch ${id} is not taking votes`);
    const p = (manifest.proposals ?? []).find((x) => x.id === proposal);
    if (!p) throw new Error(`no proposal ${proposal}`);
    if (!Number.isInteger(choice) || !p.options[choice]) throw new Error('invalid choice');
    if (!state.commitments.some((c) => c.wallet === wallet)) throw new Error('commit to this launch to vote');
    if (!verifyWalletSignature(wallet, messages.vote(id, proposal, p.options[choice], wallet), signature)) throw new Error('vote signature is invalid');
    state.votes = state.votes.filter((v) => !(v.wallet === wallet && v.proposal === proposal));
    const vote = { wallet, proposal, choice, signature, ts: this.now() };
    state.votes.push(vote);
    this.saveState(id, state);
    this.log('request', 'launch.vote', { id, wallet, proposal, option: p.options[choice], signature });
    return vote;
  }

  tally(id) {
    const manifest = this.manifest(id);
    const state = this.state(id);
    const weights = Object.fromEntries(withWeights(state.commitments).map((c) => [c.wallet, c.weight]));
    return (manifest.proposals ?? []).map((p) => {
      const tally = p.options.map(() => 0);
      for (const v of state.votes) if (v.proposal === p.id && weights[v.wallet]) tally[v.choice] += weights[v.wallet];
      return { id: p.id, title: p.title, options: p.options, tally };
    });
  }

  // --- public views ----------------------------------------------------------

  // Shape read by index.html (CONFIG.dataUrl). Google subjects never leave the server.
  dashboard(id = this.currentId()) {
    const launches = this.ids().filter((i) => this.state(i).status !== 'draft');
    const { history: _history, ...bb } = this.read('buyback.json', { feesSol: 0, boughtTokens: 0, burnedTokens: 0 });
    const buyback = { wallet: this.config().buybackWallet ?? null, ...bb, launches: launches.filter((i) => this.state(i).status === 'launched').length };
    if (!id) return { launch: null, investors: [], proposals: [], buyback };
    const manifest = this.manifest(id);
    const state = this.state(id);
    const statusMap = { open: 'open', scheduled: 'scheduled', closing: 'closed', closed: 'closed', launched: 'launched', draft: 'draft' };
    return {
      launch: { ...manifest, status: statusMap[this.status(id)], manifestHash: state.manifestHash, manifestBlock: state.manifestBlock },
      investors: state.commitments.map(({ wallet, sol, ts }) => ({ wallet, sol, ts })),
      proposals: this.tally(id),
      onchain: this.publicOnchain(id),
      buyback,
    };
  }

  // What the dashboard needs to build deposit/withdraw transactions.
  publicOnchain(id) {
    const plan = this.onchain(id);
    if (!plan?.initTx) return null;
    const { programId, launch, vault, mint, tokenProgram, launchAt, refundAfter, commitments, txs } = plan;
    return { programId, launch, vault, mint, tokenProgram, launchAt, refundAfter, commitments, txs };
  }

  // The newest published launch.
  currentId() {
    const live = this.ids().filter((i) => this.state(i).status !== 'draft');
    return live.length ? live[live.length - 1] : null;
  }
}

module.exports = { Launches, messages, validateManifest, withWeights, split, MAX_FEE_BPS };
