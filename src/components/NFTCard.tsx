"use client";

import { NFTAsset } from "@/types/marketplace";
import { getAccountExplorerUrl } from "@/lib/solana/constants";

interface NFTCardProps {
  nft: NFTAsset;
  onSelect?: (nft: NFTAsset) => void;
  showListButton?: boolean;
}

export default function NFTCard({ nft, onSelect, showListButton }: NFTCardProps) {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden group hover:border-lime-400/50 transition">
      {/* Image */}
      <div className="aspect-square relative bg-neutral-800 overflow-hidden">
        {nft.image ? (
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">
            NFT
          </div>
        )}

        {/* Collection Badge */}
        {nft.collection && (
          <div className="absolute top-3 left-3">
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              nft.collection.verified
                ? "bg-lime-400 text-neutral-950"
                : "bg-neutral-800/90 text-white/70"
            }`}>
              {nft.collection.verified && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {nft.collection.name.length > 20
                ? nft.collection.name.slice(0, 17) + "..."
                : nft.collection.name}
            </div>
          </div>
        )}

        {/* NFT Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            NFT
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium truncate mb-1">{nft.name}</h3>
        {nft.symbol && (
          <p className="text-xs text-white/40 mb-2">{nft.symbol}</p>
        )}

        {/* Mint Address */}
        <a
          href={getAccountExplorerUrl(nft.mintAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/30 hover:text-lime-400 transition font-mono flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {nft.mintAddress.slice(0, 4)}...{nft.mintAddress.slice(-4)}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Attributes */}
        {nft.attributes && nft.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {nft.attributes.slice(0, 3).map((attr, i) => (
              <div
                key={i}
                className="bg-neutral-800 px-2 py-0.5 rounded text-xs text-white/50"
              >
                {attr.value}
              </div>
            ))}
            {nft.attributes.length > 3 && (
              <div className="bg-neutral-800 px-2 py-0.5 rounded text-xs text-white/30">
                +{nft.attributes.length - 3}
              </div>
            )}
          </div>
        )}

        {/* List Button */}
        {showListButton && onSelect && (
          <button
            onClick={() => onSelect(nft)}
            className="w-full mt-3 px-4 py-2 bg-lime-400/10 text-lime-400 rounded-xl text-sm font-medium hover:bg-lime-400/20 transition"
          >
            List This NFT
          </button>
        )}
      </div>
    </div>
  );
}
