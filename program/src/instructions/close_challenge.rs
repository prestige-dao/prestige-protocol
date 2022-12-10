use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    account_info::{ AccountInfo, next_account_info }, 
    entrypoint::ProgramResult, 
};

use crate::state::{ Challenge, User };
use crate::util::validate_signer;

pub fn close_challenge(accounts: &[AccountInfo]) -> ProgramResult {
    
    let accounts_iter = &mut accounts.iter();

    let challenge = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;

    let mut challenge_inner_data = Challenge::try_from_slice(
        &authority.try_borrow_mut_data()?
    )?;

    let user_inner_data = User::try_from_slice(
        &authority.try_borrow_mut_data()?
    )?;

    validate_signer(payer)?;
    assert!(*authority.key == challenge_inner_data.authority);
    assert!(*payer.key == user_inner_data.wallet);

    challenge_inner_data.status = 0;

    challenge_inner_data.serialize(
        &mut &mut challenge.data.borrow_mut()[..]
    )?;
    
    Ok(())
}