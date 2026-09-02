import React from 'react';
import { Toaster as Sonner } from 'sonner';

export const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="light"
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-[#121316] group-[.toaster]:border-[#e4e4df] group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans',
          description: 'group-[.toast]:text-slate-500 font-sans text-xs',
          actionButton:
            'group-[.toast]:bg-[#121316] group-[.toast]:text-white font-mono text-xs font-bold rounded-lg',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 font-mono text-xs font-bold rounded-lg',
        },
      }}
      {...props}
    />
  );
};