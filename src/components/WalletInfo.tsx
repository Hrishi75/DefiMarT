"use client";

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface WalletInfoProps {
    className?: string;
}

export default function WalletInfo({ className }: WalletInfoProps) {
    const { publicKey, connected } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (publicKey && connected) {
            setLoading(true);
            connection.getBalance(publicKey)
                .then(bal => setBalance(bal / LAMPORTS_PER_SOL))
                .catch(err => console.error('Error fetching balance:', err))
                .finally(() => setLoading(false));
        } else {
            setBalance(null);
        }
    }, [publicKey, connected, connection]);

    if (!connected || !publicKey) {
        return null;
    }

    return (
        <div className={twMerge("bg-neutral-900 border border-white/10 rounded-3xl p-6", className)}>
            <h3 className="text-lg font-medium mb-4">Wallet Information</h3>
            
            <div className="space-y-4">
                {/* Wallet Address */}
                <div>
                    <div className="text-sm text-white/50 mb-1">Address</div>
                    <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-neutral-800 px-3 py-2 rounded-lg flex-1 overflow-x-auto">
                            {publicKey.toBase58()}
                        </code>
                        <button
                            onClick={() => navigator.clipboard.writeText(publicKey.toBase58())}
                            className="p-2 hover:bg-neutral-800 rounded-lg transition"
                            title="Copy address"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Balance */}
                <div>
                    <div className="text-sm text-white/50 mb-1">Balance</div>
                    <div className="flex items-baseline gap-2">
                        {loading ? (
                            <div className="animate-pulse bg-neutral-800 h-8 w-24 rounded" />
                        ) : (
                            <>
                                <span className="text-3xl font-bold">{balance?.toFixed(4) || '0.0000'}</span>
                                <span className="text-lime-400 font-bold">SOL</span>
                            </>
                        )}
                    </div>
                    {balance !== null && (
                        <div className="text-sm text-white/50 mt-1">
                            ≈ ${(balance * 150).toFixed(2)} USD
                        </div>
                    )}
                </div>

                {/* Connection Status */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                    <span className="text-sm text-white/70">Connected to Devnet</span>
                </div>
            </div>
        </div>
    );
}