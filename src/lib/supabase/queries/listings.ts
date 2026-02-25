import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Listing, MarketplaceFilters, SortOption } from '@/types/marketplace';
import { transformUser } from './users';
import { transformEvent } from './events';

type DbListing = Database['public']['Tables']['listings']['Row'];

export function transformListing(
  row: DbListing & { seller?: any; event?: any }
): Listing {
  const nftMeta = row.nft_metadata as Record<string, any> | null;
  const shipInfo = row.shipping_info as Record<string, any> | null;

  return {
    id: row.id,
    sellerId: row.seller_id,
    seller: row.seller ? transformUser(row.seller) : ({} as any),
    event: row.event ? transformEvent(row.event) : ({} as any),
    title: row.title,
    description: row.description ?? '',
    images: row.images.length > 0 ? row.images : ['/api/placeholder/600/600'],
    category: row.category as Listing['category'],
    condition: row.condition as Listing['condition'],
    price: Number(row.price),
    currency: row.currency as 'SOL' | 'USDC',
    status: row.status as Listing['status'],
    quantity: row.quantity,
    quantityAvailable: row.quantity_available,
    isNFT: row.is_nft,
    nftMetadata: nftMeta
      ? {
          mintAddress: nftMeta.mint_address ?? '',
          metaplexUri: nftMeta.metaplex_uri ?? '',
          collection: nftMeta.collection,
        }
      : undefined,
    shippingInfo: shipInfo
      ? {
          shipsFrom: shipInfo.ships_from ?? '',
          shipsTo: shipInfo.ships_to ?? [],
          estimatedDays: shipInfo.estimated_days ?? '',
          cost: Number(shipInfo.cost ?? 0),
        }
      : undefined,
    escrowAddress: row.escrow_address ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    views: row.views,
    favorites: row.favorites,
    tags: row.tags,
  };
}

export async function getListings(
  supabase: SupabaseClient<Database>,
  filters: MarketplaceFilters = {},
  sort: SortOption = 'newest',
  page: number = 0,
  pageSize: number = 20
) {
  let query = supabase
    .from('listings')
    .select('*, seller:users!seller_id(*), event:events!event_id(*)', {
      count: 'exact',
    })
    .eq('status', 'active');

  if (filters.category && filters.category.length > 0) {
    query = query.in('category', filters.category);
  }
  if (filters.condition && filters.condition.length > 0) {
    query = query.in('condition', filters.condition);
  }
  if (filters.priceMin !== undefined) {
    query = query.gte('price', filters.priceMin);
  }
  if (filters.priceMax !== undefined) {
    query = query.lte('price', filters.priceMax);
  }
  if (filters.eventId) {
    query = query.eq('event_id', filters.eventId);
  }
  if (filters.isNFT !== undefined) {
    query = query.eq('is_nft', filters.isNFT);
  }

  // Sort
  const sortConfig: Record<string, { column: string; ascending: boolean }> = {
    'price-asc': { column: 'price', ascending: true },
    'price-desc': { column: 'price', ascending: false },
    newest: { column: 'created_at', ascending: false },
    oldest: { column: 'created_at', ascending: true },
    popular: { column: 'views', ascending: false },
  };
  const s = sortConfig[sort] || sortConfig['newest'];
  query = query.order(s.column, { ascending: s.ascending });

  // Pagination
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return {
    listings: (data ?? []).map(transformListing),
    count: count ?? 0,
  };
}

export async function getListingById(
  supabase: SupabaseClient<Database>,
  id: string
) {
  const { data, error } = await supabase
    .from('listings')
    .select('*, seller:users!seller_id(*), event:events!event_id(*)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return transformListing(data);
}

export async function getListingsBySeller(
  supabase: SupabaseClient<Database>,
  sellerId: string
) {
  const { data, error } = await supabase
    .from('listings')
    .select('*, seller:users!seller_id(*), event:events!event_id(*)')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformListing);
}

export async function createListing(
  supabase: SupabaseClient<Database>,
  listing: Database['public']['Tables']['listings']['Insert']
) {
  const { data, error } = await (supabase as any)
    .from('listings')
    .insert(listing)
    .select('*, seller:users!seller_id(*), event:events!event_id(*)')
    .single();

  if (error) throw error;
  return data ? transformListing(data) : null;
}
