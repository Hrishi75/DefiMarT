//! DefiMart on-chain event provenance registry.
//!
//! Makes event provenance verifiable on-chain instead of a Supabase boolean
//! (`events.on_chain_verified`). An organizer registers an event; a platform
//! authority then verifies it. Marketplace merch references the event PDA, so
//! buyers can confirm a drop ties back to a real, platform-verified source.
//!
//! Flow:
//!   initialize        -> set the platform verifier authority (one-time)
//!   register_event    -> organizer creates an Event (verified = false)
//!   verify_event      -> platform authority flips verified = true
//!   revoke_event      -> platform authority flips verified = false
//!   set_collection    -> organizer attaches the on-chain merch collection mint

use anchor_lang::prelude::*;

// Placeholder program id (valid base58). Run `anchor keys sync` before the
// first build to replace it with your generated keypair's address.
declare_id!("EvRegMArT9bGq5pYwH3xTn2cVfK8sJ4dLzQ6mNpR7aBc");

const MAX_SLUG_LEN: usize = 48;
const MAX_NAME_LEN: usize = 96;

#[program]
pub mod event_registry {
    use super::*;

    /// One-time setup. Records the platform authority allowed to verify events.
    pub fn initialize(ctx: Context<InitializeRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.authority = ctx.accounts.authority.key();
        registry.event_count = 0;
        registry.bump = ctx.bumps.registry;
        Ok(())
    }

    /// Transfer the platform verifier authority to a new key. Authority only.
    pub fn set_authority(ctx: Context<UpdateRegistry>, new_authority: Pubkey) -> Result<()> {
        ctx.accounts.registry.authority = new_authority;
        Ok(())
    }

    /// Register a new event. Anyone may register as an organizer; the event
    /// starts unverified until the platform authority verifies it.
    ///
    /// `slug` is the off-chain event slug, used as the PDA seed so each event
    /// maps to one account.
    pub fn register_event(
        ctx: Context<RegisterEvent>,
        slug: String,
        name: String,
    ) -> Result<()> {
        require!(
            !slug.is_empty() && slug.len() <= MAX_SLUG_LEN,
            EventError::InvalidSlug
        );
        require!(
            !name.is_empty() && name.len() <= MAX_NAME_LEN,
            EventError::InvalidName
        );

        let event = &mut ctx.accounts.event;
        event.organizer = ctx.accounts.organizer.key();
        event.slug = slug;
        event.name = name;
        event.verified = false;
        event.collection_mint = Pubkey::default();
        event.bump = ctx.bumps.event;

        let registry = &mut ctx.accounts.registry;
        registry.event_count = registry.event_count.saturating_add(1);

        emit!(EventRegistered {
            event: event.key(),
            organizer: event.organizer,
            slug: event.slug.clone(),
        });
        Ok(())
    }

    /// Attach the on-chain merch collection mint to an event. Organizer only.
    /// Lets merch NFTs be tied to a verifiable collection for this event.
    pub fn set_collection(ctx: Context<ManageEvent>, collection_mint: Pubkey) -> Result<()> {
        ctx.accounts.event.collection_mint = collection_mint;
        Ok(())
    }

    /// Mark an event as platform-verified. Platform authority only.
    pub fn verify_event(ctx: Context<VerifyEvent>) -> Result<()> {
        ctx.accounts.event.verified = true;
        emit!(EventVerified {
            event: ctx.accounts.event.key(),
            verified: true,
        });
        Ok(())
    }

    /// Revoke verification (e.g. fraud report). Platform authority only.
    pub fn revoke_event(ctx: Context<VerifyEvent>) -> Result<()> {
        ctx.accounts.event.verified = false;
        emit!(EventVerified {
            event: ctx.accounts.event.key(),
            verified: false,
        });
        Ok(())
    }
}

// ----------------------------------------------------------------------------
// Accounts
// ----------------------------------------------------------------------------

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Registry::INIT_SPACE,
        seeds = [b"registry"],
        bump,
    )]
    pub registry: Account<'info, Registry>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateRegistry<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        has_one = authority @ EventError::Unauthorized,
        seeds = [b"registry"],
        bump = registry.bump,
    )]
    pub registry: Account<'info, Registry>,
}

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct RegisterEvent<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry.bump,
    )]
    pub registry: Account<'info, Registry>,

    #[account(
        init,
        payer = organizer,
        space = 8 + Event::INIT_SPACE,
        seeds = [b"event", slug.as_bytes()],
        bump,
    )]
    pub event: Account<'info, Event>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageEvent<'info> {
    pub organizer: Signer<'info>,

    #[account(
        mut,
        has_one = organizer @ EventError::Unauthorized,
        seeds = [b"event", event.slug.as_bytes()],
        bump = event.bump,
    )]
    pub event: Account<'info, Event>,
}

#[derive(Accounts)]
pub struct VerifyEvent<'info> {
    pub authority: Signer<'info>,

    #[account(
        seeds = [b"registry"],
        bump = registry.bump,
        has_one = authority @ EventError::Unauthorized,
    )]
    pub registry: Account<'info, Registry>,

    #[account(
        mut,
        seeds = [b"event", event.slug.as_bytes()],
        bump = event.bump,
    )]
    pub event: Account<'info, Event>,
}

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct Registry {
    pub authority: Pubkey,
    pub event_count: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Event {
    pub organizer: Pubkey,
    #[max_len(48)]
    pub slug: String,
    #[max_len(96)]
    pub name: String,
    pub verified: bool,
    pub collection_mint: Pubkey,
    pub bump: u8,
}

// ----------------------------------------------------------------------------
// Events
// ----------------------------------------------------------------------------

#[event]
pub struct EventRegistered {
    pub event: Pubkey,
    pub organizer: Pubkey,
    pub slug: String,
}

#[event]
pub struct EventVerified {
    pub event: Pubkey,
    pub verified: bool,
}

// ----------------------------------------------------------------------------
// Errors
// ----------------------------------------------------------------------------

#[error_code]
pub enum EventError {
    #[msg("Slug must be 1..=48 bytes")]
    InvalidSlug,
    #[msg("Name must be 1..=96 bytes")]
    InvalidName,
    #[msg("Signer is not authorized for this action")]
    Unauthorized,
}
