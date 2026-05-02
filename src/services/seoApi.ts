export interface SeoAnalysisResult {
  meta_tags?: {
    title?: { content: string; length: number; issues: string[] };
    description?: { content: string; length: number; issues: string[] };
    keywords?: string;
  };
  headings?: {
    h1?: string[];
    h2?: string[];
    h3?: string[];
    issues: string[];
  };
  images?: {
    total: number;
    without_alt: number;
    issues: string[];
  };
  links?: {
    internal: number;
    external: number;
    broken?: number;
    issues: string[];
  };
  performance?: {
    score: number;
    issues: string[];
  };
  [key: string]: unknown;
}

export interface AiVisibilityResult {
  ai_friendly?: boolean;
  score?: number;
  issues?: string[];
  recommendations?: string[];
  [key: string]: unknown;
}

export interface AiBotCheckerResult {
  allowed_bots?: string[];
  blocked_bots?: string[];
  robots_txt_exists?: boolean;
  [key: string]: unknown;
}

export interface LoadingSpeedResult {
  summary?: {
    url?: string;
    performance_grade?: { score?: number; grade?: string };
    page_size_bytes?: number;
    page_size_kb?: number;
    load_time_ms?: number;
    ttfb_ms?: number;
    requests?: number;
    unique_domains?: number;
    main?: {
      http_code?: number;
      content_type?: string;
      redirect_count?: number;
      timings?: Record<string, number | null>;
    };
  };
  improve_page_performance?: Array<{
    grade?: string;
    suggestion?: string;
    detail?: string;
  }>;
  content_size_by_content_type?: Array<{
    content_type?: string;
    percent?: number;
    size_kb?: number;
  }>;
  requests_by_domain?: Array<{
    domain?: string;
    percent?: number;
    requests?: number;
  }>;
  response_codes?: Array<{
    response_code?: number;
    responses?: number;
  }>;
  [key: string]: unknown;
}

export interface TopKeywordsResult {
  keywords?: Array<{
    countryCode?: string;
    keyword?: string;
    topRankedUrl?: string;
    rank?: number;
    rankChange?: number;
    searchVolume?: number;
    rankingDifficulty?: number;
    seoClicks?: number;
    seoClicksChange?: number;
    totalMonthlyClicks?: number;
    broadCostPerClick?: number | null;
    phraseCostPerClick?: number | null;
    exactCostPerClick?: number | null;
    paidCompetitors?: number;
    rankingHomepages?: number;
    [key: string]: unknown;
  }>;
  total_keywords?: number;
  [key: string]: unknown;
}

// ─── Direct API calls to VebAPI ─────────────────────────────
// The Vercel serverless proxy is unreliable, so we call VebAPI directly.

const VEBAPI_KEY = process.env.NEXT_PUBLIC_VEBAPI_KEY || '';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callVebApi = async <T,>(endpoint: string, website: string): Promise<T> => {
  // Strip any spaces from the URL (user may accidentally paste with spaces)
  const cleanWebsite = website.replace(/\s+/g, '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const url = `https://vebapi.com/api/${endpoint}?website=${encodeURIComponent(cleanWebsite)}`;

  console.log('[VebAPI] Calling:', url, 'Key present:', !!VEBAPI_KEY);

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': VEBAPI_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorData: any = {};
      try { errorData = JSON.parse(errorText); } catch { errorData = { raw: errorText }; }
      console.error(`[VebAPI] Error ${response.status} for ${endpoint}:`, errorData);
      throw new Error(errorData.error || errorData.message || `VebAPI ${endpoint} failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('[VebAPI] Success for', endpoint);
    return data;
  } catch (err: any) {
    // Distinguish between network errors and API errors
    if (err.message?.includes('VebAPI')) {
      throw err; // Already formatted
    }
    console.error(`[VebAPI] Network/fetch error for ${endpoint}:`, err.message || err);
    throw new Error(`VebAPI ${endpoint}: ${err.message || 'Network error'}`);
  }
};

export async function analyzeSeo(website: string): Promise<SeoAnalysisResult> {
  // Add a small delay before the on-page SEO call to reduce 500 errors from VebAPI
  await delay(500);
  return callVebApi<SeoAnalysisResult>("seo/analyze/v2", website);
}

export async function checkAiVisibility(website: string): Promise<AiVisibilityResult> {
  return callVebApi<AiVisibilityResult>("seo/ai-visibility-checker/v2", website);
}

export async function checkAiBots(website: string): Promise<AiBotCheckerResult> {
  return callVebApi<AiBotCheckerResult>("seo/aiseochecker", website);
}

export async function checkLoadingSpeed(website: string): Promise<LoadingSpeedResult> {
  return callVebApi<LoadingSpeedResult>("seo/loadingspeeddata/v2", website);
}

export async function checkTopKeywords(website: string): Promise<TopKeywordsResult> {
  return callVebApi<TopKeywordsResult>("seo/topsearchkeywords", website);
}

// ─── Backlink interfaces & API calls ────────────────────────

export interface BacklinkDataResult {
  backlinks?: Array<{
    source_url?: string;
    target_url?: string;
    anchor_text?: string;
    domain_authority?: number;
    page_authority?: number;
    nofollow?: boolean;
    first_seen?: string;
    last_seen?: string;
    [key: string]: unknown;
  }>;
  total_backlinks?: number;
  referring_domains?: number;
  [key: string]: unknown;
}

export interface NewBacklinksResult {
  new_backlinks?: Array<{
    source_url?: string;
    target_url?: string;
    anchor_text?: string;
    domain_authority?: number;
    first_seen?: string;
    nofollow?: boolean;
    [key: string]: unknown;
  }>;
  total?: number;
  [key: string]: unknown;
}

export interface PoorBacklinksResult {
  poor_backlinks?: Array<{
    source_url?: string;
    target_url?: string;
    anchor_text?: string;
    spam_score?: number;
    reason?: string;
    [key: string]: unknown;
  }>;
  total?: number;
  [key: string]: unknown;
}

export async function getBacklinkData(website: string): Promise<BacklinkDataResult> {
  return callVebApi<BacklinkDataResult>("seo/backlinkdata", website);
}

export async function getNewBacklinks(website: string): Promise<NewBacklinksResult> {
  return callVebApi<NewBacklinksResult>("seo/newbacklinks", website);
}

export async function getPoorBacklinks(website: string): Promise<PoorBacklinksResult> {
  return callVebApi<PoorBacklinksResult>("seo/poorbacklinks", website);
}

// ─── Direct API call to RapidAPI ────────────────────────────

export interface RapidApiDataResult {
  url?: string;
  pageSize?: number;
  wordCount?: number;
  language?: string;
  openGraph?: {
    "og:type"?: string;
    "og:url"?: string;
    "og:title"?: string;
    "og:description"?: string;
    "og:site_name"?: string;
    "og:image"?: string;
    [key: string]: unknown;
  };
  twitterCard?: {
    "twitter:card"?: string;
    "twitter:site"?: string;
    "twitter:title"?: string;
    "twitter:description"?: string;
    "twitter:image"?: string;
    [key: string]: unknown;
  };
  jsonLd?: unknown[];
  seoScore?: {
    score?: number;
    maxPoints?: number;
    earnedPoints?: number;
    checks?: Array<{
      name?: string;
      pass?: boolean;
      weight?: number;
    }>;
  };
  [key: string]: unknown;
}

export async function fetchRapidApiData(website: string): Promise<RapidApiDataResult> {
  // Website might not have https:// so we add it safely for the URL param
  const cleanWebsite = website.replace(/\s+/g, '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const targetUrl = `https://${cleanWebsite}`;

  const url = `https://seo-analyzer8.p.rapidapi.com/analyze?url=${encodeURIComponent(targetUrl)}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '98362066a9mshb063c9826e63b5ap157910jsn374d8b77e6f2',
      'x-rapidapi-host': 'seo-analyzer8.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`RapidAPI request failed: ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[RapidAPI] Error:', error);
    throw error;
  }
}

