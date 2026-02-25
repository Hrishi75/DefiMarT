"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { Database } from '@/lib/supabase/types';

type DbUser = Database['public']['Tables']['users']['Row'];

interface AuthContextValue {
  user: DbUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [user, setUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Auto sign-in when wallet connects and no session exists
  useEffect(() => {
    if (connected && publicKey && !user && !isLoading) {
      signIn();
    }
  }, [connected, publicKey]);

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Session check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) return;

    try {
      setIsLoading(true);
      const walletAddress = publicKey.toBase58();

      // Step 1: Get nonce
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      if (!nonceRes.ok) {
        throw new Error('Failed to get nonce');
      }

      const { nonce, message } = await nonceRes.json();

      // Step 2: Sign the message with wallet
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);

      // Step 3: Verify signature on server
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          signature: Array.from(signature),
          nonce,
        }),
      });

      if (!verifyRes.ok) {
        throw new Error('Verification failed');
      }

      const { user: verifiedUser } = await verifyRes.json();
      setUser(verifiedUser);
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage]);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      setUser(null);
      disconnect();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  }, [disconnect]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
