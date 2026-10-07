//! Writes test/fixtures/onchain-vectors.json from the Rust program crate.
//! test/onchain.test.js checks src/launch/onchain.js against it. The test
//! fails if the committed fixture is out of date (rerun with UPDATE_VECTORS=1).

use bundlepad_group_buy::{
    instruction::{GroupBuyInstruction, InitLaunchArgs},
    processor::{escrow_address, launch_address, vault_address},
    pump,
    state::{Commitment, Launch, STATE_BOUGHT},
};
use solana_program::{hash::hashv, pubkey::Pubkey};

fn hex(b: &[u8]) -> String {
    b.iter().map(|x| format!("{x:02x}")).collect()
}

#[test]
fn vectors_match_fixture() {
    let program = Pubkey::new_from_array([7; 32]);
    let creator = Pubkey::new_from_array([1; 32]);
    let investor = Pubkey::new_from_array([2; 32]);
    let mint = Pubkey::new_from_array([3; 32]);
    let buyback = Pubkey::new_from_array([4; 32]);
    let id_seed = hashv(&[b"bundlepad:bp-001"]).to_bytes();
    let (launch, _) = launch_address(&program, &creator, &id_seed);
    let (vault, _) = vault_address(&program, &launch);
    let args = InitLaunchArgs {
        id_seed,
        manifest_hash: [0xab; 32],
        mint,
        token_program: pump::TOKEN_2022_PROGRAM_ID,
        buyback,
        fee_bps: 1000,
        max_slippage_bps: 500,
        launch_at: 1_800_000_000,
        refund_after: 1_800_003_600,
        commitments: vec![(investor, 1_500_000_000), (creator, 100_000_000)],
    };
    let account = Launch {
        bump: 254, vault_bump: 253, state: STATE_BOUGHT, creator, mint, token_program: pump::TOKEN_2022_PROGRAM_ID, buyback,
        id_seed, manifest_hash: [0xab; 32], fee_bps: 1000, max_slippage_bps: 500, launch_at: 1_800_000_000, refund_after: 1_800_003_600,
        funded_count: 1, settled_count: 0, total_funded: 1_500_000_000, tokens_bought: 42, sol_left: 7, fee_paid: 150_000_000,
        commitments: vec![Commitment { investor, lamports: 1_500_000_000, flags: 1 }, Commitment { investor: creator, lamports: 100_000_000, flags: 0 }],
    };
    let mut account_data = vec![0u8; Launch::space(2)];
    account.pack(&mut account_data).unwrap();

    let json = format!(
        concat!(
            "{{\n  \"program\": \"{}\",\n  \"creator\": \"{}\",\n  \"investor\": \"{}\",\n  \"mint\": \"{}\",\n  \"buyback\": \"{}\",\n",
            "  \"idSeed\": \"{}\",\n  \"launch\": \"{}\",\n  \"vault\": \"{}\",\n  \"escrow\": \"{}\",\n",
            "  \"vaultAta\": \"{}\",\n  \"bondingCurve\": \"{}\",\n  \"initData\": \"{}\",\n  \"launchAccount\": \"{}\"\n}}\n"
        ),
        program, creator, investor, mint, buyback, hex(&id_seed), launch, vault,
        escrow_address(&program, &launch, &investor).0,
        pump::associated_token_address(&vault, &mint, &pump::TOKEN_2022_PROGRAM_ID),
        pump::bonding_curve_address(&mint),
        hex(&GroupBuyInstruction::InitLaunch(args).pack()),
        hex(&account_data),
    );
    let path = format!("{}/../../test/fixtures/onchain-vectors.json", env!("CARGO_MANIFEST_DIR"));
    if std::env::var("UPDATE_VECTORS").is_ok() {
        std::fs::write(&path, &json).unwrap();
    }
    assert_eq!(std::fs::read_to_string(&path).unwrap_or_default(), json, "fixture out of date; rerun with UPDATE_VECTORS=1");
}
