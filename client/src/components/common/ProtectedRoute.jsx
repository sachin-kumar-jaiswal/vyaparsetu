import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Clock, XCircle, Loader2 } from 'lucide-react';

/**
 * ProtectedRoute — wraps routes that require authentication and/or a specific role.
 *
 * Props:
 *   requiredRoles  — array of role strings allowed (e.g. ['WHOLESALER']). If omitted, any authenticated user passes.
 *   requireApproval — if true, PENDING_APPROVAL / REJECTED users see a blocking screen instead of the page.
 */
export const ProtectedRoute = ({ children, requiredRoles = [], requireApproval = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for session restore before deciding
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="flex flex-col items-center gap-3 text-ink-muted">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <p className="text-sm font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to home (AuthModal will open from Navbar)
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location, openAuth: true }} replace />;
  }

  // Role check: if specific roles required and user's role is not in the list
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-black text-ink-dark">Access Denied</h2>
        <p className="text-sm text-ink-muted">
          This page is restricted to{' '}
          <span className="font-bold text-ink-dark">{requiredRoles.join(' / ')}</span> accounts.
          Your current role is <span className="font-bold text-ink-dark">{user.role}</span>.
        </p>
        <a href="/" className="inline-block mt-4 px-6 py-2.5 bg-brand-500 text-white rounded-xl font-bold text-sm hover:bg-brand-600 transition">
          Return to Home
        </a>
      </div>
    );
  }

  // Approval check: RETAILER / WHOLESALER may have PENDING or REJECTED status
  if (requireApproval && user.role !== 'SUPER_ADMIN' && user.role !== 'CUSTOMER') {
    if (user.status === 'PENDING_APPROVAL') {
      return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <Clock className="w-12 h-12 text-accent-saffron mx-auto" />
          <h2 className="text-2xl font-black text-ink-dark">Approval Pending</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Your <span className="font-bold text-ink-dark">{user.role}</span> application has been received
            and is under review by our team. You will receive an email once it is approved.
            Restricted features will be unlocked upon approval.
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs text-amber-800 font-medium space-y-1">
            <p>✅ Your account is active — you can still browse products and shop as a customer.</p>
            <p>⏳ Seller/retailer dashboard access requires admin approval.</p>
          </div>
          <a href="/" className="inline-block mt-4 px-6 py-2.5 bg-brand-500 text-white rounded-xl font-bold text-sm hover:bg-brand-600 transition">
            Continue Shopping
          </a>
        </div>
      );
    }

    if (user.status === 'REJECTED') {
      return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-black text-ink-dark">Application Rejected</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Unfortunately, your <span className="font-bold text-ink-dark">{user.role}</span> application was not approved.
            {user.rejectionReason && (
              <span className="block mt-2 text-red-700 font-medium">Reason: {user.rejectionReason}</span>
            )}
          </p>
          <p className="text-xs text-ink-muted">
            Please contact <a href="mailto:support@vyaparsetu.in" className="underline">support@vyaparsetu.in</a> for assistance.
          </p>
          <a href="/" className="inline-block mt-4 px-6 py-2.5 bg-brand-500 text-white rounded-xl font-bold text-sm hover:bg-brand-600 transition">
            Return to Home
          </a>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
