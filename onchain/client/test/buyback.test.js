'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { Keypair, PublicKey, TransactionMessage, VersionedTransaction } = require('@solana/web3.js');
const { run, burnCheckedIx } = require('../buyback');

const MINT = Keypair.generate().publicKey.toBase58();
const T22 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

// A fake RPC: tracks the SOL balance and $BUNDLEPAD balance the swap and burn change.
function fakeChain(payer, { sol, tokens = 0n }) {
  const state = { sol, tokens, sent: [] };
  const conn = {
    getBalance: async () => state.sol,
    getLatestBlockhash: async () => ({ blockhash: Keypair.generate().publicKey.toBase58(), lastValidBlockHeight: 1 }),
    getParsedTokenAccountsByOwner: async () => ({
      value: state.tokens === null ? [] : [{ pubkey: new PublicKey(Keypair.generate().publicKey), account: { owner: new PublicKey(T22), data: { parsed: { info: { tokenAmount: { amount: String(state.tokens), decimals: 6 } } } } } }],
    }),
    sendRawTransaction: async (raw) => {
      state.sent.push(raw);
      if (state.pendingSwap) { state.sol -= state.pendingSwap.sol; state.tokens += state.pendingSwap.tokens; state.pendingSwap = null; } else state.tokens = 0n;
      return `sig${state.sent.length}`;
    },
    confirmTransaction: async () => ({ value: { err: null } }),
  };
  return { conn, state };
}

function fakeJupiter(state, payer, rate) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push(url);
    if (url.includes('/quote')) {
      const amount = Number(new URL(url).searchParams.get('amount'));
      assert.strictEqual(new URL(url).searchParams.get('outputMint'), MINT);
      return { ok: true, json: async () => ({ outputMint: MINT, outAmount: String(amount * rate), inAmount: String(amount) }) };
    }
    const body = JSON.parse(init.body);
    assert.strictEqual(body.userPublicKey, payer.publicKey.toBase58());
    state.pendingSwap = { sol: Number(body.quoteResponse.inAmount), tokens: BigInt(body.quoteResponse.outAmount) };
    const msg = new TransactionMessage({ payerKey: payer.publicKey, recentBlockhash: Keypair.generate().publicKey.toBase58(), instructions: [] }).compileToV0Message();
    return { ok: true, json: async () => ({ swapTransaction: Buffer.from(new VersionedTransaction(msg).serialize()).toString('base64') }) };
  };
  return { fetchImpl, calls };
}

test('swaps everything above the reserve, burns it all, and records both', async () => {
  const payer = Keypair.generate();
  const { conn, state } = fakeChain(payer, { sol: 1_050_000_000 });
  const { fetchImpl, calls } = fakeJupiter(state, payer, 1000);
  const records = [];
  const out = await run({ conn, fetchImpl, payer, mint: MINT, record: (r) => records.push(r), log: () => {} });
  assert.strictEqual(calls.length, 2);
  assert.strictEqual(state.sol, 50_000_000, 'keeps 0.05 SOL for fees');
  assert.strictEqual(state.tokens, 0n, 'everything bought is burned');
  assert.deepStrictEqual(records.map((r) => r.kind), ['swap', 'burn']);
  assert.strictEqual(records[0].sol, 1);
  assert.strictEqual(records[1].tokens, 1_000_000_000_000 / 1e6);
  assert.strictEqual(out.burned.amount, 1_000_000_000_000n);
});

test('does nothing below the minimum, and dry runs send nothing', async () => {
  const payer = Keypair.generate();
  const small = fakeChain(payer, { sol: 60_000_000, tokens: null });
  const j1 = fakeJupiter(small.state, payer, 1);
  await run({ conn: small.conn, fetchImpl: j1.fetchImpl, payer, mint: MINT, record: () => assert.fail(), log: () => {} });
  assert.strictEqual(j1.calls.length, 0);

  const big = fakeChain(payer, { sol: 5_000_000_000, tokens: 7n });
  const j2 = fakeJupiter(big.state, payer, 1);
  const out = await run({ conn: big.conn, fetchImpl: j2.fetchImpl, payer, mint: MINT, record: () => assert.fail(), opts: { 'dry-run': true }, log: () => {} });
  assert.strictEqual(big.state.sent.length, 0);
  assert.ok(out.swapped.dryRun && out.burned.dryRun);
});

test('refuses a quote for another token', async () => {
  const payer = Keypair.generate();
  const { conn } = fakeChain(payer, { sol: 2_000_000_000 });
  const fetchImpl = async () => ({ ok: true, json: async () => ({ outputMint: Keypair.generate().publicKey.toBase58(), outAmount: '1' }) });
  await assert.rejects(run({ conn, fetchImpl, payer, mint: MINT, record: () => {}, log: () => {} }), /different token/);
});

test('BurnChecked encoding', () => {
  const owner = Keypair.generate().publicKey.toBase58();
  const ix = burnCheckedIx({ tokenProgram: T22, account: MINT, mint: MINT, owner, amount: 258n, decimals: 6 });
  assert.deepStrictEqual([...ix.data], [15, 2, 1, 0, 0, 0, 0, 0, 0, 6]);
  assert.ok(ix.keys[2].isSigner && ix.keys[0].isWritable && ix.keys[1].isWritable);
});
