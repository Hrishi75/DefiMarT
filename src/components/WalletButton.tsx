"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

interface WalletButtonProps {
    variant?: 'primary' | 'secondary';
    className?: string;
    showAddress?: boolean;
}

export default function WalletButton({ variant = 'primary', className, showAddress = true }: WalletButtonProps) {
    const { publicKey, connected, connecting } = useWallet();
    const { setVisible } = useWalletModal();
    const { user, isAuthenticated, isLoading: authLoading, signIn, signOut } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                disabled
                className={twMerge(
                    'border h-10 md:h-12 rounded-full px-4 md:px-6 font-medium transition text-sm md:text-base',
                    variant === 'primary'
                        ? 'bg-lime-400 text-neutral-950 border-lime-400'
                        : 'border-white text-white bg-transparent',
                    className
                )}
            >
                <span className="hidden md:inline">Loading...</span>
                <span className="md:hidden">···</span>
            </button>
        );
    }

    // Wallet connected but still authenticating — show spinner
    if (connected && publicKey && authLoading) {
        return (
            <button
                disabled
                className={twMerge(
                    'border h-10 md:h-12 rounded-full px-4 md:px-6 font-medium transition text-sm md:text-base',
                    variant === 'primary'
                        ? 'bg-lime-400 text-neutral-950 border-lime-400'
                        : 'border-white text-white bg-transparent',
                    className
                )}
            >
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden md:inline">Signing in...</span>
                </span>
            </button>
        );
    }

    // Wallet connected but auth failed — show retry button
    if (connected && publicKey && !isAuthenticated && !authLoading) {
        return (
            <button
                onClick={() => signIn()}
                className={twMerge(
                    'border h-10 md:h-12 rounded-full px-4 md:px-6 font-medium hover:opacity-80 transition text-sm md:text-base whitespace-nowrap',
                    variant === 'primary'
                        ? 'bg-lime-400 text-neutral-950 border-lime-400 hover:bg-lime-300'
                        : 'border-white text-white bg-transparent hover:bg-white/5',
                    className
                )}
            >
                <span className="hidden md:inline">Sign In</span>
                <span className="md:hidden">Sign In</span>
            </button>
        );
    }

    if (connected && publicKey && isAuthenticated && user) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2"
                >
                    {/* User Avatar */}
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-sm font-bold border-2 border-lime-400">
                        {user.display_name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    {showAddress && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full border bg-neutral-900 border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                            <span className="font-mono text-xs">
                                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                            </span>
                        </div>
                    )}
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl z-50">
                            <div className="p-4 border-b border-white/10">
                                <div className="font-medium text-sm">{user.display_name}</div>
                                <div className="text-xs text-white/50">@{user.username}</div>
                            </div>
                            <div className="py-2">
                                <Link
                                    href={`/profile/${user.id}`}
                                    className="block px-4 py-2 text-sm hover:bg-white/5 transition"
                                    onClick={() => setShowMenu(false)}
                                >
                                    My Profile
                                </Link>
                                <Link
                                    href="/marketplace/create"
                                    className="block px-4 py-2 text-sm hover:bg-white/5 transition"
                                    onClick={() => setShowMenu(false)}
                                >
                                    Create Listing
                                </Link>
                                <Link
                                    href="/orders"
                                    className="block px-4 py-2 text-sm hover:bg-white/5 transition"
                                    onClick={() => setShowMenu(false)}
                                >
                                    My Orders
                                </Link>
                            </div>
                            <div className="border-t border-white/10 py-2">
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        signOut();
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={() => setVisible(true)}
            disabled={connecting}
            className={twMerge(
                'border h-10 md:h-12 rounded-full px-4 md:px-6 font-medium hover:opacity-80 transition disabled:opacity-50 text-sm md:text-base whitespace-nowrap',
                variant === 'primary'
                    ? 'bg-lime-400 text-neutral-950 border-lime-400 hover:bg-lime-300'
                    : 'border-white text-white bg-transparent hover:bg-white/5',
                className
            )}
        >
            {connecting ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden md:inline">Connecting...</span>
                </span>
            ) : (
                <>
                    <span className="hidden md:inline">Connect Wallet</span>
                    <span className="md:hidden">Connect</span>
                </>
            )}
        </button>
    );
}
