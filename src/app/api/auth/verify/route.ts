import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, nonce } = await request.json();

    if (!walletAddress || !signature || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, signature, nonce' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch the nonce record
    const { data: nonceRecord, error: nonceError } = await supabase
      .from('auth_nonces')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('nonce', nonce)
      .eq('used', false)
      .single();

    if (nonceError || !nonceRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 401 }
      );
    }

    // Check expiry
    if (new Date(nonceRecord.expires_at) < new Date()) {
      await supabase
        .from('auth_nonces')
        .update({ used: true } as any)
        .eq('id', nonceRecord.id);
      return NextResponse.json(
        { error: 'Nonce has expired' },
        { status: 401 }
      );
    }

    // Reconstruct the message that was signed
    const message = [
      'Sign this message to verify your DefiMarT wallet.',
      `Nonce: ${nonce}`,
      `Timestamp: ${nonceRecord.created_at}`,
    ].join('\n');

    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = new Uint8Array(signature);
    const publicKeyBytes = bs58.decode(walletAddress);

    // Verify the Ed25519 signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Mark nonce as used
    await supabase
      .from('auth_nonces')
      .update({ used: true } as any)
      .eq('id', nonceRecord.id);

    // Upsert user — create if first time, update if returning
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    let user;

    if (existingUser) {
      user = existingUser;
    } else {
      // Generate a username from wallet address
      const shortAddr = walletAddress.slice(0, 6).toLowerCase();
      const username = `user_${shortAddr}`;

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          username,
          display_name: `User ${shortAddr}`,
        } as any)
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create user:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      user = newUser;
    }

    // Create a session token (simple JWT-like approach using the user ID)
    // In production, you'd use Supabase Auth with custom tokens
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: user.id,
        walletAddress: user.wallet_address,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })
    ).toString('base64');

    const response = NextResponse.json({ user, sessionToken });

    // Set session cookie
    response.cookies.set('defimart-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
