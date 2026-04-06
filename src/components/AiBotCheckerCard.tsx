import { Bot, CheckCircle, XCircle, Shield, AlertCircle } from 'lucide-react';

interface AiBotCheckerCardProps {
  data: unknown;
}

export default function AiBotCheckerCard({ data }: AiBotCheckerCardProps) {
  if (!data) return null;

  const d = data as Record<string, unknown>;
  const url = d.url as string | undefined;
  const robotsFound = d.robots_found as boolean | undefined;
  const aiBotsAllowed = d.ai_bots_allowed as boolean | undefined;
  const details = d.details as string | undefined;

  // Some responses may include detailed bot info
  const bots = d.bots as Record<string, { allowed?: boolean; rule?: string }> | undefined;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <Bot className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Bot Access</h2>
          <p className="text-gray-600">{url ? `robots.txt analysis for ${url}` : 'robots.txt configuration analysis'}</p>
        </div>
      </div>

      {/* robots.txt Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">robots.txt Status</h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-700 flex items-center gap-2">
            {robotsFound ? (
              <><CheckCircle className="w-4 h-4 text-green-600" /> robots.txt file found</>
            ) : (
              <><XCircle className="w-4 h-4 text-orange-600" /> No robots.txt file detected</>
            )}
          </p>
          <p className="text-sm text-gray-700 flex items-center gap-2">
            {aiBotsAllowed ? (
              <><CheckCircle className="w-4 h-4 text-green-600" /> AI bots are allowed</>
            ) : aiBotsAllowed === false ? (
              <><XCircle className="w-4 h-4 text-red-600" /> AI bots are blocked</>
            ) : null}
          </p>
        </div>
      </div>

      {/* Details */}
      {details && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">{details}</p>
          </div>
        </div>
      )}

      {/* Individual Bot Details */}
      {bots && Object.keys(bots).length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Allowed Bots
            </h4>
            <ul className="space-y-1">
              {Object.entries(bots).filter(([, info]) => info.allowed).map(([name]) => (
                <li key={name} className="text-sm text-green-800 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Blocked Bots
            </h4>
            <ul className="space-y-1">
              {Object.entries(bots).filter(([, info]) => !info.allowed).map(([name]) => (
                <li key={name} className="text-sm text-red-800 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Default no-specific-rules message */}
      {!bots && robotsFound === false && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            No robots.txt found — all bots (including AI crawlers) are allowed by default.
          </p>
        </div>
      )}

      {!bots && robotsFound === true && aiBotsAllowed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            All AI bots are allowed to crawl this site.
          </p>
        </div>
      )}
    </div>
  );
}
