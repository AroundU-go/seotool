import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const guestEmail = typeof window !== 'undefined' ? localStorage.getItem('guest_email') : null;

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
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
}
