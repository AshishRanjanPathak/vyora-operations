import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { stockService } from '../services/stockService.js';
import { productService } from '../services/productService.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatDate } from '../lib/utils.js';
import { exportToCSV } from '../lib/exportUtils.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import { Plus, ArrowDownRight, ArrowUpRight, Boxes, Download } from 'lucide-react';

export const InventoryPage = () => {
  const { hasRole } = useAuth();
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    type: 'IN',
    reason: '',
  });

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await stockService.getMovements({
        page,
        limit: 10,
        type: typeFilter || undefined,
      });
      setMovements(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch inventory movements.');
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productService.getProducts({ limit: 100 });
      const prods = res.data || [];
      setProducts(prods);
      if (prods.length > 0) {
        setFormData((prev) => (prev.productId ? prev : { ...prev, productId: prods[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRecordMovement = async (e) => {
    e.preventDefault();

    if (!formData.productId) {
      toast.error('Please select a valid product SKU.');
      return;
    }

    setIsSubmitting(true);

    try {
      await stockService.recordMovement({
        productId: formData.productId,
        quantity: parseInt(formData.quantity, 10) || 1,
        type: formData.type,
        reason: formData.reason.trim() || 'Manual vault stock adjustment',
      });
      toast.success(`Vault movement (${formData.type} ${formData.quantity} units) recorded!`);
      setIsModalOpen(false);
      setFormData({
        productId: products[0]?.id || '',
        quantity: 1,
        type: 'IN',
        reason: '',
      });
      fetchMovements();
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to record stock movement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (!movements.length) {
      toast.error('No inventory movement records to export');
      return;
    }
    const exportData = movements.map((m) => ({
      ID: m.id,
      Timestamp: m.createdAt,
      VectorType: m.type,
      SKU: m.product?.sku,
      ProductName: m.product?.name,
      QuantityShift: m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`,
      Reason: m.reason || (m.challanId ? 'Delivery Challan Dispatch' : 'Adjustment'),
      AuthorizedBy: m.user?.name || m.user?.email || 'Operations Desk',
    }));
    exportToCSV(exportData, `vault-stock-movements-${Date.now()}.csv`);
    toast.success('Vault movement ledger exported to CSV');
  };

  const canRecordStock = hasRole(['ADMIN', 'WAREHOUSE']);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#121316] font-display tracking-tight uppercase">Vault Inventory & Audit Ledger</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Physical arrivals, dispatch fulfillment deductions, and manual reconciliation logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="secondary" size="md" icon={Download}>
            Export CSV
          </Button>
          {canRecordStock && (
            <Button onClick={() => setIsModalOpen(true)} variant="orange" size="md" icon={Plus}>
              Record Stock Inflow
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e4e4df] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-64 px-3.5 py-2 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
          >
            <option value="">All Movement Vectors (In & Out)</option>
            <option value="IN">Inflow (Supplier Arrivals & Restock)</option>
            <option value="OUT">Outflow (Dispatches & Adjustments)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : movements.length === 0 ? (
        <Card className="text-center py-12">
          <Boxes className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#121316]">No stock movement records</h3>
          <p className="text-xs text-slate-500 mt-1">Record inbound supplier deliveries to start logging warehouse movements.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Table headers={['Timestamp', 'Vector Type', 'SKU & Item', 'Volume Shift', 'Operational Reason', 'Authorized By']}>
            {movements.map((m) => {
              const isIn = m.type === 'IN';
              return (
                <tr key={m.id} className="hover:bg-[#fafaf8] transition-colors">
                  <td className="py-3 px-4 first:pl-6 text-xs font-mono text-slate-500 tabular-nums">
                    {formatDate(m.createdAt, true)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider border ${
                      isIn ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {isIn ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      <span>{m.type === 'IN' ? 'INFLOW' : 'OUTFLOW'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#ea580c] text-xs block">{m.product?.sku}</span>
                    <span className="font-bold text-[#121316] text-xs block">{m.product?.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-extrabold text-xs tabular-nums">
                    <span className={isIn ? 'text-emerald-700' : 'text-amber-700'}>
                      {isIn ? '+' : '-'}{m.quantity} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700 font-medium">
                    {m.reason || (m.challanId ? 'Sales Delivery Challan Dispatch' : 'Vault Balancing')}
                  </td>
                  <td className="py-3 px-4 last:pr-6 text-xs font-mono text-slate-500">
                    {m.user?.name || m.user?.email || 'Operations Desk'}
                  </td>
                </tr>
              );
            })}
          </Table>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      {/* Stock Movement Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Vault Movement Inflow/Outflow">
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
              Select Product SKU <span className="text-[#ea580c]">*</span>
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - Reserve: {p.currentStock}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                Movement Direction <span className="text-[#ea580c]">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                required
              >
                <option value="IN">INFLOW (+ Increase Stock)</option>
                <option value="OUT">OUTFLOW (- Decrease Stock)</option>
              </select>
            </div>

            <Input
              label="Quantity Delta (Units)"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
              Reason / Source Note
            </label>
            <textarea
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Supplier PO #9021 arrival, warehouse intake audit, internal damage write-off..."
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-[#ea580c]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e4e4df]">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange" isLoading={isSubmitting}>
              Commit Vault Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};