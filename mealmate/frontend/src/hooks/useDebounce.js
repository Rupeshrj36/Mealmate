import { useState, useEffect } from 'react';

/**
 * Delays updating a value until the user stops typing.
 * Useful for search inputs to avoid firing an API call on every keystroke.
 *
 * @param {*}      value  - The value to debounce
 * @param {number} delay  - Milliseconds to wait (default 400)
 * @returns debounced value
 */
const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
