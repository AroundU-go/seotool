import { useEffect, useRef } from "react";
import {
    IconTerminal2,
    IconBrain,
    IconLink,
    IconSearch,
    IconFlame,
    IconRobot,
    IconShieldCheck,
    IconHistory,
    IconWorld,
} from "@tabler/icons-react";

interface FeatureData {
    title: string;
    icon: React.ReactNode;
    whatItDoes: string;
    bullets: string[];
    whyItMatters: string;
    matterBullets: string[];
}

const features: FeatureData[] = [
    {
        title: "Deep On-Page SEO Analysis",
        icon: <IconTerminal2 className="w-7 h-7" />,
        whatItDoes:
            "SEOzapp runs a comprehensive on-page audit across 25+ critical SEO factors including:",
        bullets: [
            "Meta titles & descriptions",
            "Heading structure (H1–H6)",
            "Internal & external links",
            "Image optimization (alt text, size)",
            "Content structure & readability",
            "Schema markup & more",
        ],
        whyItMatters:
            "Most websites don't fail at SEO because of strategy — they fail at execution basics. SEOzapp identifies:",
        matterBullets: [
            "Missing meta tags",
            "Duplicate headings",
            "Poor structure",
            "Broken linking",
        ],
    },
    {
        title: "AI Engine Optimization (AEO)",
        icon: <IconBrain className="w-7 h-7" />,
        whatItDoes:
            "SEOzapp analyzes how your content performs across AI search engines — ChatGPT, Perplexity, Gemini, and AI-powered search layers. It provides:",
        bullets: [
            "AI visibility score",
            "AI-readiness insights",
            "Suggestions to improve AI discoverability",
        ],
        whyItMatters:
            "Search is no longer just Google. Your content now needs to rank in:",
        matterBullets: [
            "AI answers",
            "LLM-generated summaries",
            "Conversational search",
            "Something most traditional tools ignore",
        ],
    },
    {
        title: "Backlink Analysis",
        icon: <IconLink className="w-7 h-7" />,
        whatItDoes: "SEOzapp provides a full backlink profile including:",
        bullets: [
            "New backlinks",
            "Low-quality / toxic links",
            "Referring domains",
            "Domain authority insights",
            "Link quality metrics",
        ],
        whyItMatters:
            "Backlinks are still one of the strongest ranking factors. SEOzapp helps you:",
        matterBullets: [
            "Identify harmful links",
            "Discover link opportunities",
            "Understand authority gaps",
            "All without a heavy enterprise tool",
        ],
    },
    {
        title: "Top Search Keywords Insights",
        icon: <IconSearch className="w-7 h-7" />,
        whatItDoes: "SEOzapp identifies:",
        bullets: [
            "Top ranking keywords for your page",
            "Keyword volume",
            "Keyword positioning",
        ],
        whyItMatters:
            "You don't just need keywords — you need clarity on:",
        matterBullets: [
            "What you already rank for",
            "Where you can improve",
            "What to double down on",
            "Optimize existing pages faster instead of guessing",
        ],
    },
    {
        title: "Speed & Performance Optimization",
        icon: <IconFlame className="w-7 h-7" />,
        whatItDoes: "SEOzapp analyzes your site's performance:",
        bullets: [
            "Page load time",
            "TTFB (time to first byte)",
            "Page size & request breakdown",
            "Actionable performance fixes",
        ],
        whyItMatters: "Speed directly impacts:",
        matterBullets: [
            "SEO rankings",
            "User experience",
            "Conversions",
            "Most sites lose traffic because of slow performance",
        ],
    },
    {
        title: "Bot Access & Crawlability Checks",
        icon: <IconRobot className="w-7 h-7" />,
        whatItDoes: "SEOzapp checks:",
        bullets: [
            "Whether search engines can access your page",
            "Crawl issues",
            "Indexing blockers",
        ],
        whyItMatters:
            "If bots can't access your page, you don't rank — no matter how good your content is.",
        matterBullets: [
            "Ensures search-engine friendliness",
            "Detects technical access barriers",
        ],
    },
    {
        title: "Security & Technical Health",
        icon: <IconShieldCheck className="w-7 h-7" />,
        whatItDoes: "SEOzapp scans for:",
        bullets: [
            "Security vulnerabilities",
            "HTTPS/SSL issues",
            "Technical SEO gaps",
        ],
        whyItMatters: "Security is a ranking signal. Also:",
        matterBullets: [
            "Insecure sites lose trust",
            "Technical errors hurt indexing",
        ],
    },
    {
        title: "History Tracking",
        icon: <IconHistory className="w-7 h-7" />,
        whatItDoes: "SEOzapp lets you:",
        bullets: ["Track past audits", "Monitor improvements over time"],
        whyItMatters: "SEO is not one-time. You need:",
        matterBullets: [
            "Progress tracking",
            "Before vs after comparison",
        ],
    },
    {
        title: "Bulk URL Analysis",
        icon: <IconWorld className="w-7 h-7" />,
        whatItDoes: "SEOzapp lets you:",
        bullets: ["Analyze multiple URLs at once", "Scale SEO audits"],
        whyItMatters:
            "Instead of auditing pages one-by-one:",
        matterBullets: [
            "Scale SEO across your entire site",
            "Audit all client pages in one go",
        ],
    },
];

function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("feature-visible");
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return ref;
}

function FeatureCard({ feature, index }: { feature: FeatureData; index: number }) {
    const ref = useScrollReveal();
    const isEven = index % 2 === 0;

    return (
        <div
            ref={ref}
            className="feature-card-wrapper"
            style={{ transitionDelay: `${(index % 3) * 100}ms` }}
        >
            <div className={`feature-card ${isEven ? "feature-card--left" : "feature-card--right"}`}>
                {/* Number badge */}
                <div className="feature-number">
                    {String(index + 1).padStart(2, "0")}
                </div>

                {/* Header */}
                <div className="feature-header">
                    <div className="feature-icon-wrap">
                        {feature.icon}
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                </div>

                {/* Content columns */}
                <div className="feature-columns">
                    {/* What it does */}
                    <div className="feature-col">
                        <div className="feature-col-label">
                            <span className="feature-col-dot feature-col-dot--does" />
                            What it does
                        </div>
                        <p className="feature-col-desc">{feature.whatItDoes}</p>
                        <ul className="feature-bullet-list">
                            {feature.bullets.map((b) => (
                                <li key={b} className="feature-bullet">
                                    <span className="feature-bullet-icon">›</span>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Divider */}
                    <div className="feature-divider" />

                    {/* Why it matters */}
                    <div className="feature-col">
                        <div className="feature-col-label">
                            <span className="feature-col-dot feature-col-dot--matters" />
                            Why it matters
                        </div>
                        <p className="feature-col-desc">{feature.whyItMatters}</p>
                        <ul className="feature-bullet-list">
                            {feature.matterBullets.map((b) => (
                                <li key={b} className="feature-bullet feature-bullet--matters">
                                    <span className="feature-bullet-check">✓</span>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FeaturesSection() {
    return (
        <div className="features-container">
            {features.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
        </div>
    );
}
