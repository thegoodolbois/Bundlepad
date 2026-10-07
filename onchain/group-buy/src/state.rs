//! Fixed-layout account data. Every integer is little-endian.

use solana_program::{program_error::ProgramError, pubkey::Pubkey};

use crate::error::GroupBuyError;

pub const MAX_INVESTORS: usize = 32;

pub const LAUNCH_DISC: [u8; 8] = *b"BPLAUNCH";
pub const ESCROW_DISC: [u8; 8] = *b"BPESCROW";

pub const STATE_FUNDING: u8 = 0;
pub const STATE_BOUGHT: u8 = 1;
pub const STATE_CANCELLED: u8 = 2;

pub const FLAG_FUNDED: u8 = 1;
pub const FLAG_SETTLED: u8 = 2;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Commitment {
    pub investor: Pubkey,
    pub lamports: u64,
    pub flags: u8,
}

pub const COMMITMENT_LEN: usize = 32 + 8 + 1;

/// One launch. Its terms are fixed by `init_launch` and never change.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Launch {
    pub bump: u8,
    pub vault_bump: u8,
    pub state: u8,
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub token_program: Pubkey,
    pub buyback: Pubkey,
    pub id_seed: [u8; 32],
    pub manifest_hash: [u8; 32],
    pub fee_bps: u16,
    pub max_slippage_bps: u16,
    pub launch_at: i64,
    pub refund_after: i64,
    pub funded_count: u16,
    pub settled_count: u16,
    pub total_funded: u64,
    pub tokens_bought: u64,
    pub sol_left: u64,
    pub fee_paid: u64,
    pub commitments: Vec<Commitment>,
}

const LAUNCH_HEADER_LEN: usize = 8 + 1 + 1 + 1 + 1 + 32 * 4 + 32 + 32 + 2 + 2 + 8 + 8 + 2 + 2 + 2 + 8 * 4;

impl Launch {
    pub fn space(n: usize) -> usize {
        LAUNCH_HEADER_LEN + n * COMMITMENT_LEN
    }

    pub fn pack(&self, dst: &mut [u8]) -> Result<(), ProgramError> {
        if dst.len() < Self::space(self.commitments.len()) {
            return Err(ProgramError::AccountDataTooSmall);
        }
        let mut w = Writer { buf: dst, at: 0 };
        w.bytes(&LAUNCH_DISC);
        w.u8(1); // layout version
        w.u8(self.bump);
        w.u8(self.vault_bump);
        w.u8(self.state);
        w.bytes(self.creator.as_ref());
        w.bytes(self.mint.as_ref());
        w.bytes(self.token_program.as_ref());
        w.bytes(self.buyback.as_ref());
        w.bytes(&self.id_seed);
        w.bytes(&self.manifest_hash);
        w.u16(self.fee_bps);
        w.u16(self.max_slippage_bps);
        w.i64(self.launch_at);
        w.i64(self.refund_after);
        w.u16(self.commitments.len() as u16);
        w.u16(self.funded_count);
        w.u16(self.settled_count);
        w.u64(self.total_funded);
        w.u64(self.tokens_bought);
        w.u64(self.sol_left);
        w.u64(self.fee_paid);
        for c in &self.commitments {
            w.bytes(c.investor.as_ref());
            w.u64(c.lamports);
            w.u8(c.flags);
        }
        Ok(())
    }

    pub fn unpack(src: &[u8]) -> Result<Self, ProgramError> {
        let mut r = Reader { buf: src, at: 0 };
        if r.bytes(8)? != LAUNCH_DISC || r.u8()? != 1 {
            return Err(GroupBuyError::NotALaunch.into());
        }
        let bump = r.u8()?;
        let vault_bump = r.u8()?;
        let state = r.u8()?;
        let creator = r.pubkey()?;
        let mint = r.pubkey()?;
        let token_program = r.pubkey()?;
        let buyback = r.pubkey()?;
        let id_seed = r.array32()?;
        let manifest_hash = r.array32()?;
        let fee_bps = r.u16()?;
        let max_slippage_bps = r.u16()?;
        let launch_at = r.i64()?;
        let refund_after = r.i64()?;
        let n = r.u16()? as usize;
        let funded_count = r.u16()?;
        let settled_count = r.u16()?;
        let total_funded = r.u64()?;
        let tokens_bought = r.u64()?;
        let sol_left = r.u64()?;
        let fee_paid = r.u64()?;
        if n > MAX_INVESTORS {
            return Err(GroupBuyError::NotALaunch.into());
        }
        let mut commitments = Vec::with_capacity(n);
        for _ in 0..n {
            commitments.push(Commitment { investor: r.pubkey()?, lamports: r.u64()?, flags: r.u8()? });
        }
        Ok(Self {
            bump, vault_bump, state, creator, mint, token_program, buyback, id_seed, manifest_hash,
            fee_bps, max_slippage_bps, launch_at, refund_after, funded_count, settled_count,
            total_funded, tokens_bought, sol_left, fee_paid, commitments,
        })
    }

    pub fn index_of(&self, investor: &Pubkey) -> Option<usize> {
        self.commitments.iter().position(|c| &c.investor == investor)
    }

    /// Lamports deposited by funded commitments listed before `index`.
    pub fn funded_before(&self, index: usize) -> u64 {
        self.commitments[..index].iter().filter(|c| c.flags & FLAG_FUNDED != 0).map(|c| c.lamports).sum()
    }
}

/// One investor's deposit. Holds only that investor's SOL until the buy.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Escrow {
    pub bump: u8,
    pub launch: Pubkey,
    pub investor: Pubkey,
    pub lamports: u64,
}

impl Escrow {
    pub const LEN: usize = 8 + 1 + 32 + 32 + 8;

    pub fn pack(&self, dst: &mut [u8]) -> Result<(), ProgramError> {
        if dst.len() < Self::LEN {
            return Err(ProgramError::AccountDataTooSmall);
        }
        let mut w = Writer { buf: dst, at: 0 };
        w.bytes(&ESCROW_DISC);
        w.u8(self.bump);
        w.bytes(self.launch.as_ref());
        w.bytes(self.investor.as_ref());
        w.u64(self.lamports);
        Ok(())
    }

    pub fn unpack(src: &[u8]) -> Result<Self, ProgramError> {
        let mut r = Reader { buf: src, at: 0 };
        if r.bytes(8)? != ESCROW_DISC {
            return Err(GroupBuyError::NotAnEscrow.into());
        }
        Ok(Self { bump: r.u8()?, launch: r.pubkey()?, investor: r.pubkey()?, lamports: r.u64()? })
    }
}

pub struct Writer<'a> {
    pub buf: &'a mut [u8],
    pub at: usize,
}

impl Writer<'_> {
    pub fn bytes(&mut self, b: &[u8]) {
        self.buf[self.at..self.at + b.len()].copy_from_slice(b);
        self.at += b.len();
    }
    pub fn u8(&mut self, v: u8) { self.bytes(&[v]); }
    pub fn u16(&mut self, v: u16) { self.bytes(&v.to_le_bytes()); }
    pub fn u64(&mut self, v: u64) { self.bytes(&v.to_le_bytes()); }
    pub fn i64(&mut self, v: i64) { self.bytes(&v.to_le_bytes()); }
}

pub struct Reader<'a> {
    pub buf: &'a [u8],
    pub at: usize,
}

impl<'a> Reader<'a> {
    pub fn bytes(&mut self, n: usize) -> Result<&'a [u8], ProgramError> {
        let end = self.at.checked_add(n).ok_or(ProgramError::InvalidInstructionData)?;
        let out = self.buf.get(self.at..end).ok_or(ProgramError::InvalidInstructionData)?;
        self.at = end;
        Ok(out)
    }
    pub fn u8(&mut self) -> Result<u8, ProgramError> { Ok(self.bytes(1)?[0]) }
    pub fn u16(&mut self) -> Result<u16, ProgramError> { Ok(u16::from_le_bytes(self.bytes(2)?.try_into().unwrap())) }
    pub fn u64(&mut self) -> Result<u64, ProgramError> { Ok(u64::from_le_bytes(self.bytes(8)?.try_into().unwrap())) }
    pub fn i64(&mut self) -> Result<i64, ProgramError> { Ok(i64::from_le_bytes(self.bytes(8)?.try_into().unwrap())) }
    pub fn array32(&mut self) -> Result<[u8; 32], ProgramError> { Ok(self.bytes(32)?.try_into().unwrap()) }
    pub fn pubkey(&mut self) -> Result<Pubkey, ProgramError> { Ok(Pubkey::new_from_array(self.array32()?)) }
    pub fn done(&self) -> bool { self.at == self.buf.len() }
}
