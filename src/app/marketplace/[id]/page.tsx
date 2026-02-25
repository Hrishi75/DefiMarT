"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { getListingById as getListingByIdDb } from "@/lib/supabase/queries/listings";
import { getListingById as getListingByIdMock } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Listing } from "@/types/marketplace";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import Tag from "@/components/Tag";
import { twMerge } from "tailwind-merge";

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const supabase = useSupabase();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchListing();
  }, [resolvedParams.id]);

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
                <span className="text-2xl text-lime-400 font-bold">SOL</span>
                <span className="text-white/50 text-sm ml-auto">&asymp; ${(listing.price * 150).toFixed(2)} USD</span>
              </div>
              {listing.shippingInfo && (
                <div className="text-sm text-white/50">
                  + {listing.shippingInfo.cost} SOL shipping
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
                  <span>{totalPrice.toFixed(2)} SOL</span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/50">Shipping</span>
                    <span>{shippingCost.toFixed(2)} SOL</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-lime-400">{grandTotal.toFixed(2)} SOL</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              {isOwnListing ? (
                <Button variant="secondary" className="flex-1 !h-14 text-lg">
                  Edit Listing
                </Button>
              ) : isAuthenticated ? (
                <Button variant="primary" className="flex-1 !h-14 text-lg">
                  Buy Now
                </Button>
              ) : (
                <Button variant="primary" className="flex-1 !h-14 text-lg opacity-50 cursor-not-allowed">
                  Connect Wallet to Buy
                </Button>
              )}
              <button className="w-14 h-14 rounded-full bg-neutral-900 border border-white/10 hover:border-lime-400 transition flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
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

            {/* NFT Metadata */}
            {listing.isNFT && listing.nftMetadata && (
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-medium mb-4">NFT Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-white/50 mb-1">Mint Address</div>
                    <div className="font-mono text-sm text-white break-all">{listing.nftMetadata.mintAddress}</div>
                  </div>
                  {listing.nftMetadata.collection && (
                    <div>
                      <div className="text-sm text-white/50 mb-1">Collection</div>
                      <div className="text-white">{listing.nftMetadata.collection}</div>
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
    </div>
  );
}
