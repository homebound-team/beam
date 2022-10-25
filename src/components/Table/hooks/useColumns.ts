import { camelCase } from "change-case";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { GridColumn, Kinded } from "src/components/Table/types";
import { useSessionStorage } from "src/hooks/useSessionStorage";

export function useColumns<R extends Kinded>(
  tableColumns: GridColumn<R>[],
  maybeStorageKey?: string,
): [GridColumn<R>[], Dispatch<SetStateAction<GridColumn<R>[]>>] {
  const { selectedColumns, hideColumns } = tableColumns.reduce(
    (acc, column) => {
      // Only include options that can be hidden and have the `id` property defined.
      if (!column.id || column.id.length === 0) {
        console.warn("Column is missing 'id' property required by the Edit Columns button", column);
        return acc;
      }
      // Add hide-able columns
      if (column.canHide) {
        acc.hideColumns.push(column.id);
      }
      // Add selected columns
      if (!column.canHide || (column.canHide && column.initVisible)) {
        acc.selectedColumns.push(column.id);
      }
      return { ...acc };
    },
    { selectedColumns: [] as string[], hideColumns: [] as string[] },
  );

  const storageKey = maybeStorageKey ?? camelCase(hideColumns.map((c) => c).join(""));
  const [storageNames, setStorageNames] = useSessionStorage(storageKey, selectedColumns);
  const storageColumns: GridColumn<R>[] =
    storageNames && storageNames.map((sc) => tableColumns.find((column) => column.id === sc)!);
  const [columns, setColumns] = useState<GridColumn<R>[]>(storageColumns);

  useEffect(() => {
    setStorageNames(columns.map((column) => column.id!));
  }, [columns]);

  return [columns, setColumns];
}
