import { useState, useRef, useEffect, Component, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Rocket, Search, Star, ClipboardPaste, Zap, BarChart3, Share2, MessageSquare, DollarSign, AlertCircle, X, Mail, Loader2, Lock, ArrowRight, Download, ChevronDown } from 'lucide-react';
import ParticleCanvas from '@/components/landing/ParticleHero';
import { NavBar } from '@/components/ui/NavBar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { analyzeSeo, checkLoadingSpeed } from '@/services/seoApi';
import { getAuditCountByEmail, recordFreeAudit } from '@/services/supabaseClient';
import SeoAnalysisCard from '@/components/SeoAnalysisCard';
import LoadingSpeedCard from '@/components/LoadingSpeedCard';
import { generateFixGuidePdf } from '@/utils/pdfGenerator';

// Error boundary for result cards
class CardErrorBoundary extends Component<{ children: ReactNode; name: string }, { hasError: boolean; error?: Error }> {
    constructor(props: { children: ReactNode; name: string }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-card rounded-xl shadow-lg p-6 border border-red-300 dark:border-red-800">
                    <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        <h3 className="font-semibold">Error rendering {this.props.name}</h3>
                    </div>
                    <p className="text-sm text-red-500">{this.state.error?.message}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

const FREE_AUDIT_LIMIT = 2;

export default function LandingPage() {
    const navigate = useNavigate();
    const resultsRef = useRef<HTMLDivElement>(null);

    // Scroll-spy for navbar
    const [activeSection, setActiveSection] = useState('Home');
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    useEffect(() => {
        const sectionMap: { id: string; name: string }[] = [
            { id: 'hero', name: 'Home' },
            { id: 'features', name: 'Features' },
            { id: 'how-it-works', name: 'How It Works' },
            { id: 'pricing', name: 'Pricing' },
        ];

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const match = sectionMap.find((s) => s.id === entry.target.id);
                        if (match) setActiveSection(match.name);
                    }
                }
            },
            { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
        );

        for (const s of sectionMap) {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    }, []);

    // URL & email state
    const [url, setUrl] = useState('');
    const [email, setEmail] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);

    // Analysis state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analyzedWebsite, setAnalyzedWebsite] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<{ seoAnalysis: any; loadingSpeed: any }>({
        seoAnalysis: null,
        loadingSpeed: null,
    });

    // Quota state
    const [quotaExceeded, setQuotaExceeded] = useState(false);
    const [auditCount, setAuditCount] = useState(0);
    const [checkingQuota, setCheckingQuota] = useState(false);

    const navItems = [
        { name: 'Home', url: '#hero', icon: Home, onClick: () => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }) },
        { name: 'Features', url: '#features', icon: Rocket, onClick: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
        { name: 'How It Works', url: '#how-it-works', icon: Zap, onClick: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
        { name: 'Pricing', url: '#pricing', icon: DollarSign, onClick: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) },
        { name: 'Analyze', url: '/analyze', icon: Search, onClick: () => navigate('/analyze') },
    ];

    const steps = [
        { icon: ClipboardPaste, num: '1', title: 'Paste Your URL', desc: 'Enter any public URL you want to analyze.' },
        { icon: Zap, num: '2', title: 'Instant Analysis', desc: 'We scan 25+ on-page factors including title, meta, headings, links, schema, and more.' },
        { icon: BarChart3, num: '3', title: 'Get Prioritized Results', desc: 'Issues are ranked by impact: critical, warning, and good status.' },
        { icon: Share2, num: '4', title: 'Export & Share', desc: 'Download as Markdown/PDF, copy to clipboard, or share directly with your team.' },
    ];

    const handleAnalyzeClick = () => {
        if (!url.trim()) return;
        setError(null);
        setQuotaExceeded(false);
        setShowEmailModal(true);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setCheckingQuota(true);
        setError(null);

        try {
            // Record this audit (fire and forget or wait, doesn't matter much)
            await recordFreeAudit(email.trim(), url.trim());

            // Store email locally for guest access in ProtectedRoute
            localStorage.setItem('guest_email', email.trim());

            setShowEmailModal(false);
            setCheckingQuota(false);

            // Redirect to the main tool page with the URL
            navigate('/analyze', { state: { analyzeUrl: url.trim() } });
        } catch {
            // Even if recording fails, let them analyze
            localStorage.setItem('guest_email', email.trim());
            navigate('/analyze', { state: { analyzeUrl: url.trim() } });
        }
    };

    const runAnalysis = async (targetUrl: string) => {
        setLoading(true);
        setError(null);
        const cleanUrl = targetUrl.replace(/^https?:\/\//, '');
        setAnalyzedWebsite(cleanUrl);
        setResults({ seoAnalysis: null, loadingSpeed: null });

        try {
            const [seoData, speedData] = await Promise.allSettled([
                analyzeSeo(cleanUrl),
                checkLoadingSpeed(cleanUrl),
            ]);

            const newResults = {
                seoAnalysis: seoData.status === 'fulfilled' ? seoData.value : null,
                loadingSpeed: speedData.status === 'fulfilled' ? speedData.value : null,
            };

            setResults(newResults);

            if (seoData.status === 'rejected' && speedData.status === 'rejected') {
                setError('Failed to analyze website. Please check the URL and try again.');
            }

            // Scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadGuide = () => {
        if (results.seoAnalysis || results.loadingSpeed) {
            generateFixGuidePdf(analyzedWebsite, {
                seoAnalysis: results.seoAnalysis,
                aiVisibility: null,
                aiBotChecker: null,
                loadingSpeed: results.loadingSpeed,
            });
        }
    };

    const hasResults = results.seoAnalysis || results.loadingSpeed;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Logo - Fixed Top Left */}
            <div className="fixed top-6 left-6 z-50">
                <span className="text-xl font-black tracking-tight text-foreground">
                    SEO<span className="text-accent">zapp</span>
                </span>
            </div>

            {/* Navbar */}
            <NavBar items={navItems} activeTab={activeSection} />

            {/* Theme Toggle - Fixed Top Right */}
            <div className="fixed top-6 right-6 z-50 hidden md:block">
                <ThemeToggle />
            </div>

            {/* Hero Section */}
            <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden isolate">
                <ParticleCanvas />

                {/* Hero Content */}
                <div className="relative text-center px-6 max-w-4xl mx-auto" style={{ zIndex: 10 }}>
                    <div className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-sm mb-8">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-foreground/70">AI-Powered SEO Analysis</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
                        <span className="block text-foreground">Turn your SEO</span>
                        <span className="block text-foreground">issues into</span>
                        <span className="block text-gradient">Real Traffic</span>
                    </h1>

                    <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Comprehensive on-page analysis, AI readiness scoring, bot access checks,
                        and performance metrics — all in one tool.
                    </p>
                </div>

                {/* URL Input + Login to Analyze — separate from hero content to avoid stacking issues */}
                <div className="w-full max-w-2xl mx-auto px-6" style={{ position: 'relative', zIndex: 50 }}>
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleAnalyzeClick(); }}
                        className="flex flex-col sm:flex-row items-stretch gap-3"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" style={{ zIndex: 1 }} />
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter website URL (e.g., example.com)"
                                className="w-full pl-12 pr-4 py-4 bg-card/80 backdrop-blur-md border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-lg cursor-text"
                                style={{ position: 'relative', zIndex: 2 }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!url.trim() || loading}
                            className="group px-6 py-4 bg-accent text-accent-900 font-bold text-base rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                            style={{ position: 'relative', zIndex: 2 }}
                        >
                            Login to Analyze
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>
                    <p className="text-xs text-foreground/40 mt-3 text-center">
                        2 free audits • No credit card required
                    </p>
                </div>


            </section>

            {/* Inline Results Section */}
            <div ref={resultsRef}>
                {loading && (
                    <section className="py-20 px-6 bg-muted/20">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mb-6">
                                <Search className="w-8 h-8 text-accent animate-spin" />
                            </div>
                            <h3 className="text-2xl font-semibold text-foreground mb-2">Analyzing {analyzedWebsite}...</h3>
                            <p className="text-foreground/60">Running on-page SEO analysis and loading speed test</p>
                            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
                                {['SEO Analysis', 'Page Speed'].map((label) => (
                                    <div key={label} className="bg-card rounded-lg p-4 shadow-sm border border-border animate-pulse">
                                        <div className="h-3 bg-muted rounded w-3/4 mx-auto mb-2" />
                                        <div className="h-6 bg-muted rounded w-1/2 mx-auto mb-1" />
                                        <p className="text-xs text-foreground/40">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {error && !loading && (
                    <section className="py-12 px-6 bg-muted/20">
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <p className="text-red-800 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    </section>
                )}

                {hasResults && !loading && (
                    <section className="py-16 px-6 bg-muted/20">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    Results for <span className="text-accent">{analyzedWebsite}</span>
                                </h2>
                                <p className="text-foreground/60 mb-6">Free plan — On-page SEO & Loading Speed</p>
                                <button
                                    onClick={handleDownloadGuide}
                                    className="bg-accent text-accent-900 px-6 py-3 rounded-xl hover:bg-accent-400 transition-colors inline-flex items-center gap-2 shadow-lg font-semibold"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Fix Guide
                                </button>
                            </div>

                            <div className="space-y-6">
                                {results.seoAnalysis && (
                                    <CardErrorBoundary name="SEO Analysis">
                                        <SeoAnalysisCard data={results.seoAnalysis} />
                                    </CardErrorBoundary>
                                )}
                                {results.loadingSpeed && (
                                    <CardErrorBoundary name="Loading Speed">
                                        <LoadingSpeedCard data={results.loadingSpeed} />
                                    </CardErrorBoundary>
                                )}
                            </div>

                            {/* Upsell Banner */}
                            <div className="mt-10 bg-card border border-accent/30 rounded-2xl p-8 text-center">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Lock className="w-5 h-5 text-accent" />
                                    <h3 className="text-xl font-bold text-foreground">Want the full picture?</h3>
                                </div>
                                <p className="text-foreground/60 mb-6 max-w-lg mx-auto">
                                    Upgrade to Pro for AI Search Visibility scoring, AI bot access checks, AEO & GEO optimization, and unlimited audits.
                                </p>
                                <button
                                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-8 py-3 bg-accent text-accent-900 font-bold rounded-full shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                                >
                                    View Pricing
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Features Section */}
            <section id="features" className="py-20 px-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                            A complete SEO toolkit that covers every aspect of modern search optimization,
                            from traditional SEO to AI readiness.
                        </p>
                    </div>
                    <FeaturesSection />
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-6 bg-muted/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                            Four simple steps to a comprehensive SEO audit.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.num} className="relative bg-card border border-border rounded-2xl p-8 hover:border-accent/40 transition-all duration-300 group hover:shadow-lg hover:shadow-accent/5">
                                    <div className="absolute -top-4 -left-2 w-10 h-10 bg-accent rounded-full flex items-center justify-center font-black text-accent-900 text-lg shadow-md shadow-accent/30">
                                        {step.num}
                                    </div>
                                    <div className="mt-4 mb-4">
                                        <Icon className="w-8 h-8 text-accent/70 group-hover:text-accent transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                                    <p className="text-sm text-foreground/60 leading-relaxed">{step.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 px-6 bg-background">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Trusted by SEO Professionals
                        </h2>
                        <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                            What our users are saying
                        </p>
                        <p className="text-sm text-foreground/40 mt-2 max-w-xl mx-auto">
                            Join thousands of marketers, agencies, and founders who trust SEOzapp for their optimization needs.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-accent/30 transition-colors">
                            <div className="text-3xl font-black text-accent mb-1">1000+</div>
                            <p className="text-sm font-semibold text-foreground mb-0.5">URLs Analyzed</p>
                            <p className="text-xs text-foreground/40">By 100+ users</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-accent/30 transition-colors">
                            <div className="text-3xl font-black text-accent mb-1 flex items-center justify-center gap-1">
                                4.8<span className="text-lg">/5</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground mb-0.5">User Rating</p>
                            <p className="text-xs text-foreground/40">From 50+ reviews</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-accent/30 transition-colors">
                            <div className="text-3xl font-black text-accent mb-1">&lt;30s</div>
                            <p className="text-sm font-semibold text-foreground mb-0.5">Analysis Time</p>
                            <p className="text-xs text-foreground/40">Per URL</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-accent/30 transition-colors">
                            <div className="text-3xl font-black text-accent mb-1">25+</div>
                            <p className="text-sm font-semibold text-foreground mb-0.5">SEO Factors</p>
                            <p className="text-xs text-foreground/40">Checked per page</p>
                        </div>
                    </div>

                    {/* Dummy Testimonial Cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: 'Sarah K.', role: 'Marketing Lead', text: 'SEOzapp found critical issues our previous tool completely missed. Our organic traffic went up 35% after fixing them.' },
                            { name: 'James R.', role: 'Agency Founder', text: 'We use SEOzapp for every client audit. The prioritized results save us hours of manual work.' },
                            { name: 'Priya M.', role: 'Freelance SEO', text: 'The AI readiness score is a game-changer. No other free tool does this level of analysis.' },
                        ].map((testimonial) => (
                            <div key={testimonial.name} className="bg-card border border-border rounded-2xl p-6 hover:border-accent/20 transition-colors">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 fill-accent text-accent" />
                                    ))}
                                </div>
                                <p className="text-sm text-foreground/70 mb-4 leading-relaxed italic">"{testimonial.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                                        <p className="text-xs text-foreground/50">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <PricingSection />
            <ComparisonSection />

            {/* CTA Section */}
            <section className="py-20 px-6 bg-muted/30">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                        Ready to optimize your site?
                    </h2>
                    <p className="text-lg text-foreground/60 mb-8">
                        Enter your URL above and get your first SEO report in seconds.
                    </p>
                    <button
                        onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group px-10 py-5 bg-accent text-accent-900 font-bold text-xl rounded-full shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
                    >
                        Analyze Your Site Now
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 px-6 bg-background">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-foreground/60">
                            Got questions? We've got answers.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'What exactly does SEO It Is analyze?',
                                a: 'We perform 20+ comprehensive on-page SEO checks including title tags, meta descriptions, heading structure (H1-H6), internal/external links, image optimization, schema markup, page speed indicators, mobile responsiveness, SSL/HTTPS. Each check is prioritized by impact on your rankings.'
                            },
                            {
                                q: 'How is this different from tools like Ahrefs or SEMrush?',
                                a: 'Unlike enterprise tools that overwhelm with data, SEO It Is focuses on actionable on-page fixes you can implement immediately. We provide a prioritized checklist format—critical issues first, then warnings, then optimizations. Plus, our AI Suite offers cutting-edge GEO (Generative Engine Optimization) and AEO (Answer Engine Optimization) that most traditional tools don\'t provide.'
                            }
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent/30"
                            >
                                <button
                                    onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                                >
                                    <h3 className="text-lg font-semibold text-foreground pr-4">{item.q}</h3>
                                    <ChevronDown className={`w-5 h-5 text-foreground/40 flex-shrink-0 transition-transform duration-300 ${faqOpen === idx ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${faqOpen === idx ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                                    <p className="px-6 text-foreground/60 leading-relaxed">{item.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-border bg-card">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <span className="text-xl font-black tracking-tight text-foreground">
                            SEO<span className="text-accent">zapp</span>
                        </span>
                        <div className="flex items-center gap-6">
                            <a href="/blogs" className="text-sm font-medium text-foreground/60 hover:text-accent transition-colors">Blogs</a>
                            <a href="/contact" className="text-sm font-medium text-foreground/60 hover:text-accent transition-colors">Contact</a>
                        </div>
                        <p className="text-sm text-foreground/50">
                            © {new Date().getFullYear()} SEOzapp. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => { setShowEmailModal(false); setQuotaExceeded(false); }}
                    />

                    {/* Modal Card */}
                    <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                        {/* Close button */}
                        <button
                            onClick={() => { setShowEmailModal(false); setQuotaExceeded(false); }}
                            className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {quotaExceeded ? (
                            /* Quota exceeded view */
                            <div className="text-center">
                                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Lock className="w-8 h-8 text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-3">Free limit reached</h3>
                                <p className="text-foreground/60 mb-2">
                                    You've used all <span className="font-semibold text-foreground">{auditCount}/{FREE_AUDIT_LIMIT}</span> free audits for
                                </p>
                                <p className="font-semibold text-accent mb-6">{email}</p>
                                <p className="text-sm text-foreground/50 mb-6">
                                    Upgrade to Pro for unlimited audits, AI search visibility, and more.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowEmailModal(false);
                                        setQuotaExceeded(false);
                                        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="w-full py-3.5 bg-accent text-accent-900 font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2"
                                >
                                    View Pricing Plans
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            /* Email entry view */
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-14 h-14 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-7 h-7 text-accent" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">Enter your email</h3>
                                    <p className="text-sm text-foreground/60">
                                        We'll analyze <span className="font-semibold text-foreground">{url}</span> for you
                                    </p>
                                </div>

                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            autoFocus
                                            className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-background border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                            <p className="text-sm text-red-500">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={checkingQuota || !email.trim()}
                                        className="w-full py-3.5 bg-accent text-accent-900 font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {checkingQuota ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Checking…
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5" />
                                                Analyze Now
                                            </>
                                        )}
                                    </button>
                                </form>

                                <p className="text-xs text-center text-foreground/40 mt-4">
                                    2 free audits per email • No spam, ever
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
