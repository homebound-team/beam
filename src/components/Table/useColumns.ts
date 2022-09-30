import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { GridColumn, Kinded } from "./GridTable";

export interface Columns<R extends Kinded, S = {}> {
  allColumns: GridColumn<R, S>[];
  visibleColumns: GridColumn<R, S>[];
}

export function useColumns<R extends Kinded, S = {}>(
  tableColumns: GridColumn<R, S>[],
): [Columns<R, S>, Dispatch<SetStateAction<Columns<R, S>>>] {
  const initColumns: Columns<R, S> = useMemo(() => {
    return {
      allColumns: tableColumns,
      visibleColumns: tableColumns.filter((column) => (column.canHide && column.visible) || !column.canHide),
    };
  }, [tableColumns]);

  const [columns, setColumns] = useState<Columns<R, S>>(initColumns);
  return [columns, setColumns];
}
