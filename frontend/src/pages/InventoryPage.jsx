import React, { useState, useEffect } from 'react';
import { stockService } from '../services/stockService.js';
import { productService } from '../services/productService.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Plus, ArrowDownRight, ArrowUpRight, History } from 'lucide-react';

export const InventoryPage = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    type: 'IN',
    reason: '',
  });

  const fetchMovements = async () => {
    setIsLoading(true);
    try {
      const res = await stockService.getMovements({
        page,
        limit: 10,
        type: typeFilter || undefined,
      });
      setMovements(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getProducts({ limit: 100 });
      setProducts(res.data);
      if (res.data.length > 0 && !formData.productId) {
        setFormData((prev) => ({ ...prev, productId: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [page, typeFilter]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRecordMovement = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      await stockService.recordMovement(formData);
      setIsModalOpen(false);
      setFormData({
        productId: products[0]?.id || '',
        quantity: 1,
        type: 'IN',
        reason: '',
      });
      fetchMovements();
    } catch (err) {
      setFormError(err.message || 'Failed to record stock movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory & Stock Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit trail of all physical warehouse shipments, manual receipts, and challan dispatches.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>
          Record Stock Adjustment
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-xs font-semibold text-slate-600 uppercase">Movement Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Movements</option>
            <option value="IN">IN (Stock Arrivals / Restocks)</option>
            <option value="OUT">OUT (Dispatches / Adjustments)</option>
          </select>
        </div>
      </Card>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : movements.length === 0 ? (
        <Card className="text-center py-12">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No stock movements found</h3>
          <p className="text-sm text-slate-500 mt-1">Record a stock arrival or confirm a sales challan to see history.</p>
        </Card>
      ) : (
        <div>
          <Table headers={['Type', 'Product & SKU', 'Quantity', 'Reason / Source', 'Logged By', 'Timestamp']}>
            {movements.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4">
                  {m.type === 'IN' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <ArrowDownRight className="w-3.5 h-3.5" /> IN (Stock Inflow)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <ArrowUpRight className="w-3.5 h-3.5" /> OUT (Dispatch/Loss)
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-800">{m.product?.name}</p>
                  <span className="text-xs font-mono text-slate-500">{m.product?.sku}</span>
                </td>
                <td className="py-3.5 px-4 font-extrabold text-slate-900">
                  {m.quantity} units
                </td>
                <td className="py-3.5 px-4 text-sm text-slate-700">{m.reason}</td>
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                  {m.createdBy?.name}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-400">
                  {new Date(m.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </Table>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Stock Adjustment">
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {formError}
          </div>
        )}
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Product *
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current Stock: {p.currentStock}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Movement Direction *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="IN">IN (Receive New Inventory)</option>
                <option value="OUT">OUT (Damaged / Missing / Manual Loss)</option>
              </select>
            </div>

            <Input
              label="Quantity (Units)"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
              required
            />
          </div>

          <Input
            label="Reason / Reference Note"
            name="reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g. Supplier PO #4092 arrival, warehouse audit adjustment"
            required
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Apply Stock Movement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};