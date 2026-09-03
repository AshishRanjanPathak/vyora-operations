import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { productService } from '../services/productService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { formatCurrency } from '../lib/utils.js';
import { exportToCSV } from '../lib/exportUtils.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  Trash2,
  Edit,
  Download,
  UploadCloud,
  ImageIcon,
  X,
} from 'lucide-react';

const CATEGORIES_LIST = ['All', 'Electronics', 'Mobile', 'Audio'];

const INITIAL_FORM_STATE = {
  name: '',
  sku: '',
  category: 'Electronics',
  unitPrice: '',
  currentStock: 0,
  minimumStock: 5,
  warehouseLocation: '',
  imageUrl: '',
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

  const debouncedSearch = useDebounce(search, 300);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const fileInputRef = useRef(null);

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
        imageUrl: prod.imageUrl || '',
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPEG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size cannot exceed 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadRes = await productService.uploadImage(file);
      const imageUrl = uploadRes.data?.imageUrl;
      setFormData((prev) => ({ ...prev, imageUrl }));
      toast.success('Product image uploaded successfully (AWS S3/Vault)!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
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

  const handleExportCSV = () => {
    if (!products || products.length === 0) {
      toast.error('No product data available to export');
      return;
    }

    const columns = [
      { header: 'SKU Identifier', key: 'sku' },
      { header: 'Product Name', key: 'name' },
      { header: 'Category', key: 'category' },
      { header: 'Unit Price (INR)', key: 'unitPrice' },
      { header: 'Physical Stock', key: 'currentStock' },
      { header: 'Min Stock Threshold', key: 'minimumStock' },
      { header: 'Warehouse Bin', key: 'warehouseLocation' },
      { header: 'Image URL', key: 'imageUrl' },
      { header: 'Audit Date', key: 'createdAt' },
    ];

    exportToCSV(products, 'products-catalog-export', columns);
    toast.success('Product catalog CSV exported successfully!');
  };

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-[#121316]">
            Master Product Catalog
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            SKU serialization, spot valuations, S3 image assets, and automated low-stock triggers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleExportCSV}
            variant="secondary"
            size="sm"
            icon={Download}
            disabled={products.length === 0}
            title="Export products to CSV"
          >
            Export CSV
          </Button>

          {hasRole(['ADMIN', 'WAREHOUSE']) && (
            <Button
              onClick={() => handleOpenModal()}
              variant="orange"
              size="sm"
              icon={Plus}
            >
              Add Product SKU
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search by SKU code or item title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={Search}
            className="w-full text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES_LIST.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat === 'All' ? '' : cat);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors btn-press ${
                  (category === '' && cat === 'All') || category === cat
                    ? 'bg-[#121316] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-[#f0f0eb] border border-[#dcdcd5]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setLowStockOnly(!lowStockOnly);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all btn-press ${
              lowStockOnly
                ? 'bg-rose-600 text-white border border-rose-600 shadow-sm'
                : 'bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-[#dcdcd5]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alerts</span>
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
              const img = resolveImageUrl(p.imageUrl);
              return (
                <tr key={p.id} className="hover:bg-[#fafaf8] transition-colors">
                  <td className="py-3 px-4 first:pl-6">
                    <div className="flex items-center gap-3">
                      {/* Product Thumbnail with S3 / Upload support */}
                      <div className="w-10 h-10 rounded-lg bg-[#f0f0eb] border border-[#dcdcd5] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                        {img ? (
                          <img
                            src={img}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <span className="font-mono font-bold text-[#ea580c] text-xs block">{p.sku}</span>
                        <span className="font-bold text-[#121316] text-xs block">{p.name}</span>
                      </div>
                    </div>
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
          {/* Image Upload Drag & Drop Preview Section (AWS S3 Bonus) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700 block uppercase">
              Product Visual Asset (AWS S3 / Storage)
            </label>

            <div className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-[#dcdcd5] bg-[#fafaf8]">
              <div className="w-16 h-16 rounded-lg bg-white border border-[#e4e4df] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative">
                {formData.imageUrl ? (
                  <>
                    <img
                      src={resolveImageUrl(formData.imageUrl)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-xs"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={UploadCloud}
                  isLoading={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  {formData.imageUrl ? 'Change Image' : 'Upload S3 Image'}
                </Button>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Supports PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </div>
          </div>

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