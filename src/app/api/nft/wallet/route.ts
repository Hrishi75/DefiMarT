import { NextRequest, NextResponse } from 'next/server';
import { fetchNFTsByOwner } from '@/lib/solana/metaplex';

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    const nfts = await fetchNFTsByOwner(address);

    return NextResponse.json({ nfts });
  } catch (err) {
    console.error('Wallet NFT fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch wallet NFTs' },
      { status: 500 }
    );
  }
}
