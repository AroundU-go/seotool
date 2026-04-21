import { Check, Sparkles, Building2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useState } from 'react';

const PRODUCT_ONE_TIME = process.env.NEXT_PUBLIC_DODO_PRODUCT_ONE_TIME || 'pdt_0NYskaXuWvqB7pOJJAWHR';
const PRODUCT_SUBSCRIPTION = process.env.NEXT_PUBLIC_DODO_PRODUCT_SUBSCRIPTION || 'pdt_0NYsnZquqsrqDi9SW9pHT';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const paidTiers = [
    {
        name: 'One-Time',
        price: '$5',
        description: 'Unlock powerful features with a single one-time payment.',
        quota: '2 full audits',
        features: [
            'Everything in Free',
            'Pdf exports',
            'On-page & Technical analysis',
            'AI Visibility analysis',
            'AI keyword suggestions',
            'Security vulnerability scanning',
            'Backlink analysis',
            'History tracking',
            'Issues & Fix action plan',
        ],
        icon: <Sparkles className="w-6 h-6" />,
        cta: 'Get One-Time — $5',
        productId: PRODUCT_ONE_TIME,
    },
    {
        name: 'Pro',
        price: '$29',
        period: '/month',
        description: 'For growth-focused teams and agencies who need unlimited power.',
        quota: 'Unlimited audits',
        features: [
            'Everything in One-Time',
            'Email alerts',
            'AEO & GEO optimization',
            'Certified report page',
            'Bulk URL analysis',
            'Unlimited audits',
            'Priority support',
            'Cancel anytime',
        ],
        highlight: true,
        icon: <Building2 className="w-6 h-6" />,
        badge: 'Most Popular',
        cta: 'Upgrade to Pro',
        productId: PRODUCT_SUBSCRIPTION,
    },
];

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

    const handleCheckout = async (productId: string) => {
        if (!user?.id) {
            router.push('/auth?return_to=/analyze');
            return;
        }

        setCheckoutLoading(productId);
        try {
            const redirectUrl = `https://seozapp.com/analyze?payment=success`;
            const checkoutUrl = `https://checkout.dodopayments.com/buy/${productId}?quantity=1&redirect_url=${encodeURIComponent(redirectUrl)}&email=${encodeURIComponent(user.email || '')}&disableEmail=true&metadata_user_id=${encodeURIComponent(user.id)}`;
            window.location.href = checkoutUrl;
        } catch (err) {
            console.error('[PricingModal] Checkout error:', err);
            setCheckoutLoading(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-background rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 transition-colors shadow-sm border border-gray-200"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                            Upgrade Your Plan
                        </h2>
                        <p className="text-sm sm:text-base text-foreground/60 max-w-lg mx-auto">
                            Unlock advanced features, detailed fixes, and AI-powered insights.
                        </p>
                    </div>

                    {/* Cards */}
                    <div className="grid sm:grid-cols-2 gap-5 lg:gap-6">
                        {paidTiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`
                                    relative rounded-2xl p-6 sm:p-7 transition-all duration-300 group
                                    ${tier.highlight
                                        ? 'bg-card border-2 border-accent shadow-xl shadow-accent/10 scale-[1.01] hover:shadow-accent/20'
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
                                <div className="flex items-center gap-3 mb-5">
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
                                    <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">{tier.price}</span>
                                    {tier.period && (
                                        <span className="text-base font-medium text-foreground/50 ml-1">{tier.period}</span>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-sm text-foreground/50 mb-5 leading-relaxed">{tier.description}</p>

                                {/* Quota Badge */}
                                <div className={`
                                    inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold mb-5
                                    ${tier.highlight
                                        ? 'bg-accent/15 text-accent border border-accent/20'
                                        : 'bg-muted text-foreground/60 border border-border'
                                    }
                                `}>
                                    {tier.quota}
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => handleCheckout(tier.productId)}
                                    disabled={checkoutLoading === tier.productId}
                                    className={`
                                        block w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 text-center
                                        ${tier.highlight
                                            ? 'bg-accent text-accent-900 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02]'
                                            : 'bg-card border border-border text-foreground hover:border-accent/50 hover:text-accent'
                                        }
                                        ${checkoutLoading === tier.productId ? 'opacity-70 cursor-wait' : ''}
                                    `}
                                >
                                    {checkoutLoading === tier.productId ? 'Loading...' : tier.cta}
                                </button>

                                {/* Divider */}
                                <div className="border-t border-border my-5" />

                                {/* Features */}
                                <ul className="space-y-2.5">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm">
                                            <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                                            <span className="text-foreground/70">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
