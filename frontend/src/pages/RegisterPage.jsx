import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { ArrowRight, Building, CheckCircle2, ShieldCheck } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex font-sans selection:bg-[#ea580c]/15 selection:text-[#ea580c]">
      {/* LEFT 50%: Dark Hero Panel with Full-Bleed Artwork */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#121316] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 scale-105 pointer-events-none"
          style={{ backgroundImage: `url('/assets/logistics_hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-[#121316]/75 to-[#121316]/85 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ea580c]/20 rounded-full blur-3xl pointer-events-none" />

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
              WORKSPACE ONBOARDING
            </span>
          </div>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto py-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-mono text-[#ea580c] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
            <span className="text-white font-bold">INSTANT WORKSPACE PROVISIONING</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold font-display uppercase tracking-tight text-white leading-tight drop-shadow-md">
            Deploy Your High-Velocity Operations Hub
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed drop-shadow-sm">
            Get instant access to wholesale CRM, vault inventory auditing, locked-price dispatch orders, and ACID-enforced transactions.
          </p>

          <div className="space-y-3 pt-2 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full Master Administrator Clearance</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Dedicated PostgreSQL ACID Schema</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Printable GST Tax Challans Included</span>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-300 border-t border-white/15 pt-4">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
            <span className="font-bold text-white">Cluster Provisioning: Ready</span>
          </span>
          <span className="text-slate-400">v2026.4.0</span>
        </div>
      </div>

      {/* RIGHT 50%: Minimal Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-display uppercase tracking-tight">
              Create Enterprise Workspace
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 font-sans">
              Register your master corporate account to start managing operations.
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
              label="Administrator Full Name"
              type="text"
              placeholder="Vikram Malhotra"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Corporate Email Address"
              type="email"
              placeholder="vikram@enterprise-logistics.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Security Access Key (Min. 6 Characters)"
              type="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                Initial Workspace Clearance Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
              >
                <option value="ADMIN">Master Admin (Full Operational Clearance)</option>
                <option value="SALES">Sales Director (CRM & Challans Builder)</option>
                <option value="WAREHOUSE">Vault Ops (Stock & Dispatch Confirmation)</option>
                <option value="ACCOUNTS">Financial Auditor (Read & Tax Oversight)</option>
              </select>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="orange"
                size="lg"
                className="w-full font-mono text-xs uppercase tracking-wider"
                isLoading={isLoading}
                icon={ArrowRight}
              >
                Provision Workspace & Sign In
              </Button>
            </div>
          </form>

          <div className="text-center pt-2 font-mono text-xs text-slate-600 space-y-2">
            <p>
              Already have an enterprise login?{' '}
              <Link to="/login" className="text-[#ea580c] font-bold hover:underline">
                Sign In
              </Link>
            </p>
            <p>
              <Link to="/" className="text-slate-400 hover:text-[#121316] underline">
                ← Return to Landing Page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};