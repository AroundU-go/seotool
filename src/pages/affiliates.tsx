import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Home,
    Rocket,
    Search,
    Zap,
    DollarSign,
    TrendingUp,
    Users,
    CheckCircle2,
    Percent,
    ShieldCheck,
    Clock,
    ArrowRight,
    Sparkles,
    Share2,
    CreditCard,
    ChevronDown,
    ChevronUp,
    Mail,
    BarChart3,
    Award,
    Layers
} from 'lucide-react';

import { NavBar } from '@/components/ui/NavBar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function AffiliatesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const isLoggedIn = !!user;

    const navItems = [
        { name: 'Home', url: '/#hero', icon: Home, onClick: () => router.push('/#hero') },
        { name: 'Features', url: '/#features', icon: Rocket, onClick: () => router.push('/#features') },
        { name: 'How It Works', url: '/#how-it-works', icon: Zap, onClick: () => router.push('/#how-it-works') },
        { name: 'Pricing', url: '/#pricing', icon: DollarSign, onClick: () => router.push('/#pricing') },
        { name: 'Analyze', url: isLoggedIn ? '/analyze' : '/auth', icon: Search, onClick: () => router.push(isLoggedIn ? '/analyze' : '/auth') },
    ];

    // Interactive Calculator State
    const [referralsCount, setReferralsCount] = useState<number>(30);
    const commissionPerUser = 8.70; // 30% of $29/mo Pro plan
    const monthlyEarnings = Math.round(referralsCount * commissionPerUser);
    const annualEarnings = Math.round(monthlyEarnings * 12);

    // FAQ Accordion State
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            q: 'How much commission can I earn?',
            a: 'You earn a 30% recurring commission on all Pro subscriptions ($29/month) for the entire lifetime of the customer, plus 30% on one-time audit purchases ($5). There is no cap on how much you can earn.'
        },
        {
            q: 'How and when do I get paid?',
            a: 'Commissions are paid out monthly with a minimum payout threshold of just $50 via PayPal, Stripe, or direct bank transfer.'
        },
        {
            q: 'How long does the tracking cookie last?',
            a: 'Our affiliate tracking cookie lasts for 60 days. If someone clicks your link and signs up within 60 days, you will receive credit for the referral.'
        },
        {
            q: 'Who can join the affiliate program?',
            a: 'Anyone with an audience interested in SEO, digital marketing, website growth, SaaS, or agency workflows can join! Bloggers, YouTubers, newsletter creators, agency owners, and developers are all welcome.'
        },
        {
            q: 'Are paid ads (PPC) allowed?',
            a: 'You may run ads to your own content (e.g. review articles, landing pages, or YouTube videos), but direct bidding on branded terms like "SEOzapp" or misleading ads is strictly prohibited.'
        },
        {
            q: 'How do I track my referrals and earnings?',
            a: 'Once approved, you will have access to a real-time affiliate portal where you can monitor link clicks, free signups, paid conversions, pending payouts, and historical earnings.'
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/20">
            <Head>
                <title>Affiliate Program — Earn 30% Recurring Commission | SEOzapp</title>
                <meta
                    name="description"
                    content="Join the SEOzapp Affiliate Program. Earn 30% recurring monthly commissions by recommending the all-in-one SEO & AEO audit toolkit to your audience."
                />
                <link rel="canonical" href="https://www.seozapp.com/affiliates" />
                <meta property="og:title" content="SEOzapp Affiliate Program — 30% Lifetime Recurring Commission" />
                <meta
                    property="og:description"
                    content="Partner with SEOzapp. Earn 30% lifetime monthly recurring revenue with 60-day cookie tracking and monthly payouts."
                />
                <meta property="og:url" content="https://www.seozapp.com/affiliates" />
                <meta property="og:type" content="website" />
            </Head>

            {/* Top Bar Logo */}
            <div className="fixed top-6 left-6 z-50">
                <a href="https://seozapp.com" className="text-xl font-black tracking-tight text-foreground">
                    SEO<span className="text-accent">zapp</span>
                </a>
            </div>

            {/* Navigation Bar */}
            <NavBar items={navItems} activeTab="" />

            {/* Theme Toggle Button */}
            <div className="fixed top-6 right-6 z-50 hidden md:block">
                <ThemeToggle />
            </div>

            <main className="flex-1 w-full pt-28 md:pt-36 pb-20">
                {/* Hero Section */}
                <section className="max-w-5xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-700 dark:text-accent-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-8 shadow-sm">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span>SEOzapp Partner & Affiliate Program</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
                        Earn <span className="text-accent">30% Recurring</span> Commission Every Month
                    </h1>

                    <p className="text-lg sm:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed mb-10">
                        Help founders, marketers, creators, and agencies audit and fix their SEO to rank higher on Google and AI search engines — and get rewarded with lifetime passive income.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <a
                            href="https://x.com/ItsUddipan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-accent-900 font-bold rounded-full shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] transition-all duration-300 text-base"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Become an Affiliate</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="#calculator"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border text-foreground hover:border-accent/50 hover:text-accent font-semibold rounded-full shadow-sm transition-all text-base"
                        >
                            <BarChart3 className="w-4 h-4 text-accent" />
                            <span>Calculate Earnings</span>
                        </a>
                    </div>

                    {/* Feature Highlights Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
                        <div className="bg-card border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                                <Percent className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">30% Lifetime</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Continuous recurring commission for the entire customer lifecycle.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">60-Day Cookie</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Generous 60-day attribution window so you never miss a referral credit.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">Monthly Payouts</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Reliable monthly payouts via PayPal, Stripe, or direct bank transfer.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">High Conversion</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Free audits and affordable pricing convert trial visitors quickly into paid users.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Interactive Calculator Section */}
                <section id="calculator" className="max-w-4xl mx-auto px-6 mt-28">
                    <div className="bg-card border-2 border-accent/40 rounded-3xl p-8 sm:p-12 shadow-xl shadow-accent/5">
                        <div className="text-center max-w-xl mx-auto mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-700 dark:text-accent-300 text-xs font-bold uppercase tracking-wider mb-3">
                                <DollarSign className="w-3.5 h-3.5" />
                                Earnings Estimator
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                                How Much Can You Earn?
                            </h2>
                            <p className="text-foreground/70 text-sm sm:text-base">
                                Drag the slider to estimate your recurring income based on active Pro plan referrals.
                            </p>
                        </div>

                        {/* Slider Controller */}
                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-3">
                                <label htmlFor="referral-slider" className="text-sm font-semibold text-foreground/80">
                                    Number of Referred Pro Users:
                                </label>
                                <span className="text-2xl font-black text-accent">{referralsCount}</span>
                            </div>
                            <input
                                id="referral-slider"
                                type="range"
                                min="5"
                                max="200"
                                step="5"
                                value={referralsCount}
                                onChange={(e) => setReferralsCount(Number(e.target.value))}
                                className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                            <div className="flex justify-between text-xs text-foreground/40 mt-2 font-mono">
                                <span>5 referrals</span>
                                <span>50 referrals</span>
                                <span>100 referrals</span>
                                <span>200 referrals</span>
                            </div>
                        </div>

                        {/* Earnings Display Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/50 rounded-2xl p-6 border border-border text-center">
                            <div className="p-4 bg-card rounded-xl border border-border/70">
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                                    Monthly Recurring Income
                                </span>
                                <div className="text-4xl font-black text-accent mt-2 tracking-tight">
                                    ${monthlyEarnings.toLocaleString()}
                                    <span className="text-sm font-normal text-foreground/50">/mo</span>
                                </div>
                                <p className="text-xs text-foreground/60 mt-1">Paid out every month</p>
                            </div>

                            <div className="p-4 bg-card rounded-xl border border-border/70">
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                                    Annual Passive Revenue
                                </span>
                                <div className="text-4xl font-black text-foreground mt-2 tracking-tight">
                                    ${annualEarnings.toLocaleString()}
                                    <span className="text-sm font-normal text-foreground/50">/yr</span>
                                </div>
                                <p className="text-xs text-foreground/60 mt-1">Projected annual recurring earnings</p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <a
                                href="https://x.com/ItsUddipan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-accent-900 font-bold rounded-full hover:shadow-lg hover:shadow-accent/30 hover:scale-[1.02] transition-all"
                            >
                                <span>Join & Start Earning</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* How It Works (3 Simple Steps) */}
                <section className="max-w-5xl mx-auto px-6 mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            How the Program Works
                        </h2>
                        <p className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto">
                            Start earning in three simple steps with zero upfront costs or technical setup.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Step 1 */}
                        <div className="bg-card border border-border rounded-2xl p-8 relative flex flex-col">
                            <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent font-black text-lg flex items-center justify-center mb-6">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Join & Get Your Link</h3>
                            <p className="text-foreground/70 text-sm leading-relaxed flex-1">
                                Apply in under 2 minutes. Once approved, you get access to your personalized affiliate dashboard and tracking link.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-card border border-border rounded-2xl p-8 relative flex flex-col">
                            <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent font-black text-lg flex items-center justify-center mb-6">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Share with Your Audience</h3>
                            <p className="text-foreground/70 text-sm leading-relaxed flex-1">
                                Promote SEOzapp through your blog, YouTube reviews, newsletter, client audits, or social media using our pre-built assets.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-card border border-border rounded-2xl p-8 relative flex flex-col">
                            <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent font-black text-lg flex items-center justify-center mb-6">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Earn Recurring Payouts</h3>
                            <p className="text-foreground/70 text-sm leading-relaxed flex-1">
                                Receive 30% every month for each active customer. Track clicks, conversions, and payouts in real-time.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Why Promote SEOzapp */}
                <section className="max-w-6xl mx-auto px-6 mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Why You & Your Audience Will Love SEOzapp
                        </h2>
                        <p className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto">
                            We built SEOzapp to remove the friction and high costs of traditional SEO suites.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 text-accent">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Next-Gen AI & GEO SEO</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                We help sites optimize not just for Google, but also for AI search engines like ChatGPT, Claude, and Perplexity.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 text-accent">
                                <Award className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Instant Actionable Audits</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                No complex graphs without context. Users receive a prioritized checklist of critical issues and one-click fix recommendations.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 text-accent">
                                <Layers className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Client-Ready PDF Exports</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Agencies and freelancers can generate beautiful, exportable audit reports for their clients with a single click.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 text-accent">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">High Conversion Funnel</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                With a free instant audit and an attractive $5 one-time or $29/mo Pro tier, referral traffic converts easily.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 text-accent">
                                <Share2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Marketing Assets Provided</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Get access to high-converting banners, product screenshots, email copy, and feature briefs to make promoting effortless.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 hover:border-accent/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 text-accent">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Dedicated Partner Support</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Have special campaign ideas or custom discount codes for your community? Our team is always here to collaborate.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Who Should Join */}
                <section className="max-w-5xl mx-auto px-6 mt-32">
                    <div className="bg-card border border-border rounded-3xl p-8 sm:p-12">
                        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                            Who is this Program Ideal For?
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mt-1">
                                    <CheckCircle2 className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg mb-1">SEO Specialists & Agencies</h3>
                                    <p className="text-sm text-foreground/60">
                                        Recommend an accessible SEO and website audit tool to your clients and community.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mt-1">
                                    <CheckCircle2 className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg mb-1">Bloggers & Content Creators</h3>
                                    <p className="text-sm text-foreground/60">
                                        Monetize your marketing blog posts, tool comparisons, and YouTube software tutorials.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mt-1">
                                    <CheckCircle2 className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg mb-1">Newsletter Authors</h3>
                                    <p className="text-sm text-foreground/60">
                                        Feature SEOzapp in tech, growth, or indie maker digests for ongoing monthly income.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mt-1">
                                    <CheckCircle2 className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-lg mb-1">Web Designers & Developers</h3>
                                    <p className="text-sm text-foreground/60">
                                        Help your web design clients audit their technical SEO upon project handoff.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto px-6 mt-32">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-base text-foreground/60">
                            Got questions about the affiliate program? Find quick answers below.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div
                                    key={index}
                                    className="bg-card border border-border rounded-2xl overflow-hidden transition-colors hover:border-accent/40"
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-foreground focus:outline-none"
                                    >
                                        <span>{faq.q}</span>
                                        {isOpen ? (
                                            <ChevronUp className="w-5 h-5 text-accent shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-foreground/50 shrink-0" />
                                        )}
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6 text-foreground/70 text-sm leading-relaxed border-t border-border/40 pt-4">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Bottom CTA Banner */}
                <section className="max-w-5xl mx-auto px-6 mt-32">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-accent/10 border-2 border-accent/30 p-10 sm:p-14 text-center">
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
                                Ready to Start Earning with SEOzapp?
                            </h2>
                            <p className="text-foreground/70 text-base mb-8">
                                Apply today, get your link in minutes, and start earning 30% recurring commission on every customer you refer.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href="https://x.com/ItsUddipan"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-900 font-bold rounded-full shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] transition-all duration-300 text-base"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    <span>Apply for Affiliate Program</span>
                                </a>
                                <a
                                    href="mailto:partners@seozapp.com?subject=SEOzapp%20Affiliate%20Inquiry"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-background border border-border text-foreground hover:border-accent/40 font-semibold rounded-full shadow-sm transition-all text-base"
                                >
                                    <Mail className="w-4 h-4 text-accent" />
                                    <span>Contact Partner Support</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Shared Footer */}
            <Footer />
        </div>
    );
}
