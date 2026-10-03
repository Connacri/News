import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, FolderGit2, CheckCircle2, Terminal, ArrowRight, ShieldCheck } from 'lucide-react';
import JSZip from 'jszip';
import { FLUTTER_PROJECT_FILES } from '../services/flutterCodebase';
import { Language } from '../types';
import { translations } from '../services/translations';

interface FlutterExportHubProps {
  currentLang: Language;
}

export const FlutterExportHub: React.FC<FlutterExportHubProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [selectedFile, setSelectedFile] = useState(FLUTTER_PROJECT_FILES[0]);
  const [hasCopied, setHasCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
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
      link.download = 'flutter_news_osint_complete_project.zip';
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

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
            <FolderGit2 className="w-4 h-4" />
            <span>FLUTTER 3.24 · FIREBASE FCM · GITHUB ACTIONS WORKFLOW</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.flutterExportTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            {t.flutterExportDesc}
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all flex items-center gap-2 text-xs shadow-lg shadow-sky-500/20 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'Création de l\'archive ZIP...' : t.downloadZip}</span>
        </button>
      </div>

      {/* CI/CD Release Instructions Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-sky-400 mb-1 flex items-center gap-1.5">
            <span>01.</span>
            <span>Cloner & Exécuter</span>
          </div>
          <p className="text-xs text-slate-400">
            Téléchargez le ZIP ou créez le repo GitHub, puis lancez <code className="text-slate-200">flutter pub get</code> et <code className="text-slate-200">flutter run</code>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
            <span>02.</span>
            <span>Firebase FCM & Hosting</span>
          </div>
          <p className="text-xs text-slate-400">
            Ajoutez votre <code className="text-slate-200">google-services.json</code> et configurez les topics par pays (/topics/tech_news_fr).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
            <span>03.</span>
            <span>Releases APK & AAB Auto</span>
          </div>
          <p className="text-xs text-slate-400">
            Poussez un tag <code className="text-slate-200">git tag v1.0.0</code> pour compiler automatiquement APK, AAB et déployer sur Firebase Hosting.
          </p>
        </div>
      </div>

      {/* Code Viewer: File Explorer (Left) & Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Side: File Explorer */}
        <div className="lg:col-span-4 border-r border-slate-800/80 p-4 bg-slate-900/40">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Fichiers du Projet ({FLUTTER_PROJECT_FILES.length})
          </h4>
          <div className="space-y-1">
            {FLUTTER_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full p-2.5 rounded-lg text-left text-xs font-mono transition-colors flex items-center justify-between ${
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
        <div className="lg:col-span-8 flex flex-col h-[520px]">
          {/* File Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div>
              <span className="font-mono text-xs text-white font-semibold">{selectedFile.path}</span>
              <p className="text-[11px] text-slate-400">{selectedFile.description}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hasCopied ? t.copied : t.copyCode}</span>
            </button>
          </div>

          {/* Code Body */}
          <pre className="p-4 overflow-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950 leading-relaxed select-text">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
