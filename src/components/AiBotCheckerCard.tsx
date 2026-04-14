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
  let bots = d.bots as Record<string, { allowed?: boolean; rule?: string }> | undefined;
  
  if (!bots && d.ai_access) {
    const aiAccess = d.ai_access as Record<string, boolean>;
    bots = {};
    for (const [key, value] of Object.entries(aiAccess)) {
      bots[key] = { allowed: value };
    }
  }

  return (
    <div className="py-6 font-sans antialiased text-gray-900 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Bot Access</h1>
      <style jsx>{`
          .section-header { font-size: 11px; font-weight: 500; color: #6B7280; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
          .panel { background: #F9FAFB; border-radius: 12px; padding: 16px; border: 1px solid #F3F4F6; }
      `}</style>

      {/* robots.txt Status */}
      <div className="mb-4">
        <div className="section-header">
          <span>{url ? `robots.txt analysis for ${url}` : 'robots.txt configuration analysis'}</span>
        </div>
        <div className="panel">
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
      </div>

      {/* Details */}
      {details && (
        <div className="mb-4">
          <div className="section-header">
            <span>Details</span>
          </div>
          <div className="panel bg-[#F0F9FF] border-[#E0F2FE]">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{details}</p>
            </div>
          </div>
        </div>
      )}

      {/* Individual Bot Details */}
      {bots && Object.keys(bots).length > 0 && (
        <div className="mb-4">
          <div className="section-header">
            <span>Individual Bot Rules</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="panel h-full border-[#BBF7D0]">
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
            <div className="panel h-full border-[#FECACA]">
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
        </div>
      )}

      {/* Default no-specific-rules message */}
      {!bots && robotsFound === false && (
        <div className="mb-4">
          <div className="panel bg-[#F0FDF4] border-[#BBF7D0]">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              No robots.txt found — all bots (including AI crawlers) are allowed by default.
            </p>
          </div>
        </div>
      )}

      {!bots && robotsFound === true && aiBotsAllowed && (
        <div className="mb-4">
          <div className="panel bg-[#F0FDF4] border-[#BBF7D0]">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              All AI bots are allowed to crawl this site.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
