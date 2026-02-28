import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import { returnNFTFromEscrow } from '@/lib/solana/escrow';

export async function PATCH(
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
    const supabase = createAdminClient();

    // Verify the listing belongs to this user (or is a valid status update)
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

    // Only the seller can update their listing
    if (listing.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this listing' },
        { status: 403 }
      );
    }

    // If cancelling an escrowed NFT listing, return NFT to seller
    if (body.status === 'cancelled' && listing.is_nft && listing.status === 'escrowed') {
      try {
        const nftMeta = listing.nft_metadata as Record<string, any> | null;
        const mintAddress = nftMeta?.mint_address || nftMeta?.mintAddress;

        const { data: sellerUser } = await supabase
          .from('users')
          .select('wallet_address')
          .eq('id', listing.seller_id)
          .single();

        if (mintAddress && sellerUser?.wallet_address) {
          const sellerPubkey = new PublicKey(sellerUser.wallet_address);
          const mintPubkey = new PublicKey(mintAddress);
          const sig = await returnNFTFromEscrow(sellerPubkey, mintPubkey);
          console.log('NFT returned from escrow:', sig);
        }
      } catch (escrowErr) {
        console.error('Failed to return NFT from escrow:', escrowErr);
        return NextResponse.json(
          { error: 'Failed to return NFT from escrow. Please try again.' },
          { status: 500 }
        );
      }

      // Clear escrow address on cancellation
      body.escrow_address = null;
    }

    const allowedFields: Record<string, any> = {};
    const updatable = ['title', 'description', 'price', 'status', 'images', 'shipping_info', 'tags', 'quantity', 'quantity_available', 'escrow_address'];
    for (const key of updatable) {
      if (body[key] !== undefined) {
        allowedFields[key] = body[key];
      }
    }

    const { data, error } = await supabase
      .from('listings')
      .update(allowedFields)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to update listing:', error);
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ listing: data });
  } catch (err) {
    console.error('Update listing error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
