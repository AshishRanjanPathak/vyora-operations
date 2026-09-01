import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challanService } from '../services/challanService.js';
import { useAuth } from '../hooks/useAuth.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Plus, Search, Eye, FileSpreadsheet, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const ChallansPage = () => {
  const { hasRole } = useAuth();
  const [challans, setChallans] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchChallans = async () => {
    setIsLoading(true);
    try {
      const res = await challanService.getChallans({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setChallans(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, search, statusFilter]);

  const statusIcons = {
    DRAFT: <Clock className="w-3.5 h-3.5 text-purple-600 mr-1" />,
    CONFIRMED: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />,
    CANCELLED: <XCircle className="w-3.5 h-3.5 text-rose-600 mr-1" />,
  };

  const statusBadges = {
    DRAFT: 'purple',
    CONFIRMED: 'emerald',
    CANCELLED: 'rose',
  };

  const canCreateChallan = hasRole(['ADMIN', 'SALES']);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Challans</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage dispatch delivery notes, product snapshots, and warehouse fulfillment.
          </p>
        </div>
        {canCreateChallan && (
          <Link to="/challans/new">
            <Button variant="primary" icon={Plus}>
              Create Sales Challan
            </Button>
          </Link>
        )}
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Challan # (e.g. CH-2026-0001)..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT (Stock Unchanged)</option>
            <option value="CONFIRMED">CONFIRMED (Dispatched)</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </Card>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : challans.length === 0 ? (
        <Card className="text-center py-12">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No challans found</h3>
          <p className="text-sm text-slate-500 mt-1">Create a new sales delivery challan to begin.</p>
        </Card>
      ) : (
        <div>
          <Table headers={['Challan #', 'Customer Account', 'Total Quantity', 'Status', 'Created By', 'Date', 'Action']}>
            {challans.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  <Link to={`/challans/${c.id}`} className="hover:text-emerald-600">
                    {c.challanNumber}
                  </Link>
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-slate-800">{c.customer?.businessName}</p>
                  <span className="text-xs text-slate-400">{c.customer?.name}</span>
                </td>
                <td className="py-3.5 px-4 font-extrabold text-slate-900">
                  {c.totalQuantity} units
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={statusBadges[c.status]} className="flex items-center w-fit">
                    {statusIcons[c.status]}
                    {c.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                  {c.createdBy?.name}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-400">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3.5 px-4">
                  <Link
                    to={`/challans/${c.id}`}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Link>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};