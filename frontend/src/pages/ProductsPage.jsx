import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { productService } from '../services/productService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { formatCurrency } from '../lib/utils.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import { Plus, Search, AlertTriangle, Package, Trash2, Edit } from 'lucide-react';

const CATEGORIES_LIST = ['All', 'Electronics', 'Mobile', 'Audio'];

const INITIAL_FORM_STATE = {
  name: '',
  sku: '',
  category: 'Electronics',
  unitPrice: '',
  currentStock: 0,
  minimumStock: 5,
  warehouseLocation: '',
};

export const ProductsPage = () => {
  const { hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get('lowStock') === 'true');
  const [page, setPage] = useState(1);

  // Performance: Debounce live search
  const debouncedSearch = useDebounce(search, 300);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProducts({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        category: category && category !== 'All' ? category : undefined,
        lowStock: lowStockOnly ? 'true' : undefined,
      });
      setProducts(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch catalog products');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, category, lowStockOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (prod = null) => {
    setEditingProduct(prod);
    if (prod) {
      setFormData({
        name: prod.name,
        sku: prod.sku,
        category: prod.category,
        unitPrice: prod.unitPrice,
        currentStock: prod.currentStock,
        minimumStock: prod.minimumStock,
        warehouseLocation: prod.warehouseLocation || '',
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        toast.success(`SKU "${formData.sku}" updated successfully!`);
      } else {
        await productService.createProduct(formData);
        toast.success(`Product SKU "${formData.sku}" cataloged!`);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to save product SKU');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Permanently remove ${name} from inventory catalog?`)) {
      try {
        await productService.deleteProduct(id);
        toast.success(`SKU "${name}" archived from catalog`);
        fetchProducts();
      } catch (err) {
        toast.error(err.message || 'Deletion denied');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#121316] font-display tracking-tight uppercase">Master Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            SKU pricing, warehouse locations, and automated safety stock alert boundaries.
          </p>
        </div>
        {hasRole(['ADMIN']) && (
          <Button onClick={() => handleOpenModal()} variant="orange" size="md" icon={Plus}>
            New Catalog SKU
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e4e4df] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search SKU code, product name, warehouse aisle..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] font-medium"
            />
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
          >
            <option value="">All Categories</option>
            {CATEGORIES_LIST.filter(c => c !== 'All').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => { setLowStockOnly(!lowStockOnly); setPage(1); }}
            className={`w-full px-3.5 py-2 text-xs font-bold font-mono rounded-lg border flex items-center justify-center gap-2 transition-all btn-press ${
              lowStockOnly
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-white border-[#dcdcd5] text-slate-700 hover:border-[#121316]'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockOnly ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>Low Stock Alert Filter</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : products.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#121316]">No product items found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust search parameters or add a new SKU item to the catalog.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Table headers={['SKU & Item Name', 'Category', 'Unit Spot Valuation', 'Physical Stock', 'Alert Min', 'Warehouse Bin', 'Actions']}>
            {products.map((p) => {
              const isLow = p.currentStock <= p.minimumStock;
              return (
                <tr key={p.id} className="hover:bg-[#fafaf8] transition-colors">
                  <td className="py-3 px-4 first:pl-6">
                    <span className="font-mono font-bold text-[#ea580c] text-xs block">{p.sku}</span>
                    <span className="font-bold text-[#121316] text-xs block">{p.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="purple">{p.category}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#121316] text-xs tabular-nums">
                    {formatCurrency(p.unitPrice)}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">
                    <span className={`font-bold tabular-nums ${isLow ? 'text-rose-600 font-extrabold' : 'text-emerald-700'}`}>
                      {p.currentStock} units
                    </span>
                    {isLow && (
                      <span className="block text-[10px] font-mono text-rose-600 font-bold uppercase">Restock Req</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500 tabular-nums">
                    {p.minimumStock} min
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-700 font-medium">{p.warehouseLocation || '-'}</td>
                  <td className="py-3 px-4 last:pr-6">
                    <div className="flex items-center gap-1.5">
                      {hasRole(['ADMIN', 'WAREHOUSE']) && (
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="p-1.5 text-slate-600 hover:text-[#121316] hover:bg-[#f0f0eb] rounded-lg btn-press"
                          title="Edit SKU properties"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {hasRole(['ADMIN']) && (
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg btn-press"
                          title="Archive SKU"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      {/* SKU Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Catalog SKU: ${editingProduct.sku}` : 'Register Master SKU Item'}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Product Title"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enterprise Server Rack PSU 850W"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU Identifier Code"
              name="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              placeholder="PSU-850-ENT"
              required
            />
            <Input
              label="Product Category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Electronics / Audio / Spares"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Unit Price (INR)"
              name="unitPrice"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              placeholder="14500.00"
              required
            />
            <Input
              label="Warehouse Bin / Aisle Code"
              name="warehouseLocation"
              value={formData.warehouseLocation}
              onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
              placeholder="Aisle 4 - Shelf B2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Physical Stock Level"
              name="currentStock"
              type="number"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
              required
              disabled={!!editingProduct}
            />
            <Input
              label="Minimum Stock Alert Threshold"
              name="minimumStock"
              type="number"
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value, 10) || 0 })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e4e4df]">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange" isLoading={isSubmitting}>
              {editingProduct ? 'Update SKU' : 'Catalog SKU'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};