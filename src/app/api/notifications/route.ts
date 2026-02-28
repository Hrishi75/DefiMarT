import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/lib/supabase/queries/notifications';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    const countOnly = request.nextUrl.searchParams.get('countOnly');

    if (countOnly === 'true') {
      const unreadCount = await getUnreadCount(supabase, user.id);
      return NextResponse.json({ unreadCount });
    }

    const page = Number(request.nextUrl.searchParams.get('page') ?? '0');
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20');
    const result = await getNotifications(supabase, user.id, page, limit);

    return NextResponse.json(result);
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { notificationId, markAll } = await request.json();
    const supabase = createAdminClient();

    if (markAll) {
      await markAllAsRead(supabase, user.id);
    } else if (notificationId) {
      await markAsRead(supabase, notificationId);
    } else {
      return NextResponse.json(
        { error: 'Provide notificationId or markAll: true' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
