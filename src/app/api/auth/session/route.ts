import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('defimart-session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null });
    }

    // Decode the session token
    let session;
    try {
      session = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    } catch {
      return NextResponse.json({ user: null });
    }

    // Check expiry
    if (!session.exp || session.exp < Date.now()) {
      const response = NextResponse.json({ user: null });
      response.cookies.delete('defimart-session');
      return response;
    }

    // Fetch the user from database
    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .single();

    if (error || !user) {
      const response = NextResponse.json({ user: null });
      response.cookies.delete('defimart-session');
      return response;
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Session check error:', err);
    return NextResponse.json({ user: null });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('defimart-session');
  return response;
}
