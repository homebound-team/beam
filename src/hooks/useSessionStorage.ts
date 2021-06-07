import { useEffect, useState } from "react";

export function useSessionStorage<T>(key: string, defaultValue: T) {
  let hasSessionStorage = false;
  try {
    hasSessionStorage = !!window.sessionStorage;
  } catch (e) {
    // Catch errors if browser storage access is denied
  }

  const [state, setState] = useState(() => {
    if (hasSessionStorage) {
      return getParsedStorage(key) || defaultValue;
    } else {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (hasSessionStorage && state) {
      sessionStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state, hasSessionStorage]);

  return [state, setState];
}

function getParsedStorage(key: string) {
  try {
    const storedString = sessionStorage.getItem(key);
    return storedString && JSON.parse(storedString);
  } catch (e) {
    sessionStorage.removeItem(key);
  }
}
