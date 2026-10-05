'use strict';

const crypto = require('node:crypto');

const ZERO_HASH = '0'.repeat(64);

// Deterministic JSON: sorted keys, no whitespace, undefined fields dropped.
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  return '{' + Object.keys(value).sort()
    .filter((k) => value[k] !== undefined)
    .map((k) => JSON.stringify(k) + ':' + canonical(value[k]))
    .join(',') + '}';
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Binary Merkle tree over sha256(leaf); the last node is duplicated on odd levels.
function merkleRoot(leaves) {
  if (leaves.length === 0) return ZERO_HASH;
  let level = leaves.map((leaf) => sha256(leaf));
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(sha256(level[i] + (level[i + 1] ?? level[i])));
    }
    level = next;
  }
  return level[0];
}

function leadingZeroBits(hex) {
  let bits = 0;
  for (const ch of hex) {
    const nibble = parseInt(ch, 16);
    if (nibble === 0) { bits += 4; continue; }
    return bits + Math.clz32(nibble) - 28;
  }
  return bits;
}

module.exports = { ZERO_HASH, canonical, sha256, merkleRoot, leadingZeroBits };
