/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Since you have lots of internal image elements not using Next/Image,
  // ensure Next.js image optimization handles them or ignore them.
  async rewrites() {
    return [
      { source: '/pricing', destination: '/' },
      { source: '/how-it-works', destination: '/' },
      { source: '/features', destination: '/' },
    ];
  },
}

export default nextConfig;
