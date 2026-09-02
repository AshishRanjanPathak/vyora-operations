import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CloudShader } from '@/components/ui/cloud-shader';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import {
  Boxes,
  ShieldCheck,
  FileSpreadsheet,
  Users,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Lock,
  Zap,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const LandingPage = () => {
  const [previewTab, setPreviewTab] = useState('inventory');
  const [stockDelta, setStockDelta] = useState(148);

  return (
    <div className="min-h-screen bg-[#0d1527] text-white selection:bg-[#ea580c]/30 selection:text-white relative overflow-hidden font-sans">
      {/* 1. Full-bleed Hero Section with Official Aceternity Cloud Shader */}
      <div className="relative min-h-[52rem] w-full overflow-hidden">
        <CloudShader
          className="absolute inset-0"
          speed={1}
          count={6}
          cloudColor="#fbf8f2"
          skyTopColor="#2563eb"
          skyBottomColor="#93c5fd"
        />

        {/* Top Navbar */}
        <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base font-bold font-mono text-[#121316] shadow-md">
              V
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white drop-shadow-md font-display uppercase block">
                VYORA
              </span>
              <span className="text-[10px] text-white/80 font-mono font-semibold block -mt-1 tracking-wider drop-shadow-sm">
                OPERATIONS ERP
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-white/90 drop-shadow md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#ledger" className="transition hover:text-white">
              Vault Ledger
            </a>
            <a href="#challans" className="transition hover:text-white">
              Dispatches
            </a>
            <a href="#dossiers" className="transition hover:text-white">
              Buyer Dossiers
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm font-semibold text-white/90 drop-shadow transition hover:text-white sm:block"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[#121316] shadow-lg transition hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch Console
            </Link>
          </div>
        </nav>

        {/* Hero Copy */}
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pt-10 text-center md:pt-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-mono text-white mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
            <span>ENTERPRISE RELEASE 2026.4 - CLOUD OPERATIONS ENGINE</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg font-display uppercase md:text-6xl lg:text-7xl leading-[1.05]">
            OPERATIONS, WITHOUT <br className="hidden md:block" />
            <span className="text-white underline decoration-white/40 underline-offset-8">
              THE CHAOS.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base text-white/90 drop-shadow-md font-sans md:text-lg leading-relaxed">
            Wholesale buyer CRM, serialized SKU catalog, real-time inventory ledger, and ACID delivery challans built for high-throughput commercial distributors.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="rounded-full bg-[#ea580c] px-7 py-3 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#ea580c]/90 flex items-center gap-2"
            >
              Open Operations Console <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#preview"
              className="rounded-full border border-white/50 bg-white/15 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/25"
            >
              Explore Live Demo
            </a>
          </div>

          <p className="mt-4 text-xs text-white/80 drop-shadow-sm font-mono">
            ACID Relational Integrity &middot; Multi-Location Warehouse Vaults
          </p>
        </div>

        {/* Live Device Frame Embedded in Hero */}
        <div id="preview" className="relative z-10 mx-auto mt-12 w-full max-w-6xl px-4 pb-12 md:mt-16 md:px-8">
          <div className="rounded-2xl border border-white/40 bg-white/25 p-2 shadow-2xl backdrop-blur-md md:rounded-[2rem] md:p-3">
            {/* Inner Dashboard Simulation */}
            <div className="bg-[#fbfbfa] text-[#121316] rounded-xl border border-[#e4e4df] p-4 sm:p-6 space-y-6 shadow-lg">
              {/* Device Chrome */}
              <div className="bg-[#fafaf8] border border-[#e4e4df] rounded-xl px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-slate-500 ml-2 hidden sm:inline">
                    https://app.vyora.internal/operations/vault
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded border border-emerald-300">
                  SYSTEM NOMINAL
                </span>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e4e4df] pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewTab('inventory')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      previewTab === 'inventory'
                        ? 'bg-[#121316] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-[#f0f0eb]'
                    }`}
                  >
                    Vault Ledger
                  </button>
                  <button
                    onClick={() => setPreviewTab('challans')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      previewTab === 'challans'
                        ? 'bg-[#121316] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-[#f0f0eb]'
                    }`}
                  >
                    Dispatches
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-600">Simulate Intake:</span>
                  <button
                    onClick={() => setStockDelta((prev) => prev + 10)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <ArrowDownRight className="w-3 h-3" /> +10 Units
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#e4e4df]">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Active SKU Reserve</span>
                  <p className="text-2xl font-mono font-extrabold text-[#121316] mt-1">{stockDelta} Units</p>
                  <span className="text-[11px] text-emerald-700 font-bold font-mono">100% Verified Stock</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#e4e4df]">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Pending Challans</span>
                  <p className="text-2xl font-mono font-extrabold text-[#121316] mt-1">3 Drafts</p>
                  <span className="text-[11px] text-purple-700 font-bold font-mono">Ready for Dispatch</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#e4e4df]">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Transaction Engine</span>
                  <p className="text-2xl font-mono font-extrabold text-[#121316] mt-1">ACID 100%</p>
                  <span className="text-[11px] text-[#ea580c] font-bold font-mono">0 Over-Allocation</span>
                </div>
              </div>

              {/* Mini Table */}
              <div className="bg-white rounded-xl border border-[#e4e4df] overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#f4f4f0] text-slate-700 font-bold border-b border-[#e4e4df]">
                    <tr>
                      <th className="py-2.5 px-4">SKU / Item</th>
                      <th className="py-2.5 px-4">Action Vector</th>
                      <th className="py-2.5 px-4 text-right">Volume</th>
                      <th className="py-2.5 px-4 text-right">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e4df] text-slate-800">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#121316]">PSU-850-ENT (Server PSU)</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-bold">INFLOW - Supplier Intake</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-700">+{stockDelta - 148 + 50} units</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-800">CONFIRMED</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#121316]">DISP-4K-60HZ (Pro Monitor)</td>
                      <td className="py-2.5 px-4 text-[#ea580c] font-bold">OUTFLOW - Delivery Challan</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-700">-24 units</td>
                      <td className="py-2.5 px-4 text-right font-bold text-purple-700">DISPATCHED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Industrial Pillars */}
      <section id="features" className="py-24 bg-white text-[#121316] relative border-t border-[#e4e4df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold text-[#ea580c] uppercase tracking-widest">
              ENGINEERED FOR COMMERCIAL SCALE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121316] font-display uppercase tracking-tight">
              A System Built Around Real Physical Logistics
            </h2>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              Every operation follows strict relational invariants. No orphaned invoices, no untracked inventory shifts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div id="dossiers" className="p-8 rounded-2xl bg-[#fbfbfa] border border-[#e4e4df] space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#e4e4df] flex items-center justify-center text-[#ea580c] shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#121316] font-display uppercase">Wholesale Buyer Dossiers</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Manage commercial accounts, verify GSTIN registrations, and log chronological credit assessments and follow-ups.
              </p>
            </div>

            <div id="ledger" className="p-8 rounded-2xl bg-[#fbfbfa] border border-[#e4e4df] space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#e4e4df] flex items-center justify-center text-[#ea580c] shadow-sm">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#121316] font-display uppercase">Vault Inventory Ledger</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Every physical arrival and delivery dispatch modifies stock through strict database transactions with complete audit history.
              </p>
            </div>

            <div id="challans" className="p-8 rounded-2xl bg-[#fbfbfa] border border-[#e4e4df] space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#e4e4df] flex items-center justify-center text-[#ea580c] shadow-sm">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#121316] font-display uppercase">Tax Challans & Dispatches</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Generate official delivery challans with locked unit pricing, consignor/consignee metadata, and instant printable receipts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Operational CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#121316] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono text-[#ea580c] font-bold uppercase tracking-widest block">
              GET STARTED IN SECONDS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display uppercase tracking-tight">
              OPERATIONS, SIMPLIFIED.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Access the unified operations platform to begin managing wholesale buyers, real-time inventory, and delivery challans.
            </p>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="orange" size="lg" icon={ArrowRight} className="font-mono">
                  Sign In to Console
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="border-t border-[#e4e4df] py-8 bg-[#fbfbfa] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <p>© 2026 VYORA OPERATIONS ERP. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-[#121316]">Console Login</Link>
            <span className="hover:text-[#121316]">Documentation</span>
            <span className="hover:text-[#121316]">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};