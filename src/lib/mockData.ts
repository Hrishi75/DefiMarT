// Mock data for development
import { User, Event, Listing, Post, Transaction } from '@/types/marketplace';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    username: 'solana_dev',
    displayName: 'Solana Developer',
    bio: 'Building on Solana since Day 1. Collector of rare event merch.',
    avatar: '/placeholder.svg',
    verified: true,
    eventsAttended: ['breakpoint-2024', 'solana-hacker-house-sf'],
    createdAt: new Date('2024-01-15'),
    stats: {
      itemsOwned: 24,
      itemsSold: 12,
      totalSales: 15.5,
      reputation: 98,
    },
  },
  {
    id: 'user-2',
    walletAddress: 'CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq',
    username: 'nft_collector',
    displayName: 'NFT Enthusiast',
    bio: 'Passionate about Solana NFTs and event collectibles',
    avatar: '/placeholder.svg',
    verified: true,
    eventsAttended: ['breakpoint-2024', 'solana-summit-2024'],
    createdAt: new Date('2024-02-20'),
    stats: {
      itemsOwned: 42,
      itemsSold: 8,
      totalSales: 8.2,
      reputation: 95,
    },
  },
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: 'breakpoint-2024',
    name: 'Breakpoint 2024',
    description: 'The biggest Solana conference of the year',
    coverImage: '/placeholder.svg',
    logo: '/placeholder.svg',
    location: 'Singapore',
    date: new Date('2024-09-20'),
    endDate: new Date('2024-09-23'),
    organizer: 'Solana Foundation',
    verified: true,
    totalItems: 156,
    totalCollectors: 2834,
    tags: ['conference', 'official', 'solana'],
    website: 'https://breakpoint.solana.com',
    onChainVerification: {
      contractAddress: 'BreakpointVerified2024...',
      verified: true,
    },
  },
  {
    id: 'solana-hacker-house-sf',
    name: 'Solana Hacker House SF',
    description: 'Build, learn, and connect in San Francisco',
    coverImage: '/placeholder.svg',
    location: 'San Francisco, CA',
    date: new Date('2024-10-05'),
    endDate: new Date('2024-10-07'),
    organizer: 'Solana Foundation',
    verified: true,
    totalItems: 48,
    totalCollectors: 234,
    tags: ['hacker-house', 'builders', 'community'],
  },
  {
    id: 'solana-summit-2024',
    name: 'Solana Summit 2024',
    description: 'Community-driven summit across multiple cities',
    coverImage: '/placeholder.svg',
    location: 'Multiple Locations',
    date: new Date('2024-08-15'),
    organizer: 'Community Led',
    verified: false,
    totalItems: 89,
    totalCollectors: 567,
    tags: ['community', 'summit', 'global'],
  },
];

// Mock Listings
export const mockListings: Listing[] = [
  {
    id: 'listing-1',
    itemId: 'item-1',
    sellerId: 'user-1',
    seller: mockUsers[0],
    event: mockEvents[0],
    title: 'Breakpoint 2024 Limited Edition T-Shirt',
    description: 'Official Breakpoint 2024 conference t-shirt. Size L. Never worn, still in original packaging. Features exclusive event branding.',
    images: ['/solana-tshirt.jpg'],
    category: 'apparel',
    condition: 'new',
    price: 0.5,
    currency: 'SOL',
    status: 'active',
    quantity: 1,
    quantityAvailable: 1,
    isNFT: false,
    shippingInfo: {
      shipsFrom: 'Singapore',
      shipsTo: ['Worldwide'],
      estimatedDays: '7-14 business days',
      cost: 0.05,
    },
    createdAt: new Date('2024-09-25'),
    updatedAt: new Date('2024-09-25'),
    views: 234,
    favorites: 18,
    tags: ['breakpoint', 'official', 't-shirt', 'limited-edition'],
  },
  {
    id: 'listing-2',
    itemId: 'item-2',
    sellerId: 'user-2',
    seller: mockUsers[1],
    event: mockEvents[0],
    title: 'Breakpoint 2024 Attendee NFT Badge',
    description: 'Verified proof of attendance NFT from Breakpoint 2024. Includes on-chain verification and special holder benefits.',
    images: ['/placeholder.svg'],
    category: 'nft',
    condition: 'new',
    price: 25,
    currency: 'USDC',
    status: 'active',
    quantity: 1,
    quantityAvailable: 1,
    isNFT: true,
    nftMetadata: {
      mintAddress: 'BreakpointNFT2024abc123...',
      metaplexUri: 'https://arweave.net/...',
      collection: 'Breakpoint 2024 Official',
    },
    createdAt: new Date('2024-09-24'),
    updatedAt: new Date('2024-09-24'),
    views: 567,
    favorites: 42,
    tags: ['breakpoint', 'nft', 'proof-of-attendance', 'verified'],
  },
  {
    id: 'listing-3',
    itemId: 'item-3',
    sellerId: 'user-1',
    seller: mockUsers[0],
    event: mockEvents[1],
    title: 'Solana Hacker House Hoodie',
    description: 'Exclusive hoodie from SF Hacker House. Size M. Worn once, excellent condition.',
    images: ['/placeholder.svg', '/placeholder.svg'],
    category: 'apparel',
    condition: 'like-new',
    price: 0.8,
    currency: 'SOL',
    status: 'active',
    quantity: 1,
    quantityAvailable: 1,
    isNFT: false,
    shippingInfo: {
      shipsFrom: 'San Francisco, CA',
      shipsTo: ['USA', 'Canada'],
      estimatedDays: '3-7 business days',
      cost: 0.03,
    },
    createdAt: new Date('2024-10-08'),
    updatedAt: new Date('2024-10-08'),
    views: 145,
    favorites: 12,
    tags: ['hacker-house', 'hoodie', 'exclusive'],
  },
  {
    id: 'listing-4',
    itemId: 'item-4',
    sellerId: 'user-2',
    seller: mockUsers[1],
    event: mockEvents[0],
    title: 'Breakpoint VIP Lanyard & Badge Set',
    description: 'Complete VIP access badge and lanyard from Breakpoint 2024. Includes all original materials.',
    images: ['/placeholder.svg'],
    category: 'collectible',
    condition: 'like-new',
    price: 15,
    currency: 'PYUSD',
    status: 'active',
    quantity: 1,
    quantityAvailable: 1,
    isNFT: false,
    shippingInfo: {
      shipsFrom: 'Singapore',
      shipsTo: ['Worldwide'],
      estimatedDays: '7-14 business days',
      cost: 0.02,
    },
    createdAt: new Date('2024-09-26'),
    updatedAt: new Date('2024-09-26'),
    views: 89,
    favorites: 7,
    tags: ['breakpoint', 'vip', 'badge', 'collectible'],
  },
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: 'post-1',
    userId: 'user-1',
    user: mockUsers[0],
    content: 'Just got my hands on this rare Breakpoint 2024 merch! The quality is incredible 🔥',
    images: ['/placeholder.svg'],
    linkedItemId: 'listing-1',
    linkedItem: mockListings[0],
    eventId: 'breakpoint-2024',
    event: mockEvents[0],
    likes: 234,
    comments: 18,
    shares: 12,
    createdAt: new Date('2024-09-25T14:30:00'),
    tags: ['breakpoint', 'merch', 'collection'],
  },
  {
    id: 'post-2',
    userId: 'user-2',
    user: mockUsers[1],
    content: 'Finally completed my Breakpoint collection! Check out this NFT badge 🎉',
    images: ['/placeholder.svg'],
    linkedItemId: 'listing-2',
    eventId: 'breakpoint-2024',
    likes: 156,
    comments: 24,
    shares: 8,
    createdAt: new Date('2024-09-24T10:15:00'),
    tags: ['nft', 'collection', 'breakpoint'],
  },
];

// Helper functions
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getEventById = (id: string): Event | undefined => {
  return mockEvents.find(event => event.id === id);
};

export const getListingById = (id: string): Listing | undefined => {
  return mockListings.find(listing => listing.id === id);
};

export const getListingsByEvent = (eventId: string): Listing[] => {
  return mockListings.filter(listing => listing.event.id === eventId);
};

export const getListingsBySeller = (sellerId: string): Listing[] => {
  return mockListings.filter(listing => listing.sellerId === sellerId);
};

export const getFeaturedListings = (): Listing[] => {
  return mockListings.slice(0, 4);
};

export const getRecentPosts = (limit: number = 10): Post[] => {
  return mockPosts
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};