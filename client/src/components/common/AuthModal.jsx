import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthModal — Login and Register dialog.
 *
 * Security hardening:
 *  - No demo-login shortcuts; users must supply real credentials.
 *  - Admin role is NOT available in the registration role picker.
 *  - Errors are surfaced from the server response.
 *  - Password field is never pre-filled.
 */
export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
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
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(formData.email.trim(), formData.password);
        if (result.success) {
          onClose();
        }
      } else {
        // Registration
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const result = await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          businessName: formData.businessName.trim() || undefined,
          role,
        });
        if (result.success) {
          if (role === 'CUSTOMER') {
            // Customers are immediately active
            onClose();
          } else {
            // RETAILER / WHOLESALER need approval — stay open, show message
            setSuccessMsg(
              `Your ${role.toLowerCase()} application has been submitted! Our team will review it within 1-2 business days. You can log in now to browse products.`
            );
            setFormData({ name: '', email: '', password: '', phone: '', businessName: '' });
            // Auto-close after 3 sec for RETAILER/WHOLESALER since they are now logged in
            setTimeout(() => onClose(), 3500);
          }
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-pure rounded-3xl shadow-float max-w-lg w-full p-6 sm:p-8 border border-surface-border my-8">
        {/* Header */}
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
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-dark p-1.5 rounded-xl hover:bg-surface-warm"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex p-1 bg-surface-muted rounded-xl mt-4">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'login' ? 'bg-surface-pure text-ink-dark shadow-sm' : 'text-ink-muted hover:text-ink-dark'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'register' ? 'bg-surface-pure text-ink-dark shadow-sm' : 'text-ink-muted hover:text-ink-dark'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5" autoComplete="off">
          {/* REGISTER-ONLY fields */}
          {mode === 'register' && (
            <>
              {/* Role Picker — no SUPER_ADMIN option */}
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
                {role !== 'CUSTOMER' && (
                  <p className="mt-1.5 text-[10px] text-amber-700 font-medium bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                    ⏳ {role === 'RETAILER' ? 'Retailer' : 'Wholesaler'} accounts require admin approval before accessing
                    restricted features. Approval typically takes 1-2 business days.
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange('name')}
                    placeholder="e.g. Ramesh Patel"
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-ink-dark"
                  />
                </div>
              </div>

              {/* Business Name (Retailer / Wholesaler) */}
              {role !== 'CUSTOMER' && (
                <div>
                  <label className="block text-xs font-bold text-ink-dark mb-1">Business Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={handleChange('businessName')}
                      placeholder={role === 'WHOLESALER' ? 'e.g. Bharat Wholesale Bazaar Pvt Ltd' : 'e.g. Joshi Kirana Mart'}
                      autoComplete="organization"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-ink-dark"
                    />
                  </div>
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-ink-dark"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-ink-dark mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="name@business.in"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-ink-dark"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-ink-dark mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-ink-dark"
              />
            </div>
            {mode === 'register' && (
              <p className="mt-1 text-[10px] text-ink-muted">Minimum 6 characters required.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            id={mode === 'login' ? 'btn-sign-in' : 'btn-create-account'}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-card flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In to Account' : 'Create Account'}
          </button>
        </form>

        {/* Footer note */}
        <p className="mt-4 text-center text-[10px] text-ink-muted">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => switchMode('register')} className="text-brand-600 font-bold hover:underline">
                Create one here
              </button>
            </>
          ) : (
            <>Already registered?{' '}
              <button onClick={() => switchMode('login')} className="text-brand-600 font-bold hover:underline">
                Sign in instead
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
