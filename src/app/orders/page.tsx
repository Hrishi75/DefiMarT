"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/hooks/useSupabase";
import { useTransaction } from "@/hooks/useTransaction";
import {
  getTransactionsByBuyer,
  getTransactionsBySeller,
} from "@/lib/supabase/queries/transactions";
import { Transaction } from "@/types/marketplace";
import TransactionCard from "@/components/marketplace/TransactionCard";
import ReviewForm from "@/components/ReviewForm";
import Button from "@/components/Button";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

type Tab = "purchases" | "sales";

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const supabase = useSupabase();
  const { updateStatus } = useTransaction();

  const [tab, setTab] = useState<Tab>("purchases");
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingTx, setReviewingTx] = useState<Transaction | null>(null);
  const [reviewedTxIds, setReviewedTxIds] = useState<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [buyerTxs, sellerTxs] = await Promise.all([
        getTransactionsByBuyer(supabase, user.id),
        getTransactionsBySeller(supabase, user.id),
      ]);
      setPurchases(buyerTxs);
      setSales(sellerTxs);
    } catch (err) {
      console.warn("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  async function handleStatusUpdate(transactionId: string, status: string) {
    await updateStatus(transactionId, status);
    // Refresh after update
    fetchOrders();
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-medium mb-2">Connect Your Wallet</h2>
          <p className="text-white/50 mb-6">
            Connect your wallet to view your orders.
          </p>
          <Link href="/marketplace">
            <Button variant="secondary">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentTransactions = tab === "purchases" ? purchases : sales;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("purchases")}
            className={twMerge(
              "px-6 py-2.5 rounded-full font-medium transition text-sm",
              tab === "purchases"
                ? "bg-lime-400 text-neutral-950"
                : "bg-neutral-900 border border-white/10 text-white hover:border-lime-400"
            )}
          >
            My Purchases ({purchases.length})
          </button>
          <button
            onClick={() => setTab("sales")}
            className={twMerge(
              "px-6 py-2.5 rounded-full font-medium transition text-sm",
              tab === "sales"
                ? "bg-lime-400 text-neutral-950"
                : "bg-neutral-900 border border-white/10 text-white hover:border-lime-400"
            )}
          >
            My Sales ({sales.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-900 border border-white/10 rounded-2xl h-32 animate-pulse"
              />
            ))}
          </div>
        ) : currentTransactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-white/20 text-6xl mb-4">
              {tab === "purchases" ? "🛒" : "📦"}
            </div>
            <h3 className="text-2xl font-medium mb-2">
              {tab === "purchases"
                ? "No purchases yet"
                : "No sales yet"}
            </h3>
            <p className="text-white/50 mb-6">
              {tab === "purchases"
                ? "Browse the marketplace to find event collectibles."
                : "Create a listing to start selling."}
            </p>
            <Link
              href={
                tab === "purchases" ? "/marketplace" : "/marketplace/create"
              }
            >
              <Button variant="primary">
                {tab === "purchases"
                  ? "Browse Marketplace"
                  : "Create Listing"}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentTransactions.map((tx) => (
              <div key={tx.id}>
                <TransactionCard
                  transaction={tx}
                  role={tab === "purchases" ? "buyer" : "seller"}
                  onStatusUpdate={handleStatusUpdate}
                />
                {tx.status === "completed" && !reviewedTxIds.has(tx.id) && (
                  <div className="mt-2 ml-0 md:ml-28 mb-4">
                    <button
                      onClick={() => setReviewingTx(tx)}
                      className="px-4 py-1.5 bg-lime-400/10 text-lime-400 rounded-full text-sm font-medium hover:bg-lime-400/20 transition flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Leave Review
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingTx && (
        <ReviewForm
          transactionId={reviewingTx.id}
          listingId={reviewingTx.listingId}
          reviewedId={
            tab === "purchases"
              ? reviewingTx.sellerId
              : reviewingTx.buyerId
          }
          onSubmitted={() => {
            setReviewedTxIds((prev) => new Set([...prev, reviewingTx.id]));
            setReviewingTx(null);
          }}
          onCancel={() => setReviewingTx(null)}
        />
      )}
    </div>
  );
}
