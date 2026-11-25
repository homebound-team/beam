import { progressCell } from "src/components/Table/components/cells/progressCell";
import type { GridDataRow } from "src/components/Table/components/Row";
import { GridTable } from "src/components/Table/GridTable";
import type { GridColumn } from "src/components/Table/types";
import { simpleHeader, type SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { cell, render } from "src/utils/rtl";

type Data = { progress: number | null };
type Row = SimpleHeaderAndData<Data>;

const columns: GridColumn<Row>[] = [{ header: "Progress", data: ({ progress }) => progressCell(progress) }];

describe("progressCell", () => {
  it("renders a progress bar with its % label", async () => {
    // Given a row at 40%
    const rows: GridDataRow<Row>[] = [simpleHeader, { kind: "data", id: "1", data: { progress: 40 } }];
    // When rendered
    const r = await render(<GridTable columns={columns} rows={rows} />);
    // Then the cell shows the bar filled to 40%
    expect(r.progressBar_value).toHaveTextContent("40%");
    expect(r.progressBar_fill).toHaveStyle({ width: "40%" });
  });

  it("uses the number as the cell's value and sortValue", () => {
    // When building a progress cell
    const content = progressCell(40);
    // Then the number drives sorting, filtering and CSV
    expect(content.value).toBe(40);
    expect(content.sortValue).toBe(40);
  });

  it("shows the table's empty cell for null and undefined", async () => {
    // Given a row with no progress
    const rows: GridDataRow<Row>[] = [simpleHeader, { kind: "data", id: "1", data: { progress: null } }];
    // When rendered
    const r = await render(<GridTable columns={columns} rows={rows} />);
    // Then the cell shows "-" and no bar
    expect(cell(r, 1, 0)).toHaveTextContent(/^-$/);
    expect(r.query.progressBar).toBeNull();
    // And neither empty value gets a value or card slot
    for (const empty of [progressCell(null), progressCell(undefined)]) {
      expect(empty.value).toBeUndefined();
      expect(empty.sortValue).toBeUndefined();
      expect(empty.cardSlot).toBeUndefined();
    }
  });

  it("still renders a 0% value", async () => {
    // Given a row at 0%, which is falsy but not empty
    const rows: GridDataRow<Row>[] = [simpleHeader, { kind: "data", id: "1", data: { progress: 0 } }];
    // When rendered
    const r = await render(<GridTable columns={columns} rows={rows} />);
    // Then the bar shows 0% rather than the empty cell
    expect(r.progressBar_value).toHaveTextContent("0%");
  });

  it("defaults the card slot to the progress, and a passed cardSlot wins", () => {
    // When building a progress cell
    // Then the card gets the same progress
    expect(progressCell(40).cardSlot).toEqual({ kind: "progress", value: 40 });
    // And a caller's cardSlot replaces the default
    const cardSlot = { kind: "dataBlock", label: "Progress", value: "40%" } as const;
    expect(progressCell(40, { cardSlot }).cardSlot).toBe(cardSlot);
  });

  it("forwards aiMode to the progress bar and passes the common options through", async () => {
    // Given a progress cell in AI mode with a tooltip
    const aiColumns: GridColumn<Row>[] = [
      { header: "Progress", data: ({ progress }) => progressCell(progress, { aiMode: true, tooltip: "Tip" }) },
    ];
    const rows: GridDataRow<Row>[] = [simpleHeader, { kind: "data", id: "1", data: { progress: 40 } }];
    // When rendered
    const r = await render(<GridTable columns={aiColumns} rows={rows} />);
    // Then the bar's track gets the AI color
    expect(r.progressBar_track).toHaveStyle({ backgroundColor: "rgba(221,214,254,1)" });
    // And the cell keeps the pass-through options
    expect(progressCell(40, { aiMode: true, sticky: "left", colspan: 2, tooltip: "Tip" })).toMatchObject({
      aiMode: true,
      sticky: "left",
      colspan: 2,
      tooltip: "Tip",
    });
  });
});
