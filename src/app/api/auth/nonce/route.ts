import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const nonce = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    const message = [
      'Sign this message to verify your DefiMarT wallet.',
      `Nonce: ${nonce}`,
      `Timestamp: ${new Date().toISOString()}`,
    ].join('\n');

    const supabase = createAdminClient();

    // Clean up old expired/used nonces for this wallet
    await supabase
      .from('auth_nonces')
      .delete()
      .eq('wallet_address', walletAddress)
      .or('used.eq.true,expires_at.lt.' + new Date().toISOString());

    // Store the nonce
    const { error } = await supabase.from('auth_nonces').insert({
      wallet_address: walletAddress,
      nonce,
      expires_at: expiresAt,
    } as any);

    if (error) {
      console.error('Failed to store nonce:', error);
      return NextResponse.json(
        { error: 'Failed to generate challenge' },
        { status: 500 }
      );
    }

    return NextResponse.json({ nonce, message });
  } catch (err) {
    console.error('Nonce generation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
