import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FolderGit2, 
  Terminal, 
  Layers, 
  Smartphone, 
  Apple, 
  Globe, 
  Monitor, 
  CheckCircle2, 
  Cpu, 
  Flame, 
  ExternalLink 
} from 'lucide-react';
import JSZip from 'jszip';
import { FLUTTER_PROJECT_FILES } from '../services/flutterCodebase';
import { FlutterPlatform, Language } from '../types';
import { translations } from '../services/translations';

interface FlutterExportHubProps {
  currentLang: Language;
}

export const FlutterExportHub: React.FC<FlutterExportHubProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [selectedPlatform, setSelectedPlatform] = useState<FlutterPlatform>('android');
  const [selectedFile, setSelectedFile] = useState(FLUTTER_PROJECT_FILES[0]);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [hasCopiedCmd, setHasCopiedCmd] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  const handleCopyCmd = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setHasCopiedCmd(key);
    setTimeout(() => setHasCopiedCmd(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add each file to the zip with full relative paths
      for (const file of FLUTTER_PROJECT_FILES) {
        zip.file(file.path, file.content);
      }

      // Generate the zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Trigger download in browser
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'flutter_news_osint_crossplatform_complete.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  const platformGuides = {
    android: {
      title: t.flutterPlatformAndroid,
      icon: Smartphone,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-500/10',
      runCmd: 'flutter run -d android --enable-impeller',
      buildCmd: 'flutter build apk --release --split-per-abi && flutter build appbundle --release',
      features: [
        'Moteur Impeller Vulkan breveté (Zero-Jank à 120 FPS)',
        'Support Android 14+ (API Level 34) et Desugaring Java 17',
        'Binaires légers générés : APK universel, arm64-v8a et AAB pour Google Play',
        'Firebase Cloud Messaging (FCM) & notifications locales en arrière-plan',
      ],
      requirements: 'Android Studio Jellyfish+, JDK 17, NDK 26+',
    },
    ios: {
      title: t.flutterPlatformIos,
      icon: Apple,
      color: 'text-sky-400',
      borderColor: 'border-sky-500/40',
      bgColor: 'bg-sky-500/10',
      runCmd: 'flutter run -d ios',
      buildCmd: 'flutter build ipa --release',
      features: [
        'Rendu graphique Metal haute fidélité sans compilation dynamique',
        'Composants adaptatifs Cupertino & gestes de navigation iOS',
        'Intégration Apple Push Notification Service (APNs) via Firebase',
        'Génération automatique du package IPA pour TestFlight et App Store',
      ],
      requirements: 'macOS Sonoma+, Xcode 15+, CocoaPods 1.14+',
    },
    web: {
      title: t.flutterPlatformWeb,
      icon: Globe,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-500/10',
      runCmd: 'flutter run -d chrome --web-renderer canvaskit',
      buildCmd: 'flutter build web --release --wasm',
      features: [
        'Compilation WebAssembly (WasmGC) pour des performances natives dans le navigateur',
        'Moteur CanvasKit vectoriel garantissant un rendu pixel-perfect identique au mobile',
        'PWA complète avec service worker offline et installation sur écran d\'accueil',
        'Déploiement instantané sur Firebase Hosting avec configuration rewrite intégrée',
      ],
      requirements: 'Google Chrome ou navigateur compatible WebAssembly GC',
    },
    desktop: {
      title: t.flutterPlatformDesktop,
      icon: Monitor,
      color: 'text-violet-400',
      borderColor: 'border-violet-500/40',
      bgColor: 'bg-violet-500/10',
      runCmd: 'flutter run -d macos # ou windows / linux',
      buildCmd: 'flutter build macos # ou windows / linux',
      features: [
        'Navigation Rail adaptative exploitant les écrans larges et multi-écrans',
        'Raccourcis clavier natifs et fenêtrage multi-instances',
        'Binaires natifs C++ sans dépendances JVM ou Electron encombrantes',
        'Accès direct aux API système et bases de données SQLite/Firestore',
      ],
      requirements: 'Visual Studio (Windows), Xcode (macOS), Clang/CMake/GTK3 (Linux)',
    }
  };

  const activeGuide = platformGuides[selectedPlatform];
  const ActiveIcon = activeGuide.icon;

  return (
    <div className="space-y-4">
      {/* 1. Header Banner & ZIP Download */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>FLUTTER 3.24 · MULTIPLATEFORME (ANDROID / IOS / WEB / DESKTOP)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {t.flutterCrossPlatform}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {t.flutterPlatformsSubtitle}
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all flex items-center gap-2 text-xs shadow-lg shadow-sky-500/20 shrink-0 cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? t.zipping : t.downloadZip}</span>
        </button>
      </div>

      {/* 2. Interactive Target Platform Switcher Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
          <span>{t.flutterTargetFeatures}</span>
          <span className="text-[11px] font-mono text-sky-400">1 Codebase = 4 Runtimes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['android', 'ios', 'web', 'desktop'] as FlutterPlatform[]).map((plat) => {
            const isSelected = selectedPlatform === plat;
            const pInfo = platformGuides[plat];
            const PIcon = pInfo.icon;

            return (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[76px] ${
                  isSelected
                    ? `${pInfo.borderColor} ${pInfo.bgColor} shadow-md`
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <PIcon className={`w-4 h-4 ${isSelected ? pInfo.color : 'text-slate-500'}`} />
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <div className="mt-2">
                  <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {plat === 'android' ? 'Android' : plat === 'ios' ? 'iOS' : plat === 'web' ? 'Web (Wasm)' : 'Desktop'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {plat === 'android' ? 'APK & AAB' : plat === 'ios' ? 'IPA & Cupertino' : plat === 'web' ? 'WasmGC / CanvasKit' : 'macOS / Win / Linux'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Platform Command & Feature Details */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ActiveIcon className={`w-4 h-4 ${activeGuide.color}`} />
              <span className="text-sm font-bold text-white">{activeGuide.title}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Requis : {activeGuide.requirements}
            </span>
          </div>

          {/* Commands Box */}
          <div className="space-y-2">
            <div>
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                <span>{t.flutterRunCmdLabel} :</span>
                <button
                  onClick={() => handleCopyCmd(activeGuide.runCmd, 'run')}
                  className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  {hasCopiedCmd === 'run' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{hasCopiedCmd === 'run' ? t.copiedSuccess : 'Copier'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto select-all">
                <code>{activeGuide.runCmd}</code>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                <span>{t.flutterBuildCmdLabel} :</span>
                <button
                  onClick={() => handleCopyCmd(activeGuide.buildCmd, 'build')}
                  className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  {hasCopiedCmd === 'build' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{hasCopiedCmd === 'build' ? t.copiedSuccess : 'Copier'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto select-all">
                <code>{activeGuide.buildCmd}</code>
              </div>
            </div>
          </div>

          {/* Feature Bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900">
            {activeGuide.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Three-Step Quickstart Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-sky-400 mb-1 flex items-center gap-1.5">
            <span>{t.step1Title}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.step1Desc}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
            <span>{t.step2Title}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.step2Desc}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
            <span>{t.step3Title}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.step3Desc}
          </p>
        </div>
      </div>

      {/* 4. Complete File Tree Explorer & Source Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Side: File Explorer */}
        <div className="lg:col-span-4 border-r border-slate-800/80 p-3 bg-slate-900/40">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 px-1 flex items-center justify-between">
            <span>Fichiers Source Flutter</span>
            <span className="font-mono text-sky-400 font-bold">{FLUTTER_PROJECT_FILES.length} fichiers</span>
          </div>
          <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
            {FLUTTER_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full p-2 rounded-lg text-left text-xs font-mono transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Code Content Viewer */}
        <div className="lg:col-span-8 flex flex-col h-[420px]">
          {/* File Header */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="truncate mr-2">
              <span className="font-mono text-xs text-white font-semibold">{selectedFile.path}</span>
              <p className="text-[11px] text-slate-400 truncate">{selectedFile.description}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors shrink-0"
            >
              {hasCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{hasCopiedCode ? t.copied : t.copyCode}</span>
            </button>
          </div>

          {/* Code Body */}
          <pre className="p-3.5 overflow-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950 leading-relaxed select-text">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
