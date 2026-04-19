/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Since you have lots of internal image elements not using Next/Image,
  // ensure Next.js image optimization handles them or ignore them.

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // ── Clickjacking Protection ──
          // X-Frame-Options prevents the site from being embedded in iframes
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },

          // ── MIME Sniffing Protection ──
          // Prevents browsers from guessing the MIME type
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },

          // ── Content Security Policy (Report-Only) ──
          // Starting in report-only mode so it won't block anything yet.
          // Monitor the browser console for violations, then switch
          // "Content-Security-Policy-Report-Only" → "Content-Security-Policy"
          // once you've tuned the directives.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.dodopayments.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co https://api.dodopayments.com https://vebapi.com",
              "frame-src 'self' https://checkout.dodopayments.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },

          // ── Referrer Policy ──
          // Only send the origin (not the full URL) on cross-origin requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },

          // ── Permissions Policy ──
          // Restrict access to sensitive browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },

          // ── Strict Transport Security ──
          // Force HTTPS for 1 year, including subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },

          // ── XSS Protection (legacy, but still useful for older browsers) ──
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
}

export default nextConfig;
