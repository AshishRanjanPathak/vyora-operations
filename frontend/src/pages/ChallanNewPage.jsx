import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerService } from '../services/customerService.js';
import { productService } from '../services/productService.js';
import { challanService } from '../services/challanService.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';

export const ChallanNewPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  const [items, setItems] = useState([
    { productId: '', quantity: 1 }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerService.getCustomers({ limit: 100 }),
          productService.getProducts({ limit: 100 }),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
        if (custRes.data.length > 0) setSelectedCustomerId(custRes.data[0].id);
        if (prodRes.data.length > 0) {
          setItems([{ productId: prodRes.data[0].id, quantity: 1 }]);
        }
      } catch (err) {
        setError('Failed to load customers or products');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleAddItem = () => {
    if (products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const totalUnits = items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  const estimatedTotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    const price = product ? Number(product.unitPrice) : 0;
    return sum + price * (parseInt(item.quantity, 10) || 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomerId) {
      setError('Please select a customer account');
      return;
    }

    if (items.some((item) => !item.productId || item.quantity < 1)) {
      setError('Please ensure all line items have valid products and quantities >= 1');
      return;
    }

    setIsSubmitting(true);
    try {
      const challan = await challanService.createDraftChallan({
        customerId: selectedCustomerId,
        items: items.map((i) => ({ productId: i.productId, quantity: parseInt(i.quantity, 10) })),
      });
      navigate(`/challans/${challan.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create draft challan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/challans" className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Sales Delivery Challan</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create an initial DRAFT order. Warehouse stock will NOT be changed until confirmed.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="1. Select Customer Account">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Customer / Business Name *
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} — {c.name} ({c.mobile}) [{c.customerType}]
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card
          title="2. Line Items (Products & Quantities)"
          subtitle="Prices and names are snapshotted permanently at creation time"
          action={
            <Button type="button" onClick={handleAddItem} variant="outline" size="sm" icon={Plus}>
              Add Product Line
            </Button>
          }
        >
          <div className="space-y-3">
            {items.map((item, index) => {
              const selectedProduct = products.find((p) => p.id === item.productId);
              return (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50/75 rounded-xl border border-slate-200/80">
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                      required
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.sku}] — ₹{Number(p.unitPrice).toLocaleString()} (Stock: {p.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-32">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-bold"
                      required
                    />
                  </div>

                  <div className="w-full sm:w-36 text-right sm:text-right">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Line Total</label>
                    <span className="text-sm font-extrabold text-slate-800 block py-2">
                      ₹{((selectedProduct ? Number(selectedProduct.unitPrice) : 0) * (item.quantity || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-5 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length <= 1}
                      className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-100/60 p-4 rounded-xl">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Total Items</span>
              <p className="text-lg font-extrabold text-slate-900">{totalUnits} units across {items.length} lines</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase">Estimated Value (Snapshot)</span>
              <p className="text-xl font-extrabold text-emerald-700">
                ₹{estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/challans')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
            Generate Draft Challan
          </Button>
        </div>
      </form>
    </div>
  );
};