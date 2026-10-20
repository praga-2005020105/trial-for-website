/**
 * @license
 * MY STICKERZ ENSEIGNE — Forgot Password Modal
 * WCAG-accessible modal dialog with keyboard trapping and clean status feedback
 */

import React, { useState, useEffect, useRef, useId } from 'react';
import { Mail, X, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { validateEmail } from '../../auth/validation';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = ''
}) => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState<string>(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const emailInputId = useId();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
    setError(null);
    setIsSuccess(false);
  }, [initialEmail, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.error || 'Failed to dispatch reset instructions.');
      }
    } catch {
      setError('Connection failure. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative"
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CONTENT */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h2 id="forgot-password-title" className="text-xl font-bold text-gray-900 font-serif">
            Reset Your Password
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <strong className="block font-semibold mb-1">Check Your Inbox</strong>
                If an account exists for <span className="font-semibold underline">{email}</span>, a secure recovery email has been dispatched.
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Done & Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor={emailInputId} className="block text-xs font-semibold text-gray-800 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id={emailInputId}
                  type="email"
                  required
                  disabled={isSubmitting}
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="client@domain.com"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    error ? 'border-red-400 focus:ring-red-100' : 'border-gray-300 focus:ring-gray-100 focus:border-gray-900'
                  }`}
                />
              </div>
              {error && (
                <p role="alert" className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-gray-950 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-950 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-gray-500 hover:text-gray-900 hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
