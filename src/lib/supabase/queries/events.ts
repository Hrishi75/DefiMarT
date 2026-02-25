import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Event } from '@/types/marketplace';

type DbEvent = Database['public']['Tables']['events']['Row'];

export function transformEvent(row: DbEvent): Event {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    coverImage: row.cover_image_url ?? '/api/placeholder/1200/400',
    logo: row.logo_url ?? undefined,
    location: row.location,
    date: new Date(row.date),
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    organizer: row.organizer,
    verified: row.verified,
    totalItems: row.total_items,
    totalCollectors: row.total_collectors,
    tags: row.tags,
    website: row.website ?? undefined,
    onChainVerification: row.on_chain_contract_address
      ? {
          contractAddress: row.on_chain_contract_address,
          verified: row.on_chain_verified,
        }
      : undefined,
  };
}

export async function getEvents(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformEvent);
}

export async function getEventById(
  supabase: SupabaseClient<Database>,
  id: string
) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return transformEvent(data);
}

export async function getEventBySlug(
  supabase: SupabaseClient<Database>,
  slug: string
) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return transformEvent(data);
}
