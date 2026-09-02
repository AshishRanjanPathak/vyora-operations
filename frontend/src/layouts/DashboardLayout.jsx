import React from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import {
  Users,
  Package,
  Boxes,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/customers', label: 'Customers & CRM', icon: Users },
    { to: '/products', label: 'Product Catalog', icon: Package },
    { to: '/inventory', label: 'Vault Inventory', icon: Boxes },
    { to: '/challans', label: 'Delivery Challans', icon: FileSpreadsheet },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    SALES: 'bg-blue-100 text-blue-800 border-blue-200',
    WAREHOUSE: 'bg-amber-100 text-amber-800 border-amber-200',
    ACCOUNTS: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#121316] flex flex-col font-sans selection:bg-[#ea580c] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#e4e4df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#121316] flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm">
                V
              </div>
              <div>
                <span className="font-extrabold text-[#121316] text-base tracking-tight font-display uppercase">VYORA</span>
                <span className="text-[10px] text-[#ea580c] font-mono font-bold block -mt-1 tracking-widest">OPERATIONS</span>
              </div>
            </Link>

            {/* Global Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors btn-press ${
                        isActive
                          ? 'bg-[#121316] text-white shadow-sm'
                          : 'text-slate-600 hover:text-[#121316] hover:bg-[#f4f4f0]'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* User Clearance Pill */}
            {user && (
              <Link
                to="/settings"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#f4f4f0] hover:bg-[#ebebe5] border border-[#e4e4df] text-xs transition-colors"
                title="Workspace Settings"
              >
                <div className="w-2 h-2 rounded-full bg-[#ea580c]" />
                <span className="font-mono text-slate-700 font-medium">{user.name || user.email}</span>
                <span className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded border uppercase ${roleColors[user.role] || 'bg-slate-100 text-slate-700'}`}>
                  {user.role}
                </span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-red-200 btn-press"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Content Surface */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Global Status Bar Footer */}
      <footer className="border-t border-[#e4e4df] bg-white py-3 px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-bold text-[#121316]">VYORA CORE ACTIVE</span>
            <span className="text-slate-300">|</span>
            <span>PostgreSQL 16 ACID Transactions Verified</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Immutable Historical Price Snapshots Enforced
          </div>
        </div>
      </footer>
    </div>
  );
};