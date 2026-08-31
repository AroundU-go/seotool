import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getBlogBySlug, BlogRecord } from '@/services/supabaseClient';

export default function BlogPostPage() {
    const router = useRouter();
    const { slug } = router.query as { slug: string };
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
                    <p className="text-gray-500 mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
                    <button onClick={() => router.push('/blog')} className="text-accent font-semibold hover:underline">
                        ← Back to Blog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{blog.title} | SEOzapp Blog</title>
                <meta name="description" content={blog.excerpt} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`https://www.seozapp.com/blog/${blog.slug}`} />
                <meta property="og:title" content={`${blog.title} | SEOzapp Blog`} />
                <meta property="og:description" content={blog.excerpt} />
                <meta property="og:url" content={`https://www.seozapp.com/blog/${blog.slug}`} />
                <meta property="og:type" content="article" />
                {blog.image_url && <meta property="og:image" content={blog.image_url} />}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: blog.title,
                            description: blog.excerpt,
                            image: blog.image_url || undefined,
                            datePublished: blog.created_at,
                            dateModified: blog.updated_at || blog.created_at,
                            author: {
                                '@type': 'Organization',
                                name: 'SEOzapp',
                            },
                            publisher: {
                                '@type': 'Organization',
                                name: 'SEOzapp',
                                url: 'https://www.seozapp.com',
                            },
                            mainEntityOfPage: {
                                '@type': 'WebPage',
                                '@id': `https://www.seozapp.com/blog/${blog.slug}`,
                            },
                        }),
                    }}
                />
            </Head>
            <div className="min-h-screen bg-[#f8f9fe]">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-40">
                    <button
                        onClick={() => router.push('/blog')}
                        className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">All Posts</span>
                    </button>
                    <a href="https://seozapp.com" className="font-black text-xl tracking-tight text-gray-900">
                        SEO<span className="text-accent">zapp</span>
                    </a>
                    <div className="w-8" />
                </div>

                <article className="container mx-auto px-4 py-12 max-w-3xl">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                            <Calendar className="w-4 h-4" />
                            {new Date(blog.created_at || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
                        <p className="text-lg text-gray-500 mb-6">{blog.excerpt}</p>
                        {blog.image_url && (
                            <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden bg-gray-100 mb-8 border border-gray-100 shadow-sm">
                                <img 
                                    src={blog.image_url} 
                                    alt={blog.title} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-100 shadow-sm">
                        <div 
                            className="blog-prose max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>
                </article>
            </div>
        </>
    );
}
