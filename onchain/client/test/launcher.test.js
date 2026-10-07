'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { AddressLookupTableAccount, Keypair, PublicKey, VersionedTransaction } = require('@solana/web3.js');
const { PUMP_SDK } = require('@pump-fun/pump-sdk');
const onchain = require('../../../src/launch/onchain');
const { pumpBuyKeys, lookupTableKeys, buyTransaction } = require('../launcher');

const PACKET = 1232;
const addr = () => Keypair.generate().publicKey.toBase58();

function plan(n) {
  const programId = addr();
  const creator = addr();
  const launch = onchain.launchAddress(programId, creator, 'bp-001');
  return {
    programId, creator, launch,
    vault: onchain.vaultAddress(programId, launch),
    mint: addr(), tokenProgram: onchain.TOKEN_2022_PROGRAM, buyback: addr(),
    commitments: Array.from({ length: n }, () => { const w = addr(); return { wallet: w, escrow: onchain.escrowAddress(programId, launch, w) }; }),
  };
}

const recipients = { feeRecipient: '62qc2CNXwrYqQScmEdiZFFAnJR262PxWEuNQtxfafNgV', buybackFeeRecipient: '5YxQFdt3Tr9zJLvkFccqXVUwhdTWJQc1fFg2YPbxvxeD' };

test('pump.fun SDK accounts put the vault and its token account where the program checks', async () => {
  const p = plan(1);
  const keys = await pumpBuyKeys(PUMP_SDK, p, recipients);
  assert.strictEqual(keys.length, 27);
  assert.strictEqual(keys[1], p.mint);
  assert.strictEqual(keys[10], onchain.bondingCurveAddress(p.mint));
  assert.strictEqual(keys[13], p.vault);
  assert.strictEqual(keys[14], onchain.associatedTokenAddress(p.vault, p.mint));
  assert.strictEqual(keys[26], onchain.PUMP_PROGRAM);
});

test('the group buy for 32 investors fits in one transaction with the lookup table', async () => {
  const p = plan(32);
  const pumpKeys = await pumpBuyKeys(PUMP_SDK, p, recipients);
  const table = new AddressLookupTableAccount({
    key: Keypair.generate().publicKey,
    state: { deactivationSlot: BigInt('18446744073709551615'), lastExtendedSlot: 0, lastExtendedSlotStartIndex: 0, authority: undefined, addresses: lookupTableKeys(p, pumpKeys).map((k) => new PublicKey(k)) },
  });
  assert.ok(table.state.addresses.length <= 256);
  const payer = Keypair.generate();
  const tx = buyTransaction(p, { payer, pumpKeys, escrows: p.commitments.map((c) => c.escrow), tip: 1_000_000, tipAccount: addr(), blockhash: addr(), lookupTable: table });
  const bytes = tx.serialize();
  assert.ok(bytes.length <= PACKET, `${bytes.length} bytes`);
  assert.strictEqual(VersionedTransaction.deserialize(bytes).signatures.length, 1, 'only the payer signs');
  // Without the table it would not fit.
  assert.throws(() => buyTransaction(p, { payer, pumpKeys, escrows: p.commitments.map((c) => c.escrow), blockhash: addr() }).serialize());
});
