import { GetServerSideProps } from 'next';
import { getPublishedBlogsByCategory } from '@/services/supabaseClient';

const SITE_URL = 'https://www.seozapp.com';

function generateSiteMap(
    blogSlugs: string[],
    alternativeSlugs: string[],
    now: string
) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Static Pages -->
    <url>
        <loc>${SITE_URL}</loc>
        <lastmod>${now}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${SITE_URL}/blog</loc>
        <lastmod>${now}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${SITE_URL}/alternatives</loc>
        <lastmod>${now}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${SITE_URL}/contact</loc>
        <lastmod>${now}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.4</priority>
    </url>
    <url>
        <loc>${SITE_URL}/best-free-website-audit-tools</loc>
        <lastmod>${now}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${SITE_URL}/best-seo-tool-for-agencies</loc>
        <lastmod>${now}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${SITE_URL}/cheaper-alternative-to-semrush</loc>
        <lastmod>${now}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${SITE_URL}/Best-SEO-Agency-Software-in-2026</loc>
        <lastmod>${now}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${SITE_URL}/seo-audit-tool-for-agencies-2026</loc>
        <lastmod>${now}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${SITE_URL}/keyword-suggestions</loc>
        <lastmod>${now}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>${SITE_URL}/privacy</loc>
        <lastmod>${now}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.2</priority>
    </url>
    <url>
        <loc>${SITE_URL}/terms</loc>
        <lastmod>${now}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.2</priority>
    </url>

    <!-- Dynamic Blog Posts -->
${blogSlugs.map((slug) => `    <url>
        <loc>${SITE_URL}/blog/${slug}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('\n')}

    <!-- Dynamic Alternative Posts -->
${alternativeSlugs.map((slug) => `    <url>
        <loc>${SITE_URL}/alternatives/${slug}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('\n')}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    const [blogs, alternatives] = await Promise.all([
        getPublishedBlogsByCategory('blog'),
        getPublishedBlogsByCategory('alternative'),
    ]);

    const blogSlugs = blogs.map((b) => b.slug);
    const alternativeSlugs = alternatives.map((a) => a.slug);
    const now = new Date().toISOString().split('T')[0];

    const sitemap = generateSiteMap(blogSlugs, alternativeSlugs, now);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
    res.write(sitemap);
    res.end();

    return { props: {} };
};

// Default export required by Next.js but not rendered
export default function SiteMap() {
    return null;
}
