/**
 * Utility functions for formatting data
 */

/**
 * Format currency amount
 * Handles both string and number inputs since backend returns decimals as strings
 */
export function formatCurrency(amount: string | number, currency: string = 'UGX'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `${currency} 0`;
  }
  
  return `${currency} ${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date to ISO string (for API)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as +256 XXX XXX XXX
  if (digits.length === 12 && digits.startsWith('256')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  
  // Format as 0XXX XXX XXX
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  
  return phone;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0).toUpperCase() || '?';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number | string, total: number | string): number {
  const partNum = typeof part === 'string' ? parseFloat(part) : part;
  const totalNum = typeof total === 'string' ? parseFloat(total) : total;
  
  if (totalNum === 0) return 0;
  return Math.round((partNum / totalNum) * 100);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Parse decimal string to number
 */
export function parseDecimal(value: string): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Format decimal to string (for API)
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
