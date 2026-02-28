import { clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import type { TokenCurrency } from '@/types/marketplace';

// Solana Devnet configuration
export const SOLANA_NETWORK = 'devnet' as const;
export const SOLANA_RPC_ENDPOINT = clusterApiUrl('devnet');

// Solana Explorer URL for Devnet
export const EXPLORER_URL = 'https://explorer.solana.com';

export function getExplorerUrl(signature: string): string {
  return `${EXPLORER_URL}/tx/${signature}?cluster=${SOLANA_NETWORK}`;
}

export function getAccountExplorerUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}?cluster=${SOLANA_NETWORK}`;
}

// SOL conversion helpers
export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

// ---- SPL Token Mint Addresses (Devnet) ----
export const TOKEN_MINTS: Record<Exclude<TokenCurrency, 'SOL'>, PublicKey> = {
  USDC: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
  PYUSD: new PublicKey('CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM'),
  EURC: new PublicKey('HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr'),
};

export interface TokenConfig {
  symbol: TokenCurrency;
  name: string;
  decimals: number;
  mint: PublicKey | null; // null for native SOL
  approximateUsdRate: number;
}

export const TOKEN_CONFIGS: Record<TokenCurrency, TokenConfig> = {
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    mint: null,
    approximateUsdRate: 150,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    mint: TOKEN_MINTS.USDC,
    approximateUsdRate: 1,
  },
  PYUSD: {
    symbol: 'PYUSD',
    name: 'PayPal USD',
    decimals: 6,
    mint: TOKEN_MINTS.PYUSD,
    approximateUsdRate: 1,
  },
  EURC: {
    symbol: 'EURC',
    name: 'Euro Coin',
    decimals: 6,
    mint: TOKEN_MINTS.EURC,
    approximateUsdRate: 1.08,
  },
};

export const SUPPORTED_CURRENCIES: TokenCurrency[] = ['SOL', 'USDC', 'PYUSD', 'EURC'];

export function toSmallestUnit(amount: number, currency: TokenCurrency): bigint {
  const decimals = TOKEN_CONFIGS[currency].decimals;
  return BigInt(Math.round(amount * Math.pow(10, decimals)));
}

export function getApproxUsdValue(amount: number, currency: TokenCurrency): number {
  return amount * TOKEN_CONFIGS[currency].approximateUsdRate;
}

export function formatPrice(amount: number, currency: TokenCurrency): string {
  const decimalPlaces = currency === 'SOL' ? 4 : 2;
  return `${amount.toFixed(decimalPlaces)} ${currency}`;
}

export function isNativeSOL(currency: TokenCurrency): boolean {
  return currency === 'SOL';
}
