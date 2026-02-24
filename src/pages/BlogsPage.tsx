import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { getPublishedBlogs, BlogRecord } from '@/services/supabaseClient';

export default function BlogsPage() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState<BlogRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPublishedBlogs().then(data => {
            setBlogs(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#f8f9fe]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-40">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <span className="font-black text-xl tracking-tight text-gray-900">
                    SEO<span className="text-accent">zapp</span>
                </span>
                <div className="w-8" /> {/* Spacer */}
            </div>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
                        <BookOpen className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Blog</h1>
                    <p className="text-gray-500 text-lg">SEO insights, tips, and industry updates</p>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading articles...</p>
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="space-y-6">
                        {blogs.map((blog) => (
                            <Link
                                key={blog.id}
                                to={`/blogs/${blog.slug}`}
                                className="block bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-accent/20 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-accent transition-colors mb-2">
                                            {blog.title}
                                        </h2>
                                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{blog.excerpt}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(blog.created_at || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No articles yet</h3>
                        <p className="text-gray-500">Check back soon for SEO insights and tips.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
