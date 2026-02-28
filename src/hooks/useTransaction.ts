"use client";

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  buildPurchaseTransactionForCurrency,
  sendAndConfirmTransaction,
} from '@/lib/solana/transactions';
import { buildEscrowDepositTransaction } from '@/lib/solana/escrow';
import type { TokenCurrency } from '@/types/marketplace';

interface TransactionResult {
  signature: string;
  transactionId: string;
}

export function useTransaction() {
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchase = useCallback(
    async (
      listingId: string,
      sellerWalletAddress: string,
      amount: number,
      currency: TokenCurrency = 'SOL'
    ): Promise<TransactionResult | null> => {
      if (!publicKey || !signTransaction) {
        setError('Wallet not connected');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const sellerPublicKey = new PublicKey(sellerWalletAddress);

        // Build the transfer transaction (SOL or SPL token)
        const transaction = await buildPurchaseTransactionForCurrency(
          publicKey,
          sellerPublicKey,
          amount,
          currency
        );

        // Sign with wallet adapter
        const signedTx = await signTransaction(transaction);

        // Send and confirm on-chain
        const signature = await sendAndConfirmTransaction(signedTx);

        // Record in database
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId,
            transactionHash: signature,
            amount,
            currency,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to record transaction');
        }

        const { transaction: txRecord } = await res.json();

        return {
          signature,
          transactionId: txRecord.id,
        };
      } catch (err: any) {
        const message =
          err?.message || 'Transaction failed';
        setError(message);
        console.error('Purchase error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, signTransaction]
  );

  const updateStatus = useCallback(
    async (
      transactionId: string,
      status: string,
      shippingTracking?: string
    ) => {
      try {
        const res = await fetch(`/api/transactions/${transactionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, shippingTracking }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update transaction');
        }

        return await res.json();
      } catch (err: any) {
        setError(err.message);
        return null;
      }
    },
    []
  );

  const depositToEscrow = useCallback(
    async (
      listingId: string,
      nftMintAddress: string
    ): Promise<{ signature: string } | null> => {
      if (!publicKey || !signTransaction) {
        setError('Wallet not connected');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch escrow wallet address from server
        const escrowRes = await fetch('/api/escrow');
        if (!escrowRes.ok) {
          throw new Error('Failed to get escrow address');
        }
        const { escrowAddress } = await escrowRes.json();
        const escrowPublicKey = new PublicKey(escrowAddress);
        const mintPublicKey = new PublicKey(nftMintAddress);

        // Build the deposit transaction
        const transaction = await buildEscrowDepositTransaction(
          publicKey,
          escrowPublicKey,
          mintPublicKey
        );

        // Sign with wallet adapter
        const signedTx = await signTransaction(transaction);

        // Send and confirm on-chain
        const signature = await sendAndConfirmTransaction(signedTx);

        // Confirm deposit with backend
        const confirmRes = await fetch(`/api/listings/${listingId}/escrow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionHash: signature }),
        });

        if (!confirmRes.ok) {
          const data = await confirmRes.json();
          throw new Error(data.error || 'Failed to confirm escrow deposit');
        }

        return { signature };
      } catch (err: any) {
        const message = err?.message || 'Escrow deposit failed';
        setError(message);
        console.error('Escrow deposit error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, signTransaction]
  );

  return {
    purchase,
    depositToEscrow,
    updateStatus,
    loading,
    error,
    clearError: () => setError(null),
  };
}
