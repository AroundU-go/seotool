import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/services/supabaseClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let authListener: any = null;

        const handleCallback = async () => {
            try {
                // Check for error in URL hash (Supabase puts errors there for OAuth)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const hashError = hashParams.get('error_description') || hashParams.get('error');
                if (hashError) {
                    setStatus('error');
                    setErrorMessage(hashError.replace(/\+/g, ' '));
                    return;
                }

                // Check for PKCE code in query params
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');

                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) {
                        // Supabase client might have already automatically exchanged the code.
                        // Let's verify if a session was established regardless of the error.
                        const { data: { session: existingSession } } = await supabase.auth.getSession();
                        if (!existingSession) {
                            setStatus('error');
                            setErrorMessage(error.message);
                            return;
                        }
                    }
                }

                // Wait briefly for Supabase to pick up the session
                // (handles hash-fragment flows where the client auto-detects tokens)
                const { data: { session } } = await supabase.auth.getSession();

                const redirectWithUrl = () => {
                    // Check if there's a pending URL from the landing page
                    const pendingUrl = localStorage.getItem('pending_analyze_url');
                    localStorage.removeItem('pending_analyze_url');

                    if (pendingUrl) {
                        router.replace({ pathname: '/analyze', query: { analyzeUrl: pendingUrl } });
                    } else {
                        router.replace('/analyze');
                    }
                };

                if (session) {
                    setStatus('success');
                    setTimeout(redirectWithUrl, 1000);
                } else {
                    // Listen for auth state changes in case the session is still being established
                    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
                        if (event === 'SIGNED_IN' && newSession) {
                            setStatus('success');
                            setTimeout(redirectWithUrl, 1000);
                        }
                    });
                    
                    authListener = data.subscription;

                    // Set a timeout to show an error if no session is established after a few seconds
                    setTimeout(async () => {
                        const { data: { session: retrySession } } = await supabase.auth.getSession();
                        if (!retrySession) {
                            setStatus(current => {
                                if (current !== 'success') {
                                    setErrorMessage('Could not establish a session. Please try signing in again.');
                                    return 'error';
                                }
                                return current;
                            });
                        }
                    }, 4000);
                }
            } catch (err) {
                setStatus('error');
                setErrorMessage('An unexpected error occurred during authentication.');
                console.error('Auth callback error:', err);
            }
        };

        handleCallback();

        return () => {
            if (authListener) {
                authListener.unsubscribe();
            }
        };
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-xl">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-foreground mb-3">Signing you in…</h2>
                        <p className="text-foreground/60 text-sm">
                            Please wait while we verify your account.
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">You're in!</h2>
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
                        <h2 className="text-2xl font-bold text-foreground mb-3">Sign in failed</h2>
                        <p className="text-foreground/60 text-sm mb-6">
                            {errorMessage || 'Something went wrong. Please try again.'}
                        </p>
                        <button
                            onClick={() => router.replace('/auth')}
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
