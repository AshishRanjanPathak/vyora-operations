import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customerService.js';
import { useAuth } from '../hooks/useAuth.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Plus, Search, Eye, Trash2, Building, Phone, Mail } from 'lucide-react';

export const CustomersPage = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'WHOLESALE',
    status: 'LEAD',
    address: '',
    notes: '',
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await customerService.getCustomers({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        customerType: customerType || undefined,
      });
      setCustomers(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, status, customerType]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      await customerService.createCustomer(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        businessName: '',
        gstNumber: '',
        customerType: 'WHOLESALE',
        status: 'LEAD',
        address: '',
        notes: '',
      });
      fetchCustomers();
    } catch (err) {
      setFormError(err.message || 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await customerService.deleteCustomer(id);
        fetchCustomers();
      } catch (err) {
        alert(err.message || 'Failed to delete customer');
      }
    }
  };

  const statusVariants = {
    LEAD: 'purple',
    ACTIVE: 'emerald',
    INACTIVE: 'slate',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers & CRM</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your client accounts, wholesale leads, and follow-up interaction history.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" icon={Plus}>
          New Customer
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, company, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="LEAD">Leads</option>
            <option value="ACTIVE">Active Buyers</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={customerType}
            onChange={(e) => { setCustomerType(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Customer Types</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
            <option value="RETAIL">Retail</option>
          </select>
        </div>
      </Card>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : customers.length === 0 ? (
        <Card className="text-center py-12">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No customers found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or create a new customer.</p>
        </Card>
      ) : (
        <div>
          <Table headers={['Business / Contact', 'Phone & Email', 'Type', 'Status', 'Follow-ups', 'Actions']}>
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4">
                  <Link to={`/customers/${c.id}`} className="font-bold text-slate-900 hover:text-emerald-600 block">
                    {c.businessName}
                  </Link>
                  <span className="text-xs text-slate-500">{c.name}</span>
                </td>
                <td className="py-3.5 px-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.mobile}
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant="blue">{c.customerType}</Badge>
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={statusVariants[c.status] || 'slate'}>{c.status}</Badge>
                </td>
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                  {c._count?.followUps || 0} logs
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/customers/${c.id}`}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="View CRM Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(c.id, c.businessName)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete customer"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer Account">
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <Input
            label="Business / Company Name"
            name="businessName"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            placeholder="e.g. Apex Electronics Ltd"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rajesh Kumar"
              required
            />
            <Input
              label="Mobile Number"
              name="mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. contact@apex.com"
            />
            <Input
              label="GST Number (Optional)"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="e.g. 27AAPFU0939F1ZV"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Customer Type *
              </label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
                <option value="RETAIL">Retail</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="LEAD">Lead (Prospect)</option>
                <option value="ACTIVE">Active Buyer</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <Input
            label="Street Address / City"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. Shop 42, Electronics Market, Delhi"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional background notes, credit terms, requirements..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};