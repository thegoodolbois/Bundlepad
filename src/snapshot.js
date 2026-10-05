'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { canonical, sha256 } = require('./hash');
const git = require('./git');

// The chain's own directory is never part of a snapshot.
const EXCLUDED = (p) => p === '.chain' || p.startsWith('.chain/');

// Stores every file at `commit` as a compressed object and returns the
// manifest's object hash. Unchanged files are deduplicated by content hash.
function buildManifest(store, root, commit) {
  const files = [];
  const gitlinks = [];
  for (const entry of git.lsTree(root, commit)) {
    if (EXCLUDED(entry.path)) continue;
    if (entry.type === 'commit') { gitlinks.push({ path: entry.path, commit: entry.sha }); continue; }
    const content = git.catBlob(root, entry.sha);
    files.push({ path: entry.path, mode: entry.mode, size: content.length, sha256: store.putObject(content) });
  }
  files.sort((a, b) => (a.path < b.path ? -1 : 1));
  const manifest = { commit, files, gitlinks };
  return { hash: store.putObject(Buffer.from(canonical(manifest))), manifest };
}

function loadManifest(store, hash) {
  return JSON.parse(store.getObject(hash));
}

function compare(manifest, actual) {
  const expected = new Map(manifest.files.map((f) => [f.path, f.sha256]));
  const missing = [];
  const changed = [];
  for (const [p, hash] of expected) {
    if (!actual.has(p)) missing.push(p);
    else if (actual.get(p) !== hash) changed.push(p);
  }
  const extra = [...actual.keys()].filter((p) => !expected.has(p));
  return { ok: !missing.length && !changed.length && !extra.length, missing, changed, extra };
}

// Compares the files on disk (tracked paths plus everything in the manifest)
// against a manifest.
function verifyWorktree(root, manifest) {
  const actual = new Map();
  const paths = new Set([...git.lsFiles(root), ...manifest.files.map((f) => f.path)]);
  for (const p of paths) {
    if (EXCLUDED(p)) continue;
    const full = path.join(root, p);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (stat.isSymbolicLink()) actual.set(p, sha256(fs.readlinkSync(full)));
    else if (stat.isFile()) actual.set(p, sha256(fs.readFileSync(full)));
  }
  return compare(manifest, actual);
}

// Compares the content of a commit as git currently has it against a manifest.
function verifyCommit(root, commit, manifest) {
  const actual = new Map();
  for (const entry of git.lsTree(root, commit)) {
    if (EXCLUDED(entry.path) || entry.type !== 'blob') continue;
    actual.set(entry.path, sha256(git.catBlob(root, entry.sha)));
  }
  return compare(manifest, actual);
}

// Writes a manifest's files to `outDir`, verifying each object before writing.
function exportManifest(store, manifest, outDir, { force = false } = {}) {
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length && !force) {
    throw new Error(`${outDir} is not empty (use --force)`);
  }
  for (const file of manifest.files) {
    const target = path.resolve(outDir, file.path);
    if (!target.startsWith(path.resolve(outDir) + path.sep)) throw new Error(`unsafe path in manifest: ${file.path}`);
    const content = store.getObject(file.sha256);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.rmSync(target, { force: true });
    if (file.mode === '120000') fs.symlinkSync(content.toString(), target);
    else fs.writeFileSync(target, content, { mode: file.mode === '100755' ? 0o755 : 0o644 });
  }
  return manifest.files.length;
}

function exportTar(store, manifest, tarFile, tmpDir) {
  exportManifest(store, manifest, tmpDir);
  execFileSync('tar', ['-czf', path.resolve(tarFile), '-C', tmpDir, '.']);
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

module.exports = { buildManifest, loadManifest, verifyWorktree, verifyCommit, exportManifest, exportTar };
