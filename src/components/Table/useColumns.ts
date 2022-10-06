import { camelCase } from "change-case";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSessionStorage } from "src/hooks/useSessionStorage";
import { GridColumn, Kinded } from "./GridTable";

export function useColumns<R extends Kinded, S = {}>(
  tableColumns: GridColumn<R, S>[],
  maybeStorageKey?: string,
): [GridColumn<R, S>[], Dispatch<SetStateAction<GridColumn<R, S>[]>>] {
  const { selectedColumns, hideColumns } = tableColumns.reduce(
    (acc, column) => {
      // Only include options that can be hidden and have the `name` property defined.
      if (!column.canHide) return acc;
      if (!column.name || column.name.length === 0) {
        console.warn("Column is missing 'name' property required by the Edit Columns button", column);
        return acc;
      }
      // Add hide-able columns
      if (column.canHide) {
        acc.hideColumns.push(column.name);
      }
      // Add selected columns
      if (column.canHide && column.visible) {
        acc.selectedColumns.push(column.name);
      }
      return { ...acc };
    },
    { selectedColumns: [] as string[], hideColumns: [] as string[] },
  );

  const storageKey = maybeStorageKey ?? camelCase(hideColumns.map((c) => c).join(""));
  const [storageNames, setStorageNames] = useSessionStorage(storageKey, selectedColumns);
  const storageColumns: GridColumn<R, S>[] =
    storageNames && storageNames.map((sc) => tableColumns.find((column) => column.name === sc)!);
  const [columns, setColumns] = useState<GridColumn<R, S>[]>(storageColumns);

  useEffect(() => {
    setStorageNames(columns.map((column) => column.name!));
  }, [columns]);

  return [columns, setColumns];
}
