import { Link2, ExternalLink, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

interface BacklinksCardProps {
    backlinkData: unknown;
    newBacklinks: unknown;
    poorBacklinks: unknown;
}

export default function BacklinksCard({ backlinkData, newBacklinks, poorBacklinks }: BacklinksCardProps) {
    const bd = backlinkData as Record<string, unknown> | null;
    const nb = newBacklinks as Record<string, unknown> | null;
    const pb = poorBacklinks as Record<string, unknown> | null;

    if (!bd && !nb && !pb) return null;

    const backlinks = (bd?.backlinks || bd?.data || []) as Array<Record<string, unknown>>;
    const totalBacklinks = (bd?.total_backlinks ?? bd?.total ?? backlinks.length ?? 0) as number;
    const referringDomains = (bd?.referring_domains ?? bd?.ref_domains ?? 0) as number;

    const newList = (nb?.new_backlinks || nb?.data || []) as Array<Record<string, unknown>>;
    const newTotal = (nb?.total ?? newList.length ?? 0) as number;

    const poorList = (pb?.poor_backlinks || pb?.data || []) as Array<Record<string, unknown>>;
    const poorTotal = (pb?.total ?? poorList.length ?? 0) as number;

    const truncateUrl = (url?: string, max = 45) => {
        if (!url) return '-';
        return url.length > max ? url.slice(0, max) + '…' : url;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Backlink Analysis</h2>
                    <p className="text-gray-600">Backlink profile overview, new & toxic links</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-indigo-50 rounded-xl p-4 text-center">
                    <Link2 className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                    <span className="text-2xl font-bold text-gray-900 block">{totalBacklinks}</span>
                    <span className="text-xs text-gray-500 font-medium">Total Backlinks</span>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <span className="text-2xl font-bold text-gray-900 block">{newTotal}</span>
                    <span className="text-xs text-gray-500 font-medium">New Backlinks</span>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                    <ShieldAlert className="w-5 h-5 text-red-500 mx-auto mb-2" />
                    <span className="text-2xl font-bold text-gray-900 block">{poorTotal}</span>
                    <span className="text-xs text-gray-500 font-medium">Toxic Backlinks</span>
                </div>
            </div>

            {referringDomains > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6 flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Referring Domains</span>
                    <span className="text-lg font-bold text-gray-900">{referringDomains}</span>
                </div>
            )}

            {/* Backlink List */}
            {backlinks.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-indigo-600" />
                        Backlinks ({backlinks.length})
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-3 py-2 font-semibold text-gray-600 rounded-tl-lg">Source</th>
                                    <th className="px-3 py-2 font-semibold text-gray-600">Anchor</th>
                                    <th className="px-3 py-2 font-semibold text-gray-600">DA</th>
                                    <th className="px-3 py-2 font-semibold text-gray-600 rounded-tr-lg">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {backlinks.slice(0, 15).map((bl, i) => (
                                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                        <td className="px-3 py-2 text-indigo-600 max-w-[200px]">
                                            <a href={bl.source_url as string} target="_blank" rel="noreferrer" className="hover:underline" title={bl.source_url as string}>
                                                {truncateUrl(bl.source_url as string)}
                                            </a>
                                        </td>
                                        <td className="px-3 py-2 text-gray-700 max-w-[150px] truncate">{(bl.anchor_text as string) || '-'}</td>
                                        <td className="px-3 py-2">
                                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium text-xs">
                                                {String(bl.domain_authority ?? '-')}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${bl.nofollow ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                                {bl.nofollow ? 'nofollow' : 'dofollow'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {backlinks.length > 15 && (
                        <p className="text-xs text-gray-400 mt-2 text-center">Showing 15 of {backlinks.length} backlinks</p>
                    )}
                </div>
            )}

            {/* New Backlinks */}
            {newList.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        New Backlinks ({newList.length})
                    </h3>
                    <div className="space-y-2">
                        {newList.slice(0, 10).map((nl, i) => (
                            <div key={i} className="bg-green-50/60 rounded-lg p-3 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <a href={nl.source_url as string} target="_blank" rel="noreferrer" className="text-sm text-green-700 hover:underline font-medium truncate block">
                                        {truncateUrl(nl.source_url as string)}
                                    </a>
                                    {nl.anchor_text && (
                                        <span className="text-xs text-gray-500">Anchor: {String(nl.anchor_text)}</span>
                                    )}
                                </div>
                                {nl.first_seen && (
                                    <span className="text-xs text-gray-400 shrink-0">{new Date(String(nl.first_seen)).toLocaleDateString()}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    {newList.length > 10 && (
                        <p className="text-xs text-gray-400 mt-2 text-center">Showing 10 of {newList.length} new backlinks</p>
                    )}
                </div>
            )}

            {/* Poor / Toxic Backlinks */}
            {poorList.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Toxic Backlinks ({poorList.length})
                    </h3>
                    <div className="space-y-2">
                        {poorList.slice(0, 10).map((pl, i) => (
                            <div key={i} className="bg-red-50/60 rounded-lg p-3">
                                <div className="flex items-center justify-between gap-4">
                                    <a href={pl.source_url as string} target="_blank" rel="noreferrer" className="text-sm text-red-700 hover:underline font-medium truncate flex-1">
                                        {truncateUrl(pl.source_url as string)}
                                    </a>
                                    {pl.spam_score !== undefined && (
                                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold shrink-0">
                                            Spam: {pl.spam_score as number}
                                        </span>
                                    )}
                                </div>
                                {pl.reason && (
                                    <p className="text-xs text-red-600 mt-1">{String(pl.reason)}</p>
                                )}
                                {pl.anchor_text && (
                                    <p className="text-xs text-gray-500 mt-0.5">Anchor: {String(pl.anchor_text)}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    {poorList.length > 10 && (
                        <p className="text-xs text-gray-400 mt-2 text-center">Showing 10 of {poorList.length} toxic backlinks</p>
                    )}
                </div>
            )}
        </div>
    );
}
