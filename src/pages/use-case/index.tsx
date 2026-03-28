import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getUseCasePages } from '../../lib/keywords';
import type { KeywordRow } from '../../lib/keywords';
import { NavBar } from '@/components/ui/NavBar';
import { Home } from 'lucide-react';
import Link from 'next/link';

interface UseCaseIndexProps {
  pages: KeywordRow[];
}

export default function UseCaseIndex({ pages }: UseCaseIndexProps) {
  return (
    <>
      <Head>
        <title>SEOzapp Use Cases - All Tools</title>
        <meta name="description" content="Explore all SEOzapp use cases and tools, ranging from local business SEO to ecommerce and blogs." />
      </Head>

      <NavBar 
        items={[{ name: 'Home', url: '/', icon: Home, onClick: () => window.location.href = '/' }]} 
        activeTab="Home" 
      />

      <main className="min-h-screen bg-gray-50 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              SEOzapp Use Cases
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover exactly how SEOzapp can help your specific industry and needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {pages.map((page) => (
              <Link 
                key={page.url_slug} 
                href={`/use-case/${page.url_slug}`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group"
              >
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
                  {page.page_title}
                </h3>
                <p className="text-gray-500 text-sm">
                  Target: {page.target_keyword}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const pages = getUseCasePages();
  return {
    props: {
      pages,
    },
  };
};
