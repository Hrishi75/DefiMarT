import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { searchListings, searchUsers } from '@/lib/supabase/queries/search';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const type = searchParams.get('type') ?? 'all';
  const page = parseInt(searchParams.get('page') ?? '0', 10);

  if (!q) {
    return NextResponse.json({ listings: [], users: [] });
  }

  const supabase = createAdminClient() as any;

  try {
    let listings: any[] = [];
    let users: any[] = [];

    if (type === 'all' || type === 'listings') {
      const result = await searchListings(supabase, q, page);
      listings = result.listings;
    }

    if (type === 'all' || type === 'users') {
      const result = await searchUsers(supabase, q, page);
      users = result.users;
    }

    return NextResponse.json({ listings, users });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
