import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { customerService } from '../services/customerService.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { DetailPageSkeleton } from '../components/ui/Skeleton.jsx';
import { ArrowLeft, Plus, Phone, Mail, Building, MapPin, Calendar, ShieldCheck } from 'lucide-react';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomer = async () => {
    try {
      const data = await customerService.getCustomerById(id);
      setCustomer(data);
    } catch (err) {
      setError(err.message || 'Failed to load account dossier');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setIsSubmitting(true);

    try {
      await customerService.addFollowUp(id, {
        note,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
      });
      toast.success('Account interaction note logged on timeline');
      setNote('');
      setFollowUpDate('');
      fetchCustomer();
    } catch (err) {
      toast.error(err.message || 'Failed to record follow-up note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !customer) {
    return (
      <div className="p-6 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-sm">
        {error || 'Account not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/customers" className="p-2 text-slate-500 hover:text-[#121316] hover:bg-[#f0f0eb] rounded-lg btn-press">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#121316] font-display tracking-tight">{customer.businessName}</h1>
            <Badge variant={customer.status === 'ACTIVE' ? 'emerald' : customer.status === 'LEAD' ? 'purple' : 'slate'}>
              {customer.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">Account ID: {customer.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <Card title="Corporate Dossier">
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Building className="w-4 h-4 text-[#ea580c] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Primary Contact</p>
                  <p className="font-bold text-[#121316] text-sm">{customer.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#ea580c] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Direct Mobile</p>
                  <a href={`tel:${customer.mobile}`} className="font-mono text-[#121316] font-bold hover:underline">
                    {customer.mobile}
                  </a>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#ea580c] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Billing Email</p>
                    <a href={`mailto:${customer.email}`} className="font-mono text-[#121316] font-bold hover:underline">
                      {customer.email}
                    </a>
                  </div>
                </div>
              )}

              {customer.gstNumber && (
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">GSTIN Code</p>
                    <p className="font-mono font-bold text-[#121316] text-xs bg-[#f4f4f0] px-2 py-0.5 rounded border border-[#e4e4df] w-fit">
                      {customer.gstNumber}
                    </p>
                  </div>
                </div>
              )}

              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#ea580c] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Delivery & Warehouse Address</p>
                    <p className="text-slate-700 leading-relaxed font-medium mt-0.5">{customer.address}</p>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#e4e4df] flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500 uppercase">Account Tier</span>
                <Badge variant="blue">{customer.customerType}</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Cols: Interaction Log & Follow-Ups */}
        <div className="space-y-6 lg:col-span-2">
          {/* Add Interaction Log */}
          <Card title="Record Interaction Log / Follow-Up Note">
            <form onSubmit={handleAddFollowUp} className="space-y-4">
              <div>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record commercial discussion, credit terms review, payment receipt confirmation, or delivery notes..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] font-medium"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-[11px] font-mono text-slate-500 uppercase font-bold whitespace-nowrap">Next Review:</span>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-mono focus-visible:ring-2 focus-visible:ring-[#ea580c]"
                  />
                </div>

                <Button type="submit" variant="orange" size="sm" isLoading={isSubmitting} icon={Plus}>
                  Log Activity
                </Button>
              </div>
            </form>
          </Card>

          {/* Timeline Stream */}
          <Card title={`Chronological Activity Ledger (${customer.followUps?.length || 0})`}>
            {customer.followUps?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No historical notes recorded for this buyer account.</p>
            ) : (
              <div className="space-y-4">
                {customer.followUps?.map((f) => (
                  <div key={f.id} className="p-4 rounded-xl bg-[#fafaf8] border border-[#e4e4df] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-[#121316]">{f.user?.name || f.user?.email || 'Operations Desk'}</span>
                      <span className="text-slate-500">{new Date(f.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">{f.note}</p>
                    {f.followUpDate && (
                      <div className="pt-2 border-t border-[#e4e4df] flex items-center gap-1.5 text-[11px] font-mono text-[#ea580c] font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Scheduled Follow-Up: {new Date(f.followUpDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};