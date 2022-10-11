import { GridDataRow } from "src/components/Table/components/Row";

export function visit(rows: GridDataRow<any>[], fn: (row: GridDataRow<any>) => void): void {
  const todo = [...rows];
  while (todo.length > 0) {
    const row = todo.pop()!;
    fn(row);
    if (row.children) {
      todo.push(...row.children);
    }
  }
}
