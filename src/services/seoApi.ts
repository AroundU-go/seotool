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
    keyword?: string;
    position?: number;
    search_volume?: number;
    cpc?: number;
    url?: string;
    traffic?: number;
    traffic_percent?: number;
    [key: string]: unknown;
  }>;
  total_keywords?: number;
  [key: string]: unknown;
}

// ─── Direct API calls to VebAPI ─────────────────────────────
// The Vercel serverless proxy is unreliable, so we call VebAPI directly.

const VEBAPI_KEY = import.meta.env.VITE_VEBAPI_KEY || '';

const callVebApi = async <T,>(endpoint: string, website: string): Promise<T> => {
  const cleanWebsite = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const url = `https://vebapi.com/api/${endpoint}?website=${encodeURIComponent(cleanWebsite)}`;

  console.log('[VebAPI] Calling:', url);

  const response = await fetch(url, {
    headers: {
      'X-API-KEY': VEBAPI_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[VebAPI] Error:', response.status, errorData);
    throw new Error(errorData.error || `Request failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[VebAPI] Success for', endpoint);
  return data;
};

export async function analyzeSeo(website: string): Promise<SeoAnalysisResult> {
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
