import { useMemo } from "react";
import { GridColumn, GridDataRow, GridTable, simpleHeader, SimpleHeaderAndData } from "src/index";
import { zeroTo } from "src/utils/sb";

type Row = SimpleHeaderAndData<{ name: string; value: number }>;

/** Wide sticky-header `GridTable` fixture for layout and scroll stories. */
export function TableExample({
  numCols = 10,
  numRows = 100,
  virtualized = false,
}: {
  numCols?: number;
  numRows?: number;
  virtualized?: boolean;
}) {
  const rows: GridDataRow<Row>[] = useMemo(
    () => [
      simpleHeader,
      ...zeroTo(numRows).map((i) => ({
        kind: "data" as const,
        id: String(i),
        data: { name: `ccc ${i}`, value: i + 1 },
      })),
    ],
    [numRows],
  );
  const columns: GridColumn<Row>[] = useMemo(
    () =>
      zeroTo(numCols).map((i) => ({
        header: `Header ${i + 1}`,
        data: ({ value }) => `Cell ${i + 1}x${value}`,
        w: "100px",
        sticky: i === 0 ? "left" : undefined,
      })),
    [numCols],
  );

  return (
    <GridTable
      as={virtualized ? "virtual" : "div"}
      stickyHeader
      columns={columns}
      rows={rows}
      style={{ rowHeight: "fixed" }}
    />
  );
}
