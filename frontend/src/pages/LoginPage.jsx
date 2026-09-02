import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { ArrowRight, Lock } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex font-sans selection:bg-[#ea580c]/15 selection:text-[#ea580c]">
      {/* LEFT 50%: Clean Dark Logistics Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#121316] text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
        {/* Ambient Subtle Background Graphic */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105 pointer-events-none"
          style={{ backgroundImage: `url('/assets/logistics_hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-[#121316]/80 to-[#121316]/90 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ea580c]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white text-[#121316] flex items-center justify-center font-mono font-bold text-sm shadow-sm">
            V
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight font-display uppercase block">
              VYORA OPERATIONS
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">
              ENTERPRISE ERP
            </span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-4 max-w-md my-auto py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-[#ea580c]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
            <span>COMMERCIAL OPERATIONS GATEWAY</span>
          </div>

          <h2 className="text-3xl font-extrabold font-display uppercase tracking-tight text-white leading-tight">
            High-Throughput Logistics & Governance
          </h2>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Multi-location inventory ledger, wholesale buyer accounts, and ACID tax dispatches.
          </p>
        </div>

        {/* System Status */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/10 pt-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Cluster Status: Nominal</span>
          </span>
          <span>v2026.4.0</span>
        </div>
      </div>

      {/* RIGHT 50%: Minimal Clean Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#121316] font-display uppercase tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Enter your credentials to access your operations console.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@minierp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="orange"
              size="lg"
              className="w-full font-mono text-xs uppercase tracking-wider"
              isLoading={isLoading}
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* Clean Register Link */}
          <div className="text-center text-xs font-sans text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#ea580c] font-bold hover:underline">
              Create account
            </Link>
          </div>

          {/* Demo 1-Click Fill */}
          <div className="space-y-2 pt-4 border-t border-[#e4e4df]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block text-center">
              1-Click Demo Logins:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@minierp.com')}
                className="py-1.5 rounded-md border border-[#dcdcd5] bg-white hover:border-[#121316] hover:bg-[#fafaf8] text-[#121316] text-center text-[11px] font-mono font-bold transition-all btn-press"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sales@minierp.com')}
                className="py-1.5 rounded-md border border-[#dcdcd5] bg-white hover:border-[#121316] hover:bg-[#fafaf8] text-[#121316] text-center text-[11px] font-mono font-bold transition-all btn-press"
              >
                SALES
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('warehouse@minierp.com')}
                className="py-1.5 rounded-md border border-[#dcdcd5] bg-white hover:border-[#121316] hover:bg-[#fafaf8] text-[#121316] text-center text-[11px] font-mono font-bold transition-all btn-press"
              >
                VAULT
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('accounts@minierp.com')}
                className="py-1.5 rounded-md border border-[#dcdcd5] bg-white hover:border-[#121316] hover:bg-[#fafaf8] text-[#121316] text-center text-[11px] font-mono font-bold transition-all btn-press"
              >
                AUDIT
              </button>
            </div>
          </div>

          <div className="text-center pt-1">
            <Link to="/" className="text-xs font-mono text-slate-400 hover:text-[#121316]">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};