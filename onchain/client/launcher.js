#!/usr/bin/env node
'use strict';

// Launcher for the Bundlepad group-buy program (onchain/group-buy).
//
//   node launcher.js prepare ID [--slippage BPS] [--refund-after SECS]
//   node launcher.js init    ID --keypair creator.json
//   node launcher.js status  ID
//   node launcher.js alt     ID --keypair payer.json
//   node launcher.js launch  ID --keypair creator.json [--payer payer.json] [--tip LAMPORTS] [--at ISO-TIME]
//                               [--no-jito] [--no-settle] [--dry-run]
//                            (settles everyone right after the buy unless --no-settle)
//   node launcher.js settle  ID --keypair payer.json
//   node launcher.js refund  ID --keypair payer.json        (after a cancel or the deadline)
//   node launcher.js cancel  ID --keypair creator.json
//   node launcher.js close   ID --keypair creator.json
//
// Reads launches/config.json (groupBuyProgramId, buybackWallet, rpcUrl) and
// launches/<ID>/onchain.json. Every landed transaction is recorded on the
// integrity chain. RPC: --rpc or BUNDLEPAD_RPC or config.rpcUrl. Jito:
// --jito or JITO_URL (default mainnet block engine).
//
// No transaction here moves an investor's SOL except through the program:
// deposits are signed by investors on the dashboard, and the buy, settle and
// refund instructions are checked on chain.

const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');
const {
  AddressLookupTableProgram, ComputeBudgetProgram, Connection, Keypair, PublicKey, SystemProgram,
  Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction,
} = require('@solana/web3.js');
const BN = require('bn.js');
const onchain = require('../../src/launch/onchain');
const base58 = require('../../src/launch/base58');
const { Launches } = require('../../src/launch/launch');
const { Store } = require('../../src/store');

const REPO = path.resolve(__dirname, '..', '..');
const WSOL = 'So11111111111111111111111111111111111111112';
const DEFAULT_JITO = 'https://mainnet.block-engine.jito.wtf';
const DEFAULT_TIP = 1_000_000; // 0.001 SOL
const SETTLES_PER_TX = 3;
const REFUNDS_PER_TX = 8;

function toWeb3(ix) {
  return new TransactionInstruction({
    programId: new PublicKey(ix.programId),
    keys: ix.keys.map((k) => ({ pubkey: new PublicKey(k.pubkey), isSigner: k.isSigner, isWritable: k.isWritable })),
    data: Buffer.from(ix.data),
  });
}

function loadKeypair(file) {
  if (!file) throw new Error('--keypair is required');
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(file, 'utf8'))));
}

const mintKeyFile = (id) => path.join(REPO, '.secrets', 'mints', `${id}.json`);

function openLaunches() {
  const store = new Store(REPO);
  return new Launches(REPO, { chainStore: store.exists() ? store : null });
}

function requirePlan(launches, id) {
  const plan = launches.onchain(id);
  if (!plan) throw new Error(`launch ${id} has no on-chain plan; run "launcher.js prepare ${id}" after closing it`);
  return plan;
}

// --- pure builders (unit-tested in test/launcher.test.js) -------------------

// The 27 pump.fun buy accounts with the vault as buyer. buy_v2 and
// buy_exact_quote_in_v2 take the same accounts, so the SDK's buy_v2 builder
// gives the right order.
async function pumpBuyKeys(pumpSdk, plan, { feeRecipient, buybackFeeRecipient }) {
  const ix = await pumpSdk.getBuyV2InstructionRaw({
    user: new PublicKey(plan.vault),
    mint: new PublicKey(plan.mint),
    creator: new PublicKey(plan.creator),
    amount: new BN(1),
    quoteAmount: new BN(1),
    tokenProgram: new PublicKey(plan.tokenProgram),
    quoteMint: new PublicKey(WSOL),
    quoteTokenProgram: new PublicKey(onchain.TOKEN_PROGRAM),
    feeRecipient: new PublicKey(feeRecipient),
    buybackFeeRecipient: new PublicKey(buybackFeeRecipient),
  });
  return ix.keys.map((k) => k.pubkey.toBase58());
}

function executeBuyIx(plan, { payer, pumpKeys, escrows }) {
  return onchain.executeBuy(plan.programId, {
    payer, launch: plan.launch, mint: plan.mint, buyback: plan.buyback, tokenProgram: plan.tokenProgram, pumpKeys, escrows,
  });
}

// Everything execute_buy touches except the payer, for the lookup table.
function lookupTableKeys(plan, pumpKeys) {
  const ix = executeBuyIx(plan, { payer: plan.creator, pumpKeys, escrows: plan.commitments.map((c) => c.escrow) });
  return [...new Set(ix.keys.slice(1).map((k) => k.pubkey).concat(plan.programId, ComputeBudgetProgram.programId.toBase58()))];
}

function buyTransaction(plan, { payer, pumpKeys, escrows, tip, tipAccount, blockhash, lookupTable }) {
  const ixs = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    toWeb3(executeBuyIx(plan, { payer: payer.publicKey.toBase58(), pumpKeys, escrows })),
  ];
  if (tip) ixs.push(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: new PublicKey(tipAccount), lamports: tip }));
  const message = new TransactionMessage({ payerKey: payer.publicKey, recentBlockhash: blockhash, instructions: ixs })
    .compileToV0Message(lookupTable ? [lookupTable] : []);
  const tx = new VersionedTransaction(message);
  tx.sign([payer]);
  return tx;
}

function legacyTransaction(ixs, feePayer, signers, blockhash) {
  const tx = new Transaction({ feePayer: feePayer.publicKey, recentBlockhash: blockhash });
  tx.add(...ixs);
  tx.sign(...signers);
  return tx;
}

// --- RPC helpers ---------------------------------------------------------------

async function fetchLaunch(conn, plan) {
  const info = await conn.getAccountInfo(new PublicKey(plan.launch));
  return info ? onchain.decodeLaunch(info.data) : null;
}

async function send(conn, tx, label) {
  const raw = tx.serialize();
  const sig = await conn.sendRawTransaction(raw, { skipPreflight: false, maxRetries: 5 });
  const res = await conn.confirmTransaction(sig, 'confirmed');
  if (res.value.err) throw new Error(`${label} failed: ${JSON.stringify(res.value.err)} (${sig})`);
  console.log(`${label}: ${sig}`);
  return sig;
}

async function jito(url, method, params) {
  const endpoint = method === 'sendBundle' ? 'bundles' : method;
  const res = await fetch(`${url}/api/v1/${endpoint}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`jito ${method}: ${json.error.message}`);
  return json.result;
}

function chunk(list, n) {
  const out = [];
  for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n));
  return out;
}

// --- commands --------------------------------------------------------------------

const commands = {
  async prepare(ctx, id) {
    const { launches, opts } = ctx;
    const file = mintKeyFile(id);
    if (!fs.existsSync(file)) {
      fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
      fs.writeFileSync(file, JSON.stringify([...Keypair.generate().secretKey]), { mode: 0o600 });
    }
    const mint = loadKeypair(file).publicKey.toBase58();
    const cfg = launches.config();
    const plan = launches.planOnchain(id, {
      programId: opts.program ?? cfg.groupBuyProgramId,
      mint,
      maxSlippageBps: opts.slippage ? Number(opts.slippage) : undefined,
      refundAfterSecs: opts['refund-after'] ? Number(opts['refund-after']) : undefined,
    });
    console.log(`mint ${mint} (key in ${path.relative(REPO, file)}, keep it secret until launch)`);
    console.log(`launch account ${plan.launch}, vault ${plan.vault}, ${plan.commitments.length} commitments`);
  },

  async init(ctx, id) {
    const { launches, conn, opts } = ctx;
    const plan = requirePlan(launches, id);
    const creator = loadKeypair(opts.keypair);
    if (creator.publicKey.toBase58() !== plan.creator) throw new Error(`keypair is not the launch creator ${plan.creator}`);
    const args = {
      idSeed: onchain.idSeed(id), manifestHash: Buffer.from(plan.manifestHash, 'hex'), mint: plan.mint, tokenProgram: plan.tokenProgram,
      buyback: plan.buyback, feeBps: plan.feeBps, maxSlippageBps: plan.maxSlippageBps, launchAt: plan.launchAt, refundAfter: plan.refundAfter,
      commitments: plan.commitments.map((c) => ({ investor: c.wallet, lamports: BigInt(c.lamports) })),
    };
    const ix = toWeb3(onchain.initLaunch(plan.programId, plan.creator, args));
    const { blockhash } = await conn.getLatestBlockhash();
    const sig = await send(conn, legacyTransaction([ix], creator, [creator], blockhash), 'init_launch');
    launches.recordTx(id, 'init', sig);
  },

  async status(ctx, id) {
    const plan = requirePlan(ctx.launches, id);
    const l = await fetchLaunch(ctx.conn, plan);
    if (!l) return console.log(`launch ${plan.launch} is not initialized on chain`);
    console.log(`${id}: ${l.state}, ${l.fundedCount}/${l.commitments.length} funded, ${l.settledCount} settled`);
    for (const c of l.commitments) console.log(`  ${c.investor} ${Number(c.lamports) / 1e9} SOL ${c.funded ? 'funded' : '-'}${c.settled ? ' settled' : ''}`);
    if (l.state === 'bought') console.log(`  bought ${l.tokensBought} tokens with ${Number(l.totalFunded) / 1e9} SOL, fee ${Number(l.feePaid) / 1e9} SOL`);
  },

  async alt(ctx, id) {
    const { launches, conn, opts, pumpSdk } = ctx;
    const plan = requirePlan(launches, id);
    const payer = loadKeypair(opts.keypair);
    const global = await ctx.online().fetchGlobal();
    const pumpKeys = await pumpBuyKeys(pumpSdk, plan, recipients(global));
    const keys = lookupTableKeys(plan, pumpKeys).map((k) => new PublicKey(k));
    const slot = await conn.getSlot('finalized');
    const [create, table] = AddressLookupTableProgram.createLookupTable({ authority: payer.publicKey, payer: payer.publicKey, recentSlot: slot });
    const batches = chunk(keys, 20).map((addresses) => AddressLookupTableProgram.extendLookupTable({ payer: payer.publicKey, authority: payer.publicKey, lookupTable: table, addresses }));
    let { blockhash } = await conn.getLatestBlockhash();
    await send(conn, legacyTransaction([create, batches[0]], payer, [payer], blockhash), 'create lookup table');
    for (const b of batches.slice(1)) {
      ({ blockhash } = await conn.getLatestBlockhash());
      await send(conn, legacyTransaction([b], payer, [payer], blockhash), 'extend lookup table');
    }
    launches.recordTx(id, 'alt', table.toBase58(), { addresses: keys.length });
    console.log(`lookup table ${table.toBase58()} with ${keys.length} addresses (usable from the next slot)`);
  },

  async launch(ctx, id) {
    const { launches, conn, opts, pumpSdk } = ctx;
    const plan = requirePlan(launches, id);
    const manifest = launches.manifest(id);
    const creator = loadKeypair(opts.keypair);
    const payer = opts.payer ? loadKeypair(opts.payer) : creator;
    const mint = loadKeypair(mintKeyFile(id));
    if (creator.publicKey.toBase58() !== plan.creator) throw new Error('keypair is not the launch creator');
    if (opts.at) {
      const wait = Date.parse(opts.at) - Date.now();
      if (Number.isNaN(wait)) throw new Error('--at must be a date, e.g. 2026-11-03T01:00:00Z');
      if (wait > 0) { console.log(`waiting until ${new Date(Date.parse(opts.at)).toISOString()}`); await new Promise((r) => setTimeout(r, wait)); }
    }
    if (Date.now() / 1000 < plan.launchAt) throw new Error(`too early: the program accepts the buy from ${new Date(plan.launchAt * 1000).toISOString()}`);
    const l = await fetchLaunch(conn, plan);
    if (!l || l.state !== 'funding') throw new Error(`launch is ${l ? l.state : 'not initialized'}`);
    const escrows = l.commitments.filter((c) => c.funded).map((c) => onchain.escrowAddress(plan.programId, plan.launch, c.investor));
    if (!escrows.length) throw new Error('no investor has deposited');
    const altEntry = [...plan.txs].reverse().find((t) => t.kind === 'alt');
    if (!altEntry) throw new Error(`no lookup table; run "launcher.js alt ${id}" first`);
    const lookupTable = (await conn.getAddressLookupTable(new PublicKey(altEntry.signature))).value;

    const global = await ctx.online().fetchGlobal();
    const pumpKeys = await pumpBuyKeys(pumpSdk, plan, recipients(global));
    const createIx = await pumpSdk.createV2Instruction({
      mint: mint.publicKey, name: manifest.token.name, symbol: manifest.token.symbol, uri: manifest.token.metadataUri,
      creator: creator.publicKey, user: creator.publicKey, mayhemMode: false,
    });
    const useJito = !opts['no-jito'];
    const jitoUrl = opts.jito ?? process.env.JITO_URL ?? DEFAULT_JITO;
    const tip = useJito ? Number(opts.tip ?? DEFAULT_TIP) : 0;
    const tipAccount = useJito && !opts['dry-run'] ? (await jito(jitoUrl, 'getTipAccounts', []))[0] : creator.publicKey.toBase58();
    const { blockhash } = await conn.getLatestBlockhash();
    const createTx = legacyTransaction([ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }), createIx], creator, [creator, mint], blockhash);
    const buyTx = buyTransaction(plan, { payer, pumpKeys, escrows, tip, tipAccount, blockhash, lookupTable });
    console.log(`create tx ${createTx.serialize().length} bytes, buy tx ${buyTx.serialize().length} bytes, ${escrows.length} escrows`);
    if (opts['dry-run']) return console.log('dry run: nothing sent');

    if (useJito) {
      const b64 = [createTx.serialize(), buyTx.serialize()].map((t) => Buffer.from(t).toString('base64'));
      const bundleId = await jito(jitoUrl, 'sendBundle', [b64, { encoding: 'base64' }]);
      console.log(`bundle ${bundleId} sent; waiting for it to land`);
      const buySig = base58.encode(buyTx.signatures[0]);
      const res = await conn.confirmTransaction({ signature: buySig, blockhash, lastValidBlockHeight: (await conn.getLatestBlockhash()).lastValidBlockHeight }, 'confirmed');
      if (res.value.err) throw new Error(`group buy failed: ${JSON.stringify(res.value.err)}`);
      launches.recordTx(id, 'create', base58.encode(createTx.signature), { bundle: bundleId });
      launches.recordTx(id, 'buy', buySig, { bundle: bundleId });
      console.log(`group buy landed: ${buySig}`);
    } else {
      // Without a bundle someone could buy between the two transactions; the
      // program then refuses the buy (curve not fresh) and investors refund.
      launches.recordTx(id, 'create', await send(conn, createTx, 'create_v2'));
      launches.recordTx(id, 'buy', await send(conn, buyTx, 'execute_buy'));
    }
    if (!opts['no-settle']) await commands.settle({ ...ctx, opts: { ...opts, keypair: opts.payer ?? opts.keypair } }, id);
  },

  async settle(ctx, id) {
    const { launches, conn, opts } = ctx;
    const plan = requirePlan(launches, id);
    const payer = loadKeypair(opts.keypair);
    const l = await fetchLaunch(conn, plan);
    if (l?.state !== 'bought') throw new Error('the group buy has not happened');
    const pending = l.commitments.filter((c) => c.funded && !c.settled);
    for (const group of chunk(pending, SETTLES_PER_TX)) {
      const ixs = group.map((c) => toWeb3(onchain.settle(plan.programId, { payer: payer.publicKey.toBase58(), launch: plan.launch, investor: c.investor, mint: plan.mint, tokenProgram: plan.tokenProgram })));
      const { blockhash } = await conn.getLatestBlockhash();
      const sig = await send(conn, legacyTransaction([ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }), ...ixs], payer, [payer], blockhash), `settle ${group.length}`);
      launches.recordTx(id, 'settle', sig, { investors: group.map((c) => c.investor) });
    }
    console.log(pending.length ? `settled ${pending.length} investors` : 'everyone is already settled');
  },

  async refund(ctx, id) {
    const { launches, conn, opts } = ctx;
    const plan = requirePlan(launches, id);
    const payer = loadKeypair(opts.keypair);
    const l = await fetchLaunch(conn, plan);
    const expired = l?.state === 'funding' && Date.now() / 1000 >= l.refundAfter;
    if (!(l?.state === 'cancelled' || expired)) throw new Error('refunds open after a cancel or once the deadline passes');
    const funded = l.commitments.filter((c) => c.funded);
    for (const group of chunk(funded, REFUNDS_PER_TX)) {
      const ixs = group.map((c) => toWeb3(onchain.withdraw(plan.programId, plan.launch, c.investor, false)));
      const { blockhash } = await conn.getLatestBlockhash();
      const sig = await send(conn, legacyTransaction(ixs, payer, [payer], blockhash), `refund ${group.length}`);
      launches.recordTx(id, 'refund', sig, { investors: group.map((c) => c.investor) });
    }
    console.log(`refunded ${funded.length} investors`);
  },

  async cancel(ctx, id) {
    const { launches, conn, opts } = ctx;
    const plan = requirePlan(launches, id);
    const creator = loadKeypair(opts.keypair);
    const { blockhash } = await conn.getLatestBlockhash();
    const sig = await send(conn, legacyTransaction([toWeb3(onchain.cancel(plan.programId, plan.launch, creator.publicKey.toBase58()))], creator, [creator], blockhash), 'cancel');
    launches.recordTx(id, 'cancel', sig);
  },

  async close(ctx, id) {
    const { launches, conn, opts } = ctx;
    const plan = requirePlan(launches, id);
    const payer = loadKeypair(opts.keypair);
    const { blockhash } = await conn.getLatestBlockhash();
    const sig = await send(conn, legacyTransaction([toWeb3(onchain.closeLaunch(plan.programId, plan.launch, plan.creator))], payer, [payer], blockhash), 'close');
    launches.recordTx(id, 'close', sig);
  },
};

// Fee recipients come from pump.fun's Global account (first entry of each list).
function recipients(global) {
  const feeRecipient = global.feeRecipient ?? global.feeRecipients?.[0];
  const buybackFeeRecipient = global.buybackFeeRecipients?.[0];
  if (!feeRecipient || !buybackFeeRecipient) throw new Error('could not read fee recipients from pump.fun Global');
  return { feeRecipient: feeRecipient.toBase58(), buybackFeeRecipient: buybackFeeRecipient.toBase58() };
}

async function main(argv) {
  const { values: opts, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      keypair: { type: 'string' }, payer: { type: 'string' }, rpc: { type: 'string' }, jito: { type: 'string' },
      tip: { type: 'string' }, program: { type: 'string' }, slippage: { type: 'string' }, 'refund-after': { type: 'string' },
      'no-jito': { type: 'boolean' }, 'dry-run': { type: 'boolean' }, 'no-settle': { type: 'boolean' }, at: { type: 'string' },
    },
  });
  const [command, id] = positionals;
  if (!commands[command] || !id) {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(3, 15).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    return 1;
  }
  const launches = openLaunches();
  const rpc = opts.rpc ?? process.env.BUNDLEPAD_RPC ?? launches.config().rpcUrl;
  const needsRpc = command !== 'prepare';
  if (needsRpc && !rpc) throw new Error('set an RPC URL (--rpc, BUNDLEPAD_RPC or launches/config.json rpcUrl)');
  const conn = needsRpc ? new Connection(rpc, 'confirmed') : null;
  const pump = require('@pump-fun/pump-sdk');
  const ctx = { launches, conn, opts, pumpSdk: pump.PUMP_SDK, online: () => new pump.OnlinePumpSdk(conn) };
  await commands[command](ctx, id);
  return 0;
}

if (require.main === module) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (err) => { console.error(`error: ${err.message}`); process.exitCode = 1; });
}

module.exports = { pumpBuyKeys, executeBuyIx, lookupTableKeys, buyTransaction, recipients, toWeb3 };
