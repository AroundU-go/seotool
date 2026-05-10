import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Crown, Menu, X, LayoutDashboard, History, Sparkles, Search, LogOut, Lock, Loader2, AlertCircle, TrendingUp, DollarSign, BarChart3, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getKeywordSuggestions, KeywordSuggestion } from '../services/seoApi';
import PricingModal from '../components/PricingModal';

export default function KeywordSuggestionsPage() {
    const router = useRouter();
    const { user, signOut: handleSignOut, isPro, proExpired } = useAuth();
    const guestEmail = typeof window !== 'undefined' ? localStorage.getItem('guest_email') : null;
    const displayEmail = user?.email || guestEmail;
    const isAdmin = displayEmail === 'go.aroundu@gmail.com';
    const hasProAccess = (isPro && !proExpired) || isAdmin;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [country, setCountry] = useState('us');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<KeywordSuggestion[] | null>(null);
    const [searchedKeyword, setSearchedKeyword] = useState('');
    const [showPricingModal, setShowPricingModal] = useState(false);

    const onSignOut = async () => {
        await handleSignOut();
        localStorage.removeItem('guest_email');
        router.push('/');
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        if (!hasProAccess) {
            setShowPricingModal(true);
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);
        setSearchedKeyword(keyword.trim());

        try {
            const data = await getKeywordSuggestions(keyword.trim(), country);
            setResults(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch keyword suggestions');
        } finally {
            setLoading(false);
        }
    };

    const getCompetitionColor = (comp: string) => {
        switch (comp?.toLowerCase()) {
            case 'low': return 'bg-green-100 text-green-700';
            case 'medium': return 'bg-amber-100 text-amber-700';
            case 'high': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatVolume = (vol: number) => {
        if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
        if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
        return vol.toString();
    };

    const countries = [
        { code: 'us', name: 'United States' },
        { code: 'gb', name: 'United Kingdom' },
        { code: 'ca', name: 'Canada' },
        { code: 'au', name: 'Australia' },
        { code: 'de', name: 'Germany' },
        { code: 'fr', name: 'France' },
        { code: 'in', name: 'India' },
        { code: 'br', name: 'Brazil' },
        { code: 'es', name: 'Spain' },
        { code: 'it', name: 'Italy' },
    ];

    return (
        <>
            <Head>
                <title>Keyword Suggestions — SEOzapp</title>
                <meta name="description" content="Discover high-value keyword suggestions with search volume, CPC, and competition data. Powered by SEOzapp Pro." />
            </Head>

            <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #F4FCFF 0%, #daf3ff 40%, #b8e8ff 100%)' }}>
                {/* Background Effects */}
                <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle, rgba(117,221,255,0.35) 0%, rgba(117,221,255,0.10) 50%, transparent 75%)' }} />
                <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-40 blur-[100px]" style={{ background: 'radial-gradient(circle, #75DDFF 0%, rgba(255,255,255,0.6) 70%)' }} />
                <div className="pointer-events-none absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]" style={{ background: 'radial-gradient(circle, #75DDFF 0%, rgba(255,255,255,0.5) 70%)' }} />
                <div className="pointer-events-none absolute inset-0 z-[1]" style={{ opacity: 0.015, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '256px 256px' }} />

                {/* Top Bar */}
                <div className={`flex items-center justify-between px-6 py-4 border-b border-white/30 backdrop-blur-md sticky top-0 z-[45] transition-colors duration-300 ${isMenuOpen ? 'bg-white' : 'bg-white/60'}`}>
                    <button
                        onClick={() => router.push('/analyze')}
                        className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <a href="https://seozapp.com" className="font-black text-xl tracking-tight text-gray-900">
                            SEO<span className="text-accent">zapp</span>
                        </a>
                        {hasProAccess && (
                            <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                PRO<sup className="text-[8px] ml-0.5">+</sup>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 relative">
                        {(user || guestEmail) && (
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-full hover:bg-white/40 transition-colors relative z-[46]"
                            >
                                {isMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Backdrop overlay */}
                <div
                    className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Slide-in Sidebar Menu */}
                <div
                    style={{ height: '100vh' }}
                    className={`fixed top-0 right-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/50 z-50 flex flex-col transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <span className="font-bold text-gray-900 text-sm tracking-wide uppercase">Menu</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="px-5 py-4 border-b border-gray-100">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{displayEmail}</p>
                    </div>
                    <nav className="flex-1 py-3 overflow-y-auto">
                        <button
                            onClick={() => { setIsMenuOpen(false); router.push('/analyze'); }}
                            className="w-full text-left px-5 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-600"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => { setIsMenuOpen(false); router.push('/analyze'); }}
                            className="w-full text-left px-5 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-600"
                        >
                            <History className="w-4 h-4" />
                            History
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full text-left px-5 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-accent font-medium bg-accent/5"
                        >
                            <Sparkles className="w-4 h-4" />
                            Keyword Suggestions
                        </button>
                        <button
                            onClick={() => alert('Bulk Analysis coming soon!')}
                            className="w-full text-left px-5 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-600"
                        >
                            <Search className="w-4 h-4" />
                            Bulk Analysis
                        </button>
                    </nav>
                    <div className="border-t border-gray-100 p-3 mt-auto">
                        <button
                            onClick={onSignOut}
                            className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-red-50 text-red-600 transition-colors rounded-lg"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-12 relative z-[2]">
                    <div className="max-w-4xl mx-auto">
                        {/* Hero */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
                                <Sparkles className="w-8 h-8 text-accent" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                Keyword Suggestions
                            </h1>
                            <p className="text-lg text-gray-500 max-w-xl mx-auto">
                                Discover high-value keywords with search volume, CPC, and competition data
                            </p>
                            {!hasProAccess && (
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-700 font-medium">
                                    <Lock className="w-4 h-4" />
                                    Pro feature — upgrade to access
                                </div>
                            )}
                        </div>

                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="mb-10">
                            <div className="flex flex-col sm:flex-row items-center bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl sm:rounded-full p-2 shadow-[0_15px_40px_-10px_rgba(117,221,255,0.4)] transition-all duration-300 gap-2 sm:gap-0">
                                <div className="hidden sm:flex items-center pl-4 pr-1 text-gray-400">
                                    <Search className="w-5 h-5" />
                                </div>
                                <div className="relative flex-1 w-full sm:w-auto flex items-center">
                                    <Search className="absolute left-4 w-5 h-5 text-gray-400 sm:hidden" />
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder="Enter a keyword (e.g., email marketing)"
                                        className="w-full bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-base md:text-lg min-w-0 pl-12 sm:pl-2 pr-4 py-4 sm:py-3"
                                        disabled={loading}
                                    />
                                </div>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="px-3 py-2 rounded-xl sm:rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/30 mr-2 cursor-pointer"
                                    disabled={loading}
                                >
                                    {countries.map((c) => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    disabled={loading || !keyword.trim()}
                                    className="w-full sm:w-auto px-8 py-4 sm:py-3 md:py-4 bg-accent text-accent-900 font-bold text-base md:text-lg rounded-2xl sm:rounded-full shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Searching</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5" /> Suggest</>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Error */}
                        {error && (
                            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Loading */}
                        {loading && (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6">
                                    <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Finding keywords for &ldquo;{searchedKeyword}&rdquo;...</h3>
                                <p className="text-gray-500">Analyzing search volumes, CPC, and competition</p>
                            </div>
                        )}

                        {/* Results */}
                        {results && !loading && (
                            <div>
                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                                            <Target className="w-3.5 h-3.5" />
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Keywords</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{results.length}</div>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Volume</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {results.length > 0 ? formatVolume(Math.round(results.reduce((sum, r) => sum + r.vol, 0) / results.length)) : '0'}
                                        </div>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Avg CPC</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            ${results.length > 0 ? (results.reduce((sum, r) => sum + parseFloat(r.cpc || '0'), 0) / results.length).toFixed(2) : '0.00'}
                                        </div>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                                            <BarChart3 className="w-3.5 h-3.5" />
                                            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Score</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {results.length > 0 ? (results.reduce((sum, r) => sum + parseFloat(r.score || '0'), 0) / results.length).toFixed(2) : '0'}
                                        </div>
                                    </div>
                                </div>

                                {/* Results Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Results for &ldquo;{searchedKeyword}&rdquo;
                                    </h2>
                                    <span className="text-sm text-gray-500">{results.length} suggestions</span>
                                </div>

                                {results.length > 0 ? (
                                    <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg overflow-hidden">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50/80 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                            <div className="col-span-5">Keyword</div>
                                            <div className="col-span-2 text-right">Volume</div>
                                            <div className="col-span-2 text-right">CPC</div>
                                            <div className="col-span-2 text-center">Competition</div>
                                            <div className="col-span-1 text-right">Score</div>
                                        </div>

                                        {/* Table Rows */}
                                        {results.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-gray-100 last:border-none hover:bg-accent/5 transition-colors items-center"
                                            >
                                                <div className="col-span-5">
                                                    <span className="text-sm font-medium text-gray-900">{item.text}</span>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <span className="text-sm font-semibold text-gray-700">{formatVolume(item.vol)}</span>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <span className="text-sm text-gray-600">${item.cpc}</span>
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getCompetitionColor(item.competition)}`}>
                                                        {item.competition}
                                                    </span>
                                                </div>
                                                <div className="col-span-1 text-right">
                                                    <span className="text-sm font-medium text-gray-600">{item.score}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white/70 rounded-2xl border border-white/50">
                                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">No suggestions found</h3>
                                        <p className="text-gray-500 mt-1">Try a different keyword or country</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
            </div>
        </>
    );
}
