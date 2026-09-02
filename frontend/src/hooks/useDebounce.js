import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing fast-changing values (e.g. search inputs).
 * Prevents redundant network requests on each keystroke.
 *
 * @param {T} value - The input value to debounce
 * @param {number} delay - Debounce latency in milliseconds (default: 300ms)
 * @returns {T} - Debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}