import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Transaction, TokenCurrency } from '@/types/marketplace';
import { transformListing } from './listings';
import { transformUser } from './users';

type DbTransaction = Database['public']['Tables']['transactions']['Row'];

export function transformTransaction(
  row: DbTransaction & { listing?: any; buyer?: any; seller?: any }
): Transaction {
  return {
    id: row.id,
    listingId: row.listing_id,
    listing: row.listing ? transformListing(row.listing) : ({} as any),
    buyerId: row.buyer_id,
    buyer: row.buyer ? transformUser(row.buyer) : ({} as any),
    sellerId: row.seller_id,
    seller: row.seller ? transformUser(row.seller) : ({} as any),
    amount: Number(row.amount),
    currency: (row.currency || 'SOL') as TokenCurrency,
    status: row.status as Transaction['status'],
    transactionHash: row.transaction_hash ?? undefined,
    escrowAddress: row.escrow_address ?? undefined,
    shippingTracking: row.shipping_tracking ?? undefined,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}

const TX_SELECT = `
  *,
  listing:listings!listing_id(*, seller:users!seller_id(*), event:events!event_id(*)),
  buyer:users!buyer_id(*),
  seller:users!seller_id(*)
`;

export async function getTransactionsByBuyer(
  supabase: SupabaseClient<Database>,
  buyerId: string
) {
  const { data, error } = await supabase
    .from('transactions')
    .select(TX_SELECT)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformTransaction);
}

export async function getTransactionsBySeller(
  supabase: SupabaseClient<Database>,
  sellerId: string
) {
  const { data, error } = await supabase
    .from('transactions')
    .select(TX_SELECT)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformTransaction);
}

export async function getTransactionById(
  supabase: SupabaseClient<Database>,
  id: string
) {
  const { data, error } = await supabase
    .from('transactions')
    .select(TX_SELECT)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return transformTransaction(data);
}

export async function createTransaction(
  supabase: SupabaseClient<Database>,
  transaction: Database['public']['Tables']['transactions']['Insert']
) {
  const { data, error } = await (supabase as any)
    .from('transactions')
    .insert(transaction)
    .select(TX_SELECT)
    .single();

  if (error) throw error;
  return data ? transformTransaction(data) : null;
}

export async function updateTransactionStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database['public']['Tables']['transactions']['Update']
) {
  const { data, error } = await (supabase as any)
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select(TX_SELECT)
    .single();

  if (error) throw error;
  return data ? transformTransaction(data) : null;
}
