/**
 * @license
 * MY STICKERZ ENSEIGNE — Main Application with Authentication Routing & Dashboard
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ShieldCheck, Package, Clock, CheckCircle2, LogOut, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'dashboard';

const MainAuthApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [isForgotOpen, setIsForgotOpen] = useState<boolean>(false);

  // Sync with browser URL path if available
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('signup')) {
      setCurrentView('signup');
    } else if (path.includes('dashboard')) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  }, []);

  const handleNav = (view: AuthView) => {
    setCurrentView(view);
    const newPath = view === 'dashboard' ? '/dashboard' : view === 'signup' ? '/signup' : '/login';
    window.history.pushState({}, '', newPath);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col font-sans selection:bg-[#ff0f39] selection:text-white">
      {/* BRAND TOP BAR */}
      <header className="border-b border-gray-800/80 bg-[#151519]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/index.html" className="flex items-center gap-3 group">
            <img
              src="/images/company-logo.jpeg"
              alt="MY STICKERZ ENSEIGNE"
              className="h-9 w-9 rounded-md object-cover ring-1 ring-gray-700"
              onError={e => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm tracking-wide text-white group-hover:text-[#ff0f39] transition-colors">
                MY STICKERZ ENSEIGNE
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Atelier Fabrication</span>
            </div>
          </a>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="/index.html"
              className="hidden sm:inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Storefront
            </a>
            <a
              href="/products.html"
              className="hidden sm:inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            >
              Catalog
            </a>
            <a
              href="/neon-builder.html"
              className="inline-flex items-center gap-1.5 text-[#ff0f39] font-semibold hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Neon Builder
            </a>
          </div>
        </div>
      </header>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {currentView === 'dashboard' ? (
          <ProtectedRoute onUnauthorized={() => handleNav('login')}>
            <div className="w-full max-w-4xl bg-[#151519] border border-gray-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
              {/* DASHBOARD HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-gray-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Atelier Session
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                    Welcome back, {user?.fullName || 'Valued Client'}
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/products.html"
                    className="px-4 py-2 text-xs font-bold bg-[#ff0f39] hover:bg-[#d00a2c] text-white rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    + New Project
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      handleNav('login');
                    }}
                    className="px-3.5 py-2 text-xs font-medium text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>

              {/* STATS OVERVIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
                <div className="p-5 bg-gray-900/60 border border-gray-800/80 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Total Signage Orders
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-white">1</span>
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                </div>

                <div className="p-5 bg-gray-900/60 border border-gray-800/80 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Digital Proofs (BAT)
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-blue-400">Validated</span>
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  </div>
                </div>

                <div className="p-5 bg-gray-900/60 border border-gray-800/80 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Manufacturing Status
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-emerald-400">In Production</span>
                    <Clock className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* RECENT ORDERS TABLE */}
              <div className="bg-gray-900/40 border border-gray-800/80 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-200">Active Workshop Projects</h2>
                  <a
                    href="https://wa.me/33698710050"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    Atelier WhatsApp Support <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-950/60 text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-800">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Signage Product</th>
                        <th className="py-3 px-4">Total (HT)</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-gray-300">
                      <tr>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">#ORD-ATELIER-2026</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-white">Custom LED Neon Sign</span>
                          <span className="block text-[11px] text-gray-400 mt-0.5">Size: 75 × 25 cm · Red Glow</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">350,00 € HT</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            CNC Milling
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        ) : (
          /* SPLIT / CARD LAYOUT FOR AUTH FORMS */
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* BRAND HERO SIDEBAR (DESKTOP) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between h-full p-8 rounded-2xl bg-gradient-to-br from-[#151519] to-[#0d0d12] border border-gray-800 text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff0f39] block mb-2">
                  PARISIAN SIGNAGE WORKSHOP
                </span>
                <h2 className="text-3xl font-serif font-bold leading-tight mb-4">
                  Bespoke Storefronts &amp; Illuminated Neons
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Join hundreds of French businesses, boutiques, and architectural brands who trust MY STICKERZ ENSEIGNE for certified 2-Year Workshop precision.
                </p>
              </div>

              <div className="my-8 relative z-10 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#ff0f39]" />
                  <span>Real-time digital proof (BAT) approval</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#ff0f39]" />
                  <span>Track manufacturing &amp; CNC milling live</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#ff0f39]" />
                  <span>Direct technician support via WhatsApp</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800/80 text-[11px] text-gray-500 relative z-10">
                🔒 Protected by 256-bit PBKDF2 encryption &amp; secure session tokens.
              </div>
            </div>

            {/* FORM CONTAINER */}
            <div className="lg:col-span-7 flex justify-center">
              {currentView === 'signup' ? (
                <SignUpForm
                  onSuccess={() => handleNav('dashboard')}
                  onSwitchToLogin={() => handleNav('login')}
                />
              ) : (
                <LoginForm
                  onSuccess={() => handleNav('dashboard')}
                  onSwitchToSignUp={() => handleNav('signup')}
                  onForgotPassword={() => setIsForgotOpen(true)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* FORGOT PASSWORD MODAL */}
      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />

      {/* FOOTER */}
      <footer className="border-t border-gray-800/80 py-4 text-center text-[11px] text-gray-500">
        &copy; 2026 MY STICKERZ ENSEIGNE SAS · All rights reserved. ·{' '}
        <a href="/terms" className="hover:underline">
          Terms of Service
        </a>{' '}
        ·{' '}
        <a href="/cookies" className="hover:underline">
          Cookie Policy
        </a>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAuthApp />
    </AuthProvider>
  );
}
