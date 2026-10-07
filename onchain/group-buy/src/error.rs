use solana_program::program_error::ProgramError;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum GroupBuyError {
    NotALaunch = 0,
    NotAnEscrow,
    InvalidTerms,
    WrongState,
    NotCommitted,
    AlreadyFunded,
    NotFunded,
    AlreadySettled,
    TooEarly,
    FundingExpired,
    WrongEscrowSet,
    WrongPumpAccount,
    CurveNotFresh,
    NothingToSpend,
    BelowMinTokensOut,
    Overflow,
    MissingSignature,
    StillFundedOrUnsettled,
}

impl From<GroupBuyError> for ProgramError {
    fn from(e: GroupBuyError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
