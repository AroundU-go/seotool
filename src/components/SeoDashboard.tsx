import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import SpeedAuditDashboard from './SpeedAuditDashboard';

interface SeoDashboardProps {
    results: any;
    website: string;
    hasProAccess?: boolean;
    onUpgradeClick?: () => void;
}

export default function SeoDashboard({ results, website, hasProAccess = false, onUpgradeClick }: SeoDashboardProps) {
    const { seoAnalysis, aiVisibility, loadingSpeed, rapidApiData } = results;

    const seoSummary = seoAnalysis?.summary || {};
    const seoBasic = seoAnalysis?.basic || {};
    const seoScores = seoAnalysis?.scores || {};
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
    const securitySuggestions = seoSecurity.suggestions || [];
    const seoStructured = seoAnalysis?.structured_data || {};
    
    const seoImages = seoBasic?.images || seoAnalysis?.seo_results?.images || seoAnalysis?.images || {};
    const imagesTotal = seoImages.total || 0;
    const imagesMissingAlt = seoImages.without_alt ?? seoImages.missing_alt ?? seoImages.images_without_alt ?? 0;

    const seoLinks = seoAnalysis?.links || seoAnalysis?.seo_results?.links || {};
    const seoLinkCounts = seoLinks.counts || seoLinks || {};
    const crawlSignals = seoAnalysis?.crawl_signals || {};
    const contentStats = seoAnalysis?.content || {};
    const techDetected = seoAnalysis?.technology?.detected || {};
    const legalPages = seoAnalysis?.legal_pages || {};
    const accessibility = seoAnalysis?.accessibility || {};
    const seoPerformance = seoAnalysis?.performance || {};

    const findings = (seoAnalysis?.findings || []).sort((a: any, b: any) => {
        const severityWeight: Record<string, number> = { critical: 3, error: 3, high: 2, medium: 1, warning: 1, low: 0, info: 0 };
        return (severityWeight[b.severity?.toLowerCase()] || 0) - (severityWeight[a.severity?.toLowerCase()] || 0);
    });



    const overallScore = seoSummary.overall_score || 0;
    const aiScore = aiVisibility?.score || 0;
    const speedScore = loadingSpeed?.summary?.performance_grade?.score || seoScores?.buckets?.performance || 0;

    const getScoreHex = (sc: number) => sc >= 80 ? '#639922' : sc >= 50 ? '#BA7517' : '#D33C3C';

    const renderKvRow = (label: string, value: string | React.ReactNode, isGood?: boolean, isWarn?: boolean) => (
        <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB] last:border-none">
            <span className="text-[12px] text-gray-500">{label}</span>
            <span className={`text-[12px] font-medium ${isGood ? 'text-[#3B6D11]' : isWarn ? 'text-[#854F0B]' : 'text-gray-800'}`}>
                {value}
            </span>
        </div>
    );

    const handleUpgrade = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        onUpgradeClick?.();
    };

    return (
        <div className="py-6 font-sans antialiased text-gray-900 max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">On-Page and Technical SEO analysis</h1>
            <style jsx>{`
                .score-ring-wrap circle { transition: stroke-dashoffset 1s ease-out; }
                .pro-blur-inner { filter: blur(4px); pointer-events: none; user-select: none; }
                .section-header { font-size: 11px; font-weight: 500; color: #6B7280; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
                .panel { background: #F9FAFB; border-radius: 12px; padding: 16px; border: 1px solid #F3F4F6; }
                .free-badge { font-size: 10px; font-weight: 500; padding: 2px 7px; border-radius: 10px; background: #EAF3DE; color: #3B6D11; border: 0.5px solid #C0DD97; }
                .pro-badge { font-size: 10px; font-weight: 500; padding: 2px 7px; border-radius: 10px; background: #EEEDFE; color: #3C3489; border: 0.5px solid #CECBF6; }
            `}</style>

            {/* Topbar */}
            <div className="flex items-center justify-between flex-wrap gap-3 w-full bg-white px-2 rounded-xl mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-full px-3.5 py-1.5 text-[13px] text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3a9e6e]"></div>
                        {website}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#C0DD97] text-[#27500A]">Grade {seoSummary.grade || '-'}</div>
                    {!hasProAccess && (
                        <button onClick={handleUpgrade} className="text-[12px] font-medium px-4 py-1.5 rounded-md border-none cursor-pointer bg-[#3C3489] text-[#EEEDFE] hover:bg-[#2d266d] transition-colors">
                            Upgrade to Pro
                        </button>
                    )}
                </div>
            </div>

            {/* Score Breakdown Row */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 mb-6">
                <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-5 flex flex-col items-center justify-center gap-1 relative">
                    <div className="relative w-24 h-24 mb-2 score-ring-wrap">
                        <svg viewBox="0 0 96 96" className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                            <circle cx="48" cy="48" r="40" fill="none" stroke={getScoreHex(overallScore)} strokeWidth="8" strokeDasharray="251.3" strokeDashoffset={251.3 - (251.3 * overallScore / 100)} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-[28px] font-medium leading-none text-gray-900">{overallScore}</div>
                            <div className="text-[11px] text-gray-500">/100</div>
                        </div>
                    </div>
                    <div className="text-[13px] text-gray-600 font-medium">Overall score</div>
                    <span className="free-badge absolute top-3 right-3">free</span>
                </div>

                <div>
                    <div className="section-header">
                        Score breakdown
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {[
                            { name: 'Performance', val: speedScore },
                            { name: 'Technical', val: seoScores?.buckets?.technical || 0 },
                            { name: 'On-page', val: seoScores?.buckets?.onpage || 0 },
                            { name: 'Security', val: seoScores?.buckets?.security || 0 },
                            { name: 'AI Ready', val: seoScores?.buckets?.ai_readiness || aiScore || 0 },
                            { name: 'Accessibility', val: seoScores?.buckets?.accessibility || 0 },
                        ].map((bucket, i) => {
                            const showLock = !hasProAccess && bucket.name === 'AI Ready';
                            return (
                            <div key={i} className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-3.5 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[12px] text-gray-600">{bucket.name}</span>
                                    <span className="text-[14px] font-medium text-gray-900">
                                        {showLock ? <Lock className="w-3.5 h-3.5 text-gray-400 inline" /> : bucket.val}
                                    </span>
                                </div>
                                {!showLock && (
                                    <div className="h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${bucket.val}%`, backgroundColor: getScoreHex(bucket.val) }}></div>
                                    </div>
                                )}
                            </div>
                        )})}
                    </div>
                </div>
            </div>

            {/* Issues & Recommendations matched to template styling */}
            <div className="mb-6">
                <div className="section-header">
                    <span>Priority issues</span>
                    {hasProAccess ? (
                        <span className="pro-badge">pro — {findings.length} issues</span>
                    ) : (
                        <span className="free-badge">free — {findings.length} issues</span>
                    )}
                </div>
                
                {findings.length > 0 ? (
                    <div className="panel bg-[#F9FAFB]">
                        <div className="flex flex-col gap-0">
                            {findings.map((f: any, idx: number) => {
                                const isWarn = f.severity === 'warning' || f.severity === 'high' || f.severity === 'medium';
                                const isCrit = f.severity === 'critical' || f.severity === 'error';
                                const iconClass = isWarn ? 'bg-[#FAEEDA] text-[#854F0B]' : isCrit ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#EAF3DE] text-[#3B6D11]';
                                const iconChar = (isWarn || isCrit) ? '!' : '✓';
                                
                                return (
                                    <div key={`iss-${idx}`} className="flex items-start gap-3 py-3 border-b border-[#E5E7EB] last:border-none last:pb-0">
                                        <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold ${iconClass}`}>
                                            {iconChar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[13px] text-gray-900">{f.issue}</div>
                                            <div className="text-[11px] text-gray-500 mt-1 capitalize">{f.category?.replace('_', ' ')} · {f.severity}</div>
                                            {hasProAccess && f.fix && (
                                                <div className="mt-2 text-[12px] text-gray-600 bg-white p-2 rounded border border-[#E5E7EB]">
                                                    <span className="font-semibold mr-1">Fix:</span>{f.fix}
                                                </div>
                                            )}
                                        </div>
                                        {!hasProAccess && f.fix ? (
                                            <button onClick={handleUpgrade} className="text-[11px] px-2.5 py-1.5 rounded-md border border-[#E5E7EB] bg-transparent text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                How to fix &rarr;
                                            </button>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="panel bg-[#F9FAFB] flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircle className="w-5 h-5" /> No issues detected!
                    </div>
                )}
            </div>

            {/* Grid for Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                
                {/* Page basics */}
                <div>
                    <div className="section-header">
                        <span>Page basics</span>
                        <span className="free-badge">free</span>
                    </div>
                    <div className="panel">
                        {renderKvRow('HTTP status', `${seoBasic.http_code || 200} OK`, seoBasic.http_code === 200, seoBasic.http_code !== 200)}
                        {renderKvRow('Title', seoBasic.title ? '✓ Present' : '✗ Missing', !!seoBasic.title, !seoBasic.title)}
                        {renderKvRow('Meta description', 'Check meta info', true)}
                        {renderKvRow('Canonical tag', seoBasic.canonical ? '✓ Found' : '✗ Missing', !!seoBasic.canonical, !seoBasic.canonical)}
                        {renderKvRow('HTTPS', seoSecurity.https ? '✓ Yes' : '✗ No', seoSecurity.https, !seoSecurity.https)}
                        {renderKvRow('H1 count', headingCounts.h1, headingCounts.h1 === 1, headingCounts.h1 === 0 || headingCounts.h1 > 1)}
                        {renderKvRow('Word count', `~${rapidApiData?.wordCount || contentStats?.word_count_estimate || 0}`)}
                        {renderKvRow('TTFB', seoPerformance.ttfb_seconds ? `${(seoPerformance.ttfb_seconds * 1000).toFixed(0)}ms` : 'N/A', !!seoPerformance.ttfb_seconds)}
                    </div>
                </div>

                {/* Crawl signals */}
                <div>
                    <div className="section-header">
                        <span>Crawl signals</span>
                        <span className="free-badge">free</span>
                    </div>
                    <div className="panel">
                        {renderKvRow('robots.txt', hasProAccess ? (crawlSignals?.robots?.found ? '✓ Found' : '✗ Missing') : <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-gray-400" /></span>, hasProAccess && crawlSignals?.robots?.found, hasProAccess && !crawlSignals?.robots?.found)}
                        {renderKvRow('sitemap.xml', hasProAccess ? (crawlSignals?.sitemap?.found ? '✓ Found' : '✗ Missing') : <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-gray-400" /></span>, hasProAccess && crawlSignals?.sitemap?.found, hasProAccess && !crawlSignals?.sitemap?.found)}
                        {renderKvRow('llms.txt', hasProAccess ? (crawlSignals?.llms_txt?.found ? '✓ Present' : '✗ Missing') : <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-gray-400" /></span>, hasProAccess && crawlSignals?.llms_txt?.found, hasProAccess && !crawlSignals?.llms_txt?.found)}
                        {renderKvRow('ai.txt', hasProAccess ? (crawlSignals?.ai_txt?.found ? '✓ Present' : '✗ Missing') : <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-gray-400" /></span>, hasProAccess && crawlSignals?.ai_txt?.found, hasProAccess && !crawlSignals?.ai_txt?.found)}
                        {renderKvRow('Privacy policy', legalPages.privacy_policy?.found ? '✓ Found' : '✗ Missing', legalPages.privacy_policy?.found, !legalPages.privacy_policy?.found)}
                        {renderKvRow('Terms of service', legalPages.terms?.found ? '✓ Found' : '✗ Missing', legalPages.terms?.found, !legalPages.terms?.found)}
                        {renderKvRow('Cookie policy', legalPages.cookie_policy?.found ? '✓ Found' : '✗ Missing', legalPages.cookie_policy?.found, !legalPages.cookie_policy?.found)}
                        {renderKvRow('CDN / WAF', techDetected.cdn_waf?.[0] || 'Unknown')}
                        {renderKvRow('Server', techDetected.server || 'Unknown')}
                    </div>
                </div>
            </div>

            {/* Custom component replacement for remaining features */}
            
            {loadingSpeed && (
                <div className="mb-6">
                    <SpeedAuditDashboard data={loadingSpeed} hasProAccess={hasProAccess} website={website} onUpgradeClick={onUpgradeClick} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Security headers & Suggestions */}
                <div>
                    <div className="section-header">
                        <span>Security headers & Actions</span>
                        <span className="pro-badge">pro</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden">
                        <div className="panel h-full">
                            {renderKvRow('X-Frame-Options', hasProAccess ? (seoSecurity.x_frame_options ? '✓ Set' : '✗ Missing') : <Lock className="w-3 h-3 text-gray-400 inline" />, hasProAccess && seoSecurity.x_frame_options, hasProAccess && !seoSecurity.x_frame_options)}
                            {renderKvRow('Content-Type-Options', hasProAccess ? (seoSecurity.x_content_type_options ? '✓ Set' : '✗ Missing') : <Lock className="w-3 h-3 text-gray-400 inline" />, hasProAccess && seoSecurity.x_content_type_options, hasProAccess && !seoSecurity.x_content_type_options)}
                            {renderKvRow('Content-Security-Policy', hasProAccess ? (seoSecurity.content_security_policy ? '✓ Set' : '✗ Missing') : <Lock className="w-3 h-3 text-gray-400 inline" />, hasProAccess && seoSecurity.content_security_policy, hasProAccess && !seoSecurity.content_security_policy)}
                            {renderKvRow('Referrer-Policy', hasProAccess ? (seoSecurity.referrer_policy ? '✓ Set' : '✗ Missing') : <Lock className="w-3 h-3 text-gray-400 inline" />, hasProAccess && seoSecurity.referrer_policy, hasProAccess && !seoSecurity.referrer_policy)}
                            {renderKvRow('Mixed content', hasProAccess ? (seoSecurity.mixed_content_found ? '⚠ Detected' : '✓ Clean') : <Lock className="w-3 h-3 text-gray-400 inline" />, hasProAccess && !seoSecurity.mixed_content_found, hasProAccess && seoSecurity.mixed_content_found)}
                            {renderKvRow('HSTS', hasProAccess ? (seoSecurity.hsts ? '✓ Enabled' : '✗ Disabled') : <Lock className="w-3 h-3 text-gray-400 inline" />, hasProAccess && seoSecurity.hsts, hasProAccess && !seoSecurity.hsts)}
                            
                            {/* Suggestions block mapped from on-page-response.txt */}
                            {securitySuggestions.length > 0 && (
                                <div className="relative mt-4 pt-4 border-t border-[#E5E7EB]">
                                    <div className={!hasProAccess ? 'pro-blur-inner' : ''}>
                                        <div className="text-[11px] font-semibold text-gray-500 uppercase mb-2">Suggestions</div>
                                        <ul className="text-[12px] text-gray-700 space-y-1.5 list-disc pl-4 marker:text-gray-400">
                                            {securitySuggestions.map((sug: string, i: number) => (
                                                <li key={i}>{sug}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    {!hasProAccess && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                            <button onClick={handleUpgrade} className="bg-white/90 backdrop-blur-sm border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm text-[11px] font-medium text-gray-700 flex items-center gap-1 hover:bg-gray-50">
                                                <Lock className="w-3 h-3" /> Unlock Pro to view analysis
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Link health */}
                <div>
                    <div className="section-header">
                        <span>Link health</span>
                        <span className="free-badge">free</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden">
                        <div className="panel h-full">
                            {renderKvRow('Total links', seoLinkCounts.total || seoLinks.total || 0)}
                            {renderKvRow('Internal', seoLinkCounts.internal || seoLinks.internal || 0)}
                            {renderKvRow('External', seoLinkCounts.external || seoLinks.external || 0)}
                            {renderKvRow('Broken (est.)', seoLinks.health_sample?.broken_estimate || '0', true)}
                            {renderKvRow('Empty anchors', seoLinkCounts.empty_text || 0, (seoLinkCounts.empty_text || 0) === 0, (seoLinkCounts.empty_text || 0) > 0)}
                            {renderKvRow('Nofollow', seoLinkCounts.nofollow || 0)}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Heading Structure */}
                <div>
                    <div className="section-header">
                        <span>Heading Hierarchy</span>
                        <span className="free-badge">free</span>
                    </div>
                    <div className="panel flex flex-col gap-2">
                         <div className="grid grid-cols-3 gap-2">
                             {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((tag) => (
                                 <div key={tag} className="flex flex-col items-center justify-center p-2 bg-white rounded border border-[#E5E7EB]">
                                     <span className="text-[10px] text-gray-400 uppercase font-medium">{tag}</span>
                                     <span className="text-[16px] font-semibold text-gray-800">
                                         {/* @ts-ignore */}
                                         {headingCounts[tag] || 0}
                                     </span>
                                 </div>
                             ))}
                         </div>
                         <div className="mt-2 pt-2 border-t border-[#E5E7EB]">
                             {renderKvRow('Hierarchy Status', accessibility.heading_hierarchy_ok ? '✓ OK' : '✗ Issues', accessibility.heading_hierarchy_ok, !accessibility.heading_hierarchy_ok)}
                         </div>
                    </div>
                </div>
                
                {/* Assets / Images */}
                <div>
                     <div className="section-header">
                        <span>Images & Assets</span>
                        <span className="free-badge">free</span>
                    </div>
                    <div className="panel h-full">
                        {renderKvRow('Total Images', imagesTotal)}
                        {renderKvRow('Missing Alt Text', imagesMissingAlt, imagesMissingAlt === 0, imagesMissingAlt > 0)}
                        {renderKvRow('JSON-LD Count', seoStructured.jsonld_count || seoStructured.json_ld_count || 0)}
                        {renderKvRow('Structured Data Types', (seoStructured.types || []).join(', ') || 'None')}
                    </div>
                </div>
            </div>

            {/* Note: omitted score history and competitor comparison as requested */}
        </div>
    );
}
