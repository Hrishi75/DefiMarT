# DefiMarT

**A social marketplace for Web3 event culture.**

People go to conferences, hackathons, and community events and pick up merch and
collectibles — T-shirts, badges, limited-edition drops, digital items, and swag.
Once the event ends, all of that loses its home: there's nowhere to show it off,
prove it's real, trade it, or resell it. And the people who couldn't attend
(because of cost, distance, or timing) miss out on both the experience and the
collectibles entirely.

DefiMarT gives all of that a permanent home. You connect a wallet, build a
profile, showcase what you've collected, share your event journey on a social
feed, and buy or sell items — physical or digital — directly with other people.
Because ownership and provenance live on-chain, items can be **provably
authentic** and impossible to counterfeit, and payments settle peer-to-peer with
no platform holding your money.

---

## What you can do

- **Sign in with a wallet** — no email/password. Your identity and funds stay
  yours (Phantom, Backpack, and other major wallets).
- **Build a profile** — a personal trophy case for the merch and collectibles
  you've earned at events.
- **List & sell** — list physical or digital items straight from your profile.
- **Buy with crypto or stablecoins** — pay in SOL, or in stablecoins like
  **USDC, PYUSD, and EURC** so prices stay stable.
- **Trade safely with escrow** — funds are locked in a trustless on-chain vault
  and only released to the seller once the buyer confirms receipt.
- **Be social** — a real-time feed, posts, comments, likes, follows, direct
  messages, reviews, and reputation.
- **Verify authenticity** — event organizers register events and mint official
  merch as verified NFT collections, so buyers can confirm a drop is genuine.

## Who it's for

- **Collectors / attendees** — showcase, post, buy, sell, and trade.
- **Event organizers** — register events, run limited merch drops, mint verified
  collectibles, and showcase official collections.
- **Creators** — supply merchandise for distribution or resale.

---

## Tech stack

DefiMarT is a Web3-native app. The current implementation is built on **Solana**.

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion |
| Wallet / auth | Solana Wallet Adapter (Phantom, Backpack), signature-based sessions |
| On-chain | Anchor 0.30.1 programs (escrow, marketplace, event registry, merch mint) |
| Collectibles | Metaplex Token Metadata (verified NFT collections) |
| Payments | Native SOL + SPL stablecoins (USDC, PYUSD, EURC) |
| Off-chain data | Supabase (PostgreSQL, auth nonces, Storage) |
| Network | Solana **Devnet** |

For how these pieces fit together, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

---

## Getting started

### Prerequisites

- Node.js 18+
- A Solana wallet browser extension (Phantom / Backpack) set to **Devnet**
- For the on-chain programs: Rust, the Solana CLI, and Anchor `0.30.1`

### Run the web app

```bash
npm install
```

Create `.env.local` with your Supabase credentials and any RPC overrides:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
# optional: a dedicated Devnet RPC (e.g. QuickNode) instead of the public endpoint
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

### Database

The Supabase schema and seed data live in [`supabase/`](./supabase) — apply
`schema.sql` and `seed.sql` to your Supabase project.

### On-chain programs

The Anchor programs live in [`programs/`](./programs):

```bash
anchor keys sync   # replace placeholder program ids with your keypairs
anchor build
anchor test
```

---

## Project structure

```
programs/            Anchor (Rust) on-chain programs
  escrow/            Trustless PDA escrow vault for payments
  marketplace/       On-chain listing registry + platform fee config
  event-registry/    On-chain event provenance / verification
  merch-mint/        Verified merch NFT minting into event collections
src/
  app/               Next.js routes (pages + API route handlers)
  components/        UI components (marketplace, feed, messages, wallet, dm)
  sections/          Landing-page sections
  contexts/          AuthContext (wallet session state)
  hooks/             useSupabase, useTransaction
  lib/
    solana/          RPC config, escrow, Metaplex, transaction builders
    supabase/        Client/server/admin + typed query modules
    auth.ts          Session extraction from the auth cookie
  types/             Shared TypeScript types
supabase/            schema.sql + seed.sql
tests/               Anchor program tests
```

---

## Vision

The long-term goal is to turn event participation into living, verifiable, and
socially shareable digital culture: on-chain proof of attendance, peer-to-peer
trading, gamified collectible levels, reputation that follows you across the
community, and cross-event collectibles — bridging real-world experiences with
on-chain ownership.

## License

See [LICENSE](./LICENSE).
