import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Rocket, Search, Star, MessageSquare, Zap, BarChart3, Share2, ClipboardPaste, DollarSign, ArrowRight, ChevronDown } from 'lucide-react';
import ParticleCanvas from '@/components/landing/ParticleHero';
import { NavBar } from '@/components/ui/NavBar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';

export default function LandingPage() {
    const navigate = useNavigate();

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
        { icon: BarChart3, num: '3', title: 'Get Prioritized Results with action plan', desc: 'Issues are ranked by impact: critical, warning, and good status.' },
        { icon: Share2, num: '4', title: 'Export & Share', desc: 'Download as Markdown/PDF, copy to clipboard, or share directly with your team.' },
    ];

    const handleAnalyzeClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;
        
        // Store the URL so AuthCallback/AuthPage can redirect to /analyze with it
        localStorage.setItem('pending_analyze_url', url.trim());
        navigate('/auth');
    };

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
                        Comprehensive on-page analysis, Ai readiness scoring, bot access checks, top search keywords, performance metrics and fix action plan — all in one tool.
                    </p>
                </div>

                {/* URL Input + Login to Analyze — separate from hero content to avoid stacking issues */}
                <div className="w-full max-w-2xl mx-auto px-6" style={{ position: 'relative', zIndex: 50 }}>
                    <form
                        onSubmit={handleAnalyzeClick}
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
                            disabled={!url.trim()}
                            className="group px-6 py-4 bg-accent text-accent-900 font-bold text-base rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                            style={{ position: 'relative', zIndex: 2 }}
                        >
                            Login to Analyze
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>
                    <p className="text-xs text-foreground/40 mt-3 text-center">
                        1 free audit • No credit card required
                    </p>
                </div>


            </section>

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

                    {/* Rank Higher On Banner */}
                    <div className="mt-20 mb-8 flex flex-col items-center justify-center">
                        <p className="text-sm font-bold tracking-[0.2em] text-foreground/50 uppercase mb-8">
                            Rank Higher On
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-80">
                            <img src="/icon1.png" alt="Claude" className="h-10 md:h-12 w-auto object-contain hover:scale-110 transition-all duration-300 hover:opacity-100 drop-shadow-sm" />
                            <img src="/icon2.png" alt="ChatGPT" className="h-10 md:h-12 w-auto object-contain hover:scale-110 transition-all duration-300 hover:opacity-100 drop-shadow-sm" />
                            <img src="/icon3.png" alt="Perplexity" className="h-10 md:h-12 w-auto object-contain hover:scale-110 transition-all duration-300 hover:opacity-100 drop-shadow-sm" />
                            <img src="/icon4.png" alt="Gemini" className="h-10 md:h-12 w-auto object-contain hover:scale-110 transition-all duration-300 hover:opacity-100 drop-shadow-sm" />
                            <img src="/icon5.png" alt="SearchGPT" className="h-10 md:h-12 w-auto object-contain hover:scale-110 transition-all duration-300 hover:opacity-100 drop-shadow-sm rounded-full" />
                            <img src="/icon6.png" alt="Google" className="h-10 md:h-12 w-auto object-contain hover:scale-110 transition-all duration-300 hover:opacity-100 drop-shadow-sm" />
                        </div>
                    </div>
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

                    {/* Video Demo Section */}
                    <div className="w-full max-w-5xl mx-auto mt-20" style={{ position: 'relative', zIndex: 50 }}>
                        <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-accent/10 bg-card">
                            <div className="aspect-video bg-muted w-full relative group">
                                <video
                                    className="w-full h-full object-cover absolute inset-0"
                                    controls
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                >
                                    <source src="/video/WhatsApp Video 2026-03-08 at 11.21.50 AM.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
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
                                q: 'What exactly does SEOzapp analyze?',
                                a: 'We perform 20+ comprehensive on-page SEO checks including title tags, meta descriptions, heading structure (H1-H6), internal/external links, image optimization, schema markup, page speed indicators, mobile responsiveness, SSL/HTTPS. Each check is prioritized by impact on your rankings.'
                            },
                            {
                                q: 'How is this different from tools like Ahrefs or SEMrush?',
                                a: 'Unlike enterprise tools that overwhelm with data, SEOzapp focuses on actionable on-page fixes you can implement immediately. We provide a prioritized checklist format—critical issues first, then warnings, then optimizations. Plus, our AI Suite offers cutting-edge GEO (Generative Engine Optimization) and AEO (Answer Engine Optimization) that most traditional tools don\'t provide.'
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
                            <a href="https://x.com/ItsUddipan" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground/60 hover:text-accent transition-colors">Contact</a>
                        </div>
                        <p className="text-sm text-foreground/50">
                            © {new Date().getFullYear()} SEOzapp. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

        </div>
    );
}
