import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Review } from '@/types/marketplace';
import { transformUser } from './users';

export function transformReview(row: any): Review {
  return {
    id: row.id,
    reviewerId: row.reviewer_id,
    reviewer: row.reviewer ? transformUser(row.reviewer) : ({} as any),
    reviewedId: row.reviewed_id,
    listingId: row.listing_id,
    transactionId: row.transaction_id,
    rating: row.rating,
    content: row.content ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

export async function getReviewsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  page: number = 0,
  pageSize: number = 20
): Promise<{ reviews: Review[]; count: number; averageRating: number }> {
  const { data, error, count } = await supabase
    .from('reviews')
    .select('*, reviewer:users!reviewer_id(*)', { count: 'exact' })
    .eq('reviewed_id', userId)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;

  const reviews = (data ?? []).map(transformReview);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return { reviews, count: count ?? 0, averageRating };
}

export async function getReviewsForListing(
  supabase: SupabaseClient<Database>,
  listingId: string
): Promise<{ reviews: Review[]; averageRating: number }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:users!reviewer_id(*)')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const reviews = (data ?? []).map(transformReview);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return { reviews, averageRating };
}

export async function getReviewForTransaction(
  supabase: SupabaseClient<Database>,
  transactionId: string,
  reviewerId: string
): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:users!reviewer_id(*)')
    .eq('transaction_id', transactionId)
    .eq('reviewer_id', reviewerId)
    .single();

  if (error || !data) return null;
  return transformReview(data);
}

export async function createReview(
  supabase: SupabaseClient<Database>,
  review: Database['public']['Tables']['reviews']['Insert']
): Promise<Review> {
  const { data, error } = await (supabase as any)
    .from('reviews')
    .insert(review)
    .select('*, reviewer:users!reviewer_id(*)')
    .single();

  if (error) throw error;

  // Update the reviewed user's reputation
  await updateUserReputation(supabase, review.reviewed_id);

  return transformReview(data);
}

export async function updateUserReputation(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewed_id', userId);

  if (!data || data.length === 0) return;

  const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length;
  // Map 1-5 rating to 0-100 reputation
  const reputation = Math.round(avg * 20);

  await (supabase as any)
    .from('users')
    .update({ reputation })
    .eq('id', userId);
}
