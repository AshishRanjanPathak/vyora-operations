import React from 'react';

export const Badge = ({ children, variant = 'slate', className = '' }) => {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    blue: 'bg-blue-50 text-blue-800 border-blue-300',
    purple: 'bg-purple-50 text-purple-800 border-purple-300',
    amber: 'bg-amber-50 text-amber-800 border-amber-300',
    rose: 'bg-rose-50 text-rose-800 border-rose-300',
    slate: 'bg-slate-100 text-slate-800 border-slate-300',
    orange: 'bg-orange-50 text-orange-800 border-orange-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider border ${variants[variant] || variants.slate} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      {children}
    </span>
  );
};