import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, BookOpen } from 'lucide-react';
import { getAllBlogs, createBlog, updateBlog, deleteBlog, BlogRecord } from '@/services/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface BlogForm {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    published: boolean;
}

const emptyForm: BlogForm = { title: '', slug: '', excerpt: '', content: '', published: false };

export default function AdminPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [blogs, setBlogs] = useState<BlogRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<BlogForm>(emptyForm);
    const [saving, setSaving] = useState(false);

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
            published: blog.published,
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-40">
                <button
                    onClick={() => navigate('/analyze')}
                    className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                </button>
                <span className="font-black text-xl tracking-tight text-gray-900">
                    SEO<span className="text-accent">zapp</span> <span className="text-sm font-normal text-gray-400">Admin</span>
                </span>
                <div className="w-8" />
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Blog Manager</h1>
                        <p className="text-gray-500 mt-1">Create and manage blog posts</p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={handleNewPost}
                            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all hover:scale-[1.02]"
                        >
                            <Plus className="w-5 h-5" />
                            New Post
                        </button>
                    )}
                </div>

                {/* Blog Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea
                                    value={form.content}
                                    onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                                    rows={12}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-y font-mono text-sm"
                                    placeholder="Write your blog post content here..."
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
                        </div>

                        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.title.trim() || !form.slug.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : editingId ? 'Update Post' : 'Create Post'}
                            </button>
                            <button
                                onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                                className="px-5 py-2.5 text-gray-500 font-medium hover:text-gray-700 transition-colors"
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
                        {blogs.map(blog => (
                            <div key={blog.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900 truncate">{blog.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${blog.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {blog.published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">/blogs/{blog.slug}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
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
