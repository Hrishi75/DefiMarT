"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/hooks/useSupabase";
import { useTransaction } from "@/hooks/useTransaction";
import { getEvents } from "@/lib/supabase/queries/events";
import { mockEvents } from "@/lib/mockData";
import { Event, ItemCategory, ItemCondition, NFTAsset, TokenCurrency } from "@/types/marketplace";
import { SUPPORTED_CURRENCIES, TOKEN_CONFIGS } from "@/lib/solana/constants";
import Button from "@/components/Button";
import Link from "next/link";

const categories: { value: ItemCategory; label: string }[] = [
  { value: "apparel", label: "Apparel" },
  { value: "collectible", label: "Collectible" },
  { value: "nft", label: "NFT" },
  { value: "accessory", label: "Accessory" },
  { value: "badge", label: "Badge" },
  { value: "other", label: "Other" },
];

const conditions: { value: ItemCondition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

export default function CreateListingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const supabase = useSupabase();
  const { depositToEscrow, loading: escrowLoading, error: escrowError } = useTransaction();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Escrow deposit state (shown after NFT listing is created)
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [escrowStep, setEscrowStep] = useState<'idle' | 'depositing' | 'success' | 'error'>('idle');

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<TokenCurrency>("SOL");
  const [category, setCategory] = useState<ItemCategory>("apparel");
  const [condition, setCondition] = useState<ItemCondition>("new");
  const [eventId, setEventId] = useState("");
  const [customEventName, setCustomEventName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tags, setTags] = useState("");
  const [shipsFrom, setShipsFrom] = useState("");
  const [shipsTo, setShipsTo] = useState("Worldwide");
  const [estimatedDays, setEstimatedDays] = useState("7-14 business days");
  const [shippingCost, setShippingCost] = useState("");

  // NFT picker state
  const [walletNfts, setWalletNfts] = useState<NFTAsset[]>([]);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NFTAsset | null>(null);

  const isNftCategory = category === "nft";

  useEffect(() => {
    loadEvents();
  }, []);

  // Fetch wallet NFTs when category switches to "nft"
  useEffect(() => {
    if (isNftCategory && user?.wallet_address && walletNfts.length === 0) {
      fetchWalletNfts();
    }
  }, [isNftCategory, user?.wallet_address]);

  async function loadEvents() {
    try {
      const data = await getEvents(supabase);
      setEvents(data);
    } catch {
      setEvents(mockEvents);
    }
  }

  async function fetchWalletNfts() {
    if (!user?.wallet_address) return;
    setNftsLoading(true);
    try {
      const res = await fetch(`/api/nft/wallet?address=${user.wallet_address}`);
      if (!res.ok) throw new Error("Failed to fetch NFTs");
      const data = await res.json();
      setWalletNfts(data.nfts || []);
    } catch (err) {
      console.warn("Failed to load wallet NFTs:", err);
      setWalletNfts([]);
    } finally {
      setNftsLoading(false);
    }
  }

  function selectNft(nft: NFTAsset) {
    setSelectedNft(nft);
    setTitle(nft.name);
    setDescription(nft.description || "");
    setQuantity(1);
    // Use NFT image as the listing image (no file upload needed)
    setImageFiles([]);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
  }

  function deselectNft() {
    setSelectedNft(null);
    setTitle("");
    setDescription("");
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Create previews
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    // Revoke old previews
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews(previews);
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImages(): Promise<string[]> {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "listing-images");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await res.json();
      urls.push(url);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages();
      }

      // Build shipping info
      const shippingInfo =
        shipsFrom || shippingCost
          ? {
              ships_from: shipsFrom,
              ships_to: shipsTo.split(",").map((s) => s.trim()),
              estimated_days: estimatedDays,
              cost: Number(shippingCost) || 0,
            }
          : null;

      // For NFTs, use the NFT image if no files uploaded
      const finalImages = isNftCategory && selectedNft && imageUrls.length === 0 && selectedNft.image
        ? [selectedNft.image]
        : imageUrls;

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          currency,
          category,
          condition,
          eventId: eventId || null,
          customEventName: !eventId && customEventName.trim() ? customEventName.trim() : null,
          images: finalImages,
          quantity: isNftCategory ? 1 : quantity,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          shippingInfo: isNftCategory ? null : shippingInfo,
          isNft: isNftCategory && !!selectedNft,
          nftMetadata: isNftCategory && selectedNft ? {
            mintAddress: selectedNft.mintAddress,
            metaplexUri: selectedNft.uri,
            collection: selectedNft.collection?.name,
          } : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create listing");
      }

      const { listing } = await res.json();

      // For NFT listings, show escrow deposit step instead of redirecting
      if (isNftCategory && selectedNft) {
        setCreatedListingId(listing.id);
        setEscrowStep('idle');
      } else {
        router.push(`/marketplace/${listing.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEscrowDeposit() {
    if (!createdListingId || !selectedNft) return;
    setEscrowStep('depositing');

    const result = await depositToEscrow(createdListingId, selectedNft.mintAddress);

    if (result) {
      setEscrowStep('success');
      setTimeout(() => {
        router.push(`/marketplace/${createdListingId}`);
      }, 2000);
    } else {
      setEscrowStep('error');
    }
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
            You need to connect your wallet to create a listing.
          </p>
          <Link href="/marketplace">
            <Button variant="secondary">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show escrow deposit screen for NFT listings
  if (createdListingId) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
        <div className="container max-w-lg">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 text-center">
            {escrowStep === 'idle' && (
              <>
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Deposit NFT to Escrow</h2>
                <p className="text-white/50 mb-2">
                  Your listing has been created! Now deposit your NFT into the marketplace escrow to make it available for purchase.
                </p>
                <p className="text-xs text-white/30 mb-6">
                  The NFT will be held securely in escrow until a buyer purchases it. You can cancel the listing anytime to get it back.
                </p>
                <div className="flex flex-col gap-3">
                  <Button variant="primary" className="w-full !h-12" onClick={handleEscrowDeposit}>
                    Deposit NFT to Escrow
                  </Button>
                  <button
                    onClick={() => router.push(`/marketplace/${createdListingId}`)}
                    className="text-sm text-white/40 hover:text-white/60 transition"
                  >
                    Skip for now (listing won&apos;t be purchasable)
                  </button>
                </div>
              </>
            )}

            {escrowStep === 'depositing' && (
              <>
                <div className="animate-spin w-12 h-12 border-3 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">
                  {escrowLoading ? "Waiting for wallet approval..." : "Confirming deposit..."}
                </h2>
                <p className="text-sm text-white/50">
                  Please approve the NFT transfer in your wallet
                </p>
              </>
            )}

            {escrowStep === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">NFT Deposited!</h2>
                <p className="text-white/50 mb-4">
                  Your NFT is now in escrow and your listing is live. Redirecting...
                </p>
              </>
            )}

            {escrowStep === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Deposit Failed</h2>
                <p className="text-white/50 text-sm mb-6">{escrowError || "Something went wrong. Please try again."}</p>
                <div className="flex flex-col gap-3">
                  <Button variant="primary" className="w-full !h-12" onClick={handleEscrowDeposit}>
                    Try Again
                  </Button>
                  <button
                    onClick={() => router.push(`/marketplace/${createdListingId}`)}
                    className="text-sm text-white/40 hover:text-white/60 transition"
                  >
                    Skip for now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      <div className="container max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/50 mb-8">
          <Link
            href="/marketplace"
            className="hover:text-lime-400 transition"
          >
            Marketplace
          </Link>
          <span>&rsaquo;</span>
          <span className="text-white">Create Listing</span>
        </div>

        <h1 className="text-4xl font-bold mb-8">Create Listing</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* NFT Picker — shown when category is "nft" */}
          {isNftCategory && (
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    NFT
                  </span>
                  Select NFT from Wallet
                </h3>
                {walletNfts.length > 0 && !nftsLoading && (
                  <button
                    type="button"
                    onClick={fetchWalletNfts}
                    className="text-xs text-white/40 hover:text-lime-400 transition"
                  >
                    Refresh
                  </button>
                )}
              </div>

              {selectedNft ? (
                <div className="flex items-start gap-4 bg-neutral-800 rounded-xl p-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-700 flex-shrink-0">
                    {selectedNft.image ? (
                      <img src={selectedNft.image} alt={selectedNft.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">NFT</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{selectedNft.name}</h4>
                    {selectedNft.collection && (
                      <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                        {selectedNft.collection.verified && (
                          <svg className="w-3 h-3 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {selectedNft.collection.name}
                      </p>
                    )}
                    <p className="text-xs text-white/30 font-mono mt-1">
                      {selectedNft.mintAddress.slice(0, 8)}...{selectedNft.mintAddress.slice(-8)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={deselectNft}
                    className="text-white/40 hover:text-red-400 transition text-sm"
                  >
                    Change
                  </button>
                </div>
              ) : nftsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-neutral-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : walletNfts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-white/20 text-4xl mb-3">🖼</div>
                  <p className="text-white/50 text-sm">No NFTs found in your wallet.</p>
                  <p className="text-white/30 text-xs mt-1">Mint or purchase NFTs on Devnet to list them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                  {walletNfts.map((nft) => (
                    <button
                      key={nft.mintAddress}
                      type="button"
                      onClick={() => selectNft(nft)}
                      className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-lime-400 transition relative group bg-neutral-800"
                    >
                      {nft.image ? (
                        <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">NFT</div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                        <p className="text-xs font-medium truncate">{nft.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Images (up to 5)
            </label>
            <div className="flex flex-wrap gap-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative w-28 h-28 rounded-xl overflow-hidden border border-white/10 group"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {imageFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-xl border-2 border-dashed border-white/20 hover:border-lime-400 transition flex flex-col items-center justify-center text-white/50 hover:text-lime-400"
                >
                  <svg
                    className="w-8 h-8 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-xs">Add</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Breakpoint 2024 Limited Edition T-Shirt"
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe your item — condition details, sizing, what's included..."
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition resize-none"
            />
          </div>

          {/* Price & Quantity Row */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price ({currency}) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                step={currency === 'SOL' ? '0.0001' : '0.01'}
                min="0.01"
                placeholder="0.00"
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as TokenCurrency)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {TOKEN_CONFIGS[c].symbol} — {TOKEN_CONFIGS[c].name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                value={isNftCategory ? 1 : quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                disabled={isNftCategory}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Category & Condition Row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition"
              >
                {conditions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Event */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Related Event
            </label>
            <select
              value={eventId}
              onChange={(e) => {
                setEventId(e.target.value);
                if (e.target.value) setCustomEventName("");
              }}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition"
            >
              <option value="">None</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
            <div className="mt-3">
              <label className="block text-xs text-white/40 mb-1.5">
                Or type a new event name
              </label>
              <input
                type="text"
                value={customEventName}
                onChange={(e) => {
                  setCustomEventName(e.target.value);
                  if (e.target.value) setEventId("");
                }}
                placeholder="e.g. Solana Crossroads 2025"
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-lime-400 transition"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., breakpoint, official, limited-edition"
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
            />
          </div>

          {/* Shipping Info — hidden for NFTs */}
          {!isNftCategory && (
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ships From
                  </label>
                  <input
                    type="text"
                    value={shipsFrom}
                    onChange={(e) => setShipsFrom(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Shipping Cost ({currency})
                  </label>
                  <input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ships To
                  </label>
                  <input
                    type="text"
                    value={shipsTo}
                    onChange={(e) => setShipsTo(e.target.value)}
                    placeholder="Worldwide"
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estimated Delivery
                  </label>
                  <input
                    type="text"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    placeholder="7-14 business days"
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !title || !price}
              className="flex-1 !h-14 text-lg disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Listing"
              )}
            </Button>
            <Link href="/marketplace">
              <Button type="button" variant="secondary" className="!h-14 text-lg">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
