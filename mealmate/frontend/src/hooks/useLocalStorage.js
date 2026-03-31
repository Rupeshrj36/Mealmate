import { useState } from 'react';

/**
 * Like useState but persists to localStorage.
 * Safely handles JSON parse errors.
 *
 * @param {string} key          - localStorage key
 * @param {*}      initialValue - default value if key doesn't exist
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('useLocalStorage write error:', error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {}
  };

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
