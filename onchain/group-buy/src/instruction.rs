//! Instruction encoding. The first byte is the instruction tag.
//!
//! 0 InitLaunch   accounts: [creator (s,w), launch (w), system_program]
//! 1 Deposit      accounts: [investor (s,w), launch (w), escrow (w), system_program]
//! 2 Withdraw     accounts: [investor (w; signer unless cancelled/expired), launch (w), escrow (w)]
//! 3 Cancel       accounts: [creator (s), launch (w)]
//! 4 ExecuteBuy   accounts: [payer (s,w), launch (w), vault (w), vault_ata (w), buyback (w),
//!                           mint, token_program, ata_program, system_program,
//!                           27 pump buy_exact_quote_in_v2 accounts in IDL order,
//!                           every funded escrow (w)]
//! 5 Settle       accounts: [payer (s,w), launch (w), escrow (w), investor (w), investor_ata (w),
//!                           vault, vault_ata (w), mint, token_program, ata_program, system_program]
//! 6 CloseLaunch  accounts: [creator (w), launch (w)]

use solana_program::{program_error::ProgramError, pubkey::Pubkey};

use crate::state::{Reader, Writer, MAX_INVESTORS};

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct InitLaunchArgs {
    pub id_seed: [u8; 32],
    pub manifest_hash: [u8; 32],
    pub mint: Pubkey,
    pub token_program: Pubkey,
    pub buyback: Pubkey,
    pub fee_bps: u16,
    pub max_slippage_bps: u16,
    pub launch_at: i64,
    pub refund_after: i64,
    pub commitments: Vec<(Pubkey, u64)>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum GroupBuyInstruction {
    InitLaunch(InitLaunchArgs),
    Deposit,
    Withdraw,
    Cancel,
    ExecuteBuy,
    Settle,
    CloseLaunch,
}

impl GroupBuyInstruction {
    pub fn unpack(data: &[u8]) -> Result<Self, ProgramError> {
        let (&tag, rest) = data.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        let ix = match tag {
            0 => {
                let mut r = Reader { buf: rest, at: 0 };
                let mut args = InitLaunchArgs {
                    id_seed: r.array32()?,
                    manifest_hash: r.array32()?,
                    mint: r.pubkey()?,
                    token_program: r.pubkey()?,
                    buyback: r.pubkey()?,
                    fee_bps: r.u16()?,
                    max_slippage_bps: r.u16()?,
                    launch_at: r.i64()?,
                    refund_after: r.i64()?,
                    commitments: vec![],
                };
                let n = r.u16()? as usize;
                if n > MAX_INVESTORS {
                    return Err(ProgramError::InvalidInstructionData);
                }
                for _ in 0..n {
                    args.commitments.push((r.pubkey()?, r.u64()?));
                }
                if !r.done() {
                    return Err(ProgramError::InvalidInstructionData);
                }
                return Ok(Self::InitLaunch(args));
            }
            1 => Self::Deposit,
            2 => Self::Withdraw,
            3 => Self::Cancel,
            4 => Self::ExecuteBuy,
            5 => Self::Settle,
            6 => Self::CloseLaunch,
            _ => return Err(ProgramError::InvalidInstructionData),
        };
        if !rest.is_empty() {
            return Err(ProgramError::InvalidInstructionData);
        }
        Ok(ix)
    }

    pub fn pack(&self) -> Vec<u8> {
        match self {
            Self::InitLaunch(a) => {
                let mut buf = vec![0u8; 1 + 32 * 5 + 2 + 2 + 8 + 8 + 2 + a.commitments.len() * 40];
                let mut w = Writer { buf: &mut buf, at: 0 };
                w.u8(0);
                w.bytes(&a.id_seed);
                w.bytes(&a.manifest_hash);
                w.bytes(a.mint.as_ref());
                w.bytes(a.token_program.as_ref());
                w.bytes(a.buyback.as_ref());
                w.u16(a.fee_bps);
                w.u16(a.max_slippage_bps);
                w.i64(a.launch_at);
                w.i64(a.refund_after);
                w.u16(a.commitments.len() as u16);
                for (k, l) in &a.commitments {
                    w.bytes(k.as_ref());
                    w.u64(*l);
                }
                buf
            }
            Self::Deposit => vec![1],
            Self::Withdraw => vec![2],
            Self::Cancel => vec![3],
            Self::ExecuteBuy => vec![4],
            Self::Settle => vec![5],
            Self::CloseLaunch => vec![6],
        }
    }
}
