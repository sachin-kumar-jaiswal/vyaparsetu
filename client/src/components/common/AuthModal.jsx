import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, quickDemoLogin } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState('CUSTOMER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        onClose();
      } else {
        await register({
          ...formData,
          role,
        });
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async (targetRole) => {
    setError('');
    setLoading(true);
    try {
      await quickDemoLogin(targetRole);
      onClose();
    } catch (err) {
      setError('Demo login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-pure rounded-3xl shadow-float max-w-lg w-full p-6 sm:p-8 border border-surface-border animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div>
            <h3 className="font-extrabold text-xl text-ink-dark">
              {mode === 'login' ? 'Sign in to VyaparSetu' : 'Join VyaparSetu Marketplace'}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {mode === 'login'
                ? 'Access your orders, wholesale quotes, or dashboard'
                : 'Connect with verified Indian wholesalers and retailers'}
            </p>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-dark p-1.5 rounded-xl hover:bg-surface-warm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="mt-4 p-3 bg-brand-50/70 border border-brand-200/60 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-brand-700 tracking-wider uppercase">
              ⚡ 1-Click Demo Evaluation Logins
            </span>
            <span className="text-[10px] text-brand-600 font-medium">No typing required</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoSwitch('CUSTOMER')}
              className="px-2 py-1.5 bg-white hover:bg-brand-500 hover:text-white text-ink-dark rounded-lg text-xs font-semibold shadow-sm border border-brand-200 transition text-center"
            >
              🛒 Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoSwitch('RETAILER')}
              className="px-2 py-1.5 bg-white hover:bg-brand-500 hover:text-white text-ink-dark rounded-lg text-xs font-semibold shadow-sm border border-brand-200 transition text-center"
            >
              🏪 Retailer
            </button>
            <button
              type="button"
              onClick={() => handleDemoSwitch('WHOLESALER')}
              className="px-2 py-1.5 bg-white hover:bg-brand-500 hover:text-white text-ink-dark rounded-lg text-xs font-semibold shadow-sm border border-brand-200 transition text-center"
            >
              🏭 Wholesaler
            </button>
            <button
              type="button"
              onClick={() => handleDemoSwitch('SUPER_ADMIN')}
              className="px-2 py-1.5 bg-white hover:bg-brand-500 hover:text-white text-ink-dark rounded-lg text-xs font-semibold shadow-sm border border-brand-200 transition text-center"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex p-1 bg-surface-muted rounded-xl mt-4">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'login' ? 'bg-surface-pure text-ink-dark shadow-sm' : 'text-ink-muted hover:text-ink-dark'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'register' ? 'bg-surface-pure text-ink-dark shadow-sm' : 'text-ink-muted hover:text-ink-dark'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {mode === 'register' && (
            <>
              {/* Role Picker */}
              <div>
                <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                  Register As
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CUSTOMER', label: 'Customer', desc: 'Personal grocery' },
                    { id: 'RETAILER', label: 'Retailer', desc: 'Kirana & stores' },
                    { id: 'WHOLESALER', label: 'Wholesaler', desc: 'Distributor' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        role === r.id
                          ? 'border-brand-500 bg-brand-50/60 text-brand-700 font-bold'
                          : 'border-surface-border text-ink-dark hover:bg-surface-warm'
                      }`}
                    >
                      <span className="block text-xs font-bold">{r.label}</span>
                      <span className="block text-[10px] text-ink-muted font-normal mt-0.5">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-ink-dark"
                  />
                </div>
              </div>

              {role !== 'CUSTOMER' && (
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Business Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder={role === 'WHOLESALER' ? 'e.g. Bharat Wholesale Bazaar Pvt Ltd' : 'e.g. Joshi Kirana Mart'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-ink-dark"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-ink-dark"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-ink-dark mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@business.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-ink-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-dark mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-ink-dark"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-card flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Account' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
