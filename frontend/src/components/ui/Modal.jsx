import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div
        className={`bg-white w-full ${maxWidth} rounded-2xl shadow-2xl border border-[#dcdcd5] overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="px-6 py-4 border-b border-[#e4e4df] flex items-center justify-between bg-[#fafaf8]">
          <h3 id="modal-title" className="text-sm font-bold text-[#121316] tracking-tight font-display">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-500 hover:text-[#121316] rounded-lg hover:bg-slate-100 active:scale-95 transition-all"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-[#121316]">{children}</div>
      </div>
    </div>
  );
};