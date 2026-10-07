'use strict';

// Bitcoin-alphabet base58, as used for Solana addresses and signatures.

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const INDEX = Object.fromEntries([...ALPHABET].map((c, i) => [c, BigInt(i)]));

function encode(bytes) {
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  let out = '';
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of bytes) { if (b !== 0) break; out = '1' + out; }
  return out;
}

function decode(text) {
  if (typeof text !== 'string' || !text) throw new Error('base58: empty input');
  let n = 0n;
  for (const c of text) {
    if (!(c in INDEX)) throw new Error(`base58: invalid character "${c}"`);
    n = n * 58n + INDEX[c];
  }
  const bytes = [];
  while (n > 0n) { bytes.unshift(Number(n & 0xffn)); n >>= 8n; }
  for (const c of text) { if (c !== '1') break; bytes.unshift(0); }
  return Buffer.from(bytes);
}

module.exports = { encode, decode };
