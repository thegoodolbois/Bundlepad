//! Test double for pump.fun, deployed at the real program id in tests only.
//! Implements `buy_exact_quote_in_v2` with the real account order: takes a
//! 1.25% fee, prices on the constant-product curve, charges the buyer rent for
//! a volume accumulator on first buy, and enforces `min_tokens_out`.
#![allow(deprecated)]

use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
};

pub const BUY_EXACT_QUOTE_IN_V2: [u8; 8] = [194, 171, 28, 70, 104, 77, 91, 47];
pub const FEE_BPS: u64 = 125;
pub const ACCUMULATOR_RENT: u64 = 1_844_400;
pub const ERR_MIN_TOKENS_OUT: u32 = 6042;

#[cfg(not(feature = "no-entrypoint"))]
solana_program::entrypoint!(process);

pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if data.len() != 24 || data[..8] != BUY_EXACT_QUOTE_IN_V2 {
        return Err(ProgramError::InvalidInstructionData);
    }
    if accounts.len() < 27 {
        return Err(ProgramError::NotEnoughAccountKeys);
    }
    let spend = u64::from_le_bytes(data[8..16].try_into().unwrap());
    let min_out = u64::from_le_bytes(data[16..24].try_into().unwrap());
    let mint = &accounts[1];
    let token_program = &accounts[3];
    let fee_recipient = &accounts[6];
    let curve = &accounts[10];
    let curve_ata = &accounts[11];
    let user = &accounts[13];
    let user_ata = &accounts[14];
    let accumulator = &accounts[20];
    let system = &accounts[24];

    let (curve_key, bump) = Pubkey::find_program_address(&[b"bonding-curve", mint.key.as_ref()], program_id);
    if curve.key != &curve_key || curve.owner != program_id || !user.is_signer {
        return Err(ProgramError::InvalidArgument);
    }
    let (vt, vq, rt, rq) = {
        let d = curve.try_borrow_data()?;
        let u = |at: usize| u64::from_le_bytes(d[at..at + 8].try_into().unwrap());
        (u(8), u(16), u(24), u(32))
    };
    let fee = spend * FEE_BPS / 10_000;
    let net = spend - fee;
    let remaining = ((vt as u128 * vq as u128).div_ceil(vq as u128 + net as u128)) as u64;
    let tokens = (vt - remaining).min(rt);
    if tokens < min_out {
        return Err(ProgramError::Custom(ERR_MIN_TOKENS_OUT));
    }

    invoke(&system_instruction::transfer(user.key, curve.key, net), &[user.clone(), curve.clone(), system.clone()])?;
    invoke(&system_instruction::transfer(user.key, fee_recipient.key, fee), &[user.clone(), fee_recipient.clone(), system.clone()])?;
    if accumulator.lamports() == 0 {
        invoke(&system_instruction::transfer(user.key, accumulator.key, ACCUMULATOR_RENT), &[user.clone(), accumulator.clone(), system.clone()])?;
    }
    let decimals = mint.try_borrow_data()?[44];
    let mut ix_data = vec![12u8];
    ix_data.extend_from_slice(&tokens.to_le_bytes());
    ix_data.push(decimals);
    let ix = Instruction {
        program_id: *token_program.key,
        accounts: vec![
            AccountMeta::new(*curve_ata.key, false),
            AccountMeta::new_readonly(*mint.key, false),
            AccountMeta::new(*user_ata.key, false),
            AccountMeta::new_readonly(*curve.key, true),
        ],
        data: ix_data,
    };
    invoke_signed(&ix, &[curve_ata.clone(), mint.clone(), user_ata.clone(), curve.clone()], &[&[b"bonding-curve", mint.key.as_ref(), &[bump]]])?;

    let mut d = curve.try_borrow_mut_data()?;
    d[8..16].copy_from_slice(&(vt - tokens).to_le_bytes());
    d[16..24].copy_from_slice(&(vq + net).to_le_bytes());
    d[24..32].copy_from_slice(&(rt - tokens).to_le_bytes());
    d[32..40].copy_from_slice(&(rq + net).to_le_bytes());
    Ok(())
}
