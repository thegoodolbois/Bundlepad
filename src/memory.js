'use strict';

// memory.json is the persistent plan/execution state shared across runs.

const fs = require('node:fs');
const path = require('node:path');

const MEMORY_PATH = path.join(__dirname, '..', 'memory.json');

function load() {
  return JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
}

function save(memory) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2) + '\n');
}

function isApproved(memory) {
  return !memory.approval.required || memory.approval.approved;
}

// Applies `patch` to memory, appends a history entry, and records the
// transition on the chain (when one exists) so plan progress is tamper-evident.
function transition(stage, note, patch = {}) {
  const memory = load();
  Object.assign(memory, patch, { stage });
  const entry = { ts: new Date().toISOString(), plan: memory.current_plan, stage, note };
  memory.history.push(entry);
  save(memory);
  logToChain(entry);
  return entry;
}

function logToChain(entry) {
  const { Store } = require('./store');
  const store = new Store(path.dirname(MEMORY_PATH));
  if (!store.exists()) return;
  const chain = require('./chain');
  const { makeEvent } = require('./events');
  store.withLock(() => {
    chain.enqueue(store, makeEvent({ type: 'update', subject: 'memory.transition', source: 'memory', body: entry }));
    chain.seal(store);
  });
}

module.exports = { MEMORY_PATH, load, save, isApproved, transition };
