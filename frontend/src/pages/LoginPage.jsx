import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@minierp.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <AuthLayout title="Sign In to Portal" subtitle="Enter your internal credentials to continue">
      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. admin@minierp.com"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Helper */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Quick Demo Accounts (password123):
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@minierp.com')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
          >
            <span className="font-bold text-slate-800 block">Admin</span>
            <span className="text-slate-400 text-[11px]">Full access</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('sales@minierp.com')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
          >
            <span className="font-bold text-slate-800 block">Sales</span>
            <span className="text-slate-400 text-[11px]">CRM & Challans</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('warehouse@minierp.com')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
          >
            <span className="font-bold text-slate-800 block">Warehouse</span>
            <span className="text-slate-400 text-[11px]">Stock & Confirm</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('accounts@minierp.com')}
            className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
          >
            <span className="font-bold text-slate-800 block">Accounts</span>
            <span className="text-slate-400 text-[11px]">View & Audit</span>
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
