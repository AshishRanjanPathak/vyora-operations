import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { customerService } from '../services/customerService.js';
import { productService } from '../services/productService.js';
import { challanService } from '../services/challanService.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ArrowLeft, Plus, Trash2, Zap, ShieldCheck } from 'lucide-react';

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
        toast.error('Failed to load accounts or products. Please check network connection.');
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

    if (!selectedCustomerId) {
      toast.error('Please select an account to continue.');
      return;
    }

    if (items.some((item) => !item.productId || item.quantity < 1)) {
      toast.error('Please ensure all line items have valid products and quantities >= 1.');
      return;
    }

    setIsSubmitting(true);
    try {
      const challan = await challanService.createDraftChallan({
        customerId: selectedCustomerId,
        items: items.map((i) => ({ productId: i.productId, quantity: parseInt(i.quantity, 10) })),
      });
      toast.success(`Draft Challan ${challan.challanNumber} generated successfully!`);
      navigate(`/challans/${challan.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate draft challan. Please check available reserves.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto overflow-x-hidden">
      <div className="flex items-center gap-3">
        <Link to="/challans" className="p-2 text-slate-500 hover:text-[#121316] hover:bg-[#f0f0eb] rounded-lg btn-press">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#121316] font-display tracking-tight uppercase">
            Issue Sales Delivery Challan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            Sequential auto-numbering, permanent unit price snapshots, and atomic stock deductions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Account */}
        <Card title="1. Consignee / Buyer Account">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider mb-2">
              Select Corporate Entity <span className="text-[#ea580c]">*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} - {c.name} ({c.mobile}) [{c.customerType}]
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Step 2: Line Items */}
        <Card
          title="2. Dispatch Line Items"
          action={
            <Button type="button" onClick={handleAddItem} variant="orange" size="sm" icon={Plus}>
              Add Line Item
            </Button>
          }
        >
          <div className="space-y-3">
            {items.map((item, index) => {
              const currentProduct = products.find((p) => p.id === item.productId);
              const isInsufficient = currentProduct && currentProduct.currentStock < item.quantity;
              const subtotal = currentProduct ? Number(currentProduct.unitPrice) * (parseInt(item.quantity, 10) || 0) : 0;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all ${
                    isInsufficient ? 'bg-rose-50/50 border-rose-300' : 'bg-[#fafaf8] border-[#e4e4df]'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                        Catalog SKU #{index + 1}
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                        required
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} [{p.sku}] - INR {Number(p.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Reserve: {p.currentStock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                        Dispatch Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-lg border font-mono font-bold ${
                          isInsufficient
                            ? 'border-rose-400 bg-rose-50 text-rose-900 focus-visible:ring-rose-500'
                            : 'border-[#dcdcd5] bg-white text-[#121316] focus-visible:ring-[#ea580c]'
                        }`}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                        Subtotal (INR)
                      </label>
                      <p className="text-xs font-mono font-bold text-[#121316] tabular-nums py-2">
                        {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length <= 1}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-25 btn-press transition-colors"
                        title="Remove Line Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isInsufficient && (
                    <div className="mt-2 text-[11px] text-rose-600 font-mono font-bold flex items-center gap-1">
                      <span>Insufficient stock reserve (Available: {currentProduct?.currentStock} units). Dispatch will be rejected upon confirmation.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Totals Summary */}
          <div className="mt-6 pt-4 border-t border-[#e4e4df] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
            <div className="text-xs text-slate-500">
              Total Units: <span className="font-bold text-[#121316]">{totalUnits} items</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 mr-2">Estimated Valuation:</span>
              <span className="font-extrabold text-[#121316] text-base">
                INR {estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/challans">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="orange" isLoading={isSubmitting} icon={Zap}>
            Generate Draft Delivery Challan
          </Button>
        </div>
      </form>
    </div>
  );
};