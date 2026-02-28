import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Extract the authenticated user from the session cookie.
 * Returns the user object or null if not authenticated.
 */
export async function getAuthUser(request: NextRequest) {
  const sessionToken = request.cookies.get('defimart-session')?.value;
  if (!sessionToken) return null;

  let session;
  try {
    session = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
  } catch {
    return null;
  }

  if (!session.exp || session.exp < Date.now()) return null;

  const supabase = createAdminClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.userId)
    .single();

  if (error || !user) return null;
  return user;
}
