//! Bundlepad group buy.
//!
//! Investors each deposit their committed SOL into their own escrow PDA,
//! which only this program can move and which they can withdraw from until
//! the buy. `execute_buy` sweeps every funded escrow, pays the platform fee to
//! the launch's buyback address, and makes one pump.fun buy for the rest, but
//! only as the first buy on a fresh curve, so every investor pays the same
//! price. `settle` sends each investor `tokens × deposit ÷ total` (and the
//! same share of any unspent SOL) straight to their own wallet. If the buy
//! doesn't happen by `refund_after`, or the creator cancels, anyone can
//! refund every escrow to its investor.
//!
//! The launch terms (commitment list, fee, mint, buyback address, slippage
//! floor, times) are fixed at `init_launch` and can't be changed.

pub mod error;
pub mod instruction;
pub mod processor;
pub mod pump;
pub mod state;

#[cfg(not(feature = "no-entrypoint"))]
use processor::process;
#[cfg(not(feature = "no-entrypoint"))]
solana_program::entrypoint!(process);
