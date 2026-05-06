import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Home, Rocket, Search, Star, MessageSquare, Zap, BarChart3, Share2, ClipboardPaste, DollarSign, ArrowRight, ChevronDown, Check, Globe } from 'lucide-react';

import { NavBar } from '@/components/ui/NavBar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage({ initialSection }: { initialSection?: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const guestEmail = localStorage.getItem('guest_email');
        setIsLoggedIn(!!user || !!guestEmail);
    }, [user]);

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

    // Scroll to initial section on mount (for /pricing, /features, /how-it-works pages)
    useEffect(() => {
        if (initialSection) {
            const sectionNameMap: Record<string, string> = {
                features: 'Features',
                'how-it-works': 'How It Works',
                pricing: 'Pricing',
            };
            setTimeout(() => {
                const el = document.getElementById(initialSection);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    if (sectionNameMap[initialSection]) {
                        setActiveSection(sectionNameMap[initialSection]);
                    }
                }
            }, 150);
        }
    }, [initialSection]);

    // URL & email state
    const [url, setUrl] = useState('');

    const navItems = [
        { name: 'Home', url: '/#hero', icon: Home, onClick: () => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }) },
        { name: 'Features', url: '/#features', icon: Rocket, onClick: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
        { name: 'How It Works', url: '/#how-it-works', icon: Zap, onClick: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
        { name: 'Pricing', url: '/#pricing', icon: DollarSign, onClick: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) },
        { name: 'FAQ', url: '/#faq', icon: MessageSquare, onClick: () => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }) },
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
        // Strip spaces from the URL to prevent malformed requests
        const cleanUrl = url.replace(/\s+/g, '').trim();
        
        if (isLoggedIn) {
            // Already logged in — go directly to analyze with the URL
            router.push({ pathname: '/analyze', query: { analyzeUrl: cleanUrl } });
        } else {
            // Store the URL so AuthCallback can redirect to /analyze with it
            localStorage.setItem('pending_analyze_url', cleanUrl);
            router.push('/auth');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Logo - Fixed Top Left */}
            <div className="fixed top-6 left-6 z-50">
                <a href="https://seozapp.com" className="text-xl font-black tracking-tight text-foreground">
                    SEO<span className="text-accent">zapp</span>
                </a>
            </div>

            {/* Navbar */}
            <NavBar
                items={navItems}
                activeTab={activeSection}
                actionButton={{
                    label: 'Analyze',
                    onClick: () => router.push(isLoggedIn ? '/analyze' : '/auth'),
                }}
            />

            {/* Top Right Controls - Desktop */}
            <div className="fixed top-6 right-6 z-50 hidden md:flex items-center gap-4">
                <ThemeToggle />
                <button
                    onClick={() => router.push(isLoggedIn ? '/analyze' : '/auth')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-900 font-bold rounded-full shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 transform hover:scale-105"
                >
                    <Search className="w-4 h-4" />
                    Analyze
                </button>
            </div>

            {/* Hero Section */}
            <section id="hero" className="relative min-h-screen flex flex-col items-center justify-start pt-32 md:pt-48 pb-20 overflow-hidden isolate">

                {/* Hero Gradient Background */}
                <div className="absolute top-1/3 md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[800px] h-[500px] md:h-[600px] bg-accent/30 rounded-full blur-[120px] opacity-60 pointer-events-none" />


                {/* Hero Content */}
                <div className="relative text-center px-4 max-w-5xl mx-auto" style={{ zIndex: 10 }}>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8 whitespace-normal md:whitespace-nowrap">
                        <span className="block text-foreground">Turn your SEO and AEO issues into</span>
                        <span className="block text-gradient mt-1 xl:mt-3 text-5xl sm:text-6xl md:text-7xl lg:text-8xl">Real Traffic</span>
                    </h1>

                    <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-12 leading-relaxed">
                        On-page analysis, AI engine optimization, backlink insights, keyword data, speed audits and fix guide — all in one tool. Fix what matters. Rank everywhere.
                    </p>
                </div>

                {/* URL Input + Login to Analyze — separate from hero content to avoid stacking issues */}
                <div className="w-full max-w-3xl mx-auto px-4" style={{ position: 'relative', zIndex: 50 }}>
                    <form
                        onSubmit={handleAnalyzeClick}
                        className="flex flex-col sm:flex-row items-center bg-card/90 backdrop-blur-md border border-border rounded-3xl sm:rounded-full p-2 shadow-[0_15px_40px_-10px_rgba(117,221,255,0.4)] transition-all duration-300 gap-2 sm:gap-0"
                    >
                        <div className="hidden sm:flex items-center pl-4 pr-1 text-foreground/40">
                            <Globe className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="relative flex-1 w-full sm:w-auto flex items-center">
                            <Globe className="absolute left-4 w-5 h-5 text-foreground/40 sm:hidden" />
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value.replace(/\s+/g, ''))}
                                placeholder="Enter website URL (e.g., example.com)"
                                className="w-full bg-transparent border-none text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-0 text-base md:text-lg min-w-0 pl-12 sm:pl-2 pr-4 py-4 sm:py-3"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!url.trim()}
                            className="w-full sm:w-auto px-8 py-4 sm:py-3 md:py-4 bg-accent text-accent-900 font-bold text-base md:text-lg rounded-2xl sm:rounded-full shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            Analyze
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6">
                        <span className="flex items-center gap-2 text-sm font-semibold text-foreground/60"><Check className="w-4 h-4 text-[#10B981] stroke-[3]" /> 1 free audit</span>
                        <span className="flex items-center gap-2 text-sm font-semibold text-foreground/60"><Check className="w-4 h-4 text-[#10B981] stroke-[3]" /> 7-day free PRO trial</span>
                    </div>
                </div>

                {/* Rank Higher On Banner */}
                <div className="mt-20 mb-8 flex flex-col items-center justify-center w-full" style={{ position: 'relative', zIndex: 50 }}>
                    <p className="text-sm font-bold tracking-[0.2em] text-foreground/50 uppercase mb-8">
                        Rank Higher On
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-80">
                        <img src="/icon1.png" alt="Claude" className="h-10 md:h-12 w-auto object-contain drop-shadow-sm" />
                        <img src="/icon2.png" alt="ChatGPT" className="h-10 md:h-12 w-auto object-contain drop-shadow-sm" />
                        <img src="/icon3.png" alt="Perplexity" className="h-10 md:h-12 w-auto object-contain drop-shadow-sm" />
                        <img src="/icon4.png" alt="Gemini" className="h-10 md:h-12 w-auto object-contain drop-shadow-sm" />
                        <img src="/icon5.png" alt="SearchGPT" className="h-10 md:h-12 w-auto object-contain drop-shadow-sm rounded-full" />
                        <img src="/icon6.png" alt="Google" className="h-10 md:h-12 w-auto object-contain drop-shadow-sm" />
                    </div>
                </div>

            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6 bg-card">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Everything You Need that moves the needle
                        </h2>
                        <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                            A complete SEO toolkit that covers every aspect of modern search optimization,
                            from traditional SEO to AI search optimization.
                        </p>
                    </div>
                    <FeaturesSection />
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-6 bg-background">
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
                                <div key={step.num} className="relative bg-card border border-border rounded-2xl p-8 transition-all duration-300 group">
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
            <section className="py-20 px-6 bg-card">
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
            <section className="py-20 px-6 bg-background">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                        Ready to optimize your site?
                    </h2>
                    <p className="text-lg text-foreground/60 mb-8">
                        Enter your URL above and get your first SEO report in seconds.
                    </p>
                    <button
                        onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group px-10 py-5 bg-accent text-accent-900 font-bold text-xl rounded-full shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 inline-flex items-center gap-3"
                    >
                        Analyze Your Site Now
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 px-6 bg-card">
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
                                a: 'SEOzapp runs a multi-layer audit across four core dimensions every time you scan a URL.\n\nOn-page SEO — titles, meta descriptions, heading hierarchy, canonical tags, image alt text, internal/external links, word count, and structured data (JSON-LD schema) and more. You get a clear score and a prioritized list of what\'s hurting your rankings.\n\nPage speed — load time, TTFB, total page weight, number of requests, and a full breakdown of what\'s eating your bandwidth (scripts, images, HTML, CSS) and which third-party domains are responsible. You\'ll see exactly where your milliseconds are going.\n\nAI visibility — whether your site can be discovered and scraped by AI crawlers like ChatGPT (GPTBot), Google AI Overviews, Anthropic, and Perplexity. It checks your llms.txt, robots.txt rules, content density, and schema markup to score how likely AI models are to index and cite your content and gives actionable fix plan.\n\nTechnical and security — security headers, HTTPS, HSTS, sitemap presence, crawl signals, mixed content warnings, and trust signals like privacy policy, terms, and contact pages.\n\nEvery scan produces an overall score, a per-category breakdown, and a ranked issue list — so you always know what to fix first.'
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
                                <div className={`overflow-hidden transition-all duration-300 ${faqOpen === idx ? 'max-h-[800px] pb-6' : 'max-h-0'}`}>
                                    <p className="px-6 text-foreground/60 leading-relaxed whitespace-pre-line">{item.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-16 pb-8 px-6 border-t border-border bg-card">
                <div className="max-w-7xl mx-auto">
                    {/* Top Section — Brand + Link Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16 mb-14">
                        {/* Brand Column */}
                        <div className="col-span-2 md:col-span-1">
                            <a href="https://seozapp.com" className="text-2xl font-black tracking-tight text-foreground inline-block mb-4">
                                SEO<span className="text-accent">zapp</span>
                            </a>
                            <p className="text-sm text-foreground/50 leading-relaxed max-w-xs">
                                The all-in-one SEO audit toolkit. Fix what matters. Rank everywhere — on Google and AI search engines.
                            </p>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/80 mb-5">Company</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="/blogs" className="text-sm text-foreground/60 hover:text-accent transition-colors">Blog</a>
                                </li>
                                <li>
                                    <a href="https://x.com/ItsUddipan" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/60 hover:text-accent transition-colors">Contact</a>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/80 mb-5">Legal</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="/privacy" className="text-sm text-foreground/60 hover:text-accent transition-colors">Privacy Policy</a>
                                </li>
                                <li>
                                    <a href="/terms" className="text-sm text-foreground/60 hover:text-accent transition-colors">Terms of Service</a>
                                </li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/80 mb-5">Resources</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="/best-free-website-audit-tools" className="text-sm text-foreground/60 hover:text-accent transition-colors">Best Free Website Audit Tools</a>
                                </li>
                                <li>
                                    <a href="/best-seo-tool-for-agencies" className="text-sm text-foreground/60 hover:text-accent transition-colors">Best SEO Tool for Agencies</a>
                                </li>
                                <li>
                                    <a href="/cheaper-alternative-to-semrush" className="text-sm text-foreground/60 hover:text-accent transition-colors">Cheaper Alternative to Semrush</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-foreground/40">
                            © {new Date().getFullYear()} SEOzapp. All rights reserved.
                        </p>
                        <a href="https://startupfa.me/s/seozapp?utm_source=www.seozapp.com" target="_blank" rel="noreferrer">
                            <img src="https://startupfa.me/badges/featured-badge-small.webp" alt="SEOzapp - Featured on Startup Fame" width="224" height="36" className="w-[140px] h-auto" />
                        </a>
                    </div>
                </div>
            </footer>

        </div>
    );
}
