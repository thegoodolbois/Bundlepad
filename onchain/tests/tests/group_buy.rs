//! End-to-end tests of the group-buy program against the mock pump.fun
//! program (deployed at pump.fun's real program id). Build both first:
//!   (cd ../group-buy && cargo build-sbf) && (cd ../mock-pump && cargo build-sbf)

#![allow(deprecated)]

use bundlepad_group_buy::{
    error::GroupBuyError,
    instruction::{GroupBuyInstruction, InitLaunchArgs},
    processor::{escrow_address, launch_address, vault_address, BUY_RESERVE_LAMPORTS},
    pump,
    state::{Launch, STATE_BOUGHT, STATE_CANCELLED},
};
use litesvm::LiteSVM;
use solana_account::Account;
use solana_keypair::Keypair;
use solana_program::{
    clock::Clock,
    instruction::{AccountMeta, Instruction, InstructionError},
    pubkey::Pubkey,
    system_instruction, system_program,
};
use solana_signer::Signer;
use solana_transaction::Transaction;

const SOL: u64 = 1_000_000_000;
const LAUNCH_AT: i64 = 1_800_000_000;
const REFUND_AFTER: i64 = LAUNCH_AT + 3600;
const VT: u64 = 1_073_000_000_000_000;
const VQ: u64 = 30_000_000_000;
const RT: u64 = 793_100_000_000_000;

fn program_id() -> Pubkey {
    Pubkey::new_from_array([7; 32])
}

struct Env {
    svm: LiteSVM,
    creator: Keypair,
    investors: Vec<Keypair>,
    outsider: Keypair,
    mint: Pubkey,
    buyback: Pubkey,
    launch: Pubkey,
    pump_extra: Vec<Pubkey>,
}

fn so(path: &str) -> Vec<u8> {
    let p = format!("{}/../{}", env!("CARGO_MANIFEST_DIR"), path);
    std::fs::read(&p).unwrap_or_else(|_| panic!("missing {p}; run cargo build-sbf in onchain/group-buy and onchain/mock-pump"))
}

fn set_clock(svm: &mut LiteSVM, t: i64) {
    let mut c: Clock = svm.get_sysvar();
    c.unix_timestamp = t;
    c.slot += 1;
    svm.set_sysvar(&c);
    svm.expire_blockhash();
}

fn mint_data(supply: u64) -> Vec<u8> {
    let mut d = vec![0u8; 82];
    d[36..44].copy_from_slice(&supply.to_le_bytes());
    d[44] = 6;
    d[45] = 1;
    d
}

fn token_account_data(mint: &Pubkey, owner: &Pubkey, amount: u64) -> Vec<u8> {
    let mut d = vec![0u8; 165];
    d[..32].copy_from_slice(mint.as_ref());
    d[32..64].copy_from_slice(owner.as_ref());
    d[64..72].copy_from_slice(&amount.to_le_bytes());
    d[108] = 1;
    d
}

fn curve_data(real_quote: u64) -> Vec<u8> {
    let mut d = vec![0u8; 151];
    d[..8].copy_from_slice(&pump::BONDING_CURVE_DISC);
    for (at, v) in [(8, VT), (16, VQ), (24, RT), (32, real_quote), (40, 1_000_000_000_000_000)] {
        d[at..at + 8].copy_from_slice(&v.to_le_bytes());
    }
    d
}

fn account(owner: Pubkey, data: Vec<u8>) -> Account {
    Account { lamports: 10 * SOL, data, owner, executable: false, rent_epoch: 0 }
}

/// A fresh pump.fun coin (Token-2022 mint, curve with its token reserves).
fn create_coin(svm: &mut LiteSVM, mint: &Pubkey, real_quote: u64) {
    let curve = pump::bonding_curve_address(mint);
    svm.set_account(*mint, account(pump::TOKEN_2022_PROGRAM_ID, mint_data(1_000_000_000_000_000))).unwrap();
    svm.set_account(curve, account(pump::PROGRAM_ID, curve_data(real_quote))).unwrap();
    let curve_ata = pump::associated_token_address(&curve, mint, &pump::TOKEN_2022_PROGRAM_ID);
    svm.set_account(curve_ata, account(pump::TOKEN_2022_PROGRAM_ID, token_account_data(mint, &curve, RT))).unwrap();
}

fn setup(commit_sol: &[u64], fee_bps: u16, max_slippage_bps: u16) -> Env {
    let mut svm = LiteSVM::new();
    svm.add_program(program_id(), &so("group-buy/target/deploy/bundlepad_group_buy.so")).unwrap();
    svm.add_program(pump::PROGRAM_ID, &so("mock-pump/target/deploy/mock_pump.so")).unwrap();
    set_clock(&mut svm, LAUNCH_AT - 600);
    let creator = Keypair::new();
    let outsider = Keypair::new();
    let investors: Vec<Keypair> = commit_sol.iter().map(|_| Keypair::new()).collect();
    for k in investors.iter().chain([&creator, &outsider]) {
        svm.airdrop(&k.pubkey(), 100 * SOL).unwrap();
    }
    let buyback = Pubkey::new_unique();
    svm.airdrop(&buyback, SOL).unwrap();
    let mint = Pubkey::new_unique();
    let id_seed = [9u8; 32];
    let (launch, _) = launch_address(&program_id(), &creator.pubkey(), &id_seed);
    let mut env = Env { svm, creator, investors, outsider, mint, buyback, launch, pump_extra: (0..27).map(|_| Pubkey::new_unique()).collect() };
    let args = InitLaunchArgs {
        id_seed,
        manifest_hash: [1; 32],
        mint,
        token_program: pump::TOKEN_2022_PROGRAM_ID,
        buyback,
        fee_bps,
        max_slippage_bps,
        launch_at: LAUNCH_AT,
        refund_after: REFUND_AFTER,
        commitments: env.investors.iter().zip(commit_sol).map(|(k, s)| (k.pubkey(), *s)).collect(),
    };
    let ix = init_ix(&env.creator.pubkey(), &env.launch, args);
    let creator = env.creator.insecure_clone();
    send(&mut env, &[ix], &[&creator]).unwrap();
    env
}

fn init_ix(creator: &Pubkey, launch: &Pubkey, args: InitLaunchArgs) -> Instruction {
    Instruction {
        program_id: program_id(),
        accounts: vec![AccountMeta::new(*creator, true), AccountMeta::new(*launch, false), AccountMeta::new_readonly(system_program::ID, false)],
        data: GroupBuyInstruction::InitLaunch(args).pack(),
    }
}

fn send(env: &mut Env, ixs: &[Instruction], signers: &[&Keypair]) -> Result<(), InstructionError> {
    let tx = Transaction::new_signed_with_payer(ixs, Some(&signers[0].pubkey()), signers, env.svm.latest_blockhash());
    let res = env.svm.send_transaction(tx).map(|_| ()).map_err(|e| match e.err {
        solana_transaction_error::TransactionError::InstructionError(_, ie) => ie,
        other => panic!("{other:?}\n{}", e.meta.logs.join("\n")),
    });
    env.svm.expire_blockhash();
    res
}

fn custom(e: GroupBuyError) -> InstructionError {
    InstructionError::Custom(e as u32)
}

fn launch_state(env: &Env) -> Launch {
    Launch::unpack(&env.svm.get_account(&env.launch).unwrap().data).unwrap()
}

fn escrow(env: &Env, investor: &Pubkey) -> Pubkey {
    escrow_address(&program_id(), &env.launch, investor).0
}

fn deposit(env: &mut Env, i: usize) -> Result<(), InstructionError> {
    let investor = env.investors[i].insecure_clone();
    let ix = Instruction {
        program_id: program_id(),
        accounts: vec![
            AccountMeta::new(investor.pubkey(), true),
            AccountMeta::new(env.launch, false),
            AccountMeta::new(escrow(env, &investor.pubkey()), false),
            AccountMeta::new_readonly(system_program::ID, false),
        ],
        data: GroupBuyInstruction::Deposit.pack(),
    };
    send(env, &[ix], &[&investor])
}

fn withdraw(env: &mut Env, investor: &Pubkey, signer: &Keypair) -> Result<(), InstructionError> {
    let is_investor = &signer.pubkey() == investor;
    let mut accounts = vec![
        AccountMeta { pubkey: *investor, is_signer: is_investor, is_writable: true },
        AccountMeta::new(env.launch, false),
        AccountMeta::new(escrow(env, investor), false),
    ];
    if !is_investor {
        accounts.push(AccountMeta::new_readonly(signer.pubkey(), true));
    }
    let ix = Instruction { program_id: program_id(), accounts, data: GroupBuyInstruction::Withdraw.pack() };
    send(env, &[ix], &[signer])
}

fn vault(env: &Env) -> Pubkey {
    vault_address(&program_id(), &env.launch).0
}

fn vault_ata(env: &Env) -> Pubkey {
    pump::associated_token_address(&vault(env), &env.mint, &pump::TOKEN_2022_PROGRAM_ID)
}

/// The 27 buy_exact_quote_in_v2 accounts; `tweak` can swap one out.
fn pump_accounts(env: &Env, tweak: Option<(usize, Pubkey)>) -> Vec<AccountMeta> {
    let curve = pump::bonding_curve_address(&env.mint);
    let mut keys = env.pump_extra.clone();
    keys[pump::IX_BASE_MINT] = env.mint;
    keys[pump::IX_BASE_TOKEN_PROGRAM] = pump::TOKEN_2022_PROGRAM_ID;
    keys[pump::IX_BONDING_CURVE] = curve;
    keys[11] = pump::associated_token_address(&curve, &env.mint, &pump::TOKEN_2022_PROGRAM_ID);
    keys[pump::IX_USER] = vault(env);
    keys[pump::IX_ASSOCIATED_BASE_USER] = vault_ata(env);
    keys[24] = system_program::ID;
    keys[pump::IX_PROGRAM] = pump::PROGRAM_ID;
    if let Some((i, k)) = tweak {
        keys[i] = k;
    }
    keys.iter().enumerate().map(|(i, k)| AccountMeta { pubkey: *k, is_signer: false, is_writable: pump::BUY_WRITABLE[i] }).collect()
}

fn execute_buy(env: &mut Env, escrows: &[Pubkey], tweak: Option<(usize, Pubkey)>) -> Result<(), InstructionError> {
    let payer = env.outsider.insecure_clone();
    let mut accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new(env.launch, false),
        AccountMeta::new(vault(env), false),
        AccountMeta::new(vault_ata(env), false),
        AccountMeta::new(env.buyback, false),
        AccountMeta::new_readonly(env.mint, false),
        AccountMeta::new_readonly(pump::TOKEN_2022_PROGRAM_ID, false),
        AccountMeta::new_readonly(pump::ATA_PROGRAM_ID, false),
        AccountMeta::new_readonly(system_program::ID, false),
    ];
    accounts.extend(pump_accounts(env, tweak));
    accounts.extend(escrows.iter().map(|e| AccountMeta::new(*e, false)));
    let ix = Instruction { program_id: program_id(), accounts, data: GroupBuyInstruction::ExecuteBuy.pack() };
    let cu = solana_program::instruction::Instruction::new_with_bytes(
        Pubkey::from_str_const("ComputeBudget111111111111111111111111111111"),
        &[[2u8].as_slice(), &1_000_000u32.to_le_bytes()].concat(),
        vec![],
    );
    send(env, &[cu, ix], &[&payer])
}

fn settle(env: &mut Env, investor: &Pubkey) -> Result<(), InstructionError> {
    let payer = env.outsider.insecure_clone();
    let ix = Instruction {
        program_id: program_id(),
        accounts: vec![
            AccountMeta::new(payer.pubkey(), true),
            AccountMeta::new(env.launch, false),
            AccountMeta::new(escrow(env, investor), false),
            AccountMeta::new(*investor, false),
            AccountMeta::new(pump::associated_token_address(investor, &env.mint, &pump::TOKEN_2022_PROGRAM_ID), false),
            AccountMeta::new_readonly(vault(env), false),
            AccountMeta::new(vault_ata(env), false),
            AccountMeta::new_readonly(env.mint, false),
            AccountMeta::new_readonly(pump::TOKEN_2022_PROGRAM_ID, false),
            AccountMeta::new_readonly(pump::ATA_PROGRAM_ID, false),
            AccountMeta::new_readonly(system_program::ID, false),
        ],
        data: GroupBuyInstruction::Settle.pack(),
    };
    send(env, &[ix], &[&payer])
}

fn token_balance(env: &Env, owner: &Pubkey) -> u64 {
    let ata = pump::associated_token_address(owner, &env.mint, &pump::TOKEN_2022_PROGRAM_ID);
    env.svm.get_account(&ata).map(|a| u64::from_le_bytes(a.data[64..72].try_into().unwrap())).unwrap_or(0)
}

fn lamports(env: &Env, k: &Pubkey) -> u64 {
    env.svm.get_account(k).map(|a| a.lamports).unwrap_or(0)
}

#[test]
fn group_buy_splits_tokens_and_refunds_one_to_one() {
    let mut env = setup(&[SOL, 2 * SOL, SOL / 2], 1000, 500);
    let [a, b, c] = [0, 1, 2].map(|i| env.investors[i].pubkey());

    // Deposits sit in each investor's own escrow and can be taken back.
    deposit(&mut env, 0).unwrap();
    assert_eq!(deposit(&mut env, 0), Err(custom(GroupBuyError::AlreadyFunded)));
    let before = lamports(&env, &a);
    let alice = env.investors[0].insecure_clone();
    withdraw(&mut env, &a, &alice).unwrap();
    assert!(lamports(&env, &a) > before + SOL - 10_000);
    assert_eq!(lamports(&env, &escrow(&env, &a)), 0);
    deposit(&mut env, 0).unwrap();
    deposit(&mut env, 1).unwrap();
    // c never deposits, so c is left out of the buy.
    assert_eq!(launch_state(&env).funded_count, 2);

    create_coin(&mut env.svm, &env.mint.clone(), 0);
    let escrows = [escrow(&env, &a), escrow(&env, &b)];
    assert_eq!(execute_buy(&mut env, &escrows, None), Err(custom(GroupBuyError::TooEarly)));
    set_clock(&mut env.svm, LAUNCH_AT);

    // Every funded escrow must be swept, exactly once.
    assert_eq!(execute_buy(&mut env, &escrows[..1], None), Err(custom(GroupBuyError::WrongEscrowSet)));
    assert_eq!(execute_buy(&mut env, &[escrows[0], escrows[0]], None), Err(custom(GroupBuyError::WrongEscrowSet)));
    // The pinned pump accounts can't be swapped.
    let wrong = Pubkey::new_unique();
    assert_eq!(execute_buy(&mut env, &escrows, Some((pump::IX_USER, wrong))), Err(custom(GroupBuyError::WrongPumpAccount)));
    assert_eq!(execute_buy(&mut env, &escrows, Some((pump::IX_ASSOCIATED_BASE_USER, wrong))), Err(custom(GroupBuyError::WrongPumpAccount)));
    assert_eq!(execute_buy(&mut env, &escrows, Some((pump::IX_BASE_MINT, wrong))), Err(custom(GroupBuyError::WrongPumpAccount)));
    assert_eq!(execute_buy(&mut env, &escrows, Some((pump::IX_PROGRAM, wrong))), Err(InstructionError::IncorrectProgramId));

    let buyback_before = lamports(&env, &env.buyback);
    execute_buy(&mut env, &escrows, None).unwrap();
    let st = launch_state(&env);
    assert_eq!(st.state, STATE_BOUGHT);
    assert_eq!(st.total_funded, 3 * SOL);
    assert_eq!(st.fee_paid, 3 * SOL / 10);
    assert_eq!(lamports(&env, &env.buyback) - buyback_before, 3 * SOL / 10);
    assert_eq!(lamports(&env, &vault(&env)), 0, "vault never keeps SOL");

    // Mock pump: 1.25% fee, then constant product.
    let spend = 3 * SOL - 3 * SOL / 10 - BUY_RESERVE_LAMPORTS;
    let net = spend - spend * 125 / 10_000;
    let expected = VT - ((VT as u128 * VQ as u128).div_ceil(VQ as u128 + net as u128)) as u64;
    assert_eq!(st.tokens_bought, expected);
    assert_eq!(st.sol_left, BUY_RESERVE_LAMPORTS - 1_844_400, "reserve minus the accumulator rent pump charged");

    // No deposits or withdrawals after the buy.
    assert_eq!(deposit(&mut env, 2), Err(custom(GroupBuyError::WrongState)));
    assert_eq!(withdraw(&mut env, &a, &alice), Err(custom(GroupBuyError::WrongState)));

    let (sol_a, sol_b) = (lamports(&env, &a), lamports(&env, &b));
    settle(&mut env, &a).unwrap();
    assert_eq!(settle(&mut env, &a), Err(custom(GroupBuyError::NotAnEscrow)), "escrow is closed after settling");
    settle(&mut env, &b).unwrap();
    assert!(settle(&mut env, &c).is_err());
    let (ta, tb) = (token_balance(&env, &a), token_balance(&env, &b));
    assert_eq!(ta + tb, st.tokens_bought, "every token is handed out");
    assert_eq!(ta, st.tokens_bought / 3);
    assert_eq!(token_balance(&env, &vault(&env)), 0);
    // Each also gets their share of the unspent SOL plus their escrow's rent.
    let refunded = (lamports(&env, &a) - sol_a) + (lamports(&env, &b) - sol_b);
    let escrow_rent = 2 * env.svm.minimum_balance_for_rent_exemption(bundlepad_group_buy::state::Escrow::LEN);
    assert_eq!(refunded, st.sol_left + escrow_rent);

    // The creator can reclaim the launch account only now.
    let creator = env.creator.pubkey();
    let close = Instruction {
        program_id: program_id(),
        accounts: vec![AccountMeta::new(creator, false), AccountMeta::new(env.launch, false)],
        data: GroupBuyInstruction::CloseLaunch.pack(),
    };
    let payer = env.outsider.insecure_clone();
    send(&mut env, &[close], &[&payer]).unwrap();
    assert_eq!(lamports(&env, &env.launch), 0);
}

#[test]
fn buy_requires_a_fresh_curve() {
    let mut env = setup(&[SOL], 1000, 500);
    deposit(&mut env, 0).unwrap();
    create_coin(&mut env.svm, &env.mint.clone(), 5 * SOL);
    set_clock(&mut env.svm, LAUNCH_AT);
    let e = escrow(&env, &env.investors[0].pubkey());
    assert_eq!(execute_buy(&mut env, &[e], None), Err(custom(GroupBuyError::CurveNotFresh)));
}

#[test]
fn slippage_floor_is_enforced() {
    // 0 bps tolerance can't absorb pump's 1.25% fee, so the buy must fail.
    let mut env = setup(&[SOL], 1000, 0);
    deposit(&mut env, 0).unwrap();
    create_coin(&mut env.svm, &env.mint.clone(), 0);
    set_clock(&mut env.svm, LAUNCH_AT);
    let e = escrow(&env, &env.investors[0].pubkey());
    assert_eq!(execute_buy(&mut env, &[e], None), Err(InstructionError::Custom(6042)));
}

#[test]
fn refunds_after_deadline_or_cancel_need_no_investor_signature() {
    let mut env = setup(&[SOL, SOL], 1000, 500);
    let [a, b] = [0, 1].map(|i| env.investors[i].pubkey());
    deposit(&mut env, 0).unwrap();
    deposit(&mut env, 1).unwrap();
    let outsider = env.outsider.insecure_clone();
    assert_eq!(withdraw(&mut env, &a, &outsider), Err(custom(GroupBuyError::MissingSignature)));

    set_clock(&mut env.svm, REFUND_AFTER);
    create_coin(&mut env.svm, &env.mint.clone(), 0);
    let escrows = [escrow(&env, &a), escrow(&env, &b)];
    assert_eq!(execute_buy(&mut env, &escrows, None), Err(custom(GroupBuyError::FundingExpired)));
    let before = lamports(&env, &a);
    withdraw(&mut env, &a, &outsider).unwrap();
    assert!(lamports(&env, &a) >= before + SOL);

    // Only the creator can cancel; after a cancel anyone can refund.
    let launch = env.launch;
    let cancel = |signer: &Pubkey| Instruction {
        program_id: program_id(),
        accounts: vec![AccountMeta::new_readonly(*signer, true), AccountMeta::new(launch, false)],
        data: GroupBuyInstruction::Cancel.pack(),
    };
    let ix = cancel(&outsider.pubkey());
    assert_eq!(send(&mut env, &[ix], &[&outsider]), Err(custom(GroupBuyError::MissingSignature)));
    let creator = env.creator.insecure_clone();
    let ix = cancel(&creator.pubkey());
    send(&mut env, &[ix], &[&creator]).unwrap();
    assert_eq!(launch_state(&env).state, STATE_CANCELLED);
    withdraw(&mut env, &b, &outsider).unwrap();
    assert_eq!(launch_state(&env).funded_count, 0);
}

#[test]
fn only_listed_investors_deposit_and_prefunded_escrows_still_work() {
    let mut env = setup(&[SOL], 1000, 500);
    // Someone sends lamports to the escrow address first, to try to block it.
    let a = env.investors[0].pubkey();
    let griefer = env.outsider.insecure_clone();
    let ix = system_instruction::transfer(&griefer.pubkey(), &escrow(&env, &a), 5_000_000);
    send(&mut env, &[ix], &[&griefer]).unwrap();
    deposit(&mut env, 0).unwrap();

    let stranger = Keypair::new();
    env.svm.airdrop(&stranger.pubkey(), 10 * SOL).unwrap();
    let ix = Instruction {
        program_id: program_id(),
        accounts: vec![
            AccountMeta::new(stranger.pubkey(), true),
            AccountMeta::new(env.launch, false),
            AccountMeta::new(escrow(&env, &stranger.pubkey()), false),
            AccountMeta::new_readonly(system_program::ID, false),
        ],
        data: GroupBuyInstruction::Deposit.pack(),
    };
    assert_eq!(send(&mut env, &[ix], &[&stranger]), Err(custom(GroupBuyError::NotCommitted)));
}

#[test]
fn launch_terms_are_validated() {
    let mut env = setup(&[SOL], 1000, 500);
    let creator = env.creator.insecure_clone();
    let base = InitLaunchArgs {
        id_seed: [3; 32],
        manifest_hash: [0; 32],
        mint: Pubkey::new_unique(),
        token_program: pump::TOKEN_2022_PROGRAM_ID,
        buyback: Pubkey::new_unique(),
        fee_bps: 1000,
        max_slippage_bps: 500,
        launch_at: LAUNCH_AT,
        refund_after: REFUND_AFTER,
        commitments: vec![(Pubkey::new_unique(), SOL)],
    };
    let k = Pubkey::new_unique();
    for bad in [
        InitLaunchArgs { fee_bps: 1001, ..base.clone() },
        InitLaunchArgs { max_slippage_bps: 2001, ..base.clone() },
        InitLaunchArgs { refund_after: LAUNCH_AT, ..base.clone() },
        InitLaunchArgs { token_program: Pubkey::new_unique(), ..base.clone() },
        InitLaunchArgs { commitments: vec![], ..base.clone() },
        InitLaunchArgs { commitments: vec![(k, SOL), (k, SOL)], ..base.clone() },
        InitLaunchArgs { commitments: vec![(k, 0)], ..base.clone() },
    ] {
        let launch = launch_address(&program_id(), &creator.pubkey(), &bad.id_seed).0;
        assert_eq!(send(&mut env, &[init_ix(&creator.pubkey(), &launch, bad)], &[&creator]), Err(custom(GroupBuyError::InvalidTerms)));
    }
    // Terms are fixed: a second init of the same launch fails.
    let launch = launch_address(&program_id(), &creator.pubkey(), &[9; 32]).0;
    let again = InitLaunchArgs { id_seed: [9; 32], ..base };
    assert!(send(&mut env, &[init_ix(&creator.pubkey(), &launch, again)], &[&creator]).is_err());
}
