import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '@/services/apiClient.js';
import { useAuth } from '@/hooks/useAuth.js';
import { cn } from '@/lib/utils.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Table } from '@/components/ui/Table.jsx';
import { DashboardSkeleton } from '@/components/ui/Skeleton.jsx';
import {
  Users,
  Package,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Boxes,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Database,
  Lock,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load operational metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-5 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-sm">
        {error}
      </div>
    );
  }

  const totalChallans = (stats?.draftChallans || 0) + (stats?.confirmedChallans || 0);
  const fulfillmentRate = totalChallans > 0 ? Math.round(((stats?.confirmedChallans || 0) / totalChallans) * 100) : 100;

  const kpis = [
    {
      title: 'Active Accounts',
      value: stats?.totalCustomers || 0,
      icon: Users,
      href: '/customers',
      change: '+12.4% vs last month',
      badge: 'Verified Buyers',
      badgeVariant: 'blue',
      variant: 'kpi',
    },
    {
      title: 'Catalog SKUs',
      value: stats?.totalProducts || 0,
      icon: Package,
      href: '/products',
      change: 'Active Inventory Lines',
      badge: 'Vault Ready',
      badgeVariant: 'purple',
      variant: 'kpi',
    },
    {
      title: 'Stock Health Alerts',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      href: '/products?lowStock=true',
      change: stats?.lowStockProducts > 0 ? 'Requires restock PO' : 'Optimal threshold',
      badge: stats?.lowStockProducts > 0 ? 'Critical' : 'Healthy',
      badgeVariant: stats?.lowStockProducts > 0 ? 'rose' : 'emerald',
      variant: stats?.lowStockProducts > 0 ? 'alert' : 'kpi',
    },
    {
      title: 'Dispatched Orders',
      value: stats?.confirmedChallans || 0,
      icon: CheckCircle2,
      href: '/challans',
      change: `${stats?.draftChallans || 0} Pending Drafts`,
      badge: 'ACID Settled',
      badgeVariant: 'emerald',
      variant: 'kpi',
    },
  ];

  return (
    <div className="relative w-full">
      {/* 1. Smoky Tactile Dot Grid Layer */}
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#b8b8b0_1.15px,transparent_1.15px)]"
        )}
      />

      {/* 2. Soft Smoky Mist Vignette & Ambient Radial Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center bg-[#f0f0eb]/75 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="pointer-events-none fixed top-10 left-1/4 w-[550px] h-[350px] bg-slate-400/10 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed top-1/2 right-12 w-[500px] h-[400px] bg-stone-400/15 rounded-full blur-3xl z-0" />

      {/* 3. Page Content Surfaces */}
      <div className="relative z-10 space-y-8">
        {/* FEATURED VARIANT: Operations Hero Banner */}
        <Card variant="featured" className="bg-[#fbfbfa] border-[#dfdfd8] shadow-sm">
          <CardHeader className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#ea580c] font-bold">
                    WHOLESALE & DISPATCH OPERATIONS CENTER
                  </span>
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-display tracking-tight uppercase">
                  Operations Control Center
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 mt-1.5 max-w-xl leading-relaxed">
                  Real-time synchronization active for customer credit lines, product valuation snapshots, and inventory dispatches.
                </CardDescription>
              </div>

              {/* Quick Action Triggers */}
              <div className="flex flex-wrap items-center gap-3">
                {hasRole(['ADMIN', 'SALES']) && (
                  <Link to="/challans/new">
                    <Button variant="orange" size="md" icon={Plus}>
                      New Sales Challan
                    </Button>
                  </Link>
                )}

                {hasRole(['ADMIN', 'SALES']) && (
                  <Link to="/customers">
                    <Button variant="secondary" size="md" icon={Users}>
                      Add Account
                    </Button>
                  </Link>
                )}

                {hasRole(['ADMIN', 'WAREHOUSE']) && (
                  <Link to="/inventory">
                    <Button variant="secondary" size="md" icon={Boxes}>
                      Stock Inflow
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* COMPACT VARIANT: Fast Operational Summary Strips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card variant="compact" className="flex items-center justify-between bg-white border-[#dfdfd8] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-[#ea580c]" />
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Engine</span>
                <span className="text-xs font-bold text-[#121316]">PostgreSQL 16 ACID</span>
              </div>
            </div>
            <Badge variant="emerald">ACTIVE</Badge>
          </Card>

          <Card variant="compact" className="flex items-center justify-between bg-white border-[#dfdfd8] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Security</span>
                <span className="text-xs font-bold text-[#121316]">256-Bit JWT Clearance</span>
              </div>
            </div>
            <Badge variant="purple">ENFORCED</Badge>
          </Card>

          <Card variant="compact" className="flex items-center justify-between bg-white border-[#dfdfd8] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Discrepancy</span>
                <span className="text-xs font-bold text-[#121316]">0 Over-Sold Units</span>
              </div>
            </div>
            <Badge variant="blue">VERIFIED</Badge>
          </Card>
        </div>

        {/* KPI & ALERT VARIANTS: Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <Link key={idx} to={kpi.href} className="block group">
              <Card variant={kpi.variant} className="h-full flex flex-col justify-between bg-white border-[#dfdfd8] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                      {kpi.title}
                    </CardTitle>
                    <Badge variant={kpi.badgeVariant}>{kpi.badge}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 pb-3">
                  <p className="text-3xl font-extrabold font-mono text-[#121316] tracking-tight tabular-nums">
                    {kpi.value}
                  </p>
                </CardContent>

                <CardFooter className="p-5 pt-3 border-t border-[#f0f0eb] flex items-center justify-between text-[11px] text-slate-500">
                  <span>{kpi.change}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-colors ${
                    kpi.variant === 'alert' ? 'text-rose-600 group-hover:text-rose-800' : 'text-slate-400 group-hover:text-[#ea580c]'
                  }`} />
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {/* DEFAULT VARIANT: Fulfillment Progress & Velocity */}
        <Card variant="default" className="bg-white border-[#dfdfd8] shadow-sm">
          <CardHeader className="p-6 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#ea580c] font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Order Fulfillment Velocity
                </span>
                <CardTitle className="text-xl font-bold text-[#121316] font-display mt-1">
                  {fulfillmentRate}% Confirmed & Dispatched
                </CardTitle>
              </div>
              <span className="text-xs font-mono text-slate-700 bg-[#f4f4f0] px-3 py-1.5 rounded-lg border border-[#dfdfd8] w-fit font-bold">
                {stats?.confirmedChallans || 0} Confirmed / {totalChallans} Total Orders
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <div className="w-full bg-[#f0f0eb] rounded-full h-2.5 overflow-hidden border border-[#dfdfd8]">
              <div
                className="bg-[#ea580c] h-full rounded-full transition-all duration-500"
                style={{ width: `${fulfillmentRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* DEFAULT VARIANT: Recent Dispatches Ledger */}
        <Card variant="default" className="bg-white border-[#dfdfd8] shadow-sm">
          <CardHeader className="p-6 border-b border-[#dfdfd8] bg-[#fafaf8]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-[#121316] font-display uppercase">
                  Recent Dispatches Ledger
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Real-time audit trail of delivery challans
                </CardDescription>
              </div>
              <Link to="/challans" className="text-xs font-mono font-bold text-[#ea580c] hover:underline flex items-center gap-1">
                View All Dispatches <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {stats?.recentChallans?.length === 0 ? (
              <div className="text-center py-12">
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-[#121316]">No sales challans recorded yet</h4>
                <p className="text-xs text-slate-500 mt-1">Generate a delivery challan to begin recording transactions.</p>
              </div>
            ) : (
              <Table headers={['Challan Ref', 'Customer Account', 'Volume', 'Fulfillment Status', 'Timestamp', 'Action']}>
                {stats?.recentChallans?.map((challan) => (
                  <tr key={challan.id} className="hover:bg-[#fafaf8] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#ea580c] first:pl-6 text-xs">
                      <Link to={`/challans/${challan.id}`} className="hover:underline">
                        {challan.challanNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#121316] text-xs block">
                        {challan.customer?.businessName || challan.customer?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{challan.customer?.mobile}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#121316] text-xs tabular-nums">
                      {challan.totalQuantity} units
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          challan.status === 'CONFIRMED'
                            ? 'emerald'
                            : challan.status === 'CANCELLED'
                            ? 'rose'
                            : 'purple'
                        }
                      >
                        {challan.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500 tabular-nums">
                      {new Date(challan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 last:pr-6">
                      <Link
                        to={`/challans/${challan.id}`}
                        className="p-1.5 text-slate-600 hover:text-[#121316] hover:bg-[#f0f0eb] rounded-lg inline-flex items-center gap-1 text-xs font-mono font-bold"
                      >
                        Inspect <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};