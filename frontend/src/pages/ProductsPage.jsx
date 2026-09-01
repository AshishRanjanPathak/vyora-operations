import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService.js';
import { useAuth } from '../hooks/useAuth.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Plus, Search, AlertTriangle, Package, Trash2, Edit } from 'lucide-react';

export const ProductsPage = () => {
  const { user, hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get('lowStock') === 'true');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    currentStock: 0,
    minimumStock: 5,
    warehouseLocation: '',
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProducts({
        page,
        limit: 10,
        search: search || undefined,
        category: category || undefined,
        lowStock: lowStockOnly ? 'true' : undefined,
      });
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, category, lowStockOnly]);

  const handleOpenModal = (prod = null) => {
    setEditingProduct(prod);
    setFormError('');
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
      setFormData({
        name: '',
        sku: '',
        category: 'Electronics',
        unitPrice: '',
        currentStock: 0,
        minimumStock: 5,
        warehouseLocation: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
      } else {
        await productService.createProduct(formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  const canManageProducts = hasRole(['ADMIN', 'WAREHOUSE']);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage product items, SKU codes, prices, and warehouse reorder alert levels.
          </p>
        </div>
        {canManageProducts && (
          <Button onClick={() => handleOpenModal()} variant="primary" icon={Plus}>
            New Product
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by SKU, name, category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <Input
            placeholder="Filter category (e.g. Mobile, Audio)"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          />

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => {
                  setLowStockOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <AlertTriangle className="w-4 h-4" /> Low Stock Alerts Only
              </span>
            </label>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No products found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or add a new product item.</p>
        </Card>
      ) : (
        <div>
          <Table headers={['Product & SKU', 'Category', 'Unit Price', 'Stock Level', 'Location', 'Actions']}>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-900">{p.name}</p>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {p.sku}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  ₹{Number(p.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{p.currentStock}</span>
                    {p.isLowStock ? (
                      <Badge variant="amber" className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low (Min: {p.minimumStock})
                      </Badge>
                    ) : (
                      <Badge variant="emerald">Healthy</Badge>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-500">{p.warehouseLocation || '—'}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    {canManageProducts && (
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Item' : 'Create New Catalog Product'}
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {formError}
          </div>
        )}
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Samsung 55 Inch 4K Smart TV"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU Code"
              name="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. TV-SAM-55"
              required
            />
            <Input
              label="Category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Electronics, Audio"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Unit Price (₹)"
              name="unitPrice"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              placeholder="49999.00"
              required
            />
            <Input
              label="Current Stock"
              name="currentStock"
              type="number"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
              required
            />
            <Input
              label="Min Alert Stock"
              name="minimumStock"
              type="number"
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
              required
            />
          </div>

          <Input
            label="Warehouse Location (Shelf / Bin)"
            name="warehouseLocation"
            value={formData.warehouseLocation}
            onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
            placeholder="e.g. Aisle 3, Shelf B2"
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingProduct ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};