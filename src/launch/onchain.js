'use strict';

// Addresses and instruction encoding for the group-buy program
// (onchain/group-buy). No dependencies, so the backend, the launcher and the
// tests share one implementation; test/onchain.test.js checks it against
// vectors produced by the Rust program crate.
//
// Instructions are returned as { programId, keys: [{ pubkey, isSigner, isWritable }], data }
// with base58 strings for keys and a Buffer for data.

const crypto = require('node:crypto');
const base58 = require('./base58');

const SYSTEM_PROGRAM = '11111111111111111111111111111111';
const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_2022_PROGRAM = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
const ATA_PROGRAM = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
const PUMP_PROGRAM = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
const LAMPORTS_PER_SOL = 1_000_000_000n;
const MAX_INVESTORS = 32;

// pump.fun buy_exact_quote_in_v2 (same accounts as buy_v2).
const PUMP_BUY_ACCOUNTS = 27;
const PUMP_IX_USER = 13;
const PUMP_IX_ASSOCIATED_BASE_USER = 14;
const PUMP_BUY_WRITABLE = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 21];

const TAG = { init: 0, deposit: 1, withdraw: 2, cancel: 3, executeBuy: 4, settle: 5, closeLaunch: 6 };

// --- ed25519 on-curve check (PDAs must be off the curve) --------------------

const P = 2n ** 255n - 19n;
const modp = (a) => ((a % P) + P) % P;
function powmod(b, e) {
  let r = 1n;
  b = modp(b);
  for (; e > 0n; e >>= 1n, b = (b * b) % P) if (e & 1n) r = (r * b) % P;
  return r;
}
const D = modp(-121665n * powmod(121666n, P - 2n));

function isOnCurve(bytes) {
  const le = Buffer.from(bytes);
  le[31] &= 0x7f;
  const y = modp(BigInt('0x' + Buffer.from(le).reverse().toString('hex')));
  const y2 = (y * y) % P;
  const u = modp(y2 - 1n);
  const v = modp(D * y2 + 1n);
  // x = u·v³·(u·v⁷)^((p−5)/8); a point exists iff v·x² = ±u (RFC 8032 §5.1.3).
  const v3 = (v * v * v) % P;
  const x = (u * v3 % P) * powmod(u * ((v3 * v3 % P) * v % P), (P - 5n) / 8n) % P;
  const vx2 = (v * x % P) * x % P;
  return vx2 === u || vx2 === modp(-u);
}

function createProgramAddress(seeds, programId) {
  const h = crypto.createHash('sha256');
  for (const s of seeds) h.update(s);
  h.update(base58.decode(programId)).update('ProgramDerivedAddress');
  const out = h.digest();
  if (isOnCurve(out)) throw new Error('invalid seeds: address is on the curve');
  return base58.encode(out);
}

function findProgramAddress(seeds, programId) {
  for (let bump = 255; bump >= 0; bump--) {
    try { return [createProgramAddress([...seeds, Buffer.from([bump])], programId), bump]; } catch { /* next bump */ }
  }
  throw new Error('no viable bump seed');
}

const key = (k) => base58.decode(k);

function associatedTokenAddress(wallet, mint, tokenProgram = TOKEN_2022_PROGRAM) {
  return findProgramAddress([key(wallet), key(tokenProgram), key(mint)], ATA_PROGRAM)[0];
}

// The launch id from the manifest ("bp-001") becomes a fixed 32-byte seed.
const idSeed = (launchId) => crypto.createHash('sha256').update(`bundlepad:${launchId}`).digest();

const launchAddress = (programId, creator, launchId) => findProgramAddress([Buffer.from('launch'), key(creator), idSeed(launchId)], programId)[0];
const escrowAddress = (programId, launch, investor) => findProgramAddress([Buffer.from('escrow'), key(launch), key(investor)], programId)[0];
const vaultAddress = (programId, launch) => findProgramAddress([Buffer.from('vault'), key(launch)], programId)[0];
const bondingCurveAddress = (mint) => findProgramAddress([Buffer.from('bonding-curve'), key(mint)], PUMP_PROGRAM)[0];

// SOL as a decimal string or number → lamports (bigint), without float error.
function solToLamports(sol) {
  const [whole, frac = ''] = String(sol).split('.');
  if (!/^\d+$/.test(whole) || !/^\d*$/.test(frac) || frac.length > 9) throw new Error(`invalid SOL amount ${sol}`);
  return BigInt(whole) * LAMPORTS_PER_SOL + BigInt(frac.padEnd(9, '0'));
}

// --- instructions --------------------------------------------------------

const meta = (pubkey, isSigner, isWritable) => ({ pubkey, isSigner, isWritable });

function u16(n) { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; }
function u64(n) { const b = Buffer.alloc(8); b.writeBigUInt64LE(BigInt(n)); return b; }
function i64(n) { const b = Buffer.alloc(8); b.writeBigInt64LE(BigInt(n)); return b; }

function encodeInitLaunch(a) {
  if (!a.commitments.length || a.commitments.length > MAX_INVESTORS) throw new Error(`1 to ${MAX_INVESTORS} commitments required`);
  return Buffer.concat([
    Buffer.from([TAG.init]), a.idSeed, a.manifestHash, key(a.mint), key(a.tokenProgram), key(a.buyback),
    u16(a.feeBps), u16(a.maxSlippageBps), i64(a.launchAt), i64(a.refundAfter), u16(a.commitments.length),
    ...a.commitments.flatMap((c) => [key(c.investor), u64(c.lamports)]),
  ]);
}

function initLaunch(programId, creator, args) {
  const launch = findProgramAddress([Buffer.from('launch'), key(creator), args.idSeed], programId)[0];
  return { programId, keys: [meta(creator, true, true), meta(launch, false, true), meta(SYSTEM_PROGRAM, false, false)], data: encodeInitLaunch(args) };
}

function deposit(programId, launch, investor) {
  return {
    programId,
    keys: [meta(investor, true, true), meta(launch, false, true), meta(escrowAddress(programId, launch, investor), false, true), meta(SYSTEM_PROGRAM, false, false)],
    data: Buffer.from([TAG.deposit]),
  };
}

// `investorSigns` is false for refunds after a cancel or the deadline.
function withdraw(programId, launch, investor, investorSigns = true) {
  return {
    programId,
    keys: [meta(investor, investorSigns, true), meta(launch, false, true), meta(escrowAddress(programId, launch, investor), false, true)],
    data: Buffer.from([TAG.withdraw]),
  };
}

function cancel(programId, launch, creator) {
  return { programId, keys: [meta(creator, true, false), meta(launch, false, true)], data: Buffer.from([TAG.cancel]) };
}

// `pumpKeys`: the 27 buy accounts in IDL order, e.g. from the pump.fun SDK's
// buy_v2 builder with `user` = the vault. Signer/writable flags are reset here.
function executeBuy(programId, { payer, launch, mint, buyback, tokenProgram = TOKEN_2022_PROGRAM, pumpKeys, escrows }) {
  if (pumpKeys.length !== PUMP_BUY_ACCOUNTS) throw new Error(`expected ${PUMP_BUY_ACCOUNTS} pump accounts`);
  const vault = vaultAddress(programId, launch);
  const vaultAta = associatedTokenAddress(vault, mint, tokenProgram);
  if (pumpKeys[PUMP_IX_USER] !== vault) throw new Error('pump buy user must be the launch vault');
  if (pumpKeys[PUMP_IX_ASSOCIATED_BASE_USER] !== vaultAta) throw new Error("pump buy token account must be the vault's");
  return {
    programId,
    keys: [
      meta(payer, true, true), meta(launch, false, true), meta(vault, false, true), meta(vaultAta, false, true),
      meta(buyback, false, true), meta(mint, false, false), meta(tokenProgram, false, false),
      meta(ATA_PROGRAM, false, false), meta(SYSTEM_PROGRAM, false, false),
      ...pumpKeys.map((k, i) => meta(k, false, PUMP_BUY_WRITABLE.includes(i))),
      ...escrows.map((e) => meta(e, false, true)),
    ],
    data: Buffer.from([TAG.executeBuy]),
  };
}

function settle(programId, { payer, launch, investor, mint, tokenProgram = TOKEN_2022_PROGRAM }) {
  const vault = vaultAddress(programId, launch);
  return {
    programId,
    keys: [
      meta(payer, true, true), meta(launch, false, true), meta(escrowAddress(programId, launch, investor), false, true),
      meta(investor, false, true), meta(associatedTokenAddress(investor, mint, tokenProgram), false, true),
      meta(vault, false, false), meta(associatedTokenAddress(vault, mint, tokenProgram), false, true),
      meta(mint, false, false), meta(tokenProgram, false, false), meta(ATA_PROGRAM, false, false), meta(SYSTEM_PROGRAM, false, false),
    ],
    data: Buffer.from([TAG.settle]),
  };
}

function closeLaunch(programId, launch, creator) {
  return { programId, keys: [meta(creator, false, true), meta(launch, false, true)], data: Buffer.from([TAG.closeLaunch]) };
}

// --- account decoding (layout in onchain/group-buy/src/state.rs) -----------

const STATES = ['funding', 'bought', 'cancelled'];

function decodeLaunch(data) {
  const b = Buffer.from(data);
  if (b.subarray(0, 8).toString() !== 'BPLAUNCH') throw new Error('not a launch account');
  let at = 8;
  const u8 = () => b[at++];
  const pk = () => { const k = base58.encode(b.subarray(at, at + 32)); at += 32; return k; };
  const raw = () => { const r = b.subarray(at, at + 32); at += 32; return Buffer.from(r).toString('hex'); };
  const r16 = () => { const v = b.readUInt16LE(at); at += 2; return v; };
  const r64 = () => { const v = b.readBigUInt64LE(at); at += 8; return v; };
  const ri64 = () => { const v = b.readBigInt64LE(at); at += 8; return v; };
  u8(); // layout version
  const out = { bump: u8(), vaultBump: u8(), state: STATES[u8()], creator: pk(), mint: pk(), tokenProgram: pk(), buyback: pk(), idSeed: raw(), manifestHash: raw() };
  Object.assign(out, { feeBps: r16(), maxSlippageBps: r16(), launchAt: Number(ri64()), refundAfter: Number(ri64()) });
  const n = r16();
  Object.assign(out, { fundedCount: r16(), settledCount: r16(), totalFunded: r64(), tokensBought: r64(), solLeft: r64(), feePaid: r64() });
  out.commitments = [];
  for (let i = 0; i < n; i++) {
    const investor = pk();
    const lamports = r64();
    const flags = u8();
    out.commitments.push({ investor, lamports, funded: !!(flags & 1), settled: !!(flags & 2) });
  }
  return out;
}

// Init arguments for a closed launch: the frozen commitment list, the
// manifest hash and fee, plus the on-chain parameters chosen at launch time.
function initArgsFromLaunch(manifest, state, { mint, buyback, tokenProgram = TOKEN_2022_PROGRAM, maxSlippageBps = 500, refundAfterSecs = 3600 }) {
  if (state.status !== 'closed') throw new Error(`launch ${manifest.id} must be closed first`);
  const launchAt = Math.floor(Date.parse(manifest.launchAt) / 1000);
  return {
    idSeed: idSeed(manifest.id),
    manifestHash: Buffer.from(state.manifestHash, 'hex'),
    mint,
    tokenProgram,
    buyback,
    feeBps: manifest.platformFeeBps,
    maxSlippageBps,
    launchAt,
    refundAfter: launchAt + refundAfterSecs,
    commitments: state.commitments.map((c) => ({ investor: c.wallet, lamports: solToLamports(c.sol) })),
  };
}

module.exports = {
  SYSTEM_PROGRAM, TOKEN_PROGRAM, TOKEN_2022_PROGRAM, ATA_PROGRAM, PUMP_PROGRAM, PUMP_BUY_ACCOUNTS, MAX_INVESTORS,
  isOnCurve, createProgramAddress, findProgramAddress, associatedTokenAddress, idSeed,
  launchAddress, escrowAddress, vaultAddress, bondingCurveAddress, solToLamports,
  encodeInitLaunch, initLaunch, deposit, withdraw, cancel, executeBuy, settle, closeLaunch,
  decodeLaunch, initArgsFromLaunch,
};
