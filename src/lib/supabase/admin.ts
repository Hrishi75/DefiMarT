import { createClient } from '@supabase/supabase-js';

// Admin client with service role key — only use in API routes (server-side)
// Uses untyped client since admin bypasses RLS and the strict types cause issues
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
