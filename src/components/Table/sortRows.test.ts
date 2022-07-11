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
        data: { name: "b" },
        children: [
          { kind: "child", id: "2.1", data: { name: "b1" } },
          { kind: "child", id: "2.3", data: { name: "B3" } },
          { kind: "child", id: "2.2", data: { name: "b2" } },
        ],
      },
      { kind: "parent", id: "1", data: { name: "a" } },
      { kind: "parent", id: "3", data: { name: "c" } },
    ];
    // When sorting them in ascending order based on the name property
    const sorted = sortRows([nameColumn], rows, [0, "ASC", undefined], false);
    // Then expected sorted to be in ascending correct order
    expect(rowsToIdArray(sorted)).toEqual(["1", "2", "2.1", "2.2", "2.3", "3", "header"]);
    // TODO Put this back when we have tuple-based sorting
    // And `rows` to maintain original order
    // expect(rowsToIdArray(rows)).toEqual(["header", "2", "2.1", "2.3", "2.2", "1", "3"]);
  });

  it("can return a sorted copy of nested rows in descending order", () => {
    // Given a set of unsorted nested rows
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      // And the data is initially unsorted
      {
        kind: "parent",
        id: "2",
        data: { name: "b" },
        children: [
          { kind: "child", id: "2.1", data: { name: "b1" } },
          { kind: "child", id: "2.3", data: { name: "B3" } },
          { kind: "child", id: "2.2", data: { name: "b2" } },
        ],
      },
      { kind: "parent", id: "1", data: { name: "a" } },
      { kind: "parent", id: "3", data: { name: "c" } },
    ];
    // When sorting them in descending order based on the name property
    const sorted = sortRows([nameColumn], rows, [0, "DESC", undefined], false);
    // Then expected sorted to be in descending correct order
    expect(rowsToIdArray(sorted)).toEqual(["header", "3", "2", "2.3", "2.2", "2.1", "1"]);
    // TODO Put this back when we have tuple-based sorting
    // And `rows` to maintain original order
    // expect(rowsToIdArray(rows)).toEqual(["header", "2", "2.1", "2.3", "2.2", "1", "3"]);
  });

  it("can return a sorted copy of nested rows with case sensitive sort", () => {
    // Given a set of unsorted nested rows
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      // And the data is initially unsorted
      {
        kind: "parent",
        id: "2",
        data: { name: "b" },
        children: [
          { kind: "child", id: "2.1", data: { name: "b1" } },
          { kind: "child", id: "2.3", data: { name: "B3" } },
          { kind: "child", id: "2.2", data: { name: "b2" } },
        ],
      },
      { kind: "parent", id: "1", data: { name: "a" } },
      { kind: "parent", id: "3", data: { name: "C" } },
    ];
    // When sorting them in descending order based on the name property
    const sorted = sortRows([nameColumn], rows, [0, "DESC", undefined], true);
    // Then expected case sensitive sort in descending correct order
    expect(rowsToIdArray(sorted)).toEqual(["2", "2.2", "2.1", "2.3", "1", "header", "3"]);
  });

  it("can sort within pinned rows", () => {
    // Given a set of unsorted rows
    const rows: GridDataRow<Row>[] = [
      // And this row is not pinned, so should come last
      { kind: "parent", id: "3", data: { name: "a" } },
      // And this row is pinned, so should come first
      { kind: "parent", id: "2", data: { name: "c" }, pin: "first" },
      // And this row is pinned and also before the other pin
      { kind: "parent", id: "1", data: { name: "b" }, pin: "first" },
    ];
    // When sorting them in descending order based on the name property
    const sorted = sortRows([nameColumn], rows, [0, "ASC", undefined], true);
    // Then expected case sensitive sort in descending correct order
    expect(rowsToIdArray(sorted)).toEqual(["1", "2", "3"]);
  });
});

type HeaderRow = { kind: "header" };
type ParentRow = { kind: "parent"; id: string; data: { name: string | undefined } };
type ChildRow = { kind: "child"; id: string; data: { name: string | undefined } };
type Row = HeaderRow | ParentRow | ChildRow;
const nameColumn: GridColumn<Row> = { header: "Name", parent: ({ name }) => name, child: ({ name }) => name };

function rowsToIdArray(rows: GridDataRow<Row>[]): string[] {
  return rows.flatMap((r) => (r.children ? [r.id, ...r.children.map((c) => c.id)] : r.id));
}
