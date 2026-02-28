import { NextResponse } from 'next/server';
import { getEscrowPublicKeyString } from '@/lib/solana/escrow';

export async function GET() {
  try {
    const escrowAddress = getEscrowPublicKeyString();
    return NextResponse.json({ escrowAddress });
  } catch (err) {
    console.error('Failed to get escrow address:', err);
    return NextResponse.json(
      { error: 'Escrow not configured' },
      { status: 500 }
    );
  }
}
