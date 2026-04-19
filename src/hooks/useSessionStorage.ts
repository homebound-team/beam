import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createSessionStorageAdapter,
  loadSessionStorageJson,
  type SessionStorageInput,
} from "src/hooks/usePageSessionStorage";

type UseSessionStorage<T> = [T, (value: T) => void];

/** Persists React state to either a raw or page-scoped `sessionStorage` key. */
export function useSessionStorage<T>(storage: SessionStorageInput, defaultValue: T): UseSessionStorage<T> {
  const storageAdapter = useMemo(
    function memoizedStorageAdapter() {
      return typeof storage === "string" ? createSessionStorageAdapter(storage) : storage;
    },
    [storage],
  );
  const defaultValueKey = useMemo(function defaultValueKey() {
    return JSON.stringify(defaultValue);
  }, [defaultValue]);
  const stableDefaultValue = useRef(defaultValue);
  const stableDefaultValueKey = useRef(defaultValueKey);
  if (stableDefaultValueKey.current !== defaultValueKey) {
    stableDefaultValue.current = defaultValue;
    stableDefaultValueKey.current = defaultValueKey;
  }

  const [state, setState] = useState(function initialState() {
    return getStoredValue(storageAdapter, stableDefaultValue.current);
  });

  useEffect(
    function syncStateWhenStorageChanges() {
      setState(getStoredValue(storageAdapter, stableDefaultValue.current));
    },
    [defaultValueKey, storageAdapter],
  );

  const setAndSave = useCallback(
    function setAndSave(value: T) {
      if (value === undefined) {
        storageAdapter.removeItem();
      } else {
        storageAdapter.setItem(JSON.stringify(value));
      }
      setState(value);
    },
    [storageAdapter],
  );

  return [state, setAndSave];
}

function getStoredValue<T>(storage: SessionStorageInput, defaultValue: T): T {
  const parsed = loadSessionStorageJson<T>(storage);
  if (parsed !== undefined) {
    return parsed;
  }

  if (defaultValue !== undefined) {
    const storageAdapter = typeof storage === "string" ? createSessionStorageAdapter(storage) : storage;
    storageAdapter.setItem(JSON.stringify(defaultValue));
  }

  return defaultValue;
}
