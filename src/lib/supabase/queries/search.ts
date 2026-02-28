import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Listing, User } from '@/types/marketplace';
import { transformListing } from './listings';
import { transformUser } from './users';

export async function searchListings(
  supabase: SupabaseClient<Database>,
  query: string,
  page: number = 0,
  pageSize: number = 20
): Promise<{ listings: Listing[]; count: number }> {
  const pattern = `%${query}%`;

  const { data, error, count } = await supabase
    .from('listings')
    .select('*, seller:users!seller_id(*), event:events!event_id(*)', {
      count: 'exact',
    })
    .eq('status', 'active')
    .or(`title.ilike.${pattern},description.ilike.${pattern}`)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;

  return {
    listings: (data ?? []).map(transformListing),
    count: count ?? 0,
  };
}

export async function searchUsers(
  supabase: SupabaseClient<Database>,
  query: string,
  page: number = 0,
  pageSize: number = 20
): Promise<{ users: User[]; count: number }> {
  const pattern = `%${query}%`;

  const { data, error, count } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;

  return {
    users: (data ?? []).map(transformUser),
    count: count ?? 0,
  };
}
