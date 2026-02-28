"use client";

import { useState, useEffect } from "react";
import { NFTAsset } from "@/types/marketplace";
import NFTCard from "./NFTCard";

interface NFTGalleryProps {
  walletAddress: string;
  isOwnProfile?: boolean;
  onSelectNFT?: (nft: NFTAsset) => void;
}

export default function NFTGallery({
  walletAddress,
  isOwnProfile = false,
  onSelectNFT,
}: NFTGalleryProps) {
  const [nfts, setNfts] = useState<NFTAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      fetchNFTs();
    }
  }, [walletAddress]);

  async function fetchNFTs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/nft/wallet?address=${walletAddress}`);
      if (!res.ok) throw new Error("Failed to fetch NFTs");
      const data = await res.json();
      setNfts(data.nfts || []);
    } catch (err: any) {
      console.warn("Failed to load NFTs:", err);
      setError("Could not load NFTs from this wallet.");
      setNfts([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-neutral-900 border border-white/10 rounded-2xl aspect-square animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-white/20 text-5xl mb-4">⚠</div>
        <p className="text-white/50">{error}</p>
        <button
          onClick={fetchNFTs}
          className="mt-4 px-4 py-2 bg-neutral-900 border border-white/10 rounded-full text-sm hover:border-lime-400 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-white/20 text-5xl mb-4">🖼</div>
        <h3 className="text-xl font-medium mb-2">No NFTs Found</h3>
        <p className="text-white/50 text-sm">
          {isOwnProfile
            ? "No NFTs found in your wallet. Mint or purchase NFTs to see them here."
            : "This wallet doesn't have any NFTs yet."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-white/50">{nfts.length} NFT{nfts.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <NFTCard
            key={nft.mintAddress}
            nft={nft}
            showListButton={isOwnProfile}
            onSelect={onSelectNFT}
          />
        ))}
      </div>
    </div>
  );
}
