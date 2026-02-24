import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getBlogBySlug, BlogRecord } from '@/services/supabaseClient';

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<BlogRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!slug) return;
        getBlogBySlug(slug).then(data => {
            if (data) {
                setBlog(data);
            } else {
                setNotFound(true);
            }
            setLoading(false);
        });
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fe] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading article...</p>
                </div>
            </div>
        );
    }

    if (notFound || !blog) {
        return (
            <div className="min-h-screen bg-[#f8f9fe] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Article not found</h1>
                    <p className="text-gray-500 mb-6">The article you're looking for doesn't exist.</p>
                    <button onClick={() => navigate('/blogs')} className="text-accent font-semibold hover:underline">
                        ← Back to Blog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fe]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-40">
                <button
                    onClick={() => navigate('/blogs')}
                    className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">All Posts</span>
                </button>
                <span className="font-black text-xl tracking-tight text-gray-900">
                    SEO<span className="text-accent">zapp</span>
                </span>
                <div className="w-8" />
            </div>

            <article className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        {new Date(blog.created_at || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
                    <p className="text-lg text-gray-500">{blog.excerpt}</p>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {blog.content}
                    </div>
                </div>
            </article>
        </div>
    );
}
