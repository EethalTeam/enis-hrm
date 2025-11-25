import { useState, useEffect } from 'react';

/**
 * A custom React hook that debounces a value.
 * @param {any} value The value to debounce (e.g., text from an input field).
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {any} The debounced value, which updates only after the delay has passed.
 */
export function useDebounce(value, delay) {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer that will update the debounced value after the specified delay.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // This is the cleanup function. It runs every time the `value` or `delay`
    // changes, or when the component unmounts. It clears the previous timer,
    // effectively resetting the debounce period.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // The effect will re-run only if the value or delay changes.

  // Return the latest debounced value to the component.
  return debouncedValue;
}