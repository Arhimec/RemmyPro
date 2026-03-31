import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

export function usePersistedState<T>(initialValue: T, key: string) {
  const [state, setState] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const loadedRef = useRef(false);
  const keyRef = useRef(key);

  // Load data on mount or key change
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    loadedRef.current = false;
    keyRef.current = key;

    api.get<T>(key).then((data) => {
      if (mounted && keyRef.current === key) { // Ensure key hasn't changed during fetch
        if (data !== null && data !== undefined) {
          setState(data);
        }
        loadedRef.current = true;
        setIsLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [key]);

  // Save data when state changes
  // We use a ref to prevent saving the initialValue over the remote data before it loads
  useEffect(() => {
    if (loadedRef.current) {
      // Debounce could be added here if high frequency updates are expected
      api.set(key, state);
    }
  }, [key, state]);

  // Return loading state so components can show a spinner
  return [state, setState, isLoading] as const;
}