import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ilmmqkfcotrmjjqbawhg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbW1xa2Zjb3RybWpqcWJhd2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTYwODQsImV4cCI6MjA4Njc5MjA4NH0.WiC981b2OZghhJ4Wj7rBSSN4k2dpGla-mG8EfQwqteE';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in a .env file.');
}

// ─── Redirect URL helper ─────────────────────────────────────
// The site may redirect between seozapp.com and www.seozapp.com.
// Supabase requires the redirect URL to match its allowlist exactly.
// We normalize to the canonical domain to avoid mismatches.
function getRedirectBase(): string {
  if (typeof window === 'undefined') return 'https://seozapp.com';
  // Always use the canonical origin (without www) to match Supabase config
  const origin = window.location.origin;
  return origin.replace('://www.', '://');
}

// ─── Auth helpers ────────────────────────────────────────────

export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getRedirectBase()}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signInWithOtp(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getRedirectBase()}/auth/callback`,
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
  top_keywords_data?: unknown;
  backlink_data?: unknown;
  new_backlinks_data?: unknown;
  poor_backlinks_data?: unknown;
  rapid_api_data?: unknown;
  created_at?: string;
}

export async function saveAnalysis(
  data: Omit<SeoAnalysisRecord, 'id' | 'created_at'>,
): Promise<SeoAnalysisRecord | null> {
  if (!isSupabaseConfigured) {
    console.warn('[saveAnalysis] Supabase not configured');
    return null;
  }

  // Always ensure guest_email is populated for reliable email-based lookups.
  // If we have a user_id but no guest_email, resolve email from the current session.
  if (!data.guest_email) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionEmail = sessionData?.session?.user?.email;
      if (sessionEmail) {
        data.guest_email = sessionEmail.trim().toLowerCase();
      }
    } catch (e) {
      console.warn('[saveAnalysis] Could not resolve email from session:', e);
    }
  }

  // Normalize guest_email
  if (data.guest_email) {
    data.guest_email = data.guest_email.trim().toLowerCase();
  }

  if (!data.user_id && !data.guest_email) {
    console.warn('[saveAnalysis] No user_id or guest_email provided, skipping save');
    return null;
  }

  console.log('[saveAnalysis] Saving for user:', data.user_id, 'email:', data.guest_email, 'website:', data.website);

  // First attempt: insert with user_id
  const { data: result, error } = await supabase
    .from('seo_analyses')
    .insert([data])
    .select()
    .maybeSingle();

  if (!error) {
    console.log('[saveAnalysis] Saved successfully, id:', result?.id);
    return result;
  }

  // If insert failed (likely FK constraint on user_id → profiles.id), retry without user_id
  console.warn('[saveAnalysis] First insert failed:', error.message, '— retrying without user_id');
  const dataWithoutUserId = { ...data, user_id: undefined };
  // Remove undefined keys so Supabase doesn't try to insert them
  delete (dataWithoutUserId as any).user_id;

  const { data: retryResult, error: retryError } = await supabase
    .from('seo_analyses')
    .insert([dataWithoutUserId])
    .select()
    .maybeSingle();

  if (retryError) {
    console.error('[saveAnalysis] Retry also failed:', retryError.message, retryError.details, retryError.hint);
    return null;
  }

  console.log('[saveAnalysis] Saved successfully on retry (without user_id), id:', retryResult?.id);
  return retryResult;
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

/**
 * Unified function: fetch analyses by user_id OR guest_email in one query.
 * This ensures we find all records regardless of how they were originally saved.
 * Falls back to individual queries if the OR query fails.
 */
export async function getUserAnalysesByEmailOrId(
  userId: string | undefined,
  email: string | undefined,
  limit = 20,
): Promise<SeoAnalysisRecord[]> {
  if (!isSupabaseConfigured) {
    console.warn('[getUserAnalysesByEmailOrId] Supabase not configured');
    return [];
  }

  // Normalize inputs
  const cleanUserId = userId?.trim() || undefined;
  const cleanEmail = email?.trim().toLowerCase() || undefined;

  if (!cleanUserId && !cleanEmail) {
    console.warn('[getUserAnalysesByEmailOrId] No userId or email provided');
    return [];
  }

  console.log('[getUserAnalysesByEmailOrId] Fetching for userId:', cleanUserId, 'email:', cleanEmail);

  // Build an OR filter covering both lookup methods
  const orParts: string[] = [];
  if (cleanUserId) orParts.push(`user_id.eq.${cleanUserId}`);
  if (cleanEmail) orParts.push(`guest_email.eq.${cleanEmail}`);

  try {
    const { data, error } = await supabase
      .from('seo_analyses')
      .select('*')
      .or(orParts.join(','))
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getUserAnalysesByEmailOrId] OR query error:', error.message, error.details, error.hint);
      // Fallback: try individual queries
      return await fallbackIndividualQueries(cleanUserId, cleanEmail, limit);
    }

    // Deduplicate by id (in case both filters matched the same row)
    const seen = new Set<string>();
    const unique = (data || []).filter(r => {
      if (seen.has(r.id!)) return false;
      seen.add(r.id!);
      return true;
    });

    console.log('[getUserAnalysesByEmailOrId] Found', unique.length, 'records');
    return unique;
  } catch (err) {
    console.error('[getUserAnalysesByEmailOrId] Unexpected error:', err);
    return await fallbackIndividualQueries(cleanUserId, cleanEmail, limit);
  }
}

/**
 * Fallback: query by user_id and guest_email separately, then merge.
 */
async function fallbackIndividualQueries(
  userId: string | undefined,
  email: string | undefined,
  limit: number,
): Promise<SeoAnalysisRecord[]> {
  console.log('[fallbackIndividualQueries] Trying individual queries...');
  const results: SeoAnalysisRecord[] = [];

  if (userId) {
    try {
      const { data } = await supabase
        .from('seo_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (data) results.push(...data);
    } catch (e) {
      console.error('[fallbackIndividualQueries] user_id query failed:', e);
    }
  }

  if (email) {
    try {
      const { data } = await supabase
        .from('seo_analyses')
        .select('*')
        .eq('guest_email', email)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (data) results.push(...data);
    } catch (e) {
      console.error('[fallbackIndividualQueries] guest_email query failed:', e);
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  const unique = results.filter(r => {
    if (seen.has(r.id!)) return false;
    seen.add(r.id!);
    return true;
  });

  // Sort by created_at descending
  unique.sort((a, b) =>
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  console.log('[fallbackIndividualQueries] Found', unique.length, 'records');
  return unique.slice(0, limit);
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
  paymentType: string;
  proAuditCount: number;
}

export async function getProStatus(userId: string): Promise<ProStatusResult> {
  if (!isSupabaseConfigured) return { isPro: false, proExpired: false, paymentType: '', proAuditCount: 0 };
  const { data, error } = await supabase
    .from('profiles')
    .select('is_pro, pro_since, payment_type, pro_audit_count')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching pro status:', error);
    return { isPro: false, proExpired: false, paymentType: '', proAuditCount: 0 };
  }

  const paymentType = data?.payment_type || 'one_time';
  const proAuditCount = data?.pro_audit_count ?? 0;

  if (data?.is_pro === true && data?.pro_since) {
    // Only check expiry for subscription users (30 days)
    if (paymentType === 'subscription') {
      const proSince = new Date(data.pro_since);
      const now = new Date();
      const diffDays = (now.getTime() - proSince.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 30) {
        return { isPro: false, proExpired: true, paymentType, proAuditCount };
      }
    }
    // One-time payment never expires
    return { isPro: true, proExpired: false, paymentType, proAuditCount };
  }

  return { isPro: data?.is_pro === true, proExpired: false, paymentType, proAuditCount };
}

export async function incrementProAuditCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  // Use RPC or manual increment
  const { data: profile } = await supabase
    .from('profiles')
    .select('pro_audit_count')
    .eq('id', userId)
    .maybeSingle();

  const currentCount = (profile?.pro_audit_count ?? 0) + 1;
  const { error } = await supabase
    .from('profiles')
    .update({ pro_audit_count: currentCount })
    .eq('id', userId);

  if (error) {
    console.error('[incrementProAuditCount] Error:', error);
  }
  return currentCount;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getRedirectBase()}/auth/callback`,
    },
  });
  return { data, error };
}

// ─── Free audit tracking ─────────────────────────────────────

/**
 * Count how many analyses this email already has in seo_analyses.
 * Uses the actual analysis table (not a separate tracking table)
 * so the count is always accurate.
 */
export async function getAnalysisCountByEmail(email: string): Promise<number> {
  if (email === 'go.aroundu@gmail.com') return 0; // Admin bypass
  if (!isSupabaseConfigured) return 999; // Block if Supabase is down
  const cleanEmail = email.trim().toLowerCase();
  console.log('[getAnalysisCountByEmail] Checking for email:', cleanEmail);
  const { count, error } = await supabase
    .from('seo_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('guest_email', cleanEmail);

  if (error) {
    console.error('[getAnalysisCountByEmail] Error:', error.message, error.details);
    return 999; // Block analysis on error — fail closed
  }

  console.log('[getAnalysisCountByEmail] Count:', count);
  return count ?? 0;
}

// ─── Blog helpers ────────────────────────────────────────────

export interface BlogRecord {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  image_url?: string;
  author_email: string;
  author_name?: string;
  category?: 'blog' | 'alternative' | 'guide' | 'case-study' | 'comparison';
  meta_title?: string;
  meta_description?: string;
  tags?: string[] | string;
  read_time?: string;
  featured?: boolean;
  views_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Filter out undefined values to prevent Supabase payload errors
 */
function sanitizeBlogPayload(payload: Record<string, any>) {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
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
  const cleanPayload = sanitizeBlogPayload(blog);

  // First try inserting with all fields
  const { data, error } = await supabase
    .from('blogs')
    .insert([cleanPayload])
    .select()
    .maybeSingle();

  if (!error) {
    return data;
  }

  console.warn('[createBlog] Standard insert failed:', error.message, '— retrying with basic columns');

  // Fallback: If table does not yet have optional columns like meta_title, tags, etc.
  const fallbackPayload: Record<string, any> = {
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt || '',
    content: blog.content || '',
    published: !!blog.published,
    author_email: blog.author_email || 'go.aroundu@gmail.com',
  };
  if (blog.image_url) fallbackPayload.image_url = blog.image_url;
  if (blog.category) fallbackPayload.category = blog.category;

  const { data: retryData, error: retryError } = await supabase
    .from('blogs')
    .insert([fallbackPayload])
    .select()
    .maybeSingle();

  if (retryError) {
    console.error('[createBlog] Retry also failed:', retryError.message);
    return null;
  }
  return retryData;
}

export async function updateBlog(id: string, updates: Partial<BlogRecord>): Promise<BlogRecord | null> {
  if (!isSupabaseConfigured) return null;
  const cleanPayload = sanitizeBlogPayload({
    ...updates,
    updated_at: new Date().toISOString()
  });

  const { data, error } = await supabase
    .from('blogs')
    .update(cleanPayload)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (!error) {
    return data;
  }

  console.warn('[updateBlog] Standard update failed:', error.message, '— retrying with basic columns');

  // Fallback: strip extra columns if column error occurs
  const fallbackPayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (updates.title !== undefined) fallbackPayload.title = updates.title;
  if (updates.slug !== undefined) fallbackPayload.slug = updates.slug;
  if (updates.excerpt !== undefined) fallbackPayload.excerpt = updates.excerpt;
  if (updates.content !== undefined) fallbackPayload.content = updates.content;
  if (updates.published !== undefined) fallbackPayload.published = updates.published;
  if (updates.image_url !== undefined) fallbackPayload.image_url = updates.image_url;
  if (updates.category !== undefined) fallbackPayload.category = updates.category;

  const { data: retryData, error: retryError } = await supabase
    .from('blogs')
    .update(fallbackPayload)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (retryError) {
    console.error('[updateBlog] Retry also failed:', retryError.message);
    return null;
  }
  return retryData;
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

export async function duplicateBlog(id: string): Promise<BlogRecord | null> {
  if (!isSupabaseConfigured) return null;
  const { data: original, error: fetchErr } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !original) {
    console.error('[duplicateBlog] Could not fetch original:', fetchErr?.message);
    return null;
  }

  const timestamp = Date.now().toString().slice(-4);
  const newSlug = `${original.slug}-copy-${timestamp}`;
  const newTitle = `${original.title} (Copy)`;

  const duplicateData: Omit<BlogRecord, 'id' | 'created_at' | 'updated_at'> = {
    ...original,
    title: newTitle,
    slug: newSlug,
    published: false, // Always save duplicate as draft
  };
  delete (duplicateData as any).id;
  delete (duplicateData as any).created_at;
  delete (duplicateData as any).updated_at;

  return await createBlog(duplicateData);
}

export async function getPublishedBlogsByCategory(category: 'blog' | 'alternative' | 'guide' | 'case-study' | 'comparison'): Promise<BlogRecord[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getPublishedBlogsByCategory] Error:', error.message);
    return [];
  }
  return data || [];
}
