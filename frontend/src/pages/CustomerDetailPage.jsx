import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../services/customerService.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { ArrowLeft, Plus, Phone, Mail, Building, MapPin, Calendar } from 'lucide-react';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUpError, setFollowUpError] = useState('');

  const fetchCustomer = async () => {
    try {
      const data = await customerService.getCustomerById(id);
      setCustomer(data);
    } catch (err) {
      setError(err.message || 'Failed to load customer profile');
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
    setFollowUpError('');

    try {
      await customerService.addFollowUp(id, {
        note,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
      });
      setNote('');
      setFollowUpDate('');
      fetchCustomer();
    } catch (err) {
      setFollowUpError(err.message || 'Failed to record follow-up note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
        {error || 'Customer not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/customers" className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{customer.businessName}</h1>
            <Badge variant={customer.status === 'ACTIVE' ? 'emerald' : customer.status === 'LEAD' ? 'purple' : 'slate'}>
              {customer.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Account ID: {customer.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <Card title="Customer Information">
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Contact Person</p>
                  <p className="font-medium text-slate-800">{customer.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Mobile</p>
                  <p className="font-medium text-slate-800">{customer.mobile}</p>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                    <p className="font-medium text-slate-800">{customer.email}</p>
                  </div>
                </div>
              )}

              {customer.gstNumber && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">GST Number</p>
                  <p className="font-medium text-slate-800">{customer.gstNumber}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Customer Type</p>
                <Badge variant="blue" className="mt-1">{customer.customerType}</Badge>
              </div>

              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Address</p>
                    <p className="font-medium text-slate-800">{customer.address}</p>
                  </div>
                </div>
              )}

              {customer.notes && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Internal Notes</p>
                  <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {customer.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card title="Record Call or Meeting Note">
            {followUpError && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                {followUpError}
              </div>
            )}
            <form onSubmit={handleAddFollowUp} className="space-y-4">
              <div>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Summarize the discussion, agreed pricing, objections, or next steps..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Schedule Next Contact
                  </label>
                  <input
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <Button type="submit" variant="primary" isLoading={isSubmitting} icon={Plus}>
                  Save Interaction
                </Button>
              </div>
            </form>
          </Card>

          <Card title="CRM Activity Timeline" subtitle="Chronological history of interactions">
            {customer.followUps?.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                No interaction notes recorded yet. Add the first note above!
              </p>
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 py-2">
                {customer.followUps?.map((f) => (
                  <div key={f.id} className="relative pl-6">
                    <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                    <div className="bg-slate-50/75 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800">
                          {f.createdBy?.name || 'Staff Member'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(f.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{f.note}</p>
                      {f.followUpDate && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-md w-fit">
                          <Calendar className="w-3.5 h-3.5" /> Next Action: {new Date(f.followUpDate).toLocaleString()}
                        </div>
                      )}
                    </div>
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