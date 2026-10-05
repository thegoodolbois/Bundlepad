'use strict';

// Records repository activity: new commits (with snapshots) and ref movements.
// Refs are namespaced in the chain as "local/<ref>" or "<remote>/<ref>", where
// <ref> is heads/<branch>, tags/<tag> or pull/<n>.

const git = require('./git');
const { makeEvent } = require('./events');
const { enqueue, state } = require('./chain');
const { buildManifest } = require('./snapshot');

function localRefs(root) {
  return [...git.listRefs(root, 'refs/heads/').map((r) => ({ ...r, ref: 'heads/' + r.ref })),
    ...git.listRefs(root, 'refs/tags/').map((r) => ({ ...r, ref: 'tags/' + r.ref }))];
}

// Compares observed refs with what the chain recorded under `namespace`.
// Returns {moved, rewritten, deleted, created} without changing anything.
function diffRefs(root, recorded, namespace, observed) {
  const result = { created: [], moved: [], rewritten: [], deleted: [] };
  const seen = new Set();
  for (const { ref, commit } of observed) {
    const name = `${namespace}/${ref}`;
    seen.add(name);
    const prev = recorded[name];
    if (!prev) result.created.push({ ref: name, to: commit });
    else if (prev.commit !== commit) {
      const change = { ref: name, from: prev.commit, to: commit };
      const fastForward = !ref.startsWith('tags/') && git.hasObject(root, prev.commit) && git.isAncestor(root, prev.commit, commit);
      (fastForward ? result.moved : result.rewritten).push(change);
    }
  }
  for (const name of Object.keys(recorded)) {
    if (name.startsWith(namespace + '/') && !seen.has(name)) result.deleted.push({ ref: name, from: recorded[name].commit });
  }
  return result;
}

// Queues events for every change; returns {events, alerts}. Caller seals.
function track(store, root, { namespace, refs, source }) {
  const st = state(store);
  const diff = diffRefs(root, st.refs, namespace, refs);
  const queued = [];
  const push = (fields) => { const e = makeEvent({ source, ...fields }); enqueue(store, e); queued.push(e); };

  for (const change of [...diff.created, ...diff.moved, ...diff.rewritten]) {
    for (const sha of git.revList(root, change.to)) {
      if (st.commits.has(sha)) continue;
      push({ type: 'update', subject: 'git.commit', body: git.commitInfo(root, sha) });
      const { hash, manifest } = buildManifest(store, root, sha);
      push({ type: 'file', subject: 'snapshot.created', body: { commit: sha, manifest: hash, files: manifest.files.length } });
      st.commits.add(sha);
    }
  }
  for (const c of diff.rewritten) {
    push({ type: 'alert', subject: 'ref.rewrite', body: { ...c, reason: c.ref.includes('/tags/') ? 'tag moved' : 'non-fast-forward update (history rewritten)' } });
  }
  for (const c of diff.deleted) push({ type: 'alert', subject: 'ref.delete', body: c });
  for (const c of [...diff.created, ...diff.moved, ...diff.rewritten]) {
    push({ type: 'update', subject: 'ref.update', body: { ref: c.ref, from: c.from ?? null, to: c.to, forced: diff.rewritten.includes(c) } });
  }
  return { events: queued, alerts: queued.filter((e) => e.type === 'alert') };
}

function remoteRefs(root, remote) {
  return git.listRefs(root, git.fetchPublic(root, remote));
}

module.exports = { localRefs, remoteRefs, diffRefs, track };
