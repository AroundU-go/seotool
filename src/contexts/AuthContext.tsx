import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, onAuthStateChange, getProStatus, signInWithGoogle as googleSignIn, ProStatusResult } from '@/services/supabaseClient';

// Normalize origin to avoid www vs non-www mismatch with Supabase redirect allowlist
function getRedirectBase(): string {
  if (typeof window === 'undefined') return 'https://seozapp.com';
  return window.location.origin.replace('://www.', '://');
}


interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isPro: boolean;
    proExpired: boolean;
    paymentType: string;
    proAuditCount: number;
    signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshProStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [proExpired, setProExpired] = useState(false);
    const [paymentType, setPaymentType] = useState('');
    const [proAuditCount, setProAuditCount] = useState(0);

    const fetchProStatus = useCallback(async (userId: string) => {
        const result: ProStatusResult = await getProStatus(userId);
        setIsPro(result.isPro);
        setProExpired(result.proExpired);
        setPaymentType(result.paymentType);
        setProAuditCount(result.proAuditCount);
    }, []);

    const refreshProStatus = useCallback(async () => {
        if (user?.id) {
            await fetchProStatus(user.id);
        }
    }, [user?.id, fetchProStatus]);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user?.id) {
                fetchProStatus(s.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = onAuthStateChange((s, u) => {
            setSession(s);
            setUser(u);
            if (u?.id) {
                fetchProStatus(u.id);
            } else {
                setIsPro(false);
                setProExpired(false);
                setPaymentType('');
                setProAuditCount(0);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [fetchProStatus]);

    const handleSignUp = async (email: string, password: string, fullName?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: `${getRedirectBase()}/auth/callback`,
            },
        });
        if (!error && data.user) {
            // User created but needs email verification
        }
        return { error: error as Error | null };
    };

    const handleSignIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error as Error | null };
    };

    const handleSignInWithOtp = async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${getRedirectBase()}/auth/callback`,
            },
        });
        return { error: error as Error | null };
    };

    const handleSignInWithGoogle = async () => {
        const { error } = await googleSignIn();
        return { error: error as Error | null };
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setIsPro(false);
        setProExpired(false);
        setPaymentType('');
        setProAuditCount(0);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                isPro,
                proExpired,
                paymentType,
                proAuditCount,
                signUp: handleSignUp,
                signIn: handleSignIn,
                signInWithOtp: handleSignInWithOtp,
                signInWithGoogle: handleSignInWithGoogle,
                signOut: handleSignOut,
                refreshProStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
