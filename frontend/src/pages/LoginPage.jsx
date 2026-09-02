import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building,
  Boxes,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

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
      {/* LEFT 50%: Dark Industrial Hero Panel with Full-Bleed Artwork Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#121316] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        {/* Full-Bleed Anime Logistics Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 scale-105 pointer-events-none"
          style={{ backgroundImage: `url('/assets/logistics_hero.jpg')` }}
        />
        {/* Atmospheric Gradient Overlays for 100% Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-[#121316]/75 to-[#121316]/85 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ea580c]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-white text-[#121316] flex items-center justify-center font-mono font-bold text-base shadow-sm">
            V
          </div>
          <div>
            <span className="font-extrabold text-white text-lg tracking-tight font-display uppercase block drop-shadow-sm">
              VYORA OPERATIONS
            </span>
            <span className="text-[10px] text-slate-300 font-mono tracking-widest uppercase block drop-shadow-sm">
              INDUSTRIAL ERP GATEWAY
            </span>
          </div>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto py-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-mono text-[#ea580c] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
            <span className="text-white font-bold">SINGLE SIGN-ON GATEWAY</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold font-display uppercase tracking-tight text-white leading-tight drop-shadow-md">
            High-Throughput Logistics & Financial Governance
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed drop-shadow-sm">
            Enterprise resource governance with atomic multi-location inventory reconciliation, buyer credit management, and ACID tax dispatches.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
            <div className="p-4 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md space-y-1 shadow-lg">
              <span className="text-slate-300 uppercase text-[10px] block font-bold">Relational Integrity</span>
              <span className="text-white font-extrabold text-sm">ACID 100% Verified</span>
            </div>
            <div className="p-4 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md space-y-1 shadow-lg">
              <span className="text-slate-300 uppercase text-[10px] block font-bold">Access Security</span>
              <span className="text-white font-extrabold text-sm">Role-Based RBAC</span>
            </div>
          </div>
        </div>

        {/* Bottom System Status */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-300 border-t border-white/15 pt-4">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
            <span className="font-bold text-white">Cluster Status: Nominal</span>
          </span>
          <span className="text-slate-400">v2026.4.0</span>
        </div>
      </div>

      {/* RIGHT 50%: Minimal High-Contrast Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded bg-[#121316] text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
              V
            </div>
            <div>
              <span className="font-extrabold text-[#121316] text-base tracking-tight font-display uppercase block">
                VYORA
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider block -mt-1">
                OPERATIONS ERP
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-display uppercase tracking-tight">
              Sign In to Console
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 font-sans">
              Enter your corporate credentials to access your departmental workspace.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Corporate Email Address"
              type="email"
              placeholder="e.g. admin@minierp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Security Access Key (Password)"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="orange"
                size="lg"
                className="w-full font-mono text-xs uppercase tracking-wider"
                isLoading={isLoading}
                icon={ArrowRight}
              >
                Authenticate & Enter Console
              </Button>
            </div>
          </form>

          {/* Quick-Fill Persona Test Buttons */}
          <div className="space-y-3 pt-6 border-t border-[#e4e4df]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
              1-Click Persona Sign-In (Demo Credentials):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@minierp.com')}
                className="p-2.5 rounded-lg border border-[#dcdcd5] bg-white hover:border-[#121316] text-[#121316] text-center text-xs font-mono font-bold transition-all btn-press"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sales@minierp.com')}
                className="p-2.5 rounded-lg border border-[#dcdcd5] bg-white hover:border-[#121316] text-[#121316] text-center text-xs font-mono font-bold transition-all btn-press"
              >
                SALES
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('warehouse@minierp.com')}
                className="p-2.5 rounded-lg border border-[#dcdcd5] bg-white hover:border-[#121316] text-[#121316] text-center text-xs font-mono font-bold transition-all btn-press"
              >
                VAULT
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('accounts@minierp.com')}
                className="p-2.5 rounded-lg border border-[#dcdcd5] bg-white hover:border-[#121316] text-[#121316] text-center text-xs font-mono font-bold transition-all btn-press"
              >
                AUDIT
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs font-mono text-slate-500 hover:text-[#121316] underline">
              ← Return to Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};