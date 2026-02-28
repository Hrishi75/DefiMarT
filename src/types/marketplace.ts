// Core marketplace type definitions

export type ListingStatus = 'active' | 'sold' | 'pending' | 'cancelled' | 'escrowed';
export type ItemCondition = 'new' | 'like-new' | 'good' | 'fair';
export type ItemCategory = 'apparel' | 'collectible' | 'nft' | 'accessory' | 'badge' | 'other';
export type TransactionStatus = 'pending' | 'escrowed' | 'confirmed' | 'shipped' | 'completed' | 'failed' | 'refunded' | 'disputed';
export type TokenCurrency = 'SOL' | 'USDC' | 'PYUSD' | 'EURC';

export interface User {
  id: string;
  walletAddress: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  verified: boolean;
  eventsAttended: string[];
  createdAt: Date;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
  stats: {
    itemsOwned: number;
    itemsSold: number;
    totalSales: number;
    reputation: number;
  };
}

export interface Event {
  id: string;
  slug?: string;
  name: string;
  description: string;
  coverImage: string;
  logo?: string;
  location: string;
  date: Date;
  endDate?: Date;
  organizer: string;
  verified: boolean;
  totalItems: number;
  totalCollectors: number;
  tags: string[];
  website?: string;
  onChainVerification?: {
    contractAddress: string;
    verified: boolean;
  };
}

export interface Listing {
  id: string;
  itemId?: string;
  sellerId: string;
  seller: User;
  event: Event;
  title: string;
  description: string;
  images: string[];
  category: ItemCategory;
  condition: ItemCondition;
  price: number;
  currency: TokenCurrency;
  status: ListingStatus;
  quantity: number;
  quantityAvailable: number;
  isNFT: boolean;
  nftMetadata?: {
    mintAddress: string;
    metaplexUri: string;
    collection?: string;
  };
  shippingInfo?: {
    shipsFrom: string;
    shipsTo: string[];
    estimatedDays: string;
    cost: number;
  };
  escrowAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  favorites: number;
  tags: string[];
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  items: string[]; // item IDs
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  images?: string[];
  linkedItemId?: string;
  linkedItem?: Listing;
  eventId?: string;
  event?: Event;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  tags: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  parentCommentId?: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  listingId: string;
  listing: Listing;
  buyerId: string;
  buyer: User;
  sellerId: string;
  seller: User;
  amount: number;
  currency: TokenCurrency;
  status: TransactionStatus;
  transactionHash?: string;
  escrowAddress?: string;
  shippingTracking?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'sale' | 'purchase' | 'message' | 'follow' | 'like' | 'comment' | 'review';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participant1: string;
  participant2: string;
  otherUser: User;
  lastMessage?: Message;
  lastMessageAt: Date;
  unreadCount: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewer: User;
  reviewedId: string;
  listingId: string;
  transactionId: string;
  rating: number;
  content?: string;
  createdAt: Date;
}

// NFT types
export interface NFTAttribute {
  traitType: string;
  value: string;
}

export interface NFTAsset {
  mintAddress: string;
  name: string;
  symbol: string;
  image: string;
  description: string;
  collection?: {
    name: string;
    verified: boolean;
    address: string;
  };
  attributes?: NFTAttribute[];
  owner: string;
  uri: string;
}

// Filter and sort types
export interface MarketplaceFilters {
  category?: ItemCategory[];
  condition?: ItemCondition[];
  priceMin?: number;
  priceMax?: number;
  eventId?: string;
  isNFT?: boolean;
  verified?: boolean;
  tags?: string[];
}

export type SortOption =
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'oldest'
  | 'popular'
  | 'ending-soon';
