import { Dispatch, SetStateAction, useState } from "react";
import { GridColumn, Kinded } from "./GridTable";

export function useColumns<R extends Kinded, S = {}>(
  tableColumns: GridColumn<R, S>[],
): [GridColumn<R, S>[], Dispatch<SetStateAction<GridColumn<R, S>[]>>] {
  const [columns, setColumns] = useState<GridColumn<R, S>[]>(
    tableColumns.filter((column) => (column.canHide ? column.visible : true)),
  );
  return [columns, setColumns];
}
