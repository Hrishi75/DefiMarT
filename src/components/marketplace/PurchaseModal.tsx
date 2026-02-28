"use client";

import { useState } from "react";
import { useTransaction } from "@/hooks/useTransaction";
import { getExplorerUrl, getAccountExplorerUrl, formatPrice, getApproxUsdValue } from "@/lib/solana/constants";
import { Listing } from "@/types/marketplace";
import Button from "@/components/Button";
import Link from "next/link";

interface PurchaseModalProps {
  listing: Listing;
  quantity: number;
  onClose: () => void;
}

type Step = "confirm" | "processing" | "success" | "error";

export default function PurchaseModal({
  listing,
  quantity,
  onClose,
}: PurchaseModalProps) {
  const { purchase, loading, error: txError } = useTransaction();
  const [step, setStep] = useState<Step>("confirm");
  const [signature, setSignature] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const itemTotal = listing.price * quantity;
  const shippingCost = listing.shippingInfo?.cost || 0;
  const grandTotal = itemTotal + shippingCost;

  async function handlePurchase() {
    setStep("processing");

    const result = await purchase(
      listing.id,
      listing.seller.walletAddress,
      grandTotal,
      listing.currency
    );

    if (result) {
      setSignature(result.signature);
      setStep("success");
    } else {
      setErrorMessage(txError || "Transaction failed. Please try again.");
      setStep("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={step === "processing" ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">
            {step === "confirm" && "Confirm Purchase"}
            {step === "processing" && "Processing..."}
            {step === "success" && "Purchase Complete!"}
            {step === "error" && "Transaction Failed"}
          </h2>
          {step !== "processing" && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
            >
              &times;
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Confirm Step */}
          {step === "confirm" && (
            <>
              {/* Item Summary */}
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                  <img
                    src={listing.images[0] || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{listing.title}</h3>
                  <p className="text-sm text-white/50 mt-1">
                    by @{listing.seller.username}
                  </p>
                  <p className="text-sm text-lime-400 mt-1">
                    {listing.event?.name}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-neutral-800 rounded-2xl p-4 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">
                    Item Price {quantity > 1 ? `(x${quantity})` : ""}
                  </span>
                  <span>{formatPrice(itemTotal, listing.currency)}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Shipping</span>
                    <span>{formatPrice(shippingCost, listing.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-lime-400">
                    {formatPrice(grandTotal, listing.currency)}
                  </span>
                </div>
                <div className="text-xs text-white/30 text-right">
                  &asymp; ${getApproxUsdValue(grandTotal, listing.currency).toFixed(2)} USD
                </div>
              </div>

              <p className="text-xs text-white/40 mb-6">
                By confirming, you agree to send {formatPrice(grandTotal, listing.currency)} to
                the seller&apos;s wallet. This transaction will be recorded on
                the Solana Devnet blockchain.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1 !h-12"
                  onClick={handlePurchase}
                >
                  Confirm & Pay
                </Button>
                <Button
                  variant="secondary"
                  className="!h-12"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-3 border-lime-400 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                {loading
                  ? "Waiting for wallet approval..."
                  : "Confirming transaction..."}
              </p>
              <p className="text-sm text-white/50">
                Please approve the transaction in your wallet
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-lime-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Purchase Successful!</h3>
              <p className="text-white/50 mb-4">
                Your payment of {formatPrice(grandTotal, listing.currency)} has been sent.
                {listing.isNFT && " The NFT has been transferred to your wallet."}
              </p>

              <div className="flex flex-col items-center gap-2 mb-6">
                {signature && (
                  <a
                    href={getExplorerUrl(signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-lime-400 hover:text-lime-300 text-sm transition w-full justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Transaction on Explorer
                  </a>
                )}
                {listing.isNFT && listing.nftMetadata?.mintAddress && (
                  <a
                    href={getAccountExplorerUrl(listing.nftMetadata.mintAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl px-4 py-2.5 text-purple-300 hover:text-purple-200 text-sm transition w-full justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View NFT on Explorer
                  </a>
                )}
              </div>

              <div className="flex gap-3">
                <Link href="/orders" className="flex-1">
                  <Button variant="primary" className="w-full !h-12">
                    View Orders
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="!h-12"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Error Step */}
          {step === "error" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Transaction Failed</h3>
              <p className="text-white/50 mb-6 text-sm">{errorMessage}</p>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1 !h-12"
                  onClick={() => setStep("confirm")}
                >
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  className="!h-12"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
