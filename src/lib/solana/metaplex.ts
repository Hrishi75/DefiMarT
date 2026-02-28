import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { SOLANA_RPC_ENDPOINT } from './constants';
import type { NFTAsset } from '@/types/marketplace';

/**
 * Create a Metaplex instance connected to Devnet.
 */
export function getMetaplex(connection?: Connection): Metaplex {
  const conn = connection ?? new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
  return Metaplex.make(conn);
}

/**
 * Fetch all NFTs owned by a wallet address.
 */
export async function fetchNFTsByOwner(
  ownerAddress: string,
  connection?: Connection
): Promise<NFTAsset[]> {
  const metaplex = getMetaplex(connection);
  const owner = new PublicKey(ownerAddress);

  const nfts = await metaplex.nfts().findAllByOwner({ owner });

  const assets: NFTAsset[] = [];

  for (const nft of nfts) {
    try {
      // Load full metadata (includes off-chain JSON)
      const loaded = await metaplex.nfts().load({ metadata: nft as any });

      assets.push({
        mintAddress: loaded.address.toBase58(),
        name: loaded.name || 'Unnamed NFT',
        symbol: loaded.symbol || '',
        image: loaded.json?.image || '',
        description: loaded.json?.description || '',
        collection: loaded.collection
          ? {
              name: loaded.json?.collection?.name || loaded.collection.address.toBase58(),
              verified: loaded.collection.verified,
              address: loaded.collection.address.toBase58(),
            }
          : undefined,
        attributes: (loaded.json?.attributes as any[])?.map((attr) => ({
          traitType: attr.trait_type || attr.traitType || '',
          value: String(attr.value || ''),
        })),
        owner: ownerAddress,
        uri: loaded.uri || '',
      });
    } catch (err) {
      // Skip NFTs that fail to load metadata
      console.warn('Failed to load NFT metadata:', err);
    }
  }

  return assets;
}

/**
 * Fetch metadata for a single NFT by mint address.
 */
export async function fetchNFTMetadata(
  mintAddress: string,
  connection?: Connection
): Promise<NFTAsset | null> {
  try {
    const metaplex = getMetaplex(connection);
    const mint = new PublicKey(mintAddress);

    const nft = await metaplex.nfts().findByMint({ mintAddress: mint });

    return {
      mintAddress: nft.address.toBase58(),
      name: nft.name || 'Unnamed NFT',
      symbol: nft.symbol || '',
      image: nft.json?.image || '',
      description: nft.json?.description || '',
      collection: nft.collection
        ? {
            name: nft.json?.collection?.name || nft.collection.address.toBase58(),
            verified: nft.collection.verified,
            address: nft.collection.address.toBase58(),
          }
        : undefined,
      attributes: (nft.json?.attributes as any[])?.map((attr) => ({
        traitType: attr.trait_type || attr.traitType || '',
        value: String(attr.value || ''),
      })),
      owner: nft.mint.mintAuthorityAddress?.toBase58() || '',
      uri: nft.uri || '',
    };
  } catch (err) {
    console.error('Failed to fetch NFT metadata:', err);
    return null;
  }
}

/**
 * Verify that a wallet owns a specific NFT.
 */
export async function verifyNFTOwnership(
  mintAddress: string,
  ownerAddress: string,
  connection?: Connection
): Promise<boolean> {
  try {
    const metaplex = getMetaplex(connection);
    const mint = new PublicKey(mintAddress);
    const nft = await metaplex.nfts().findByMint({ mintAddress: mint });

    // Check the token account for the largest holder
    const conn = connection ?? new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
    const largestAccounts = await conn.getTokenLargestAccounts(mint);
    if (largestAccounts.value.length === 0) return false;

    const largestAccount = largestAccounts.value[0];
    const accountInfo = await conn.getParsedAccountInfo(largestAccount.address);

    if (!accountInfo.value) return false;
    const parsedData = (accountInfo.value.data as any)?.parsed;
    const tokenOwner = parsedData?.info?.owner;

    return tokenOwner === ownerAddress;
  } catch (err) {
    console.error('NFT ownership verification failed:', err);
    return false;
  }
}
