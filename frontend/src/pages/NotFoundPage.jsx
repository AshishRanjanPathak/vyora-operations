import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/[0.1] flex items-center justify-center text-slate-400 mb-4 shadow-xl">
        <FileQuestion className="w-8 h-8" />
      </div>
      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">
        HTTP 404 Clearance Missing
      </span>
      <h1 className="text-2xl font-bold text-white tracking-tight">Resource Not Found</h1>
      <p className="mt-2 text-xs text-slate-400 max-w-sm leading-relaxed">
        The requested portal module, ledger record, or challan does not exist in the database or has been decommissioned.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => navigate(-1)} variant="outline" size="sm" icon={ArrowLeft}>
          Go Back
        </Button>
        <Link to="/dashboard">
          <Button variant="primary" size="sm" icon={Home}>
            Treasury Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};