/**
 * @license
 * MY STICKERZ ENSEIGNE — Protected Route Guard Component
 * Redirects unauthenticated users to /login and preserves intended destination
 */

import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackRedirect?: string;
  onUnauthorized?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackRedirect = '/login',
  onUnauthorized
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-[#ff0f39] animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Verifying Atelier Security Session...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!isAuthenticated || !user) {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        // Redirect directly preserving return target
        sessionStorage.setItem('mse_auth_redirect', currentPath);
        window.location.href = `${fallbackRedirect}?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 font-serif mb-1">Authentication Required</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-4">
          Please sign in to access your customer orders, design proofs, and workshop account.
        </p>
        <a
          href={fallbackRedirect}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign In Now →
        </a>
      </div>
    );
  }

  // 3. Authenticated: Render protected child views
  return <>{children}</>;
};

export default ProtectedRoute;
