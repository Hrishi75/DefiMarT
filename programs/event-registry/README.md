# DefiMart Event Registry Program

On-chain event provenance for DefiMart, written in Rust with the
[Anchor](https://www.anchor-lang.com/) framework.

Makes event provenance **verifiable on-chain** instead of a Supabase boolean
(`events.on_chain_verified`). An organizer registers an event; the platform
authority then verifies it. Marketplace merch references the event PDA, so a
buyer can confirm a drop ties back to a real, platform-verified source.

## Roles

- **Organizer** — anyone; registers an event (starts unverified) and attaches a
  merch collection mint.
- **Platform authority** — single key stored in the `Registry` config; the only
  signer that can `verify_event` / `revoke_event`.

## Instructions

| Instruction      | Signer            | Effect                                         |
|------------------|-------------------|------------------------------------------------|
| `initialize`     | authority         | One-time setup of the registry config PDA.     |
| `set_authority`  | authority         | Transfer the platform verifier authority.      |
| `register_event` | organizer         | Create an `Event` (verified = false).          |
| `set_collection` | organizer         | Attach the on-chain merch collection mint.     |
| `verify_event`   | platform authority| Flip `verified = true`.                        |
| `revoke_event`   | platform authority| Flip `verified = false` (e.g. fraud report).   |

## PDAs

- **Registry config:** `["registry"]`
- **Event:** `["event", slug]` — `slug` is the off-chain event slug
  (max 48 bytes).

## Build / test

Part of the workspace `Anchor.toml`. Requires the Rust toolchain, the **Solana
CLI**, and Anchor 0.30.1.

```bash
anchor keys sync   # replace placeholder program ids
anchor build
anchor test
```

> The declared program id in `lib.rs` / `Anchor.toml`
> (`EvRe…7aBc`) is a placeholder — run `anchor keys sync` before the first build.

## Next steps

- Tests for register/verify/revoke + authority guards.
- Mint verified merch NFTs into the event's `collection_mint` (Metaplex CPI).
- Wire the frontend organizer dashboard + `/api/events` to register and verify
  on-chain alongside the Supabase row.
