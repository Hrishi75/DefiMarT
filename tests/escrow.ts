import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";
import { Escrow } from "../target/types/escrow";

/**
 * Tests for the DefiMart escrow program.
 *
 * Requires a local validator and the Solana CLI (`anchor test` spins one up).
 * The 16-byte listing_id mirrors a marketplace listing UUID.
 */
describe("escrow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Escrow as Program<Escrow>;
  const connection = provider.connection;

  // Payer/buyer is the provider wallet; seller + arbiter are fresh keypairs.
  const buyer = (provider.wallet as anchor.Wallet).payer;
  const seller = Keypair.generate();
  const arbiter = Keypair.generate();

  let mint: PublicKey;
  let buyerAta: PublicKey;
  let sellerAta: PublicKey;

  const AMOUNT = 1_000_000n; // 1 token at 6 decimals (USDC-like)
  const DECIMALS = 6;

  // Helper: derive escrow + vault PDAs for a given listing id.
  function pdas(listingId: Uint8Array, buyerKey: PublicKey) {
    const [escrow] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), buyerKey.toBuffer(), Buffer.from(listingId)],
      program.programId
    );
    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), escrow.toBuffer()],
      program.programId
    );
    return { escrow, vault };
  }

  function randomListingId(): Uint8Array {
    return Uint8Array.from(
      Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
    );
  }

  before(async () => {
    // Fund seller + arbiter for rent/fees.
    for (const kp of [seller, arbiter]) {
      const sig = await connection.requestAirdrop(
        kp.publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(sig);
    }

    mint = await createMint(
      connection,
      buyer,
      buyer.publicKey,
      null,
      DECIMALS
    );

    buyerAta = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        buyer,
        mint,
        buyer.publicKey
      )
    ).address;

    sellerAta = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        buyer,
        mint,
        seller.publicKey
      )
    ).address;

    // Give the buyer plenty of tokens to fund escrows.
    await mintTo(connection, buyer, mint, buyerAta, buyer, 100_000_000);
  });

  it("initializes and releases to the seller", async () => {
    const listingId = randomListingId();
    const { escrow, vault } = pdas(listingId, buyer.publicKey);

    await program.methods
      .initialize([...listingId], new anchor.BN(AMOUNT.toString()))
      .accounts({
        buyer: buyer.publicKey,
        seller: seller.publicKey,
        arbiter: arbiter.publicKey,
        mint,
        buyerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const vaultAcc = await getAccount(connection, vault);
    assert.equal(vaultAcc.amount.toString(), AMOUNT.toString());

    const escrowAcc = await program.account.escrow.fetch(escrow);
    assert.deepEqual(escrowAcc.state, { funded: {} });

    const sellerBefore = (await getAccount(connection, sellerAta)).amount;

    // Buyer confirms receipt -> release.
    await program.methods
      .release()
      .accounts({
        signer: buyer.publicKey,
        escrow,
        buyer: buyer.publicKey,
        mint,
        vault,
        recipientAta: sellerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const sellerAfter = (await getAccount(connection, sellerAta)).amount;
    assert.equal((sellerAfter - sellerBefore).toString(), AMOUNT.toString());

    // Escrow account closed (rent returned to buyer).
    const closed = await connection.getAccountInfo(escrow);
    assert.isNull(closed);
  });

  it("refunds the buyer when the seller cancels", async () => {
    const listingId = randomListingId();
    const { escrow, vault } = pdas(listingId, buyer.publicKey);

    await program.methods
      .initialize([...listingId], new anchor.BN(AMOUNT.toString()))
      .accounts({
        buyer: buyer.publicKey,
        seller: seller.publicKey,
        arbiter: arbiter.publicKey,
        mint,
        buyerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const buyerBefore = (await getAccount(connection, buyerAta)).amount;

    // Seller cancels -> refund.
    await program.methods
      .refund()
      .accounts({
        signer: seller.publicKey,
        escrow,
        buyer: buyer.publicKey,
        mint,
        vault,
        recipientAta: buyerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([seller])
      .rpc();

    const buyerAfter = (await getAccount(connection, buyerAta)).amount;
    assert.equal((buyerAfter - buyerBefore).toString(), AMOUNT.toString());
  });

  it("rejects release from an unauthorized signer", async () => {
    const listingId = randomListingId();
    const { escrow, vault } = pdas(listingId, buyer.publicKey);

    await program.methods
      .initialize([...listingId], new anchor.BN(AMOUNT.toString()))
      .accounts({
        buyer: buyer.publicKey,
        seller: seller.publicKey,
        arbiter: arbiter.publicKey,
        mint,
        buyerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Seller is not allowed to release (only buyer or arbiter).
    let failed = false;
    try {
      await program.methods
        .release()
        .accounts({
          signer: seller.publicKey,
          escrow,
          buyer: buyer.publicKey,
          mint,
          vault,
          recipientAta: sellerAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([seller])
        .rpc();
    } catch (_e) {
      failed = true;
    }
    assert.isTrue(failed, "release by seller should have failed");

    // Clean up: arbiter refunds so the vault doesn't leak.
    await program.methods
      .refund()
      .accounts({
        signer: arbiter.publicKey,
        escrow,
        buyer: buyer.publicKey,
        mint,
        vault,
        recipientAta: buyerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([arbiter])
      .rpc();
  });
});
