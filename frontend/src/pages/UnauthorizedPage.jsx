import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 mb-1">
        HTTP 403 Access Restricted
      </span>
      <h1 className="text-2xl font-bold text-white tracking-tight">Security Clearance Required</h1>
      <p className="mt-2 text-xs text-slate-400 max-w-sm leading-relaxed">
        Your assigned employee role does not have authorization to access or mutate this operational resource.
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