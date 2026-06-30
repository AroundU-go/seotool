import { GetServerSideProps } from 'next';

const SITE_URL = 'https://www.seozapp.com';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    const robotsTxt = `# https://www.seozapp.com robots.txt
User-agent: *
Allow: /

# Disallow admin and auth pages
Disallow: /admin
Disallow: /auth
Disallow: /api/

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
    res.write(robotsTxt);
    res.end();

    return { props: {} };
};

export default function Robots() {
    return null;
}
