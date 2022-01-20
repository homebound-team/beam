import { GridColumn, GridDataRow } from "src/components/Table/GridTable";
import { simpleHeader } from "src/components/Table/simpleHelpers";
import { sortRows } from "src/components/Table/sortRows";

describe("sortRows", () => {
  it("can return a sorted copy of nested rows in ascending order", () => {
    // Given a set of unsorted nested rows
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      // And the data is initially unsorted
      {
        kind: "parent",
        id: "2",
        name: "b",
        children: [
          { kind: "child", id: "2.1", name: "b1" },
          { kind: "child", id: "2.3", name: "b3" },
          { kind: "child", id: "2.2", name: "b2" },
        ],
      },
      { kind: "parent", id: "1", name: "a" },
      { kind: "parent", id: "3", name: "c" },
    ];
    // When sorting them in ascending order based on the name property
    const sorted = sortRows([nameColumn], rows, [0, "ASC"]);
    // Then expected sorted to be in ascending correct order
    expect(rowsToIdArray(sorted)).toEqual(["header", "1", "2", "2.1", "2.2", "2.3", "3"]);
    // And `rows` to maintain original order
    expect(rowsToIdArray(rows)).toEqual(["header", "2", "2.1", "2.3", "2.2", "1", "3"]);
  });
  it("can return a sorted copy of nested rows in descending order", () => {
    // Given a set of unsorted nested rows
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      // And the data is initially unsorted
      {
        kind: "parent",
        id: "2",
        name: "b",
        children: [
          { kind: "child", id: "2.1", name: "b1" },
          { kind: "child", id: "2.3", name: "b3" },
          { kind: "child", id: "2.2", name: "b2" },
        ],
      },
      { kind: "parent", id: "1", name: "a" },
      { kind: "parent", id: "3", name: "c" },
    ];
    // When sorting them in descending order based on the name property
    const sorted = sortRows([nameColumn], rows, [0, "DESC"]);
    // Then expected sorted to be in descending correct order
    expect(rowsToIdArray(sorted)).toEqual(["3", "2", "2.3", "2.2", "2.1", "1", "header"]);
    // And `rows` to maintain original order
    expect(rowsToIdArray(rows)).toEqual(["header", "2", "2.1", "2.3", "2.2", "1", "3"]);
  });
});

type HeaderRow = { kind: "header" };
type ParentRow = { kind: "parent"; id: string; name: string | undefined };
type ChildRow = { kind: "child"; id: string; name: string | undefined };
type Row = HeaderRow | ParentRow | ChildRow;
const nameColumn: GridColumn<Row> = { header: "Name", parent: ({ name }) => name, child: ({ name }) => name };

function rowsToIdArray(rows: GridDataRow<Row>[]): string[] {
  return rows.flatMap((r) => (r.children ? [r.id, ...r.children.map((c) => c.id)] : r.id));
}
