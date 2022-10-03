import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { GridColumn, Kinded } from "./GridTable";

export function useColumns<R extends Kinded, S = {}>(
  tableColumns: GridColumn<R, S>[],
): [GridColumnState<R, S>, Dispatch<SetStateAction<GridColumnState<R, S>>>] {
  const initColumns: GridColumnState<R, S> = useMemo(() => {
    return {
      visibleColumns: tableColumns.filter((column) => column.canHide ? column.visible : true),
    };
  }, [tableColumns]);

  const [columns, setColumns] = useState<GridColumnState<R, S>>(initColumns);
  return [columns, setColumns];
}

export type GridColumnState<R extends Kinded, S = {}> = {
  visibleColumns: GridColumn<R, S>[];
}