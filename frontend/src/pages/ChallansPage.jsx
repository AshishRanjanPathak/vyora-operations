import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { challanService } from '../services/challanService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { formatDate } from '../lib/utils.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import { Plus, Search, FileSpreadsheet, Eye } from 'lucide-react';

export const ChallansPage = () => {
  const { hasRole } = useAuth();
  const [challans, setChallans] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Performance: Debounce search input
  const debouncedSearch = useDebounce(search, 300);

  const fetchChallans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await challanService.getChallans({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: status || undefined,
      });
      setChallans(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch sales delivery challans');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    fetchChallans();
  }, [fetchChallans]);

  const canCreateChallan = hasRole(['ADMIN', 'SALES']);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#121316] font-display tracking-tight uppercase">Sales Delivery Dispatches</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            ACID-settled dispatch orders, price snapshots, and ownership transfer receipts.
          </p>
        </div>
        {canCreateChallan && (
          <Link to="/challans/new">
            <Button variant="orange" size="md" icon={Plus}>
              Create Sales Challan
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e4e4df] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search challan reference (e.g. CH-2026-0001)..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] font-mono"
            />
          </div>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-mono font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="DRAFT">DRAFT (Pending Confirmation)</option>
            <option value="CONFIRMED">CONFIRMED (Stock Deducted & Settled)</option>
            <option value="CANCELLED">CANCELLED (Stock Reverted)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : challans.length === 0 ? (
        <Card className="text-center py-12">
          <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#121316]">No delivery challans recorded</h3>
          <p className="text-xs text-slate-500 mt-1">Generate a sales delivery challan to begin dispatching goods.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Table headers={['Challan Identifier', 'Buyer Entity', 'Total Quantity', 'Fulfillment State', 'Execution Date', 'Actions']}>
            {challans.map((ch) => (
              <tr key={ch.id} className="hover:bg-[#fafaf8] transition-colors">
                <td className="py-3 px-4 first:pl-6">
                  <Link to={`/challans/${ch.id}`} className="font-mono font-bold text-[#ea580c] hover:underline text-xs block">
                    {ch.challanNumber}
                  </Link>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {ch.id.slice(0, 8)}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-bold text-[#121316] text-xs block">
                    {ch.customer?.businessName || ch.customer?.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{ch.customer?.mobile}</span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-[#121316] text-xs tabular-nums">
                  {ch.totalQuantity} units
                </td>
                <td className="py-3 px-4">
                  <Badge
                    variant={
                      ch.status === 'CONFIRMED'
                        ? 'emerald'
                        : ch.status === 'CANCELLED'
                        ? 'rose'
                        : 'purple'
                    }
                  >
                    {ch.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-xs font-mono text-slate-500 tabular-nums">
                  {formatDate(ch.createdAt)}
                </td>
                <td className="py-3 px-4 last:pr-6">
                  <Link
                    to={`/challans/${ch.id}`}
                    className="p-1.5 text-slate-600 hover:text-[#121316] hover:bg-[#f0f0eb] rounded-lg inline-flex items-center gap-1 text-xs font-mono font-bold"
                  >
                    <Eye className="w-4 h-4" /> Inspect
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