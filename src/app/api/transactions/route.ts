import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import { createNotification } from '@/lib/supabase/queries/notifications';
import { transferNFTFromEscrow } from '@/lib/solana/escrow';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, transactionHash, amount, currency } = body;
    const validCurrencies = ['SOL', 'USDC', 'PYUSD', 'EURC'];
    const txCurrency = currency && validCurrencies.includes(currency) ? currency : 'SOL';

    if (!listingId || !transactionHash || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: listingId, transactionHash, amount' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch the listing to get seller info
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.status !== 'active' && listing.status !== 'escrowed') {
      return NextResponse.json(
        { error: 'Listing is not available for purchase' },
        { status: 400 }
      );
    }

    if (listing.seller_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot buy your own listing' },
        { status: 400 }
      );
    }

    // Create the transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        amount: Number(amount),
        currency: txCurrency,
        status: 'confirmed',
        transaction_hash: transactionHash,
      })
      .select('*')
      .single();

    if (txError) {
      console.error('Failed to create transaction:', txError);
      return NextResponse.json(
        { error: `Failed to record transaction: ${txError.message}` },
        { status: 500 }
      );
    }

    // Update listing status to sold and decrease quantity
    const newQuantityAvailable = listing.quantity_available - 1;
    await supabase
      .from('listings')
      .update({
        status: newQuantityAvailable <= 0 ? 'sold' : 'active',
        quantity_available: newQuantityAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    // Increment seller stats
    const { data: seller } = await supabase
      .from('users')
      .select('items_sold, total_sales')
      .eq('id', listing.seller_id)
      .single();
    if (seller) {
      await supabase
        .from('users')
        .update({
          items_sold: (seller.items_sold ?? 0) + 1,
          total_sales: (seller.total_sales ?? 0) + Number(amount),
        })
        .eq('id', listing.seller_id);
    }

    // Create notifications for buyer and seller
    try {
      await createNotification(supabase, {
        user_id: user.id,
        type: 'purchase',
        title: `You purchased "${listing.title}"`,
        message: `${amount} ${txCurrency} — Transaction confirmed on Solana`,
        link: `/orders`,
      });

      await createNotification(supabase, {
        user_id: listing.seller_id,
        type: 'sale',
        title: `Your item "${listing.title}" was sold!`,
        message: `${amount} ${txCurrency} — A buyer just purchased your listing`,
        link: `/orders`,
      });
    } catch (notifErr) {
      console.warn('Failed to create notifications:', notifErr);
      // Don't fail the transaction for notification errors
    }

    // Transfer NFT from escrow to buyer (if this is an escrowed NFT listing)
    let nftTransferSignature: string | null = null;
    if (listing.is_nft && listing.status === 'escrowed') {
      try {
        const nftMeta = listing.nft_metadata as Record<string, any> | null;
        const mintAddress = nftMeta?.mint_address || nftMeta?.mintAddress;

        if (mintAddress) {
          // Get buyer's wallet address
          const { data: buyerUser } = await supabase
            .from('users')
            .select('wallet_address')
            .eq('id', user.id)
            .single();

          if (buyerUser?.wallet_address) {
            const buyerPubkey = new PublicKey(buyerUser.wallet_address);
            const mintPubkey = new PublicKey(mintAddress);

            nftTransferSignature = await transferNFTFromEscrow(buyerPubkey, mintPubkey);
            console.log('NFT transferred from escrow:', nftTransferSignature);
          }
        }
      } catch (nftErr) {
        console.error('Failed to transfer NFT from escrow:', nftErr);
        // Don't fail the payment transaction — log for manual resolution
      }
    }

    return NextResponse.json({
      transaction,
      nftTransferSignature,
    }, { status: 201 });
  } catch (err) {
    console.error('Create transaction error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
