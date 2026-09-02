import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { customerService } from '../services/customerService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import { Plus, Search, Eye, Trash2, Building, Phone, Mail } from 'lucide-react';

const STATUS_VARIANTS = {
  LEAD: 'purple',
  ACTIVE: 'emerald',
  INACTIVE: 'slate',
};

const INITIAL_FORM_STATE = {
  name: '',
  mobile: '',
  email: '',
  businessName: '',
  gstNumber: '',
  customerType: 'WHOLESALE',
  status: 'LEAD',
  address: '',
  notes: '',
};

export const CustomersPage = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [page, setPage] = useState(1);

  // Performance: Debounce search input to avoid spamming the API on every keypress
  const debouncedSearch = useDebounce(search, 300);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await customerService.getCustomers({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: status || undefined,
        customerType: customerType || undefined,
      });
      setCustomers(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch customer accounts.');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, status, customerType]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await customerService.createCustomer(formData);
      toast.success(`Account "${formData.businessName}" created and verified!`);
      setIsModalOpen(false);
      setFormData(INITIAL_FORM_STATE);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Failed to register account. Please verify input fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Permanently remove ${name} from verified customer directory?`)) {
      try {
        await customerService.deleteCustomer(id);
        toast.success(`Account "${name}" removed`);
        fetchCustomers();
      } catch (err) {
        toast.error(err.message || 'Failed to delete account');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#121316] font-display tracking-tight uppercase">Verified Wholesale Accounts</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Corporate buyers, credit lines, and interaction history dossier.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="orange" size="md" icon={Plus}>
          New Account
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e4e4df] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search business, representative, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] font-medium"
            />
          </div>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
          >
            <option value="">All Pipeline Statuses</option>
            <option value="LEAD">Leads (Credit Assessment)</option>
            <option value="ACTIVE">Active (Approved Line)</option>
            <option value="INACTIVE">Inactive (Suspended)</option>
          </select>

          <select
            value={customerType}
            onChange={(e) => { setCustomerType(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
          >
            <option value="">All Account Tiers</option>
            <option value="WHOLESALE">Wholesale Tier 1</option>
            <option value="DISTRIBUTOR">Distributor Tier 2</option>
            <option value="RETAIL">Retail Account</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : customers.length === 0 ? (
        <Card className="text-center py-12">
          <Building className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#121316]">No accounts found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust search parameters or register a new buyer account.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Table headers={['Corporate Entity', 'Direct Contact', 'Tier', 'Status', 'Audit Timeline', 'Actions']}>
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-[#fafaf8] transition-colors">
                <td className="py-3 px-4 first:pl-6">
                  <Link to={`/customers/${c.id}`} className="font-bold text-[#121316] hover:text-[#ea580c] text-xs block">
                    {c.businessName}
                  </Link>
                  <span className="text-[11px] text-slate-500">{c.name}</span>
                </td>
                <td className="py-3 px-4 text-xs">
                  <a
                    href={`tel:${c.mobile}`}
                    className="flex items-center gap-1 text-[#121316] hover:text-[#ea580c] font-mono font-medium"
                    title={`Call ${c.mobile}`}
                  >
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {c.mobile}
                  </a>
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-1 text-slate-500 hover:text-[#ea580c] text-[11px] mt-0.5 font-mono truncate"
                      title={`Email ${c.email}`}
                    >
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {c.email}
                    </a>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="blue">{c.customerType}</Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={STATUS_VARIANTS[c.status] || 'slate'}>{c.status}</Badge>
                </td>
                <td className="py-3 px-4 text-xs font-mono font-bold text-[#121316] tabular-nums">
                  {c._count?.followUps || 0} notes
                </td>
                <td className="py-3 px-4 last:pr-6">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/customers/${c.id}`}
                      className="p-1.5 text-slate-600 hover:text-[#121316] hover:bg-[#f0f0eb] rounded-lg btn-press"
                      title="Inspect account dossier"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(c.id, c.businessName)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg btn-press"
                        title="Delete account"
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

      {/* Account Registration Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Wholesale Buyer Account">
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <Input
            label="Corporate / Legal Business Name"
            name="businessName"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            placeholder="Apex Wholesale Electronics Ltd"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Authorized Representative"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ramesh Patel"
              required
            />
            <Input
              label="Direct Mobile Line"
              name="mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="9876543210"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Corporate Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="billing@apexcorp.in"
            />
            <Input
              label="GST Identification Number (GSTIN)"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="27ABCDE1234F1Z5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                Account Tier
              </label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
              >
                <option value="WHOLESALE">Wholesale Tier 1 (Bulk Volume)</option>
                <option value="DISTRIBUTOR">Distributor Tier 2 (Regional Hub)</option>
                <option value="RETAIL">Retail Direct</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
                Initial Pipeline Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] font-medium focus-visible:ring-2 focus-visible:ring-[#ea580c]"
              >
                <option value="LEAD">Lead (Credit Underwriting)</option>
                <option value="ACTIVE">Active (Credit Approved)</option>
                <option value="INACTIVE">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider mb-1.5">
              Billing and Warehouse Delivery Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#dcdcd5] bg-white text-[#121316] placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-[#ea580c]"
              placeholder="Plot 42, GIDC Industrial Estate, Phase II, Ahmedabad, Gujarat - 382445"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e4e4df]">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange" isLoading={isSubmitting}>
              Verify and Save Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};