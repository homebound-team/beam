import { Kinded } from "src/components";
import { GridDataRow } from "src/components/Table/components/Row";

export function visit<R extends Kinded>(rows: GridDataRow<R>[], fn: (row: GridDataRow<R>) => void): void {
  const todo = [...rows];
  while (todo.length > 0) {
    const row = todo.pop()!;
    fn(row);
    if (row.children) {
      todo.push(...row.children);
    }
  }
}
