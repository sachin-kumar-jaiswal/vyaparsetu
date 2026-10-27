import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Package,
  Layers,
  ShieldAlert,
  FileSpreadsheet,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import PincodeModal from '../common/PincodeModal';
import AuthModal from '../common/AuthModal';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemsCount, totalSubtotal, pincode } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-brand-900 text-white text-[11px] py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-accent-saffron text-ink-dark px-1.5 py-0.5 rounded font-extrabold text-[10px]">
              B2B2C DIRECT
            </span>
            <span className="hidden sm:inline">
              VyaparSetu — Connecting Indian Wholesalers, Retailers &amp; Direct Customers
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-accent-saffron font-bold text-[10px] uppercase tracking-wide">
                Signed in as {user.role.toLowerCase()}
              </span>
            )}
            <Link to="/bulk-inquiries" className="hover:text-accent-saffron transition hidden md:inline">
              Bulk Wedding &amp; Event Quotes
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-surface-pure border-b border-surface-border shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-3 md:gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center p-1.5 shadow-sm">
                <img src="/images/branding/logo-mark.svg" alt="VyaparSetu" className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-brand-700 leading-none">
                  Vyapar<span className="text-ink-dark">Setu</span>
                </span>
                <span className="text-[9px] font-bold text-accent-gold tracking-widest mt-0.5">
                  EK PLATFORM. HAR VYAPAR.
                </span>
              </div>
            </Link>

            {/* Location Selector */}
            <button
              onClick={() => setIsPincodeOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-warm hover:bg-brand-50 border border-surface-border text-left transition"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-ink-muted uppercase font-bold block leading-tight">Deliver to</span>
                <span className="text-xs font-bold text-ink-dark flex items-center gap-1">
                  PIN {pincode}
                  <ChevronDown className="w-3 h-3 text-ink-muted" />
                </span>
              </div>
            </button>

            {/* Live Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for milk, atta, oil, biscuits, paper plates..."
                  className="w-full pl-10 pr-24 py-2.5 rounded-full bg-surface-warm border border-surface-border focus:border-brand-500 focus:bg-surface-pure focus:ring-2 focus:ring-brand-100 outline-none text-sm text-ink-dark transition placeholder:text-ink-muted/80"
                />
                <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-xs font-bold transition flex items-center gap-1"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Role specific quick badge */}
              {user?.role === 'WHOLESALER' && (
                <Link
                  to="/wholesaler/dashboard"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold hover:bg-brand-100 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Seller Dashboard
                </Link>
              )}

              {user?.role === 'RETAILER' && (
                <Link
                  to="/retailer/dashboard"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-light text-accent-gold border border-accent-gold/30 text-xs font-bold hover:bg-accent-saffron/20 transition"
                >
                  <Store className="w-4 h-4" />
                  Retailer Hub
                </Link>
              )}

              {user?.role === 'SUPER_ADMIN' && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}

              {/* User Account / Profile */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-surface-warm transition border border-transparent hover:border-surface-border text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-xs font-bold text-ink-dark block max-w-[100px] truncate leading-tight">
                        {user.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-brand-600 font-semibold block capitalize">
                        {user.role.toLowerCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-ink-muted hidden sm:inline" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-surface-pure rounded-2xl shadow-float border border-surface-border p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-surface-border mb-1">
                        <span className="font-bold text-sm text-ink-dark block truncate">{user.name}</span>
                        <span className="text-xs text-ink-muted block truncate">{user.email}</span>
                        <span className="inline-block mt-1 bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded">
                          {user.role} ({user.status})
                        </span>
                      </div>

                      {user.role === 'WHOLESALER' && (
                        <>
                          <Link
                            to="/wholesaler/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-dark hover:bg-surface-warm rounded-lg"
                          >
                            <LayoutDashboard className="w-4 h-4 text-brand-500" />
                            Wholesaler Dashboard
                          </Link>
                          <Link
                            to="/wholesaler/onboarding"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-dark hover:bg-surface-warm rounded-lg"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-brand-500" />
                            Business Onboarding Form
                          </Link>
                        </>
                      )}

                      {user.role === 'RETAILER' && (
                        <Link
                          to="/retailer/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-dark hover:bg-surface-warm rounded-lg"
                        >
                          <Store className="w-4 h-4 text-accent-gold" />
                          Retailer Portal
                        </Link>
                      )}

                      {user.role === 'SUPER_ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-dark hover:bg-surface-warm rounded-lg"
                        >
                          <ShieldAlert className="w-4 h-4 text-purple-600" />
                          Super Admin Oversight
                        </Link>
                      )}

                      <Link
                        to="/my-orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-dark hover:bg-surface-warm rounded-lg"
                      >
                        <Package className="w-4 h-4 text-brand-500" />
                        My Orders
                      </Link>

                      <Link
                        to="/addresses"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-dark hover:bg-surface-warm rounded-lg"
                      >
                        <MapPin className="w-4 h-4 text-brand-500" />
                        Saved Addresses
                      </Link>

                      <Link
                        to="/bulk-inquiries"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-dark hover:bg-surface-warm rounded-lg"
                      >
                        <Layers className="w-4 h-4 text-brand-500" />
                        Bulk Inquiries & Quotes
                      </Link>

                      <div className="border-t border-surface-border mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-warm hover:bg-surface-muted text-ink-dark text-xs font-bold transition border border-surface-border"
                >
                  <User className="w-4 h-4 text-brand-500" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Cart Button */}
              <Link
                to="/cart"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition shadow-sm relative"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent-saffron text-ink-dark font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">₹{totalSubtotal}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <div className="border-t border-surface-border bg-surface-pure/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-2.5 text-xs font-semibold gap-6 scrollbar-none text-ink-secondary">
            <Link to="/products" className="hover:text-brand-600 shrink-0 font-bold text-brand-700">
              All Products
            </Link>
            <Link to="/products?category=dairy-breakfast" className="hover:text-brand-600 shrink-0">
              Dairy & Breakfast
            </Link>
            <Link to="/products?category=atta-staples" className="hover:text-brand-600 shrink-0">
              Atta & Staples
            </Link>
            <Link to="/products?category=cooking-essentials" className="hover:text-brand-600 shrink-0">
              Cooking Essentials
            </Link>
            <Link to="/products?category=fruits" className="hover:text-brand-600 shrink-0">
              Fresh Fruits
            </Link>
            <Link to="/products?category=vegetables" className="hover:text-brand-600 shrink-0">
              Fresh Vegetables
            </Link>
            <Link to="/products?category=snacks-packaged-food" className="hover:text-brand-600 shrink-0">
              Snacks & Namkeen
            </Link>
            <Link to="/products?category=beverages" className="hover:text-brand-600 shrink-0">
              Beverages
            </Link>
            <Link to="/products?category=event-supplies" className="hover:text-brand-600 shrink-0 text-accent-gold font-bold">
              Bulk Event Supplies
            </Link>
            <Link to="/bulk-inquiries" className="hover:text-brand-600 shrink-0 text-brand-600 font-bold">
              Request Quote
            </Link>
          </div>
        </div>
      </header>

      {/* Modals */}
      <PincodeModal isOpen={isPincodeOpen} onClose={() => setIsPincodeOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Navbar;
