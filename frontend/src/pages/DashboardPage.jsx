import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient.js';
import { useAuth } from '../hooks/useAuth.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import {
  Users,
  Package,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      href: '/customers',
    },
    {
      title: 'Catalog Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      href: '/products',
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      href: '/products?lowStock=true',
      badge: stats?.lowStockProducts > 0 ? 'Needs Attention' : 'Healthy',
      badgeVariant: stats?.lowStockProducts > 0 ? 'amber' : 'emerald',
    },
    {
      title: 'Draft Challans',
      value: stats?.draftChallans || 0,
      icon: Clock,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      href: '/challans',
    },
    {
      title: 'Confirmed Challans',
      value: stats?.confirmedChallans || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      href: '/challans',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is your live operations overview across Customers, Products, and Warehouse inventory.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <Link key={i} to={stat.href} className="block group">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.badge && <Badge variant={stat.badgeVariant}>{stat.badge}</Badge>}
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Challans Activity */}
      <Card
        title="Recent Sales Challans"
        subtitle="Latest dispatched and draft orders"
        action={
          <Link to="/challans" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {stats?.recentChallans?.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No sales challans recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-500 uppercase border-b border-slate-100 pb-2">
                  <th className="pb-3">Challan #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentChallans?.map((challan) => (
                  <tr key={challan.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-800">
                      <Link to={`/challans/${challan.id}`} className="hover:text-emerald-600">
                        {challan.challanNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-600">{challan.customer?.businessName || challan.customer?.name}</td>
                    <td className="py-3 font-medium text-slate-700">{challan.totalQuantity} units</td>
                    <td className="py-3">
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
                    <td className="py-3 text-xs text-slate-400">
                      {new Date(challan.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
