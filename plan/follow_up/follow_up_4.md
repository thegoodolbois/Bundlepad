# Follow-up 4 → Plan 5 — Go-live

Status: **WAITING ON THE OWNER** (hosting, keys, audit, legal). No code work is blocked.

Plan 4 (`follow_up_3.md`) is implemented:

| Item | Where | Tested |
|---|---|---|
| Group-buy program (escrow → atomic buy → pro-rata settle, refunds) | `onchain/group-buy` | LiteSVM end-to-end against a mock pump.fun; on a local validator for init, deposit, refund and close |
| Launcher (init, lookup table, Jito bundle, settle, refund, cancel, close) | `onchain/client/launcher.js` | transaction building (32 investors fit in one buy); RPC paths on a local validator |
| Dashboard deposit / withdraw | `index.html` | browser end-to-end on a local validator |
| JS client shared by backend, launcher and tests | `src/launch/onchain.js` | golden vectors from the Rust crate; PDAs match `@solana/web3.js` |
| Buyback & burn records | `chain buyback` | unit tests |

## Steps, in order (`onchain/README.md` has the commands)

1. **Hosting.** Run `chain serve` behind HTTPS on an always-on host. A Codespace
   sleeps when idle, so it can't be trusted to run the launch.
   - Put the URL in `CONFIG.apiUrl` (`index.html`).
   - Set `allowOrigin` in `launches/config.json`.
   - Keep `.secrets/` on that host and back it up. It holds the Google-id salt
     and the mint keys.
2. **Keys and config:**
   - a Google OAuth client ID (`googleClientId` in both config files)
   - the buyback wallet (`buybackWallet`)
   - the $BUNDLEPAD mint
   - a Solana RPC URL (`rpcUrl` in both)
3. **Gate a.** Run the full runbook on a local validator with mainnet pump.fun cloned in.
4. **Deploy** the program and set `groupBuyProgramId`.
5. **Gate b.** A mainnet launch with the owner's own wallets only, at tiny amounts.
6. **Gate c.** An independent audit of `onchain/group-buy`. Then make the program
   immutable (`solana program set-upgrade-authority <id> --final`).
7. **Gate d.** A legal check of pooled launch participation.
8. Only after 6 and 7: launches open to outside investors.
