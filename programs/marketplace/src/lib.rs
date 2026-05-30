//! DefiMart on-chain marketplace listing registry.
//!
//! Mirrors the off-chain `listings` table (Supabase) with an authoritative
//! on-chain record so a listing's seller, price, currency, and remaining
//! quantity can be trusted without the backend. Pairs with the `escrow`
//! program: a buyer escrows funds, the seller ships, then the sale is recorded
//! here and quantity decremented.
//!
//! A single `Marketplace` config PDA holds the platform fee (basis points) and
//! the fee recipient, set by an admin. Listing PDAs are derived per
//! (seller, listing_id) so each marketplace listing UUID maps to one account.

use anchor_lang::prelude::*;

// Placeholder program id (valid base58). Run `anchor keys sync` before the
// first build to replace it with your generated keypair's address.
declare_id!("Cy8aF5sBkY7eV7Zrz1KdT8Rd4kHQ7T9aDz8Yp4xKpUb");

/// Hard cap on the platform fee: 10% (1000 bps). Guards against fat-finger or
/// malicious admin setting an absurd fee.
const MAX_FEE_BPS: u16 = 1_000;

#[program]
pub mod marketplace {
    use super::*;

    /// One-time setup of the marketplace config (fee + recipient + admin).
    pub fn initialize(
        ctx: Context<InitializeMarketplace>,
        fee_bps: u16,
        fee_recipient: Pubkey,
    ) -> Result<()> {
        require!(fee_bps <= MAX_FEE_BPS, MarketplaceError::FeeTooHigh);

        let market = &mut ctx.accounts.marketplace;
        market.admin = ctx.accounts.admin.key();
        market.fee_recipient = fee_recipient;
        market.fee_bps = fee_bps;
        market.listing_count = 0;
        market.bump = ctx.bumps.marketplace;
        Ok(())
    }

    /// Update the platform fee and/or recipient. Admin only.
    pub fn update_config(
        ctx: Context<UpdateConfig>,
        fee_bps: u16,
        fee_recipient: Pubkey,
    ) -> Result<()> {
        require!(fee_bps <= MAX_FEE_BPS, MarketplaceError::FeeTooHigh);
        let market = &mut ctx.accounts.marketplace;
        market.fee_bps = fee_bps;
        market.fee_recipient = fee_recipient;
        Ok(())
    }

    /// Create an on-chain listing record. `listing_id` is the 16-byte UUID of
    /// the Supabase listing.
    pub fn create_listing(
        ctx: Context<CreateListing>,
        listing_id: [u8; 16],
        price: u64,
        currency: Currency,
        quantity: u32,
    ) -> Result<()> {
        require!(price > 0, MarketplaceError::ZeroPrice);
        require!(quantity > 0, MarketplaceError::ZeroQuantity);

        let listing = &mut ctx.accounts.listing;
        listing.seller = ctx.accounts.seller.key();
        listing.listing_id = listing_id;
        listing.price = price;
        listing.currency = currency;
        listing.quantity = quantity;
        listing.quantity_sold = 0;
        listing.status = ListingStatus::Active;
        listing.bump = ctx.bumps.listing;

        let market = &mut ctx.accounts.marketplace;
        market.listing_count = market.listing_count.saturating_add(1);

        emit!(ListingCreated {
            listing: listing.key(),
            seller: listing.seller,
            price,
            quantity,
        });
        Ok(())
    }

    /// Update the price of an active listing. Seller only.
    pub fn update_price(ctx: Context<ManageListing>, new_price: u64) -> Result<()> {
        require!(new_price > 0, MarketplaceError::ZeroPrice);
        let listing = &mut ctx.accounts.listing;
        require!(
            listing.status == ListingStatus::Active,
            MarketplaceError::NotActive
        );
        listing.price = new_price;
        Ok(())
    }

    /// Cancel an active listing. Seller only.
    pub fn cancel_listing(ctx: Context<ManageListing>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(
            listing.status == ListingStatus::Active,
            MarketplaceError::NotActive
        );
        listing.status = ListingStatus::Cancelled;
        emit!(ListingClosed {
            listing: listing.key(),
            status: ListingStatus::Cancelled,
        });
        Ok(())
    }

    /// Record the sale of `quantity` units. Decrements remaining quantity and
    /// flips the listing to `Sold` when it reaches zero. Seller only.
    pub fn record_sale(ctx: Context<ManageListing>, quantity: u32) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(
            listing.status == ListingStatus::Active,
            MarketplaceError::NotActive
        );
        require!(quantity > 0, MarketplaceError::ZeroQuantity);

        let remaining = listing
            .quantity
            .checked_sub(listing.quantity_sold)
            .ok_or(MarketplaceError::Overflow)?;
        require!(quantity <= remaining, MarketplaceError::InsufficientQuantity);

        listing.quantity_sold = listing
            .quantity_sold
            .checked_add(quantity)
            .ok_or(MarketplaceError::Overflow)?;

        if listing.quantity_sold == listing.quantity {
            listing.status = ListingStatus::Sold;
            emit!(ListingClosed {
                listing: listing.key(),
                status: ListingStatus::Sold,
            });
        }
        Ok(())
    }
}

// ----------------------------------------------------------------------------
// Accounts
// ----------------------------------------------------------------------------

#[derive(Accounts)]
pub struct InitializeMarketplace<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + Marketplace::INIT_SPACE,
        seeds = [b"marketplace"],
        bump,
    )]
    pub marketplace: Account<'info, Marketplace>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    pub admin: Signer<'info>,

    #[account(
        mut,
        has_one = admin @ MarketplaceError::Unauthorized,
        seeds = [b"marketplace"],
        bump = marketplace.bump,
    )]
    pub marketplace: Account<'info, Marketplace>,
}

#[derive(Accounts)]
#[instruction(listing_id: [u8; 16])]
pub struct CreateListing<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"marketplace"],
        bump = marketplace.bump,
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        init,
        payer = seller,
        space = 8 + Listing::INIT_SPACE,
        seeds = [b"listing", seller.key().as_ref(), listing_id.as_ref()],
        bump,
    )]
    pub listing: Account<'info, Listing>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageListing<'info> {
    pub seller: Signer<'info>,

    #[account(
        mut,
        has_one = seller @ MarketplaceError::Unauthorized,
        seeds = [b"listing", listing.seller.as_ref(), listing.listing_id.as_ref()],
        bump = listing.bump,
    )]
    pub listing: Account<'info, Listing>,
}

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct Marketplace {
    pub admin: Pubkey,
    pub fee_recipient: Pubkey,
    pub fee_bps: u16,
    pub listing_count: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Listing {
    pub seller: Pubkey,
    pub listing_id: [u8; 16],
    pub price: u64,
    pub currency: Currency,
    pub quantity: u32,
    pub quantity_sold: u32,
    pub status: ListingStatus,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Currency {
    Sol,
    Usdc,
    Pyusd,
    Eurc,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ListingStatus {
    Active,
    Sold,
    Cancelled,
}

// ----------------------------------------------------------------------------
// Events
// ----------------------------------------------------------------------------

#[event]
pub struct ListingCreated {
    pub listing: Pubkey,
    pub seller: Pubkey,
    pub price: u64,
    pub quantity: u32,
}

#[event]
pub struct ListingClosed {
    pub listing: Pubkey,
    pub status: ListingStatus,
}

// ----------------------------------------------------------------------------
// Errors
// ----------------------------------------------------------------------------

#[error_code]
pub enum MarketplaceError {
    #[msg("Fee exceeds the maximum allowed (10%)")]
    FeeTooHigh,
    #[msg("Price must be greater than zero")]
    ZeroPrice,
    #[msg("Quantity must be greater than zero")]
    ZeroQuantity,
    #[msg("Listing is not active")]
    NotActive,
    #[msg("Requested quantity exceeds remaining stock")]
    InsufficientQuantity,
    #[msg("Signer is not authorized for this action")]
    Unauthorized,
    #[msg("Arithmetic overflow")]
    Overflow,
}
