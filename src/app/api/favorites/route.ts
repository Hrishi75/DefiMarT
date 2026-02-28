import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import { toggleFavorite, isFavorited, getUserFavorites } from '@/lib/supabase/queries/favorites';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const mine = request.nextUrl.searchParams.get('mine');
    const listingId = request.nextUrl.searchParams.get('listingId');

    const currentUser = await getAuthUser(request);

    // Return current user's favorited listings
    if (mine === 'true') {
      if (!currentUser) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const page = parseInt(request.nextUrl.searchParams.get('page') || '0', 10);
      const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '20', 10);
      const result = await getUserFavorites(supabase as any, currentUser.id, page, pageSize);

      return NextResponse.json(result);
    }

    // Check if current user favorited a specific listing
    if (listingId) {
      let favorited = false;
      if (currentUser) {
        favorited = await isFavorited(supabase as any, currentUser.id, listingId);
      }

      // Get total favorites count for this listing
      const { count } = await (supabase as any)
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', listingId);

      return NextResponse.json({ favorited, count: count ?? 0 });
    }

    return NextResponse.json(
      { error: 'Missing listingId or mine parameter' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Fetch favorites error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
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

    const { listingId } = await request.json();
    if (!listingId) {
      return NextResponse.json(
        { error: 'Missing listingId' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const favorited = await toggleFavorite(supabase as any, user.id, listingId);

    return NextResponse.json({ favorited });
  } catch (err) {
    console.error('Toggle favorite error:', err);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
