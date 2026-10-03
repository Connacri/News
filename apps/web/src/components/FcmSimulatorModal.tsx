import React, { useState } from 'react';
import { X, Bell, Send, Copy, Check, Radio, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CountryCode, FcmPayload, Language } from '../types';
import { COUNTRIES } from '../services/countries';
import { translations } from '../services/translations';

interface FcmSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onTriggerPushNotification: (payload: FcmPayload) => void;
  pushHistory: FcmPayload[];
}

export const FcmSimulatorModal: React.FC<FcmSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onTriggerPushNotification,
  pushHistory,
}) => {
  const t = translations[currentLang];
  const [deviceToken, setDeviceToken] = useState('fcm_token_flutternews_8f9a2b7c4d1e038596a');
  const [hasCopied, setHasCopied] = useState(false);
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [subscribedTopics, setSubscribedTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('flutternews_fcm_subscriptions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['tech_news_all', 'tech_news_dz', 'tech_news_maghreb', 'tech_news_cn', 'tech_news_fr', 'osint_critical_alerts'];
  });

  const [formTitle, setFormTitle] = useState('🇩🇿 Alerte Tech Algérie : Cloud Souverain Déployé');
  const [formBody, setFormBody] = useState('Le Datacenter National au Cyberparc de Sidi Abdellah est officiellement opérationnel.');
  const [formCountry, setFormCountry] = useState<CountryCode>('dz');
  const [formCategory, setFormCategory] = useState('cloud');

  if (!isOpen) return null;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(deviceToken);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleRequestNativePermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPerm(perm);
    }
  };

  const handleToggleTopic = (topic: string) => {
    let updated: string[];
    if (subscribedTopics.includes(topic)) {
      updated = subscribedTopics.filter((t) => t !== topic);
    } else {
      updated = [...subscribedTopics, topic];
    }
    setSubscribedTopics(updated);
    try {
      localStorage.setItem('flutternews_fcm_subscriptions', JSON.stringify(updated));
    } catch {}
  };

  const handleSendTestPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formBody.trim()) return;

    const payload: FcmPayload = {
      title: formTitle,
      body: formBody,
      country: formCountry,
      category: formCategory,
      timestamp: Date.now(),
      topic: `tech_news_${formCountry}`
    };

    // If native notification permission is granted, trigger OS notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(formTitle, {
          body: formBody,
          icon: '/favicon.ico'
        });
      } catch (err) {
        console.warn('Native notification error:', err);
      }
    }

    onTriggerPushNotification(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t.fcmTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.fcmSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Device Token Section */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">{t.fcmTokenLabel}</span>
              <button
                onClick={handleCopyToken}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? t.copied : t.copyCode}</span>
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-400 break-all select-all bg-slate-900 p-2 rounded border border-slate-800">
              {deviceToken}
            </p>
          </div>

          {/* FCM Topics Subscription */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Abonnements aux Topics FCM par Pays :</span>
              {browserPerm !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestNativePermission}
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium"
                >
                  Activer les alertes système
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'tech_news_all', label: '🌐 /topics/tech_news_all (Monde entier)' },
                { id: 'tech_news_dz', label: '🇩🇿 /topics/tech_news_dz (Algérie Cloud & Startups)' },
                { id: 'tech_news_maghreb', label: '🌍 /topics/tech_news_maghreb (Maghreb Telecom & Fintech)' },
                { id: 'tech_news_cn', label: '🇨🇳 /topics/tech_news_cn (Chine IA & Semi-conducteurs)' },
                { id: 'tech_news_fr', label: '🇫🇷 /topics/tech_news_fr (France Tech & IA)' },
                { id: 'tech_news_us', label: '🇺🇸 /topics/tech_news_us (Silicon Valley)' },
                { id: 'tech_news_de', label: '🇩🇪 /topics/tech_news_de (Allemagne Industrie)' },
                { id: 'osint_critical_alerts', label: '🛡️ /topics/osint_critical (Alertes CVE & ZeroDay)' }
              ].map((topic) => {
                const isSubscribed = subscribedTopics.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleToggleTopic(topic.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      isSubscribed
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate text-xs font-mono">{topic.label}</span>
                    <span className="text-[10px] font-semibold uppercase ml-2 shrink-0">
                      {isSubscribed ? 'Actif' : 'Inactif'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Push Form */}
          <form onSubmit={handleSendTestPush} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Send className="w-4 h-4 text-sky-400" />
              <span>{t.fcmSendTest}</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Titre de la notification Push</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Corps du message (Payload Body)</label>
              <textarea
                rows={2}
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400">Cible Pays</label>
                <select
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value as CountryCode)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Catégorie</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="cyber">🛡️ Cybersécurité & OSINT</option>
                  <option value="ai">🤖 Intelligence Artificielle</option>
                  <option value="mobile">📱 Flutter & Mobile</option>
                  <option value="opensource">⭐ Open Source & GitHub</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <Bell className="w-4 h-4" />
              <span>Diffuser le Push FCM (Simulation & Carillon Audio)</span>
            </button>
          </form>

          {/* FCM Push History Log */}
          {pushHistory.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold text-slate-300">Journal des réceptions FCM :</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {pushHistory.map((p, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sky-400">{p.title}</span>
                      <p className="text-slate-400 text-[10px] truncate max-w-sm">{p.body}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(p.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
