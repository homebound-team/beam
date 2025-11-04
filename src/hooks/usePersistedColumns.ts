import { useSessionStorage } from "src/hooks";

export interface UsePersistedColumnsProps {
  storageKey: string;
}

interface PersistedColumnsHook {
  visibleColumnIds: string[] | undefined;
  setVisibleColumnIds: (ids: string[]) => void;
}

/**
 * Persists visible column IDs to sessionStorage.
 * Returns undefined if no persisted state exists, allowing GridTable to use its defaults.
 */
export function usePersistedColumns({ storageKey }: UsePersistedColumnsProps): PersistedColumnsHook {
  const [visibleColumnIds, setVisibleColumnIds] = useSessionStorage<string[] | undefined>(storageKey, undefined);

  return { visibleColumnIds, setVisibleColumnIds };
}
