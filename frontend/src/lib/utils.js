import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes conditionally and resolves conflicts safely.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats numeric amounts into localized Indian Rupee currency string (INR).
 *
 * @param {number|string} amount
 * @param {boolean} includeSymbol
 * @returns {string} e.g. "INR 14,500.00"
 */
export function formatCurrency(amount, includeSymbol = true) {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return includeSymbol ? `INR ${formatted}` : formatted;
}

/**
 * Formats date/timestamp to standard localized date/datetime string.
 *
 * @param {string|Date} date
 * @param {boolean} includeTime
 * @returns {string}
 */
export function formatDate(date, includeTime = false) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return includeTime ? d.toLocaleString('en-IN') : d.toLocaleDateString('en-IN');
}