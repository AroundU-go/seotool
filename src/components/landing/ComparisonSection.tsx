import { Check, X, Info } from 'lucide-react';

export function ComparisonSection() {
    return (
        <section className="py-20 px-6 bg-background">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Why SEOzapp?
                    </h2>
                    <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                        10-50x cheaper than enterprise AI SEO tools
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-stretch">
                    {/* Card 1: SEOzapp */}
                    <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-2xl p-10 text-center flex flex-col justify-center items-center hover:scale-105 transition-transform duration-300 shadow-sm">
                        <div className="mb-3">
                            <span className="text-4xl md:text-5xl font-black text-orange-500">$49/mo</span>
                        </div>
                        <p className="text-base font-medium text-foreground/70 mb-2">AI Suite Monthly</p>
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">SEOzapp</p>
                    </div>

                    {/* Card 2: Competitors */}
                    <div className="bg-card border border-border/60 rounded-2xl p-10 text-center flex flex-col justify-center items-center opacity-60 hover:opacity-100 transition-opacity duration-300">
                        <div className="mb-3">
                            <span className="text-4xl md:text-5xl font-black text-foreground/40">$2,500/mo</span>
                        </div>
                        <p className="text-base font-medium text-foreground/60 mb-2">Enterprise AI SEO</p>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Competitors</p>
                    </div>

                    {/* Card 3: Savings */}
                    <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-2xl p-10 text-center flex flex-col justify-center items-center relative overflow-hidden shadow-sm">
                        <div className="relative z-10">
                            <div className="mb-3">
                                <span className="text-4xl md:text-5xl font-black text-green-600">Save 98%</span>
                            </div>
                            <p className="text-base font-medium text-foreground/70 mb-2">Compared to competitors</p>
                            <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Same AI features</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
