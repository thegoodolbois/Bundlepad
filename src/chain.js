'use strict';

const { ZERO_HASH, canonical, sha256, merkleRoot, leadingZeroBits } = require('./hash');
const { makeEvent, validateEvent } = require('./events');

const VERSION = 1;

function headerHash(header) {
  return sha256(canonical(header));
}

// Proof-of-work: increment nonce until the header hash has `difficulty`
// leading zero bits. Makes rewriting history costly; there is no reward.
function mine(header) {
  for (let nonce = 0; ; nonce++) {
    const candidate = { ...header, nonce };
    const hash = headerHash(candidate);
    if (leadingZeroBits(hash) >= header.difficulty) return { header: candidate, hash };
  }
}

function snapshotRoot(events) {
  const manifests = events.filter((e) => e.subject === 'snapshot.created').map((e) => e.body.manifest);
  return manifests.length ? merkleRoot(manifests) : null;
}

function buildBlock(prev, events, difficulty, timestamp = Date.now()) {
  const height = prev ? prev.header.height + 1 : 0;
  const sealed = events.map((e) => ({ ...e, block: height }));
  const { header, hash } = mine({
    version: VERSION,
    height,
    prevHash: prev ? prev.hash : ZERO_HASH,
    timestamp: prev ? Math.max(timestamp, prev.header.timestamp) : timestamp,
    difficulty,
    nonce: 0,
    eventsRoot: merkleRoot(sealed.map((e) => e.id)),
    stateRoot: snapshotRoot(sealed) ?? (prev ? prev.header.stateRoot : ZERO_HASH),
  });
  return { header, hash, events: sealed };
}

function tip(store) {
  return store.readBlock(store.height());
}

function genesis(store, body) {
  const event = makeEvent({ type: 'update', subject: 'chain.genesis', body });
  const block = buildBlock(null, [event], store.config().difficulty);
  store.writeBlock(block);
  return block;
}

function enqueue(store, event) {
  store.setMempool([...store.mempool(), event]);
}

// Seals every pending event into one new block. Returns null when idle.
function seal(store) {
  const pending = store.mempool();
  if (pending.length === 0) return null;
  const block = buildBlock(tip(store), pending, store.config().difficulty);
  store.writeBlock(block);
  store.setMempool([]);
  return block;
}

// Walks genesis → tip and recomputes every hash, root, link and PoW.
// Returns the list of problems; empty means the chain is intact.
function verifyChain(store, { checkObjects = true } = {}) {
  const errors = [];
  let prev = null;
  for (const block of store.blocks()) {
    const { header } = block;
    const at = `block ${header.height}`;
    if (header.height !== (prev ? prev.header.height + 1 : 0)) errors.push(`${at}: bad height`);
    if (header.prevHash !== (prev ? prev.hash : ZERO_HASH)) errors.push(`${at}: prevHash does not link to previous block`);
    if (prev && header.timestamp < prev.header.timestamp) errors.push(`${at}: timestamp goes backwards`);
    if (headerHash(header) !== block.hash) errors.push(`${at}: header hash mismatch`);
    if (leadingZeroBits(block.hash) < header.difficulty) errors.push(`${at}: insufficient proof-of-work`);
    for (const event of block.events) {
      try { validateEvent(event); } catch (err) { errors.push(`${at}: ${err.message}`); }
      if (event.block !== header.height) errors.push(`${at}: event ${event.id} claims block ${event.block}`);
    }
    if (merkleRoot(block.events.map((e) => e.id)) !== header.eventsRoot) errors.push(`${at}: eventsRoot mismatch`);
    const expectedState = snapshotRoot(block.events) ?? (prev ? prev.header.stateRoot : ZERO_HASH);
    if (expectedState !== header.stateRoot) errors.push(`${at}: stateRoot mismatch`);
    if (checkObjects) {
      for (const event of block.events.filter((e) => e.subject === 'snapshot.created')) {
        try {
          const manifest = JSON.parse(store.getObject(event.body.manifest));
          for (const file of manifest.files) store.getObject(file.sha256);
        } catch (err) {
          errors.push(`${at}: snapshot ${event.body.commit}: ${err.message}`);
        }
      }
    }
    prev = block;
  }
  return errors;
}

// Derived view of what the chain has recorded so far.
function state(store) {
  const refs = {};
  const commits = new Set();
  const snapshots = {};
  for (const block of store.blocks()) {
    for (const e of block.events) {
      if (e.subject === 'git.commit') commits.add(e.body.sha);
      else if (e.subject === 'snapshot.created') snapshots[e.body.commit] = { manifest: e.body.manifest, height: e.block };
      else if (e.subject === 'ref.update') refs[e.body.ref] = { commit: e.body.to, height: e.block };
      else if (e.subject === 'ref.delete') delete refs[e.body.ref];
    }
  }
  return { refs, commits, snapshots };
}

module.exports = { headerHash, buildBlock, tip, genesis, enqueue, seal, verifyChain, state };
