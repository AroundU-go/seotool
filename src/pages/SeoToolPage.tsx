import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, AlertCircle, Search, ArrowLeft, LogOut, Lock, ArrowRight, History, LayoutDashboard, Menu, X, ChevronRight, Crown, CheckCircle2 } from 'lucide-react';
import UrlInput from '../components/UrlInput';
import SeoDashboard from '../components/SeoDashboard';
import AiVisibilityCard from '../components/AiVisibilityCard';
import AiBotCheckerCard from '../components/AiBotCheckerCard';
import TopKeywordsCard from '../components/TopKeywordsCard';
import { analyzeSeo, checkAiVisibility, checkAiBots, checkLoadingSpeed, checkTopKeywords } from '../services/seoApi';
import { generateFixGuidePdf } from '../utils/pdfGenerator';
import { saveAnalysis, getUserAnalyses, getUserAnalysesByEmail, getAuditCountByEmail, recordFreeAudit, SeoAnalysisRecord } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Component, ReactNode } from 'react';

class CardErrorBoundary extends Component<{ children: ReactNode; name: string }, { hasError: boolean; error?: Error }> {
    constructor(props: { children: ReactNode; name: string }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-200">
                    <div className="flex items-center gap-3 text-red-600 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        <h3 className="font-semibold">Error rendering {this.props.name}</h3>
                    </div>
                    <p className="text-sm text-red-500 mb-2">Please report this issue.</p>
                    <pre className="text-xs bg-red-100 p-2 rounded text-red-800 overflow-auto max-h-40">
                        {this.state.error?.message}
                        {'\n'}
                        {this.state.error?.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function SeoToolPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut: handleSignOut, isPro, proExpired, refreshProStatus } = useAuth();
    const guestEmail = localStorage.getItem('guest_email');
    const displayEmail = user?.email || guestEmail;
    const isAdmin = displayEmail === 'go.aroundu@gmail.com';
    const hasProAccess = (isPro && !proExpired) || isAdmin;

    // Build checkout URL with user email for payment tracking
    const checkoutUrl = `https://test.checkout.dodopayments.com/buy/pdt_0NYsnZquqsrqDi9SW9pHT?quantity=1${displayEmail ? `&customer[email]=${encodeURIComponent(displayEmail)}` : ''}&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}`;

    // Pro activation popup state
    const [showProActivated, setShowProActivated] = useState(false);

    // Check for payment success redirect and refresh pro status
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            refreshProStatus();
            setShowProActivated(true);
            // Clean the URL
            window.history.replaceState({}, '', '/analyze');
        }
    }, [refreshProStatus]);

    const onSignOut = async () => {
        await handleSignOut();
        localStorage.removeItem('guest_email');
        navigate('/');
    };
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [website, setWebsite] = useState('');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
    const [history, setHistory] = useState<SeoAnalysisRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Menu state
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [results, setResults] = useState<{
        seoAnalysis: any;
        aiVisibility: any;
        aiBotChecker: any;
        loadingSpeed: any;
        topKeywords: any;
    }>({
        seoAnalysis: null,
        aiVisibility: null,
        aiBotChecker: null,
        loadingSpeed: null,
        topKeywords: null,
    });

    // ── Local history helpers ──────────────────────────────────
    const LOCAL_HISTORY_KEY = 'seozapp_history';
    const MAX_LOCAL_HISTORY = 30;

    const getLocalHistory = (): SeoAnalysisRecord[] => {
        try {
            const stored = localStorage.getItem(LOCAL_HISTORY_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    };

    const saveLocalHistory = (record: SeoAnalysisRecord) => {
        try {
            const existing = getLocalHistory();
            const updated = [record, ...existing].slice(0, MAX_LOCAL_HISTORY);
            localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
        } catch (err) { console.error('[LocalHistory] Save error:', err); }
    };

    // ── Fetch History ────────────────────────────────────────────
    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            let remoteData: SeoAnalysisRecord[] = [];

            // Try fetching from Supabase - query by both user_id AND email
            // because past analyses may have been saved under guest_email
            try {
                if (user?.id) {
                    const byId = await getUserAnalyses(user.id);
                    remoteData = [...byId];
                }
                // Also fetch by email (covers guest analyses before signup)
                const email = user?.email || guestEmail;
                if (email) {
                    const byEmail = await getUserAnalysesByEmail(email);
                    // Merge without duplicates
                    const existingIds = new Set(remoteData.map(r => r.id));
                    for (const r of byEmail) {
                        if (!existingIds.has(r.id)) {
                            remoteData.push(r);
                        }
                    }
                }
            } catch (supabaseErr) {
                console.error('[History] Supabase fetch error:', supabaseErr);
                // Continue with local data only
            }

            // Merge with local history
            const localData = getLocalHistory();
            const seen = new Set<string>();
            const merged: SeoAnalysisRecord[] = [];

            for (const r of [...remoteData, ...localData]) {
                const key = `${r.website}__${r.created_at}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    merged.push(r);
                }
            }

            // Sort by date descending
            merged.sort((a, b) =>
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );

            setHistory(merged);
        } catch (err) {
            console.error('[History] Fetch error:', err);
            // Fall back to local only
            setHistory(getLocalHistory());
        } finally {
            setHistoryLoading(false);
        }
    }, [user?.id, user?.email, guestEmail]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Auto-save current dashboard results to local history if not already saved
    useEffect(() => {
        if (activeTab === 'history' && website && (results.seoAnalysis || results.loadingSpeed)) {
            const local = getLocalHistory();
            const alreadySaved = local.some(r => r.website === website);
            if (!alreadySaved) {
                const record: SeoAnalysisRecord = {
                    id: `local_${Date.now()}`,
                    user_id: user?.id,
                    guest_email: !user?.id ? (guestEmail || undefined) : undefined,
                    website,
                    seo_data: results.seoAnalysis,
                    ai_visibility_data: results.aiVisibility,
                    ai_bot_data: results.aiBotChecker,
                    loading_speed_data: results.loadingSpeed,
                    created_at: new Date().toISOString(),
                };
                saveLocalHistory(record);
                fetchHistory();
            }
        }
    }, [activeTab]);


    useEffect(() => {
        if (location.state?.analyzeUrl) {
            handleAnalyze(location.state.analyzeUrl);
        }
    }, [location.state]);

    // ... imports

    const handleAnalyze = async (url: string) => {
        // Enforce limits for non-admin users
        if (!hasProAccess && (user?.email || guestEmail)) {
            const email = user?.email || guestEmail || '';
            const count = await getAuditCountByEmail(email);
            if (count >= 2) {
                setShowUpgradeModal(true);
                return;
            }
        }

        setLoading(true);
        setError(null);
        setWebsite(url);
        setResults({ seoAnalysis: null, aiVisibility: null, aiBotChecker: null, loadingSpeed: null, topKeywords: null });
        setActiveTab('dashboard'); // Ensure we switch back to dashboard

        try {
            // Admin gets everything, Free users get only SEO Analysis & Speed
            const promises = [
                analyzeSeo(url),
                checkLoadingSpeed(url),
            ];

            if (hasProAccess) {
                promises.push(checkAiVisibility(url));
                promises.push(checkAiBots(url));
                promises.push(checkTopKeywords(url));
            }

            const results = await Promise.allSettled(promises);

            // Destructure results carefully based on what was requested
            const seoData = results[0];
            const speedData = results[1];
            const aiVisData = hasProAccess ? results[2] : { status: 'rejected', reason: 'Not requested' };
            const aiBotData = hasProAccess ? results[3] : { status: 'rejected', reason: 'Not requested' };
            const topKwData = hasProAccess ? results[4] : { status: 'rejected', reason: 'Not requested' };

            const newResults = {
                seoAnalysis: seoData.status === 'fulfilled' ? seoData.value : null,
                loadingSpeed: speedData.status === 'fulfilled' ? speedData.value : null,
                aiVisibility: aiVisData.status === 'fulfilled' ? (aiVisData as any).value : null,
                aiBotChecker: aiBotData.status === 'fulfilled' ? (aiBotData as any).value : null,
                topKeywords: topKwData.status === 'fulfilled' ? (topKwData as any).value : null,
            };

            console.log('API Results:', newResults);
            setResults(newResults);

            if (seoData.status === 'rejected' && speedData.status === 'rejected') {
                setError('Failed to analyze website. Please check the URL and try again.');
            } else {
                // Record free audit if successful
                if (!hasProAccess && (user?.email || guestEmail)) {
                    recordFreeAudit(user?.email || guestEmail || '', url).catch(console.error);
                }

                // Save to localStorage immediately (always works)
                const emailForSave = user?.email || guestEmail || undefined;
                const localRecord: SeoAnalysisRecord = {
                    id: `local_${Date.now()}`,
                    user_id: user?.id,
                    guest_email: emailForSave,
                    website: url,
                    seo_data: newResults.seoAnalysis,
                    ai_visibility_data: newResults.aiVisibility,
                    ai_bot_data: newResults.aiBotChecker,
                    loading_speed_data: newResults.loadingSpeed,
                    created_at: new Date().toISOString(),
                };
                saveLocalHistory(localRecord);

                // Also try Supabase (best-effort)
                saveAnalysis({
                    user_id: user?.id,
                    guest_email: emailForSave,
                    website: url,
                    seo_data: newResults.seoAnalysis,
                    ai_visibility_data: newResults.aiVisibility,
                    ai_bot_data: newResults.aiBotChecker,
                    loading_speed_data: newResults.loadingSpeed,
                }).then((saved) => {
                    console.log('[SeoToolPage] Save result:', saved ? 'success' : 'failed');
                    fetchHistory();
                }).catch(err => console.error('Failed to save analysis:', err));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadGuide = () => {
        if (results.seoAnalysis || results.aiVisibility || results.aiBotChecker || results.loadingSpeed) {
            generateFixGuidePdf(website, results);
        }
    };

    const handleLoadHistory = (record: SeoAnalysisRecord) => {
        setWebsite(record.website);
        setResults({
            seoAnalysis: record.seo_data,
            aiVisibility: record.ai_visibility_data,
            aiBotChecker: record.ai_bot_data,
            loadingSpeed: record.loading_speed_data,
            topKeywords: (record as any).top_keywords_data || null,
        });
        setActiveTab('dashboard');
        setIsMenuOpen(false);
    };

    const hasResults = results.seoAnalysis || results.aiVisibility || results.aiBotChecker || results.loadingSpeed || results.topKeywords;

    return (
        <div className="min-h-screen bg-[#f8f9fe]">
            {/* Pro Expired Modal */}
            {proExpired && !isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8 text-red-500" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Plan Expired</h3>
                        <p className="text-gray-500 mb-8">
                            Your Pro plan expired. Renew to keep going.
                        </p>

                        <button
                            onClick={() => {
                                window.location.href = checkoutUrl;
                            }}
                            className="w-full py-3.5 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            Renew Pro Plan
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-center">
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8 text-accent" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Trial Over</h3>
                        <p className="text-gray-500 mb-8">
                            Your Free trial is over, Switch to Pro for unlimited audits.
                        </p>

                        <button
                            onClick={() => {
                                setShowUpgradeModal(false);
                                window.location.href = checkoutUrl;
                            }}
                            className="w-full py-3.5 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            Upgrade to Pro
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Pro Activation Modal */}
            {showProActivated && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-center">
                        <button
                            onClick={() => setShowProActivated(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Welcome to Pro!</h3>
                        <p className="text-gray-500 mb-6">
                            Your SEOzapp Pro plan is activated. You now have unlimited audits and full access to AI-powered reports.
                        </p>

                        <button
                            onClick={() => setShowProActivated(false)}
                            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            Start Analyzing
                        </button>
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-40">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                </button>

                {/* Updated Logo */}
                <div className="flex items-center gap-2">
                    <span className="font-black text-xl tracking-tight text-gray-900">
                        SEO<span className="text-accent">zapp</span>
                    </span>
                    {hasProAccess && (
                        <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            PRO
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 relative">
                    {(user || guestEmail) && (
                        <>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                            >
                                {isMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Signed in as</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">{displayEmail}</p>
                                    </div>

                                    <button
                                        onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${activeTab === 'dashboard' ? 'text-accent font-medium' : 'text-gray-600'}`}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </button>

                                    <button
                                        onClick={() => {
                                            setActiveTab('history');
                                            setIsMenuOpen(false);
                                            fetchHistory();
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${activeTab === 'history' ? 'text-accent font-medium' : 'text-gray-600'}`}
                                    >
                                        <History className="w-4 h-4" />
                                        History
                                    </button>

                                    <button
                                        onClick={() => alert('Bulk Analysis coming soon!')}
                                        className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-600"
                                    >
                                        <Search className="w-4 h-4" />
                                        Bulk Analysis
                                    </button>

                                    <div className="border-t border-gray-100 my-2 pt-2">
                                        <button
                                            onClick={onSignOut}
                                            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex items-center gap-1 px-6 py-2 border-b border-gray-200 bg-white">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'dashboard'
                        ? 'bg-accent/10 text-accent'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </button>
                <button
                    onClick={() => { setActiveTab('history'); fetchHistory(); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history'
                        ? 'bg-accent/10 text-accent'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                >
                    <History className="w-4 h-4" />
                    History
                </button>
            </div>

            <div className="container mx-auto px-4 py-12">

                {activeTab === 'history' ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <History className="w-6 h-6 text-accent" />
                                Analysis History
                            </h2>
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className="text-sm font-medium text-gray-500 hover:text-accent flex items-center gap-1"
                            >
                                Back to Dashboard <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {historyLoading ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-500">Loading history...</p>
                            </div>
                        ) : historyError ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-red-100">
                                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Failed to load history</h3>
                                <p className="text-red-500 text-sm mt-1">{historyError}</p>
                                <button
                                    onClick={fetchHistory}
                                    className="mt-4 text-accent font-semibold hover:underline"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : history.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {history.map((record) => (
                                    <div
                                        key={record.id}
                                        onClick={() => handleLoadHistory(record)}
                                        className="p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                                                {(record.seo_data as any)?.summary?.overall_score || '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{record.website}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(record.created_at || '').toLocaleDateString()} at {new Date(record.created_at || '').toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No history found</h3>
                                <p className="text-gray-500">Your past analyses will appear here.</p>
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className="mt-4 text-accent font-semibold hover:underline"
                                >
                                    Start an analysis
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-12">
                            {!hasResults && !loading && (
                                <>
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
                                        <Search className="w-8 h-8 text-accent" />
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-sans">
                                        Upgrade your SEO game
                                        <span className="block text-accent text-3xl md:text-4xl mt-2">Rank higher. Get discovered by humans + AI search engines</span>
                                    </h1>
                                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                                        Comprehensive on-page SEO analysis with AI optimization insights and actionable recommendations
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col items-center mb-8">
                            {!hasResults && !loading && (
                                <UrlInput onAnalyze={handleAnalyze} loading={loading} />
                            )}

                            {error && (
                                <div className="mt-6 max-w-3xl w-full bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-red-800">{error}</p>
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="max-w-4xl mx-auto text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6">
                                    <Search className="w-8 h-8 text-accent animate-spin" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Analyzing {website}...</h3>
                                <p className="text-gray-500">Analyzing your site's SEO, measuring speed & structure...</p>
                                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                                    {['SEO Analysis', 'AI Readiness', 'Bot Access', 'Page Speed'].map((label) => (
                                        <div key={label} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 animate-pulse">
                                            <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                                            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-1" />
                                            <p className="text-xs text-gray-400">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasResults && !loading && (
                            <>
                                <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                                    <div /> {/* Spacer */}
                                    <button
                                        onClick={handleDownloadGuide}
                                        className="bg-accent text-white px-6 py-3 rounded-full hover:bg-accent-600 transition-all flex items-center gap-2 shadow-lg shadow-accent/20 font-semibold text-sm transform hover:-translate-y-0.5"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Report
                                    </button>
                                </div>

                                <div className="max-w-7xl mx-auto space-y-8">

                                    <CardErrorBoundary name="SEO Dashboard">
                                        <SeoDashboard results={results} website={website} />
                                    </CardErrorBoundary>

                                    {hasProAccess && results.aiVisibility && (
                                        <CardErrorBoundary name="AI Visibility">
                                            <AiVisibilityCard data={results.aiVisibility} />
                                        </CardErrorBoundary>
                                    )}

                                    {hasProAccess && results.aiBotChecker && (
                                        <CardErrorBoundary name="AI Bot Checker">
                                            <AiBotCheckerCard data={results.aiBotChecker} />
                                        </CardErrorBoundary>
                                    )}

                                    {hasProAccess && results.topKeywords && (
                                        <CardErrorBoundary name="Top Keywords">
                                            <TopKeywordsCard data={results.topKeywords} />
                                        </CardErrorBoundary>
                                    )}

                                    {/* Dummy Pro Button for Free Users */}
                                    {!hasProAccess && (
                                        <div className="bg-white border border-accent/20 rounded-3xl p-10 text-center mt-12 relative overflow-hidden shadow-lg shadow-accent/5">
                                            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-full mb-6 text-accent">
                                                    <Lock className="w-7 h-7" />
                                                </div>
                                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Unlock Full AI Report</h3>
                                                <p className="text-gray-500 mb-8 max-w-lg mx-auto text-lg">
                                                    Get deep insights into your AEO & GEO optimization, AI Search Visibility scoring, AI keyword suggestions, pdf exports, Priority support

                                                </p>
                                                <button
                                                    onClick={() => window.location.href = checkoutUrl}
                                                    className="px-10 py-4 bg-accent text-white font-bold rounded-full shadow-xl shadow-accent/30 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.02] inline-flex items-center gap-2 cursor-pointer text-lg"
                                                >
                                                    Unlock full report with Pro
                                                    <ArrowRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
