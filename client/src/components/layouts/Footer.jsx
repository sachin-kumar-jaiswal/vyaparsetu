import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, BadgeIndianRupee, Building, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-surface-pure border-t border-surface-border mt-16 text-ink-secondary">
      {/* Service Highlights */}
      <div className="border-b border-surface-border bg-brand-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-ink-dark">Verified Sellers</h5>
                <p className="text-xs text-ink-muted mt-0.5">
                  100% GSTIN, FSSAI, and business document verified Indian wholesalers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-ink-dark">Seller-Managed Delivery</h5>
                <p className="text-xs text-ink-muted mt-0.5">
                  Direct dispatch from local warehouses and APMC mandis within verified PIN codes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                <BadgeIndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-ink-dark">Transparent Wholesale Pricing</h5>
                <p className="text-xs text-ink-muted mt-0.5">
                  Quantity-based tier prices for Kirana stores, caterers, and bulk shoppers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-ink-dark">Safe COD & UPI</h5>
                <p className="text-xs text-ink-muted mt-0.5">
                  Pay at delivery, direct customer pickup, or verify manual UPI transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Sitemap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center p-1">
                <img src="/images/branding/logo-mark.svg" alt="VyaparSetu" className="w-full h-full" />
              </div>
              <span className="font-extrabold text-xl text-brand-700">
                Vyapar<span className="text-ink-dark">Setu</span>
              </span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed max-w-sm mb-4">
              VyaparSetu is an Indian B2B2C marketplace connecting wholesalers, kirana retailers, and individual customers.
              Empowering local commerce with transparent tier pricing, bulk purchasing, and seller-managed dispatch.
            </p>
            <div className="text-xs text-ink-muted space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-500" />
                <span>support@vyaparsetu.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-500" />
                <span>+91 11 4890 2026 (Mon-Sat, 9AM-8PM)</span>
              </div>
            </div>
          </div>

          {/* Grocery Categories */}
          <div>
            <h6 className="font-bold text-xs uppercase tracking-wider text-ink-dark mb-3">Grocery Stores</h6>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=dairy-breakfast" className="hover:text-brand-600 transition">Dairy & Breakfast</Link></li>
              <li><Link to="/products?category=atta-staples" className="hover:text-brand-600 transition">Atta, Rice & Dal</Link></li>
              <li><Link to="/products?category=cooking-essentials" className="hover:text-brand-600 transition">Edible Oils & Spices</Link></li>
              <li><Link to="/products?category=fruits" className="hover:text-brand-600 transition">Fresh Fruits</Link></li>
              <li><Link to="/products?category=vegetables" className="hover:text-brand-600 transition">Fresh Vegetables</Link></li>
              <li><Link to="/products?category=snacks-packaged-food" className="hover:text-brand-600 transition">Biscuits & Namkeen</Link></li>
            </ul>
          </div>

          {/* Wholesale & B2B */}
          <div>
            <h6 className="font-bold text-xs uppercase tracking-wider text-ink-dark mb-3">B2B Wholesale</h6>
            <ul className="space-y-2 text-xs">
              <li><Link to="/bulk-inquiries" className="hover:text-brand-600 transition">Event & Wedding Supplies</Link></li>
              <li><Link to="/products?category=event-supplies" className="hover:text-brand-600 transition">Disposable Plates & Cups</Link></li>
              <li><Link to="/retailer/dashboard" className="hover:text-brand-600 transition">Retailer Kirana Portal</Link></li>
              <li><Link to="/wholesaler/onboarding" className="hover:text-brand-600 transition">Seller Registration</Link></li>
              <li><Link to="/products" className="hover:text-brand-600 transition">Bulk Packaged Water</Link></li>
            </ul>
          </div>

          {/* Platform & Account */}
          <div>
            <h6 className="font-bold text-xs uppercase tracking-wider text-ink-dark mb-3">Platform</h6>
            <ul className="space-y-2 text-xs">
              <li><Link to="/my-orders" className="hover:text-brand-600 transition">Track Orders</Link></li>
              <li><Link to="/addresses" className="hover:text-brand-600 transition">Saved Delivery Addresses</Link></li>
              <li><Link to="/wholesaler/dashboard" className="hover:text-brand-600 transition">Seller Inventory Hub</Link></li>
              <li><Link to="/admin" className="hover:text-brand-600 transition">Super Admin Access</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="border-t border-surface-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ink-muted gap-4">
          <p>© 2026 VyaparSetu Marketplace. All rights reserved. Ek Platform. Har Vyapar.</p>
          <p className="text-right">
            Original VyaparSetu Indian Commerce Platform. Not affiliated with any external quick commerce brand.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
