import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import bs58 from 'bs58';
import { SOLANA_RPC_ENDPOINT } from './constants';

/**
 * Load the marketplace escrow keypair from environment variable.
 * Server-only — never expose the private key to the client.
 */
export function getEscrowKeypair(): Keypair {
  const secretKeyBase58 = process.env.MARKETPLACE_ESCROW_PRIVATE_KEY;
  if (!secretKeyBase58) {
    throw new Error('MARKETPLACE_ESCROW_PRIVATE_KEY environment variable is not set');
  }
  const secretKey = bs58.decode(secretKeyBase58);
  return Keypair.fromSecretKey(secretKey);
}

/**
 * Get the escrow wallet's public key as a string.
 * Server-only.
 */
export function getEscrowPublicKeyString(): string {
  return getEscrowKeypair().publicKey.toBase58();
}

/**
 * Build a transaction for the seller to deposit their NFT into the escrow wallet.
 * Client-safe — does not require the escrow private key.
 *
 * The seller signs this transaction via their wallet adapter.
 */
export async function buildEscrowDepositTransaction(
  sellerPublicKey: PublicKey,
  escrowPublicKey: PublicKey,
  nftMintAddress: PublicKey
): Promise<Transaction> {
  const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

  const sellerAta = await getAssociatedTokenAddress(
    nftMintAddress, sellerPublicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const escrowAta = await getAssociatedTokenAddress(
    nftMintAddress, escrowPublicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction();

  // Create the escrow's ATA if it doesn't exist (seller pays rent ~0.002 SOL)
  try {
    await getAccount(connection, escrowAta, 'confirmed', TOKEN_PROGRAM_ID);
  } catch {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        sellerPublicKey, escrowAta, escrowPublicKey, nftMintAddress,
        TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Transfer 1 NFT (decimals=0) from seller to escrow
  transaction.add(
    createTransferCheckedInstruction(
      sellerAta,          // source
      nftMintAddress,     // mint
      escrowAta,          // destination
      sellerPublicKey,    // owner (signer)
      1,                  // amount (1 NFT)
      0,                  // decimals (NFTs have 0 decimals)
      [],                 // multi-signers
      TOKEN_PROGRAM_ID
    )
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = sellerPublicKey;

  return transaction;
}

/**
 * Transfer an NFT from the escrow wallet to the buyer.
 * Server-only — signs with the escrow keypair.
 */
export async function transferNFTFromEscrow(
  buyerPublicKey: PublicKey,
  nftMintAddress: PublicKey
): Promise<TransactionSignature> {
  const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
  const escrowKeypair = getEscrowKeypair();

  const escrowAta = await getAssociatedTokenAddress(
    nftMintAddress, escrowKeypair.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const buyerAta = await getAssociatedTokenAddress(
    nftMintAddress, buyerPublicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction();

  // Create buyer's ATA if it doesn't exist (escrow pays rent)
  try {
    await getAccount(connection, buyerAta, 'confirmed', TOKEN_PROGRAM_ID);
  } catch {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        escrowKeypair.publicKey, buyerAta, buyerPublicKey, nftMintAddress,
        TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Transfer 1 NFT from escrow to buyer
  transaction.add(
    createTransferCheckedInstruction(
      escrowAta,
      nftMintAddress,
      buyerAta,
      escrowKeypair.publicKey,
      1,
      0,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = escrowKeypair.publicKey;

  transaction.sign(escrowKeypair);

  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    { skipPreflight: false, preflightCommitment: 'confirmed' }
  );

  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Return an NFT from escrow back to the seller (for listing cancellation).
 * Server-only — signs with the escrow keypair.
 */
export async function returnNFTFromEscrow(
  sellerPublicKey: PublicKey,
  nftMintAddress: PublicKey
): Promise<TransactionSignature> {
  const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
  const escrowKeypair = getEscrowKeypair();

  const escrowAta = await getAssociatedTokenAddress(
    nftMintAddress, escrowKeypair.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const sellerAta = await getAssociatedTokenAddress(
    nftMintAddress, sellerPublicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction();

  // Seller's ATA should already exist (they had the NFT before), but create if needed
  try {
    await getAccount(connection, sellerAta, 'confirmed', TOKEN_PROGRAM_ID);
  } catch {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        escrowKeypair.publicKey, sellerAta, sellerPublicKey, nftMintAddress,
        TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Transfer 1 NFT from escrow back to seller
  transaction.add(
    createTransferCheckedInstruction(
      escrowAta,
      nftMintAddress,
      sellerAta,
      escrowKeypair.publicKey,
      1,
      0,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = escrowKeypair.publicKey;

  transaction.sign(escrowKeypair);

  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    { skipPreflight: false, preflightCommitment: 'confirmed' }
  );

  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}
