import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabaseClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Check for error in URL hash (Supabase puts errors there for OAuth)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const hashError = hashParams.get('error_description') || hashParams.get('error');
                if (hashError) {
                    setStatus('error');
                    setErrorMessage(hashError);
                    return;
                }

                // Check for PKCE code in query params
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');

                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) {
                        setStatus('error');
                        setErrorMessage(error.message);
                        return;
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
                        navigate('/analyze', { replace: true, state: { analyzeUrl: pendingUrl } });
                    } else {
                        navigate('/analyze', { replace: true });
                    }
                };

                if (session) {
                    setStatus('success');
                    setTimeout(redirectWithUrl, 1000);
                } else {
                    // No code and no session — might still be processing
                    // Give Supabase a moment to process hash fragments
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const { data: { session: retrySession } } = await supabase.auth.getSession();
                    if (retrySession) {
                        setStatus('success');
                        setTimeout(redirectWithUrl, 1000);
                    } else {
                        setStatus('error');
                        setErrorMessage('Could not establish a session. Please try signing in again.');
                    }
                }
            } catch (err) {
                setStatus('error');
                setErrorMessage('An unexpected error occurred during authentication.');
                console.error('Auth callback error:', err);
            }
        };

        handleCallback();
    }, [navigate]);

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
