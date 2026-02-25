import { Listing } from "@/types/marketplace";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface ListingCardProps {
  listing: Listing;
  viewMode?: 'grid' | 'list';
}

export default function ListingCard({ listing, viewMode = 'grid' }: ListingCardProps) {
  const isListView = viewMode === 'list';

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <div className={twMerge(
        "bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden hover:border-lime-400 transition-all duration-300 group cursor-pointer",
        isListView ? "flex" : ""
      )}>
        {/* Image */}
        <div className={twMerge(
          "relative overflow-hidden bg-neutral-800",
          isListView ? "w-48 h-48 flex-shrink-0" : "aspect-square"
        )}>
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* NFT Badge */}
          {listing.isNFT && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              NFT
            </div>
          )}

          {/* Verified Event Badge */}
          {listing.event.verified && (
            <div className="absolute top-3 right-3 bg-lime-400 text-neutral-950 p-1.5 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Condition Badge */}
          <div className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {listing.condition === 'new' && '🌟 New'}
            {listing.condition === 'like-new' && '✨ Like New'}
            {listing.condition === 'good' && '👍 Good'}
            {listing.condition === 'fair' && '👌 Fair'}
          </div>
        </div>

        {/* Content */}
        <div className={twMerge("p-4", isListView ? "flex-1 flex flex-col justify-between" : "")}>
          <div>
            {/* Event Tag */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-lime-400 font-medium">{listing.event.name}</span>
              <span className="text-white/30">•</span>
              <span className="text-xs text-white/50 capitalize">{listing.category}</span>
            </div>

            {/* Title */}
            <h3 className={twMerge(
              "font-medium text-white group-hover:text-lime-400 transition",
              isListView ? "text-xl mb-2" : "text-lg mb-3 line-clamp-2"
            )}>
              {listing.title}
            </h3>

            {/* Description (list view only) */}
            {isListView && (
              <p className="text-white/50 text-sm mb-4 line-clamp-2">
                {listing.description}
              </p>
            )}
          </div>

          <div>
            {/* Price and Stats */}
            <div className={twMerge(
              "flex items-center justify-between",
              isListView ? "mt-4 pt-4 border-t border-white/10" : ""
            )}>
              <div>
                <div className="text-2xl font-bold text-white">
                  {listing.price} <span className="text-lime-400">SOL</span>
                </div>
                {listing.shippingInfo && (
                  <div className="text-xs text-white/50 mt-1">
                    + {listing.shippingInfo.cost} SOL shipping
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-white/50 text-sm">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{listing.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{listing.favorites}</span>
                </div>
              </div>
            </div>

            {/* Seller Info (list view only) */}
            {isListView && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-sm font-bold">
                  {listing.seller.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{listing.seller.displayName}</div>
                  <div className="text-xs text-white/50">@{listing.seller.username}</div>
                </div>
                {listing.seller.verified && (
                  <svg className="w-4 h-4 text-lime-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}