'use strict';

// On-disk layout under <repo>/.chain:
//   config.json          chain settings (remote, difficulty, backup dir)
//   blocks/<height>.json one sealed block per file
//   objects/ab/<sha>.br  brotli-compressed content, keyed by sha256 of raw bytes
//   mempool.json         events waiting to be sealed
//   events.jsonl         every sealed event, one per line (human-readable log)
//   LOCK                 present while a writer holds the chain

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { sha256 } = require('./hash');

class Store {
  constructor(repoRoot) {
    this.repoRoot = repoRoot;
    this.dir = path.join(repoRoot, '.chain');
    this.blocksDir = path.join(this.dir, 'blocks');
    this.objectsDir = path.join(this.dir, 'objects');
  }

  exists() {
    return fs.existsSync(path.join(this.dir, 'config.json'));
  }

  create(config) {
    fs.mkdirSync(this.blocksDir, { recursive: true });
    fs.mkdirSync(this.objectsDir, { recursive: true });
    this.writeJSON('config.json', config);
    this.writeJSON('mempool.json', []);
  }

  readJSON(name) {
    return JSON.parse(fs.readFileSync(path.join(this.dir, name), 'utf8'));
  }

  writeJSON(name, value) {
    const file = path.join(this.dir, name);
    fs.writeFileSync(file + '.tmp', JSON.stringify(value, null, 2) + '\n');
    fs.renameSync(file + '.tmp', file);
  }

  config() { return this.readJSON('config.json'); }
  setConfig(config) { this.writeJSON('config.json', config); }

  objectPath(hash) {
    return path.join(this.objectsDir, hash.slice(0, 2), hash.slice(2) + '.br');
  }

  putObject(buf) {
    const hash = sha256(buf);
    const file = this.objectPath(hash);
    if (!fs.existsSync(file)) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, zlib.brotliCompressSync(buf));
    }
    return hash;
  }

  // Decompresses and rehashes; throws if the stored bytes don't match the key.
  getObject(hash) {
    const buf = zlib.brotliDecompressSync(fs.readFileSync(this.objectPath(hash)));
    if (sha256(buf) !== hash) throw new Error(`object ${hash} is corrupt`);
    return buf;
  }

  blockPath(height) {
    return path.join(this.blocksDir, `${height}.json`);
  }

  height() {
    return fs.readdirSync(this.blocksDir).filter((f) => /^\d+\.json$/.test(f)).length - 1;
  }

  readBlock(height) {
    return JSON.parse(fs.readFileSync(this.blockPath(height), 'utf8'));
  }

  *blocks() {
    const tip = this.height();
    for (let h = 0; h <= tip; h++) yield this.readBlock(h);
  }

  writeBlock(block) {
    fs.writeFileSync(this.blockPath(block.header.height), JSON.stringify(block, null, 2) + '\n');
    const lines = block.events.map((e) => JSON.stringify(e)).join('\n');
    if (lines) fs.appendFileSync(path.join(this.dir, 'events.jsonl'), lines + '\n');
  }

  mempool() { return this.readJSON('mempool.json'); }
  setMempool(events) { this.writeJSON('mempool.json', events); }

  withLock(fn) {
    const lock = path.join(this.dir, 'LOCK');
    let fd;
    try {
      fd = fs.openSync(lock, 'wx');
    } catch {
      throw new Error(`chain is locked (${lock}); remove it if no other process is running`);
    }
    try {
      return fn();
    } finally {
      fs.closeSync(fd);
      fs.unlinkSync(lock);
    }
  }
}

module.exports = { Store };
