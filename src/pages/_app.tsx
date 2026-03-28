import '@/index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>SEOzapp: One-Click SEO Fixer — Full stack SEO Audit Tool</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
