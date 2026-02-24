import { Gauge, Clock, HardDrive, Globe, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface LoadingSpeedCardProps {
  data: unknown;
}

export default function LoadingSpeedCard({ data }: LoadingSpeedCardProps) {
  if (!data) return null;

  const d = data as Record<string, unknown>;
  const summary = d.summary as {
    url?: string;
    performance_grade?: { score?: number; grade?: string };
    page_size_bytes?: number;
    page_size_kb?: number;
    load_time_ms?: number;
    ttfb_ms?: number;
    requests?: number;
    unique_domains?: number;
    main?: {
      http_code?: number;
      content_type?: string;
      redirect_count?: number;
      timings?: Record<string, number | null>;
    };
  } | undefined;
  const improvements = d.improve_page_performance as Array<{ grade?: string; suggestion?: string; detail?: string }> | undefined;
  const contentByType = d.content_size_by_content_type as Array<{ content_type?: string; percent?: number; size_kb?: number }> | undefined;
  const requestsByDomain = d.requests_by_domain as Array<{ domain?: string; percent?: number; requests?: number }> | undefined;
  const responseCodes = d.response_codes as Array<{ response_code?: number; responses?: number }> | undefined;

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

  const loadTimeColor = (ms: number) => {
    if (ms < 1000) return 'text-green-600';
    if (ms < 3000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
          <Gauge className="w-6 h-6 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Loading Speed</h2>
          <p className="text-gray-600">{summary?.url || 'Performance metrics and analysis'}</p>
        </div>
        {summary?.performance_grade?.grade && (
          <div className={`px-4 py-2 rounded-xl font-bold text-2xl ${gradeColor(summary.performance_grade.grade)}`}>
            {summary.performance_grade.grade}
          </div>
        )}
      </div>

      {/* Performance Score */}
      {summary?.performance_grade?.score !== undefined && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Performance Score</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{summary.performance_grade.score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${scoreColor(summary.performance_grade.score)}`}
              style={{ width: `${summary.performance_grade.score}%` }}
            />
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {summary.load_time_ms !== undefined && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Load Time</p>
              <p className={`text-xl font-bold ${loadTimeColor(summary.load_time_ms)}`}>
                {summary.load_time_ms < 1000 ? `${summary.load_time_ms}ms` : `${(summary.load_time_ms / 1000).toFixed(2)}s`}
              </p>
            </div>
          )}
          {summary.ttfb_ms !== undefined && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Gauge className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">TTFB</p>
              <p className={`text-xl font-bold ${loadTimeColor(summary.ttfb_ms)}`}>
                {summary.ttfb_ms < 1000 ? `${summary.ttfb_ms}ms` : `${(summary.ttfb_ms / 1000).toFixed(2)}s`}
              </p>
            </div>
          )}
          {summary.page_size_kb !== undefined && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <HardDrive className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Page Size</p>
              <p className="text-xl font-bold text-gray-900">
                {summary.page_size_kb >= 1024 ? `${(summary.page_size_kb / 1024).toFixed(1)}MB` : `${summary.page_size_kb.toFixed(1)}KB`}
              </p>
            </div>
          )}
          {summary.requests !== undefined && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Globe className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Requests</p>
              <p className="text-xl font-bold text-gray-900">{summary.requests}</p>
              {summary.unique_domains !== undefined && (
                <p className="text-xs text-gray-400">{summary.unique_domains} domains</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content Breakdown */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {contentByType && contentByType.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Content by Type</h3>
            <div className="space-y-2">
              {contentByType.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.content_type}</span>
                    <span className="text-gray-500">{item.size_kb?.toFixed(1)}KB ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-yellow-500" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {requestsByDomain && requestsByDomain.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Requests by Domain</h3>
            <div className="space-y-2">
              {requestsByDomain.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate mr-2">{item.domain}</span>
                    <span className="text-gray-500 flex-shrink-0">{item.requests} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Response Codes */}
      {responseCodes && responseCodes.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Response Codes</h3>
          <div className="flex flex-wrap gap-2">
            {responseCodes.map((item, idx) => (
              <span key={idx} className={`px-3 py-1 rounded-full text-sm font-medium ${(item.response_code ?? 0) >= 400 ? 'bg-red-100 text-red-700' :
                (item.response_code ?? 0) >= 300 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                {item.response_code}: {item.responses} {item.responses === 1 ? 'request' : 'requests'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {improvements && improvements.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Performance Improvements
          </h4>
          <ul className="space-y-1">
            {improvements.map((tip, idx) => (
              <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{tip.suggestion || tip.detail || JSON.stringify(tip)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(!improvements || improvements.length === 0) && summary?.performance_grade?.score && summary.performance_grade.score >= 80 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Excellent performance! No major improvements needed.
          </p>
        </div>
      )}
    </div>
  );
}
