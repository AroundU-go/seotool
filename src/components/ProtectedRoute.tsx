import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const guestEmail = typeof window !== 'undefined' ? localStorage.getItem('guest_email') : null;

    useEffect(() => {
        if (!loading && !user && !guestEmail) {
            router.replace('/auth');
        }
    }, [loading, user, guestEmail, router]);

    if (loading && !guestEmail) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
                    <p className="text-foreground/60 font-medium">Loading…</p>
                </div>
            </div>
        );
    }

    if (!user && !guestEmail) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
