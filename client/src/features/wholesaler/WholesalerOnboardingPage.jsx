import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Truck,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

export const WholesalerOnboardingPage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(2); // Step 1 is account creation
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Form states across wizard steps
  const [step2, setStep2] = useState({
    businessName: '',
    businessType: 'PVT_LTD',
    businessCategory: 'Grocery & FMCG Wholesale',
    description: '',
    yearsInBusiness: 5,
  });

  const [step3, setStep3] = useState({
    gstin: '',
    tradeLicense: '',
    fssaiLicense: '',
  });

  const [step4, setStep4] = useState({
    businessAddress: {
      houseNo: '',
      street: '',
      landmark: '',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110033',
      contactPerson: '',
      contactPhone: '',
    },
    dispatchAddress: {
      houseNo: '',
      street: '',
      landmark: '',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110036',
      contactPerson: '',
      contactPhone: '',
    },
  });

  const [step5, setStep5] = useState({
    deliveryEnabled: true,
    pickupEnabled: true,
    serviceablePincodes: '110001, 110002, 110003, 110004, 110005, 110033, 110036, 110085, 110092',
    deliveryFee: 49,
    freeDeliveryThreshold: 799,
    minOrderValue: 250,
    estimatedDeliveryTime: 'Same Day / Next Day Morning Dispatch',
    operatingHours: '7:30 AM - 9:00 PM (Mon-Sat)',
    codAvailable: true,
    upiId: 'wholesaler@upi',
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiClient.get('/sellers/onboarding/status');
        if (res.data.success) {
          const p = res.data.profile;
          setProfile(p);
          setActiveStep(p.onboardingStep ? Math.min(6, p.onboardingStep) : 2);

          // Populate fields
          setStep2({
            businessName: p.businessName || '',
            businessType: p.businessType || 'PVT_LTD',
            businessCategory: p.businessCategory || 'Grocery & FMCG Wholesale',
            description: p.description || '',
            yearsInBusiness: p.yearsInBusiness || 5,
          });

          setStep3({
            gstin: p.gstin || '',
            tradeLicense: p.tradeLicense || '',
            fssaiLicense: p.fssaiLicense || '',
          });

          if (p.businessAddress) {
            setStep4({
              businessAddress: { ...p.businessAddress },
              dispatchAddress: { ...(p.dispatchAddress || p.businessAddress) },
            });
          }

          if (p.deliverySettings) {
            setStep5({
              ...p.deliverySettings,
              serviceablePincodes: Array.isArray(p.deliverySettings.serviceablePincodes)
                ? p.deliverySettings.serviceablePincodes.join(', ')
                : '110001, 110002, 110033',
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch onboarding state', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const saveCurrentStep = async (stepNum, data) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await apiClient.put('/sellers/onboarding/step', {
        step: stepNum,
        data,
      });
      if (res.data.success) {
        setProfile(res.data.profile);
        if (stepNum < 6) {
          setActiveStep(stepNum + 1);
        } else {
          setSuccessMessage('Your business onboarding has been submitted for Super Admin review!');
          await refreshProfile();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating step data');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Account', desc: 'Registered credentials' },
    { num: 2, title: 'Business Profile', desc: 'Enterprise info' },
    { num: 3, title: 'Verification', desc: 'GSTIN & Licenses' },
    { num: 4, title: 'Addresses', desc: 'Office & Dispatch' },
    { num: 5, title: 'Delivery & Terms', desc: 'PINs & Payments' },
    { num: 6, title: 'Review & Submit', desc: 'Final Verification' },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-extrabold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Wholesale Seller Onboarding
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-dark mt-2">Business Profile & Verification</h1>
        <p className="text-xs text-ink-muted mt-1">
          Complete the 6-step onboarding wizard to unlock product listing, bulk quotation responses, and delivery management.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {stepsList.map((s) => (
          <button
            key={s.num}
            type="button"
            disabled={s.num > (profile?.onboardingStep || 2) && s.num > activeStep}
            onClick={() => s.num > 1 && setActiveStep(s.num)}
            className={`p-3 rounded-2xl border text-left transition ${
              activeStep === s.num
                ? 'border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-200 font-bold'
                : s.num < activeStep
                ? 'border-emerald-300 bg-emerald-50/50 text-emerald-800'
                : 'border-surface-border text-ink-muted opacity-60'
            }`}
          >
            <span className="text-[10px] uppercase font-bold block">Step {s.num}</span>
            <span className="text-xs font-extrabold block truncate mt-0.5">{s.title}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Step Content Card */}
      <div className="bg-surface-pure rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card space-y-6">
        {/* Step 2: Business Profile */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-ink-dark border-b border-surface-border pb-3">
              Step 2: Business Profile Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">Registered Business Name</label>
              <input
                type="text"
                required
                value={step2.businessName}
                onChange={(e) => setStep2({ ...step2, businessName: e.target.value })}
                placeholder="e.g. Bharat Wholesale Bazaar Pvt Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold text-ink-dark"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Entity Constitution</label>
                <select
                  value={step2.businessType}
                  onChange={(e) => setStep2({ ...step2, businessType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold text-ink-dark"
                >
                  <option value="PVT_LTD">Private Limited (Pvt Ltd)</option>
                  <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                  <option value="PARTNERSHIP">Partnership Firm</option>
                  <option value="LLP">Limited Liability Partnership</option>
                  <option value="TRADER">Wholesale Trader / Commission Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Years in Wholesale Business</label>
                <input
                  type="number"
                  min="0"
                  value={step2.yearsInBusiness}
                  onChange={(e) => setStep2({ ...step2, yearsInBusiness: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold text-ink-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">Trade Category</label>
              <input
                type="text"
                value={step2.businessCategory}
                onChange={(e) => setStep2({ ...step2, businessCategory: e.target.value })}
                placeholder="e.g. FMCG, Grain Staples, Dairy & Packaged Goods"
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 text-ink-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">Company Description & Mandi Operations</label>
              <textarea
                rows={3}
                value={step2.description}
                onChange={(e) => setStep2({ ...step2, description: e.target.value })}
                placeholder="Brief summary of distribution facilities, temperature storage, or direct producer sourcing..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 text-ink-dark"
              />
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-end">
              <button
                type="button"
                onClick={() => saveCurrentStep(2, step2)}
                disabled={submitting}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <span>Save & Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verification Information */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-ink-dark border-b border-surface-border pb-3">
              Step 3: Business Verification Documents
            </h3>

            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">GSTIN Number (15 Digits)</label>
              <input
                type="text"
                maxLength={15}
                value={step3.gstin}
                onChange={(e) => setStep3({ ...step3, gstin: e.target.value.toUpperCase() })}
                placeholder="e.g. 07AAAAA0000A1Z5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-mono font-bold text-ink-dark uppercase"
              />
              <span className="text-[10px] text-ink-muted mt-1 block">
                Required for tax invoicing and interstate commercial wholesale trade.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Mandi Trade / Municipal License</label>
                <input
                  type="text"
                  value={step3.tradeLicense}
                  onChange={(e) => setStep3({ ...step3, tradeLicense: e.target.value })}
                  placeholder="e.g. TRD-DL-2022-8849"
                  className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 text-ink-dark font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">FSSAI License (14 Digits)</label>
                <input
                  type="text"
                  maxLength={14}
                  value={step3.fssaiLicense}
                  onChange={(e) => setStep3({ ...step3, fssaiLicense: e.target.value })}
                  placeholder="e.g. 10019011000123"
                  className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 text-ink-dark font-mono"
                />
                <span className="text-[10px] text-ink-muted mt-1 block">Conditionally required for food & dairy products.</span>
              </div>
            </div>

            <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-200 text-xs text-brand-800 space-y-1">
              <span className="font-bold block">Verification Policy</span>
              <span>
                VyaparSetu administration manually verifies your GSTIN and trade registrations on government portals before activating your wholesale listing privileges.
              </span>
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2.5 text-xs font-bold text-ink-muted hover:text-ink-dark flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => saveCurrentStep(3, step3)}
                disabled={submitting}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <span>Save & Continue to Addresses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Addresses */}
        {activeStep === 4 && (
          <div className="space-y-5">
            <h3 className="font-extrabold text-base text-ink-dark border-b border-surface-border pb-3">
              Step 4: Business Office & Dispatch Warehouse Addresses
            </h3>

            {/* Office Address */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wide block">
                Primary Registered Office
              </span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Shop / Plot / House No."
                  value={step4.businessAddress.houseNo}
                  onChange={(e) => setStep4({
                    ...step4,
                    businessAddress: { ...step4.businessAddress, houseNo: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark"
                />
                <input
                  type="text"
                  placeholder="Street / APMC Mandi"
                  value={step4.businessAddress.street}
                  onChange={(e) => setStep4({
                    ...step4,
                    businessAddress: { ...step4.businessAddress, street: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={step4.businessAddress.city}
                  onChange={(e) => setStep4({
                    ...step4,
                    businessAddress: { ...step4.businessAddress, city: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={step4.businessAddress.state}
                  onChange={(e) => setStep4({
                    ...step4,
                    businessAddress: { ...step4.businessAddress, state: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark"
                />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="PIN Code"
                  value={step4.businessAddress.pincode}
                  onChange={(e) => setStep4({
                    ...step4,
                    businessAddress: { ...step4.businessAddress, pincode: e.target.value.replace(/\D/g, '') }
                  })}
                  className="px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark font-mono font-bold"
                />
              </div>
            </div>

            {/* Dispatch Address */}
            <div className="space-y-3 pt-3 border-t border-surface-border">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wide block">
                Warehouse / Dispatch Facility (Where orders are prepared)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Warehouse Bay / Unit No."
                  value={step4.dispatchAddress.houseNo}
                  onChange={(e) => setStep4({
                    ...step4,
                    dispatchAddress: { ...step4.dispatchAddress, houseNo: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark"
                />
                <input
                  type="text"
                  placeholder="Industrial Area / Road"
                  value={step4.dispatchAddress.street}
                  onChange={(e) => setStep4({
                    ...step4,
                    dispatchAddress: { ...step4.dispatchAddress, street: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={step4.dispatchAddress.city}
                  onChange={(e) => setStep4({
                    ...step4,
                    dispatchAddress: { ...step4.dispatchAddress, city: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={step4.dispatchAddress.state}
                  onChange={(e) => setStep4({
                    ...step4,
                    dispatchAddress: { ...step4.dispatchAddress, state: e.target.value }
                  })}
                  className="px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark"
                />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="PIN Code"
                  value={step4.dispatchAddress.pincode}
                  onChange={(e) => setStep4({
                    ...step4,
                    dispatchAddress: { ...step4.dispatchAddress, pincode: e.target.value.replace(/\D/g, '') }
                  })}
                  className="px-3 py-2 rounded-xl border border-surface-border text-xs text-ink-dark font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-4 py-2.5 text-xs font-bold text-ink-muted hover:text-ink-dark flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => saveCurrentStep(4, step4)}
                disabled={submitting}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <span>Save & Continue to Delivery Terms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Delivery & Fulfilment Settings */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-ink-dark border-b border-surface-border pb-3">
              Step 5: Delivery Serviceability & Payment Settings
            </h3>

            <div>
              <label className="block text-xs font-bold text-ink-dark mb-1">
                Serviceable PIN Codes (Comma separated 6-digit codes)
              </label>
              <textarea
                rows={3}
                value={step5.serviceablePincodes}
                onChange={(e) => setStep5({ ...step5, serviceablePincodes: e.target.value })}
                placeholder="e.g. 110001, 110002, 110003, 110033"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-xs font-mono text-ink-dark outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-ink-muted block mt-1">
                Customers outside these PIN codes will not be able to request delivery from your warehouse.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Standard Delivery Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={step5.deliveryFee}
                  onChange={(e) => setStep5({ ...step5, deliveryFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Free Delivery Threshold (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={step5.freeDeliveryThreshold}
                  onChange={(e) => setStep5({ ...step5, freeDeliveryThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={step5.minOrderValue}
                  onChange={(e) => setStep5({ ...step5, minOrderValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={step5.operatingHours}
                  onChange={(e) => setStep5({ ...step5, operatingHours: e.target.value })}
                  placeholder="e.g. 7:30 AM - 9:00 PM (Mon-Sat)"
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 text-ink-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-dark mb-1">Wholesaler UPI ID for Direct Payments</label>
                <input
                  type="text"
                  value={step5.upiId}
                  onChange={(e) => setStep5({ ...step5, upiId: e.target.value })}
                  placeholder="e.g. bharatwholesale@upi"
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs outline-none focus:border-brand-500 font-mono text-ink-dark"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-ink-dark">
                <input
                  type="checkbox"
                  checked={step5.codAvailable}
                  onChange={(e) => setStep5({ ...step5, codAvailable: e.target.checked })}
                  className="rounded text-brand-500"
                />
                <span>Enable Cash on Delivery (COD)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-ink-dark">
                <input
                  type="checkbox"
                  checked={step5.pickupEnabled}
                  onChange={(e) => setStep5({ ...step5, pickupEnabled: e.target.checked })}
                  className="rounded text-brand-500"
                />
                <span>Enable Customer Warehouse Pickup</span>
              </label>
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="px-4 py-2.5 text-xs font-bold text-ink-muted hover:text-ink-dark flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  const pincodesArray = step5.serviceablePincodes
                    .split(',')
                    .map((p) => p.trim())
                    .filter((p) => p.length === 6);

                  saveCurrentStep(5, {
                    deliverySettings: {
                      ...step5,
                      serviceablePincodes: pincodesArray,
                    },
                  });
                }}
                disabled={submitting}
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <span>Save & Proceed to Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Review and Submission */}
        {activeStep === 6 && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-base text-ink-dark border-b border-surface-border pb-3">
              Step 6: Review & Final Application Submission
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface-warm border border-surface-border space-y-1.5">
                <span className="font-extrabold text-brand-700 block uppercase tracking-wide">Enterprise Info</span>
                <div><strong>Business:</strong> {step2.businessName || profile?.businessName}</div>
                <div><strong>Type:</strong> {step2.businessType || profile?.businessType}</div>
                <div><strong>Experience:</strong> {step2.yearsInBusiness || profile?.yearsInBusiness} Years</div>
                <div><strong>Category:</strong> {step2.businessCategory || profile?.businessCategory}</div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-warm border border-surface-border space-y-1.5">
                <span className="font-extrabold text-brand-700 block uppercase tracking-wide">Legal Compliance</span>
                <div><strong>GSTIN:</strong> {step3.gstin || profile?.gstin || 'Pending entry'}</div>
                <div><strong>FSSAI:</strong> {step3.fssaiLicense || profile?.fssaiLicense || 'Not specified'}</div>
                <div><strong>Trade License:</strong> {step3.tradeLicense || profile?.tradeLicense || 'Not specified'}</div>
                <div><strong>Current Status:</strong> <span className="font-bold text-amber-700">{user?.status || 'PENDING_APPROVAL'}</span></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-warm border border-surface-border space-y-1 text-xs">
              <span className="font-extrabold text-brand-700 block uppercase tracking-wide">Fulfilment Coverage</span>
              <div>
                <strong>Serviceable PIN Codes:</strong>{' '}
                <span className="font-mono text-[11px]">
                  {Array.isArray(profile?.deliverySettings?.serviceablePincodes)
                    ? profile.deliverySettings.serviceablePincodes.join(', ')
                    : step5.serviceablePincodes}
                </span>
              </div>
              <div><strong>Delivery Fee:</strong> ₹{step5.deliveryFee || 40} (Free over ₹{step5.freeDeliveryThreshold || 499})</div>
              <div><strong>Wholesaler UPI:</strong> {step5.upiId || 'seller@upi'}</div>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Administrator Verification Notice</span>
              <p>
                Upon submitting, your application will be reviewed by the Super Admin team. Once approved, your products will be visible to all customers and retailers across your serviceable area.
              </p>
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="px-4 py-2.5 text-xs font-bold text-ink-muted hover:text-ink-dark flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Edit Previous
              </button>
              <button
                type="button"
                onClick={() => saveCurrentStep(6, {})}
                disabled={submitting}
                className="px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-card flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Submit Application to Super Admin</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WholesalerOnboardingPage;
