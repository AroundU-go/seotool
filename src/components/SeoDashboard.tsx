import {
    Globe,
    Cpu,
    Zap,
    Search,
    Shield,
    FileCode,
    Layout,
    AlertCircle,
    CheckCircle,
    ChevronDown,
    RefreshCw,
    Link2,
    Clock,
    Lock,
    ArrowRight,
    Share2,
    Bot,
    FileText,
    Scale,
    Eye,
    Monitor,
} from 'lucide-react';

import SpeedAuditDashboard from './SpeedAuditDashboard';

interface SeoDashboardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results: any;
    website: string;
    hasProAccess?: boolean;
}

export default function SeoDashboard({ results, website, hasProAccess = false }: SeoDashboardProps) {
    const { seoAnalysis, aiVisibility, loadingSpeed, rapidApiData } = results;

    // Safe access helpers
    const seoSummary = seoAnalysis?.summary || {};
    const seoBasic = seoAnalysis?.basic || {};
    const seoScores = seoAnalysis?.scores || {};
    // Headings: Calculate from arrays if counts not available
    const seoHeadings = seoAnalysis?.headings || {};
    const headingCounts = {
        h1: seoHeadings.h1?.length || seoHeadings.counts?.h1 || 0,
        h2: seoHeadings.h2?.length || seoHeadings.counts?.h2 || 0,
        h3: seoHeadings.h3?.length || seoHeadings.counts?.h3 || 0,
        h4: seoHeadings.h4?.length || seoHeadings.counts?.h4 || 0,
        h5: seoHeadings.h5?.length || seoHeadings.counts?.h5 || 0,
        h6: seoHeadings.h6?.length || seoHeadings.counts?.h6 || 0,
    };

    const seoSecurity = seoAnalysis?.security || {};
    const seoStructured = seoAnalysis?.structured_data || {};

    // Images: Handle both naming conventions
    const seoImages = seoBasic?.images || seoAnalysis?.seo_results?.images || seoAnalysis?.images || {};
    const imagesTotal = seoImages.total || 0;
    const imagesMissingAlt = seoImages.without_alt ?? seoImages.missing_alt ?? seoImages.images_without_alt ?? 0;

    // Links
    const seoLinks = seoAnalysis?.links || seoAnalysis?.seo_results?.links || {};
    const seoLinkCounts = seoLinks.counts || seoLinks || {};

    // Crawl signals
    const crawlSignals = seoAnalysis?.crawl_signals || {};
    const robotsInfo = crawlSignals.robots || {};
    const sitemapInfo = crawlSignals.sitemap || {};
    const llmsTxtInfo = crawlSignals.llms_txt || {};
    const aiTxtInfo = crawlSignals.ai_txt || {};

    // Content stats
    const contentStats = seoAnalysis?.content || {};

    // Technology
    const techDetected = seoAnalysis?.technology?.detected || {};

    // Legal pages
    const legalPages = seoAnalysis?.legal_pages || {};

    // Accessibility
    const accessibility = seoAnalysis?.accessibility || {};

    // Performance (from seoAnalysis, not loadingSpeed)
    const seoPerformance = seoAnalysis?.performance || {};

    // Findings Sort: Critical -> Warning -> Good/Info
    const findings = (seoAnalysis?.findings || []).sort((a: any, b: any) => {
        const severityWeight: Record<string, number> = {
            critical: 3,
            error: 3,
            high: 2,
            medium: 1,
            warning: 1,
            low: 0,
            info: 0
        };
        const weightA = severityWeight[a.severity?.toLowerCase()] || 0;
        const weightB = severityWeight[b.severity?.toLowerCase()] || 0;
        return weightB - weightA;
    });

    const isPremiumIssue = (severity: string) => {
        const s = severity?.toLowerCase();
        return s === 'critical' || s === 'error' || s === 'high';
    };

    const isWarningIssue = (severity: string) => {
        const s = severity?.toLowerCase();
        return s === 'warning' || s === 'medium';
    };

    // For free users: show all good/info + first 2 warnings, blur the rest
    const goodFindings = findings.filter((f: any) => !isPremiumIssue(f.severity) && !isWarningIssue(f.severity));
    const warningFindings = findings.filter((f: any) => isWarningIssue(f.severity));
    const criticalFindings = findings.filter((f: any) => isPremiumIssue(f.severity));

    // Free users get good issues + first 2 warnings shown
    const freeVisibleWarnings = warningFindings.slice(0, 1);
    const visibleFindingsForFree = [...goodFindings, ...freeVisibleWarnings];
    const hiddenFindings = [...warningFindings.slice(1), ...criticalFindings];

    // For pro users everything is visible exactly as is
    const visibleFindings = hasProAccess
        ? findings
        : visibleFindingsForFree;
    const blurredFindings = hasProAccess ? [] : hiddenFindings;

    const speedScore = loadingSpeed?.summary?.performance_grade?.score || 0;
    const speedGrade = loadingSpeed?.summary?.performance_grade?.grade || '-';
    // Use TTFB or Load Time if available
    const speedLoadTime = loadingSpeed?.summary?.load_time_ms || 0;

    // Debug log to check incoming speed data
    // console.log('Speed Data in Dashboard:', loadingSpeed);

    const aiScore = aiVisibility?.score || 0;

    const overallScore = seoSummary.overall_score || 0;

    // Helper for circular progress
    const CircleProgress = ({ score, label, color }: { score: number, label: string, color: string }) => {
        const radius = 35;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;

        return (
            <div className="relative flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-100"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className={color}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-gray-800">{score}</span>
                        <span className="text-xs text-gray-400">/100</span>
                    </div>
                </div>
                <p className="mt-2 font-bold text-gray-700">{label}</p>
                <span className={`mt-1 font-medium px-3 py-1 rounded-full text-sm ${score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {score >= 80 ? 'Good' : score >= 50 ? 'Fair' : 'Poor'}
                </span>
            </div>
        );
    };

    // Helper for small stat card
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StatCard = ({ icon: Icon, label, score, suffix = '', subtext, colorClass, isLocked }: any) => {
        if (isLocked) {
            return (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${colorClass.bg}`}>
                        <Icon className={`w-5 h-5 ${colorClass.text}`} />
                    </div>
                    <span className="text-sm text-gray-500 font-medium mb-1">{label}</span>
                    <div className="relative mt-1 w-full flex flex-col items-center group overflow-hidden">
                        <a href={typeof window !== 'undefined' ? `https://checkout.dodopayments.com/buy/pdt_0NaHBvNNtTNxDUEQ1BblK?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}` : '#'} className="absolute inset-[-8px] bg-white/40 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center transition-all group-hover:backdrop-blur-[4px] cursor-pointer rounded-xl">
                            <Lock className="w-5 h-5 text-gray-600 mb-0.5 drop-shadow-sm" />
                            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest bg-white/90 px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">Pro Only</span>
                        </a>
                        <span className="text-3xl font-bold text-gray-800/40 mb-1 select-none">{score}{suffix}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500/40 select-none">
                            Locked
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${colorClass.bg}`}>
                    <Icon className={`w-5 h-5 ${colorClass.text}`} />
                </div>
                <span className="text-sm text-gray-500 font-medium mb-1">{label}</span>
                <span className="text-3xl font-bold text-gray-800 mb-1">{score}{suffix}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subtext.includes('Good') || subtext.includes('Excellent') || subtext.includes('Perfect') ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                    {subtext}
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        On-Page SEO Analysis
                    </h2>
                    <a href={`https://${website}`} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-primary flex items-center gap-1 mt-1 transition-colors">
                        {website} <ChevronDown className="w-3 h-3" />
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-600 border border-gray-100 shadow-sm flex items-center gap-2">
                        <RefreshCw className="w-3 h-3" /> Last updated: Just now
                    </span>
                </div>
            </div>

            {/* Health at a Glance */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white/50">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-gray-800">SEO Health at a Glance</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Overall Score Circle */}
                    <div className="lg:col-span-4 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-inner p-6">
                        <CircleProgress
                            score={overallScore}
                            label="Overall Score"
                            color={overallScore >= 80 ? 'text-green-500' : overallScore >= 50 ? 'text-yellow-500' : 'text-red-500'}
                        />
                    </div>

                    {/* Metrics Grid */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={Zap}
                            label="Performance"
                            score={speedScore}
                            subtext={speedGrade === 'A' ? 'Excellent' : 'Needs Work'}
                            colorClass={{ bg: 'bg-green-100', text: 'text-green-600' }}
                        />
                        <StatCard
                            icon={Cpu}
                            label="Technical"
                            score={seoScores?.buckets?.technical || 0}
                            subtext={seoScores?.buckets?.technical >= 80 ? 'Good' : 'Avg'}
                            colorClass={{ bg: 'bg-orange-100', text: 'text-orange-600' }}
                        />
                        <StatCard
                            icon={Search}
                            label="On-Page"
                            score={seoScores?.buckets?.onpage || 0}
                            subtext={seoScores?.buckets?.onpage >= 80 ? 'Good' : 'Critical'}
                            colorClass={{ bg: 'bg-red-100', text: 'text-red-600' }}
                        />
                        <StatCard
                            icon={Globe}
                            label="AI Readiness"
                            score={seoScores?.buckets?.ai_readiness || aiScore || 0}
                            subtext={(seoScores?.buckets?.ai_readiness || aiScore) >= 80 ? 'Perfect' : 'Low'}
                            colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                            isLocked={!hasProAccess}
                        />
                    </div>
                </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Page Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Layout className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Page Info</h4>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">Title</span>
                            <p className="text-sm font-medium text-gray-700 line-clamp-2 mt-1">{seoBasic.title || 'No title found'}</p>
                        </div>
                        <div className="flex justify-between">
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-semibold">HTTP Status</span>
                                <p className="text-sm font-medium text-gray-700 mt-1 flex items-center gap-1">
                                    {seoBasic.http_code}
                                    <span className={`w-2 h-2 rounded-full ${seoBasic.http_code === 200 ? 'bg-green-500' : 'bg-red-500'}`} />
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-400 uppercase font-semibold">Canonical</span>
                                <p className="text-sm font-medium text-gray-700 mt-1 max-w-[150px] truncate">{seoBasic.canonical ? 'Set' : 'Not Set'}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">Favicon</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${seoBasic.favicon ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {seoBasic.favicon ? 'Found' : 'Missing'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Heading Structure */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <FileCode className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Heading Structure</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((tag) => (
                            <div key={tag} className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs text-gray-400 uppercase block mb-1">{tag}</span>
                                {/* @ts-ignore */}
                                <span className="text-lg font-bold text-gray-800">{headingCounts[tag] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Security</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">HTTPS</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${seoSecurity.https || seoSecurity.ssl_valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {seoSecurity.https || seoSecurity.ssl_valid ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">HSTS</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${seoSecurity.hsts ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                {seoSecurity.hsts ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        {hasProAccess ? (
                            <>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">X-Frame-Options</span>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${seoSecurity.x_frame_options ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {seoSecurity.x_frame_options ? 'Set' : 'Missing'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Content-Type-Options</span>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${seoSecurity.x_content_type_options ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {seoSecurity.x_content_type_options ? 'Set' : 'Missing'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Referrer Policy</span>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${seoSecurity.referrer_policy ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {seoSecurity.referrer_policy ? 'Set' : 'Missing'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">CSP</span>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${seoSecurity.content_security_policy ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {seoSecurity.content_security_policy ? 'Set' : 'Missing'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
                                    <span className="text-sm text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Mixed Content</span>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${seoSecurity.mixed_content_found ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {seoSecurity.mixed_content_found ? 'Found' : 'Clean'}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                {['X-Frame-Options', 'Content-Type-Options', 'Referrer Policy', 'CSP', 'Mixed Content'].map((item) => (
                                    <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <span className="text-sm text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item}</span>
                                        <span className="px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap bg-gray-100 text-gray-400 flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                        </span>
                                    </div>
                                ))}
                            </>
                        )}
                        {!hasProAccess && (
                            <a href={typeof window !== 'undefined' ? `https://checkout.dodopayments.com/buy/pdt_0NaHBvNNtTNxDUEQ1BblK?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}` : '#'} className="text-sm border-t border-gray-100 pt-3 mt-1 text-accent font-semibold flex items-center justify-center gap-1 hover:underline group">
                                <Lock className="w-3.5 h-3.5" />
                                Upgrade for full security report
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Images & Links */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <Link2 className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Assets & Links</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">Images</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-lg font-bold text-gray-800">{imagesTotal}</span>
                                <span className="text-xs text-gray-400">total</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">Missing Alt</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className={`text-lg font-bold ${imagesMissingAlt > 0 ? 'text-red-500' : 'text-green-500'}`}>{imagesMissingAlt}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">Internal Links</span>
                            <p className="text-lg font-bold text-gray-800 mt-1">{seoLinkCounts.internal || seoLinks.internal || 0}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">External</span>
                            <p className="text-lg font-bold text-gray-800 mt-1">{seoLinkCounts.external || seoLinks.external || 0}</p>
                        </div>
                    </div>
                    {(seoLinkCounts.total || seoLinkCounts.nofollow !== undefined) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-semibold">Total</span>
                                <p className="text-lg font-bold text-gray-800 mt-1">{seoLinkCounts.total || 0}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-semibold">Nofollow</span>
                                <p className="text-lg font-bold text-gray-800 mt-1">{seoLinkCounts.nofollow || 0}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-semibold">Empty Anchor</span>
                                <p className="text-lg font-bold text-gray-800 mt-1">{seoLinkCounts.empty_text || 0}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Structured Data */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <FileCode className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Structured Data</h4>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <span className="text-3xl font-bold text-gray-800 block">{seoStructured.json_ld_count || 0}</span>
                        <span className="text-sm text-gray-500">JSON-LD Blocks Detected</span>
                    </div>
                    {seoStructured.types && seoStructured.types.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {seoStructured.types.map((type: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium border border-blue-100">
                                    {type}
                                </span>
                            ))}
                        </div>
                    )}
                </div>


                {/* Social & Meta Data from RapidAPI */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                            <Share2 className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Social & Content</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">Word Count</span>
                            <p className="text-lg font-bold text-gray-800 mt-1">{rapidApiData?.wordCount || contentStats?.word_count_estimate || 0}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">Language</span>
                            <p className="text-lg font-bold text-gray-800 mt-1 uppercase">{rapidApiData?.language || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Open Graph tags</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${rapidApiData && rapidApiData.openGraph !== undefined ? (rapidApiData.openGraph ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-gray-100 text-gray-400 blur-[2px] cursor-not-allowed flex items-center gap-1'}`}>
                                {(!rapidApiData || rapidApiData.openGraph === undefined) && <Lock className="w-3 h-3 text-gray-500 inline mr-1" />}
                                {rapidApiData && rapidApiData.openGraph !== undefined ? (rapidApiData.openGraph ? 'Present' : 'Missing') : 'Locked'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Twitter Card tags</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${rapidApiData && rapidApiData.twitterCard !== undefined ? (rapidApiData.twitterCard ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600') : 'bg-gray-100 text-gray-400 blur-[2px] cursor-not-allowed flex items-center gap-1'}`}>
                                {(!rapidApiData || rapidApiData.twitterCard === undefined) && <Lock className="w-3 h-3 text-gray-500 inline mr-1" />}
                                {rapidApiData && rapidApiData.twitterCard !== undefined ? (rapidApiData.twitterCard ? 'Present' : 'Missing') : 'Locked'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Crawl Signals */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                            <Bot className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Crawl Signals</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className={`text-sm font-medium ${hasProAccess ? 'text-gray-600' : 'text-gray-400'}`}>Robots.txt</span>
                            {hasProAccess ? (
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${robotsInfo.found ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {robotsInfo.found ? 'Found' : 'Missing'}
                                </span>
                            ) : (
                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className={`text-sm font-medium ${hasProAccess ? 'text-gray-600' : 'text-gray-400'}`}>Sitemap.xml</span>
                            {hasProAccess ? (
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${sitemapInfo.found ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {sitemapInfo.found ? 'Found' : 'Missing'}
                                </span>
                            ) : (
                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className={`text-sm font-medium ${hasProAccess ? 'text-gray-600' : 'text-gray-400'}`}>llms.txt</span>
                            {hasProAccess ? (
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${llmsTxtInfo.found ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {llmsTxtInfo.found ? 'Found' : 'Not Found'}
                                </span>
                            ) : (
                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className={`text-sm font-medium ${hasProAccess ? 'text-gray-600' : 'text-gray-400'}`}>ai.txt</span>
                            {hasProAccess ? (
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${aiTxtInfo.found ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {aiTxtInfo.found ? 'Found' : 'Not Found'}
                                </span>
                            ) : (
                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                </span>
                            )}
                        </div>
                        {!hasProAccess && (
                            <a href={typeof window !== 'undefined' ? `https://checkout.dodopayments.com/buy/pdt_0NaHBvNNtTNxDUEQ1BblK?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}` : '#'} className="text-sm border-t border-gray-100 pt-3 mt-1 text-accent font-semibold flex items-center justify-center gap-1 hover:underline group">
                                <Lock className="w-3.5 h-3.5" />
                                Upgrade to view crawl data
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Content Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Content Stats</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl text-center">
                            <span className="text-2xl font-bold text-gray-800 block">{contentStats.word_count_estimate || rapidApiData?.wordCount || 0}</span>
                            <span className="text-xs text-gray-500">Words</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl text-center">
                            <span className="text-2xl font-bold text-gray-800 block">{contentStats.paragraph_count || 0}</span>
                            <span className="text-xs text-gray-500">Paragraphs</span>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl text-center">
                            <span className="text-2xl font-bold text-gray-800 block">{contentStats.content_to_html_ratio_pct || 0}%</span>
                            <span className="text-xs text-gray-500">Content / HTML</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl text-center">
                            <span className="text-2xl font-bold text-gray-800 block">{contentStats.avg_sentence_words || 0}</span>
                            <span className="text-xs text-gray-500">Avg Sentence Words</span>
                        </div>
                    </div>
                    {seoPerformance.ttfb_seconds !== undefined && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">TTFB</span>
                                <span className="font-bold text-gray-800">{(seoPerformance.ttfb_seconds * 1000).toFixed(0)}ms</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Technology Stack */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                            <Monitor className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Technology Stack</h4>
                    </div>
                    <div className="space-y-4">
                        {techDetected.cdn_waf && techDetected.cdn_waf.length > 0 && (
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-semibold">CDN / WAF</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {techDetected.cdn_waf.map((item: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-violet-50 text-violet-600 rounded-md text-xs font-medium border border-violet-100">{item}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {techDetected.analytics && techDetected.analytics.length > 0 && (
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-semibold">Analytics</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {techDetected.analytics.map((item: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium border border-blue-100">{item}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {techDetected.css && techDetected.css.length > 0 && (
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-semibold">CSS Framework</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {techDetected.css.map((item: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-teal-50 text-teal-600 rounded-md text-xs font-medium border border-teal-100">{item}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {techDetected.server && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm text-gray-600 font-medium">Server</span>
                                <span className="text-sm font-bold text-gray-800">{techDetected.server}</span>
                            </div>
                        )}
                        {!techDetected.cdn_waf?.length && !techDetected.analytics?.length && !techDetected.css?.length && !techDetected.server && (
                            <p className="text-sm text-gray-400 text-center py-4">No technology data detected</p>
                        )}
                    </div>
                </div>

                {/* Legal Pages */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                            <Scale className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Legal Pages</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">Privacy Policy</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${legalPages.privacy_policy?.found ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {legalPages.privacy_policy?.found ? 'Found' : 'Missing'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">Terms of Service</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${legalPages.terms?.found ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {legalPages.terms?.found ? 'Found' : 'Missing'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">Cookie Policy</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${legalPages.cookie_policy?.found ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                {legalPages.cookie_policy?.found ? 'Found' : 'Missing'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">GDPR</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${legalPages.gdpr?.found ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                {legalPages.gdpr?.found ? 'Found' : 'Missing'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Accessibility */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-sky-50 rounded-lg text-sky-600">
                            <Eye className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Accessibility</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">Heading Hierarchy</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${accessibility.heading_hierarchy_ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {accessibility.heading_hierarchy_ok ? 'OK' : 'Issues'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">Images Missing Alt</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${(accessibility.images_missing_alt || 0) === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {accessibility.images_missing_alt || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">Form Labels Missing</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${(accessibility.form_controls_missing_label || 0) === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {accessibility.form_controls_missing_label || 0}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {loadingSpeed && (
                <SpeedAuditDashboard data={loadingSpeed} hasProAccess={hasProAccess} website={website} />
            )}

            {/* Issues & Recommendations */}
            {findings && findings.length > 0 ? (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-50 rounded-xl text-red-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Issues & Recommendations ({findings.length})</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Visible Findings (good + limited warnings for free, all for pro) */}
                        {visibleFindings.map((f: any, idx: number) => (
                            <div key={`visible-${idx}`} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
                                <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full 
                                    ${f.severity === 'critical' || f.severity === 'error' ? 'bg-red-500' :
                                        f.severity === 'warning' || f.severity === 'high' || f.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                <div className='flex-1'>
                                    <div className="flex items-start justify-between">
                                        <h5 className="font-semibold text-gray-800">{f.issue}</h5>
                                        <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider 
                                            ${f.severity === 'critical' || f.severity === 'error' ? 'bg-red-100 text-red-700' :
                                                f.severity === 'warning' || f.severity === 'high' || f.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {f.severity}
                                        </span>
                                    </div>
                                    {f.fix && (
                                        <div className="mt-2 bg-white/50 p-3 rounded-lg border border-gray-100">
                                            {(!hasProAccess && (f.severity === 'warning' || f.severity === 'critical' || f.severity === 'error' || f.severity === 'high' || f.severity === 'medium')) ? (
                                                <div className="flex items-center">
                                                    <a href="/#pricing" className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-100">
                                                        <Lock className="w-4 h-4" />
                                                        How to fix
                                                    </a>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold text-gray-900 mr-2">How to fix:</span>
                                                    {f.fix}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Blurred/Hidden Findings for free users */}
                        {blurredFindings.length > 0 && (
                            <div className="relative mt-8">
                                <div className={!hasProAccess ? 'space-y-4 filter blur-md select-none pointer-events-none opacity-60' : 'space-y-4'}>
                                    {blurredFindings.map((f: any, idx: number) => (
                                        <div key={`blurred-${idx}`} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
                                            <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full 
                                                ${f.severity === 'critical' || f.severity === 'error' ? 'bg-red-500' :
                                                    f.severity === 'warning' || f.severity === 'high' || f.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                            <div className='flex-1'>
                                                <div className="flex items-start justify-between">
                                                    <h5 className="font-semibold text-gray-800">{!hasProAccess ? 'Hidden Critical/Warning Issue' : f.issue}</h5>
                                                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider 
                                                        ${f.severity === 'critical' || f.severity === 'error' ? 'bg-red-100 text-red-700' :
                                                            f.severity === 'warning' || f.severity === 'high' || f.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {f.severity}
                                                    </span>
                                                </div>
                                                {f.fix && (
                                                    <div className="mt-2 bg-white/50 p-3 rounded-lg border border-gray-100 relative overflow-hidden">
                                                        <p className="text-sm text-gray-600 blur-[4px] select-none">
                                                            <span className="font-semibold text-gray-900 mr-2">How to fix:</span>
                                                            {f.fix}
                                                        </p>
                                                        <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
                                                            <span className="text-xs font-bold text-gray-700 bg-white/90 px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-gray-200">
                                                                <Lock className="w-3 h-3 text-red-500" /> {!hasProAccess ? 'Upgrade to Pro plan to view the detailed fix for this issue.' : 'Hidden'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {!hasProAccess && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
                                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 md:p-8 max-w-xs sm:max-w-sm md:max-w-md w-full text-center shadow-2xl shadow-red-900/10 backdrop-blur-sm bg-white/60">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                                <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-600" />
                                            </div>
                                            <h4 className="text-base sm:text-lg md:text-xl font-bold text-red-900 mb-1 sm:mb-2">Critical issues found</h4>
                                            
                                            <p className="text-red-700 mb-4 sm:mb-6 text-xs sm:text-sm">
                                                We've detected {blurredFindings.length} critical or warning SEO issues on your website. Upgrade to view them and get detailed fixes.
                                            </p>
                                            <a
                                                href={typeof window !== 'undefined' ? `https://checkout.dodopayments.com/buy/pdt_0NaHBvNNtTNxDUEQ1BblK?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}` : '#'}
                                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 bg-red-600 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-colors"
                                            >
                                                Upgrade to View <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <p className="text-green-800 flex items-center gap-3 text-lg font-medium">
                        <CheckCircle className="w-6 h-6" />
                        No major issues detected! Great job!
                    </p>
                </div>
            )}
        </div>
    );
}
