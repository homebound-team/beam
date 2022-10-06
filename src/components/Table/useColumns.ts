import { camelCase } from "change-case";
import { useSessionStorage } from "src/hooks/useSessionStorage";
import { GridColumn, Kinded } from "./GridTable";

export function useColumns<R extends Kinded, S = {}>(
  tableColumns: GridColumn<R, S>[],
  maybeStorageKey?: string,
): [GridColumn<R, S>[], (value: GridColumn<R, S>[]) => void] {
  const storageKey = maybeStorageKey ?? camelCase(tableColumns.map((c) => c.name).join(""));
  const [columns, setColumns] = useSessionStorage<GridColumn<R, S>[]>(
    storageKey,
    tableColumns.filter((column) => (column.canHide ? column.visible : true)),
  );
  return [columns, setColumns];
}
