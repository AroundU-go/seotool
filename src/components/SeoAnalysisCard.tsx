import { AlertCircle, CheckCircle, FileText, Image, Link2, Heading, Shield, BarChart3, TrendingUp } from 'lucide-react';

interface SeoAnalysisCardProps {
  data: unknown;
}

export default function SeoAnalysisCard({ data }: SeoAnalysisCardProps) {
  if (!data) return null;

  const d = data as Record<string, unknown>;
  const summary = d.summary as { overall_score?: number; grade?: string; priority_issues?: string[] } | undefined;
  const scores = d.scores as { overall?: number; buckets?: Record<string, number> } | undefined;
  const basic = d.basic as { title?: string; final_url?: string; http_code?: number; canonical?: string | null; favicon?: string } | undefined;
  const headings = d.headings as { counts?: Record<string, number>; data?: Record<string, string[]> } | undefined;
  const links = d.links as { total?: number; internal?: number; external?: number; nofollow?: number } | undefined;
  const images = d.images as { total?: number; missing_alt?: number; alt_rate_pct?: number } | undefined;
  const findings = d.findings as Array<{ category?: string; severity?: string; issue?: string; fix?: string }> | undefined;
  const structured = d.structured_data as { json_ld_count?: number; types?: string[] } | undefined;
  const security = d.security as { ssl_valid?: boolean; hsts?: boolean; http_code?: number } | undefined;
  const accessibility = d.accessibility as { images_missing_alt?: number; heading_hierarchy_ok?: boolean } | undefined;

  const gradeColor = (grade?: string) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade === 'A' || grade === 'A+') return 'bg-green-100 text-green-800';
    if (grade === 'B') return 'bg-blue-100 text-blue-800';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const severityColor = (severity?: string) => {
    if (severity === 'error' || severity === 'critical') return 'text-red-600 bg-red-50';
    if (severity === 'warning') return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">On-Page SEO Analysis</h2>
          <p className="text-gray-600">
            {basic?.final_url || 'Comprehensive analysis of SEO elements'}
          </p>
        </div>
        {summary?.grade && (
          <div className={`px-4 py-2 rounded-xl font-bold text-2xl ${gradeColor(summary.grade)}`}>
            {summary.grade}
          </div>
        )}
      </div>

      {/* Overall Score */}
      {summary?.overall_score !== undefined && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Overall Score</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{summary.overall_score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${scoreColor(summary.overall_score)}`}
              style={{ width: `${summary.overall_score}%` }}
            />
          </div>
        </div>
      )}

      {/* Score Buckets */}
      {scores?.buckets && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {Object.entries(scores.buckets).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {key.replace(/_/g, ' ')}
              </p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className={`h-1.5 rounded-full ${scoreColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Basic Info */}
        {basic && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Page Info</h3>
            </div>
            <div className="space-y-2">
              {basic.title && (
                <div>
                  <p className="text-xs text-gray-500">Title</p>
                  <p className="text-sm font-medium text-gray-800">{basic.title}</p>
                </div>
              )}
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-500">HTTP Status</p>
                  <p className="text-sm font-medium text-gray-800">{basic.http_code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Canonical</p>
                  <p className="text-sm font-medium text-gray-800">{basic.canonical || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Headings */}
        {headings?.counts && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heading className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Headings Structure</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(headings.counts).map(([tag, count]) => (
                <div key={tag} className="text-center">
                  <p className="text-xs text-gray-500 uppercase">{tag}</p>
                  <p className={`text-lg font-bold ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{count}</p>
                </div>
              ))}
            </div>
            {headings.data?.h1 && headings.data.h1.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">H1 Content</p>
                <p className="text-sm text-gray-800">{headings.data.h1[0]}</p>
              </div>
            )}
          </div>
        )}

        {/* Images */}
        {(images || accessibility) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Images</h3>
            </div>
            <div className="space-y-1">
              {images?.total !== undefined && <p className="text-sm text-gray-700">Total: {images.total}</p>}
              {accessibility?.images_missing_alt !== undefined && (
                <p className={`text-sm ${accessibility.images_missing_alt > 0 ? 'text-orange-600 font-medium' : 'text-green-600'}`}>
                  Missing alt text: {accessibility.images_missing_alt}
                </p>
              )}
              {images?.alt_rate_pct !== undefined && <p className="text-sm text-gray-700">Alt rate: {images.alt_rate_pct}%</p>}
            </div>
          </div>
        )}

        {/* Links */}
        {links && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Links</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">{links.total ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Internal</p>
                <p className="text-lg font-bold text-gray-900">{links.internal ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">External</p>
                <p className="text-lg font-bold text-gray-900">{links.external ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nofollow</p>
                <p className="text-lg font-bold text-gray-900">{links.nofollow ?? 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {security && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Security</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-700 flex items-center gap-1">
                {security.ssl_valid ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                SSL: {security.ssl_valid ? 'Valid' : 'Invalid'}
              </p>
              <p className="text-sm text-gray-700 flex items-center gap-1">
                {security.hsts ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-orange-500" />}
                HSTS: {security.hsts ? 'Enabled' : 'Missing'}
              </p>
            </div>
          </div>
        )}

        {/* Structured Data */}
        {structured && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Structured Data</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">JSON-LD blocks: {structured.json_ld_count ?? 0}</p>
              {structured.types && structured.types.length > 0 && (
                <p className="text-sm text-gray-700">Types: {structured.types.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Findings / Issues */}
      {findings && findings.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Issues & Recommendations ({findings.length})
          </h4>
          <div className="space-y-2">
            {findings.map((f, idx) => (
              <div key={idx} className={`rounded-lg p-3 ${severityColor(f.severity)}`}>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-white bg-opacity-50">
                    {f.category?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs uppercase opacity-70">{f.severity}</span>
                </div>
                <p className="text-sm font-medium mt-1">{f.issue}</p>
                {f.fix && <p className="text-xs mt-1 opacity-80">💡 {f.fix}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Issues from Summary */}
      {(!findings || findings.length === 0) && summary?.priority_issues && summary.priority_issues.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Priority Issues ({summary.priority_issues.length})
          </h4>
          <ul className="space-y-1">
            {summary.priority_issues.map((issue, idx) => (
              <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(!findings || findings.length === 0) && (!summary?.priority_issues || summary.priority_issues.length === 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            No major issues detected!
          </p>
        </div>
      )}
    </div>
  );
}
