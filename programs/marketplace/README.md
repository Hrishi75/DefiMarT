# DefiMart Marketplace Program

On-chain listing registry for DefiMart, written in Rust with the
[Anchor](https://www.anchor-lang.com/) framework.

Mirrors the off-chain `listings` table (Supabase) with an authoritative on-chain
record, so a listing's **seller, price, currency, and remaining quantity** can be
trusted without relying on the backend. Pairs with the `escrow` program: the
buyer escrows funds, the seller ships, then the sale is recorded here and the
quantity is decremented.

## Config (single PDA)

A `Marketplace` config account at seed `["marketplace"]` holds:

- `admin` — may update fee/recipient
- `fee_recipient` — where platform fees are paid
- `fee_bps` — platform fee in basis points, capped at **1000 (10%)**
- `listing_count` — running total of listings created

## Instructions

| Instruction       | Signer | Effect                                              |
|-------------------|--------|-----------------------------------------------------|
| `initialize`      | admin  | One-time setup of the config PDA.                   |
| `update_config`   | admin  | Change `fee_bps` / `fee_recipient`.                 |
| `create_listing`  | seller | Create a listing record (`Active`).                 |
| `update_price`    | seller | Change the price of an active listing.              |
| `cancel_listing`  | seller | Mark an active listing `Cancelled`.                 |
| `record_sale`     | seller | Decrement quantity; flips to `Sold` at zero.        |

## PDAs

- **Config:** `["marketplace"]`
- **Listing:** `["listing", seller, listing_id]` — `listing_id` is the 16-byte
  marketplace listing UUID.

## Build / test

Part of the workspace `Anchor.toml`. Requires the Rust toolchain, the **Solana
CLI**, and Anchor 0.30.1.

```bash
anchor keys sync   # replace placeholder program ids
anchor build
anchor test
```

> The declared program id in `lib.rs` / `Anchor.toml`
> (`Cy8a…KpUb`) is a placeholder — run `anchor keys sync` before the first build.

## Next steps

- Tests for create/update/cancel/record_sale + fee-cap and auth guards.
- Optional CPI from `escrow.release` to `record_sale` for an atomic
  settle-and-decrement.
- Wire the frontend (`/api/listings`) to create the on-chain record alongside
  the Supabase row.
