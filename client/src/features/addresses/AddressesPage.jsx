import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit3, CheckCircle2, Home, Briefcase, Building } from 'lucide-react';
import apiClient from '../../lib/apiClient';

export const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    houseNo: '',
    street: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    addressType: 'HOME',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      recipientName: '',
      phone: '',
      houseNo: '',
      street: '',
      landmark: '',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      addressType: 'HOME',
      isDefault: addresses.length === 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr._id);
    setFormData({
      recipientName: addr.recipientName,
      phone: addr.phone,
      houseNo: addr.houseNo,
      street: addr.street,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: addr.addressType,
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/addresses/${editingId}`, formData);
      } else {
        await apiClient.post('/addresses', formData);
      }
      setModalOpen(false);
      fetchAddresses();
    } catch (err) {
      alert('Failed to save address: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await apiClient.delete(`/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await apiClient.put(`/addresses/${id}/set-default`);
      fetchAddresses();
    } catch (err) {
      alert('Failed to set default address');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-dark">Saved Addresses</h1>
          <p className="text-xs text-ink-muted mt-0.5">Manage delivery locations for swift multi-seller checkout</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-surface-pure rounded-3xl border border-surface-border p-12 text-center space-y-4">
          <MapPin className="w-12 h-12 text-ink-muted mx-auto" />
          <h3 className="font-extrabold text-base text-ink-dark">No Addresses Saved</h3>
          <p className="text-xs text-ink-muted">Add your home or shop location for easy one-click checkout.</p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-brand-500 text-white font-bold rounded-xl text-xs"
          >
            Add First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`bg-surface-pure rounded-2xl border p-5 shadow-subtle flex flex-col justify-between space-y-4 ${
                addr.isDefault ? 'border-brand-500 ring-1 ring-brand-200' : 'border-surface-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-ink-dark">{addr.recipientName}</span>
                  <div className="flex items-center gap-1.5">
                    {addr.isDefault && (
                      <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-brand-500" /> Default
                      </span>
                    )}
                    <span className="bg-surface-muted text-ink-secondary text-[10px] font-bold px-2 py-0.5 rounded">
                      {addr.addressType}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-ink-secondary leading-relaxed">
                  {addr.houseNo}, {addr.street}
                  {addr.landmark && `, near ${addr.landmark}`}
                  <br />
                  {addr.city}, {addr.state} — <strong className="text-ink-dark font-mono">{addr.pincode}</strong>
                </p>
                <span className="text-xs text-ink-muted block mt-2 font-semibold">Phone: {addr.phone}</span>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="font-bold text-brand-600 hover:underline"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] text-ink-muted font-medium">Active Default</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="p-1.5 text-ink-muted hover:text-brand-600 rounded-lg hover:bg-surface-warm"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="p-1.5 text-ink-muted hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-pure rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-surface-border shadow-float my-8">
            <h3 className="font-extrabold text-lg text-ink-dark mb-1">
              {editingId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
            <p className="text-xs text-ink-muted mb-4">Accurate PIN codes ensure verified seller serviceability</p>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">House / Flat / Shop Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shop 12, APMC Complex"
                  value={formData.houseNo}
                  onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Street / Locality</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grain Market Main Road"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">PIN Code (6 digits)</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Address Label</label>
                <div className="flex gap-2">
                  {['HOME', 'WORK', 'SHOP', 'WAREHOUSE'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, addressType: type })}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                        formData.addressType === type
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-surface-border text-ink-muted'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-ink-dark pt-1">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-surface-border text-brand-500"
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
