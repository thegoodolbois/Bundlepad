'use strict';

const { execFileSync, spawnSync } = require('node:child_process');

function git(root, args, { buffer = false } = {}) {
  const out = execFileSync('git', ['-C', root, ...args], {
    maxBuffer: 1 << 30,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return buffer ? out : out.toString('utf8');
}

function toplevel(cwd) {
  return git(cwd, ['rev-parse', '--show-toplevel']).trim();
}

function remoteUrl(root, remote) {
  try { return git(root, ['remote', 'get-url', remote]).trim(); } catch { return null; }
}

// Returns [{ref, commit}] for refs under `prefix`, with annotated tags peeled.
// `ref` is the name relative to the prefix (e.g. "heads/main").
function listRefs(root, prefix) {
  const out = git(root, ['for-each-ref', '--format=%(refname)%00%(objectname)%00%(*objectname)%00%(objecttype)%00%(*objecttype)', prefix]);
  return out.split('\n').filter(Boolean).map((line) => {
    const [name, obj, peeled, type, peeledType] = line.split('\0');
    return { ref: name.slice(prefix.length), commit: peeled || obj, type: peeledType || type };
  }).filter((r) => r.type === 'commit');
}

// Fetches every public ref (branches, tags, PR heads) into a private namespace
// so the user's own refs are never modified.
function fetchPublic(root, remote) {
  const ns = `refs/chain-remote/${remote}`;
  git(root, ['fetch', '--prune', '--no-tags', '--force', '--refmap=', remote,
    `+refs/heads/*:${ns}/heads/*`,
    `+refs/tags/*:${ns}/tags/*`,
    `+refs/pull/*/head:${ns}/pull/*`]);
  return ns + '/';
}

function commitInfo(root, sha) {
  const out = git(root, ['show', '-s', '--format=%H%x00%P%x00%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI%x00%B', sha]);
  const [hash, parents, authorName, authorEmail, authorDate, committerName, committerEmail, committerDate, message] = out.split('\0');
  return {
    sha: hash,
    parents: parents ? parents.split(' ') : [],
    author: { name: authorName, email: authorEmail, date: authorDate },
    committer: { name: committerName, email: committerEmail, date: committerDate },
    message: message.replace(/\n+$/, ''),
  };
}

// All commits reachable from `sha`, oldest first.
function revList(root, sha) {
  return git(root, ['rev-list', '--reverse', '--topo-order', sha]).split('\n').filter(Boolean);
}

function isAncestor(root, ancestor, descendant) {
  return spawnSync('git', ['-C', root, 'merge-base', '--is-ancestor', ancestor, descendant]).status === 0;
}

function hasObject(root, sha) {
  return spawnSync('git', ['-C', root, 'cat-file', '-e', sha]).status === 0;
}

function lsTree(root, commit) {
  return git(root, ['ls-tree', '-r', '-z', '--full-tree', commit]).split('\0').filter(Boolean).map((entry) => {
    const tab = entry.indexOf('\t');
    const [mode, type, sha] = entry.slice(0, tab).split(' ');
    return { mode, type, sha, path: entry.slice(tab + 1) };
  });
}

function catBlob(root, sha) {
  return git(root, ['cat-file', 'blob', sha], { buffer: true });
}

function lsFiles(root) {
  return git(root, ['ls-files', '-z']).split('\0').filter(Boolean);
}

function head(root) {
  return git(root, ['rev-parse', 'HEAD']).trim();
}

module.exports = {
  git, toplevel, remoteUrl, listRefs, fetchPublic, commitInfo, revList,
  isAncestor, hasObject, lsTree, catBlob, lsFiles, head,
};
