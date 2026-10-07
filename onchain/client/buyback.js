#!/usr/bin/env node
'use strict';

// Buyback & burn: swaps the SOL that launch fees put in the buyback wallet for
// $BUNDLEPAD (via Jupiter), burns every $BUNDLEPAD the wallet holds, and
// records both transactions on the integrity chain.
//
//   node buyback.js --keypair buyback.json [--keep SOL] [--min SOL] [--slippage BPS] [--dry-run] [--burn-only]
//
// Reads bundlepadMint, buybackWallet and rpcUrl from launches/config.json
// (set with "chain configure"). Safe to run from cron: it does nothing when
// less than --min SOL (default 0.05) is available above --keep (default 0.05).
// It only ever swaps SOL → $BUNDLEPAD and only burns $BUNDLEPAD.

const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, VersionedTransaction } = require('@solana/web3.js');
const { Launches } = require('../../src/launch/launch');
const { Store } = require('../../src/store');

const REPO = path.resolve(__dirname, '..', '..');
const WSOL = 'So11111111111111111111111111111111111111112';
const DEFAULT_JUPITER = 'https://lite-api.jup.ag';
const LAMPORTS = 1e9;

// SPL Token / Token-2022 BurnChecked: [15, amount u64 LE, decimals].
function burnCheckedIx({ tokenProgram, account, mint, owner, amount, decimals }) {
  const data = Buffer.alloc(10);
  data[0] = 15;
  data.writeBigUInt64LE(BigInt(amount), 1);
  data[9] = decimals;
  return new TransactionInstruction({
    programId: new PublicKey(tokenProgram),
    keys: [
      { pubkey: new PublicKey(account), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(mint), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(owner), isSigner: true, isWritable: false },
    ],
    data,
  });
}

// Every token account of `owner` for `mint`: [{ address, amount (bigint), decimals, tokenProgram }].
async function tokenAccounts(conn, owner, mint) {
  const res = await conn.getParsedTokenAccountsByOwner(new PublicKey(owner), { mint: new PublicKey(mint) });
  return res.value.map(({ pubkey, account }) => ({
    address: pubkey.toBase58(),
    amount: BigInt(account.data.parsed.info.tokenAmount.amount),
    decimals: account.data.parsed.info.tokenAmount.decimals,
    tokenProgram: account.owner.toBase58(),
  }));
}

async function confirm(conn, sig, label) {
  const res = await conn.confirmTransaction(sig, 'confirmed');
  if (res.value.err) throw new Error(`${label} failed: ${JSON.stringify(res.value.err)} (${sig})`);
  return sig;
}

async function run({ conn, fetchImpl = fetch, payer, mint, record, opts = {}, log = console.log }) {
  const jupiter = (opts.jupiter ?? process.env.JUPITER_URL ?? DEFAULT_JUPITER).replace(/\/$/, '');
  const keep = Math.round(Number(opts.keep ?? 0.05) * LAMPORTS);
  const min = Math.round(Number(opts.min ?? 0.05) * LAMPORTS);
  const slippage = Number(opts.slippage ?? 100);
  const owner = payer.publicKey.toBase58();
  const out = { swapped: null, burned: null };

  if (!opts['burn-only']) {
    const balance = await conn.getBalance(payer.publicKey);
    const spend = balance - keep;
    if (spend < min) {
      log(`nothing to buy back: ${balance / LAMPORTS} SOL in the wallet, keeping ${keep / LAMPORTS}`);
    } else {
      const q = await fetchImpl(`${jupiter}/swap/v1/quote?inputMint=${WSOL}&outputMint=${mint}&amount=${spend}&slippageBps=${slippage}`);
      if (!q.ok) throw new Error(`Jupiter quote failed (${q.status})`);
      const quote = await q.json();
      if (quote.outputMint && quote.outputMint !== mint) throw new Error('Jupiter quoted a different token');
      log(`buy back: ${spend / LAMPORTS} SOL → ~${quote.outAmount} $BUNDLEPAD base units`);
      if (opts['dry-run']) {
        out.swapped = { dryRun: true, sol: spend / LAMPORTS, quoteOut: quote.outAmount };
      } else {
        const before = (await tokenAccounts(conn, owner, mint)).reduce((s, a) => s + a.amount, 0n);
        const s = await fetchImpl(`${jupiter}/swap/v1/swap`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ quoteResponse: quote, userPublicKey: owner, wrapAndUnwrapSol: true, dynamicComputeUnitLimit: true }),
        });
        if (!s.ok) throw new Error(`Jupiter swap failed (${s.status})`);
        const tx = VersionedTransaction.deserialize(Buffer.from((await s.json()).swapTransaction, 'base64'));
        tx.sign([payer]);
        const sig = await confirm(conn, await conn.sendRawTransaction(tx.serialize(), { maxRetries: 5 }), 'swap');
        const after = await tokenAccounts(conn, owner, mint);
        const bought = after.reduce((sum, a) => sum + a.amount, 0n) - before;
        const decimals = after[0]?.decimals ?? 6;
        record({ kind: 'swap', signature: sig, sol: spend / LAMPORTS, tokens: Number(bought) / 10 ** decimals });
        log(`swapped: ${sig}`);
        out.swapped = { signature: sig, sol: spend / LAMPORTS, tokens: bought };
      }
    }
  }

  const accounts = (await tokenAccounts(conn, owner, mint)).filter((a) => a.amount > 0n);
  const total = accounts.reduce((s, a) => s + a.amount, 0n);
  if (!total) {
    log('nothing to burn');
  } else if (opts['dry-run']) {
    log(`would burn ${total} $BUNDLEPAD base units`);
    out.burned = { dryRun: true, amount: total };
  } else {
    const ixs = accounts.map((a) => burnCheckedIx({ tokenProgram: a.tokenProgram, account: a.address, mint, owner, amount: a.amount, decimals: a.decimals }));
    const { blockhash } = await conn.getLatestBlockhash();
    const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(...ixs);
    tx.sign(payer);
    const sig = await confirm(conn, await conn.sendRawTransaction(tx.serialize(), { maxRetries: 5 }), 'burn');
    record({ kind: 'burn', signature: sig, tokens: Number(total) / 10 ** accounts[0].decimals });
    log(`burned ${total} base units: ${sig}`);
    out.burned = { signature: sig, amount: total };
  }
  return out;
}

async function main(argv) {
  const { values: opts } = parseArgs({
    args: argv,
    options: {
      keypair: { type: 'string' }, rpc: { type: 'string' }, jupiter: { type: 'string' }, keep: { type: 'string' },
      min: { type: 'string' }, slippage: { type: 'string' }, 'dry-run': { type: 'boolean' }, 'burn-only': { type: 'boolean' },
    },
  });
  if (!opts.keypair) throw new Error('--keypair (the buyback wallet) is required');
  const store = new Store(REPO);
  const launches = new Launches(REPO, { chainStore: store.exists() ? store : null });
  const cfg = launches.config();
  if (!cfg.bundlepadMint) throw new Error('set the $BUNDLEPAD mint: chain configure --bundlepad-mint MINT');
  const rpc = opts.rpc ?? process.env.BUNDLEPAD_RPC ?? cfg.rpcUrl;
  if (!rpc) throw new Error('set an RPC URL (--rpc, BUNDLEPAD_RPC or chain configure --rpc-url)');
  const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(opts.keypair, 'utf8'))));
  if (cfg.buybackWallet && payer.publicKey.toBase58() !== cfg.buybackWallet) {
    throw new Error(`keypair ${payer.publicKey.toBase58()} is not the configured buyback wallet ${cfg.buybackWallet}`);
  }
  await run({ conn: new Connection(rpc, 'confirmed'), payer, mint: cfg.bundlepadMint, record: (r) => launches.recordBuyback(r), opts });
}

if (require.main === module) {
  main(process.argv.slice(2)).then(() => {}, (err) => { console.error(`error: ${err.message}`); process.exitCode = 1; });
}

module.exports = { run, burnCheckedIx, tokenAccounts };
