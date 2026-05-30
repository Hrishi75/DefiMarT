//! DefiMart organizer merch NFT minting.
//!
//! Lets an event organizer mint verified merch NFTs into the event's Metaplex
//! collection. Pairs with the `event-registry` program: an event's
//! `collection_mint` is the collection these NFTs belong to, so a buyer can
//! confirm a piece of merch is an official, verified drop.
//!
//! Flow:
//!   mint_merch             -> create a 1/1 NFT (metadata + master edition),
//!                             collection set but unverified
//!   verify_collection_item -> collection authority verifies the NFT as a
//!                             genuine member of the event collection
//!
//! Note: this program performs CPI into the Metaplex Token Metadata program via
//! `anchor_spl::metadata`. It targets anchor-spl 0.30.1 conventions and must be
//! compiled with `anchor build` to confirm the metadata CPI signatures.

use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, verify_sized_collection_item,
        mpl_token_metadata::types::{Collection, DataV2},
        CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata,
        VerifySizedCollectionItem,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

// Placeholder program id (valid base58). Run `anchor keys sync` before the
// first build to replace it with your generated keypair's address.
declare_id!("MrChMnTdefiMArT5kQwR8nVbY2tGp7sLx3JhD6fZ9aWc");

const MAX_NAME_LEN: usize = 32;
const MAX_SYMBOL_LEN: usize = 10;
const MAX_URI_LEN: usize = 200;

#[program]
pub mod merch_mint {
    use super::*;

    /// Mint a single 1/1 merch NFT to `recipient`, with on-chain metadata and a
    /// master edition. The NFT references the event `collection_mint` (set but
    /// not yet verified — call `verify_collection_item` next).
    pub fn mint_merch(
        ctx: Context<MintMerch>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        require!(
            !name.is_empty() && name.len() <= MAX_NAME_LEN,
            MerchError::InvalidMetadata
        );
        require!(symbol.len() <= MAX_SYMBOL_LEN, MerchError::InvalidMetadata);
        require!(
            !uri.is_empty() && uri.len() <= MAX_URI_LEN,
            MerchError::InvalidMetadata
        );

        // Mint exactly 1 token (NFTs have 0 decimals, supply 1).
        mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.recipient_ata.to_account_info(),
                    authority: ctx.accounts.organizer.to_account_info(),
                },
            ),
            1,
        )?;

        // Reference the event collection (unverified until verify step).
        let data = DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: Some(Collection {
                verified: false,
                key: ctx.accounts.collection_mint.key(),
            }),
            uses: None,
        };

        create_metadata_accounts_v3(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    mint_authority: ctx.accounts.organizer.to_account_info(),
                    payer: ctx.accounts.organizer.to_account_info(),
                    update_authority: ctx.accounts.organizer.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            data,
            true,  // is_mutable
            true,  // update_authority_is_signer
            None,  // collection_details (None = not a collection parent)
        )?;

        // Master edition with max_supply 0 => a true unique 1/1 NFT.
        create_master_edition_v3(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMasterEditionV3 {
                    edition: ctx.accounts.master_edition.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    update_authority: ctx.accounts.organizer.to_account_info(),
                    mint_authority: ctx.accounts.organizer.to_account_info(),
                    payer: ctx.accounts.organizer.to_account_info(),
                    metadata: ctx.accounts.metadata.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            Some(0),
        )?;

        emit!(MerchMinted {
            mint: ctx.accounts.mint.key(),
            collection: ctx.accounts.collection_mint.key(),
            recipient: ctx.accounts.recipient_ata.owner,
        });
        Ok(())
    }

    /// Verify a minted NFT as a genuine member of the event's sized collection.
    /// Must be signed by the collection's update authority (the organizer who
    /// owns the event collection).
    pub fn verify_collection_item(ctx: Context<VerifyItem>) -> Result<()> {
        verify_sized_collection_item(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                VerifySizedCollectionItem {
                    metadata: ctx.accounts.metadata.to_account_info(),
                    collection_authority: ctx.accounts.collection_authority.to_account_info(),
                    payer: ctx.accounts.collection_authority.to_account_info(),
                    collection_mint: ctx.accounts.collection_mint.to_account_info(),
                    collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                    collection_master_edition: ctx
                        .accounts
                        .collection_master_edition
                        .to_account_info(),
                },
            ),
            None,
        )?;

        emit!(MerchVerified {
            mint: ctx.accounts.mint.key(),
            collection: ctx.accounts.collection_mint.key(),
        });
        Ok(())
    }
}

// ----------------------------------------------------------------------------
// Accounts
// ----------------------------------------------------------------------------

#[derive(Accounts)]
pub struct MintMerch<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    /// The new NFT mint. 0 decimals, organizer is the mint/freeze authority.
    #[account(
        init,
        payer = organizer,
        mint::decimals = 0,
        mint::authority = organizer,
        mint::freeze_authority = organizer,
    )]
    pub mint: Account<'info, Mint>,

    /// Destination token account for the minted NFT.
    #[account(
        init,
        payer = organizer,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub recipient_ata: Account<'info, TokenAccount>,

    /// CHECK: token owner for the minted NFT; only used to derive the ATA.
    pub recipient: UncheckedAccount<'info>,

    /// CHECK: the event collection mint this merch belongs to (from
    /// event-registry's `collection_mint`). Read-only here.
    pub collection_mint: UncheckedAccount<'info>,

    /// CHECK: metadata PDA, created via CPI by the token metadata program.
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: master edition PDA, created via CPI by the token metadata program.
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct VerifyItem<'info> {
    #[account(mut)]
    pub collection_authority: Signer<'info>,

    /// CHECK: the minted NFT mint, referenced for the emitted event.
    pub mint: UncheckedAccount<'info>,

    /// CHECK: metadata PDA of the item being verified (mutated by CPI).
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: the event collection mint.
    pub collection_mint: UncheckedAccount<'info>,

    /// CHECK: collection metadata PDA (mutated by CPI to bump verified size).
    #[account(mut)]
    pub collection_metadata: UncheckedAccount<'info>,

    /// CHECK: collection master edition PDA.
    pub collection_master_edition: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
}

// ----------------------------------------------------------------------------
// Events
// ----------------------------------------------------------------------------

#[event]
pub struct MerchMinted {
    pub mint: Pubkey,
    pub collection: Pubkey,
    pub recipient: Pubkey,
}

#[event]
pub struct MerchVerified {
    pub mint: Pubkey,
    pub collection: Pubkey,
}

// ----------------------------------------------------------------------------
// Errors
// ----------------------------------------------------------------------------

#[error_code]
pub enum MerchError {
    #[msg("NFT metadata fields are empty or exceed length limits")]
    InvalidMetadata,
}
