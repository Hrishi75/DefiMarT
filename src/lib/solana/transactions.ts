import {
  Connection,
  PublicKey,
  SystemProgram,
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
import { SOLANA_RPC_ENDPOINT, solToLamports, TOKEN_CONFIGS, toSmallestUnit, isNativeSOL } from './constants';
import type { TokenCurrency } from '@/types/marketplace';

/**
 * Create a connection to Solana Devnet
 */
export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
}

/**
 * Build a SOL transfer transaction for the buyer to sign.
 * The buyer sends SOL directly to the seller's wallet.
 */
export async function buildPurchaseTransaction(
  buyerPublicKey: PublicKey,
  sellerPublicKey: PublicKey,
  amountSol: number
): Promise<Transaction> {
  const connection = getConnection();
  const lamports = solToLamports(amountSol);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      toPubkey: sellerPublicKey,
      lamports,
    })
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = buyerPublicKey;

  return transaction;
}

/**
 * Send a signed transaction and wait for confirmation.
 */
export async function sendAndConfirmTransaction(
  signedTransaction: Transaction
): Promise<TransactionSignature> {
  const connection = getConnection();

  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize(),
    { skipPreflight: false, preflightCommitment: 'confirmed' }
  );

  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Get the SOL balance for a wallet address.
 */
export async function getBalance(publicKey: PublicKey): Promise<number> {
  const connection = getConnection();
  const lamports = await connection.getBalance(publicKey);
  return lamports / 1e9;
}

/**
 * Build an SPL token transfer transaction.
 * Handles ATA creation for the seller if it doesn't exist.
 */
export async function buildSPLTokenTransferTransaction(
  buyerPublicKey: PublicKey,
  sellerPublicKey: PublicKey,
  amount: number,
  currency: Exclude<TokenCurrency, 'SOL'>
): Promise<Transaction> {
  const connection = getConnection();
  const tokenConfig = TOKEN_CONFIGS[currency];
  const mint = tokenConfig.mint!;
  const decimals = tokenConfig.decimals;

  const buyerAta = await getAssociatedTokenAddress(
    mint, buyerPublicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const sellerAta = await getAssociatedTokenAddress(
    mint, sellerPublicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction();

  // Create seller's ATA if it doesn't exist (buyer pays rent)
  try {
    await getAccount(connection, sellerAta, 'confirmed', TOKEN_PROGRAM_ID);
  } catch {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        buyerPublicKey, sellerAta, sellerPublicKey, mint,
        TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  const transferAmount = toSmallestUnit(amount, currency);

  transaction.add(
    createTransferCheckedInstruction(
      buyerAta, mint, sellerAta, buyerPublicKey,
      transferAmount, decimals, [], TOKEN_PROGRAM_ID
    )
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = buyerPublicKey;

  return transaction;
}

/**
 * Unified purchase transaction builder — routes to SOL or SPL token transfer.
 */
export async function buildPurchaseTransactionForCurrency(
  buyerPublicKey: PublicKey,
  sellerPublicKey: PublicKey,
  amount: number,
  currency: TokenCurrency
): Promise<Transaction> {
  if (isNativeSOL(currency)) {
    return buildPurchaseTransaction(buyerPublicKey, sellerPublicKey, amount);
  }
  return buildSPLTokenTransferTransaction(
    buyerPublicKey, sellerPublicKey, amount,
    currency as Exclude<TokenCurrency, 'SOL'>
  );
}

/**
 * Get the SPL token balance for a wallet.
 */
export async function getTokenBalance(
  publicKey: PublicKey,
  currency: Exclude<TokenCurrency, 'SOL'>
): Promise<number> {
  const connection = getConnection();
  const tokenConfig = TOKEN_CONFIGS[currency];
  const mint = tokenConfig.mint!;

  const ata = await getAssociatedTokenAddress(
    mint, publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );

  try {
    const account = await getAccount(connection, ata, 'confirmed', TOKEN_PROGRAM_ID);
    return Number(account.amount) / Math.pow(10, tokenConfig.decimals);
  } catch {
    return 0;
  }
}
