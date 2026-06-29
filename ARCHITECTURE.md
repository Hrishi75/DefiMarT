# DefiMarT — Architecture

DefiMarT is a **hybrid Web3 application**: a Next.js app that combines an
off-chain database for fast, rich social data with on-chain programs for the
things that must be trustless — ownership, provenance, payments, and escrow.

The guiding principle is **"on-chain for trust, off-chain for speed."** Anything
where a user must not have to trust the platform (who owns a listing, who holds
the money mid-sale, whether an event/merch is genuine) is enforced by Solana
programs. Everything that just needs to be fast and queryable (feeds, profiles,
comments, messages, search) lives in Supabase, mirrored to chain where it
matters.

```
┌──────────────────────────────────────────────────────────────┐
│                        Client (browser)                        │
│  Next.js 14 App Router · React 18 · Tailwind · Framer Motion   │
│  Solana Wallet Adapter (Phantom / Backpack)                    │
└───────────────┬───────────────────────────┬───────────────────┘
                │ HTTP (cookie session)      │ signed transactions
                ▼                            ▼
┌───────────────────────────┐    ┌──────────────────────────────┐
│   Next.js API routes       │    │        Solana (Devnet)        │
│   (src/app/api/*)          │    │  Anchor programs:             │
│   - wallet auth (nonce)    │    │   • escrow                    │
│   - listings / tx / escrow │    │   • marketplace               │
│   - social (feed/dm/etc.)  │    │   • event_registry            │
└───────────┬────────────────┘    │   • merch_mint (Metaplex CPI) │
            │ service-role         └──────────────────────────────┘
            ▼
┌───────────────────────────┐
│   Supabase (PostgreSQL)    │
│   tables + auth_nonces +   │
│   Storage (images)         │
└───────────────────────────┘
```

---

## 1. Frontend

- **Next.js 14 App Router** under [`src/app`](./src/app). Routes include the
  landing page, `marketplace` (list / `[id]` detail / `create` / `[id]/edit`),
  `feed`, `profile/[id]`, `messages`, `notifications`, `orders`, `favorites`,
  `search`, and `docs`.
- **Components** in [`src/components`](./src/components) grouped by domain
  (`marketplace`, `feed`, `messages`, `dm`) plus shared primitives (wallet
  buttons, NFT gallery/cards, reviews, follow/favorite buttons, notifications).
- **State**: [`AuthContext`](./src/contexts/AuthContext.tsx) tracks the connected
  wallet and session; hooks [`useSupabase`](./src/hooks/useSupabase.ts) and
  [`useTransaction`](./src/hooks/useTransaction.ts) wrap data access and on-chain
  transaction lifecycles.
- **Wallet**: Solana Wallet Adapter provides connect/sign for Phantom, Backpack,
  and others.

---

## 2. Authentication (wallet-based)

There are no passwords. A user proves ownership of a wallet by signing a
challenge. The flow lives in [`src/app/api/auth`](./src/app/api/auth) and
[`src/lib/auth.ts`](./src/lib/auth.ts):

1. **`/api/auth/nonce`** — client requests a one-time nonce for its wallet
   address. The nonce is stored in the `auth_nonces` table.
2. **`/api/auth/verify`** — the wallet signs the nonce (tweetnacl / bs58
   verification server-side). On success the user record is upserted and a
   session is issued.
3. **Session** — a base64-encoded, expiring token is set as the
   `defimart-session` cookie. `getAuthUser()` decodes it on each API request and
   loads the user via the Supabase **admin (service-role)** client.

> The session is a signed/encoded cookie payload with an `exp` timestamp, not a
> Supabase Auth JWT — the app manages its own wallet-native sessions.

---

## 3. Off-chain data (Supabase / PostgreSQL)

Schema and seed live in [`supabase/`](./supabase). Core tables:

| Table | Purpose |
| --- | --- |
| `users` | Profiles keyed by wallet address |
| `events` | Events/organizers; carries `on_chain_verified`, collection mint |
| `listings` | Marketplace items (physical or digital), price + currency, qty |
| `transactions` | Purchase records, escrow state, on-chain signatures |
| `posts` / `comments` / `likes` | Social feed |
| `follows` | Social graph |
| `notifications` | User notifications |
| `auth_nonces` | One-time wallet login challenges |

Access is centralized in typed query modules under
[`src/lib/supabase/queries`](./src/lib/supabase/queries) (one per domain:
`listings`, `transactions`, `posts`, `comments`, `follows`, `favorites`,
`messages`, `notifications`, `reviews`, `search`, `users`, `events`).

Three Supabase clients are used deliberately:
- **client** ([`client.ts`](./src/lib/supabase/client.ts)) — browser, anon key.
- **server** ([`server.ts`](./src/lib/supabase/server.ts)) — SSR with cookies.
- **admin** ([`admin.ts`](./src/lib/supabase/admin.ts)) — service-role, used by
  API routes after the session cookie has authenticated the caller.

Images are stored in **Supabase Storage** (`*.supabase.co/storage/v1/object/public/**`
is whitelisted in `next.config.mjs`).

---

## 4. On-chain programs (Anchor 0.30.1)

Four programs in [`programs/`](./programs). Program IDs are configured in
[`Anchor.toml`](./Anchor.toml) for both localnet and devnet (placeholders until
`anchor keys sync`).

### `escrow` — trustless payments

The heart of safe peer-to-peer trading. Replaces any custodial escrow key with a
**program-derived vault** — no single private key ever controls funds.

- **`initialize(listing_id, amount)`** — buyer locks SPL tokens
  (USDC/PYUSD/EURC) into a PDA-owned token account. State → `Funded`.
- **`release`** — buyer (or arbiter) releases the vault to the seller.
  State → `Released`.
- **`refund`** — seller (or arbiter) refunds the buyer if the deal falls through.
  State → `Refunded`.

The escrow PDA is derived from `(buyer, listing_id)`, so each buyer↔listing pair
has a unique vault. The arbiter defaults to the seller but can be a dedicated
third party.

### `marketplace` — listing registry + fees

Mirrors the off-chain `listings` table with an authoritative on-chain record so a
listing's seller, price, currency, and remaining quantity can be trusted without
the backend.

- A single **`Marketplace` config PDA** holds the platform fee (basis points,
  capped at 10% / 1000 bps) and the fee recipient, set by an admin.
- **Listing PDAs** are derived per `(seller, listing_id)`; `listing_id` is the
  16-byte UUID of the Supabase listing. A sale records here and decrements
  quantity.

### `event-registry` — provenance

Makes event authenticity verifiable on-chain instead of a database boolean.

- **`register_event`** (organizer) → event created, `verified = false`.
- **`verify_event` / `revoke_event`** (platform authority) → flips verification.
- **`set_collection`** (organizer) → attaches the on-chain merch collection mint.

### `merch-mint` — verified collectibles

Lets an organizer mint official merch as **Metaplex** NFTs into the event's
collection (CPI into Token Metadata).

- **`mint_merch`** → creates a 1/1 NFT (metadata + master edition), collection set
  but unverified.
- **`verify_collection_item`** → the collection authority verifies the NFT as a
  genuine member of the event collection.

Together with `event-registry`, this gives a buyer a chain of trust: a verified
NFT belongs to a verified event collection that ties back to a real,
platform-verified organizer.

---

## 5. Payments & currencies

Configured in [`src/lib/solana/constants.ts`](./src/lib/solana/constants.ts).

| Currency | Type | Decimals |
| --- | --- | --- |
| SOL | Native | 9 |
| USDC | SPL stablecoin | 6 |
| PYUSD | SPL stablecoin (PayPal USD) | 6 |
| EURC | SPL stablecoin (Euro Coin) | 6 |

Stablecoins keep listing prices stable in fiat terms. Helpers handle
lamport/SOL and smallest-unit conversions, approximate USD valuation, and price
formatting. On-chain SPL payments flow through the `escrow` program; the app
builds transactions in [`src/lib/solana`](./src/lib/solana)
(`escrow.ts`, `metaplex.ts`, `transactions.ts`).

---

## 6. A purchase, end to end

1. Buyer opens a listing and chooses a currency.
2. Client builds an `escrow.initialize` transaction; the buyer signs it and SPL
   funds move into the PDA vault (state `Funded`). A `transactions` row is
   created via `/api/escrow` / `/api/transactions`.
3. Seller ships / delivers the item.
4. Buyer confirms receipt → `escrow.release` sends the vault to the seller
   (state `Released`); the marketplace listing quantity is decremented and the
   transaction row is updated.
5. If the deal fails, `escrow.refund` returns funds to the buyer
   (state `Refunded`). An arbiter can act if buyer/seller can't agree.
6. Buyer can leave a **review**, building the seller's reputation.

At no point does the platform custody the funds — the escrow PDA does.

---

## 7. API surface

Route handlers in [`src/app/api`](./src/app/api):

- **Auth**: `auth/nonce`, `auth/verify`, `auth/session`
- **Commerce**: `listings`, `listings/[id]`, `listings/[id]/escrow`, `escrow`,
  `transactions`, `transactions/[id]`, `reviews`
- **Collectibles**: `nft/metadata`, `nft/wallet`
- **Social**: `posts`, `posts/[id]/comments`, `posts/[id]/like`, `follows`,
  `favorites`, `messages`, `messages/[conversationId]`, `notifications`
- **Utility**: `search`, `users/profile`, `upload`, `waitlist`

Each handler authenticates via the session cookie (`getAuthUser`) and uses the
admin Supabase client for privileged writes.

---

## 8. Trust boundaries (summary)

| Concern | Source of truth | Why |
| --- | --- | --- |
| Identity | Wallet signature → session cookie | No passwords; user owns identity |
| Listing seller / price / qty | `marketplace` program (mirrored in DB) | Can't be forged by the backend |
| Funds during a sale | `escrow` PDA vault | No custodial key; trustless release/refund |
| Event authenticity | `event-registry` program | Verified by platform authority on-chain |
| Merch authenticity | `merch-mint` + Metaplex collection | Provably part of a verified event |
| Feed / profiles / messages / search | Supabase | Speed and rich queries; no trust needed |
