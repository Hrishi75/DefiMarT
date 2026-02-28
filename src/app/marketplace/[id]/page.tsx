"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { getListingById as getListingByIdDb } from "@/lib/supabase/queries/listings";
import { getListingById as getListingByIdMock } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Listing, NFTAsset } from "@/types/marketplace";
import { getAccountExplorerUrl, getApproxUsdValue, formatPrice } from "@/lib/solana/constants";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import Tag from "@/components/Tag";
import PurchaseModal from "@/components/marketplace/PurchaseModal";
import FavoriteButton from "@/components/FavoriteButton";
import { useTransaction } from "@/hooks/useTransaction";
import ReviewCard from "@/components/ReviewCard";
import StarRating from "@/components/StarRating";
import { Review } from "@/types/marketplace";
import { twMerge } from "tailwind-merge";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = params;
  const supabase = useSupabase();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [onChainNft, setOnChainNft] = useState<NFTAsset | null>(null);
  const { depositToEscrow, loading: escrowLoading } = useTransaction();
  const [escrowDepositing, setEscrowDepositing] = useState(false);
  const [nftVerifying, setNftVerifying] = useState(false);
  const [nftVerified, setNftVerified] = useState<boolean | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchListing();
    fetchReviews();
  }, [resolvedParams.id]);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/reviews?listingId=${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(
          (data.reviews || []).map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          }))
        );
        setAverageRating(data.averageRating || 0);
      }
    } catch {
      // Reviews are non-critical
    }
  }

  async function fetchListing() {
    setLoading(true);
    try {
      const data = await getListingByIdDb(supabase, resolvedParams.id);
      setListing(data);
    } catch {
      const mockListing = getListingByIdMock(resolvedParams.id);
      setListing(mockListing ?? null);
    } finally {
      setLoading(false);
    }
  }

  // Verify NFT on-chain when listing loads
  useEffect(() => {
    if (listing?.isNFT && listing.nftMetadata?.mintAddress) {
      verifyNftOnChain(listing.nftMetadata.mintAddress);
    }
  }, [listing?.id]);

  async function verifyNftOnChain(mintAddress: string) {
    setNftVerifying(true);
    setNftVerified(null);
    try {
      const res = await fetch(`/api/nft/metadata?mint=${mintAddress}`);
      if (res.ok) {
        const data = await res.json();
        setOnChainNft(data.nft);
        setNftVerified(true);
      } else {
        setNftVerified(false);
      }
    } catch {
      setNftVerified(false);
    } finally {
      setNftVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-medium mb-2">Listing not found</h2>
          <p className="text-white/50">This item doesn&apos;t exist or has been removed</p>
        </div>
      </div>
    );
  }

  const totalPrice = listing.price * quantity;
  const shippingCost = listing.shippingInfo?.cost || 0;
  const grandTotal = totalPrice + shippingCost;
  const isOwnListing = user && listing.sellerId === user.id;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      <div className="container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/50 mb-8">
          <Link href="/marketplace" className="hover:text-lime-400 transition">Marketplace</Link>
          <span>&rsaquo;</span>
          <span className="text-white">{listing.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-900 mb-4">
              <Image
                src={listing.images[selectedImage]}
                alt={listing.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {listing.isNFT && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    NFT
                  </div>
                )}
                {listing.event?.verified && (
                  <div className="bg-lime-400 text-neutral-950 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 bg-neutral-950/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
                {listing.condition === 'new' && 'New'}
                {listing.condition === 'like-new' && 'Like New'}
                {listing.condition === 'good' && 'Good'}
                {listing.condition === 'fair' && 'Fair'}
              </div>
            </div>
            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={twMerge(
                      "relative aspect-square rounded-xl overflow-hidden border-2 transition",
                      selectedImage === index ? "border-lime-400" : "border-white/10 hover:border-white/30"
                    )}
                  >
                    <Image src={image} alt={`${listing.title} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {listing.event?.name && (
              <div className="inline-flex items-center gap-2 mb-4 text-lime-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{listing.event.name}</span>
              </div>
            )}

            <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>

            <div className="flex flex-wrap gap-2 mb-6">
              <Tag>{listing.category}</Tag>
              {listing.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>

            {/* Price */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">{listing.price}</span>
                <span className="text-2xl text-lime-400 font-bold">{listing.currency}</span>
                <span className="text-white/50 text-sm ml-auto">&asymp; ${getApproxUsdValue(listing.price, listing.currency).toFixed(2)} USD</span>
              </div>
              {listing.shippingInfo && (
                <div className="text-sm text-white/50">
                  + {listing.shippingInfo.cost} {listing.currency} shipping
                </div>
              )}
            </div>

            {/* Quantity */}
            {!listing.isNFT && listing.quantityAvailable > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 hover:border-lime-400 transition flex items-center justify-center"
                  >
                    &minus;
                  </button>
                  <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(listing.quantityAvailable, quantity + 1))}
                    className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 hover:border-lime-400 transition flex items-center justify-center"
                  >
                    +
                  </button>
                  <span className="text-sm text-white/50 ml-auto">{listing.quantityAvailable} available</span>
                </div>
              </div>
            )}

            {/* Purchase Summary */}
            {!listing.isNFT && quantity > 1 && (
              <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/50">Item Price</span>
                  <span>{formatPrice(totalPrice, listing.currency)}</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/50">Shipping</span>
                    <span>{formatPrice(shippingCost, listing.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-lime-400">{formatPrice(grandTotal, listing.currency)}</span>
                </div>
              </div>
            )}

            {/* NFT Escrow Status */}
            {listing.isNFT && (
              <div className="mb-6">
                {listing.status === 'escrowed' && (
                  <div className="flex items-center gap-2 bg-lime-400/10 border border-lime-400/30 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 text-lime-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-lime-400 font-medium">NFT secured in escrow</span>
                  </div>
                )}
                {listing.status === 'active' && (
                  <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-yellow-400 font-medium">NFT not yet deposited to escrow</span>
                  </div>
                )}
                {isOwnListing && listing.status === 'active' && listing.nftMetadata?.mintAddress && (
                  <Button
                    variant="primary"
                    className="w-full !h-12 mt-3"
                    onClick={async () => {
                      setEscrowDepositing(true);
                      const result = await depositToEscrow(resolvedParams.id, listing.nftMetadata!.mintAddress);
                      setEscrowDepositing(false);
                      if (result) {
                        // Reload listing to reflect escrowed status
                        window.location.reload();
                      }
                    }}
                    disabled={escrowDepositing || escrowLoading}
                  >
                    {escrowDepositing ? 'Depositing NFT...' : 'Deposit NFT to Escrow'}
                  </Button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              {isOwnListing ? (
                <Link href={`/marketplace/${resolvedParams.id}/edit`} className="flex-1">
                  <Button variant="secondary" className="w-full !h-14 text-lg">
                    Edit Listing
                  </Button>
                </Link>
              ) : isAuthenticated ? (
                <Button
                  variant="primary"
                  className="flex-1 !h-14 text-lg"
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={
                    listing.status === 'sold' ||
                    listing.status === 'cancelled' ||
                    (listing.isNFT && listing.status === 'active')
                  }
                >
                  {listing.status === 'sold' || listing.status === 'cancelled'
                    ? 'Sold Out'
                    : listing.isNFT && listing.status === 'active'
                    ? 'Awaiting NFT Deposit'
                    : 'Buy Now'}
                </Button>
              ) : (
                <Button variant="primary" className="flex-1 !h-14 text-lg opacity-50 cursor-not-allowed">
                  Connect Wallet to Buy
                </Button>
              )}
              <FavoriteButton
                listingId={resolvedParams.id}
                initialCount={listing.favorites}
                className="w-14 h-14"
              />
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-3">Description</h3>
              <p className="text-white/70 leading-relaxed">{listing.description}</p>
            </div>

            {/* Shipping Info */}
            {listing.shippingInfo && (
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-lime-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <div>
                      <div className="text-sm text-white/50">Ships from</div>
                      <div className="text-white">{listing.shippingInfo.shipsFrom}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-lime-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    <div>
                      <div className="text-sm text-white/50">Ships to</div>
                      <div className="text-white">{listing.shippingInfo.shipsTo.join(', ')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-lime-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm text-white/50">Estimated delivery</div>
                      <div className="text-white">{listing.shippingInfo.estimatedDays}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NFT On-Chain Verification */}
            {listing.isNFT && listing.nftMetadata && (
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">NFT Information</h3>
                  {nftVerifying ? (
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <div className="animate-spin w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full" />
                      Verifying on-chain...
                    </div>
                  ) : nftVerified === true ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-lime-400 bg-lime-400/10 px-3 py-1.5 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified On-Chain
                    </div>
                  ) : nftVerified === false ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Not Verified
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3">
                  {/* Mint Address with Explorer link */}
                  <div>
                    <div className="text-sm text-white/50 mb-1">Mint Address</div>
                    <a
                      href={getAccountExplorerUrl(listing.nftMetadata.mintAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-purple-300 hover:text-lime-400 transition break-all flex items-center gap-2"
                    >
                      {listing.nftMetadata.mintAddress}
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  {/* Collection */}
                  {(listing.nftMetadata.collection || onChainNft?.collection) && (
                    <div>
                      <div className="text-sm text-white/50 mb-1">Collection</div>
                      <div className="flex items-center gap-2">
                        {onChainNft?.collection?.verified && (
                          <svg className="w-4 h-4 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="text-white">
                          {onChainNft?.collection?.name || listing.nftMetadata.collection}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* On-chain attributes */}
                  {onChainNft?.attributes && onChainNft.attributes.length > 0 && (
                    <div>
                      <div className="text-sm text-white/50 mb-2">Attributes</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {onChainNft.attributes.map((attr, i) => (
                          <div key={i} className="bg-neutral-800/50 border border-white/5 rounded-lg p-2.5">
                            <div className="text-xs text-purple-300 mb-0.5">{attr.traitType}</div>
                            <div className="text-sm font-medium truncate">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Symbol */}
                  {onChainNft?.symbol && (
                    <div>
                      <div className="text-sm text-white/50 mb-1">Symbol</div>
                      <div className="text-white">{onChainNft.symbol}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Seller Info */}
            {listing.seller?.username && (
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-medium mb-4">Seller</h3>
                <Link href={`/profile/${listing.seller.id}`}>
                  <div className="flex items-center gap-4 hover:opacity-80 transition">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xl font-bold">
                      {listing.seller.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{listing.seller.displayName}</span>
                        {listing.seller.verified && (
                          <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-white/50">@{listing.seller.username}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lime-400 font-medium">{listing.seller.stats.reputation}%</div>
                      <div className="text-xs text-white/50">Rating</div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-medium">Reviews</h3>
                  <div className="flex items-center gap-2">
                    <StarRating rating={averageRating} size="sm" />
                    <span className="text-sm text-white/50">
                      ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 flex items-center justify-center gap-8 text-white/50">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{listing.views} views</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{listing.favorites} favorites</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && listing && (
        <PurchaseModal
          listing={listing}
          quantity={quantity}
          onClose={() => {
            setShowPurchaseModal(false);
            fetchListing(); // Refresh listing data after purchase
          }}
        />
      )}
    </div>
  );
}
