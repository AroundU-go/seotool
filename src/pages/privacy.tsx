import Head from 'next/head';
import { useRouter } from 'next/router';
import { Home, Rocket, Search, Zap, DollarSign } from 'lucide-react';

import { NavBar } from '@/components/ui/NavBar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

export default function PrivacyPage() {
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
          title: "1. Information We Collect",
          text: "We collect information to provide, maintain, and improve our SEO tools and services. The data we collect falls into three categories:",
          list: [
            "Account Data — name, email address, and password when you register an account.",
            "Usage Data — pages visited, features used, search queries entered into our tools, and session duration, collected automatically via our servers and analytics systems.",
            "Payment Data — billing details processed securely through our third-party payment providers (e.g., Stripe or Razorpay). We do not store full card numbers.",
            "Website/URL Data — domains and URLs you submit for analysis through our SEO tools.",
            "Communications — emails, chat messages, and support tickets you send us.",
            "Device & Technical Data — IP address, browser type, operating system, and referral URLs."
          ]
        },
        {
          title: "2. How We Use Your Information",
          text: "We use the information we collect for the following purposes:",
          list: [
            "To create and manage your account and provide access to our platform.",
            "To deliver, operate, and improve our SEO analysis and reporting tools.",
            "To process payments and send billing receipts and invoices.",
            "To send product updates, feature announcements, and service notifications (you may opt out at any time).",
            "To provide customer support and respond to inquiries.",
            "To detect, investigate, and prevent fraudulent transactions and abuse.",
            "To comply with applicable laws and legal obligations.",
            "To conduct aggregate, anonymized analytics to understand usage patterns."
          ],
          footer: "We will never use your data to make automated decisions that significantly affect you without your explicit consent."
        },
        {
          title: "3. Sharing Your Information",
          text: "We do not sell, rent, or trade your personal information. We share data only in the following limited circumstances:",
          list: [
            "Service Providers — trusted third-party vendors who assist us in operating the platform (e.g., cloud hosting, payment processing, email delivery, analytics). These vendors are contractually bound to protect your data.",
            "Legal Requirements — when required by law, court order, or governmental authority, or to protect the rights, property, or safety of SEOzapp, our users, or the public.",
            "Business Transfers — in the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity. We will notify you before this occurs.",
            "With Your Consent — in any other case, only with your explicit, informed consent."
          ]
        },
        {
          title: "4. Cookies & Tracking Technologies",
          text: "SEOzapp uses cookies and similar tracking technologies to enhance your experience. We use:",
          list: [
            "Essential Cookies — required for the platform to function (e.g., authentication tokens, session state). These cannot be disabled.",
            "Analytics Cookies — help us understand how users interact with our platform (e.g., Google Analytics). These are optional.",
            "Preference Cookies — remember your settings and customizations across visits.",
            "Marketing Cookies — used for retargeting and advertising, only with your consent where required by law."
          ],
          footer: "You can manage your cookie preferences through your browser settings or our cookie consent banner. Note that disabling certain cookies may affect platform functionality."
        },
        {
          title: "5. Data Retention",
          text: "We retain your personal data only as long as necessary to fulfil the purposes described in this policy or as required by law. Specifically:",
          list: [
            "Account data is retained for the duration of your active account plus 90 days after deletion.",
            "Payment records are retained for 7 years to comply with financial regulations.",
            "Usage and analytics data may be retained in anonymized form indefinitely.",
            "Support communications are retained for up to 3 years."
          ],
          footer: "Upon account deletion, we will delete or anonymize your personal data within 30 days, except where retention is legally required."
        },
        {
          title: "6. Your Rights",
          text: "Depending on your location, you may have the following rights regarding your personal data:",
          list: [
            "Access — request a copy of the personal data we hold about you.",
            "Correction — request correction of inaccurate or incomplete data.",
            "Deletion — request deletion of your personal data (\"right to be forgotten\").",
            "Portability — request your data in a machine-readable format.",
            "Objection — object to processing based on legitimate interests or for direct marketing.",
            "Restriction — request restriction of processing in certain circumstances.",
            "Withdraw Consent — withdraw any previously given consent at any time without affecting lawfulness of prior processing."
          ],
          footer: "To exercise any of these rights, contact us at privacy@seozapp.com. We will respond within 30 days."
        },
        {
          title: "7. Data Security",
          text: "We implement industry-standard technical and organizational measures to protect your personal data, including:",
          list: [
            "TLS/HTTPS encryption for all data in transit.",
            "AES-256 encryption for sensitive data at rest.",
            "Role-based access controls limiting who can access personal data internally.",
            "Regular security audits and vulnerability assessments.",
            "Secure, reputable cloud infrastructure providers."
          ],
          footer: "No method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. In the event of a data breach affecting your rights, we will notify you as required by applicable law."
        },
        {
          title: "8. Children's Privacy",
          text: "SEOzapp is not directed at children under the age of 13 (or 16 in certain jurisdictions). We do not knowingly collect personal data from children. If you believe we have inadvertently collected information from a child, please contact us immediately at privacy@seozapp.com and we will delete it promptly."
        },
        {
          title: "9. Third-Party Links",
          text: "Our platform may contain links to third-party websites, tools, or services. This Privacy Policy applies only to SEOzapp. We are not responsible for the privacy practices of third-party sites and encourage you to review their policies before sharing any personal information."
        },
        {
          title: "10. Changes to This Policy",
          text: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by:",
          list: [
            "Sending an email to the address associated with your account.",
            "Displaying a prominent notice on our platform.",
            "Updating the \"Last Updated\" date at the top of this page."
          ],
          footer: "Your continued use of SEOzapp after any changes take effect constitutes your acceptance of the revised policy."
        },
        {
          title: "11. Contact Us",
          text: "For any questions, concerns, or requests related to this Privacy Policy or your personal data, please reach out to us:",
          list: [
            "Email: hello@seozapp.com",
            "Website: seozapp.com/contact"
          ],
          footer: "Response time: Within 30 business days"
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head>
                <title>Privacy Policy | SEOzapp</title>
                <meta name="description" content="Privacy Policy for SEOzapp. Discover how we protect your personal information and handle your data." />
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
                        Privacy <span className="text-accent">Policy</span>
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
