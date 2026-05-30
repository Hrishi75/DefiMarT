//! DefiMart trustless marketplace escrow.
//!
//! Replaces the custodial escrow keypair (`MARKETPLACE_ESCROW_PRIVATE_KEY`)
//! with a program-derived vault. Payment funds (SPL tokens — USDC/PYUSD/EURC)
//! are locked in a PDA-owned token account until the buyer confirms receipt,
//! at which point they are released to the seller. If the deal falls through,
//! the seller or an arbiter can refund the buyer. No single private key ever
//! controls the funds.
//!
//! Flow:
//!   initialize -> funds locked in vault (state = Funded)
//!   release    -> vault -> seller   (buyer or arbiter signs)  state = Released
//!   refund     -> vault -> buyer    (seller or arbiter signs) state = Refunded

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer},
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod escrow {
    use super::*;

    /// Buyer locks `amount` of `mint` tokens into a PDA vault for a listing.
    ///
    /// `listing_id` is the 16-byte UUID of the marketplace listing, used as a
    /// seed so each (buyer, listing) pair has a unique escrow.
    pub fn initialize(
        ctx: Context<Initialize>,
        listing_id: [u8; 16],
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, EscrowError::ZeroAmount);
        require_keys_neq!(
            ctx.accounts.buyer.key(),
            ctx.accounts.seller.key(),
            EscrowError::SelfDeal
        );

        let escrow = &mut ctx.accounts.escrow;
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = ctx.accounts.seller.key();
        // Arbiter defaults to the seller when none is supplied; an optional
        // dedicated arbiter can be set by passing a different account.
        escrow.arbiter = ctx.accounts.arbiter.key();
        escrow.mint = ctx.accounts.mint.key();
        escrow.amount = amount;
        escrow.listing_id = listing_id;
        escrow.state = EscrowState::Funded;
        escrow.bump = ctx.bumps.escrow;

        // Move funds from the buyer into the vault (buyer signs).
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_ata.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            amount,
        )?;

        emit!(EscrowFunded {
            escrow: escrow.key(),
            buyer: escrow.buyer,
            seller: escrow.seller,
            mint: escrow.mint,
            amount,
        });

        Ok(())
    }

    /// Release the locked funds to the seller. Signed by the buyer (happy path)
    /// or the arbiter (dispute resolved in seller's favour).
    pub fn release(ctx: Context<Resolve>) -> Result<()> {
        require!(
            ctx.accounts.escrow.state == EscrowState::Funded,
            EscrowError::NotFunded
        );
        require!(
            ctx.accounts.signer.key() == ctx.accounts.escrow.buyer
                || ctx.accounts.signer.key() == ctx.accounts.escrow.arbiter,
            EscrowError::Unauthorized
        );
        // Funds must land in the seller's token account.
        require_keys_eq!(
            ctx.accounts.recipient_ata.owner,
            ctx.accounts.escrow.seller,
            EscrowError::WrongRecipient
        );

        let amount = ctx.accounts.escrow.amount;
        transfer_from_vault(
            &ctx.accounts.token_program,
            &ctx.accounts.vault,
            &ctx.accounts.recipient_ata,
            &ctx.accounts.escrow,
            amount,
        )?;
        close_vault(
            &ctx.accounts.token_program,
            &ctx.accounts.vault,
            &ctx.accounts.buyer,
            &ctx.accounts.escrow,
        )?;

        ctx.accounts.escrow.state = EscrowState::Released;

        emit!(EscrowSettled {
            escrow: ctx.accounts.escrow.key(),
            to: ctx.accounts.recipient_ata.owner,
            amount,
            state: EscrowState::Released,
        });

        Ok(())
    }

    /// Refund the locked funds to the buyer. Signed by the seller (cancels the
    /// sale) or the arbiter (dispute resolved in buyer's favour).
    pub fn refund(ctx: Context<Resolve>) -> Result<()> {
        require!(
            ctx.accounts.escrow.state == EscrowState::Funded,
            EscrowError::NotFunded
        );
        require!(
            ctx.accounts.signer.key() == ctx.accounts.escrow.seller
                || ctx.accounts.signer.key() == ctx.accounts.escrow.arbiter,
            EscrowError::Unauthorized
        );
        // Funds must return to the buyer's token account.
        require_keys_eq!(
            ctx.accounts.recipient_ata.owner,
            ctx.accounts.escrow.buyer,
            EscrowError::WrongRecipient
        );

        let amount = ctx.accounts.escrow.amount;
        transfer_from_vault(
            &ctx.accounts.token_program,
            &ctx.accounts.vault,
            &ctx.accounts.recipient_ata,
            &ctx.accounts.escrow,
            amount,
        )?;
        close_vault(
            &ctx.accounts.token_program,
            &ctx.accounts.vault,
            &ctx.accounts.buyer,
            &ctx.accounts.escrow,
        )?;

        ctx.accounts.escrow.state = EscrowState::Refunded;

        emit!(EscrowSettled {
            escrow: ctx.accounts.escrow.key(),
            to: ctx.accounts.recipient_ata.owner,
            amount,
            state: EscrowState::Refunded,
        });

        Ok(())
    }
}

// ----------------------------------------------------------------------------
// Shared CPI helpers
// ----------------------------------------------------------------------------

/// Signer seeds for the escrow PDA, used to authorize vault transfers/closes.
fn escrow_signer_seeds<'a>(escrow: &'a Account<Escrow>) -> [Vec<u8>; 4] {
    [
        b"escrow".to_vec(),
        escrow.buyer.as_ref().to_vec(),
        escrow.listing_id.to_vec(),
        vec![escrow.bump],
    ]
}

fn transfer_from_vault<'info>(
    token_program: &Program<'info, Token>,
    vault: &Account<'info, TokenAccount>,
    dest: &Account<'info, TokenAccount>,
    escrow: &Account<'info, Escrow>,
    amount: u64,
) -> Result<()> {
    let seeds = escrow_signer_seeds(escrow);
    let seed_slices: [&[u8]; 4] = [&seeds[0], &seeds[1], &seeds[2], &seeds[3]];
    let signer: &[&[&[u8]]] = &[&seed_slices];

    token::transfer(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            Transfer {
                from: vault.to_account_info(),
                to: dest.to_account_info(),
                authority: escrow.to_account_info(),
            },
            signer,
        ),
        amount,
    )
}

fn close_vault<'info>(
    token_program: &Program<'info, Token>,
    vault: &Account<'info, TokenAccount>,
    rent_dest: &SystemAccount<'info>,
    escrow: &Account<'info, Escrow>,
) -> Result<()> {
    let seeds = escrow_signer_seeds(escrow);
    let seed_slices: [&[u8]; 4] = [&seeds[0], &seeds[1], &seeds[2], &seeds[3]];
    let signer: &[&[&[u8]]] = &[&seed_slices];

    token::close_account(CpiContext::new_with_signer(
        token_program.to_account_info(),
        CloseAccount {
            account: vault.to_account_info(),
            destination: rent_dest.to_account_info(),
            authority: escrow.to_account_info(),
        },
        signer,
    ))
}

// ----------------------------------------------------------------------------
// Accounts
// ----------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(listing_id: [u8; 16])]
pub struct Initialize<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: stored on the escrow for later validation; not read here.
    pub seller: UncheckedAccount<'info>,

    /// CHECK: stored on the escrow as the dispute arbiter. Pass the seller
    /// (or a platform key) when no dedicated arbiter is used.
    pub arbiter: UncheckedAccount<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = buyer,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", buyer.key().as_ref(), listing_id.as_ref()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        init,
        payer = buyer,
        seeds = [b"vault", escrow.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = escrow,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = buyer_ata.mint == mint.key() @ EscrowError::MintMismatch,
        constraint = buyer_ata.owner == buyer.key() @ EscrowError::Unauthorized,
    )]
    pub buyer_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Shared context for both `release` and `refund`. The `recipient_ata` is the
/// seller's token account for release, or the buyer's for refund — validated by
/// the instruction logic, not by a fixed `has_one`.
#[derive(Accounts)]
pub struct Resolve<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        has_one = buyer @ EscrowError::Unauthorized,
        has_one = mint @ EscrowError::MintMismatch,
        seeds = [b"escrow", escrow.buyer.as_ref(), escrow.listing_id.as_ref()],
        bump = escrow.bump,
        close = buyer,
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: rent destination for the closed escrow + vault accounts. Bound by
    /// the escrow's `has_one = buyer`, so it must be the original depositor.
    #[account(mut)]
    pub buyer: SystemAccount<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = escrow,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = recipient_ata.mint == mint.key() @ EscrowError::MintMismatch,
    )]
    pub recipient_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub arbiter: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub listing_id: [u8; 16],
    pub state: EscrowState,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum EscrowState {
    Funded,
    Released,
    Refunded,
}

// ----------------------------------------------------------------------------
// Events
// ----------------------------------------------------------------------------

#[event]
pub struct EscrowFunded {
    pub escrow: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EscrowSettled {
    pub escrow: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub state: EscrowState,
}

// ----------------------------------------------------------------------------
// Errors
// ----------------------------------------------------------------------------

#[error_code]
pub enum EscrowError {
    #[msg("Escrow amount must be greater than zero")]
    ZeroAmount,
    #[msg("Buyer and seller cannot be the same account")]
    SelfDeal,
    #[msg("Escrow is not in the Funded state")]
    NotFunded,
    #[msg("Signer is not authorized for this action")]
    Unauthorized,
    #[msg("Token account mint does not match the escrow mint")]
    MintMismatch,
    #[msg("Recipient token account owner is not the expected party")]
    WrongRecipient,
}
