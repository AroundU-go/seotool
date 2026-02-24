import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file.');
}

// ─── Auth helpers ────────────────────────────────────────────

export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session, session?.user ?? null);
  });
}

// ─── Database helpers ────────────────────────────────────────

export interface SeoAnalysisRecord {
  id?: string;
  user_id?: string;
  guest_email?: string;
  website: string;
  seo_data: unknown;
  ai_visibility_data: unknown;
  ai_bot_data: unknown;
  loading_speed_data: unknown;
  created_at?: string;
}

export async function saveAnalysis(
  data: Omit<SeoAnalysisRecord, 'id' | 'created_at'>,
): Promise<SeoAnalysisRecord | null> {
  if (!isSupabaseConfigured) {
    console.warn('[saveAnalysis] Supabase not configured');
    return null;
  }
  if (!data.user_id && !data.guest_email) {
    console.warn('[saveAnalysis] No user_id or guest_email provided, skipping save');
    return null;
  }
  console.log('[saveAnalysis] Saving for user:', data.user_id, 'website:', data.website);
  const { data: result, error } = await supabase
    .from('seo_analyses')
    .insert([data])
    .select()
    .maybeSingle();

  if (error) {
    console.error('[saveAnalysis] Error:', error.message, error.details, error.hint);
    return null;
  }

  console.log('[saveAnalysis] Saved successfully, id:', result?.id);
  return result;
}

export async function getRecentAnalyses(limit = 10): Promise<SeoAnalysisRecord[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('seo_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }

  return data || [];
}

export async function getUserAnalyses(userId: string, limit = 20): Promise<SeoAnalysisRecord[]> {
  if (!isSupabaseConfigured) {
    console.warn('[getUserAnalyses] Supabase not configured');
    return [];
  }
  console.log('[getUserAnalyses] Fetching for user:', userId);
  const { data, error } = await supabase
    .from('seo_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getUserAnalyses] Error:', error.message, error.details, error.hint);
    return [];
  }

  console.log('[getUserAnalyses] Found', data?.length || 0, 'records');
  return data || [];
}

export async function getUserAnalysesByEmail(email: string, limit = 20): Promise<SeoAnalysisRecord[]> {
  if (!isSupabaseConfigured) {
    console.warn('[getUserAnalysesByEmail] Supabase not configured');
    return [];
  }
  console.log('[getUserAnalysesByEmail] Fetching for email:', email);
  const { data, error } = await supabase
    .from('seo_analyses')
    .select('*')
    .eq('guest_email', email)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getUserAnalysesByEmail] Error:', error.message, error.details, error.hint);
    return [];
  }

  console.log('[getUserAnalysesByEmail] Found', data?.length || 0, 'records');
  return data || [];
}

export async function getAnalysesByWebsite(website: string, limit = 5): Promise<SeoAnalysisRecord[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('seo_analyses')
    .select('*')
    .eq('website', website)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching analyses by website:', error);
    return [];
  }

  return data || [];
}

// ─── Pro status helpers ──────────────────────────────────────

export interface ProStatusResult {
  isPro: boolean;
  proExpired: boolean;
}

export async function getProStatus(userId: string): Promise<ProStatusResult> {
  if (!isSupabaseConfigured) return { isPro: false, proExpired: false };
  const { data, error } = await supabase
    .from('profiles')
    .select('is_pro, pro_since')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching pro status:', error);
    return { isPro: false, proExpired: false };
  }

  if (data?.is_pro === true && data?.pro_since) {
    const proSince = new Date(data.pro_since);
    const now = new Date();
    const diffDays = (now.getTime() - proSince.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      return { isPro: false, proExpired: true };
    }
    return { isPro: true, proExpired: false };
  }

  return { isPro: data?.is_pro === true, proExpired: false };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// ─── Free audit tracking ─────────────────────────────────────

export async function getAuditCountByEmail(email: string): Promise<number> {
  if (email === 'go.aroundu@gmail.com') return 0; // Admin bypass
  if (!isSupabaseConfigured) return 0;
  console.log('[getAuditCount] Checking for email:', email);
  const { count, error } = await supabase
    .from('free_audits')
    .select('*', { count: 'exact', head: true })
    .eq('email', email);

  if (error) {
    console.error('[getAuditCount] Error:', error.message, error.details);
    return 0;
  }

  console.log('[getAuditCount] Count:', count);
  return count ?? 0;
}

export async function recordFreeAudit(email: string, url: string): Promise<boolean> {
  if (email === 'go.aroundu@gmail.com') return true; // Admin bypass
  if (!isSupabaseConfigured) return false;
  console.log('[recordFreeAudit] Recording for email:', email, 'url:', url);
  const { error } = await supabase
    .from('free_audits')
    .insert([{ email, url }]);

  if (error) {
    console.error('[recordFreeAudit] Error:', error.message, error.details);
    return false;
  }

  return true;
}

// ─── Blog helpers ────────────────────────────────────────────

export interface BlogRecord {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  author_email: string;
  created_at?: string;
  updated_at?: string;
}

export async function getPublishedBlogs(): Promise<BlogRecord[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getPublishedBlogs] Error:', error.message);
    return [];
  }
  return data || [];
}

export async function getBlogBySlug(slug: string): Promise<BlogRecord | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('[getBlogBySlug] Error:', error.message);
    return null;
  }
  return data;
}

export async function getAllBlogs(): Promise<BlogRecord[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getAllBlogs] Error:', error.message);
    return [];
  }
  return data || [];
}

export async function createBlog(blog: Omit<BlogRecord, 'id' | 'created_at' | 'updated_at'>): Promise<BlogRecord | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('blogs')
    .insert([blog])
    .select()
    .maybeSingle();

  if (error) {
    console.error('[createBlog] Error:', error.message);
    return null;
  }
  return data;
}

export async function updateBlog(id: string, updates: Partial<BlogRecord>): Promise<BlogRecord | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('blogs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[updateBlog] Error:', error.message);
    return null;
  }
  return data;
}

export async function deleteBlog(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteBlog] Error:', error.message);
    return false;
  }
  return true;
}
