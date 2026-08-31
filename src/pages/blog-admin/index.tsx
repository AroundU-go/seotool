import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminRoute from '@/components/AdminRoute';
import { useAuth } from '@/contexts/AuthContext';
import {
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    duplicateBlog,
    BlogRecord,
} from '@/services/supabaseClient';
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Save,
    X,
    BookOpen,
    Link2,
    Image as ImageIcon,
    FileText,
    Copy,
    ExternalLink,
    Search,
    Filter,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Maximize2,
    Minimize2,
    Columns,
    Sparkles,
    TrendingUp,
    Clock,
    Tag,
    Share2,
    Check,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Bold,
    Italic,
    Quote,
    Code,
    Table as TableIcon,
    CheckSquare,
    Sliders,
    Layers,
    RefreshCw,
    Globe,
    ChevronDown,
    Lock,
    Unlock,
    Info,
    Lightbulb,
    AlertTriangle,
    Rocket,
} from 'lucide-react';

interface BlogFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image_url: string;
    published: boolean;
    category: 'blog' | 'alternative' | 'guide' | 'case-study' | 'comparison';
    meta_title: string;
    meta_description: string;
    tags: string[];
    read_time: string;
    author_name: string;
}

const emptyFormData: BlogFormData = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    published: false,
    category: 'blog',
    meta_title: '',
    meta_description: '',
    tags: [],
    read_time: '3 min read',
    author_name: 'SEOzapp Team',
};

export default function BlogAdminDashboard() {
    const router = useRouter();
    const { user } = useAuth();

    // Data State
    const [blogs, setBlogs] = useState<BlogRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

    // View States
    const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
    const [editorLayout, setEditorLayout] = useState<'editor' | 'split' | 'preview'>('split');
    const [zenMode, setZenMode] = useState(false);
    const [displayStyle, setDisplayStyle] = useState<'cards' | 'table'>('cards');
    const [activeSidebarTab, setActiveSidebarTab] = useState<'seo' | 'settings'>('seo');

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'words'>('newest');

    // Editor Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<BlogFormData>(emptyFormData);
    const [slugLocked, setSlugLocked] = useState(true);
    const [focusKeyword, setFocusKeyword] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Modals
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkModalData, setLinkModalData] = useState({ url: '', text: '', newTab: true, nofollow: false });
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageModalData, setImageModalData] = useState({ url: '', alt: '', caption: '' });
    const [showTableModal, setShowTableModal] = useState(false);
    const [tableModalData, setTableModalData] = useState({ rows: 3, cols: 3, hasHeader: true });
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Show Toast Helper
    const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3500);
    }, []);

    // Fetch blogs from Supabase
    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllBlogs();
            setBlogs(data);
        } catch (err) {
            console.error('Failed to load blogs:', err);
            showToast('Failed to load articles from Supabase', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    // Local Storage Auto-Backup
    useEffect(() => {
        if (viewMode === 'editor' && (form.title || form.content)) {
            const backupKey = editingId ? `seozapp_blog_draft_${editingId}` : 'seozapp_blog_draft_new';
            localStorage.setItem(backupKey, JSON.stringify({ form, focusKeyword, timestamp: Date.now() }));
        }
    }, [form, focusKeyword, viewMode, editingId]);

    // Calculate Read Time and Word Count
    const contentStats = useMemo(() => {
        const text = form.content.replace(/<[^>]*>?/gm, '');
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return {
            words,
            chars,
            readTime: `${minutes} min read`,
        };
    }, [form.content]);

    // Sync calculated read_time
    useEffect(() => {
        if (form.read_time !== contentStats.readTime) {
            setForm(prev => ({ ...prev, read_time: contentStats.readTime }));
        }
    }, [contentStats.readTime, form.read_time]);

    // Live SEO Audit & Scoring
    const seoAudit = useMemo(() => {
        const kw = focusKeyword.trim().toLowerCase();
        const title = form.title.toLowerCase();
        const slug = form.slug.toLowerCase();
        const content = form.content.toLowerCase();
        const plainContent = form.content.replace(/<[^>]*>?/gm, '').toLowerCase();
        const metaDesc = form.meta_description.toLowerCase();

        let score = 0;
        const checks: { id: string; label: string; passed: boolean; tip: string; weight: number }[] = [];

        // 1. Title checks
        const titleHasKw = kw ? title.includes(kw) : false;
        const titleLengthGood = form.title.length >= 35 && form.title.length <= 65;
        checks.push({
            id: 'title_length',
            label: `Title length (${form.title.length}/60 chars)`,
            passed: titleLengthGood,
            tip: 'Ideal title length is 40-60 characters for maximum CTR on Google.',
            weight: 15,
        });

        if (kw) {
            checks.push({
                id: 'title_kw',
                label: `Focus keyword "${focusKeyword}" in Title`,
                passed: titleHasKw,
                tip: 'Include your main target keyword near the beginning of your title.',
                weight: 15,
            });
        }

        // 2. Slug check
        const slugClean = /^[a-z0-9-]+$/.test(form.slug) && form.slug.length > 3;
        checks.push({
            id: 'slug_format',
            label: 'Clean, URL-friendly slug',
            passed: slugClean,
            tip: 'Use lowercase alphanumeric characters with hyphens only.',
            weight: 10,
        });

        if (kw) {
            const slugHasKw = slug.includes(kw.replace(/\s+/g, '-'));
            checks.push({
                id: 'slug_kw',
                label: `Focus keyword in Slug`,
                passed: slugHasKw,
                tip: 'Having the focus keyword in the URL slug boosts ranking relevance.',
                weight: 10,
            });
        }

        // 3. Content Length Check
        const wordCount = contentStats.words;
        const contentLongEnough = wordCount >= 600;
        checks.push({
            id: 'content_length',
            label: `Article word count (${wordCount} words)`,
            passed: contentLongEnough,
            tip: 'Aim for at least 600-1500+ words to provide in-depth value and rank high.',
            weight: 15,
        });

        // 4. Keyword in First Paragraph & Headings
        if (kw) {
            const firstPara = plainContent.slice(0, 350);
            const inFirstPara = firstPara.includes(kw);
            checks.push({
                id: 'first_para_kw',
                label: 'Focus keyword in first 100 words',
                passed: inFirstPara,
                tip: 'Establish search intent immediately by mentioning your focus keyword early.',
                weight: 10,
            });

            // Headings check
            const hasHeadings = /<h[234][^>]*>.*?<\/h[234]>/i.test(form.content);
            checks.push({
                id: 'headings_present',
                label: 'Uses H2 / H3 subheadings',
                passed: hasHeadings,
                tip: 'Break content into clear sections using H2 and H3 subheadings for readers and AI parsers.',
                weight: 10,
            });

            // Keyword density
            const matches = kw ? (plainContent.match(new RegExp(kw, 'g')) || []).length : 0;
            const density = wordCount > 0 ? ((matches * kw.split(' ').length) / wordCount) * 100 : 0;
            const densityGood = density >= 0.6 && density <= 2.8;
            checks.push({
                id: 'kw_density',
                label: `Keyword density (${density.toFixed(1)}% - ${matches} occurrences)`,
                passed: densityGood,
                tip: 'Optimal keyword density is 1.0% to 2.5% to avoid keyword stuffing.',
                weight: 10,
            });
        }

        // 5. Meta Description Check
        const metaDescGood = form.meta_description.length >= 110 && form.meta_description.length <= 165;
        checks.push({
            id: 'meta_desc',
            label: `Meta Description (${form.meta_description.length}/155 chars)`,
            passed: metaDescGood,
            tip: 'Target 120-160 characters to avoid Google truncating your snippet.',
            weight: 10,
        });

        // 6. Media / Cover Image
        const hasImage = !!form.image_url.trim();
        checks.push({
            id: 'cover_image',
            label: 'Cover Image URL set',
            passed: hasImage,
            tip: 'Posts with high-quality cover images get 94% more views.',
            weight: 5,
        });

        // 7. Internal/External Links
        const linkCount = (form.content.match(/<a\s+[^>]*href=/gi) || []).length;
        checks.push({
            id: 'has_links',
            label: `Links included (${linkCount} found)`,
            passed: linkCount >= 2,
            tip: 'Include at least 2 internal or external authoritative references.',
            weight: 5,
        });

        // Calculate weighted score
        const totalWeight = checks.reduce((acc, c) => acc + c.weight, 0);
        const earnedWeight = checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0);
        score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

        return {
            score,
            checks,
            linkCount,
        };
    }, [focusKeyword, form, contentStats.words]);

    // Slug Generator
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (val: string) => {
        setHasUnsavedChanges(true);
        setForm(prev => ({
            ...prev,
            title: val,
            slug: slugLocked && !editingId ? generateSlug(val) : prev.slug,
            meta_title: prev.meta_title ? prev.meta_title : val,
        }));
    };

    // Auto-generate excerpt from content
    const handleAutoExcerpt = () => {
        const plain = form.content.replace(/<[^>]*>?/gm, '').trim();
        if (!plain) return;
        const excerpt = plain.slice(0, 155).trim() + (plain.length > 155 ? '...' : '');
        setForm(prev => ({ ...prev, excerpt, meta_description: prev.meta_description || excerpt }));
        showToast('Excerpt generated from content', 'info');
    };

    // Text Editor Insertion Helpers
    const insertIntoEditor = (before: string, after: string = '', defaultMiddle: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = form.content.substring(start, end) || defaultMiddle;
        const replacement = before + selectedText + after;
        const newContent = form.content.substring(0, start) + replacement + form.content.substring(end);

        setForm(prev => ({ ...prev, content: newContent }));
        setHasUnsavedChanges(true);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
        }, 10);
    };

    // Insert Rich Elements
    const handleApplyLink = () => {
        if (!linkModalData.url) return;
        const text = linkModalData.text.trim() || linkModalData.url;
        const target = linkModalData.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
        const rel = linkModalData.nofollow ? ' rel="nofollow noopener"' : '';
        const linkHtml = `<a href="${linkModalData.url}"${target || rel} class="text-accent hover:underline font-semibold">${text}</a>`;
        insertIntoEditor('', '', linkHtml);
        setShowLinkModal(false);
        setLinkModalData({ url: '', text: '', newTab: true, nofollow: false });
    };

    const handleApplyImage = () => {
        if (!imageModalData.url) return;
        const alt = imageModalData.alt.trim() || 'Blog illustration';
        const imgHtml = `\n<figure class="my-6">\n  <img src="${imageModalData.url}" alt="${alt}" class="rounded-xl w-full max-h-[480px] object-cover shadow-sm border border-gray-100" />\n  ${imageModalData.caption ? `<figcaption class="text-center text-xs text-gray-400 mt-2 italic">${imageModalData.caption}</figcaption>` : ''}\n</figure>\n`;
        insertIntoEditor('', '', imgHtml);
        setShowImageModal(false);
        setImageModalData({ url: '', alt: '', caption: '' });
    };

    const handleApplyTable = () => {
        const rows = Math.max(1, tableModalData.rows);
        const cols = Math.max(1, tableModalData.cols);
        let tableHtml = '\n<div class="overflow-x-auto my-6">\n<table class="w-full border-collapse border border-gray-200 text-sm">\n';

        if (tableModalData.hasHeader) {
            tableHtml += '  <thead>\n    <tr class="bg-gray-50 text-gray-900 font-bold">\n';
            for (let c = 1; c <= cols; c++) {
                tableHtml += `      <th class="border border-gray-200 px-4 py-2.5 text-left">Header ${c}</th>\n`;
            }
            tableHtml += '    </tr>\n  </thead>\n';
        }

        tableHtml += '  <tbody>\n';
        for (let r = 1; r <= rows; r++) {
            tableHtml += '    <tr class="hover:bg-gray-50/50">\n';
            for (let c = 1; c <= cols; c++) {
                tableHtml += `      <td class="border border-gray-200 px-4 py-2 text-gray-700">Data ${r}-${c}</td>\n`;
            }
            tableHtml += '    </tr>\n';
        }
        tableHtml += '  </tbody>\n</table>\n</div>\n';

        insertIntoEditor('', '', tableHtml);
        setShowTableModal(false);
    };

    // Auto Table of Contents Builder
    const handleGenerateTOC = () => {
        const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
        const matches = [...form.content.matchAll(headingRegex)];

        if (matches.length === 0) {
            showToast('No <h2> or <h3> headings found in content to generate TOC', 'info');
            return;
        }

        let tocHtml = '\n<div class="bg-blue-50/60 border border-blue-100 rounded-2xl p-6 my-6 shadow-sm">\n';
        tocHtml += '  <h4 class="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">📑 Table of Contents</h4>\n';
        tocHtml += '  <ul class="space-y-1.5 text-sm text-gray-600">\n';

        matches.forEach(m => {
            const level = m[1];
            const headingText = m[2].replace(/<[^>]*>?/gm, '').trim();
            const anchor = headingText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            const indentClass = level === '3' ? 'pl-4 text-xs' : 'font-medium';
            tocHtml += `    <li class="${indentClass}"><a href="#${anchor}" class="text-accent-600 hover:underline">→ ${headingText}</a></li>\n`;
        });

        tocHtml += '  </ul>\n</div>\n';
        insertIntoEditor('', '', tocHtml);
        showToast('Table of Contents added', 'success');
    };

    // Insert Callout Alert Card
    const handleInsertCallout = (type: 'tip' | 'info' | 'warning' | 'pro') => {
        const configs = {
            tip: {
                icon: '💡',
                title: 'Pro Tip',
                class: 'bg-green-50/80 border-green-200 text-green-800',
            },
            info: {
                icon: 'ℹ️',
                title: 'Key Takeaway',
                class: 'bg-blue-50/80 border-blue-200 text-blue-800',
            },
            warning: {
                icon: '⚠️',
                title: 'Important Warning',
                class: 'bg-amber-50/80 border-amber-200 text-amber-800',
            },
            pro: {
                icon: '🚀',
                title: 'Action Step',
                class: 'bg-purple-50/80 border-purple-200 text-purple-800',
            },
        };
        const c = configs[type];
        const html = `\n<div class="p-4 rounded-xl border ${c.class} my-5 flex items-start gap-3">\n  <span class="text-xl shrink-0">${c.icon}</span>\n  <div>\n    <p class="font-bold text-sm mb-1">${c.title}</p>\n    <p class="text-sm leading-relaxed">Add your actionable insight or tip here.</p>\n  </div>\n</div>\n`;
        insertIntoEditor('', '', html);
    };

    // Tag Handlers
    const handleAddTag = () => {
        const val = tagInput.trim();
        if (val && !form.tags.includes(val)) {
            setForm(prev => ({ ...prev, tags: [...prev.tags, val] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    // New Post Trigger
    const handleNewPost = () => {
        setForm(emptyFormData);
        setEditingId(null);
        setSlugLocked(true);
        setFocusKeyword('');
        setHasUnsavedChanges(false);
        setViewMode('editor');
    };

    // Edit Post Trigger
    const handleEditPost = (blog: BlogRecord) => {
        const tagsArray = Array.isArray(blog.tags)
            ? blog.tags
            : typeof blog.tags === 'string' && blog.tags.trim()
            ? blog.tags.split(',').map(s => s.trim())
            : [];

        setForm({
            title: blog.title || '',
            slug: blog.slug || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            image_url: blog.image_url || '',
            published: !!blog.published,
            category: (blog.category as any) || 'blog',
            meta_title: blog.meta_title || blog.title || '',
            meta_description: blog.meta_description || blog.excerpt || '',
            tags: tagsArray,
            read_time: blog.read_time || '3 min read',
            author_name: blog.author_name || 'SEOzapp Team',
        });
        setEditingId(blog.id || null);
        setSlugLocked(false);
        setFocusKeyword('');
        setHasUnsavedChanges(false);
        setViewMode('editor');
    };

    // Save or Publish to Supabase
    const handleSavePost = async (publishOverride?: boolean) => {
        if (!form.title.trim()) {
            showToast('Please enter a post title', 'error');
            return;
        }
        if (!form.slug.trim()) {
            showToast('Please enter a valid slug', 'error');
            return;
        }

        setSaving(true);
        const shouldPublish = publishOverride !== undefined ? publishOverride : form.published;

        const payload: Omit<BlogRecord, 'id' | 'created_at' | 'updated_at'> = {
            title: form.title.trim(),
            slug: form.slug.trim().toLowerCase(),
            excerpt: form.excerpt.trim(),
            content: form.content,
            image_url: form.image_url.trim() || undefined,
            published: shouldPublish,
            category: form.category,
            author_email: user?.email || 'go.aroundu@gmail.com',
            author_name: form.author_name.trim() || 'SEOzapp Team',
            meta_title: form.meta_title.trim() || form.title.trim(),
            meta_description: form.meta_description.trim() || form.excerpt.trim(),
            tags: form.tags,
            read_time: form.read_time,
        };

        try {
            if (editingId) {
                const res = await updateBlog(editingId, payload);
                if (res) {
                    showToast(shouldPublish ? 'Article updated and published live!' : 'Draft updated successfully!');
                    setForm(prev => ({ ...prev, published: shouldPublish }));
                    setLastSavedTime(new Date().toLocaleTimeString());
                    setHasUnsavedChanges(false);
                } else {
                    showToast('Failed to update article in Supabase', 'error');
                }
            } else {
                const res = await createBlog(payload);
                if (res) {
                    setEditingId(res.id || null);
                    setForm(prev => ({ ...prev, published: shouldPublish }));
                    setLastSavedTime(new Date().toLocaleTimeString());
                    setHasUnsavedChanges(false);
                    showToast(shouldPublish ? 'Article created and published live!' : 'New draft saved successfully!');
                } else {
                    showToast('Failed to create article in Supabase', 'error');
                }
            }
            fetchBlogs();
        } catch (err) {
            console.error('Error saving post:', err);
            showToast('Error connecting to Supabase database', 'error');
        } finally {
            setSaving(false);
        }
    };

    // 1-Click Quick Toggle Published/Draft from list
    const handleTogglePublish = async (blog: BlogRecord, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!blog.id) return;
        const newStatus = !blog.published;
        const res = await updateBlog(blog.id, { published: newStatus });
        if (res) {
            setBlogs(prev => prev.map(b => (b.id === blog.id ? { ...b, published: newStatus } : b)));
            showToast(newStatus ? `"${blog.title}" is now Live!` : `"${blog.title}" moved to Drafts.`);
        } else {
            showToast('Failed to update status', 'error');
        }
    };

    // Quick Duplicate
    const handleDuplicate = async (blog: BlogRecord, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!blog.id) return;
        showToast('Cloning article...', 'info');
        const duplicate = await duplicateBlog(blog.id);
        if (duplicate) {
            showToast(`Cloned "${blog.title}" as draft!`, 'success');
            fetchBlogs();
        } else {
            showToast('Failed to duplicate post', 'error');
        }
    };

    // Delete handler
    const handleDelete = async (id: string) => {
        const success = await deleteBlog(id);
        if (success) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            showToast('Article deleted successfully');
            setDeleteConfirmId(null);
            if (editingId === id) {
                setViewMode('list');
                setEditingId(null);
            }
        } else {
            showToast('Failed to delete post', 'error');
        }
    };

    // Copy live link to clipboard
    const handleCopyUrl = (blog: BlogRecord, e: React.MouseEvent) => {
        e.stopPropagation();
        const path = blog.category === 'alternative' ? `/alternatives/${blog.slug}` : `/blog/${blog.slug}`;
        const fullUrl = `https://seozapp.com${path}`;
        navigator.clipboard.writeText(fullUrl);
        showToast('Public link copied to clipboard!');
    };

    // Keyboard Shortcuts (Ctrl+S / Cmd+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (viewMode === 'editor') {
                    handleSavePost();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode, form, editingId]);

    // Filter & Sort Blogs List
    const filteredBlogs = useMemo(() => {
        return blogs
            .filter(blog => {
                // Search filter
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const titleMatch = blog.title.toLowerCase().includes(q);
                    const slugMatch = blog.slug.toLowerCase().includes(q);
                    const excerptMatch = (blog.excerpt || '').toLowerCase().includes(q);
                    if (!titleMatch && !slugMatch && !excerptMatch) return false;
                }
                // Category filter
                if (filterCategory !== 'all' && blog.category !== filterCategory) {
                    return false;
                }
                // Status filter
                if (filterStatus === 'published' && !blog.published) return false;
                if (filterStatus === 'draft' && blog.published) return false;

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') {
                    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                }
                if (sortBy === 'oldest') {
                    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                }
                if (sortBy === 'title') {
                    return a.title.localeCompare(b.title);
                }
                if (sortBy === 'words') {
                    const aWords = (a.content || '').split(/\s+/).length;
                    const bWords = (b.content || '').split(/\s+/).length;
                    return bWords - aWords;
                }
                return 0;
            });
    }, [blogs, searchQuery, filterCategory, filterStatus, sortBy]);

    // Dashboard Statistics Summary
    const stats = useMemo(() => {
        const total = blogs.length;
        const published = blogs.filter(b => b.published).length;
        const drafts = total - published;
        const alternatives = blogs.filter(b => b.category === 'alternative').length;
        const blogPosts = blogs.filter(b => !b.category || b.category === 'blog').length;
        const totalWords = blogs.reduce((acc, b) => acc + (b.content ? b.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0), 0);
        const avgWords = total > 0 ? Math.round(totalWords / total) : 0;
        return { total, published, drafts, alternatives, blogPosts, totalWords, avgWords };
    }, [blogs]);

    return (
        <AdminRoute>
            <Head>
                <title>Blog Studio & Publishing Dashboard | SEOzapp Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            {/* Global Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all animate-bounce bg-gray-900 text-white border-gray-800">
                    {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
                    {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
                    {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-accent shrink-0" />}
                    <span>{toastMessage.text}</span>
                </div>
            )}

            <div className="min-h-screen bg-[#f8f9fe] text-gray-900 flex flex-col font-sans">
                {/* ═══════════════════════════════════════════════
                    TOP GLOBAL NAVIGATION BAR
                   ═══════════════════════════════════════════════ */}
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (viewMode === 'editor' && hasUnsavedChanges) {
                                    if (confirm('You have unsaved changes. Return to dashboard list?')) {
                                        setViewMode('list');
                                    }
                                } else if (viewMode === 'editor') {
                                    setViewMode('list');
                                } else {
                                    router.push('/analyze');
                                }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-accent hover:bg-accent/5 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>{viewMode === 'editor' ? 'Articles List' : 'SEO Dashboard'}</span>
                        </button>

                        <div className="h-5 w-[1px] bg-gray-200 hidden sm:block" />

                        <div className="flex items-center gap-2">
                            <a href="https://seozapp.com" target="_blank" rel="noreferrer" className="font-black text-lg tracking-tight text-gray-900">
                                SEO<span className="text-accent">zapp</span>
                            </a>
                            <span className="bg-gradient-to-r from-accent/20 to-blue-500/20 text-accent-700 text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-accent/30">
                                Blog Studio
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {viewMode === 'editor' ? (
                            <>
                                {lastSavedTime && (
                                    <span className="text-xs text-gray-400 hidden md:flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5 text-green-500" /> Saved {lastSavedTime}
                                    </span>
                                )}

                                {/* Editor Layout Switcher */}
                                <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                                    <button
                                        onClick={() => { setEditorLayout('editor'); setZenMode(false); }}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                            editorLayout === 'editor' ? 'bg-white shadow-sm text-accent-700' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        Editor
                                    </button>
                                    <button
                                        onClick={() => { setEditorLayout('split'); setZenMode(false); }}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                                            editorLayout === 'split' ? 'bg-white shadow-sm text-accent-700' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        <Columns className="w-3 h-3" /> Split View
                                    </button>
                                    <button
                                        onClick={() => { setEditorLayout('preview'); setZenMode(false); }}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                                            editorLayout === 'preview' ? 'bg-white shadow-sm text-accent-700' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        <Eye className="w-3 h-3" /> Live Preview
                                    </button>
                                </div>

                                <button
                                    onClick={() => setZenMode(!zenMode)}
                                    title={zenMode ? 'Exit Zen Mode' : 'Distraction-Free Zen Mode'}
                                    className={`p-2 rounded-xl border transition-all ${
                                        zenMode ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {zenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>

                                <button
                                    onClick={() => handleSavePost(false)}
                                    disabled={saving}
                                    className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 font-bold text-sm rounded-xl border border-gray-300 shadow-sm transition-all flex items-center gap-1.5"
                                >
                                    <Save className="w-4 h-4" />
                                    <span className="hidden sm:inline">Save Draft</span>
                                </button>

                                <button
                                    onClick={() => handleSavePost(true)}
                                    disabled={saving}
                                    className="px-5 py-2 bg-accent text-accent-900 font-extrabold text-sm rounded-xl shadow-md shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] transition-all flex items-center gap-1.5"
                                >
                                    <Rocket className="w-4 h-4" />
                                    <span>{form.published ? 'Update Live' : 'Publish Post'}</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <a
                                    href="/blog"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-accent bg-white rounded-xl border border-gray-200 transition-colors"
                                >
                                    <Globe className="w-3.5 h-3.5 text-accent" />
                                    <span>View Blog</span>
                                    <ExternalLink className="w-3 h-3 text-gray-400" />
                                </a>

                                <button
                                    onClick={handleNewPost}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-900 font-extrabold text-sm rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] transition-all"
                                >
                                    <Plus className="w-4 h-4" strokeWidth={3} />
                                    <span>New Article</span>
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* ═══════════════════════════════════════════════
                    MAIN CONTENT AREA: LIST VIEW OR WRITING STUDIO
                   ═══════════════════════════════════════════════ */}
                {viewMode === 'list' ? (
                    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
                        {/* Hero & Metrics Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Content Publishing Studio</h1>
                            <p className="text-gray-500 mt-1 text-sm sm:text-base">
                                Write, optimize for search engines, and deploy high-converting blog posts and alternative guides.
                            </p>

                            {/* Stat Cards Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6">
                                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Articles</p>
                                    <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{stats.total}</p>
                                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                                        <BookOpen className="w-3 h-3 text-accent" /> Database records
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-wider text-green-600">Published</p>
                                    <p className="text-2xl sm:text-3xl font-black text-green-700 mt-1">{stats.published}</p>
                                    <div className="flex items-center gap-1 text-[11px] text-green-600 mt-1">
                                        <CheckCircle2 className="w-3 h-3" /> Live on website
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Drafts</p>
                                    <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{stats.drafts}</p>
                                    <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
                                        <EyeOff className="w-3 h-3" /> In progress
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Alternatives</p>
                                    <p className="text-2xl sm:text-3xl font-black text-purple-700 mt-1">{stats.alternatives}</p>
                                    <div className="flex items-center gap-1 text-[11px] text-purple-600 mt-1">
                                        <Sliders className="w-3 h-3" /> Comparison pages
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Blog Posts</p>
                                    <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">{stats.blogPosts}</p>
                                    <div className="flex items-center gap-1 text-[11px] text-blue-600 mt-1">
                                        <FileText className="w-3 h-3" /> Standard blogs
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Words</p>
                                    <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                                        {stats.totalWords > 1000 ? `${(stats.totalWords / 1000).toFixed(1)}k` : stats.totalWords}
                                    </p>
                                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                                        <TrendingUp className="w-3 h-3 text-accent" /> ~{stats.avgWords} words/post
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search, Filter & View Controls */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Search bar */}
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search articles by title, slug, excerpt..."
                                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Filters & Options */}
                            <div className="flex flex-wrap items-center gap-2.5">
                                {/* Category Filter */}
                                <select
                                    value={filterCategory}
                                    onChange={e => setFilterCategory(e.target.value)}
                                    className="px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-accent text-gray-700 cursor-pointer"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="blog">Blog Articles</option>
                                    <option value="alternative">Alternative / Comparisons</option>
                                    <option value="guide">In-Depth Guides</option>
                                    <option value="case-study">Case Studies</option>
                                </select>

                                {/* Status Filter */}
                                <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
                                    {(['all', 'published', 'draft'] as const).map(st => (
                                        <button
                                            key={st}
                                            onClick={() => setFilterStatus(st)}
                                            className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                                                filterStatus === st ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>

                                {/* Sort dropdown */}
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value as any)}
                                    className="px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-accent text-gray-700 cursor-pointer"
                                >
                                    <option value="newest">Sort: Newest First</option>
                                    <option value="oldest">Sort: Oldest First</option>
                                    <option value="title">Sort: Title (A-Z)</option>
                                    <option value="words">Sort: Word Count</option>
                                </select>

                                {/* View Switcher (Cards / Table) */}
                                <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                                    <button
                                        onClick={() => setDisplayStyle('cards')}
                                        title="Cards View"
                                        className={`p-1.5 rounded-lg ${displayStyle === 'cards' ? 'bg-white shadow-sm text-accent-700' : 'text-gray-400'}`}
                                    >
                                        <Layers className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDisplayStyle('table')}
                                        title="Table View"
                                        className={`p-1.5 rounded-lg ${displayStyle === 'table' ? 'bg-white shadow-sm text-accent-700' : 'text-gray-400'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Article Grid / Table List */}
                        {loading ? (
                            <div className="text-center py-24 bg-white rounded-3xl border border-gray-200">
                                <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-gray-600 font-semibold">Connecting to Supabase and fetching articles...</p>
                            </div>
                        ) : filteredBlogs.length > 0 ? (
                            displayStyle === 'cards' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredBlogs.map(blog => {
                                        const wordCount = (blog.content || '').replace(/<[^>]*>?/gm, '').split(/\s+/).length;
                                        const readTime = Math.max(1, Math.ceil(wordCount / 200));
                                        const isAlternative = blog.category === 'alternative';

                                        return (
                                            <div
                                                key={blog.id}
                                                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-accent/30 transition-all flex flex-col overflow-hidden group"
                                            >
                                                {/* Cover Image or Placeholder */}
                                                <div className="relative h-44 bg-gray-100 overflow-hidden">
                                                    {blog.image_url ? (
                                                        <img
                                                            src={blog.image_url}
                                                            alt={blog.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300">
                                                            <BookOpen className="w-10 h-10 mb-1 opacity-50" />
                                                            <span className="text-xs font-semibold">No cover image</span>
                                                        </div>
                                                    )}

                                                    {/* Top Badges */}
                                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                                                        <span
                                                            className={`text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${
                                                                blog.published
                                                                    ? 'bg-green-500/90 text-white'
                                                                    : 'bg-gray-800/80 text-gray-200'
                                                            }`}
                                                        >
                                                            {blog.published ? 'Live' : 'Draft'}
                                                        </span>
                                                        <span
                                                            className={`text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${
                                                                isAlternative
                                                                    ? 'bg-purple-600/90 text-white'
                                                                    : 'bg-blue-600/90 text-white'
                                                            }`}
                                                        >
                                                            {isAlternative ? 'Alternative' : 'Blog'}
                                                        </span>
                                                    </div>

                                                    {/* Quick Live Preview Action */}
                                                    {blog.published && (
                                                        <a
                                                            href={isAlternative ? `/alternatives/${blog.slug}` : `/blog/${blog.slug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-white text-gray-800 rounded-lg backdrop-blur-md shadow-sm transition-transform hover:scale-105"
                                                            title="View Live Article"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Content Details */}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {readTime} min read
                                                        </span>
                                                        <span>•</span>
                                                        <span>{wordCount} words</span>
                                                    </div>

                                                    <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-2 group-hover:text-accent transition-colors">
                                                        {blog.title}
                                                    </h3>

                                                    <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1">
                                                        {blog.excerpt || 'No excerpt summary provided.'}
                                                    </p>

                                                    <p className="text-[11px] font-mono text-gray-400 truncate mb-4 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                                        /{isAlternative ? 'alternatives' : 'blog'}/{blog.slug}
                                                    </p>

                                                    {/* Card Bottom Actions */}
                                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => handleTogglePublish(blog, e)}
                                                                className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                                                                    blog.published
                                                                        ? 'text-green-700 bg-green-50 hover:bg-green-100'
                                                                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                                                }`}
                                                                title={blog.published ? 'Unpublish to draft' : 'Publish live'}
                                                            >
                                                                {blog.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                            </button>

                                                            <button
                                                                onClick={(e) => handleCopyUrl(blog, e)}
                                                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                                                                title="Copy URL"
                                                            >
                                                                <Share2 className="w-4 h-4" />
                                                            </button>

                                                            <button
                                                                onClick={(e) => handleDuplicate(blog, e)}
                                                                className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-xl transition-colors"
                                                                title="Duplicate as draft"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>

                                                            <button
                                                                onClick={() => setDeleteConfirmId(blog.id!)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                                title="Delete article"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => handleEditPost(blog)}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-transform hover:scale-[1.02]"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                            <span>Edit</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Table View */
                                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50/80 text-gray-500 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4">Title & Slug</th>
                                                    <th className="px-4 py-4">Category</th>
                                                    <th className="px-4 py-4">Status</th>
                                                    <th className="px-4 py-4">Word Count</th>
                                                    <th className="px-4 py-4">Date</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredBlogs.map(blog => {
                                                    const wordCount = (blog.content || '').replace(/<[^>]*>?/gm, '').split(/\s+/).length;
                                                    const isAlternative = blog.category === 'alternative';

                                                    return (
                                                        <tr key={blog.id} className="hover:bg-gray-50/60 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-gray-900 text-sm hover:text-accent cursor-pointer" onClick={() => handleEditPost(blog)}>
                                                                    {blog.title}
                                                                </div>
                                                                <div className="text-xs text-gray-400 font-mono mt-0.5">
                                                                    /{isAlternative ? 'alternatives' : 'blog'}/{blog.slug}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                                    isAlternative ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                    {isAlternative ? 'Alternative' : 'Blog'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <button
                                                                    onClick={(e) => handleTogglePublish(blog, e)}
                                                                    className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                                                                        blog.published
                                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                    }`}
                                                                >
                                                                    {blog.published ? '● Live' : '○ Draft'}
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-4 text-xs text-gray-500 font-medium">
                                                                {wordCount} words
                                                            </td>
                                                            <td className="px-4 py-4 text-xs text-gray-400">
                                                                {new Date(blog.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleEditPost(blog)}
                                                                        className="p-1.5 text-gray-500 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleCopyUrl(blog, e)}
                                                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                                        title="Copy Link"
                                                                    >
                                                                        <Share2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleDuplicate(blog, e)}
                                                                        className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                                                        title="Duplicate"
                                                                    >
                                                                        <Copy className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteConfirmId(blog.id!)}
                                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed">
                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-gray-900">No articles found</h3>
                                <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                                    {searchQuery ? `No articles matching "${searchQuery}".` : 'Start publishing content to grow your search traffic.'}
                                </p>
                                <button
                                    onClick={handleNewPost}
                                    className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-900 font-extrabold text-sm rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create First Article
                                </button>
                            </div>
                        )}
                    </main>
                ) : (
                    /* ═══════════════════════════════════════════════
                        WRITING STUDIO & POSTING EDITOR
                       ═══════════════════════════════════════════════ */
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        {/* Editor Canvas Area */}
                        <div className={`flex-1 flex flex-col overflow-y-auto ${zenMode ? 'max-w-4xl mx-auto w-full px-4' : ''}`}>
                            <div className="p-4 sm:p-6 flex-1 flex flex-col">
                                {/* Title and Category Row */}
                                <div className="space-y-4 mb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            {(['blog', 'alternative', 'guide', 'case-study'] as const).map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                                                        form.category === cat
                                                            ? 'bg-accent text-accent-900 shadow-sm'
                                                            : 'bg-white text-gray-500 border border-gray-200 hover:border-accent/40'
                                                    }`}
                                                >
                                                    {cat === 'alternative' ? 'Alternative' : cat}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Word & Reading Time stats */}
                                        <div className="flex items-center gap-3 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-gray-200 w-fit">
                                            <span className="font-semibold">{contentStats.words} words</span>
                                            <span>•</span>
                                            <span>{contentStats.readTime}</span>
                                            <span>•</span>
                                            <span className="text-accent font-bold">SEO {seoAudit.score}%</span>
                                        </div>
                                    </div>

                                    {/* Article Title Input */}
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => handleTitleChange(e.target.value)}
                                        placeholder="Enter article title here..."
                                        className="w-full text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 placeholder:text-gray-300 bg-transparent border-none outline-none focus:ring-0 leading-tight"
                                    />

                                    {/* Slug & Permalinks Row */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3.5 py-2 rounded-xl border border-gray-200">
                                        <span className="font-mono text-gray-400">
                                            https://seozapp.com/{form.category === 'alternative' ? 'alternatives' : 'blog'}/
                                        </span>
                                        <input
                                            type="text"
                                            value={form.slug}
                                            disabled={slugLocked}
                                            onChange={e => {
                                                setHasUnsavedChanges(true);
                                                setForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }));
                                            }}
                                            placeholder="post-slug"
                                            className={`flex-1 font-mono font-bold bg-transparent outline-none ${
                                                slugLocked ? 'text-gray-600' : 'text-accent-700 bg-accent/10 px-2 py-0.5 rounded'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setSlugLocked(!slugLocked)}
                                            className="text-gray-400 hover:text-accent transition-colors"
                                            title={slugLocked ? 'Unlock custom slug editing' : 'Lock slug'}
                                        >
                                            {slugLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-accent" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Rich Writing Toolbar */}
                                <div className="bg-white border border-gray-200 rounded-2xl p-1.5 mb-4 shadow-sm flex flex-wrap items-center gap-1 sticky top-0 z-20">
                                    <button
                                        type="button"
                                        onClick={() => insertIntoEditor('<h2>', '</h2>', 'Heading 2')}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 font-extrabold text-xs"
                                        title="Heading 2"
                                    >
                                        <Heading2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertIntoEditor('<h3>', '</h3>', 'Heading 3')}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 font-extrabold text-xs"
                                        title="Heading 3"
                                    >
                                        <Heading3 className="w-4 h-4" />
                                    </button>

                                    <div className="h-4 w-[1px] bg-gray-200 mx-0.5" />

                                    <button
                                        type="button"
                                        onClick={() => insertIntoEditor('<strong>', '</strong>', 'bold text')}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                                        title="Bold"
                                    >
                                        <Bold className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertIntoEditor('<em>', '</em>', 'italic text')}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                                        title="Italic"
                                    >
                                        <Italic className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertIntoEditor('<code>', '</code>', 'code')}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                                        title="Inline Code"
                                    >
                                        <Code className="w-4 h-4" />
                                    </button>

                                    <div className="h-4 w-[1px] bg-gray-200 mx-0.5" />

                                    <button
                                        type="button"
                                        onClick={() => insertIntoEditor('\n<ul>\n  <li>', '</li>\n  <li>List item 2</li>\n</ul>\n', 'List item 1')}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                                        title="Bullet List"
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertIntoEditor('\n<ol>\n  <li>', '</li>\n  <li>Step 2</li>\n</ol>\n', 'Step 1')}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                                        title="Numbered List"
                                    >
                                        <ListOrdered className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertIntoEditor('\n<blockquote>', '</blockquote>\n', 'Insightful quote here...')}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                                        title="Blockquote"
                                    >
                                        <Quote className="w-4 h-4" />
                                    </button>

                                    <div className="h-4 w-[1px] bg-gray-200 mx-0.5" />

                                    <button
                                        type="button"
                                        onClick={() => setShowLinkModal(true)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-1 text-xs font-semibold"
                                        title="Insert Link"
                                    >
                                        <Link2 className="w-4 h-4 text-accent" />
                                        <span className="hidden sm:inline">Link</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowImageModal(true)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-1 text-xs font-semibold"
                                        title="Insert Image"
                                    >
                                        <ImageIcon className="w-4 h-4 text-accent" />
                                        <span className="hidden sm:inline">Image</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowTableModal(true)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-1 text-xs font-semibold"
                                        title="Insert Table"
                                    >
                                        <TableIcon className="w-4 h-4 text-accent" />
                                        <span className="hidden sm:inline">Table</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleGenerateTOC}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-1 text-xs font-semibold"
                                        title="Auto Generate Table of Contents from H2/H3 headings"
                                    >
                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                        <span className="hidden md:inline">Auto TOC</span>
                                    </button>

                                    <div className="h-4 w-[1px] bg-gray-200 mx-0.5 hidden lg:block" />

                                    {/* Callouts dropdown/buttons */}
                                    <div className="hidden lg:flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleInsertCallout('tip')}
                                            className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-[11px] font-bold rounded-lg"
                                            title="Insert Tip Callout"
                                        >
                                            💡 Tip Box
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleInsertCallout('info')}
                                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg"
                                            title="Insert Info Callout"
                                        >
                                            ℹ️ Info Box
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleInsertCallout('warning')}
                                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold rounded-lg"
                                            title="Insert Warning Box"
                                        >
                                            ⚠️ Warning
                                        </button>
                                    </div>
                                </div>

                                {/* Editor Layout Display */}
                                <div className="flex-1 grid grid-cols-1 gap-6 min-h-[500px]">
                                    {/* 1. Code / HTML Textarea */}
                                    {(editorLayout === 'editor' || editorLayout === 'split') && (
                                        <div className="flex flex-col flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="bg-gray-50/70 px-4 py-2 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500 font-mono">
                                                <span>HTML / Markdown Content Area</span>
                                                <span>Use Standard HTML or &lt;p&gt; tags</span>
                                            </div>
                                            <textarea
                                                ref={textareaRef}
                                                value={form.content}
                                                onChange={e => {
                                                    setHasUnsavedChanges(true);
                                                    setForm(prev => ({ ...prev, content: e.target.value }));
                                                }}
                                                placeholder="Write your article content here... You can use <h2>, <p>, <ul>, <li>, callouts, tables, and images."
                                                className="flex-1 w-full p-4 font-mono text-sm leading-relaxed text-gray-800 bg-white border-none outline-none resize-none focus:ring-0 min-h-[450px]"
                                            />
                                        </div>
                                    )}

                                    {/* 2. Split Preview / Live Article Preview */}
                                    {(editorLayout === 'preview' || editorLayout === 'split') && (
                                        <div className="flex flex-col flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="bg-gray-50/70 px-4 py-2 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500">
                                                <span className="font-bold flex items-center gap-1 text-gray-700">
                                                    <Eye className="w-3.5 h-3.5 text-accent" /> Live Article Preview
                                                </span>
                                                <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">
                                                    Pixel Perfect Renderer
                                                </span>
                                            </div>

                                            <div className="p-6 overflow-y-auto flex-1 max-h-[700px]">
                                                {/* Header Preview */}
                                                <div className="mb-6">
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{contentStats.readTime}</span>
                                                        <span>•</span>
                                                        <span>By {form.author_name || 'SEOzapp Team'}</span>
                                                    </div>

                                                    <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
                                                        {form.title || 'Untitled Article'}
                                                    </h1>

                                                    {form.excerpt && (
                                                        <p className="text-base text-gray-600 leading-relaxed font-normal mb-4">
                                                            {form.excerpt}
                                                        </p>
                                                    )}

                                                    {form.image_url && (
                                                        <div className="rounded-2xl overflow-hidden mb-6 border border-gray-100 max-h-72">
                                                            <img
                                                                src={form.image_url}
                                                                alt={form.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Body Preview with blog-prose styling */}
                                                {form.content.trim() ? (
                                                    <div
                                                        className="blog-prose"
                                                        dangerouslySetInnerHTML={{ __html: form.content }}
                                                    />
                                                ) : (
                                                    <div className="text-center py-16 text-gray-300 font-sans italic">
                                                        Start typing on the left to see your live preview here.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ═══════════════════════════════════════════════
                            RIGHT SIDEBAR: SEO AUDITOR & PUBLISHING SETTINGS
                           ═══════════════════════════════════════════════ */}
                        {!zenMode && (
                            <aside className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col overflow-y-auto">
                                {/* Tabs */}
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveSidebarTab('seo')}
                                        className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                                            activeSidebarTab === 'seo'
                                                ? 'border-accent text-accent-700 bg-accent/5'
                                                : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>SEO Audit ({seoAudit.score}%)</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveSidebarTab('settings')}
                                        className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                                            activeSidebarTab === 'settings'
                                                ? 'border-accent text-accent-700 bg-accent/5'
                                                : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        <Sliders className="w-3.5 h-3.5" />
                                        <span>Post Settings</span>
                                    </button>
                                </div>

                                <div className="p-5 space-y-6 flex-1">
                                    {activeSidebarTab === 'seo' ? (
                                        /* SEO ASSISTANT TAB */
                                        <div className="space-y-5">
                                            {/* SEO Score Meter */}
                                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-5 rounded-2xl shadow-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">SEO Score</p>
                                                        <h3 className="text-3xl font-black tracking-tight text-white mt-0.5">
                                                            {seoAudit.score}<span className="text-lg text-accent font-normal">/100</span>
                                                        </h3>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        seoAudit.score >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                        seoAudit.score >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                        'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}>
                                                        {seoAudit.score >= 80 ? 'Excellent' : seoAudit.score >= 50 ? 'Needs Work' : 'Poor'}
                                                    </div>
                                                </div>

                                                <div className="w-full bg-gray-700 h-2.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-accent transition-all duration-500 rounded-full"
                                                        style={{ width: `${seoAudit.score}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Focus Target Keyword */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                                                    Focus Target Keyword
                                                </label>
                                                <input
                                                    type="text"
                                                    value={focusKeyword}
                                                    onChange={e => setFocusKeyword(e.target.value)}
                                                    placeholder="e.g. best seo tools 2026"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                                                />
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                    The primary search query you want this post to rank for.
                                                </p>
                                            </div>

                                            {/* Live Checklist */}
                                            <div className="space-y-2.5">
                                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Optimization Checklist</p>
                                                {seoAudit.checks.map(check => (
                                                    <div
                                                        key={check.id}
                                                        className={`p-3 rounded-xl border text-xs transition-all ${
                                                            check.passed
                                                                ? 'bg-green-50/50 border-green-200/80 text-green-900'
                                                                : 'bg-gray-50 border-gray-200 text-gray-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 font-bold">
                                                            {check.passed ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                                            ) : (
                                                                <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
                                                            )}
                                                            <span>{check.label}</span>
                                                        </div>
                                                        {!check.passed && (
                                                            <p className="text-[11px] text-gray-500 mt-1 pl-6">
                                                                {check.tip}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        /* POST SETTINGS TAB */
                                        <div className="space-y-4">
                                            {/* Publishing Status */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                                                    Publishing Status
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, published: false }))}
                                                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                                                            !form.published ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'
                                                        }`}
                                                    >
                                                        Draft
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, published: true }))}
                                                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                                                            form.published ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-200'
                                                        }`}
                                                    >
                                                        Published (Live)
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Cover Image URL */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                                                    Cover Image URL
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.image_url}
                                                    onChange={e => {
                                                        setHasUnsavedChanges(true);
                                                        setForm(prev => ({ ...prev, image_url: e.target.value }));
                                                    }}
                                                    placeholder="https://images.unsplash.com/..."
                                                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                                                />
                                                {form.image_url && (
                                                    <div className="mt-2 relative rounded-xl overflow-hidden border border-gray-200 h-28 bg-gray-100">
                                                        <img src={form.image_url} alt="Cover preview" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                                                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black text-white rounded-md text-[10px]"
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Excerpt / Summary */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                                        Excerpt / Summary
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={handleAutoExcerpt}
                                                        className="text-[11px] text-accent font-bold hover:underline"
                                                    >
                                                        Auto-generate
                                                    </button>
                                                </div>
                                                <textarea
                                                    rows={3}
                                                    value={form.excerpt}
                                                    onChange={e => {
                                                        setHasUnsavedChanges(true);
                                                        setForm(prev => ({ ...prev, excerpt: e.target.value }));
                                                    }}
                                                    placeholder="Short summary displayed in blog listings and search cards..."
                                                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none leading-relaxed"
                                                />
                                            </div>

                                            {/* SEO Meta Title */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Meta Title</label>
                                                    <span className="text-[10px] text-gray-400 font-mono">{form.meta_title.length}/60</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={form.meta_title}
                                                    onChange={e => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
                                                    placeholder={form.title || 'SEO Meta Title'}
                                                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
                                                />
                                            </div>

                                            {/* SEO Meta Description */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Meta Description</label>
                                                    <span className="text-[10px] text-gray-400 font-mono">{form.meta_description.length}/155</span>
                                                </div>
                                                <textarea
                                                    rows={3}
                                                    value={form.meta_description}
                                                    onChange={e => setForm(prev => ({ ...prev, meta_description: e.target.value }))}
                                                    placeholder="Search snippet description for Google..."
                                                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none"
                                                />
                                            </div>

                                            {/* Tags */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                                                    Tags & Topics
                                                </label>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={tagInput}
                                                        onChange={e => setTagInput(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                                        placeholder="Add a tag..."
                                                        className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddTag}
                                                        className="px-3 py-1.5 bg-gray-900 text-white font-bold text-xs rounded-xl"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {form.tags.map(tag => (
                                                        <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[11px] font-medium px-2.5 py-1 rounded-lg">
                                                            #{tag}
                                                            <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-red-500">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Author */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                                                    Author Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.author_name}
                                                    onChange={e => setForm(prev => ({ ...prev, author_name: e.target.value }))}
                                                    placeholder="SEOzapp Team"
                                                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </aside>
                        )}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════
                MODAL: INSERT LINK
               ═══════════════════════════════════════════════ */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <Link2 className="w-5 h-5 text-accent" /> Insert Link
                            </h3>
                            <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Target URL</label>
                                <input
                                    type="text"
                                    value={linkModalData.url}
                                    onChange={e => setLinkModalData(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="https://example.com/target-page"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Anchor Text (Optional)</label>
                                <input
                                    type="text"
                                    value={linkModalData.text}
                                    onChange={e => setLinkModalData(prev => ({ ...prev, text: e.target.value }))}
                                    placeholder="Anchor text to display"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent"
                                />
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-gray-600 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={linkModalData.newTab}
                                        onChange={e => setLinkModalData(prev => ({ ...prev, newTab: e.target.checked }))}
                                        className="rounded text-accent focus:ring-accent"
                                    />
                                    <span>Open in new tab</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={linkModalData.nofollow}
                                        onChange={e => setLinkModalData(prev => ({ ...prev, nofollow: e.target.checked }))}
                                        className="rounded text-accent focus:ring-accent"
                                    />
                                    <span>Add rel=&quot;nofollow&quot;</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowLinkModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyLink}
                                className="px-5 py-2 text-sm font-bold bg-accent text-accent-900 rounded-xl shadow-md shadow-accent/20"
                            >
                                Insert Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════
                MODAL: INSERT IMAGE
               ═══════════════════════════════════════════════ */}
            {showImageModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-accent" /> Insert Image
                            </h3>
                            <button onClick={() => setShowImageModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={imageModalData.url}
                                    onChange={e => setImageModalData(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Alt Text (SEO Important)</label>
                                <input
                                    type="text"
                                    value={imageModalData.alt}
                                    onChange={e => setImageModalData(prev => ({ ...prev, alt: e.target.value }))}
                                    placeholder="Descriptive keywords for accessibility and SEO"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Caption (Optional)</label>
                                <input
                                    type="text"
                                    value={imageModalData.caption}
                                    onChange={e => setImageModalData(prev => ({ ...prev, caption: e.target.value }))}
                                    placeholder="Visible caption below image"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyImage}
                                className="px-5 py-2 text-sm font-bold bg-accent text-accent-900 rounded-xl shadow-md shadow-accent/20"
                            >
                                Insert Image
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════
                MODAL: INSERT TABLE
               ═══════════════════════════════════════════════ */}
            {showTableModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <TableIcon className="w-5 h-5 text-accent" /> Insert HTML Table
                            </h3>
                            <button onClick={() => setShowTableModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Rows</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="15"
                                        value={tableModalData.rows}
                                        onChange={e => setTableModalData(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Columns</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="8"
                                        value={tableModalData.cols}
                                        onChange={e => setTableModalData(prev => ({ ...prev, cols: parseInt(e.target.value) || 1 }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tableModalData.hasHeader}
                                    onChange={e => setTableModalData(prev => ({ ...prev, hasHeader: e.target.checked }))}
                                    className="rounded text-accent focus:ring-accent"
                                />
                                <span>Include Header Row</span>
                            </label>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowTableModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyTable}
                                className="px-5 py-2 text-sm font-bold bg-accent text-accent-900 rounded-xl shadow-md shadow-accent/20"
                            >
                                Generate Table
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════
                MODAL: DELETE CONFIRMATION
               ═══════════════════════════════════════════════ */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Delete this article?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            This action cannot be undone and will permanently remove this post from Supabase.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                className="px-4 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 flex-1"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminRoute>
    );
}
