import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Mail, Loader2, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AuthPage() {
    const navigate = useNavigate();
    const { signUp, user, signInWithGoogle } = useAuth(); // We need signUp and Google OAuth

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If already logged in (Supabase session), redirect
    if (user) {
        navigate('/analyze', { replace: true });
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Auto-generate a strong random password to satisfy Supabase requirements
            // This effectively creates a "lead" account that can be claimed later via password reset if needed
            const randomPassword = `SeoTool_${Date.now()}_${Math.random().toString(36).slice(2)}`;

            // Attempt to sign up to store the email in Supabase Auth
            // We ignore the result because we're granting access regardless of email confirmation
            await signUp(email, randomPassword);

            // Store email locally to allow "Guest" access without confirmation
            localStorage.setItem('guest_email', email);

            // Redirect immediately to the tool
            navigate('/analyze', { replace: true });
        } catch (err) {
            console.error('Auth error:', err);
            // Even if Supabase fails (e.g. rate limit), allow access if we have an email
            if (email) {
                localStorage.setItem('guest_email', email);
                navigate('/analyze', { replace: true });
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            {/* Logo */}
            <div className="fixed top-6 left-6 z-50">
                <Link to="/" className="text-xl font-black tracking-tight text-foreground">
                    SEO<span className="text-accent">zapp</span>
                </Link>
            </div>

            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-accent" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Enter your email
                        </h1>
                        <p className="text-foreground/60 text-sm">
                            to start analyzing your websites instantly
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground/70 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-accent text-accent-900 font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Starting Analysis…
                                </>
                            ) : (
                                'Start Analyzing'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-foreground/40 font-medium">OR</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Google OAuth */}
                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true);
                            const { error: err } = await signInWithGoogle();
                            if (err) {
                                setError(err.message);
                                setLoading(false);
                            }
                            // OAuth redirects, so no need to setLoading(false) on success
                        }}
                        disabled={loading}
                        className="w-full py-3.5 bg-white border border-border text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-xs text-center text-foreground/40 mt-6">
                        No password required. We'll secure your report.
                    </p>
                </div>

                {/* Back link */}
                <div className="text-center mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground/50 hover:text-accent transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
