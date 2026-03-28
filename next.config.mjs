/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Since you have lots of internal image elements not using Next/Image,
  // ensure Next.js image optimization handles them or ignore them.
}

export default nextConfig;
