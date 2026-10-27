import React, { useState } from 'react';
import { MapPin, X, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const PincodeModal = ({ isOpen, onClose }) => {
  const { pincode, setPincode } = useCart();
  const [inputVal, setInputVal] = useState(pincode);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(inputVal.trim())) {
      setError('Please enter a valid 6-digit Indian PIN code (e.g. 110001).');
      return;
    }
    setPincode(inputVal.trim());
    setError('');
    onClose();
  };

  const popularPincodes = [
    { pin: '110001', label: 'Connaught Place, New Delhi' },
    { pin: '110033', label: 'Azadpur Mandi, Delhi' },
    { pin: '110092', label: 'Laxmi Nagar, East Delhi' },
    { pin: '110025', label: 'Okhla Industrial Area' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-dark/60 backdrop-blur-sm p-4">
      <div className="bg-surface-pure rounded-2xl shadow-float max-w-md w-full p-6 border border-surface-border animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ink-dark">Choose Delivery Location</h3>
              <p className="text-xs text-ink-muted">Verify instant seller dispatch & coverage</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-dark p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-dark uppercase tracking-wider mb-1.5">
              Enter 6-Digit PIN Code
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="e.g. 110001"
                className="w-full px-4 py-3 rounded-xl border border-surface-border focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none font-semibold text-lg tracking-wider text-ink-dark"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-4 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg text-sm transition"
              >
                Apply
              </button>
            </div>
            {error && <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>}
          </div>

          <div>
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-2">
              Popular Serviceable Hubs
            </span>
            <div className="grid grid-cols-1 gap-2">
              {popularPincodes.map((item) => (
                <button
                  key={item.pin}
                  type="button"
                  onClick={() => {
                    setPincode(item.pin);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                    pincode === item.pin
                      ? 'border-brand-500 bg-brand-50/50 text-brand-700'
                      : 'border-surface-border hover:bg-surface-warm text-ink-dark'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{item.pin}</span>
                    <span className="text-xs text-ink-muted">{item.label}</span>
                  </div>
                  {pincode === item.pin && <Check className="w-4 h-4 text-brand-500" />}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PincodeModal;
