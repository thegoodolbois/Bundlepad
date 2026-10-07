//! pump.fun program interface (idl/pump.json from pump-fun/pump-public-docs).

use solana_program::{pubkey, pubkey::Pubkey};

pub const PROGRAM_ID: Pubkey = pubkey!("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
pub const TOKEN_PROGRAM_ID: Pubkey = pubkey!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
pub const TOKEN_2022_PROGRAM_ID: Pubkey = pubkey!("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
pub const ATA_PROGRAM_ID: Pubkey = pubkey!("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

/// `buy_exact_quote_in_v2(spendable_quote_in: u64, min_tokens_out: u64)`.
pub const BUY_EXACT_QUOTE_IN_V2: [u8; 8] = [194, 171, 28, 70, 104, 77, 91, 47];

/// Account order of `buy_exact_quote_in_v2`, and which ones are writable.
pub const BUY_ACCOUNTS: usize = 27;
pub const IX_BASE_MINT: usize = 1;
pub const IX_BASE_TOKEN_PROGRAM: usize = 3;
pub const IX_BONDING_CURVE: usize = 10;
pub const IX_USER: usize = 13;
pub const IX_ASSOCIATED_BASE_USER: usize = 14;
pub const IX_PROGRAM: usize = 26;
pub const BUY_WRITABLE: [bool; BUY_ACCOUNTS] = [
    false, false, false, false, false, false, true, true, true, true, true, true, true, true,
    true, true, true, true, false, false, true, true, false, false, false, false, false,
];

/// `BondingCurve` account: 8-byte discriminator, then these fields.
pub const BONDING_CURVE_DISC: [u8; 8] = [23, 183, 248, 55, 96, 216, 172, 96];

pub struct CurveReserves {
    pub virtual_token: u64,
    pub virtual_quote: u64,
    pub real_quote: u64,
    pub complete: bool,
}

pub fn read_curve(data: &[u8]) -> Option<CurveReserves> {
    if data.len() < 49 || data[..8] != BONDING_CURVE_DISC {
        return None;
    }
    let u = |at: usize| u64::from_le_bytes(data[at..at + 8].try_into().unwrap());
    Some(CurveReserves { virtual_token: u(8), virtual_quote: u(16), real_quote: u(32), complete: data[48] != 0 })
}

pub fn bonding_curve_address(mint: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[b"bonding-curve", mint.as_ref()], &PROGRAM_ID).0
}

pub fn associated_token_address(wallet: &Pubkey, mint: &Pubkey, token_program: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[wallet.as_ref(), token_program.as_ref(), mint.as_ref()], &ATA_PROGRAM_ID).0
}

/// Tokens out of a constant-product curve for `quote_in`, before pump's fees.
pub fn tokens_for_quote(curve: &CurveReserves, quote_in: u64) -> u64 {
    let vt = curve.virtual_token as u128;
    let vq = curve.virtual_quote as u128;
    let denom = vq + quote_in as u128;
    if denom == 0 {
        return 0;
    }
    let remaining = (vt * vq).div_ceil(denom);
    vt.saturating_sub(remaining) as u64
}
