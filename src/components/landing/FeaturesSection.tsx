import { cn } from "@/lib/utils";
import {
    IconCloud,
    IconEaseInOut,
    IconHeart,
    IconHelp,
    IconRouteAltLeft,
    IconTerminal2,
} from "@tabler/icons-react";

export function FeaturesSection() {
    const features = [
        {
            title: "Deep SEO Analysis",
            description:
                "Comprehensive on-page analysis covering meta tags, headings, links, images, and content structure.",
            icon: <IconTerminal2 />,
        },
        {
            title: "AI-Powered Insights",
            description:
                "See how AI search engines perceive your content. Optimize for ChatGPT, Perplexity, and more.",
            icon: <IconEaseInOut />,
        },
        {
            title: "Blazing Fast Results",
            description: "Get detailed analysis in seconds. All four checks run in parallel for speed.",
            icon: <IconCloud />,
        },
        {
            title: "AI Bot Detection",
            description: "Know exactly which AI crawlers can access your site through robots.txt analysis.",
            icon: <IconRouteAltLeft />,
        },
        {
            title: "Speed Optimization",
            description:
                "Detailed loading speed metrics — TTFB, page size, request breakdown — with actionable fixes.",
            icon: <IconHelp />,
        },
        {
            title: "Downloadable Reports",
            description:
                "Export a comprehensive fix guide with prioritized issues and step-by-step recommendations.",
            icon: <IconHeart />,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 py-10 max-w-7xl mx-auto">
            {features.map((feature, index) => (
                <Feature key={feature.title} {...feature} index={index} />
            ))}
        </div>
    );
}

const Feature = ({
    title,
    description,
    icon,
    index,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
}) => {
    return (
        <div
            className={cn(
                "flex flex-col lg:border-r py-10 relative group/feature border-border",
                (index === 0 || index === 3) && "lg:border-l",
                index < 3 && "lg:border-b"
            )}
        >
            {index < 3 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />
            )}
            {index >= 3 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
            )}
            <div className="mb-4 relative z-10 px-10 text-foreground/60">
                {icon}
            </div>
            <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-border group-hover/feature:bg-accent transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
                    {title}
                </span>
            </div>
            <p className="text-sm text-foreground/60 max-w-xs relative z-10 px-10">
                {description}
            </p>
        </div>
    );
};
