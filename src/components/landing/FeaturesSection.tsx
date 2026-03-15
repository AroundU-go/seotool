import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    IconCloud,
    IconEaseInOut,
    IconHeart,
    IconTerminal2,
    IconFlame,
    IconSearch,
} from "@tabler/icons-react";

export function FeaturesSection() {
    const slides = [
        "/features/media__1773560310384.jpg",
        "/features/media__1773560310427.jpg",
        "/features/media__1773560310440.jpg",
        "/features/media__1773560834379.jpg",
        "/features/media__1773561046838.jpg",
    ];
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        {
            title: "Deep SEO Analysis",
            description:
                "Comprehensive on-page analysis covering meta tags, headings, links, images, content structure and many more.",
            icon: <IconTerminal2 />,
        },
        {
            title: "AI Engine Optimization",
            description:
                "See how AI search engines perceive your content. Optimize for ChatGPT, Perplexity, and more.",
            icon: <IconEaseInOut />,
        },
        {
            title: "Blazing Fast Results",
            description: "Get detailed analysis and action plan in seconds. All checks run in parallel for speed.",
            icon: <IconCloud />,
        },
        {
            title: "Top Search Keywords",
            description: "Get top search keywords for your site, including ranking and volume.",
            icon: <IconSearch />,
        },
        {
            title: "Speed Optimization",
            description:
                "Detailed loading speed metrics — TTFB, page size, request breakdown — with actionable fixes.",
            icon: <IconFlame />,
        },
        {
            title: "Downloadable Reports",
            description:
                "Export a comprehensive fix guide with prioritized issues and step-by-step recommendations.",
            icon: <IconHeart />,
        },
    ];

    return (
        <div className="flex flex-col gap-12 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 py-10 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                    <Feature key={feature.title} {...feature} index={index} />
                ))}
            </div>

            {/* Slideshow */}
            <div className="max-w-4xl w-full mx-auto pb-10 px-4">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-slate-800 bg-slate-950">
                    {slides.map((slide, idx) => (
                        <img
                            key={slide}
                            src={slide}
                            alt={`Slide ${idx + 1}`}
                            className={cn(
                                "absolute inset-0 w-full h-full object-contain transition-opacity duration-1000",
                                currentSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0"
                            )}
                        />
                    ))}
                </div>
                {/* Dots indicator */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                currentSlide === idx ? "bg-accent w-6" : "bg-foreground/20 hover:bg-foreground/40 w-2"
                            )}
                        />
                    ))}
                </div>
            </div>
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
                <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />
            )}
            {index >= 3 && (
                <div className="absolute inset-0 h-full w-full bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
            )}
            <div className="mb-4 relative z-10 px-10 text-foreground/60">
                {icon}
            </div>
            <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 w-1 rounded-tr-full rounded-br-full bg-accent" />
                <span className="inline-block text-foreground">
                    {title}
                </span>
            </div>
            <p className="text-sm text-foreground/60 max-w-xs relative z-10 px-10">
                {description}
            </p>
        </div>
    );
};
