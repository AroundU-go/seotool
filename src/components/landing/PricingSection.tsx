import { Check, Sparkles, Building2, Zap } from 'lucide-react';

interface PricingTier {
    name: string;
    price: string;
    period?: string;
    description: string;
    quota: string;
    features: string[];
    highlight?: boolean;
    icon: React.ReactNode;
    badge?: string;
    cta: string;
    href?: string;
}

const tiers: PricingTier[] = [
    {
        name: 'Free',
        price: '$0',
        period: '/month',
        description: 'Get started with SEOzapp — no credit card required.',
        quota: '2 free audits',
        features: [
            'Full On-page SEO analysis',
            'Bot access checks',
            'Performance metrics',
            'SERP Preview',
        ],
        icon: <Zap className="w-6 h-6" />,
        cta: 'Get Started Free',
    },
    {
        name: 'Pro',
        price: '$20',
        period: '/month',
        description: 'For growth-focused users and small agencies who need more power.',
        quota: 'Unlimited audits',
        features: [
            'Everything in Free',
            'Email alerts',
            'CSV exports',
            'AEO & GEO optimization',
            'AI Search Visibility scoring',
            'AI keyword suggestions',
            'Priority support',
        ],
        highlight: true,
        icon: <Sparkles className="w-6 h-6" />,
        badge: 'Most Popular',
        cta: 'Upgrade to Pro',
        href: `https://test.checkout.dodopayments.com/buy/pdt_0NYsnZquqsrqDi9SW9pHT?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}`,
    },
    {
        name: 'Agency',
        price: '$49',
        period: '/month',
        description: 'White-label reports, multi-user seats, and unlimited scale.',
        quota: 'Unlimited audits',
        features: [
            'Everything in Pro',
            'Unlimited audits',
            'Multi-user seats',
            'White-label reports',
            'Weekly scheduled scans',
            'Custom pricing available',
        ],
        icon: <Building2 className="w-6 h-6" />,
        cta: 'Contact Sales',
    },
];

export function PricingSection() {
    return (
        <section id="pricing" className="py-20 px-6 bg-muted/30">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                        Start free. Upgrade when you're ready for more audits, automation, and advanced features.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`
                                relative rounded-2xl p-8 transition-all duration-300 group
                                ${tier.highlight
                                    ? 'bg-card border-2 border-accent shadow-xl shadow-accent/10 scale-[1.02] hover:shadow-accent/20'
                                    : 'bg-card border border-border hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5'
                                }
                            `}
                        >
                            {/* Badge */}
                            {tier.badge && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span className="px-4 py-1 bg-accent text-accent-900 text-xs font-bold uppercase tracking-wider rounded-full shadow-md shadow-accent/30">
                                        {tier.badge}
                                    </span>
                                </div>
                            )}

                            {/* Icon & Name */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`
                                    w-11 h-11 rounded-xl flex items-center justify-center
                                    ${tier.highlight
                                        ? 'bg-accent/20 text-accent'
                                        : 'bg-accent/10 text-accent/70 group-hover:text-accent group-hover:bg-accent/15'
                                    }
                                    transition-colors
                                `}>
                                    {tier.icon}
                                </div>
                                <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                            </div>

                            {/* Price */}
                            <div className="mb-2">
                                <span className="text-5xl font-black text-foreground tracking-tight">{tier.price}</span>
                                {tier.period && (
                                    <span className="text-base font-medium text-foreground/50 ml-1">{tier.period}</span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-foreground/50 mb-6 leading-relaxed">{tier.description}</p>

                            {/* Quota Badge */}
                            <div className={`
                                inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold mb-6
                                ${tier.highlight
                                    ? 'bg-accent/15 text-accent border border-accent/20'
                                    : 'bg-muted text-foreground/60 border border-border'
                                }
                            `}>
                                {tier.quota}
                            </div>

                            {/* CTA */}
                            {tier.href ? (
                                <a
                                    href={tier.href}
                                    className={`
                                        block w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 text-center
                                        ${tier.highlight
                                            ? 'bg-accent text-accent-900 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02]'
                                            : 'bg-card border border-border text-foreground hover:border-accent/50 hover:text-accent'
                                        }
                                    `}
                                >
                                    {tier.cta}
                                </a>
                            ) : (
                                <button
                                    className={`
                                        w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300
                                        ${tier.highlight
                                            ? 'bg-accent text-accent-900 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02]'
                                            : 'bg-card border border-border text-foreground hover:border-accent/50 hover:text-accent'
                                        }
                                    `}
                                >
                                    {tier.cta}
                                </button>
                            )}

                            {/* Divider */}
                            <div className="border-t border-border my-6" />

                            {/* Features */}
                            <ul className="space-y-3">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.highlight ? 'text-accent' : 'text-accent/60'}`} />
                                        <span className="text-foreground/70">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
