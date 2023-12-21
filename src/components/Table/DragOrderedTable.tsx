import React from "react";
import { Only } from "src/Css";
import {
  GridTableXss,
  Ordered,
} from "src/components/Table/types";
import { GridTable, GridTableProps } from "./GridTable";
import { GridTableApi } from "./GridTableApi";
import { GridDataRow } from "./components/Row";

// type OrderedData = Ordered & { data: infer D };
type OrderedDataRow<T extends Ordered> = GridDataRow<T> & { order: number };
type OrderedTableProps<R extends Ordered, X> = GridTableProps<R, X> & { rows: OrderedDataRow<R>[] };

//** a specialized version of GridTable that takes ordered rows and implements default methods to drag & drop reorder rows */
export function DragOrderedTable<R extends Ordered, X extends Only<GridTableXss, X> = any> (props: OrderedTableProps<R, X>) {
  const { rows: initialRows } = props;
  type DataType = { row: OrderedDataRow<R>; api: GridTableApi<R> };
  type EventType = React.DragEvent<HTMLTableRowElement>;
  const spacerRow: OrderedDataRow<R> = {
    kind: "spacer",
    id: "spacer",
    data: {} as R,
    order: -1,
    draggable: true,
  };

  const [rows, setRows] = React.useState<OrderedDataRow<R>[]>(initialRows);

  // need these in an object for each kind allowed by the R type
  const onDragStart = (row: R, data: DataType, evt: EventType) => {
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.dropEffect = "move";
    evt.dataTransfer.setData("text/plain", JSON.stringify({ row: data.row }));
  };

  const onDragEnd = (row: R, data: DataType, evt: EventType) => {
    evt.preventDefault();
    evt.dataTransfer.clearData();
    const spacerIndex = rows.findIndex((r) => r.id === spacerRow.id);
    if (spacerIndex > 0) {
      rows.splice(spacerIndex, 1);
      setRows([...rows]);
    }
  };

  const onDrop = (row: R, data: DataType, evt: EventType) => {
    evt.preventDefault();
    evt.dataTransfer.clearData();

    try {
      const draggedRowData = JSON.parse(evt.dataTransfer.getData("text/plain")).row;

      // make sure spacer is removed
      const spacerIndex = rows.findIndex((r) => r.id === spacerRow.id);
      const spacerOrder = rows[spacerIndex].order;
      if (spacerIndex > 0) {
        rows.splice(spacerIndex, 1);
      }

      // get rows in order (index matches order)
      let orderedRows = rows.sort((a, b) => a.order - b.order);

      // remove dragged row
      const draggedRow = orderedRows.splice(draggedRowData.order, 1)[0];

      // change the dragging row's order to ceil(spacer's order)
      draggedRow.order = Math.ceil(spacerOrder);

      // insert it at the index
      orderedRows = [
        ...orderedRows.slice(0, draggedRow.order),
        draggedRow,
        ...orderedRows.slice(draggedRow.order, orderedRows.length),
      ];
      // set row order to index
      orderedRows.forEach((r, idx) => (r.order = idx));
      setRows([...orderedRows]);
    } catch {}
  };

  const onDragEnter = (row: R, data: DataType, evt: EventType) => {
    evt.preventDefault();
    if (data.row.id === spacerRow.id) {
      return;
    }

    const dir = evt.clientY > evt.currentTarget.offsetTop + 0.5 * evt.currentTarget.clientHeight ? 1 : -1;

    // add a spacer above or below the row being dragged over
    // showing where the dragged row will be when dropped
    const spacerIndex = rows.findIndex((r) => r.id === spacerRow.id);
    if (spacerIndex === -1) {
      setRows([...rows, { ...spacerRow, order: data.row.order + dir * 0.1 }]);
    } else {
      rows[spacerIndex].order = data.row.order + dir * 0.1;
      setRows([...rows]);
    }
  };

  const onDragOver = (row: R, data: DataType, evt: EventType) => {
    evt.preventDefault();

    if (data.row.id === spacerRow.id) {
      return;
    }

    const spacerIndex = rows.findIndex((r) => r.id === spacerRow.id);
    if (spacerIndex > 0) {
      const dir = evt.clientY > evt.currentTarget.offsetTop + 0.5 * evt.currentTarget.clientHeight ? 1 : -1;

      rows[spacerIndex].order = data.row.order + dir * 0.1;
      setRows([...rows]);
    }
  };

  return (
    <GridTable
      {...props}
      onRowDragStart={{data: onDragStart}}
      onRowDragEnd={onDragEnd}
      onRowDrop={onDrop}
      onRowDragEnter={onDragEnter}
      onRowDragOver={onDragOver}
      rows={[...rows].sort((a, b) => a.order - b.order)}
    />
  );
}