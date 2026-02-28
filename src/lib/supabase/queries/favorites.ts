import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Listing } from '@/types/marketplace';
import { transformListing } from './listings';

export async function toggleFavorite(
  supabase: SupabaseClient<Database>,
  userId: string,
  listingId: string
): Promise<boolean> {
  // Check if favorite already exists
  const { data: existing } = await (supabase as any)
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .single();

  if (existing) {
    // Remove favorite
    await (supabase as any)
      .from('favorites')
      .delete()
      .eq('id', existing.id);

    // Decrement favorites counter on listing
    await (supabase as any).rpc('decrement_favorites', {
      listing_id: listingId,
    });

    // Fallback: direct update if RPC not available
    // await (supabase as any)
    //   .from('listings')
    //   .update({ favorites: Math.max(0, currentCount - 1) })
    //   .eq('id', listingId);

    return false; // unfavorited
  } else {
    // Add favorite
    await (supabase as any)
      .from('favorites')
      .insert({ user_id: userId, listing_id: listingId });

    // Increment favorites counter on listing
    await (supabase as any).rpc('increment_favorites', {
      listing_id: listingId,
    });

    return true; // favorited
  }
}

export async function isFavorited(
  supabase: SupabaseClient<Database>,
  userId: string,
  listingId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('favorites' as any)
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .single();

  return !!data;
}

export async function getUserFavorites(
  supabase: SupabaseClient<Database>,
  userId: string,
  page: number = 0,
  pageSize: number = 20
): Promise<{ listings: Listing[]; count: number }> {
  const { data, error, count } = await (supabase as any)
    .from('favorites')
    .select(
      '*, listing:listings!listing_id(*, seller:users!seller_id(*), event:events!event_id(*))',
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;

  const listings = (data ?? [])
    .filter((row: any) => row.listing)
    .map((row: any) => transformListing(row.listing));

  return {
    listings,
    count: count ?? 0,
  };
}
