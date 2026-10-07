# Plan 1 — Bundlepad Integrity Chain

Status: **AWAITING HUMAN APPROVAL** (see `memory.json` → `approval`)

A local, lightweight, append-only blockchain that logs every repository event and
stores compressed snapshots of the publicly visible contents of
`github.com/thegoodolbois/Bundlepad`. If the remote is tampered with, the authentic
tree can be verified against, and restored from, the local chain.

Out of scope (explicit): wallets, keys-as-accounts, balances, tokens, faucets,
user signup/login, mining rewards, staking, DEX, P2P gossip. Nothing from the
reference docs that moves value is carried over — only their **structural
patterns** (block template fields, event envelope, message types, post schema).

---

## 0. Technology choices

- **Runtime:** Node.js (≥ 20; workspace has v24). The repo already has `package.json`.
- **Zero runtime dependencies.** Uses only built-ins: `node:crypto` (SHA-256),
  `node:zlib` (brotli/gzip), `node:fs`, `node:child_process` (to call `git`).
- **Storage:** plain files under `.chain/` (git-ignored by default, optionally
  committed or mirrored elsewhere — the chain is only useful if it lives somewhere
  the attacker of the GitHub repo can't also reach).
  *Update (Plan 2):* the backup repo couldn't be created, so `.chain/` is
  committed to this repo (see follow_up_1.md §1) and `chain backup <dir>`
  mirrors it elsewhere.

## 1. Data structures

### 1.1 Block header
Mirrors the reference `GET /api/mining/template` shape
(`{height, difficulty, prevHash, timestamp}`), extended:

```json
{
  "height": 12,
  "prevHash": "<hex sha256 of previous header>",
  "timestamp": 1791331200000,
  "difficulty": 0,
  "nonce": 0,
  "eventsRoot": "<merkle root of event hashes in this block>",
  "stateRoot": "<merkle root of the snapshot manifest, or prev stateRoot>",
  "version": 1
}
```

- `hash = sha256(canonicalJSON(header))`. Canonical JSON = sorted keys, no whitespace.
- `difficulty` defaults to `0` (no proof-of-work; it's a local integrity log, not
  a consensus network). Kept as a field so optional light PoW (leading-zero bits)
  can be turned on to make bulk rewriting of history slower. No reward is attached.
- Genesis block: `height 0`, `prevHash` = 64 zeros, single `chain.genesis` event
  recording repo URL and the initial commit SHA.

### 1.2 Block body
```json
{ "header": { ... }, "hash": "...", "events": [ Event, ... ] }
```
Stored as `.chain/blocks/<height>.json` (one file per block; easy to diff and audit).

### 1.3 Event (log entry)
Envelope follows the reference Agent Bus message
(`{from, to, type, subject, body, timestamp}`) and the Ferno post record
(`{id, content, wallet, type, ts, block}`), with `wallet` replaced by a plain
`source` string (no accounts):

```json
{
  "id": "<sha256 of canonical event without id/block>",
  "type": "update | request | reply | alert | file",
  "subject": "git.commit | git.tag | git.branch | snapshot.created | verify.ok | verify.mismatch | restore.done | chain.genesis",
  "source": "local-cli | git-hook | github-poll",
  "body": { "...event-specific payload..." },
  "ts": 1791331200000,
  "block": 12
}
```
`type` reuses the docs' five message types; `alert` is used for integrity
failures (and, per the docs' semantics, is processed immediately — it forces a
block to be sealed right away instead of waiting for batching).

### 1.4 Snapshot / state objects (content-addressed)
- **Blob:** raw file bytes → brotli-compressed → stored at
  `.chain/objects/<sha256-of-raw-bytes>.br`. Dedup is automatic: an unchanged file
  across 100 snapshots is stored once.
- **Manifest:** the full public tree at one commit:
  ```json
  {
    "commit": "<git sha>",
    "ref": "refs/heads/main",
    "files": [ { "path": "README.md", "mode": "100644", "size": 361, "sha256": "..." } ],
    "createdAt": 1791331200000
  }
  ```
  Files sorted by path; manifest itself is stored as an object, and its Merkle
  root (over `path|mode|sha256` leaves) is the block's `stateRoot`.
- **"Publicly displayed parts"** = files tracked at the ref's tree (`git ls-tree -r`),
  plus commit metadata (author, message, parents, date) and tags/branch heads.
  Not included: issues, PRs, wiki, releases binaries (possible later iteration via
  the GitHub API; noted in §6).

### 1.5 Merkle tree
Binary SHA-256 Merkle tree, odd leaf duplicated, leaves = `sha256(leafString)`.
Used for `eventsRoot` and `stateRoot` so a single file or event can be proven
against a header without the full block.

## 2. Event logging & chain maintenance

- **Mempool:** `.chain/mempool.json` — pending events, like the docs' "pending until
  next block" model.
- **Sealing:** `chain seal` builds a block from the mempool. Sealing happens:
  - on demand (CLI),
  - automatically after each snapshot,
  - immediately on any `alert` event.
- **Append-only rules:** `height = tip.height + 1`, `prevHash = tip.hash`,
  `timestamp ≥ tip.timestamp`, roots recomputed and must match.
- **Validation (`chain verify-chain`):** walk genesis → tip, recompute every
  header hash, event id, Merkle root, and object hash (decompress + rehash). Any
  failure reports the first bad height.
- **Event schema endpoint parity:** a tiny optional local HTTP server
  (`chain serve`, localhost only) exposing read endpoints shaped like the docs:
  - `GET /api/chain/template` → `{height, difficulty, prevHash, timestamp}`
  - `GET /api/chain/events?limit=30&offset=0` → `{events:[...], total, limit, offset}`
  - `POST /api/chain/events` → `{ok:true, event:{id, ..., block:null}}` (queued)
  - `GET /api/chain/stats` → `{total, last_24h, last_event:{id, subject, ts}}`
  - `GET /api/chain/blocks/:height`
  No auth flows, no fees.
- **Locking:** a `.chain/LOCK` file prevents two writers sealing concurrently.

## 3. GitHub tracking, snapshotting, verification, restoration

### 3.1 Tracking
- `chain track` — for each commit on the tracked ref not yet in the chain, log a
  `git.commit` event (`sha, parents, author, date, message`) and create a
  snapshot. Idempotent (skips commits already recorded).
- Optional `post-commit` / `post-merge` git hook that calls `chain track`.
- `chain poll` — `git fetch origin` then compare `origin/<ref>` to the last
  snapshotted commit. Fast-forward → track new commits. Force-push / rewritten
  history (recorded commit no longer an ancestor) → `alert` event
  `verify.mismatch` with details.

### 3.2 Verification
- `chain verify [--remote]` — take the latest chain manifest and compare against
  either the working tree or a fresh shallow clone of the public remote:
  missing files, extra files, and per-file hash mismatches. Result is logged
  (`verify.ok` or `verify.mismatch` alert) and sealed.

### 3.3 Decompression / restoration
- `chain export [--commit <sha>|--height <n>] --out <dir>` — read manifest,
  decompress every blob, verify each `sha256` **before** writing, write files with
  their recorded mode. Refuses to write into a non-empty dir unless `--force`.
- `chain export --tar <file.tar.gz>` — same, packed as a tarball.
- Logged as `restore.done`.

## 4. Memory tracking protocol

- `memory.json` at repo root is the single source of truth for plan/execution
  state across runs and across sessions.
- Fields: `current_plan`, `stage`, `tasks[]` (id, title, status:
  `pending|in_progress|done|blocked`), `approval` (`required`, `approved`,
  `approved_by`, `approved_at`), `follow_ups[]`, `history[]` (append-only log of
  state changes with timestamps).
- The entrypoint (`src/index.js`) loads `memory.json` on every run, prints the
  stage, and **refuses to run implementation commands while
  `approval.required && !approval.approved`** for the current plan.
- Every stage transition appends to `history` and is also logged to the chain
  itself (once the chain exists) as an `update` event with subject
  `memory.transition`, so plan progress is tamper-evident too.
- Follow-up files: `plan/follow_up/follow_up_<n>.md` (the n-th follow-up), created only after the preceding plan
  is approved; `current_plan` increments when a follow-up is approved.

## 5. Proposed layout (implemented after approval)

```
src/
  index.js        entrypoint + memory gate + CLI dispatch
  memory.js       load/save/transition memory.json
  hash.js         canonical JSON, sha256, merkle
  store.js        object store (brotli), block files, mempool, lock
  chain.js        genesis, append, seal, verify-chain
  events.js       event construction/validation (schema from §1.3)
  git.js          ls-tree, cat-file, rev-list, fetch wrappers
  snapshot.js     manifest build, verify vs worktree/remote, export/restore
  server.js       optional localhost read API (§2)
test/             node:test unit + end-to-end (snapshot → tamper → detect → restore)
```

## 6. Risks & open questions for the approver

1. **Where the chain lives.** Local-only `.chain/` protects against a remote
   compromise but not loss of this machine. Recommend periodically copying
   `.chain/` to a second location; should it be committed to a separate repo?
2. **Scope of "public parts".** Plan 1 covers git-tracked files + commit/tag/branch
   metadata. Issues/PRs/releases via GitHub API → candidate for a later plan.
3. **PoW.** Default `difficulty: 0`. Enable light PoW? (Only slows rewrites; a
   local chain's real trust anchor is having copies of the tip hash elsewhere.)
4. **Tip anchoring.** Suggest optionally publishing the tip hash (e.g. in a signed
   tag or external note) so a whole-chain rewrite is detectable.
5. **Reference docs.** Only schema shapes are reused. The docs' wallet, auth,
   coordination (`/call-claude`, `/bus/message`, node-identity) endpoints are
   **not** called or integrated.
