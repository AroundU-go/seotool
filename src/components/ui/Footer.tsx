import { useEffect, useState } from 'react';
import { getPublishedBlogsByCategory, BlogRecord } from '@/services/supabaseClient';

export function Footer() {
    const [alternatives, setAlternatives] = useState<BlogRecord[]>([]);

    useEffect(() => {
        getPublishedBlogsByCategory('alternative').then(data => {
            setAlternatives(data);
        });
    }, []);

    return (
        <footer className="pt-16 pb-8 px-6 border-t border-border bg-card">
            <div className="max-w-7xl mx-auto">
                {/* Top Section — Brand + Link Columns */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-12 mb-14">
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
                                <a href="/blog" className="text-sm text-foreground/60 hover:text-accent transition-colors">Blog</a>
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

                    {/* Compare — Auto-populated from alternatives */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/80 mb-5">Compare</h4>
                        <ul className="space-y-3">
                            {alternatives.length > 0 ? (
                                alternatives.map((alt) => (
                                    <li key={alt.id}>
                                        <a
                                            href={`/alternatives/${alt.slug}`}
                                            className="text-sm text-foreground/60 hover:text-accent transition-colors"
                                        >
                                            {(() => {
                                                const match = alt.title.match(/best\s+(\S+)/i);
                                                return match ? `vs ${match[1]}` : alt.title;
                                            })()}
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <span className="text-sm text-foreground/30 italic">Coming soon</span>
                                </li>
                            )}
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
    );
}
