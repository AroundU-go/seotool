import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, BookOpen, Link2, Sparkles } from 'lucide-react';
import { getAllBlogs, createBlog, updateBlog, deleteBlog, BlogRecord } from '@/services/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface BlogForm {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image_url?: string;
    published: boolean;
    category: 'blog' | 'alternative';
}

const emptyForm: BlogForm = { title: '', slug: '', excerpt: '', content: '', image_url: '', published: false, category: 'blog' };

export default function AdminPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [blogs, setBlogs] = useState<BlogRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<BlogForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [filterCategory, setFilterCategory] = useState<'all' | 'blog' | 'alternative'>('all');

    const handleInsertLink = () => {
        const url = prompt('Enter link URL (e.g., https://example.com):');
        if (!url) return;
        
        const textarea = textareaRef.current;
        let selectedText = '';
        if (textarea) {
            selectedText = form.content.substring(textarea.selectionStart, textarea.selectionEnd);
        }
        
        const text = prompt('Enter link text:', selectedText) || url;
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline font-medium">${text}</a>`;
        
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = form.content.substring(0, start) + linkHtml + form.content.substring(end);
            setForm(prev => ({ ...prev, content: newContent }));
            
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + linkHtml.length, start + linkHtml.length);
            }, 0);
        } else {
            setForm(prev => ({ ...prev, content: prev.content + linkHtml }));
        }
    };

    const fetchBlogs = async () => {
        const data = await getAllBlogs();
        setBlogs(data);
        setLoading(false);
    };

    useEffect(() => { fetchBlogs(); }, []);

    const generateSlug = (title: string) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const handleTitleChange = (title: string) => {
        setForm(prev => ({
            ...prev,
            title,
            slug: editingId ? prev.slug : generateSlug(title),
        }));
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.slug.trim()) return;
        setSaving(true);

        const blogData = {
            ...form,
            author_email: user?.email || 'go.aroundu@gmail.com',
        };

        if (editingId) {
            await updateBlog(editingId, blogData);
        } else {
            await createBlog(blogData);
        }

        setSaving(false);
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        fetchBlogs();
    };

    const handleEdit = (blog: BlogRecord) => {
        setForm({
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            content: blog.content,
            image_url: blog.image_url || '',
            published: blog.published,
            category: (blog.category as 'blog' | 'alternative') || 'blog',
        });
        setEditingId(blog.id!);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        await deleteBlog(id);
        fetchBlogs();
    };

    const handleNewPost = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fe]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white sticky top-0 z-40">
                <button
                    onClick={() => router.push('/analyze')}
                    className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                </button>
                <a href="https://seozapp.com" className="font-black text-lg sm:text-xl tracking-tight text-gray-900">
                    SEO<span className="text-accent">zapp</span> <span className="text-xs sm:text-sm font-normal text-gray-400">Admin</span>
                </a>
                <div className="w-8" />
            </div>

            <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Content Manager</h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-1">Create and manage blog posts & alternatives</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push('/blog-admin')}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-black transition-all hover:scale-[1.02] text-sm"
                        >
                            <Sparkles className="w-4 h-4 text-accent" />
                            Open Blog Studio 2.0
                        </button>
                        {!showForm && (
                            <button
                                onClick={handleNewPost}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-accent text-accent-900 font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all hover:scale-[1.02]"
                            >
                                <Plus className="w-5 h-5" />
                                New Post
                            </button>
                        )}
                    </div>
                </div>

                {/* Banner introducing Blog Studio */}
                <div className="bg-gradient-to-r from-accent/10 via-blue-50 to-purple-50 border border-accent/20 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="font-bold text-sm text-gray-900">🚀 Looking for the full Blog Writing &amp; SEO Studio?</p>
                        <p className="text-xs text-gray-600">Features live split-screen preview, SEO score auditor, keyword density, table generators, and callouts.</p>
                    </div>
                    <button
                        onClick={() => router.push('/blog-admin')}
                        className="shrink-0 px-4 py-2 bg-accent text-accent-900 font-extrabold text-xs rounded-xl shadow-sm hover:scale-105 transition-all"
                    >
                        Go to /blog-admin →
                    </button>
                </div>

                {/* Filter Tabs */}
                {!showForm && (
                    <div className="flex items-center gap-2 mb-6">
                        {(['all', 'blog', 'alternative'] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    filterCategory === cat
                                        ? 'bg-accent text-white shadow-md'
                                        : 'bg-white text-gray-500 border border-gray-200 hover:border-accent/30 hover:text-accent'
                                }`}
                            >
                                {cat === 'all' ? 'All' : cat === 'blog' ? 'Blog' : 'Alternatives'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Blog Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Edit Post' : 'New Post'}
                            </h2>
                            <button
                                onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => handleTitleChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                    placeholder="Blog post title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-gray-500"
                                    placeholder="url-friendly-slug"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                                <input
                                    type="text"
                                    value={form.image_url || ''}
                                    onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                                <input
                                    type="text"
                                    value={form.excerpt}
                                    onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                    placeholder="Short description shown in blog listing"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Content</label>
                                    <button
                                        type="button"
                                        onClick={handleInsertLink}
                                        className="text-xs flex items-center gap-1 text-accent hover:text-accent/80 font-medium bg-accent/5 px-2 py-1 rounded-md transition-colors"
                                    >
                                        <Link2 className="w-3.5 h-3.5" /> Insert Link
                                    </button>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    value={form.content}
                                    onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                                    rows={12}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-y font-mono text-sm leading-relaxed"
                                    placeholder="Write your blog post content here. You can use standard HTML like <a href='...'>Link</a> or plain text."
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setForm(prev => ({ ...prev, published: !prev.published }))}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    {form.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    {form.published ? 'Published' : 'Draft'}
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, category: 'blog' }))}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.category === 'blog' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        Blog
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, category: 'alternative' }))}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.category === 'alternative' ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        Alternative
                                    </button>
                                </div>
                                {form.category === 'alternative' && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        💡 SEO tip: Use title format like &quot;Best [product-name] alternative for SEO and AEO&quot;
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.title.trim() || !form.slug.trim()}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : editingId ? 'Update Post' : 'Create Post'}
                            </button>
                            <button
                                onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                                className="px-5 py-2.5 text-gray-500 font-medium hover:text-gray-700 transition-colors text-center"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Blog List */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading posts...</p>
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="space-y-3">
                        {blogs.filter(b => filterCategory === 'all' || b.category === filterCategory).map(blog => (
                            <div key={blog.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{blog.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${blog.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {blog.published ? 'Published' : 'Draft'}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${blog.category === 'alternative' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {blog.category === 'alternative' ? 'Alternative' : 'Blog'}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-400 truncate">/{blog.category === 'alternative' ? 'alternatives' : 'blog'}/{blog.slug}</p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 self-end sm:self-center">
                                    <button
                                        onClick={() => handleEdit(blog)}
                                        className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(blog.id!)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                        <p className="text-gray-500 mb-4">Create your first blog post to get started.</p>
                        <button
                            onClick={handleNewPost}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Post
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
