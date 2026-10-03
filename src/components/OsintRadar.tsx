import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ExternalLink, Filter, ShieldCheck, Terminal } from 'lucide-react';
import { Language, OsintAlert } from '../types';
import { translations } from '../services/translations';
import { OSINT_ALERTS_DATABASE } from '../services/newsApi';

interface OsintRadarProps {
  currentLang: Language;
}

export const OsintRadar: React.FC<OsintRadarProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [selectedAlert, setSelectedAlert] = useState<OsintAlert | null>(OSINT_ALERTS_DATABASE[0]);

  const filteredAlerts = OSINT_ALERTS_DATABASE.filter((alert) => {
    if (severityFilter === 'all') return true;
    return alert.severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      {/* Banner Visual Asset with Zero-Broken-Image Fallback */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[21/9] max-h-56">
        <img
          src="/src/assets/images/osint_cyber_feed_1790977920915.jpg"
          alt="OSINT Cyber Intelligence Radar"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 flex flex-col justify-end">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>RADAR OSINT ACTIF · VEILLE ZERO-DAY SOUVERAINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.osintRadar}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Renseignement sur les menaces, bulletin de vulnérabilités CVE, et conformité de sécurité pour les applications mobiles et web.
          </p>
        </div>
      </div>

      {/* Filter Tabs (Interactive Segmented Control) */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              severityFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Toutes ({OSINT_ALERTS_DATABASE.length})
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              severityFilter === 'critical'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Critique
          </button>
          <button
            onClick={() => setSeverityFilter('high')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              severityFilter === 'high'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Élevée
          </button>
          <button
            onClick={() => setSeverityFilter('medium')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              severityFilter === 'medium'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Moyenne
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Sources : CISA · CERT-FR · NVD NIST · GitHub Advisories
        </div>
      </div>

      {/* 2-Column Responsive Layout: Alerts List & Selected Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Alerts List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredAlerts.map((alert) => {
            const isSelected = selectedAlert?.id === alert.id;
            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500/60 shadow-lg shadow-sky-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-sky-400 font-semibold">{alert.cveId}</span>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      alert.severity === 'critical'
                        ? 'text-rose-400'
                        : alert.severity === 'high'
                        ? 'text-amber-400'
                        : 'text-sky-400'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1 leading-snug">
                  {alert.title}
                </h4>
                <div className="text-xs text-slate-400 flex items-center justify-between mt-2">
                  <span>{alert.countryScope}</span>
                  <span className="font-mono">{alert.publishedDate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column: Inspector & Mitigation Terminal */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                    <span className="text-sky-400 font-semibold">{selectedAlert.cveId}</span>
                    <span>·</span>
                    <span>Périmètre : {selectedAlert.countryScope}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {selectedAlert.title}
                  </h3>
                </div>
                <a
                  href={selectedAlert.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 shrink-0"
                >
                  <span>Advisory</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div>
                <h5 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-1.5">
                  Résumé de la vulnérabilité
                </h5>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
                  {selectedAlert.summary}
                </p>
              </div>

              <div>
                <h5 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-1.5">
                  {t.affectedSystems}
                </h5>
                <p className="text-xs text-rose-300 font-mono bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-lg">
                  {selectedAlert.affectedSystem}
                </p>
              </div>

              {selectedAlert.mitigation && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs uppercase font-semibold text-emerald-400 tracking-wider mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{t.mitigation}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg font-mono text-xs text-emerald-300 space-y-1">
                    <div className="text-slate-400 text-[11px] mb-1">
                      Action recommandée dans votre workflow Flutter / Serveur :
                    </div>
                    <code>{selectedAlert.mitigation}</code>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
              Sélectionnez une alerte pour examiner les détails techniques
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
