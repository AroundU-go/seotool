import { Brain, CheckCircle, AlertCircle, TrendingUp, FileSearch, BookOpen, Link2 } from 'lucide-react';

interface AiVisibilityCardProps {
  data: unknown;
}

export default function AiVisibilityCard({ data }: AiVisibilityCardProps) {
  if (!data) return null;

  const d = data as Record<string, unknown>;
  const aiScore = d.ai_score as { crawlability?: number; structure?: number; content_depth?: number; semantic_markup?: number; technical_cleanliness?: number; total?: number; grade?: string } | undefined;
  const aiVisibility = d.ai_visibility as { indexable?: boolean; block_reasons?: string[]; robots_meta?: string | null; canonical?: string | null; lang?: string | null } | undefined;
  const aiSimulation = d.ai_simulation as { indexable?: boolean; block_reasons?: string[]; ai_bots?: Record<string, { bot?: string; allowed_by_robots?: boolean | null }> } | undefined;
  const content = d.content as { main_word_count?: number; reading_time_minutes?: number; text_density_percent?: number; js_heavy?: boolean } | undefined;
  const structure = d.structure as { title?: string; meta_description?: string | null; headings?: Record<string, number> } | undefined;
  const linksData = d.links as { total?: number; internal?: number; external?: number } | undefined;
  const schema = d.schema as { jsonld_count?: number; types_found?: string[] } | undefined;
  const issues = d.issues as Array<{ id?: string; severity?: string; evidence?: string; impact?: string }> | undefined;
  const suggestions = d.suggestions as Array<{ priority?: string; category?: string; message?: string; impact?: string }> | undefined;
  const trustSignals = d.trust_signals as { pages_found?: Record<string, boolean> } | undefined;
  const aiScrapable = d.ai_scrapable as boolean | undefined;

  const gradeColor = (grade?: string) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade === 'A' || grade === 'A+') return 'bg-green-100 text-green-800';
    if (grade === 'B') return 'bg-blue-100 text-blue-800';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const scoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-yellow-500';
    if (pct >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const priorityColor = (priority?: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-700';
    if (priority === 'medium') return 'bg-orange-100 text-orange-700';
    return 'bg-blue-100 text-blue-700';
  };

  const scoreBreakdown = aiScore ? [
    { label: 'Crawlability', value: aiScore.crawlability ?? 0, max: 20 },
    { label: 'Structure', value: aiScore.structure ?? 0, max: 20 },
    { label: 'Content Depth', value: aiScore.content_depth ?? 0, max: 20 },
    { label: 'Semantic Markup', value: aiScore.semantic_markup ?? 0, max: 20 },
    { label: 'Technical', value: aiScore.technical_cleanliness ?? 0, max: 20 },
  ] : [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">AI SEO Readiness</h2>
          <p className="text-gray-600">Content optimization for AI systems</p>
        </div>
        {aiScore?.grade && (
          <div className={`px-4 py-2 rounded-xl font-bold text-2xl ${gradeColor(aiScore.grade)}`}>
            {aiScore.grade}
          </div>
        )}
      </div>

      {/* AI Score */}
      {aiScore?.total !== undefined && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">AI Score</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{aiScore.total}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all ${scoreColor(aiScore.total, 100)}`}
              style={{ width: `${aiScore.total}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {scoreBreakdown.map(item => (
              <div key={item.label} className="text-center">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-bold text-gray-900">{item.value}/{item.max}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div
                    className={`h-1 rounded-full ${scoreColor(item.value, item.max)}`}
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* AI Visibility Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileSearch className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">AI Visibility</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-700 flex items-center gap-1">
              {aiVisibility?.indexable ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
              Indexable: {aiVisibility?.indexable ? 'Yes' : 'No'}
            </p>
            {aiScrapable !== undefined && (
              <p className="text-sm text-gray-700 flex items-center gap-1">
                {aiScrapable ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                AI Scrapable: {aiScrapable ? 'Yes' : 'No'}
              </p>
            )}
            {structure?.title && <p className="text-sm text-gray-700">Title: {structure.title}</p>}
            {structure?.meta_description && <p className="text-sm text-gray-700 truncate">Description: {structure.meta_description}</p>}
          </div>
        </div>

        {/* Content Analysis */}
        {content && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Content</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">Word count: {content.main_word_count ?? 'N/A'}</p>
              <p className="text-sm text-gray-700">Reading time: {content.reading_time_minutes ?? 'N/A'} min</p>
              <p className="text-sm text-gray-700">Text density: {content.text_density_percent?.toFixed(1)}%</p>
              <p className="text-sm text-gray-700 flex items-center gap-1">
                {content.js_heavy ? <AlertCircle className="w-4 h-4 text-orange-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                JS Heavy: {content.js_heavy ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        )}

        {/* Schema / Structured Data */}
        {schema && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Structured Data</h3>
            <p className="text-sm text-gray-700">JSON-LD blocks: {schema.jsonld_count ?? 0}</p>
            {schema.types_found && schema.types_found.length > 0 && (
              <p className="text-sm text-gray-700">Types: {schema.types_found.join(', ')}</p>
            )}
          </div>
        )}

        {/* Links & Trust */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">Links & Trust</h3>
          </div>
          <div className="space-y-1">
            {linksData && (
              <p className="text-sm text-gray-700">Links: {linksData.total} total ({linksData.internal} internal, {linksData.external} external)</p>
            )}
            {trustSignals?.pages_found && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(trustSignals.pages_found).map(([page, found]) => (
                  <span key={page} className={`text-xs px-2 py-0.5 rounded ${found ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {found ? '✓' : '✗'} {page}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Bots */}
      {aiSimulation?.ai_bots && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">AI Bot Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(aiSimulation.ai_bots).map(([name, info]) => (
              <div key={name} className="text-center bg-white rounded-lg p-2 border border-gray-100">
                <p className="text-xs font-medium text-gray-900 capitalize">{name.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-500">{info.bot}</p>
                <p className={`text-xs mt-1 ${info.allowed_by_robots === false ? 'text-red-600' : info.allowed_by_robots === true ? 'text-green-600' : 'text-gray-400'}`}>
                  {info.allowed_by_robots === false ? '✗ Blocked' : info.allowed_by_robots === true ? '✓ Allowed' : '— No rule'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {issues && issues.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Issues ({issues.length})
          </h4>
          <div className="space-y-2">
            {issues.map((issue, idx) => (
              <div key={idx} className="bg-white bg-opacity-60 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${issue.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{issue.severity}</span>
                  <span className="text-sm font-medium text-orange-900">{issue.id?.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-orange-700 mt-1">{issue.evidence}</p>
                {issue.impact && <p className="text-xs text-orange-600 mt-0.5">Impact: {issue.impact}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Suggestions ({suggestions.length})</h4>
          <div className="space-y-2">
            {suggestions.map((s, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className={`text-xs px-2 py-0.5 rounded mt-0.5 flex-shrink-0 ${priorityColor(s.priority)}`}>
                  {s.priority}
                </span>
                <div>
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">{s.category}:</span> {s.message}
                  </p>
                  {s.impact && <p className="text-xs text-blue-600">{s.impact}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
