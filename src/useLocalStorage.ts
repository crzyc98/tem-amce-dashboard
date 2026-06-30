import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

// Persist a piece of UI state (filters, selected period) to localStorage so a
// user's view survives reloads (PRD §5: "Persist selections in localStorage").
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota / privacy-mode errors — persistence is best-effort.
    }
  }, [key, value]);

  const set = useCallback<Dispatch<SetStateAction<T>>>((v) => setValue(v), []);
  return [value, set];
}
