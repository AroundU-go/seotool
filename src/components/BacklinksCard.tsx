import { Link2, ExternalLink, AlertTriangle, TrendingUp, ShieldAlert, Globe } from 'lucide-react';

interface BacklinksCardProps {
    backlinkData: unknown;
    newBacklinks: unknown;
    poorBacklinks: unknown;
    referringDomains: unknown;
}

export default function BacklinksCard({ backlinkData, newBacklinks, poorBacklinks, referringDomains }: BacklinksCardProps) {
    const bd = backlinkData as Record<string, unknown> | null;
    const nb = newBacklinks as Record<string, unknown> | null;
    const pb = poorBacklinks as Record<string, unknown> | null;
    const rd = referringDomains as Record<string, unknown> | null;

    if (!bd && !nb && !pb && !rd) return null;

    const backlinks = (bd?.backlinks || bd?.data || []) as Array<Record<string, unknown>>;
    const counts = bd?.counts as any;
    const totalBacklinks = (counts?.backlinks?.total ?? bd?.total_backlinks ?? bd?.total ?? backlinks.length ?? 0) as number;
    const referringDomainsCount = (counts?.domains?.total ?? bd?.referring_domains ?? bd?.ref_domains ?? 0) as number;

    const newList = (nb?.new_backlinks || nb?.data || []) as Array<Record<string, unknown>>;
    const newTotal = (nb?.total ?? newList.length ?? 0) as number;

    const poorList = (pb?.poor_backlinks || pb?.data || []) as Array<Record<string, unknown>>;
    const poorTotal = (pb?.total ?? poorList.length ?? 0) as number;

    const referrerList = (rd?.referrers || []) as Array<Record<string, unknown>>;

    const truncateUrl = (url?: string, max = 45) => {
        if (!url) return '-';
        return url.length > max ? url.slice(0, max) + '…' : url;
    };

    return (
        <div className="py-6 font-sans antialiased text-gray-900 max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Backlink Analysis</h1>
            <style jsx>{`
                .section-header { font-size: 11px; font-weight: 500; color: #6B7280; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
                .panel { background: #F9FAFB; border-radius: 12px; padding: 16px; border: 1px solid #F3F4F6; }
            `}</style>


            {/* Overview Stats */}
            <div className="mb-6">
                <div className="section-header">
                    <span>Overview Stats</span>
                </div>
                <div className="panel grid grid-cols-3 gap-4">
                    <div className="text-center border-r border-[#E5E7EB]">
                        <Link2 className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                        <span className="text-2xl font-bold text-gray-900 block">{totalBacklinks}</span>
                        <span className="text-xs text-gray-500 font-medium">Total Backlinks</span>
                    </div>
                    <div className="text-center border-r border-[#E5E7EB]">
                        <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
                        <span className="text-2xl font-bold text-gray-900 block">{newTotal}</span>
                        <span className="text-xs text-gray-500 font-medium">New Backlinks</span>
                    </div>
                    <div className="text-center">
                        <ShieldAlert className="w-5 h-5 text-red-500 mx-auto mb-2" />
                        <span className="text-2xl font-bold text-gray-900 block">{poorTotal}</span>
                        <span className="text-xs text-gray-500 font-medium">Toxic Backlinks</span>
                    </div>
                </div>
            </div>

            {referringDomainsCount > 0 && (
                <div className="mb-6">
                    <div className="panel flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">Referring Domains</span>
                        <span className="text-lg font-bold text-gray-900">{referringDomainsCount}</span>
                    </div>
                </div>
            )}

            {/* Backlink List */}
            {backlinks.length > 0 && (
                <div className="mb-6">
                    <div className="section-header">
                        <span>All Backlinks ({backlinks.length})</span>
                    </div>
                    <div className="panel p-0 overflow-hidden pt-4 pb-2">
                        <div className="overflow-auto px-2 max-h-[600px]">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-[#F9FAFB] shadow-sm">
                                        <th className="px-4 py-2">Source</th>
                                        <th className="px-4 py-2">Anchor</th>
                                        <th className="px-4 py-2">DA</th>
                                        <th className="px-4 py-2">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {backlinks.map((bl, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-indigo-600 max-w-[200px]">
                                                <a href={(bl.url_from || bl.source_url) as string} target="_blank" rel="noreferrer" className="hover:underline" title={(bl.url_from || bl.source_url) as string}>
                                                    {truncateUrl((bl.url_from || bl.source_url) as string)}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 max-w-[150px] truncate">{((bl.anchor || bl.anchor_text) as string) || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium text-xs">
                                                    {String(bl.domain_inlink_rank ?? bl.domain_authority ?? '-')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${bl.nofollow ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                                    {bl.nofollow ? 'nofollow' : 'dofollow'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* New Backlinks */}
            {newList.length > 0 && (
                <div className="mb-6">
                    <div className="section-header">
                        <span>New Backlinks ({newList.length})</span>
                    </div>
                    <div className="panel bg-[#F0FDF4] border-[#BBF7D0]">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {newList.map((nl, i) => (
                                <div key={i} className="bg-white/60 p-3 rounded-lg border border-green-100 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <a href={(nl.url_from || nl.source_url) as string} target="_blank" rel="noreferrer" className="text-sm text-green-700 hover:underline font-medium truncate block">
                                            {truncateUrl((nl.url_from || nl.source_url) as string)}
                                        </a>
                                        {Boolean(nl.anchor || nl.anchor_text) && (
                                            <span className="text-xs text-gray-500">Anchor: {String(nl.anchor || nl.anchor_text)}</span>
                                        )}
                                    </div>
                                    {Boolean(nl.first_seen) && (
                                        <span className="text-xs text-gray-400 shrink-0">{new Date(String(nl.first_seen)).toLocaleDateString()}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Poor / Toxic Backlinks */}
            {poorList.length > 0 && (
                <div>
                    <div className="section-header">
                        <span>Toxic Backlinks ({poorList.length})</span>
                    </div>
                    <div className="panel bg-[#FFF8F1] border-[#FFEDD5]">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {poorList.map((pl, i) => (
                                <div key={i} className="bg-white/60 p-3 rounded-lg border border-orange-100">
                                    <div className="flex items-center justify-between gap-4">
                                        <a href={(pl.url_from || pl.source_url) as string} target="_blank" rel="noreferrer" className="text-sm text-red-700 hover:underline font-medium truncate flex-1">
                                            {truncateUrl((pl.url_from || pl.source_url) as string)}
                                        </a>
                                        {pl.spam_score !== undefined && (
                                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold shrink-0">
                                                Spam: {pl.spam_score as number}
                                            </span>
                                        )}
                                    </div>
                                    {Boolean(pl.reason) && (
                                        <p className="text-xs text-red-600 mt-1">{String(pl.reason)}</p>
                                    )}
                                    {Boolean(pl.anchor || pl.anchor_text) && (
                                        <p className="text-xs text-gray-500 mt-0.5">Anchor: {String(pl.anchor || pl.anchor_text)}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Referring Domains */}
            {referrerList.length > 0 && (
                <div className="mb-6">
                    <div className="section-header">
                        <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Referring Domains ({referrerList.length})</span>
                    </div>
                    <div className="panel p-0 overflow-hidden pt-4 pb-2">
                        <div className="overflow-auto px-2 max-h-[600px]">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-[#F9FAFB] shadow-sm">
                                        <th className="px-4 py-2">Domain</th>
                                        <th className="px-4 py-2">Backlinks</th>
                                        <th className="px-4 py-2">Dofollow</th>
                                        <th className="px-4 py-2">Domain Rank</th>
                                        <th className="px-4 py-2">First Seen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {referrerList.map((ref, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-indigo-600 max-w-[200px]">
                                                <a href={`https://${ref.refdomain as string}`} target="_blank" rel="noreferrer" className="hover:underline font-medium" title={ref.refdomain as string}>
                                                    {truncateUrl(ref.refdomain as string, 40)}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 font-medium">{String(ref.backlinks ?? '-')}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                    (ref.dofollow_backlinks as number) > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {String(ref.dofollow_backlinks ?? 0)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium text-xs">
                                                    {String(ref.domain_inlink_rank ?? '-')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {ref.first_seen ? new Date(String(ref.first_seen)).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
