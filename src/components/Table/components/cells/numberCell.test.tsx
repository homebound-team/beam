import { numberCell } from "src/components/Table/components/cells/numberCell";
import type { GridDataRow } from "src/components/Table/components/Row";
import { GridTable } from "src/components/Table/GridTable";
import type { GridColumn } from "src/components/Table/types";
import { simpleHeader, type SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { Palette } from "src/Css";
import { cell, render } from "src/utils/rtl";

type Data = { count: number | null | undefined };
type Row = SimpleHeaderAndData<Data>;

describe("numberCell", () => {
  it("formats the number like NumberField, and sorts on the raw number", () => {
    // When building a number cell
    const content = numberCell(1234567.891);
    // Then the value is the grouped text, for filtering and CSV
    expect(content.value).toBe("1,234,567.891");
    // And the sort value is the number
    expect(content.sortValue).toBe(1234567.891);
  });

  it("shows the table's empty cell for null, undefined and NaN", async () => {
    // Given a number column
    const columns: GridColumn<Row>[] = [{ header: "Count", data: ({ count }) => numberCell(count) }];
    // When rendered with empty values
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { count: null } },
      { kind: "data", id: "2", data: { count: undefined } },
      { kind: "data", id: "3", data: { count: NaN } },
    ];
    const r = await render(<GridTable columns={columns} rows={rows} />);
    // Then each shows "-"
    expect(cell(r, 1, 0)).toHaveTextContent(/^-$/);
    expect(cell(r, 2, 0)).toHaveTextContent(/^-$/);
    expect(cell(r, 3, 0)).toHaveTextContent(/^-$/);
    // And has no value or sort value
    const empty = numberCell(null);
    expect(empty.value).toBeUndefined();
    expect(empty.sortValue).toBeUndefined();
  });

  it("is left-aligned", async () => {
    // Given a number column
    const columns: GridColumn<Row>[] = [{ header: "Count", data: ({ count }) => numberCell(count) }];
    // When rendered
    const rows: GridDataRow<Row>[] = [simpleHeader, { kind: "data", id: "1", data: { count: 1 } }];
    const r = await render(<GridTable columns={columns} rows={rows} />);
    // Then the cell is left-aligned
    expect(cell(r, 1, 0)).toHaveStyle({ justifyContent: "flex-start", textAlign: "left" });
  });

  it("sorts numerically rather than by the formatted text", async () => {
    // Given numbers whose text would sort differently ("1,000" < "20" < "3")
    const columns: GridColumn<Row>[] = [{ id: "count", header: "Count", data: ({ count }) => numberCell(count) }];
    const rows: GridDataRow<Row>[] = [
      simpleHeader,
      { kind: "data", id: "1", data: { count: 20 } },
      { kind: "data", id: "2", data: { count: 1000 } },
      { kind: "data", id: "3", data: { count: 3 } },
    ];
    // When sorted ascending
    const r = await render(
      <GridTable columns={columns} rows={rows} sorting={{ on: "client", initial: ["count", "ASC"] }} />,
    );
    // Then they're in numeric order
    expect(cell(r, 1, 0)).toHaveTextContent("3");
    expect(cell(r, 2, 0)).toHaveTextContent("20");
    expect(cell(r, 3, 0)).toHaveTextContent("1,000");
  });

  it("shows the delta as an arrow and signed amount, colored by increaseIs", async () => {
    // Given an increase that's good, an increase that's bad, and a decrease that's good by default
    const columns: GridColumn<Row>[] = [
      { header: "Good", data: ({ count }) => numberCell(count, { delta: { value: 1200 } }) },
      { header: "Bad", data: ({ count }) => numberCell(count, { delta: { value: 1200, increaseIs: "bad" } }) },
      { header: "Down", data: ({ count }) => numberCell(count, { delta: { value: -3.5 } }) },
    ];
    // When rendered
    const rows: GridDataRow<Row>[] = [simpleHeader, { kind: "data", id: "1", data: { count: 10 } }];
    const r = await render(<GridTable columns={columns} rows={rows} />);
    // Then each shows the number and the signed delta
    expect(cell(r, 1, 0)).toHaveTextContent(/^10\+1,200$/);
    expect(cell(r, 1, 1)).toHaveTextContent(/^10\+1,200$/);
    expect(cell(r, 1, 2)).toHaveTextContent(/^10-3.5$/);
    // And an arrow pointing the way of the change
    expect(cell(r, 1, 0).querySelector("[data-icon=arrowUp]")).not.toBeNull();
    expect(cell(r, 1, 2).querySelector("[data-icon=arrowDown]")).not.toBeNull();
    // And green for good, red for bad
    const deltaOf = (col: number) => cell(r, 1, col).querySelector("svg")!.parentElement!;
    expect(deltaOf(0)).toHaveStyle({ color: Palette.Green700 });
    expect(deltaOf(1)).toHaveStyle({ color: Palette.Red600 });
    expect(deltaOf(2)).toHaveStyle({ color: Palette.Red600 });
  });

  it("hides a zero delta, and the delta of an empty cell", async () => {
    // Given a zero delta, and a delta on an empty value
    const columns: GridColumn<Row>[] = [
      { header: "Zero", data: () => numberCell(10, { delta: { value: 0 } }) },
      { header: "Empty", data: () => numberCell(null, { delta: { value: 5 } }) },
    ];
    // When rendered
    const rows: GridDataRow<Row>[] = [simpleHeader, { kind: "data", id: "1", data: { count: 10 } }];
    const r = await render(<GridTable columns={columns} rows={rows} />);
    // Then neither shows a delta
    expect(cell(r, 1, 0)).toHaveTextContent(/^10$/);
    expect(cell(r, 1, 1)).toHaveTextContent(/^-$/);
    expect(cell(r, 1, 0).querySelector("svg")).toBeNull();
    expect(cell(r, 1, 1).querySelector("svg")).toBeNull();
  });

  it("never sorts on the delta", () => {
    // When building a cell with a delta
    const content = numberCell(10, { delta: { value: 500 } });
    // Then the value and sort value are the number alone
    expect(content.value).toBe("10");
    expect(content.sortValue).toBe(10);
  });

  it("passes common options through", () => {
    // When building a cell with common options
    const content = numberCell(5, { tooltip: "Five", sticky: "left", aiMode: true });
    // Then they land on the cell
    expect(content).toMatchObject({ tooltip: "Five", sticky: "left", aiMode: true });
  });
});
