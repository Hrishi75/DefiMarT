"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [user, setUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Prevents re-triggering signIn in a loop if it fails
  const signInAttempted = useRef(false);

  // Check existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Reset attempt flag when wallet disconnects so reconnect works
  useEffect(() => {
    if (!connected) {
      signInAttempted.current = false;
    }
  }, [connected]);

  // Auto sign-in when wallet connects (and session check is done).
  // isLoading + signMessage are deps so this re-fires if they become
  // available after autoConnect has already set connected=true.
  useEffect(() => {
    if (connected && publicKey && !user && !isLoading && !signInAttempted.current) {
      if (!signMessage) return; // not ready yet — will re-run when signMessage becomes defined
      signInAttempted.current = true;
      signIn();
    }
  }, [connected, publicKey, isLoading, signMessage]);

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

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Refresh user failed:', err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
