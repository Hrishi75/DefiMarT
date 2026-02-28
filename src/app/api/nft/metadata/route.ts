import { NextRequest, NextResponse } from 'next/server';
import { fetchNFTMetadata } from '@/lib/solana/metaplex';

export async function GET(request: NextRequest) {
  try {
    const mint = request.nextUrl.searchParams.get('mint');

    if (!mint) {
      return NextResponse.json(
        { error: 'Missing required parameter: mint' },
        { status: 400 }
      );
    }

    const nft = await fetchNFTMetadata(mint);

    if (!nft) {
      return NextResponse.json(
        { error: 'NFT not found or metadata unavailable' },
        { status: 404 }
      );
    }

    return NextResponse.json({ nft });
  } catch (err) {
    console.error('NFT metadata fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch NFT metadata' },
      { status: 500 }
    );
  }
}
