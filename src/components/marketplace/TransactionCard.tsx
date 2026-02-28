"use client";

import { useState } from "react";
import { Transaction, TransactionStatus } from "@/types/marketplace";
import { getExplorerUrl, formatPrice } from "@/lib/solana/constants";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

interface TransactionCardProps {
  transaction: Transaction;
  role: "buyer" | "seller";
  onStatusUpdate?: (transactionId: string, status: string) => Promise<void>;
}

const statusConfig: Record<
  TransactionStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  escrowed: { label: "Escrowed", color: "text-blue-400", bg: "bg-blue-400/10" },
  confirmed: { label: "Confirmed", color: "text-blue-400", bg: "bg-blue-400/10" },
  shipped: { label: "Shipped", color: "text-purple-400", bg: "bg-purple-400/10" },
  completed: { label: "Completed", color: "text-lime-400", bg: "bg-lime-400/10" },
  failed: { label: "Failed", color: "text-red-400", bg: "bg-red-400/10" },
  refunded: { label: "Refunded", color: "text-orange-400", bg: "bg-orange-400/10" },
  disputed: { label: "Disputed", color: "text-red-400", bg: "bg-red-400/10" },
};

export default function TransactionCard({
  transaction,
  role,
  onStatusUpdate,
}: TransactionCardProps) {
  const [updating, setUpdating] = useState(false);
  const status = statusConfig[transaction.status] || statusConfig.pending;

  const counterparty =
    role === "buyer" ? transaction.seller : transaction.buyer;

  async function handleAction(newStatus: string) {
    if (!onStatusUpdate) return;
    setUpdating(true);
    try {
      await onStatusUpdate(transaction.id, newStatus);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Listing Image */}
        <Link
          href={`/marketplace/${transaction.listingId}`}
          className="flex-shrink-0"
        >
          <div className="w-full md:w-24 h-32 md:h-24 rounded-xl overflow-hidden bg-neutral-800">
            <img
              src={
                transaction.listing?.images?.[0] || "/placeholder.svg"
              }
              alt={transaction.listing?.title || "Item"}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <Link
                href={`/marketplace/${transaction.listingId}`}
                className="font-medium hover:text-lime-400 transition truncate block"
              >
                {transaction.listing?.title || "Unknown Item"}
              </Link>
              <p className="text-sm text-white/50 mt-1">
                {role === "buyer" ? "Seller" : "Buyer"}:{" "}
                <Link
                  href={`/profile/${counterparty?.id}`}
                  className="text-lime-400 hover:underline"
                >
                  @{counterparty?.username || "unknown"}
                </Link>
              </p>
            </div>

            {/* Status Badge */}
            <div
              className={twMerge(
                "px-3 py-1 rounded-full text-xs font-medium flex-shrink-0",
                status.bg,
                status.color
              )}
            >
              {status.label}
            </div>
          </div>

          {/* Price & Date */}
          <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
            <span className="font-bold text-lime-400">
              {formatPrice(transaction.amount, transaction.currency)}
            </span>
            <span className="text-white/30">
              {new Date(transaction.createdAt).toLocaleDateString()}
            </span>
            {transaction.transactionHash && (
              <a
                href={getExplorerUrl(transaction.transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-lime-400 transition flex items-center gap-1"
              >
                <span className="font-mono">
                  {transaction.transactionHash.slice(0, 8)}...
                </span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>

          {/* Shipping Tracking */}
          {transaction.shippingTracking && (
            <p className="text-xs text-white/40 mb-3">
              Tracking: {transaction.shippingTracking}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Seller: Mark as shipped */}
            {role === "seller" && transaction.status === "confirmed" && (
              <button
                onClick={() => handleAction("shipped")}
                disabled={updating}
                className="px-4 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium hover:bg-purple-500/30 transition disabled:opacity-50"
              >
                {updating ? "Updating..." : "Mark Shipped"}
              </button>
            )}

            {/* Buyer: Confirm receipt */}
            {role === "buyer" && transaction.status === "shipped" && (
              <button
                onClick={() => handleAction("completed")}
                disabled={updating}
                className="px-4 py-1.5 bg-lime-400/20 text-lime-400 rounded-full text-sm font-medium hover:bg-lime-400/30 transition disabled:opacity-50"
              >
                {updating ? "Updating..." : "Confirm Receipt"}
              </button>
            )}

            {/* Both: Dispute (only for confirmed/shipped) */}
            {(transaction.status === "confirmed" ||
              transaction.status === "shipped") && (
              <button
                onClick={() => handleAction("disputed")}
                disabled={updating}
                className="px-4 py-1.5 bg-red-500/10 text-red-400 rounded-full text-sm font-medium hover:bg-red-500/20 transition disabled:opacity-50"
              >
                Dispute
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
