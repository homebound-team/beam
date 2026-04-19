import { useMemo } from "react";

export type PageSessionStorage = {
  key: string;
  getItem: () => string | null;
  setItem: (value: string) => void;
  removeItem: () => void;
};

export type SessionStorageInput = string | PageSessionStorage;

export type PageSessionStorageOptions = {
  includeSearch?: boolean;
};

export type PageSessionStorageKeyOptions = PageSessionStorageOptions & {
  componentId?: string;
  pathname?: string;
  search?: string;
};

/** Creates a page-scoped `sessionStorage` adapter for the current URL. */
export function usePageSessionStorage(
  storageName: string,
  componentId?: string,
  options: PageSessionStorageOptions = {},
): PageSessionStorage {
  const pathname = getCurrentPathname();
  const search = getCurrentSearch();
  const includeSearch = options.includeSearch ?? false;

  return useMemo(
    function memoizedPageSessionStorage() {
      return createPageSessionStorage(storageName, { componentId, includeSearch, pathname, search });
    },
    [componentId, includeSearch, pathname, search, storageName],
  );
}

/** Creates a page-scoped `sessionStorage` adapter for a specific path. */
export function createPageSessionStorage(
  storageName: string,
  options: PageSessionStorageKeyOptions = {},
): PageSessionStorage {
  return createSessionStorageAdapter(getPageSessionStorageKey(storageName, options));
}

/** Creates a basic `sessionStorage` adapter for a raw storage key. */
export function createSessionStorageAdapter(key: string): PageSessionStorage {
  return {
    key,
    getItem: function getItem() {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: function setItem(value: string) {
      try {
        sessionStorage.setItem(key, value);
      } catch {
        // Ignore storage access errors.
      }
    },
    removeItem: function removeItem() {
      try {
        sessionStorage.removeItem(key);
      } catch {
        // Ignore storage access errors.
      }
    },
  };
}

/** Returns the stable page-scoped key for a storage namespace. */
export function getPageSessionStorageKey(
  storageName: string,
  options: PageSessionStorageKeyOptions = {},
): string {
  const pathname = options.pathname ?? getCurrentPathname();
  const search = options.search ?? getCurrentSearch();
  const pageKey = options.includeSearch ? `${pathname}${search}` : pathname;
  const keyParts = ["beam", "session", storageName, pageKey, options.componentId];
  return keyParts.filter(isNonEmptyKeyPart).join(":");
}

/** Parses JSON from `sessionStorage`, removing invalid values. */
export function loadSessionStorageJson<T>(storage: SessionStorageInput): T | undefined {
  const storageAdapter = resolveSessionStorage(storage);
  const storedString = storageAdapter.getItem();
  if (storedString === null) return undefined;

  try {
    return JSON.parse(storedString) as T;
  } catch {
    storageAdapter.removeItem();
    return undefined;
  }
}

function resolveSessionStorage(storage: SessionStorageInput): PageSessionStorage {
  return typeof storage === "string" ? createSessionStorageAdapter(storage) : storage;
}

function getCurrentPathname(): string {
  return typeof window === "undefined" ? "" : window.location.pathname;
}

function getCurrentSearch(): string {
  return typeof window === "undefined" ? "" : window.location.search;
}

function isNonEmptyKeyPart(value: string | undefined): value is string {
  return value !== undefined && value !== "";
}
