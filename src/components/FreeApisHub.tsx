import React, { useState } from 'react';
import { 
  Globe2, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  Database, 
  CheckCircle2, 
  Code2, 
  Flame, 
  Radio,
  Search
} from 'lucide-react';
import { FREE_APIS_DIRECTORY } from '../services/freeApis';
import { FreeApiResource, Language } from '../types';
import { translations } from '../services/translations';

interface FreeApisHubProps {
  currentLang: Language;
}

export const FreeApisHub: React.FC<FreeApisHubProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [selectedApi, setSelectedApi] = useState<FreeApiResource>(FREE_APIS_DIRECTORY[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'news' | 'osint' | 'code' | 'science'>('all');

  const filteredApis = FREE_APIS_DIRECTORY.filter((api) => {
    if (activeCategory === 'all') return true;
    return api.category === activeCategory;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestLiveApi = async (api: FreeApiResource) => {
    setIsTesting(true);
    setTestResult(null);
    setTestLatency(null);

    const startTime = performance.now();
    try {
      const res = await fetch(api.endpoint, {
        headers: { Accept: 'application/json' }
      });
      const endTime = performance.now();
      setTestLatency(Math.round(endTime - startTime));

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setTestResult({
          status: res.status,
          statusText: res.statusText,
          data: Array.isArray(data) ? data.slice(0, 3) : (data.hits ? data.hits.slice(0, 3) : data)
        });
      } else {
        const text = await res.text();
        setTestResult({
          status: res.status,
          statusText: res.statusText,
          preview: text.substring(0, 400) + '...'
        });
      }
    } catch (err: any) {
      const endTime = performance.now();
      setTestLatency(Math.round(endTime - startTime));
      setTestResult({
        error: true,
        message: err.message || 'Erreur lors du test de l\'API en direct'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
          <Database className="w-4 h-4" />
          <span>{t.freeApisBadge}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {t.freeApisTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
          {t.freeApisSubtitle}
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        {[
          { id: 'all', label: t.categoryAll },
          { id: 'news', label: currentLang === 'ar' ? '📰 الأخبار والتقنية' : '📰 Actualités & Tech' },
          { id: 'osint', label: currentLang === 'ar' ? '🛡️ أوسينت والسيبراني' : '🛡️ Cyber & OSINT' },
          { id: 'code', label: currentLang === 'ar' ? '⭐ جيت هب والبرمجيات' : '⭐ GitHub & Code' },
          { id: 'science', label: currentLang === 'ar' ? '🔬 الأبحاث وبراءات الاختراع' : '🔬 Recherche & ArXiv' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of APIs */}
      <div className="space-y-3">
        {filteredApis.map((api) => {
          const isSelected = selectedApi.id === api.id;
          return (
            <div
              key={api.id}
              className={`p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-slate-900 border-sky-500/60 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                    <Globe2 className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {api.name}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-full text-[11px] font-mono">
                    Sans clé d'API
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {api.rateLimit}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {api.description}
              </p>

              {/* Endpoint Code Box */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-sky-300 flex items-center justify-between gap-2 mb-3 overflow-x-auto">
                <span className="truncate">{api.endpoint}</span>
                <button
                  onClick={() => handleCopy(api.endpoint, `${api.id}-endpoint`)}
                  title="Copier l'URL"
                  className="p-1 rounded text-slate-400 hover:text-white shrink-0"
                >
                  {copiedId === `${api.id}-endpoint` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Action Buttons: Test Live & View Docs */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedApi(api);
                      handleTestLiveApi(api);
                    }}
                    disabled={isTesting}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Tester l'API en direct</span>
                  </button>

                  <button
                    onClick={() => handleCopy(api.sampleCurl, `${api.id}-curl`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === `${api.id}-curl` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Copier cURL</span>
                  </button>
                </div>

                <a
                  href={api.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-sky-300 flex items-center gap-1 text-xs"
                >
                  <span>Doc</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live API Response Inspector Box */}
      {(isTesting || testResult) && (
        <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 shadow-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Réponse Live : {selectedApi.name}</span>
            </div>
            {testLatency && (
              <span className="font-mono text-emerald-400 text-[11px]">
                Latence : {testLatency} ms
              </span>
            )}
          </div>

          {isTesting ? (
            <div className="py-8 text-center text-xs text-sky-400 flex items-center justify-center gap-2">
              <Radio className="w-4 h-4 animate-spin" />
              <span>Envoi de la requête HTTP en direct vers l'endpoint public...</span>
            </div>
          ) : (
            <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-200 overflow-x-auto max-h-60 leading-relaxed select-text">
              <code>{JSON.stringify(testResult, null, 2)}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
