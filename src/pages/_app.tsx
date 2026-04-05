import '@/index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const canonicalPath = router.asPath.split('?')[0];
  const canonicalUrl = `https://seozapp.com${canonicalPath === '/' ? '' : canonicalPath}`;
  return (
    <AuthProvider>
      <Head>
        <title>SEOzapp: One-Click SEO Fixer — Full stack SEO Audit Tool</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
