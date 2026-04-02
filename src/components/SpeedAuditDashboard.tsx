import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface SpeedAuditDashboardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    hasProAccess?: boolean;
    website?: string;
}

export default function SpeedAuditDashboard({ data, hasProAccess = false, website }: SpeedAuditDashboardProps) {
    if (!data || !data.summary) return null;

    const summary = data.summary;
    const apiMeta = data.api || {};
    
    // Domain extract
    const cleanDomain = website || summary.url?.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'website';
    
    const score = summary.performance_grade?.score || 0;
    const grade = summary.performance_grade?.grade || '-';
    
    const loadTime = summary.load_time_ms || 0;
    const ttfb = summary.ttfb_ms || 0;
    const pageSizeKb = summary.page_size_kb || 0;
    const requests = summary.requests || 0;
    
    // Arrays
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentByType = (data.content_size_by_content_type || []).sort((a: any, b: any) => b.percent - a.percent);
    const domainWeights = data.content_size_by_domain || [];
    const domainRequests = data.requests_by_domain || [];
    const fileRequests = data.file_requests || [];
    const improvements = data.improve_page_performance || [];

    const timings = summary.main?.timings || {};

    // Generate CTA Link
    const ctaLink = typeof window !== 'undefined' 
        ? `https://checkout.dodopayments.com/buy/pdt_0NaHBvNNtTNxDUEQ1BblK?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}` 
        : '#';

    // Helpers for bar colors based on Content Type
    const getBarColor = (type: string) => {
        switch (type) {
            case 'Script': return { bg: 'bg-blue-200', text: 'text-blue-900' };
            case 'Image': return { bg: 'bg-emerald-200', text: 'text-emerald-900' };
            case 'HTML': return { bg: 'bg-indigo-200', text: 'text-indigo-900' };
            case 'CSS': return { bg: 'bg-yellow-200', text: 'text-yellow-900' };
            default: return { bg: 'bg-gray-200', text: 'text-gray-900' };
        }
    };

    // Calculate ring stroke dash offset
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    // Domain charts logic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getDomainColor = (idx: number, isMain: boolean) => {
        if (isMain) return 'bg-indigo-500';
        const colors = ['bg-red-500', 'bg-orange-400', 'bg-emerald-400', 'bg-blue-400', 'bg-purple-400'];
        return colors[idx % colors.length];
    };

    // Third party stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thirdPartyScripts = fileRequests.filter((f: any) => f.type === 'Script' && !f.domain?.includes(cleanDomain));
    const gtmScript = thirdPartyScripts.find((f: any) => f.url?.includes('googletagmanager'));
    const thirdPartyTotalWeightBytes = thirdPartyScripts.reduce((acc: number, f: any) => acc + (f.size_bytes || 0), 0);
    const thirdPartyTotalWeightKb = (thirdPartyTotalWeightBytes / 1024).toFixed(1);
    const thirdPartyPercent = summary.page_size_bytes ? ((thirdPartyTotalWeightBytes / summary.page_size_bytes) * 100).toFixed(0) : '0';

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white/50 mb-8 font-sans">
            {/* TOP BAR */}
            <div className="flex flex-wrap items-center justify-between mb-8 gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full py-1.5 px-3 text-sm text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {cleanDomain}
                    </div>
                    <span className="text-xs text-gray-500">Speed Audit · {apiMeta.server || 'Server'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800">
                        Grade {grade}
                    </div>
                    {!hasProAccess && (
                        <a href={ctaLink} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">
                            Upgrade to Pro
                        </a>
                    )}
                </div>
            </div>

            {/* HERO SCORES */}
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 mb-8">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center">
                    <div className="relative w-28 h-28 mb-1">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            <circle cx="50" cy="50" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
                            <circle 
                                cx="50" cy="50" r={radius} 
                                fill="none" 
                                stroke={score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'} 
                                strokeWidth="8" 
                                strokeDasharray={circumference} 
                                strokeDashoffset={strokeDashoffset} 
                                strokeLinecap="round" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-3xl font-bold text-gray-900 leading-none">{score}</div>
                            <div className="text-xs text-gray-400 mt-1">/100</div>
                        </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">Performance score</div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase mt-1">free</span>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold text-gray-500 tracking-wider uppercase">Key timings</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">free</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-between">
                            <div className="text-xs text-gray-500 mb-1">Load time</div>
                            <div className="mb-2">
                                <span className="text-xl font-bold text-gray-900">{loadTime}</span><span className="text-xs text-gray-500"> ms</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full w-full">
                                <div className={`h-1 rounded-full ${loadTime < 1000 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min((loadTime / 3000) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-between">
                            <div className="text-xs text-gray-500 mb-1">TTFB</div>
                            <div className="mb-2">
                                <span className="text-xl font-bold text-gray-900">{ttfb}</span><span className="text-xs text-gray-500"> ms</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full w-full">
                                <div className={`h-1 rounded-full ${ttfb < 600 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min((ttfb / 1000) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-between">
                            <div className="text-xs text-gray-500 mb-1">Page size</div>
                            <div className="mb-2">
                                <span className="text-xl font-bold text-gray-900">{Math.round(pageSizeKb)}</span><span className="text-xs text-gray-500"> KB</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full w-full">
                                <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${Math.min((pageSizeKb / 2000) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-between">
                            <div className="text-xs text-gray-500 mb-1">Requests</div>
                            <div className="mb-2">
                                <span className="text-xl font-bold text-gray-900">{requests}</span><span className="text-xs text-gray-500"> reqs</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full w-full">
                                <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${Math.min((requests / 80) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* WEIGHT BY CONTENT TYPE */}
            {contentByType.length > 0 && (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold text-gray-500 tracking-wider uppercase">Page weight by content type</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">free</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8 space-y-2.5">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {contentByType.map((item: any, idx: number) => {
                            const colors = getBarColor(item.content_type);
                            return (
                                <div key={idx} className="flex items-center justify-between gap-3">
                                    <div className="text-xs font-medium text-gray-600 w-12 text-right flex-shrink-0">{item.content_type}</div>
                                    <div className="flex-1 h-5 bg-white border border-gray-200 rounded-md overflow-hidden flex items-center relative">
                                        {item.percent > 0 && (
                                            <div className={`h-full ${colors.bg} rounded flex items-center pl-2 px-1`} style={{ width: `${item.percent}%` }}>
                                                {item.percent > 5 && <span className={`text-[10px] font-bold whitespace-nowrap ${colors.text}`}>{item.size_kb} KB</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 w-10 text-right flex-shrink-0">{item.percent}%</div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* PERFORMANCE SUGGESTIONS */}
            {improvements.length > 0 && (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold text-gray-500 tracking-wider uppercase">Performance suggestions</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">free — fix instructions locked</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl mb-8 overflow-hidden">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {improvements.map((impr: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-4 p-5 border-b border-gray-200 last:border-0">
                                <div className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-800 flex-shrink-0 mt-0.5 self-start">
                                    Grade {impr.grade || '-'}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-900">{impr.suggestion}</div>
                                    <div className="text-xs text-gray-500 mt-1">{impr.detail}</div>
                                </div>
                                {hasProAccess ? (
                                    <a href="#how-to-fix" className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 self-start sm:self-center flex-shrink-0">
                                        How to fix →
                                    </a>
                                ) : (
                                    <a href={ctaLink} className="text-xs font-semibold px-3 py-1.5 rounded-md border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 self-start sm:self-center flex-shrink-0 flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> How to fix →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* DOMAINS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold text-gray-500 tracking-wider uppercase">Weight by domain</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">free</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(domainWeights.slice(0, 6)).map((d: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-3 border-b border-gray-200/60 pb-2 last:border-0 last:pb-0">
                                <div className="text-xs font-medium text-gray-800 flex-1 truncate">{d.domain}</div>
                                <div className="flex-1 h-1 bg-gray-200 rounded-full max-w-[80px]">
                                    <div className={`h-1 rounded-full ${getDomainColor(idx, d.domain.includes(cleanDomain))}`} style={{ width: `${d.percent}%` }}></div>
                                </div>
                                <div className="text-xs text-gray-500 w-16 text-right flex-shrink-0">{d.size_kb} KB</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold text-gray-500 tracking-wider uppercase">Requests by domain</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">free</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(domainRequests.slice(0, 6)).map((d: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-3 border-b border-gray-200/60 pb-2 last:border-0 last:pb-0">
                                <div className="text-xs font-medium text-gray-800 flex-1 truncate">{d.domain}</div>
                                <div className="flex-1 h-1 bg-gray-200 rounded-full max-w-[80px]">
                                    <div className={`h-1 rounded-full ${getDomainColor(idx, d.domain.includes(cleanDomain))}`} style={{ width: `${d.percent}%` }}></div>
                                </div>
                                <div className="text-xs font-bold text-gray-900 w-6 text-right flex-shrink-0">{d.requests}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TIMINGS AND IMPACT (PRO) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold text-gray-500 tracking-wider uppercase">Connection timing breakdown</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 uppercase">pro</span>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                        <div className={`bg-gray-50 p-5 space-y-3 ${!hasProAccess ? 'filter blur-[4px] pointer-events-none select-none opacity-60' : ''}`}>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                <span className="text-xs text-gray-500">DNS lookup</span>
                                <span className="text-xs font-bold text-emerald-700">{(timings.namelookup_time * 1000 || 0).toFixed(1)}ms</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                <span className="text-xs text-gray-500">TCP connect</span>
                                <span className="text-xs font-bold text-emerald-700">{((timings.connect_time - timings.namelookup_time) * 1000 || 0).toFixed(1)}ms</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                <span className="text-xs text-gray-500">Request sent</span>
                                <span className="text-xs font-bold text-emerald-700">{((timings.pretransfer_time - (timings.connect_time || 0)) * 1000 || 0).toFixed(1)}ms</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                <span className="text-xs text-gray-500">Waiting (TTFB)</span>
                                <span className="text-xs font-bold text-amber-700">{(ttfb || 0).toFixed(1)}ms</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Content download</span>
                                <span className="text-xs font-bold text-emerald-700">{((timings.total_time - timings.starttransfer_time) * 1000 || 0).toFixed(1)}ms</span>
                            </div>
                        </div>

                        {!hasProAccess && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 z-10 text-center px-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
                                    <Lock className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="text-sm font-bold text-gray-900 mb-1">Full timing waterfall</div>
                                <div className="text-xs text-gray-600 mb-3 max-w-[200px]">Per-request DNS, connect, TLS, TTFB breakdown.</div>
                                <a href={ctaLink} className="text-xs font-semibold px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-1 shadow-md">
                                    Unlock Pro
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold text-gray-500 tracking-wider uppercase">Third-party impact</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 uppercase">pro</span>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                        <div className={`bg-gray-50 p-5 space-y-3 ${!hasProAccess ? 'filter blur-[4px] pointer-events-none select-none opacity-60' : ''}`}>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                <span className="text-xs text-gray-500">Third-party weight</span>
                                <span className="text-xs font-bold text-amber-700">{thirdPartyTotalWeightKb} KB ({thirdPartyPercent}%)</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                <span className="text-xs text-gray-500">GTM script size</span>
                                <span className="text-xs font-bold text-gray-900">{gtmScript ? (gtmScript.size_bytes / 1024).toFixed(1) + ' KB' : 'Not found'}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                <span className="text-xs text-gray-500">Framework CDN</span>
                                <span className="text-xs font-bold text-gray-900">Found or N/A</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                <span className="text-xs text-gray-500">Unique domains</span>
                                <span className="text-xs font-bold text-gray-900">{summary.unique_domains || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">External scripts</span>
                                <span className="text-xs font-bold text-amber-700">{thirdPartyScripts.length} found</span>
                            </div>
                        </div>

                        {!hasProAccess && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 z-10 text-center px-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
                                    <Lock className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="text-sm font-bold text-gray-900 mb-1">Third-party audit</div>
                                <div className="text-xs text-gray-600 mb-3 max-w-[200px]">See exactly which domains are slowing you down.</div>
                                <a href={ctaLink} className="text-xs font-semibold px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-1 shadow-md">
                                    Unlock Pro
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* REQUEST LOG (PRO) */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-gray-500 tracking-wider uppercase">File request log</div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 uppercase">pro</span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                    <div className={`bg-gray-50 p-5 ${!hasProAccess ? 'filter blur-[4px] pointer-events-none select-none opacity-60' : ''}`}>
                        <div className="flex gap-2 pb-2 border-b border-gray-200 mb-2">
                            <span className="text-[10px] text-gray-500 flex-1">URL / DOMAIN</span>
                            <span className="text-[10px] text-gray-500 w-16 text-right">SIZE</span>
                            <span className="text-[10px] text-gray-500 w-16 text-right">TIME</span>
                        </div>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(fileRequests.slice(0, hasProAccess ? 50 : 5)).map((f: any, idx: number) => {
                            const domainStr = f.domain ? `${f.domain}/...` : '...';
                            const truncUrl = f.url?.split('/').pop() || f.url || 'index';
                            return (
                                <div key={idx} className="flex gap-2 py-2.5 border-b border-gray-200/50 last:border-0items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 uppercase">{f.type || 'Other'}</span>
                                            <span className="text-[10px] font-mono text-gray-500 truncate" title={f.url}>{domainStr}</span>
                                        </div>
                                        <div className="text-xs font-medium text-gray-800 truncate" title={f.url}>{truncUrl}</div>
                                    </div>
                                    <div className="text-[11px] text-gray-600 w-16 text-right flex-shrink-0 mt-1">{(f.size_bytes / 1024).toFixed(1)} KB</div>
                                    <div className="text-[11px] text-gray-600 w-16 text-right flex-shrink-0 mt-1">{f.timings?.total_time ? Math.round(f.timings.total_time * 1000) : 0}ms</div>
                                </div>
                            );
                        })}
                    </div>

                    {!hasProAccess && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 z-10 text-center px-4">
                            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                                <Lock className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="text-lg font-bold text-gray-900 mb-2">Full request log</div>
                            <div className="text-sm text-gray-600 mb-4 max-w-sm">All {fileRequests.length || 29} requests with sortable size, timing, status, and type.</div>
                            <a href={ctaLink} className="text-sm font-semibold px-5 py-2.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2 shadow-md">
                                Unlock Pro <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
