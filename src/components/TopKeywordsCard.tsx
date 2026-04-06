import { Component, ReactNode } from 'react';
import { Search, TrendingUp, ExternalLink, ArrowUpRight } from 'lucide-react';

interface KeywordEntry {
    keyword?: string;
    rank?: number;
    searchVolume?: number;
    exactCostPerClick?: number | null;
    broadCostPerClick?: number | null;
    topRankedUrl?: string;
    seoClicks?: number;
    [key: string]: unknown;
}

interface TopKeywordsCardProps {
    data: {
        keywords?: KeywordEntry[];
        total_keywords?: number;
        [key: string]: unknown;
    };
}

class CardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) return <div className="text-red-500 text-sm p-4">Error rendering keywords</div>;
        return this.props.children;
    }
}

function getPositionColor(pos: number): string {
    if (pos <= 3) return 'text-green-600 bg-green-50';
    if (pos <= 10) return 'text-blue-600 bg-blue-50';
    if (pos <= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
}

function formatNumber(num: number | undefined): string {
    if (num === undefined || num === null) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}

export default function TopKeywordsCard({ data }: TopKeywordsCardProps) {
    const keywords = data?.keywords || [];
    const rawData = data as Record<string, unknown>;

    // Handle various API response shapes
    let keywordList: KeywordEntry[] = keywords;
    if (keywordList.length === 0 && Array.isArray(rawData)) {
        keywordList = rawData as KeywordEntry[];
    }
    // Sometimes the data itself is the array
    if (keywordList.length === 0 && typeof rawData === 'object' && !Array.isArray(rawData)) {
        // Check if any key holds an array of keywords
        for (const key of Object.keys(rawData)) {
            const val = rawData[key];
            if (Array.isArray(val) && val.length > 0 && val[0]?.keyword) {
                keywordList = val;
                break;
            }
        }
    }

    const totalKeywords = data?.total_keywords || keywordList.length;

    return (
        <CardErrorBoundary>
            <div className="py-6 font-sans antialiased text-gray-900 max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Top Keywords</h1>
                    {totalKeywords > 0 && (
                        <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                            {totalKeywords} total
                        </span>
                    )}
                </div>
                <style jsx>{`
                    .section-header { font-size: 11px; font-weight: 500; color: #6B7280; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
                    .panel { background: #F9FAFB; border-radius: 12px; padding: 16px; border: 1px solid #F3F4F6; }
                `}</style>


                {/* Content */}
                <div className="mb-6">
                    <div className="section-header">
                        <span>Keyword Rankings</span>
                    </div>
                    <div className="panel p-0 overflow-hidden pt-4 pb-2">
                        {keywordList.length > 0 ? (
                            <>
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-2 px-6 pb-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    <div className="col-span-5">Keyword</div>
                                    <div className="col-span-2 text-center">Position</div>
                                    <div className="col-span-2 text-right">Volume</div>
                                    <div className="col-span-2 text-right">Traffic</div>
                                    <div className="col-span-1 text-right">CPC</div>
                                </div>

                                {/* Keyword Rows */}
                                <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto px-3">
                                    {keywordList.slice(0, 30).map((kw, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-3 items-center hover:bg-gray-50/50 transition-colors group">
                                            <div className="col-span-5 flex items-center gap-2 min-w-0">
                                                <span className="text-sm font-medium text-gray-900 truncate">
                                                    {kw.keyword || '-'}
                                                </span>
                                                {kw.topRankedUrl && (
                                                    <a
                                                        href={kw.topRankedUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                    >
                                                        <ExternalLink className="w-3 h-3 text-gray-400" />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="col-span-2 flex justify-center">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${getPositionColor(kw.rank || 99)}`}>
                                                    #{kw.rank ?? '-'}
                                                </span>
                                            </div>
                                            <div className="col-span-2 text-right text-sm text-gray-600">
                                                {formatNumber(kw.searchVolume)}
                                            </div>
                                            <div className="col-span-2 text-right text-sm text-gray-600 flex items-center justify-end gap-1">
                                                {kw.seoClicks !== undefined && kw.seoClicks > 0 && (
                                                    <TrendingUp className="w-3 h-3 text-green-500" />
                                                )}
                                                {formatNumber(kw.seoClicks)}
                                            </div>
                                            <div className="col-span-1 text-right text-sm text-gray-500">
                                                {kw.exactCostPerClick !== undefined && kw.exactCostPerClick !== null ? `$${kw.exactCostPerClick.toFixed(2)}` : kw.broadCostPerClick !== undefined && kw.broadCostPerClick !== null ? `$${kw.broadCostPerClick.toFixed(2)}` : '-'}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {keywordList.length > 30 && (
                                    <div className="text-center mt-4 pt-4 border-t border-gray-100 mx-6">
                                        <p className="text-sm text-gray-400">
                                            Showing top 30 of {keywordList.length} keywords
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No keyword data available</p>
                                <p className="text-gray-400 text-sm mt-1">This site may not have indexed keywords yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Stats */}
                {keywordList.length > 0 && (
                    <div className="mb-6">
                        <div className="section-header">
                            <span>Summary Stats</span>
                        </div>
                        <div className="panel grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {keywordList.filter(k => (k.rank || 99) <= 10).length}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Top 10 Keywords</div>
                            </div>
                            <div className="text-center border-l border-r border-[#E5E7EB]">
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatNumber(keywordList.reduce((sum, k) => sum + (k.seoClicks || 0), 0))}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Est. Traffic</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                                    {keywordList.filter(k => (k.rank || 99) <= 3).length}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Top 3 Rankings</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CardErrorBoundary>
    );
}
