import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getUseCasePages, getUseCasePage, KeywordRow } from '../../lib/keywords';

interface UseCasePageProps {
  pageData: KeywordRow;
}

export default function UseCasePage({ pageData }: UseCasePageProps) {
  const { page_title, target_keyword } = pageData;

  // Generate dynamic FAQ schema based on the actual target keyword
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the best ${target_keyword}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `SEOzapp provides the best ${target_keyword} by giving you a comprehensive SEO analysis tool designed to help you rank higher.`
        }
      },
      {
        "@type": "Question",
        "name": `How does a ${target_keyword} help my website?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `A proper ${target_keyword} uncovers critical technical and on-page issues preventing you from reaching the first page of Google.`
        }
      },
      {
        "@type": "Question",
        "name": `Is the ${target_keyword} free to use?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, you can try our ${target_keyword} for free to discover underlying SEO opportunities.`
        }
      }
    ]
  };

  return (
    <>
      <Head>
        <title>{page_title} - SEOzapp</title>
        <meta 
          name="description" 
          content={`Discover the best ${target_keyword}. SEOzapp provides a powerful platform for all your SEO needs.`} 
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      <main className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              {page_title}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock your website's true potential with the leading tool for {target_keyword}. Find critical issues, improve performance, and dominate the search results.
            </p>
            <div className="pt-4">
              <a
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-1"
              >
                Try seozapp free
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold border-b border-gray-100 pb-4 mb-6 text-gray-800 text-center">
              Real-Time Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-sm font-semibold text-blue-600 mb-1 uppercase tracking-wider">Pages Audited</span>
                <span className="text-4xl font-extrabold text-gray-900">42,000+</span>
              </div>
              <div className="bg-red-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-sm font-semibold text-red-600 mb-1 uppercase tracking-wider">Issues Found</span>
                <span className="text-4xl font-extrabold text-gray-900">1.2M+</span>
              </div>
              <div className="bg-green-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-sm font-semibold text-green-600 mb-1 uppercase tracking-wider">Avg SEO Score</span>
                <span className="text-4xl font-extrabold text-gray-900">92/100</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = getUseCasePages();
  const paths = pages.map((page) => ({
    params: { slug: page.url_slug },
  }));

  return {
    paths,
    fallback: false, // Return 404 for slugs not matched in the CSV
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const pageData = getUseCasePage(slug);

  if (!pageData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      pageData,
    },
  };
};
