/**
 * Validation utility functions
 */

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Uganda format)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Check for valid Uganda phone formats
  // +256XXXXXXXXX (12 digits) or 0XXXXXXXXX (10 digits)
  return (digits.length === 12 && digits.startsWith('256')) || 
         (digits.length === 10 && digits.startsWith('0'));
}

/**
 * Validate required field
 */
export function isRequired(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Validate minimum length
 */
export function minLength(value: string, length: number): boolean {
  return value.trim().length >= length;
}

/**
 * Validate maximum length
 */
export function maxLength(value: string, length: number): boolean {
  return value.trim().length <= length;
}

/**
 * Validate number range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate positive number
 */
export function isPositive(value: number | string): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
}

/**
 * Validate non-negative number
 */
export function isNonNegative(value: number | string): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0;
}

/**
 * Validate date is not in the future
 */
export function isNotFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj <= new Date();
}

/**
 * Validate date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Validate member number format (e.g., M001, M002)
 */
export function isValidMemberNumber(memberNumber: string): boolean {
  const memberNumberRegex = /^M\d{3,}$/;
  return memberNumberRegex.test(memberNumber);
}

/**
 * Get validation error message
 */
export function getErrorMessage(
  field: string,
  rule: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'positive' | 'memberNumber',
  param?: number
): string {
  switch (rule) {
    case 'required':
      return `${field} is required`;
    case 'email':
      return `Please enter a valid email address`;
    case 'phone':
      return `Please enter a valid phone number`;
    case 'minLength':
      return `${field} must be at least ${param} characters`;
    case 'maxLength':
      return `${field} must not exceed ${param} characters`;
    case 'positive':
      return `${field} must be greater than 0`;
    case 'memberNumber':
      return `Member number must be in format M001, M002, etc.`;
    default:
      return `Invalid ${field}`;
  }
}

/**
 * Validate form data
 * Returns an object with field names as keys and error messages as values
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, Array<{ rule: string; param?: number | string }>>
): Record<keyof T, string | null> {
  const errors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
  
  for (const field in rules) {
    const fieldRules = rules[field];
    const value = data[field];
    
    for (const { rule, param } of fieldRules) {
      let isValid = true;
      let errorMsg = '';
      
      switch (rule) {
        case 'required':
          isValid = isRequired(value as string | number);
          errorMsg = getErrorMessage(String(field), 'required');
          break;
        case 'email':
          isValid = isValidEmail(value as string);
          errorMsg = getErrorMessage(String(field), 'email');
          break;
        case 'phone':
          isValid = isValidPhone(value as string);
          errorMsg = getErrorMessage(String(field), 'phone');
          break;
        case 'minLength':
          isValid = minLength(value as string, param as number);
          errorMsg = getErrorMessage(String(field), 'minLength', param as number);
          break;
        case 'maxLength':
          isValid = maxLength(value as string, param as number);
          errorMsg = getErrorMessage(String(field), 'maxLength', param as number);
          break;
        case 'positive':
          isValid = isPositive(value as number | string);
          errorMsg = getErrorMessage(String(field), 'positive');
          break;
      }
      
      if (!isValid) {
        errors[field] = errorMsg;
        break; // Stop at first error for this field
      }
    }
    
    if (!errors[field]) {
      errors[field] = null;
    }
  }
  
  return errors;
}

/**
 * Check if form has errors
 */
export function hasErrors<T extends Record<string, unknown>>(
  errors: Record<keyof T, string | null>
): boolean {
  return Object.values(errors).some(error => error !== null);
}
