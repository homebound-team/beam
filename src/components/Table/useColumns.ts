import { useSessionStorage } from "src/hooks/useSessionStorage";
import { GridColumn, Kinded } from "./GridTable";

export function useColumns<R extends Kinded, S = {}>(
  storageKey: string,
  tableColumns: GridColumn<R, S>[],
): [GridColumn<R, S>[], (value: GridColumn<R, S>[]) => void] {
  const [columns, setColumns] = useSessionStorage<GridColumn<R, S>[]>(
    storageKey,
    tableColumns.filter((column) => (column.canHide ? column.visible : true)),
  );
  return [columns, setColumns];
}
