# Follow-up 1 → Plan 2 — Implementation (Step 4)

Plan 1 approved by the repo owner with these decisions:

| Open question (plan.md §6) | Decision |
|---|---|
| 1. Where the chain lives | Back up to another repo if possible. **Repo creation failed** (Codespace token lacks `createRepository`), so the chain lives in this repo under `.chain/`, with a full event log in `.chain/events.jsonl`. `chain backup <dir>` copies the chain into any directory and commits/pushes it there if it is a git clone, so a backup repo can be added later. |
| 2. Scope of "public" | "Public" = a project **anyone can commit to**. So every branch, every tag, and every PR head (`refs/pull/*/head`) on the remote is tracked, along with all commits from any contributor. |
| 3. Proof-of-work | **On.** Default `difficulty: 16` leading zero bits of the header hash (configurable in `.chain/config.json`). Still no rewards or wallets. |
| 4. Tip anchoring | Not decided, so not in scope. `chain status` prints the tip hash so it can be copied elsewhere by hand. |

## Execution steps

1. `src/hash.js`: canonical JSON, SHA-256, Merkle root, leading-zero-bit check.
2. `src/store.js`: `.chain/` layout, brotli object store (content-addressed by
   sha256 of the raw bytes), block files, mempool, config, lock, `events.jsonl`.
3. `src/events.js`: event envelope `{id, type, subject, source, body, ts, block}`.
   `type` must be one of `update|request|reply|alert|file`.
4. `src/chain.js`: genesis, `seal` (mines PoW), `verifyChain`, and derived
   state (which refs and commits are already recorded).
5. `src/git.js`: wrappers for `for-each-ref`, `rev-list`, `ls-tree`, `cat-file`
   and `fetch`. Remote refs are fetched into a private namespace
   `refs/chain-remote/<remote>/{heads,tags,pull}/*`, so the user's own refs are
   never touched.
6. `src/snapshot.js`: manifest build per commit, verify against the worktree,
   verify against fetched commit objects, and export/restore (directory or `.tar.gz`).
7. `src/track.js`: record new commits and snapshots per ref. A branch that moves
   non-fast-forward, any tag that moves, or any ref that is deleted raises an
   `alert` and seals immediately.
8. `src/server.js`: localhost read/log API (`/api/chain/template`, `events`,
   `stats`, `blocks/:height`).
9. `src/index.js`: CLI with `init`, `track`, `poll`, `verify [--remote]`, `seal`,
   `log`, `export`, `verify-chain`, `backup`, `install-hooks`, `serve`, `status`.
   Every memory transition is also logged to the chain.
10. `test/`: an end-to-end `node:test` suite (snapshot → tamper → detect → restore,
    force-push detection, block tampering).

`stateRoot` is the Merkle root of the manifest hashes snapshotted in that block,
carried forward from the previous block when no snapshot was taken.
