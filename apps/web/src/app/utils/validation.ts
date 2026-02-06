export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  required: (value: string): ValidationResult => {
    if (!value || value.trim() === '') {
      return { isValid: false, error: 'This field is required' };
    }
    return { isValid: true };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      return { isValid: false, error: 'Email is required' };
    }
    if (!emailRegex.test(value)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true };
  },

  password: (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Password is required' };
    }
    if (value.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }
    return { isValid: true };
  },

  minLength: (min: number) => (value: string): ValidationResult => {
    if (value.length < min) {
      return { isValid: false, error: `Must be at least ${min} characters` };
    }
    return { isValid: true };
  },

  maxLength: (max: number) => (value: string): ValidationResult => {
    if (value.length > max) {
      return { isValid: false, error: `Must be no more than ${max} characters` };
    }
    return { isValid: true };
  },

  url: (value: string): ValidationResult => {
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  },

  phone: (value: string): ValidationResult => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!value) {
      return { isValid: false, error: 'Phone number is required' };
    }
    if (!phoneRegex.test(value)) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }
    if (value.replace(/\D/g, '').length < 10) {
      return { isValid: false, error: 'Phone number must be at least 10 digits' };
    }
    return { isValid: true };
  },

  matchField: (matchValue: string, fieldName: string) => (value: string): ValidationResult => {
    if (value !== matchValue) {
      return { isValid: false, error: `${fieldName} do not match` };
    }
    return { isValid: true };
  },
};

export function validateField(value: string, rules: Array<(value: string) => ValidationResult>): ValidationResult {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
}

export function validateForm<T extends Record<string, any>>(
  values: T,
  rules: Partial<Record<keyof T, Array<(value: string) => ValidationResult>>>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const field in rules) {
    const fieldRules = rules[field];
    if (fieldRules) {
      const result = validateField(String(values[field] || ''), fieldRules);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
}
