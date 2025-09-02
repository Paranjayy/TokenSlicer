import { useState, Dispatch, SetStateAction } from 'react';

// Fix: The original return type for the hook's setter function was `(value: T) => void`, which does not allow for functional updates
// (e.g., `setValue(prev => ...)`). This caused a type error in App.tsx.
// By changing the return type to `[T, Dispatch<SetStateAction<T>>]`, we align it with React's `useState` setter,
// allowing it to accept a value or a function, which fixes the error. Also removed an unused import and fixed a typo in the generic parameter list.
function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

export default useLocalStorage;
