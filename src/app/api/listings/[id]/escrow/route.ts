import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import { getEscrowPublicKeyString } from '@/lib/solana/escrow';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { transactionHash } = body;

    if (!transactionHash) {
      return NextResponse.json(
        { error: 'Missing transactionHash' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch the listing
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Must be the seller
    if (listing.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the seller can deposit to escrow' },
        { status: 403 }
      );
    }

    // Must be an NFT listing in active status
    if (!listing.is_nft) {
      return NextResponse.json(
        { error: 'Only NFT listings can be escrowed' },
        { status: 400 }
      );
    }

    if (listing.status !== 'active') {
      return NextResponse.json(
        { error: 'Listing must be in active status to escrow' },
        { status: 400 }
      );
    }

    const escrowAddress = getEscrowPublicKeyString();

    // Update listing to escrowed
    const { data: updated, error: updateError } = await supabase
      .from('listings')
      .update({
        status: 'escrowed',
        escrow_address: escrowAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Failed to update listing to escrowed:', updateError);
      return NextResponse.json(
        { error: 'Failed to update listing status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ listing: updated });
  } catch (err) {
    console.error('Escrow deposit error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
