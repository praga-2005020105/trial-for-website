/**
 * @license
 * MY STICKERZ ENSEIGNE — Log In Form Component
 * WCAG-compliant, Remember Me handling, Forgot Password trigger, and OAuth integrations
 */

import React, { useState, useId } from 'react';
import { Eye, EyeOff, Lock, Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { validateLoginForm } from '../../auth/validation';
import { LoginData, LoginFormErrors, OAuthProvider } from '../../types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword
}) => {
  const { login, loginWithOAuth, isLoading: isAuthLoading } = useAuth();

  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: true
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    const nextData = { ...formData, [name]: fieldValue };
    setFormData(nextData);

    if (touched[name]) {
      const validation = validateLoginForm(nextData);
      setErrors(prev => ({
        ...prev,
        [name]: validation.errors[name as keyof LoginFormErrors] || undefined
      }));
    }
  };

  const handleBlur = (field: keyof LoginData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const validation = validateLoginForm(formData);
    setErrors(prev => ({
      ...prev,
      [field]: validation.errors[field as keyof LoginFormErrors] || undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(null);

    setTouched({ email: true, password: true });
    const validation = validateLoginForm(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      setToastMessage({ type: 'error', text: 'Please enter valid credentials.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(formData);
      if (res.success) {
        setToastMessage({
          type: 'success',
          text: 'Sign in successful! Entering customer dashboard...'
        });
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 900);
      } else {
        setToastMessage({ type: 'error', text: res.error || 'Invalid email or password.' });
        setErrors(prev => ({ ...prev, general: res.error }));
      }
    } catch {
      setToastMessage({ type: 'error', text: 'Network connection issue. Please retry.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: OAuthProvider) => {
    setIsSubmitting(true);
    try {
      const res = await loginWithOAuth(provider);
      if (res.success && onSuccess) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isAuthLoading;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 transition-all">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-900 mb-3">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950 font-serif">Sign In to Atelier</h1>
        <p className="text-sm text-gray-500 mt-1">Access orders, digital proofs (BAT), and account settings</p>
      </div>

      {/* TOAST / ALERTS */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-3 p-3.5 mb-6 rounded-lg text-xs leading-relaxed transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* SOCIAL OAUTH BUTTONS */}
      <div className="space-y-2.5 mb-6">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={isLoading}
          aria-label="Sign in with Google"
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Sign in with Google
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleOAuth('github')}
            disabled={isLoading}
            aria-label="Sign in with GitHub"
            className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('apple')}
            disabled={isLoading}
            aria-label="Sign in with Apple"
            className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-1 2.96 1.07.08 2.15-.48 2.81-1.3z" />
            </svg>
            Apple
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <span className="relative bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">
          Or sign in with email
        </span>
      </div>

      {/* LOGIN FORM */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* EMAIL ADDRESS */}
        <div>
          <label htmlFor={emailId} className="block text-xs font-semibold text-gray-800 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              aria-invalid={Boolean(errors.email && touched.email)}
              aria-describedby={errors.email && touched.email ? 'login-email-error' : undefined}
              placeholder="client@domain.com"
              className={`w-full pl-9 pr-3 py-2.5 text-xs text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.email && touched.email
                  ? 'border-red-400 focus:ring-red-100 focus:border-red-500'
                  : 'border-gray-300 focus:ring-gray-100 focus:border-gray-900'
              }`}
            />
          </div>
          {errors.email && touched.email && (
            <p id="login-email-error" role="alert" className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.email}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor={passwordId} className="block text-xs font-semibold text-gray-800">
              Password <span className="text-red-500">*</span>
            </label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-[11px] text-gray-500 hover:text-gray-900 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id={passwordId}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={isLoading}
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              aria-invalid={Boolean(errors.password && touched.password)}
              aria-describedby={errors.password && touched.password ? 'login-password-error' : undefined}
              placeholder="••••••••••••"
              className={`w-full pl-9 pr-10 py-2.5 text-xs text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.password && touched.password
                  ? 'border-red-400 focus:ring-red-100 focus:border-red-500'
                  : 'border-gray-300 focus:ring-gray-100 focus:border-gray-900'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && touched.password && (
            <p id="login-password-error" role="alert" className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.password}
            </p>
          )}
        </div>

        {/* REMEMBER ME CHECKBOX */}
        <div className="flex items-center justify-between pt-1">
          <label htmlFor={rememberId} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id={rememberId}
              name="rememberMe"
              type="checkbox"
              disabled={isLoading}
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
            />
            <span className="text-xs text-gray-600 font-medium">Remember me on this device (30 days)</span>
          </label>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider text-white bg-gray-950 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-950 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* FOOTER SWITCH */}
      <div className="mt-6 text-center text-xs text-gray-600">
        Don&apos;t have an account yet?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-bold text-gray-950 hover:text-[#ff0f39] hover:underline cursor-pointer"
        >
          Create one now →
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
