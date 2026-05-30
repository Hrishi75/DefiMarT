# DefiMart Escrow Program

Trustless marketplace escrow for DefiMart, written in Rust with the
[Anchor](https://www.anchor-lang.com/) framework.

Replaces the custodial escrow keypair (`MARKETPLACE_ESCROW_PRIVATE_KEY` in the
Next.js backend) with a **program-derived vault**. Payment funds are locked in a
PDA-owned token account that no single private key controls — they can only move
according to the program rules.

## Scope (v1)

SPL-token payment escrow (USDC / PYUSD / EURC). Native SOL escrow and on-chain
NFT custody are planned follow-ups (today the off-chain server still handles NFT
custody — see `src/lib/solana/escrow.ts`).

## Instructions

| Instruction  | Signer            | Effect                                              |
|--------------|-------------------|-----------------------------------------------------|
| `initialize` | buyer             | Locks `amount` of `mint` into the vault (`Funded`). |
| `release`    | buyer or arbiter  | Vault → seller, closes accounts (`Released`).       |
| `refund`     | seller or arbiter | Vault → buyer, closes accounts (`Refunded`).        |

## PDAs

- **Escrow state:** `["escrow", buyer, listing_id]` — `listing_id` is the
  16-byte marketplace listing UUID.
- **Vault (token account):** `["vault", escrow]`, authority = escrow PDA.

## Accounts model

- Funds release only to the **seller's** token account (`release`) or back to the
  **buyer's** (`refund`); the recipient owner is checked on-chain.
- `arbiter` enables dispute resolution. Pass the seller (or a platform key) when
  no dedicated arbiter is needed.

## Build / test

Requires the Rust toolchain, the **Solana CLI**, and Anchor 0.30.1.

```bash
# 1. install solana CLI if missing (provides cargo-build-sbf + local validator)
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# 2. generate a real program keypair and sync the declared id
anchor keys sync

# 3. build the BPF program
anchor build

# 4. install JS test deps (kept separate from the Next.js app deps)
npm i -D @coral-xyz/anchor @solana/spl-token chai ts-mocha @types/mocha @types/chai

# 5. run tests against a local validator
anchor test
```

> The declared program id in `lib.rs` / `Anchor.toml` is the Anchor placeholder
> (`Fg6P…FsLnS`). Run `anchor keys sync` before the first build to replace it
> with your generated keypair's address.

## Next steps

- Wire the frontend (`src/hooks/useTransaction.ts`, `/api/listings/[id]/escrow`)
  to call this program instead of the custodial keypair.
- Add native-SOL escrow instructions.
- Move NFT custody on-chain (atomic funds + NFT swap).
