import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { username, displayName, bio, avatarUrl, coverImageUrl, socialLinks } =
      await request.json();

    const supabase = createAdminClient();

    // Validate username uniqueness if changed
    if (username && username !== user.username) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
    }

    const updates: Record<string, any> = {};
    if (username !== undefined) updates.username = username;
    if (displayName !== undefined) updates.display_name = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (coverImageUrl !== undefined) updates.cover_image_url = coverImageUrl;
    if (socialLinks !== undefined) updates.social_links = socialLinks;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
