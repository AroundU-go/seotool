import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Download, AlertCircle, Search, ArrowLeft, LogOut, Lock, ArrowRight, History, LayoutDashboard, Menu, X, ChevronRight, Crown, CheckCircle2, Brain, TrendingUp, Link2, Globe, Loader2 } from 'lucide-react';
import SeoDashboard from '../components/SeoDashboard';
import AiVisibilityCard from '../components/AiVisibilityCard';
import AiBotCheckerCard from '../components/AiBotCheckerCard';
import TopKeywordsCard from '../components/TopKeywordsCard';
import BacklinksCard from '../components/BacklinksCard';
import { DummyProCard } from '../components/DummyProCard';
import { analyzeSeo, checkAiVisibility, checkAiBots, checkLoadingSpeed, checkTopKeywords, getBacklinkData, getNewBacklinks, getPoorBacklinks, fetchRapidApiData } from '../services/seoApi';
import { generateFixGuidePdf } from '../utils/pdfGenerator';
import { saveAnalysis, getUserAnalysesByEmailOrId, getAnalysisCountByEmail, incrementProAuditCount, SeoAnalysisRecord } from '../services/supabaseClient';
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
    const router = useRouter();
    const { user, signOut: handleSignOut, isPro, proExpired, paymentType, proAuditCount, refreshProStatus } = useAuth();
    const guestEmail = typeof window !== 'undefined' ? localStorage.getItem('guest_email') : null;
    const displayEmail = user?.email || guestEmail;
    const isAdmin = displayEmail === 'go.aroundu@gmail.com';
    const hasProAccess = (isPro && !proExpired) || isAdmin;



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
        router.push('/');
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
        backlinkData: any;
        newBacklinks: any;
        poorBacklinks: any;
        rapidApiData: any;
    }>({
        seoAnalysis: null,
        aiVisibility: null,
        aiBotChecker: null,
        loadingSpeed: null,
        topKeywords: null,
        backlinkData: null,
        newBacklinks: null,
        poorBacklinks: null,
        rapidApiData: null,
    });

    // ── Local history helpers ──────────────────────────────────
    // Scope localStorage history per user email to prevent cross-account leakage
    const historyEmail = user?.email || guestEmail || 'anonymous';
    const LOCAL_HISTORY_KEY = `seozapp_history_${historyEmail}`;
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

            // Use unified query that matches by user_id OR guest_email
            const email = (user?.email || guestEmail || '').trim().toLowerCase();
            console.log('[History] Fetching for user:', user?.id, 'email:', email);
            try {
                remoteData = await getUserAnalysesByEmailOrId(user?.id, email || undefined);
                console.log('[History] Remote data count:', remoteData.length);
            } catch (supabaseErr) {
                console.error('[History] Supabase fetch error:', supabaseErr);
                // Continue with local data only
            }

            // Merge with local history, dedup by id to avoid duplicates
            const localData = getLocalHistory();
            const allRecords = [...remoteData, ...localData];

            // Sort all by date descending
            allRecords.sort((a, b) =>
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );

            // Deduplicate by id only (keep all analyses, even for same website)
            const seenIds = new Set<string>();
            const merged: SeoAnalysisRecord[] = [];

            for (const r of allRecords) {
                const recordId = r.id || `${r.website}_${r.created_at}`;
                if (!seenIds.has(recordId)) {
                    seenIds.add(recordId);
                    merged.push(r);
                }
            }

            console.log('[History] Total merged records:', merged.length);
            setHistory(merged);
        } catch (err) {
            console.error('[History] Fetch error:', err);
            setHistoryError('Failed to load history. Please try again.');
            // Fall back to local only
            setHistory(getLocalHistory());
        } finally {
            setHistoryLoading(false);
        }
    }, [user?.id, user?.email, guestEmail]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        if (router.query.analyzeUrl) {
            handleAnalyze(router.query.analyzeUrl as string);
        }
    }, [router.query]);

    // ... imports

    const handleAnalyze = async (url: string) => {
        // Enforce limits for non-admin users
        if (!hasProAccess && (user?.email || guestEmail)) {
            const email = user?.email || guestEmail || '';
            const count = await getAnalysisCountByEmail(email);
            if (count >= 1) {
                setShowUpgradeModal(true);
                return;
            }
        }

        // Enforce 2-audit limit for one-time Pro users
        if (hasProAccess && paymentType === 'one_time' && proAuditCount >= 2 && !isAdmin) {
            setShowUpgradeModal(true);
            return;
        }

        setLoading(true);
        setError(null);
        setWebsite(url);
        setResults({ seoAnalysis: null, aiVisibility: null, aiBotChecker: null, loadingSpeed: null, topKeywords: null, backlinkData: null, newBacklinks: null, poorBacklinks: null, rapidApiData: null });
        setActiveTab('dashboard'); // Ensure we switch back to dashboard

        try {
            // Admin gets everything
            // Pro ($5 one-time) gets: on-page, speed, AI bot checker, top keywords
            // Free users get only SEO Analysis & Speed
            const promises = [
                analyzeSeo(url),
                checkLoadingSpeed(url),
                fetchRapidApiData(url),
            ];

            if (hasProAccess) {
                promises.push(checkAiBots(url));        // idx 3
                promises.push(checkTopKeywords(url));   // idx 4
                promises.push(checkAiVisibility(url));  // idx 5 — all pro users
                promises.push(getBacklinkData(url));    // idx 6
                promises.push(getNewBacklinks(url));    // idx 7
                promises.push(getPoorBacklinks(url));   // idx 8
            }

            const results = await Promise.allSettled(promises);

            // Destructure results — indices are fixed since all pro APIs are always requested together
            const seoData = results[0];
            const speedData = results[1];
            const rapidApiDataRes = results[2];
            const aiBotData = hasProAccess ? results[3] : { status: 'rejected', reason: 'Not requested' };
            const topKwData = hasProAccess ? results[4] : { status: 'rejected', reason: 'Not requested' };
            const aiVisData = hasProAccess ? results[5] : { status: 'rejected', reason: 'Not requested' };
            const backlinkDataRes = hasProAccess ? results[6] : { status: 'rejected', reason: 'Not requested' };
            const newBacklinksRes = hasProAccess ? results[7] : { status: 'rejected', reason: 'Not requested' };
            const poorBacklinksRes = hasProAccess ? results[8] : { status: 'rejected', reason: 'Not requested' };

            const newResults = {
                seoAnalysis: seoData.status === 'fulfilled' ? seoData.value : null,
                loadingSpeed: speedData.status === 'fulfilled' ? speedData.value : null,
                rapidApiData: rapidApiDataRes.status === 'fulfilled' ? (rapidApiDataRes as any).value : null,
                aiBotChecker: aiBotData.status === 'fulfilled' ? (aiBotData as any).value : null,
                topKeywords: topKwData.status === 'fulfilled' ? (topKwData as any).value : null,
                aiVisibility: aiVisData.status === 'fulfilled' ? (aiVisData as any).value : null,
                backlinkData: backlinkDataRes.status === 'fulfilled' ? (backlinkDataRes as any).value : null,
                newBacklinks: newBacklinksRes.status === 'fulfilled' ? (newBacklinksRes as any).value : null,
                poorBacklinks: poorBacklinksRes.status === 'fulfilled' ? (poorBacklinksRes as any).value : null,
            };

            console.log('API Results:', newResults);
            setResults(newResults);

            if (seoData.status === 'rejected' && speedData.status === 'rejected') {
                setError('Failed to analyze website. Please check the URL and try again.');
            } else {

                // Increment audit count for one-time Pro users
                if (hasProAccess && paymentType === 'one_time' && user?.id && !isAdmin) {
                    incrementProAuditCount(user.id).then((newCount) => {
                        console.log('[SeoToolPage] Pro audit count incremented to:', newCount);
                        refreshProStatus();
                    }).catch(console.error);
                }

                // Save to localStorage immediately (always works)
                const emailForSave = (user?.email || guestEmail || '').trim().toLowerCase() || undefined;
                const localRecord: SeoAnalysisRecord = {
                    id: `local_${Date.now()}`,
                    user_id: user?.id,
                    guest_email: emailForSave,
                    website: url,
                    seo_data: newResults.seoAnalysis,
                    ai_visibility_data: newResults.aiVisibility,
                    ai_bot_data: newResults.aiBotChecker,
                    loading_speed_data: newResults.loadingSpeed,
                    top_keywords_data: newResults.topKeywords,
                    backlink_data: newResults.backlinkData,
                    new_backlinks_data: newResults.newBacklinks,
                    poor_backlinks_data: newResults.poorBacklinks,
                    rapid_api_data: newResults.rapidApiData,
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
                    top_keywords_data: newResults.topKeywords,
                    backlink_data: newResults.backlinkData,
                    new_backlinks_data: newResults.newBacklinks,
                    poor_backlinks_data: newResults.poorBacklinks,
                    rapid_api_data: newResults.rapidApiData,
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
            generateFixGuidePdf(website, results, hasProAccess);
        }
    };

    const handleLoadHistory = (record: SeoAnalysisRecord) => {
        setWebsite(record.website);
        setResults({
            seoAnalysis: record.seo_data,
            aiVisibility: record.ai_visibility_data,
            aiBotChecker: record.ai_bot_data,
            loadingSpeed: record.loading_speed_data,
            topKeywords: record.top_keywords_data || null,
            backlinkData: record.backlink_data || null,
            newBacklinks: record.new_backlinks_data || null,
            poorBacklinks: record.poor_backlinks_data || null,
            rapidApiData: record.rapid_api_data || null,
        });
        setActiveTab('dashboard');
        setIsMenuOpen(false);
    };

    const hasResults = results.seoAnalysis || results.aiVisibility || results.aiBotChecker || results.loadingSpeed || results.topKeywords || results.backlinkData;

    // Local URL state for the landing-page-style input
    const [inputUrl, setInputUrl] = useState('');

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F4FCFF 0%, #daf3ff 40%, #b8e8ff 100%)' }}>
            {/* ── Background Effects ── */}
            {/* Radial glow behind hero */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle, rgba(117,221,255,0.35) 0%, rgba(117,221,255,0.10) 50%, transparent 75%)' }} />

            {/* Top-right blurred blob */}
            <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-40 blur-[100px]" style={{ background: 'radial-gradient(circle, #75DDFF 0%, rgba(255,255,255,0.6) 70%)' }} />

            {/* Bottom-left blurred blob */}
            <div className="pointer-events-none absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]" style={{ background: 'radial-gradient(circle, #75DDFF 0%, rgba(255,255,255,0.5) 70%)' }} />

            {/* Abstract flowing wave pattern (right side) */}
            <svg className="pointer-events-none absolute top-0 right-0 h-full w-1/2" viewBox="0 0 600 1200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ opacity: 0.07 }}>
              <path d="M300 0C350 200 450 300 600 400C450 500 350 700 300 900C250 1100 350 1150 600 1200" stroke="#75DDFF" strokeWidth="2" fill="none" />
              <path d="M350 0C400 150 500 250 600 350C500 450 400 650 350 850C300 1050 400 1100 600 1150" stroke="#75DDFF" strokeWidth="1.5" fill="none" />
              <path d="M400 0C440 180 520 280 600 320C520 420 440 620 400 800C360 1000 440 1060 600 1100" stroke="#75DDFF" strokeWidth="1" fill="none" />
              <path d="M250 100Q350 300 600 450Q350 600 250 850Q350 1000 600 1050" stroke="#75DDFF" strokeWidth="1.2" fill="none" />
            </svg>



            {/* Subtle noise texture overlay */}
            <div className="pointer-events-none absolute inset-0 z-[1]" style={{ opacity: 0.015, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '256px 256px' }} />
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
                                window.location.href = `https://checkout.dodopayments.com/buy/pdt_0NYlhH0CqhFDHJIr5v82N?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}`;
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

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Audit Limit Reached</h3>
                        <p className="text-gray-500 mb-8">
                            You've used all your free audits. Upgrade to continue analyzing websites.
                        </p>

                        <button
                            onClick={() => {
                                setShowUpgradeModal(false);
                                window.location.href = `https://checkout.dodopayments.com/buy/pdt_0NYlhH0CqhFDHJIr5v82N?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}`;
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

            {/* Top Bar — transparent, matching landing page glass style */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/30 bg-white/60 backdrop-blur-md sticky top-0 z-40">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                </button>

                {/* Updated Logo */}
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
                        <>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-full hover:bg-white/40 transition-colors relative"
                            >
                                {isMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute top-12 right-0 w-64 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/50 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
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



            <div className="container mx-auto px-4 py-12 relative z-[2]">

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
                                        Drop your URL below
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
                                <form
                                    onSubmit={(e) => { e.preventDefault(); if (inputUrl.trim()) { const cleanUrl = inputUrl.trim().replace(/^https?:\/\//, ''); handleAnalyze(cleanUrl); } }}
                                    className="w-full max-w-3xl flex flex-col sm:flex-row items-center bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl sm:rounded-full p-2 shadow-[0_15px_40px_-10px_rgba(117,221,255,0.4)] transition-all duration-300 gap-2 sm:gap-0"
                                >
                                    <div className="hidden sm:flex items-center pl-4 pr-1 text-gray-400">
                                        <Globe className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div className="relative flex-1 w-full sm:w-auto flex items-center">
                                        <Globe className="absolute left-4 w-5 h-5 text-gray-400 sm:hidden" />
                                        <input
                                            type="text"
                                            value={inputUrl}
                                            onChange={(e) => setInputUrl(e.target.value)}
                                            placeholder="Enter website URL (e.g., example.com)"
                                            className="w-full bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-base md:text-lg min-w-0 pl-12 sm:pl-2 pr-4 py-4 sm:py-3"
                                            disabled={loading}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !inputUrl.trim()}
                                        className="w-full sm:w-auto px-8 py-4 sm:py-3 md:py-4 bg-accent text-accent-900 font-bold text-base md:text-lg rounded-2xl sm:rounded-full shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing</>
                                        ) : (
                                            <><Search className="w-5 h-5" /> Analyze</>
                                        )}
                                    </button>
                                </form>
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
                                    <button
                                        onClick={() => {
                                            setResults({ seoAnalysis: null, aiVisibility: null, aiBotChecker: null, loadingSpeed: null, topKeywords: null, backlinkData: null, newBacklinks: null, poorBacklinks: null, rapidApiData: null });
                                            setWebsite('');
                                            setError(null);
                                        }}
                                        className="text-gray-600 hover:text-accent px-5 py-2.5 rounded-full border border-gray-200 hover:border-accent/30 transition-all flex items-center gap-2 font-semibold text-sm"
                                    >
                                        <Search className="w-4 h-4" />
                                        New Analysis
                                    </button>
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
                                        <SeoDashboard results={results} website={website} hasProAccess={hasProAccess} />
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

                                    {hasProAccess && (results.backlinkData || results.newBacklinks || results.poorBacklinks) && (
                                        <CardErrorBoundary name="Backlinks">
                                            <BacklinksCard
                                                backlinkData={results.backlinkData}
                                                newBacklinks={results.newBacklinks}
                                                poorBacklinks={results.poorBacklinks}
                                            />
                                        </CardErrorBoundary>
                                    )}

                                    {/* Dummy Pro Cards for Free Users */}
                                    {!hasProAccess && (
                                        <div className="space-y-8 mt-8">
                                            <DummyProCard 
                                                icon={Brain}
                                                title="AI SEO Readiness"
                                                description="Content optimization for AI systems"
                                                checkoutUrl={typeof window !== 'undefined' ? `https://checkout.dodopayments.com/buy/pdt_0NYlhH0CqhFDHJIr5v82N?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}` : '#'}
                                            />
                                            <DummyProCard 
                                                icon={TrendingUp}
                                                title="Top Search Keywords"
                                                description="Keyword rankings and search volumes"
                                                checkoutUrl={typeof window !== 'undefined' ? `https://checkout.dodopayments.com/buy/pdt_0NYlhH0CqhFDHJIr5v82N?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}` : '#'}
                                            />
                                            <DummyProCard 
                                                icon={Link2}
                                                title="Backlink Analysis"
                                                description="Backlink profile overview, new & toxic links"
                                                checkoutUrl={typeof window !== 'undefined' ? `https://checkout.dodopayments.com/buy/pdt_0NYlhH0CqhFDHJIr5v82N?quantity=1&redirect_url=${encodeURIComponent(window.location.origin + '/analyze?payment=success')}` : '#'}
                                            />
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
