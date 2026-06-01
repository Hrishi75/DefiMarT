"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/hooks/useSupabase";
import { getListingById } from "@/lib/supabase/queries/listings";
import { Listing } from "@/types/marketplace";
import Button from "@/components/Button";
import Tag from "@/components/Tag";
import Link from "next/link";

export default function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = params;
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const supabase = useSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tags, setTags] = useState("");
  const [shipsFrom, setShipsFrom] = useState("");
  const [shipsTo, setShipsTo] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [shippingCost, setShippingCost] = useState("");

  // Image state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchListing();
  }, [resolvedParams.id]);

  async function fetchListing() {
    setLoading(true);
    try {
      const data = await getListingById(supabase, resolvedParams.id);
      if (!data) {
        setError("Listing not found");
        setLoading(false);
        return;
      }

      setListing(data);

      // Check ownership and status
      if (!user || data.sellerId !== user.id) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      if (data.status !== "active") {
        setError("Only active listings can be edited.");
        setLoading(false);
        return;
      }

      // Pre-fill form
      setTitle(data.title);
      setDescription(data.description);
      setPrice(String(data.price));
      setQuantity(data.quantity);
      setTags(data.tags.join(", "));
      setExistingImages(data.images.filter((img) => !img.includes("placeholder")));

      if (data.shippingInfo) {
        setShipsFrom(data.shippingInfo.shipsFrom);
        setShipsTo(data.shippingInfo.shipsTo.join(", "));
        setEstimatedDays(data.shippingInfo.estimatedDays);
        setShippingCost(data.shippingInfo.cost ? String(data.shippingInfo.cost) : "");
      }
    } catch {
      setError("Failed to load listing");
    } finally {
      setLoading(false);
    }
  }

  // Re-check ownership once auth finishes loading
  useEffect(() => {
    if (!authLoading && listing) {
      if (!user || listing.sellerId !== user.id) {
        setUnauthorized(true);
      } else {
        setUnauthorized(false);
      }
    }
  }, [authLoading, user, listing]);

  function handleNewImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImageFiles.length + files.length;
    if (totalImages > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    const updated = [...newImageFiles, ...files];
    setNewImageFiles(updated);

    // Create previews
    const previews = updated.map((file) => URL.createObjectURL(file));
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImagePreviews(previews);
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImages(): Promise<string[]> {
    const urls: string[] = [];
    for (const file of newImageFiles) {
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
      // Upload new images
      let uploadedUrls: string[] = [];
      if (newImageFiles.length > 0) {
        uploadedUrls = await uploadImages();
      }

      const allImages = [...existingImages, ...uploadedUrls];

      // Build shipping info (only for non-NFT listings)
      const shippingInfo =
        !listing?.isNFT && (shipsFrom || shippingCost)
          ? {
              ships_from: shipsFrom,
              ships_to: shipsTo
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              estimated_days: estimatedDays,
              cost: Number(shippingCost) || 0,
            }
          : listing?.isNFT
            ? null
            : undefined;

      const body: Record<string, unknown> = {
        title,
        description,
        price: Number(price),
        images: allImages,
        quantity: listing?.isNFT ? 1 : quantity,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (shippingInfo !== undefined) {
        body.shippingInfo = shippingInfo;
      }

      const res = await fetch(`/api/listings/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update listing");
      }

      router.push(`/marketplace/${resolvedParams.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const totalImages = existingImages.length + newImageFiles.length;

  // --- Loading state ---
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  // --- Not authorized ---
  if (unauthorized) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-medium mb-2">Not Authorized</h2>
          <p className="text-white/50 mb-6">
            You do not have permission to edit this listing.
          </p>
          <Link href={`/marketplace/${resolvedParams.id}`}>
            <Button variant="secondary">Back to Listing</Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- Listing not found or non-active error ---
  if (!listing || error === "Listing not found") {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-medium mb-2">Listing not found</h2>
          <p className="text-white/50 mb-6">
            This item doesn&apos;t exist or has been removed.
          </p>
          <Link href="/marketplace">
            <Button variant="secondary">Back to Marketplace</Button>
          </Link>
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
          <Link
            href={`/marketplace/${resolvedParams.id}`}
            className="hover:text-lime-400 transition"
          >
            {listing.title}
          </Link>
          <span>&rsaquo;</span>
          <span className="text-white">Edit</span>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <Tag>Edit Listing</Tag>
          <h1 className="text-4xl font-bold">Edit Listing</h1>
        </div>

        {/* Non-editable info */}
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 mb-8">
          <h3 className="text-sm text-white/50 mb-4 uppercase tracking-wider">
            Listing Details (read-only)
          </h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <span className="text-sm text-white/50 mb-2 block">Category</span>
              <span className="bg-neutral-800 border border-white/10 rounded-xl px-4 py-2 text-white inline-block capitalize">
                {listing.category}
              </span>
            </div>
            <div>
              <span className="text-sm text-white/50 mb-2 block">Condition</span>
              <span className="bg-neutral-800 border border-white/10 rounded-xl px-4 py-2 text-white inline-block capitalize">
                {listing.condition === "like-new" ? "Like New" : listing.condition}
              </span>
            </div>
            {listing.isNFT && (
              <div>
                <span className="text-sm text-white/50 mb-2 block">Type</span>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-xl inline-block">
                  NFT
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images */}
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
            <label className="block text-sm text-white/50 mb-2">
              Images (up to 5)
            </label>
            <div className="flex flex-wrap gap-4">
              {/* Existing images */}
              {existingImages.map((src, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative w-28 h-28 rounded-xl overflow-hidden border border-white/10 group"
                >
                  <img
                    src={src}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {/* New image previews */}
              {newImagePreviews.map((preview, index) => (
                <div
                  key={`new-${index}`}
                  className="relative w-28 h-28 rounded-xl overflow-hidden border border-lime-400/30 group"
                >
                  <img
                    src={preview}
                    alt={`New ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-lime-400 text-neutral-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    NEW
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {/* Add button */}
              {totalImages < 5 && (
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
                onChange={handleNewImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Title */}
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
            <label className="block text-sm text-white/50 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Listing title"
              className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
            />
          </div>

          {/* Description */}
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
            <label className="block text-sm text-white/50 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe your item..."
              className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition resize-none"
            />
          </div>

          {/* Price & Quantity */}
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-white/50 mb-2">
                  Price (SOL) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={listing.isNFT ? 1 : quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  disabled={listing.isNFT}
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
            <label className="block text-sm text-white/50 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., breakpoint, official, limited-edition"
              className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
            />
          </div>

          {/* Shipping Info — hidden for NFTs */}
          {!listing.isNFT && (
            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
              <h3 className="text-lg font-medium mb-6">Shipping Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-white/50 mb-2">
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
                    <label className="block text-sm text-white/50 mb-2">
                      Shipping Cost (SOL)
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-white/50 mb-2">
                      Ships To (comma-separated)
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
                    <label className="block text-sm text-white/50 mb-2">
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
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Link href={`/marketplace/${resolvedParams.id}`}>
              <Button
                type="button"
                variant="secondary"
                className="!h-14 text-lg"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
