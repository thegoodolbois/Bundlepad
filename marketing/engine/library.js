'use strict';
// Script library on disk: source fingerprints (no source text) and your own past scripts.
const fs = require('fs');
const crypto = require('crypto');
const core = require('./core');

const DEFAULT_PATH = process.env.SCRIPT_LIBRARY || 'script-library.json';

function load(file = DEFAULT_PATH) {
  if (!fs.existsSync(file)) return { version: 1, entries: [] };
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function save(lib, file = DEFAULT_PATH) {
  fs.writeFileSync(file, JSON.stringify(lib, null, 1) + '\n');
}

const idOf = (text) => crypto.createHash('sha256').update(core.normalize(text)).digest('hex').slice(0, 12);

// kind 'source': someone else's script. Only its structure and fingerprint are kept.
// kind 'history': a script you published. Its text is kept so you can reread it.
function add(lib, text, { kind = 'source', title = '', origin = '', date = new Date().toISOString() } = {}) {
  const id = idOf(text);
  const existing = lib.entries.find((e) => e.id === id);
  if (existing) return { entry: existing, added: false };
  const d = core.digest(text);
  const entry = {
    id, kind, title: title || d.hook.slice(0, 60), origin, date,
    structure: d.structure, hookType: d.hookType, words: d.words, seconds: d.seconds,
    fingerprint: core.fingerprint(text),
  };
  if (kind === 'history') entry.text = text;
  lib.entries.push(entry);
  return { entry, added: true };
}

const find = (lib, id) => lib.entries.find((e) => e.id === id || e.id.startsWith(id));

module.exports = { DEFAULT_PATH, load, save, add, find, idOf };
