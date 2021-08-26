import { useCallback, useState } from "react";

type UseSessionStorage<T> = [T, (value: T) => void];

export function useSessionStorage<T>(key: string, defaultValue: T): UseSessionStorage<T> {
  let hasSessionStorage = false;
  try {
    hasSessionStorage = !!window.sessionStorage;
  } catch (e) {
    // Catch errors if browser storage access is denied
  }

  const [state, setState] = useState(() => {
    if (!hasSessionStorage) {
      return defaultValue;
    }
    const parsed = getParsedStorage(key);
    if (parsed) {
      return parsed;
    }
    sessionStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  });

  const setAndSave = useCallback(
    (value: T) => {
      if (hasSessionStorage && value) {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
      setState(value);
    },
    [hasSessionStorage, key],
  );

  return [state, setAndSave];
}

function getParsedStorage(key: string) {
  try {
    const storedString = sessionStorage.getItem(key);
    return storedString && JSON.parse(storedString);
  } catch (e) {
    sessionStorage.removeItem(key);
  }
}
