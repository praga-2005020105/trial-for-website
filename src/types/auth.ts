/**
 * @license
 * MY STICKERZ ENSEIGNE — Authentication Type Definitions
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt: number;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  agreeToTerms: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export type OAuthProvider = 'google' | 'github' | 'apple';

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: AuthSession;
  error?: string;
  code?: string;
  message?: string;
}

export interface FieldValidation {
  isValid: boolean;
  message: string;
}

export interface SignUpFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface PasswordStrength {
  score: number; // 0 - 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  color: string;
  hasLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}
