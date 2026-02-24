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
    BarChart3
} from 'lucide-react';

interface SeoDashboardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results: any;
    website: string;
}

export default function SeoDashboard({ results, website }: SeoDashboardProps) {
    const { seoAnalysis, aiVisibility, loadingSpeed } = results;

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
    const seoImages = seoAnalysis?.images || {};
    const imagesTotal = seoImages.total || 0;
    const imagesMissingAlt = seoImages.without_alt ?? seoImages.missing_alt ?? 0;

    // Links
    const seoLinks = seoAnalysis?.links || {};

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
    const StatCard = ({ icon: Icon, label, score, suffix = '', subtext, colorClass }: any) => (
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
                            score={seoScores?.buckets?.on_page || 0}
                            subtext={seoScores?.buckets?.on_page >= 80 ? 'Good' : 'Critical'}
                            colorClass={{ bg: 'bg-red-100', text: 'text-red-600' }}
                        />
                        <StatCard
                            icon={Globe}
                            label="AI Readiness"
                            score={aiScore}
                            subtext={aiScore >= 80 ? 'Perfect' : 'Low'}
                            colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
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
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">SSL Certificate</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${seoSecurity.ssl_valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {seoSecurity.ssl_valid ? 'Valid' : 'Invalid'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-600 font-medium">HSTS</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${seoSecurity.hsts ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                {seoSecurity.hsts ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
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
                            <p className="text-lg font-bold text-gray-800 mt-1">{seoLinks.internal || 0}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-semibold">External</span>
                            <p className="text-lg font-bold text-gray-800 mt-1">{seoLinks.external || 0}</p>
                        </div>
                    </div>
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

                {/* Speed Data - NEW BOX */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-800">Speed Results</h4>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-xl mb-4">
                        <span className={`text-3xl font-bold ${speedScore >= 80 ? 'text-green-600' : speedScore >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                            {speedScore}
                        </span>
                        <span className="text-sm text-gray-500 block">Performance Grade: {speedGrade}</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">Load Time</span>
                            <span className="font-bold text-gray-800">{speedLoadTime ? `${(speedLoadTime / 1000).toFixed(2)}s` : 'N/A'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min((speedScore), 100)}%` }}></div>
                        </div>
                        {loadingSpeed?.summary && (
                            <div className="flex justify-between items-center text-sm pt-2">
                                <span className="text-gray-600 font-medium">Page Size</span>
                                <span className="font-bold text-gray-800">{loadingSpeed.summary.page_size_kb ? `${Math.round(loadingSpeed.summary.page_size_kb)} KB` : 'N/A'}</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Issues & Recommendations */}
            {findings && findings.length > 0 ? (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-50 rounded-xl text-red-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Issues & Recommendations ({findings.length})</h3>
                    </div>

                    <div className="space-y-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {findings.map((f: any, idx: number) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
                                <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full 
                                    ${f.severity === 'critical' || f.severity === 'error' ? 'bg-red-500' :
                                        f.severity === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                <div className='flex-1'>
                                    <div className="flex items-start justify-between">
                                        <h5 className="font-semibold text-gray-800">{f.issue}</h5>
                                        <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider 
                                            ${f.severity === 'critical' || f.severity === 'error' ? 'bg-red-100 text-red-700' :
                                                f.severity === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {f.severity}
                                        </span>
                                    </div>
                                    {f.fix && (
                                        <p className="text-sm text-gray-600 mt-2 bg-white/50 p-3 rounded-lg border border-gray-100">
                                            <span className="font-semibold text-gray-900 mr-2">How to fix:</span>
                                            {f.fix}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
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
