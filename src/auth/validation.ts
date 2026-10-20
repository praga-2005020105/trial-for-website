/**
 * @license
 * MY STICKERZ ENSEIGNE — Authentication Form Validation Rules & Schemas
 */

import { PasswordStrength, SignUpData, SignUpFormErrors, LoginFormErrors } from '../types/auth';

/**
 * Standard RFC 5322 compliant email regex
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Special character regex for password complexity
 */
export const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

/**
 * Evaluate password strength and compliance with strict security requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = SPECIAL_CHAR_REGEX.test(password);

  let score = 0;
  if (hasLength) score++;
  if (hasUppercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (hasLowercase && password.length >= 12) score++;

  const normalizedScore = Math.min(4, score);

  let label: PasswordStrength['label'] = 'Weak';
  let color = '#ef4444'; // Red

  switch (normalizedScore) {
    case 0:
    case 1:
      label = 'Weak';
      color = '#ef4444'; // Red
      break;
    case 2:
      label = 'Fair';
      color = '#f59e0b'; // Amber
      break;
    case 3:
      label = 'Good';
      color = '#3b82f6'; // Blue
      break;
    case 4:
      label = hasLength && hasUppercase && hasNumber && hasSpecial ? 'Very Strong' : 'Strong';
      color = '#10b981'; // Emerald
      break;
  }

  return {
    score: normalizedScore,
    label,
    color,
    hasLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial
  };
}

/**
 * Validates email field
 */
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address (e.g., client@domain.com).';
  }
  return null;
}

/**
 * Validates password against core security rules
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one numeric digit (0-9).';
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*...).';
  }
  return null;
}

/**
 * Validates confirm password matches password
 */
export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}

/**
 * Validates full name
 */
export function validateFullName(name: string): string | null {
  if (!name || !name.trim()) {
    return 'Full name or company name is required.';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  return null;
}

/**
 * Comprehensive Sign Up Form Validation
 */
export function validateSignUpForm(data: SignUpData): { isValid: boolean; errors: SignUpFormErrors } {
  const errors: SignUpFormErrors = {};

  const nameError = validateFullName(data.fullName);
  if (nameError) errors.fullName = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const confirmError = validateConfirmPassword(data.password, data.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  if (!data.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the Terms of Service to proceed.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Comprehensive Login Form Validation
 */
export function validateLoginForm(data: { email: string; password: string }): { isValid: boolean; errors: LoginFormErrors } {
  const errors: LoginFormErrors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  if (!data.password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
