import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import {
  getReviewsForUser,
  getReviewsForListing,
  getReviewForTransaction,
  createReview,
} from '@/lib/supabase/queries/reviews';
import { createNotification } from '@/lib/supabase/queries/notifications';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const listingId = request.nextUrl.searchParams.get('listingId');
    const transactionId = request.nextUrl.searchParams.get('transactionId');

    const supabase = createAdminClient();

    if (transactionId) {
      const user = await getAuthUser(request);
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      const review = await getReviewForTransaction(supabase, transactionId, user.id);
      return NextResponse.json({ review });
    }

    if (userId) {
      const page = Number(request.nextUrl.searchParams.get('page') ?? '0');
      const result = await getReviewsForUser(supabase, userId, page);
      return NextResponse.json(result);
    }

    if (listingId) {
      const result = await getReviewsForListing(supabase, listingId);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Provide userId, listingId, or transactionId parameter' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Fetch reviews error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { transactionId, listingId, reviewedId, rating, content } =
      await request.json();

    if (!transactionId || !listingId || !reviewedId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify transaction exists and is completed
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed transactions' },
        { status: 400 }
      );
    }

    // Verify reviewer is buyer or seller
    if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to review this transaction' },
        { status: 403 }
      );
    }

    // Check for duplicate review
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('transaction_id', transactionId)
      .eq('reviewer_id', user.id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this transaction' },
        { status: 409 }
      );
    }

    const review = await createReview(supabase, {
      reviewer_id: user.id,
      reviewed_id: reviewedId,
      listing_id: listingId,
      transaction_id: transactionId,
      rating,
      content: content?.trim() || null,
    });

    // Notify the reviewed user
    await createNotification(supabase, {
      user_id: reviewedId,
      type: 'review',
      title: 'New review received',
      message: `${user.display_name || user.username} gave you ${rating} star${rating !== 1 ? 's' : ''}`,
      link: `/profile/${reviewedId}`,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error('Create review error:', err);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
