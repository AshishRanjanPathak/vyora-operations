import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth.js';
import { authService } from '../services/authService.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ShieldCheck, Lock, User, KeyRound, Database, CheckCircle2, RefreshCw } from 'lucide-react';

export const SettingsPage = () => {
  const { user, token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Security access key updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#121316] font-display tracking-tight uppercase">
          Workspace Governance & Security
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Manage your departmental clearance, credentials, and active session configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Profile & Identity Card */}
        <div className="space-y-6 md:col-span-1">
          <Card variant="featured">
            <CardHeader className="p-5 pb-3">
              <span className="text-[10px] font-mono font-bold text-[#ea580c] uppercase tracking-wider block">
                AUTHENTICATED OPERATOR
              </span>
              <CardTitle className="text-lg mt-0.5">{user?.name || 'Administrator'}</CardTitle>
              <CardDescription className="font-mono text-xs">{user?.email}</CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4 text-xs">
              <div className="pt-3 border-t border-[#f0f0eb] space-y-2 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Clearance:</span>
                  <Badge variant={user?.role === 'ADMIN' ? 'orange' : 'blue'}>
                    {user?.role} CLEARANCE
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Operator ID:</span>
                  <span className="text-slate-700">{user?.id?.slice(0, 10)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="compact" className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
              Session Encryption
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-mono">
              256-bit JWT HS256 active. Token expires in 7 days of inactivity.
            </p>
          </Card>
        </div>

        {/* Right 2 Cols: Security & Password Update */}
        <div className="space-y-6 md:col-span-2">
          <Card variant="default">
            <CardHeader className="p-6 pb-4 border-b border-[#e4e4df] bg-[#fafaf8]">
              <CardTitle className="text-sm uppercase flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#ea580c]" /> Update Security Access Key (Password)
              </CardTitle>
              <CardDescription>
                Modify your authentication key across all connected terminal sessions.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Current Access Key (Password)"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Security Key (Min. 6 Chars)"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />

                  <Input
                    label="Confirm New Security Key"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-[#e4e4df]">
                  <Button
                    type="submit"
                    variant="orange"
                    size="md"
                    isLoading={isUpdatingPassword}
                    icon={Lock}
                  >
                    Commit New Security Key
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* System Environment Governance */}
          <Card variant="default">
            <CardHeader className="p-6 pb-4 border-b border-[#e4e4df] bg-[#fafaf8]">
              <CardTitle className="text-sm uppercase flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" /> Database & Cluster Specifications
              </CardTitle>
              <CardDescription>
                Relational schema properties and active ACID isolation invariants.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-4 space-y-3 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-[#fafaf8] border border-[#e4e4df] space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Persistence Engine</span>
                  <p className="font-bold text-[#121316]">PostgreSQL 16 Enterprise</p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#fafaf8] border border-[#e4e4df] space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">ORM / Client Layer</span>
                  <p className="font-bold text-[#121316]">Prisma ACID Client</p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#fafaf8] border border-[#e4e4df] space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Transaction Locking</span>
                  <p className="font-bold text-emerald-700">Strict Serialization</p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#fafaf8] border border-[#e4e4df] space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Challan Sequencing</span>
                  <p className="font-bold text-[#121316]">CH-YYYY-0000 Monotonic</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};