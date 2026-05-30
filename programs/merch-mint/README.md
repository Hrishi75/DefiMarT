# DefiMart Merch Mint Program

Organizer merch NFT minting for DefiMart, written in Rust with the
[Anchor](https://www.anchor-lang.com/) framework. Performs CPI into the
**Metaplex Token Metadata** program via `anchor_spl::metadata`.

Lets an event organizer mint **verified merch NFTs** into the event's Metaplex
collection. Pairs with the `event-registry` program: an event's
`collection_mint` is the collection these NFTs belong to, so a buyer can confirm
a piece of merch is an official, verified drop.

## Instructions

| Instruction              | Signer               | Effect                                                        |
|--------------------------|----------------------|--------------------------------------------------------------|
| `mint_merch`             | organizer            | Mint a 1/1 NFT (metadata + master edition), collection unverified. |
| `verify_collection_item` | collection authority | Verify the NFT as a genuine member of the event collection.  |

## How it works

1. `mint_merch` creates a new mint (0 decimals), mints 1 to the recipient ATA,
   then CPIs `create_metadata_accounts_v3` + `create_master_edition_v3`
   (`max_supply = 0` ⇒ a true unique 1/1). The metadata's `collection` field is
   set to the event `collection_mint`, `verified = false`.
2. `verify_collection_item` CPIs `verify_sized_collection_item`, signed by the
   collection's update authority, flipping the item to verified.

> Assumes a **sized** collection (created with `collection_details`). For an
> unsized collection, swap `verify_sized_collection_item` for `verify_collection`.

## Accounts of note

- `metadata` / `master_edition` — PDAs created by the token metadata program via
  CPI (passed as `mut` unchecked accounts).
- `collection_mint` — the event collection from `event-registry`.

## Build / test

Part of the workspace `Anchor.toml`. Requires the Rust toolchain, the **Solana
CLI**, and Anchor 0.30.1.

```bash
anchor keys sync   # replace placeholder program ids
anchor build       # REQUIRED: confirms the Metaplex metadata CPI signatures
anchor test
```

> **Unverified build.** The declared program id in `lib.rs` / `Anchor.toml`
> (`MrCh…9aWc`) is a placeholder. This program uses Metaplex CPI and has not yet
> been compiled here — run `anchor build` and fix any signature drift before
> relying on it.

## Next steps

- Create the event collection NFT (parent) — either here or off-chain — and
  store its mint in `event-registry`'s `collection_mint`.
- Tests for mint + verify against a local validator with the Token Metadata
  program loaded.
- Wire the organizer dashboard to mint official drops.
