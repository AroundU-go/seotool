import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAIL = 'go.aroundu@gmail.com';

export default function AdminRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const guestEmail = typeof window !== 'undefined' ? localStorage.getItem('guest_email') : null;
    const currentEmail = user?.email || guestEmail;

    if (loading && !guestEmail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fe]">
                <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!currentEmail || currentEmail !== ADMIN_EMAIL) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
