import Head from 'next/head';
import { useRouter } from 'next/router';
import { Home, Rocket, Search, Zap, DollarSign } from 'lucide-react';

import { NavBar } from '@/components/ui/NavBar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

export default function TermsPage() {
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

    const content = [
        {
          title: "1. Acceptance of Terms",
          text: "By accessing or using SEOzapp (\"the Service\"), you agree to be bound by these Terms of Service (\"Terms\"). Please read these Terms carefully before using the Service. If you do not agree to these Terms, you must not access or use the Service.",
          footer: "These Terms constitute a legally binding agreement between you (or the entity you represent) and SEOzapp (\"we,\" \"us,\" or \"our\"), the operator of seozapp.com."
        },
        {
          title: "2. Description of Service",
          text: "SEOzapp is a search engine optimization (SEO) platform that provides tools and analytics including, but not limited to, keyword research, site audits, backlink analysis, rank tracking, and SEO reporting. The specific features available to you depend on your subscription plan.",
          footer: "We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice where feasible."
        },
        {
          title: "3. Eligibility",
          text: "You must be at least 18 years of age (or the age of majority in your jurisdiction) to use the Service. By using SEOzapp, you represent and warrant that:",
          list: [
            "You are of legal age and have the legal capacity to enter into these Terms.",
            "You are not located in a country subject to applicable trade sanctions.",
            "You are not on any government-prohibited party list.",
            "If using on behalf of an organization, you have authority to bind that organization to these Terms."
          ]
        },
        {
          title: "4. Account Registration",
          text: "To access most features of SEOzapp, you must register an account. You agree to:",
          list: [
            "Provide accurate, complete, and current registration information.",
            "Maintain the security of your password and account credentials.",
            "Notify us immediately of any unauthorized access to your account.",
            "Accept responsibility for all activities occurring under your account.",
            "Not share your account credentials with third parties or allow others to access your account."
          ],
          footer: "We reserve the right to suspend or terminate accounts that contain false information or that violate these Terms."
        },
        {
          title: "5. Subscription & Payments",
          text: "Access to premium features of SEOzapp requires a paid subscription. By subscribing, you agree to the following:",
          list: [
            "Billing: Subscriptions are billed in advance on a monthly or annual basis, depending on your plan selection.",
            "Auto-Renewal: Subscriptions automatically renew at the end of each billing cycle unless you cancel before the renewal date.",
            "Price Changes: We may change subscription prices with at least 30 days' notice. Continued use after the price change takes effect constitutes acceptance.",
            "Refunds: We offer a 24-hour money-back guarantee for first-time subscribers. Refunds beyond this period are rejected.",
            "Taxes: Prices are exclusive of applicable taxes (e.g., GST). You are responsible for paying all applicable taxes.",
            "Failed Payments: If payment fails, we may suspend access to your account until payment is resolved."
          ]
        },
        {
          title: "6. Acceptable Use",
          text: "You agree to use SEOzapp only for lawful purposes and in accordance with these Terms. You must NOT:",
          list: [
            "Use the Service in any way that violates applicable local, national, or international law.",
            "Scrape, crawl, or harvest data from the platform through automated means beyond what is explicitly permitted by our API.",
            "Attempt to gain unauthorized access to any part of the Service or its underlying infrastructure.",
            "Use the Service to transmit spam, malware, or any malicious content.",
            "Reverse engineer, decompile, or disassemble any portion of the Service.",
            "Resell, sublicense, or redistribute access to the Service without written authorization.",
            "Use the Service to build a competing product or benchmark against competitors in ways that violate third-party terms.",
            "Engage in any activity that disrupts or interferes with the integrity or performance of the Service."
          ]
        },
        {
          title: "7. Intellectual Property",
          text: "All content, features, and functionality of SEOzapp — including but not limited to software, text, graphics, logos, icons, and data compilations — are the exclusive property of SEOzapp or its licensors and are protected by applicable intellectual property laws.",
          footer: "We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your own internal business purposes, subject to these Terms.\n\nYou may not use our trademarks, logos, or brand assets without our prior written consent."
        },
        {
          title: "8. User Content",
          text: "You retain ownership of any content (e.g., domains, keywords, reports) you submit to the Service (\"User Content\"). By submitting User Content, you grant SEOzapp a non-exclusive, worldwide, royalty-free license to use, process, and store that content solely to provide the Service to you.",
          footer: "You represent that you have all rights necessary to submit your User Content and that it does not infringe any third-party rights or violate any applicable law.\n\nWe do not claim ownership of your User Content and will not sell or share it beyond what is described in our Privacy Policy."
        },
        {
          title: "9. Third-Party Services",
          text: "SEOzapp may integrate with or link to third-party services (e.g., Google Search Console, Google Analytics). Your use of such integrations is subject to the respective third-party's terms and privacy policies. We are not responsible for the availability, accuracy, or practices of third-party services."
        },
        {
          title: "10. Disclaimers",
          text: "THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.\n\nWe do not warrant that:",
          list: [
            "The Service will be uninterrupted, error-free, or secure at all times.",
            "Any data, rankings, or results obtained through the Service will be accurate, complete, or reliable.",
            "Any errors in the Service will be corrected within a specific timeframe.",
            "SEO results are inherently variable and depend on many factors outside our control. We make no guarantee of specific SEO outcomes or ranking improvements."
          ]
        },
        {
          title: "11. Limitation of Liability",
          text: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SEOZAPP AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES.",
          footer: "Our total cumulative liability to you for any claim arising out of or related to these Terms or the Service shall not exceed the greater of: (a) the amount paid by you to SEOzapp in the 12 months immediately preceding the claim, or (b) INR 1,000."
        },
        {
          title: "12. Indemnification",
          text: "You agree to indemnify, defend, and hold harmless SEOzapp, its officers, directors, employees, partners, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from:",
          list: [
            "Your use of the Service in violation of these Terms.",
            "Your violation of any applicable law or third-party rights.",
            "Any User Content you submit that infringes third-party intellectual property or privacy rights."
          ]
        },
        {
          title: "13. Termination",
          text: "Either party may terminate the agreement at any time:",
          list: [
            "By you: You may cancel your subscription and delete your account at any time through your account settings.",
            "By us: We may suspend or terminate your account immediately if you breach these Terms, engage in fraudulent activity, or for any other reason with or without notice at our discretion."
          ],
          footer: "Upon termination, your right to access the Service ceases immediately. Sections that by their nature should survive termination (including Intellectual Property, Disclaimer, Limitation of Liability, and Indemnification) shall survive."
        },
        {
          title: "14. Governing Law & Dispute Resolution",
          text: "These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.",
          footer: "Any dispute arising out of or in connection with these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be subject to the exclusive jurisdiction of the courts located in India."
        },
        {
          title: "15. Changes to Terms",
          text: "We reserve the right to modify these Terms at any time. We will provide notice of material changes by:",
          list: [
            "Emailing registered users at least 14 days before changes take effect.",
            "Displaying a prominent in-app notification.",
            "Updating the \"Last Updated\" date on this page."
          ],
          footer: "Your continued use of the Service after the effective date of any changes constitutes your acceptance of the new Terms. If you do not agree to the revised Terms, you must stop using the Service."
        },
        {
          title: "16. Contact",
          text: "For any questions about these Terms of Service, please contact:",
          list: [
            "Email: hello@seozapp.com",
            "Website: seozapp.com/contact"
          ],
          footer: "Response time: Within 5 business days"
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head>
                <title>Terms of Service | SEOzapp</title>
                <meta name="description" content="Terms of Service for SEOzapp. Read our terms and conditions for using our services." />
            </Head>

            {/* Logo - Fixed Top Left */}
            <div className="fixed top-6 left-6 z-50">
                <a href="https://seozapp.com" className="text-xl font-black tracking-tight text-foreground">
                    SEO<span className="text-accent">zapp</span>
                </a>
            </div>

            {/* Navbar */}
            <NavBar items={navItems} activeTab="" />

            {/* Theme Toggle - Fixed Top Right */}
            <div className="fixed top-6 right-6 z-50 hidden md:block">
                <ThemeToggle />
            </div>

            <main className="flex-1 max-w-4xl mx-auto px-6 pt-32 pb-20 mt-16 w-full">
                <div className="mb-16">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                        Terms of <span className="text-accent">Service</span>
                    </h1>
                    <p className="text-lg text-foreground/60 font-medium">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric'})}</p>
                </div>
                
                <div className="space-y-12">
                    {content.map((section, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-2xl p-8 hover:border-accent/30 transition-colors">
                            <h2 className="text-2xl font-bold mb-4 text-foreground">{section.title}</h2>
                            {section.text && <p className="text-foreground/80 leading-relaxed mb-4">{section.text}</p>}
                            {section.list && (
                                <ul className="list-disc pl-5 space-y-2 mb-4">
                                    {section.list.map((item, i) => (
                                        <li key={i} className="text-foreground/80 leading-relaxed pl-2">{item}</li>
                                    ))}
                                </ul>
                            )}
                            {section.footer && (
                                <p className="text-foreground/80 leading-relaxed whitespace-pre-line border-t border-border mt-6 pt-4">
                                    {section.footer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-border bg-background mt-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <a href="https://seozapp.com" className="text-xl font-black tracking-tight text-foreground">
                            SEO<span className="text-accent">zapp</span>
                        </a>
                        <div className="flex items-center gap-6 text-center">
                            <a href="/blogs" className="text-sm font-medium text-foreground/60 hover:text-accent transition-colors">Blogs</a>
                            <a href="/privacy" className="text-sm font-medium text-foreground/60 hover:text-accent transition-colors">Privacy</a>
                            <a href="/terms" className="text-sm font-medium text-foreground/60 hover:text-accent transition-colors">Terms</a>
                            <a href="https://x.com/ItsUddipan" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground/60 hover:text-accent transition-colors">Contact</a>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <p className="text-sm text-foreground/50">
                                © {new Date().getFullYear()} SEOzapp. All rights reserved.
                            </p>
                            <a href="https://startupfa.me/s/seozapp?utm_source=www.seozapp.com" target="_blank" rel="noreferrer">
                                <img src="https://startupfa.me/badges/featured-badge-small.webp" alt="SEOzapp - Featured on Startup Fame" width="224" height="36" className="w-[140px] h-auto" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
