import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challanService } from '../services/challanService.js';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Printer,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export const ChallanDetailPage = () => {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [challan, setChallan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchChallan = async () => {
    try {
      const data = await challanService.getChallanById(id);
      setChallan(data);
    } catch (err) {
      setError(err.message || 'Failed to load challan document');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    if (window.confirm(`Confirm delivery for Challan #${challan.challanNumber}? This will deduct warehouse stock permanently.`)) {
      setActionError('');
      setIsProcessing(true);
      try {
        await challanService.confirmChallan(id);
        fetchChallan();
      } catch (err) {
        setActionError(err.message || 'Confirmation failed');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCancel = async () => {
    if (window.confirm(`Cancel Challan #${challan.challanNumber}? If already confirmed, warehouse stock will be restored.`)) {
      setActionError('');
      setIsProcessing(true);
      try {
        await challanService.cancelChallan(id);
        fetchChallan();
      } catch (err) {
        setActionError(err.message || 'Cancellation failed');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !challan) {
    return (
      <div className="p-6 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
        {error || 'Challan not found'}
      </div>
    );
  }

  const grandTotal = challan.items?.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  );

  const canConfirmOrCancel = hasRole(['ADMIN', 'WAREHOUSE']);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/challans" className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-mono font-bold text-slate-900">{challan.challanNumber}</h1>
            <p className="text-xs text-slate-500">Created by {challan.createdBy?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="outline" icon={Printer}>
            Print / PDF
          </Button>

          {challan.status === 'DRAFT' && canConfirmOrCancel && (
            <Button onClick={handleConfirm} variant="primary" isLoading={isProcessing} icon={CheckCircle2}>
              Confirm Delivery (Reduce Stock)
            </Button>
          )}

          {challan.status !== 'CANCELLED' && canConfirmOrCancel && (
            <Button onClick={handleCancel} variant="danger" isLoading={isProcessing} icon={XCircle}>
              Cancel Challan
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0">
        <div className="flex justify-between items-start border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg mb-1">
              <Layers className="w-6 h-6" /> Mini ERP Operations
            </div>
            <p className="text-xs text-slate-500">Wholesale & Goods Dispatch Note</p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-mono font-bold text-slate-900">{challan.challanNumber}</h2>
            <div className="mt-1">
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
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Date: {new Date(challan.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billed & Dispatched To:
            </span>
            <p className="font-bold text-slate-900 text-base">{challan.customer?.businessName}</p>
            <p className="text-slate-600">{challan.customer?.name}</p>
            <p className="text-slate-600">{challan.customer?.mobile}</p>
            {challan.customer?.address && <p className="text-slate-500 text-xs mt-1">{challan.customer?.address}</p>}
            {challan.customer?.gstNumber && (
              <p className="text-xs font-mono text-slate-700 mt-1">GSTIN: {challan.customer?.gstNumber}</p>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Dispatch Verification:
            </span>
            <p className="text-slate-700 font-medium">Status: <span className="font-bold">{challan.status}</span></p>
            <p className="text-slate-500 text-xs">Auth Rep: {challan.createdBy?.name} ({challan.createdBy?.role})</p>
            {challan.status === 'DRAFT' && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 text-left">
                ⚠️ DRAFT Note: Inventory stock is not locked until confirmed.
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Item (Snapshot)</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {challan.items?.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{item.productName}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{item.sku}</td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    ₹{Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{(Number(item.unitPrice) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/75 border-t border-slate-200 font-bold">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-slate-700 text-right">
                  Total Dispatched Units:
                </td>
                <td className="py-3 px-4 text-right text-slate-900 font-extrabold">
                  {challan.totalQuantity} units
                </td>
                <td className="py-3 px-4 text-right text-emerald-700 text-base font-extrabold">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="pt-6 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-end">
          <div>
            <p>1. Received goods in full and satisfactory condition.</p>
            <p>2. This sales delivery challan acts as official transfer of goods.</p>
          </div>
          <div className="text-center pt-8">
            <div className="w-36 border-t border-slate-400 mb-1" />
            <span>Authorized Receiver Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
};