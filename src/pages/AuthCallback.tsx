import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/services/supabaseClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');

                if (code) {
                    // PKCE flow: exchange the code for a session
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) {
                        setStatus('error');
                        setErrorMessage(error.message);
                        return;
                    }
                }

                // Session established successfully
                setStatus('success');
                setTimeout(() => {
                    navigate('/analyze', { replace: true });
                }, 1500);
            } catch (err) {
                setStatus('error');
                setErrorMessage('An unexpected error occurred while verifying your email.');
                console.error('Auth callback error:', err);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-xl">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-foreground mb-3">Verifying your email…</h2>
                        <p className="text-foreground/60 text-sm">
                            Please wait while we confirm your account.
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">Email verified!</h2>
                        <p className="text-foreground/60 text-sm">
                            Redirecting you to the dashboard…
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">Verification failed</h2>
                        <p className="text-foreground/60 text-sm mb-6">
                            {errorMessage || 'Something went wrong. Please try signing up again.'}
                        </p>
                        <button
                            onClick={() => navigate('/auth', { replace: true })}
                            className="px-6 py-3 bg-accent text-accent-900 font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.01]"
                        >
                            Back to Sign In
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
