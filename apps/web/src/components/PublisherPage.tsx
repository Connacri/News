import React from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  History, 
  FileText, 
  Scale, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink,
  Award,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Language } from '../types';

interface PublisherPageProps {
  onBack: () => void;
  currentLang: Language;
}

export const PublisherPage: React.FC<PublisherPageProps> = ({ onBack, currentLang }) => {
  const isAr = currentLang === 'ar';

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'}
      className="space-y-5 animate-fade-in text-slate-200 pb-12"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-xs font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isAr ? 'العودة' : currentLang === 'en' ? 'Back' : 'Retour'}</span>
        </button>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Play News Verified</span>
        </div>
      </div>

      {/* Hero Card: Publisher Identity */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-semibold tracking-wide uppercase">
              <Building2 className="w-3.5 h-3.5" />
              <span>Éditeur Officiel Agréé</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Forslog Ltd
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Société éditrice de l&apos;application <strong>DZ News</strong> (<code className="text-sky-300 font-mono">com.flutternews.osint</code>). Fournisseur de solutions technologiques d&apos;agrégation d&apos;actualités, de veille scientifique et de flux d&apos;intelligence open-source.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Grid: Legal & Full Contact Details (Google Play Policy Compliance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Physical Address */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Adresse Physique du Siège</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed space-y-0.5 font-medium">
            <p className="font-bold text-white">Forslog Ltd — Siège Social</p>
            <p>Cyberparc de Sidi Abdellah, Pôle Innovation &amp; Technologies</p>
            <p>Bâtiment R&amp;D Numérique — BP 42</p>
            <p>Commune de Rahmania, Wilaya d&apos;Alger, 16093</p>
            <p className="text-slate-400 font-mono text-[11px]">Algérie (DZ)</p>
          </div>
        </div>

        {/* Direct Contacts */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Coordonnées Officielles Directes</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Téléphone Direct :</span>
              <a href="tel:+213696410953" className="font-mono font-semibold text-emerald-400 hover:underline">
                +213 696 41 09 53
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">E-mail Rédaction :</span>
              <a href="mailto:forslog@gmail.com" className="font-semibold text-sky-400 hover:underline">
                forslog@gmail.com
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Support Technique :</span>
              <span className="font-mono text-slate-300">support@forslog.com</span>
            </div>
          </div>
        </div>

        {/* Registration & Legal Identifiers */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Scale className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Immatriculation &amp; Identité Juridique</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Forme Juridique :</span>
              <span className="font-semibold text-white">Société à Responsabilité Limitée (Ltd)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Registre du Commerce :</span>
              <span className="font-mono text-amber-300">RC-16/00-984210B24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Identifiant Fiscal (NIF) :</span>
              <span className="font-mono text-slate-300">002416098421058</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Direction de Publication :</span>
              <span className="font-semibold text-white">Direction Générale Forslog Ltd</span>
            </div>
          </div>
        </div>

        {/* Hosting & Infrastructure */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Globe className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Hébergement &amp; Plateformes Cloud</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cloud Principal :</span>
              <span className="font-semibold text-white">Google Cloud &amp; Firebase</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fournisseur :</span>
              <span>Google LLC (Mountain View, USA)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Code Source &amp; CI/CD :</span>
              <span>GitHub Actions (Microsoft)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Site Officiel Web :</span>
              <a href="https://device-streaming-ccab91bb.web.app" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline flex items-center gap-1 font-mono text-[11px]">
                <span>Portail Web</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing History & Chronology */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800/80 pb-3">
          <History className="w-4 h-4 text-sky-400" />
          <span>Historique de Publication &amp; Jalons Éditoriaux</span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Milestone 1 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-sky-500/20 text-sky-400 shrink-0 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Création &amp; Lancement de DZ News</span>
                <span className="font-mono text-[11px] text-sky-400">2024</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Fondation de l&apos;initiative par Forslog Ltd pour répondre au besoin d&apos;une plateforme unifiée d&apos;actualités vérifiées couvrant l&apos;Algérie, le Maghreb et la scène technologique internationale.
              </p>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Intégration des Flux OSINT &amp; Brevets Google Patents</span>
                <span className="font-mono text-[11px] text-emerald-400">2025</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Extension du service avec des rubriques d&apos;ingénierie et de cybersécurité : veille continue des alertes CERT-FR / CISA / NIST et analyse des publications de brevets officiels USPTO et OEB.
              </p>
            </div>
          </div>

          {/* Milestone 3 */}
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Conformité Google Play News Policy &amp; Architecture Multiplateforme</span>
                <span className="font-mono text-[11px] text-amber-400">2026</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Refonte complète du moteur de synchronisation : horodatages stricts garantis sous 30 jours, méta-données Schema.org, attribution exhaustive des auteurs et déploiement simultané Flutter Mobile et Web WasmGC.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Standards & Code of Ethics */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800/80 pb-3">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Charte Déontologique &amp; Standards de Publication</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Attribution &amp; Liens Originaux</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              DZ News ne s&apos;approprie aucun contenu tiers. Chaque dépêche indique sans ambiguïté l&apos;organe de presse d&apos;origine (APS, El Watan, TSA, Le Monde, Reuters, etc.), le nom du journaliste ou de la rédaction, et inclut un lien direct.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Fraîcheur &amp; Horodatage Rigoureux</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Tous les flux sont mis à jour en continu. Les articles affichent un horodatage vérifiable de moins de 30 jours pour répondre aux critères de fraîcheur Google Play.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zéro Publicité &amp; Zéro Profilage</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Aucune bannière publicitaire, aucun réseau d&apos;ad-tracking, aucun cookie invasif. Le service est entièrement respectueux de la vie privée (RGPD).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Procédure de Retrait sous 48h</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Tout éditeur tiers peut solliciter sans frais la correction ou le déréférencement d&apos;un article en contactant notre bureau éditorial (délai garanti sous 48h).
            </p>
          </div>
        </div>
      </div>

      {/* Team & Governance */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800/80 pb-3">
          <Users className="w-4 h-4 text-purple-400" />
          <span>Gouvernance &amp; Responsables Éditoriaux</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="font-bold text-white">Direction Générale</div>
            <div className="text-slate-400 mt-1">Forslog Ltd Management</div>
            <div className="text-sky-400 font-mono text-[10px] mt-2">direction@forslog.com</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="font-bold text-white">Rédaction en Chef</div>
            <div className="text-slate-400 mt-1">Pôle Veille &amp; Presse</div>
            <div className="text-sky-400 font-mono text-[10px] mt-2">forslog@gmail.com</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="font-bold text-white">Ingénierie &amp; Sécurité</div>
            <div className="text-slate-400 mt-1">Infrastructure Multiplateforme</div>
            <div className="text-sky-400 font-mono text-[10px] mt-2">tech@forslog.com</div>
          </div>
        </div>
      </div>

      {/* Official Documentation Links Footer */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Dernière révision légale : Octobre 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/mentions-legales.html" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
            Mentions Légales HTML
          </a>
          <a href="/contact.html" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
            Page Contact HTML
          </a>
          <a href="/security-policy.html" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
            Confidentialité RGPD
          </a>
        </div>
      </div>
    </div>
  );
};
