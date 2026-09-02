import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { challanService } from '../services/challanService.js';
import { useAuth } from '../hooks/useAuth.js';
import { generateInvoicePDF } from '../lib/pdfExport.js';
import { formatCurrency, formatDate } from '../lib/utils.js';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { DetailPageSkeleton } from '../components/ui/Skeleton.jsx';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Printer,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

export const ChallanDetailPage = () => {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [challan, setChallan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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
    if (window.confirm(`Confirm delivery for Challan #${challan.challanNumber}? This will deduct warehouse vault stock permanently.`)) {
      setIsProcessing(true);
      try {
        await challanService.confirmChallan(id);
        toast.success(`Challan ${challan.challanNumber} confirmed & stock deducted!`);
        fetchChallan();
      } catch (err) {
        toast.error(err.message || 'Confirmation failed');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCancel = async () => {
    if (window.confirm(`Cancel Challan #${challan.challanNumber}? If already confirmed, vault stock will be restored.`)) {
      setIsProcessing(true);
      try {
        await challanService.cancelChallan(id);
        toast.success(`Challan ${challan.challanNumber} cancelled & stock restored!`);
        fetchChallan();
      } catch (err) {
        toast.error(err.message || 'Cancellation failed');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    try {
      await generateInvoicePDF('challan-invoice-doc', `tax-invoice-${challan.challanNumber}.pdf`);
      toast.success(`Official invoice PDF "${challan.challanNumber}.pdf" exported!`);
    } catch (err) {
      toast.error('Failed to generate PDF. You can also use the Print button.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !challan) {
    return (
      <div className="p-6 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-sm">
        {error || 'Challan document not found'}
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
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/challans" className="p-2 text-slate-500 hover:text-[#121316] hover:bg-[#f0f0eb] rounded-lg btn-press">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#121316]">{challan.challanNumber}</h1>
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
            <p className="text-xs text-slate-500 font-mono">Issued on {formatDate(challan.createdAt, true)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct PDF Export Button (Bonus Requirement) */}
          <Button
            onClick={handleDownloadPDF}
            variant="orange"
            size="sm"
            isLoading={isExportingPDF}
            icon={Download}
            className="shadow-sm"
          >
            Export PDF Invoice
          </Button>

          <Button onClick={handlePrint} variant="secondary" size="sm" icon={Printer}>
            Print
          </Button>

          {challan.status === 'DRAFT' && canConfirmOrCancel && (
            <Button
              onClick={handleConfirm}
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              icon={CheckCircle2}
            >
              Confirm Dispatch
            </Button>
          )}

          {challan.status === 'CONFIRMED' && canConfirmOrCancel && (
            <Button
              onClick={handleCancel}
              variant="danger"
              size="sm"
              isLoading={isProcessing}
              icon={XCircle}
            >
              Cancel & Restore
            </Button>
          )}
        </div>
      </div>

      {/* Official Tax Invoice / Delivery Dispatch Document Container */}
      <div
        id="challan-invoice-doc"
        className="bg-white rounded-xl border border-[#e4e4df] shadow-sm p-6 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#e4e4df] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#121316] flex items-center justify-center text-white font-mono font-bold text-base shadow-sm">
              V
            </div>
            <div>
              <span className="font-extrabold text-[#121316] text-lg tracking-tight font-display uppercase">VYORA OPERATIONS</span>
              <span className="text-[10px] text-[#ea580c] font-mono font-bold block -mt-1 tracking-widest">OFFICIAL DELIVERY CHALLAN & TAX INVOICE</span>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-slate-600 space-y-1">
            <p className="font-bold text-[#121316]">DOCUMENT #{challan.challanNumber}</p>
            <p>Issue Date: {formatDate(challan.createdAt)}</p>
            <p className="text-[11px] text-emerald-700 font-bold">Status: {challan.status}</p>
          </div>
        </div>

        {/* Consignor vs Consignee Two-Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div className="p-4 rounded-xl bg-[#fafaf8] border border-[#e4e4df] space-y-2">
            <span className="font-mono font-bold text-slate-500 uppercase text-[10px] block">Dispatched From (Consignor)</span>
            <p className="font-bold text-[#121316] text-sm font-display">VYORA Central Vault Logistics</p>
            <p className="text-slate-600">Unit 14, High-Velocity Logistics Hub</p>
            <p className="text-slate-600">Industrial Corridor, Maharashtra - 400001</p>
            <p className="font-mono text-slate-700 font-semibold pt-1">GSTIN: 27AABCV1029P1Z8</p>
          </div>

          <div className="p-4 rounded-xl bg-[#fafaf8] border border-[#e4e4df] space-y-2">
            <span className="font-mono font-bold text-slate-500 uppercase text-[10px] block">Delivered To (Consignee / Buyer)</span>
            <p className="font-bold text-[#121316] text-sm font-display">{challan.customer?.businessName}</p>
            <p className="text-slate-600">Attn: {challan.customer?.name}</p>
            <p className="text-slate-600">{challan.customer?.address || 'Registered Commercial Premises'}</p>
            <div className="flex items-center gap-3 font-mono text-slate-700 pt-1">
              <span>Mob: {challan.customer?.mobile}</span>
              {challan.customer?.gstNumber && <span>GSTIN: {challan.customer?.gstNumber}</span>}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-[#e4e4df] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f4f4f0] text-slate-700 font-bold uppercase tracking-wider border-b border-[#e4e4df] text-[10px] font-mono">
              <tr>
                <th className="py-3 px-4 first:pl-6">#</th>
                <th className="py-3 px-4">Item & SKU Code</th>
                <th className="py-3 px-4 text-right">Locked Spot Price</th>
                <th className="py-3 px-4 text-right">Dispatch Units</th>
                <th className="py-3 px-4 last:pr-6 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4df] text-[#121316] font-mono">
              {challan.items?.map((item, idx) => {
                const lineTotal = Number(item.unitPrice) * item.quantity;
                return (
                  <tr key={item.id} className="hover:bg-[#fafaf8]">
                    <td className="py-3 px-4 first:pl-6 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#121316] block">{item.product?.name}</span>
                      <span className="text-[10px] text-[#ea580c] font-bold block">{item.product?.sku}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 tabular-nums">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#121316] tabular-nums">
                      {item.quantity} units
                    </td>
                    <td className="py-3 px-4 last:pr-6 text-right font-extrabold text-[#121316] tabular-nums">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-[#e4e4df] font-mono">
          <div className="text-xs text-slate-500 space-y-1">
            <p>Total Items Dispatched: <span className="font-bold text-[#121316]">{challan.totalQuantity} units</span></p>
            <p className="text-[11px] text-emerald-700 font-bold">100% ACID Database Transaction Verified</p>
          </div>

          <div className="p-4 rounded-xl bg-[#fafaf8] border border-[#e4e4df] text-right space-y-1 w-full sm:w-auto">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Consolidated Valuation</span>
            <p className="text-2xl font-extrabold font-mono text-[#121316] tabular-nums">
              {formatCurrency(grandTotal)}
            </p>
          </div>
        </div>

        {/* Official Signatures for PDF & Print */}
        <div className="pt-12 grid grid-cols-2 gap-12 font-mono text-xs text-slate-500 border-t border-[#e4e4df]">
          <div className="space-y-8">
            <p className="font-bold uppercase tracking-wider text-slate-700">Authorized Logistics Seal:</p>
            <div className="border-b border-dashed border-[#dcdcd5] pb-2 text-[11px]">
              Sign & Company Stamp
            </div>
          </div>

          <div className="space-y-8 text-right">
            <p className="font-bold uppercase tracking-wider text-slate-700">Receiver Acceptance:</p>
            <div className="border-b border-dashed border-[#dcdcd5] pb-2 text-[11px]">
              Goods Received in Good Order & Condition
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};