// solana_program re-exports of the system interface are deprecated but stable in 2.x.
#![allow(deprecated)]

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction, system_program,
    sysvar::Sysvar,
};

use crate::{
    error::GroupBuyError,
    instruction::{GroupBuyInstruction, InitLaunchArgs},
    pump,
    state::*,
};

pub const MAX_FEE_BPS: u16 = 1000;
pub const MAX_SLIPPAGE_BPS: u16 = 2000;

/// Held back from the buy for accounts pump.fun opens for a first-time buyer
/// (volume accumulator and quote ATAs). Unspent lamports are refunded at settle.
pub const BUY_RESERVE_LAMPORTS: u64 = 10_000_000;

pub fn launch_address(program_id: &Pubkey, creator: &Pubkey, id_seed: &[u8; 32]) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"launch", creator.as_ref(), id_seed], program_id)
}

pub fn escrow_address(program_id: &Pubkey, launch: &Pubkey, investor: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"escrow", launch.as_ref(), investor.as_ref()], program_id)
}

/// System-owned PDA that signs the pump.fun buy and owns the bought tokens.
pub fn vault_address(program_id: &Pubkey, launch: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"vault", launch.as_ref()], program_id)
}

pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    match GroupBuyInstruction::unpack(data)? {
        GroupBuyInstruction::InitLaunch(args) => init_launch(program_id, accounts, args),
        GroupBuyInstruction::Deposit => deposit(program_id, accounts),
        GroupBuyInstruction::Withdraw => withdraw(program_id, accounts),
        GroupBuyInstruction::Cancel => cancel(program_id, accounts),
        GroupBuyInstruction::ExecuteBuy => execute_buy(program_id, accounts),
        GroupBuyInstruction::Settle => settle(program_id, accounts),
        GroupBuyInstruction::CloseLaunch => close_launch(program_id, accounts),
    }
}

fn require(cond: bool, err: impl Into<ProgramError>) -> ProgramResult {
    if cond { Ok(()) } else { Err(err.into()) }
}

fn load_launch(program_id: &Pubkey, info: &AccountInfo) -> Result<Launch, ProgramError> {
    require(info.owner == program_id, GroupBuyError::NotALaunch)?;
    let launch = Launch::unpack(&info.try_borrow_data()?)?;
    let expected = Pubkey::create_program_address(
        &[b"launch", launch.creator.as_ref(), &launch.id_seed, &[launch.bump]],
        program_id,
    )?;
    require(info.key == &expected, GroupBuyError::NotALaunch)?;
    Ok(launch)
}

fn save_launch(info: &AccountInfo, launch: &Launch) -> ProgramResult {
    launch.pack(&mut info.try_borrow_mut_data()?)
}

fn load_escrow(program_id: &Pubkey, info: &AccountInfo, launch_key: &Pubkey) -> Result<Escrow, ProgramError> {
    require(info.owner == program_id, GroupBuyError::NotAnEscrow)?;
    let escrow = Escrow::unpack(&info.try_borrow_data()?)?;
    let expected = Pubkey::create_program_address(
        &[b"escrow", launch_key.as_ref(), escrow.investor.as_ref(), &[escrow.bump]],
        program_id,
    )?;
    require(info.key == &expected && &escrow.launch == launch_key, GroupBuyError::NotAnEscrow)?;
    Ok(escrow)
}

/// Creates a program-owned PDA, even if someone pre-funded its address.
fn create_pda<'a>(
    payer: &AccountInfo<'a>,
    target: &AccountInfo<'a>,
    system: &AccountInfo<'a>,
    space: usize,
    owner: &Pubkey,
    seeds: &[&[u8]],
) -> ProgramResult {
    let rent = Rent::get()?.minimum_balance(space);
    let current = target.lamports();
    if current == 0 {
        return invoke_signed(
            &system_instruction::create_account(payer.key, target.key, rent, space as u64, owner),
            &[payer.clone(), target.clone(), system.clone()],
            &[seeds],
        );
    }
    require(target.owner == &system_program::ID && target.data_is_empty(), ProgramError::AccountAlreadyInitialized)?;
    if current < rent {
        invoke(&system_instruction::transfer(payer.key, target.key, rent - current), &[payer.clone(), target.clone(), system.clone()])?;
    }
    invoke_signed(&system_instruction::allocate(target.key, space as u64), &[target.clone(), system.clone()], &[seeds])?;
    invoke_signed(&system_instruction::assign(target.key, owner), &[target.clone(), system.clone()], &[seeds])
}

/// Moves every lamport of a program-owned account to `to` and wipes it.
fn close_account(account: &AccountInfo, to: &AccountInfo) -> ProgramResult {
    let lamports = account.lamports();
    **to.try_borrow_mut_lamports()? = to.lamports().checked_add(lamports).ok_or(GroupBuyError::Overflow)?;
    **account.try_borrow_mut_lamports()? = 0;
    account.try_borrow_mut_data()?.fill(0);
    account.resize(0)?;
    account.assign(&system_program::ID);
    Ok(())
}

fn move_lamports(from: &AccountInfo, to: &AccountInfo, amount: u64) -> ProgramResult {
    **from.try_borrow_mut_lamports()? = from.lamports().checked_sub(amount).ok_or(GroupBuyError::Overflow)?;
    **to.try_borrow_mut_lamports()? = to.lamports().checked_add(amount).ok_or(GroupBuyError::Overflow)?;
    Ok(())
}

fn token_amount(info: &AccountInfo) -> Result<u64, ProgramError> {
    let data = info.try_borrow_data()?;
    let bytes = data.get(64..72).ok_or(ProgramError::InvalidAccountData)?;
    Ok(u64::from_le_bytes(bytes.try_into().unwrap()))
}

fn create_ata_idempotent<'a>(
    payer: &AccountInfo<'a>,
    ata: &AccountInfo<'a>,
    wallet: &AccountInfo<'a>,
    mint: &AccountInfo<'a>,
    system: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    ata_program: &AccountInfo<'a>,
) -> ProgramResult {
    require(ata_program.key == &pump::ATA_PROGRAM_ID, ProgramError::IncorrectProgramId)?;
    let ix = Instruction {
        program_id: pump::ATA_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new(*payer.key, true),
            AccountMeta::new(*ata.key, false),
            AccountMeta::new_readonly(*wallet.key, false),
            AccountMeta::new_readonly(*mint.key, false),
            AccountMeta::new_readonly(system_program::ID, false),
            AccountMeta::new_readonly(*token_program.key, false),
        ],
        data: vec![1],
    };
    invoke(&ix, &[payer.clone(), ata.clone(), wallet.clone(), mint.clone(), system.clone(), token_program.clone()])
}

/// floor(total × (before + amount) ÷ funded) − floor(total × before ÷ funded):
/// shares that always add up to exactly `total`.
fn share(total: u64, before: u64, amount: u64, funded: u64) -> Result<u64, ProgramError> {
    require(funded > 0, GroupBuyError::Overflow)?;
    let t = total as u128;
    let f = funded as u128;
    let hi = t * (before as u128 + amount as u128) / f;
    let lo = t * before as u128 / f;
    u64::try_from(hi - lo).map_err(|_| GroupBuyError::Overflow.into())
}

fn init_launch(program_id: &Pubkey, accounts: &[AccountInfo], args: InitLaunchArgs) -> ProgramResult {
    let it = &mut accounts.iter();
    let creator = next_account_info(it)?;
    let launch_info = next_account_info(it)?;
    let system = next_account_info(it)?;
    require(creator.is_signer, GroupBuyError::MissingSignature)?;
    require(system.key == &system_program::ID, ProgramError::IncorrectProgramId)?;

    let n = args.commitments.len();
    require(n > 0 && n <= MAX_INVESTORS, GroupBuyError::InvalidTerms)?;
    require(args.fee_bps <= MAX_FEE_BPS, GroupBuyError::InvalidTerms)?;
    require(args.max_slippage_bps <= MAX_SLIPPAGE_BPS, GroupBuyError::InvalidTerms)?;
    require(args.refund_after > args.launch_at, GroupBuyError::InvalidTerms)?;
    require(
        args.token_program == pump::TOKEN_PROGRAM_ID || args.token_program == pump::TOKEN_2022_PROGRAM_ID,
        GroupBuyError::InvalidTerms,
    )?;
    require(args.mint != Pubkey::default() && args.buyback != Pubkey::default(), GroupBuyError::InvalidTerms)?;
    for (i, (investor, lamports)) in args.commitments.iter().enumerate() {
        require(*lamports > 0 && *investor != Pubkey::default(), GroupBuyError::InvalidTerms)?;
        require(!args.commitments[..i].iter().any(|(k, _)| k == investor), GroupBuyError::InvalidTerms)?;
    }
    args.commitments.iter().try_fold(0u64, |s, (_, l)| s.checked_add(*l)).ok_or(GroupBuyError::Overflow)?;

    let (expected, bump) = launch_address(program_id, creator.key, &args.id_seed);
    require(launch_info.key == &expected, GroupBuyError::NotALaunch)?;
    let (_, vault_bump) = vault_address(program_id, &expected);
    create_pda(creator, launch_info, system, Launch::space(n), program_id, &[b"launch", creator.key.as_ref(), &args.id_seed, &[bump]])?;

    let launch = Launch {
        bump,
        vault_bump,
        state: STATE_FUNDING,
        creator: *creator.key,
        mint: args.mint,
        token_program: args.token_program,
        buyback: args.buyback,
        id_seed: args.id_seed,
        manifest_hash: args.manifest_hash,
        fee_bps: args.fee_bps,
        max_slippage_bps: args.max_slippage_bps,
        launch_at: args.launch_at,
        refund_after: args.refund_after,
        funded_count: 0,
        settled_count: 0,
        total_funded: 0,
        tokens_bought: 0,
        sol_left: 0,
        fee_paid: 0,
        commitments: args.commitments.iter().map(|(investor, lamports)| Commitment { investor: *investor, lamports: *lamports, flags: 0 }).collect(),
    };
    save_launch(launch_info, &launch)?;
    msg!("launch {} with {} commitments", launch_info.key, n);
    Ok(())
}

fn deposit(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let it = &mut accounts.iter();
    let investor = next_account_info(it)?;
    let launch_info = next_account_info(it)?;
    let escrow_info = next_account_info(it)?;
    let system = next_account_info(it)?;
    require(investor.is_signer, GroupBuyError::MissingSignature)?;
    require(system.key == &system_program::ID, ProgramError::IncorrectProgramId)?;

    let mut launch = load_launch(program_id, launch_info)?;
    require(launch.state == STATE_FUNDING, GroupBuyError::WrongState)?;
    require(Clock::get()?.unix_timestamp < launch.refund_after, GroupBuyError::FundingExpired)?;
    let i = launch.index_of(investor.key).ok_or(GroupBuyError::NotCommitted)?;
    require(launch.commitments[i].flags & FLAG_FUNDED == 0, GroupBuyError::AlreadyFunded)?;

    let (expected, bump) = escrow_address(program_id, launch_info.key, investor.key);
    require(escrow_info.key == &expected, GroupBuyError::NotAnEscrow)?;
    create_pda(investor, escrow_info, system, Escrow::LEN, program_id, &[b"escrow", launch_info.key.as_ref(), investor.key.as_ref(), &[bump]])?;
    let lamports = launch.commitments[i].lamports;
    invoke(
        &system_instruction::transfer(investor.key, escrow_info.key, lamports),
        &[investor.clone(), escrow_info.clone(), system.clone()],
    )?;
    Escrow { bump, launch: *launch_info.key, investor: *investor.key, lamports }.pack(&mut escrow_info.try_borrow_mut_data()?)?;

    launch.commitments[i].flags |= FLAG_FUNDED;
    launch.funded_count += 1;
    save_launch(launch_info, &launch)
}

/// Before the buy, the investor can take their deposit back at any time.
/// After a cancel, or once `refund_after` passes without a buy, anyone can
/// send it back to them.
fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let it = &mut accounts.iter();
    let investor = next_account_info(it)?;
    let launch_info = next_account_info(it)?;
    let escrow_info = next_account_info(it)?;

    let mut launch = load_launch(program_id, launch_info)?;
    let escrow = load_escrow(program_id, escrow_info, launch_info.key)?;
    require(&escrow.investor == investor.key, GroupBuyError::NotAnEscrow)?;
    let refundable = launch.state == STATE_CANCELLED
        || (launch.state == STATE_FUNDING && Clock::get()?.unix_timestamp >= launch.refund_after);
    require(launch.state == STATE_FUNDING || refundable, GroupBuyError::WrongState)?;
    require(refundable || investor.is_signer, GroupBuyError::MissingSignature)?;

    close_account(escrow_info, investor)?;
    let i = launch.index_of(investor.key).ok_or(GroupBuyError::NotCommitted)?;
    launch.commitments[i].flags &= !FLAG_FUNDED;
    launch.funded_count -= 1;
    save_launch(launch_info, &launch)
}

fn cancel(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let it = &mut accounts.iter();
    let creator = next_account_info(it)?;
    let launch_info = next_account_info(it)?;
    let mut launch = load_launch(program_id, launch_info)?;
    require(creator.is_signer && creator.key == &launch.creator, GroupBuyError::MissingSignature)?;
    require(launch.state == STATE_FUNDING, GroupBuyError::WrongState)?;
    launch.state = STATE_CANCELLED;
    save_launch(launch_info, &launch)
}

fn execute_buy<'a>(program_id: &Pubkey, accounts: &[AccountInfo<'a>]) -> ProgramResult {
    let it = &mut accounts.iter();
    let payer = next_account_info(it)?;
    let launch_info = next_account_info(it)?;
    let vault = next_account_info(it)?;
    let vault_ata = next_account_info(it)?;
    let buyback = next_account_info(it)?;
    let mint = next_account_info(it)?;
    let token_program = next_account_info(it)?;
    let ata_program = next_account_info(it)?;
    let system = next_account_info(it)?;
    let rest = it.as_slice();
    require(rest.len() >= pump::BUY_ACCOUNTS, ProgramError::NotEnoughAccountKeys)?;
    let (pump_accounts, escrows) = rest.split_at(pump::BUY_ACCOUNTS);
    require(payer.is_signer, GroupBuyError::MissingSignature)?;
    require(system.key == &system_program::ID, ProgramError::IncorrectProgramId)?;

    let mut launch = load_launch(program_id, launch_info)?;
    require(launch.state == STATE_FUNDING, GroupBuyError::WrongState)?;
    let now = Clock::get()?.unix_timestamp;
    require(now >= launch.launch_at, GroupBuyError::TooEarly)?;
    require(now < launch.refund_after, GroupBuyError::FundingExpired)?;
    require(launch.funded_count > 0, GroupBuyError::NothingToSpend)?;

    let vault_seeds: &[&[u8]] = &[b"vault", launch_info.key.as_ref(), &[launch.vault_bump]];
    require(vault.key == &Pubkey::create_program_address(vault_seeds, program_id)?, GroupBuyError::WrongPumpAccount)?;
    require(mint.key == &launch.mint, GroupBuyError::WrongPumpAccount)?;
    require(token_program.key == &launch.token_program, ProgramError::IncorrectProgramId)?;
    require(buyback.key == &launch.buyback, GroupBuyError::WrongPumpAccount)?;
    require(
        vault_ata.key == &pump::associated_token_address(vault.key, mint.key, token_program.key),
        GroupBuyError::WrongPumpAccount,
    )?;

    // Pin the accounts that decide what is bought, by whom, and into which account.
    let p = pump_accounts;
    require(p[pump::IX_PROGRAM].key == &pump::PROGRAM_ID, ProgramError::IncorrectProgramId)?;
    require(p[pump::IX_BASE_MINT].key == mint.key, GroupBuyError::WrongPumpAccount)?;
    require(p[pump::IX_BASE_TOKEN_PROGRAM].key == token_program.key, GroupBuyError::WrongPumpAccount)?;
    require(p[pump::IX_USER].key == vault.key, GroupBuyError::WrongPumpAccount)?;
    require(p[pump::IX_ASSOCIATED_BASE_USER].key == vault_ata.key, GroupBuyError::WrongPumpAccount)?;
    let curve_info = &p[pump::IX_BONDING_CURVE];
    require(
        curve_info.key == &pump::bonding_curve_address(mint.key) && curve_info.owner == &pump::PROGRAM_ID,
        GroupBuyError::WrongPumpAccount,
    )?;
    let curve = pump::read_curve(&curve_info.try_borrow_data()?).ok_or(GroupBuyError::WrongPumpAccount)?;
    require(curve.real_quote == 0 && !curve.complete, GroupBuyError::CurveNotFresh)?;

    // Sweep every funded escrow, exactly once each, into the vault.
    require(escrows.len() == launch.funded_count as usize, GroupBuyError::WrongEscrowSet)?;
    let mut total: u64 = 0;
    for (k, info) in escrows.iter().enumerate() {
        require(!escrows[..k].iter().any(|e| e.key == info.key), GroupBuyError::WrongEscrowSet)?;
        let escrow = load_escrow(program_id, info, launch_info.key)?;
        let i = launch.index_of(&escrow.investor).ok_or(GroupBuyError::NotCommitted)?;
        require(launch.commitments[i].flags & FLAG_FUNDED != 0, GroupBuyError::NotFunded)?;
        move_lamports(info, vault, escrow.lamports)?;
        total = total.checked_add(escrow.lamports).ok_or(GroupBuyError::Overflow)?;
    }

    // The runtime only syncs direct lamport edits for accounts named in a CPI,
    // and rejects a CPI whose synced accounts don't balance. So the fee
    // transfer also names every swept escrow: the sweep and the vault credit
    // sync together. The system program ignores the extra accounts.
    let fee = (total as u128 * launch.fee_bps as u128 / 10_000) as u64;
    let mut fee_ix = system_instruction::transfer(vault.key, buyback.key, fee);
    fee_ix.accounts.extend(escrows.iter().map(|e| AccountMeta::new(*e.key, false)));
    let mut fee_infos = vec![vault.clone(), buyback.clone(), system.clone()];
    fee_infos.extend(escrows.iter().cloned());
    invoke_signed(&fee_ix, &fee_infos, &[vault_seeds])?;
    let spend = total.saturating_sub(fee).saturating_sub(BUY_RESERVE_LAMPORTS);
    require(spend > 0, GroupBuyError::NothingToSpend)?;
    let expected = pump::tokens_for_quote(&curve, spend);
    let min_out = (expected as u128 * (10_000 - launch.max_slippage_bps) as u128 / 10_000) as u64;

    create_ata_idempotent(payer, vault_ata, vault, mint, system, token_program, ata_program)?;
    let before = token_amount(vault_ata)?;

    let mut data = Vec::with_capacity(24);
    data.extend_from_slice(&pump::BUY_EXACT_QUOTE_IN_V2);
    data.extend_from_slice(&spend.to_le_bytes());
    data.extend_from_slice(&min_out.to_le_bytes());
    let metas = p.iter().enumerate().map(|(i, a)| AccountMeta {
        pubkey: *a.key,
        is_signer: i == pump::IX_USER,
        is_writable: pump::BUY_WRITABLE[i],
    });
    let ix = Instruction { program_id: pump::PROGRAM_ID, accounts: metas.collect(), data };
    invoke_signed(&ix, p, &[vault_seeds])?;

    let bought = token_amount(vault_ata)?.checked_sub(before).ok_or(GroupBuyError::Overflow)?;
    require(bought >= min_out && bought > 0, GroupBuyError::BelowMinTokensOut)?;

    // Unspent SOL moves to the launch account and is refunded pro-rata at settle.
    let left = vault.lamports();
    if left > 0 {
        invoke_signed(&system_instruction::transfer(vault.key, launch_info.key, left), &[vault.clone(), launch_info.clone(), system.clone()], &[vault_seeds])?;
    }

    launch.state = STATE_BOUGHT;
    launch.total_funded = total;
    launch.tokens_bought = bought;
    launch.sol_left = left;
    launch.fee_paid = fee;
    save_launch(launch_info, &launch)?;
    msg!("group buy: {} lamports from {} investors, fee {}, spent {}, tokens {}", total, escrows.len(), fee, spend, bought);
    Ok(())
}

/// Permissionless: sends one investor their share of the tokens and of any
/// unspent SOL, and closes their escrow (its rent goes back to them).
fn settle<'a>(program_id: &Pubkey, accounts: &[AccountInfo<'a>]) -> ProgramResult {
    let it = &mut accounts.iter();
    let payer = next_account_info(it)?;
    let launch_info = next_account_info(it)?;
    let escrow_info = next_account_info(it)?;
    let investor = next_account_info(it)?;
    let investor_ata = next_account_info(it)?;
    let vault = next_account_info(it)?;
    let vault_ata = next_account_info(it)?;
    let mint = next_account_info(it)?;
    let token_program = next_account_info(it)?;
    let ata_program = next_account_info(it)?;
    let system = next_account_info(it)?;
    require(payer.is_signer, GroupBuyError::MissingSignature)?;
    require(system.key == &system_program::ID, ProgramError::IncorrectProgramId)?;

    let mut launch = load_launch(program_id, launch_info)?;
    require(launch.state == STATE_BOUGHT, GroupBuyError::WrongState)?;
    let escrow = load_escrow(program_id, escrow_info, launch_info.key)?;
    require(&escrow.investor == investor.key, GroupBuyError::NotAnEscrow)?;
    let i = launch.index_of(investor.key).ok_or(GroupBuyError::NotCommitted)?;
    let c = launch.commitments[i];
    require(c.flags & FLAG_FUNDED != 0, GroupBuyError::NotFunded)?;
    require(c.flags & FLAG_SETTLED == 0, GroupBuyError::AlreadySettled)?;

    let vault_seeds: &[&[u8]] = &[b"vault", launch_info.key.as_ref(), &[launch.vault_bump]];
    require(vault.key == &Pubkey::create_program_address(vault_seeds, program_id)?, GroupBuyError::WrongPumpAccount)?;
    require(mint.key == &launch.mint && token_program.key == &launch.token_program, GroupBuyError::WrongPumpAccount)?;
    require(vault_ata.key == &pump::associated_token_address(vault.key, mint.key, token_program.key), GroupBuyError::WrongPumpAccount)?;
    require(investor_ata.key == &pump::associated_token_address(investor.key, mint.key, token_program.key), GroupBuyError::WrongPumpAccount)?;

    let before = launch.funded_before(i);
    let tokens = share(launch.tokens_bought, before, c.lamports, launch.total_funded)?;
    let sol = share(launch.sol_left, before, c.lamports, launch.total_funded)?;

    create_ata_idempotent(payer, investor_ata, investor, mint, system, token_program, ata_program)?;
    if tokens > 0 {
        let decimals = *mint.try_borrow_data()?.get(44).ok_or(ProgramError::InvalidAccountData)?;
        let mut data = vec![12u8];
        data.extend_from_slice(&tokens.to_le_bytes());
        data.push(decimals);
        let ix = Instruction {
            program_id: *token_program.key,
            accounts: vec![
                AccountMeta::new(*vault_ata.key, false),
                AccountMeta::new_readonly(*mint.key, false),
                AccountMeta::new(*investor_ata.key, false),
                AccountMeta::new_readonly(*vault.key, true),
            ],
            data,
        };
        invoke_signed(&ix, &[vault_ata.clone(), mint.clone(), investor_ata.clone(), vault.clone()], &[vault_seeds])?;
    }
    if sol > 0 {
        move_lamports(launch_info, investor, sol)?;
    }
    close_account(escrow_info, investor)?;

    launch.commitments[i].flags |= FLAG_SETTLED;
    launch.settled_count += 1;
    save_launch(launch_info, &launch)?;
    msg!("settled {}: {} tokens, {} lamports", investor.key, tokens, sol);
    Ok(())
}

/// Returns the launch account's rent to the creator once nothing is left in it.
fn close_launch(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let it = &mut accounts.iter();
    let creator = next_account_info(it)?;
    let launch_info = next_account_info(it)?;
    let launch = load_launch(program_id, launch_info)?;
    require(creator.key == &launch.creator, GroupBuyError::MissingSignature)?;
    let done = match launch.state {
        STATE_BOUGHT => launch.settled_count == launch.funded_count,
        STATE_CANCELLED => launch.funded_count == 0,
        _ => false,
    };
    require(done, GroupBuyError::StillFundedOrUnsettled)?;
    close_account(launch_info, creator)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shares_add_up_exactly() {
        let deposits = [3u64, 7, 11, 13, 1];
        let funded: u64 = deposits.iter().sum();
        for total in [0u64, 1, 999, 1_000_000_007, u64::MAX / 2] {
            let mut before = 0;
            let mut sum = 0u64;
            for d in deposits {
                sum += share(total, before, d, funded).unwrap();
                before += d;
            }
            assert_eq!(sum, total);
        }
    }

    #[test]
    fn instruction_round_trip() {
        let args = InitLaunchArgs {
            id_seed: [1; 32],
            manifest_hash: [2; 32],
            mint: Pubkey::new_unique(),
            token_program: pump::TOKEN_2022_PROGRAM_ID,
            buyback: Pubkey::new_unique(),
            fee_bps: 1000,
            max_slippage_bps: 500,
            launch_at: 10,
            refund_after: 20,
            commitments: vec![(Pubkey::new_unique(), 5), (Pubkey::new_unique(), 6)],
        };
        let ix = GroupBuyInstruction::InitLaunch(args);
        assert_eq!(GroupBuyInstruction::unpack(&ix.pack()).unwrap(), ix);
        assert!(GroupBuyInstruction::unpack(&[1, 0]).is_err());
    }

    #[test]
    fn curve_quote_matches_constant_product() {
        let curve = pump::CurveReserves { virtual_token: 1_073_000_000_000_000, virtual_quote: 30_000_000_000, real_quote: 0, complete: false };
        let out = pump::tokens_for_quote(&curve, 1_000_000_000);
        assert_eq!(out, 34_612_903_225_806);
    }
}
