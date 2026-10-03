import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container with rounded top */}
      <div className="relative w-full max-w-lg bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col animate-slide-up">
        {/* Grab Handle */}
        <div className="pt-3 pb-1 cursor-grab" onClick={onClose}>
          <div className="w-10 h-1.5 bg-slate-700 hover:bg-slate-600 rounded-full mx-auto" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sheet Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-3 pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
};
