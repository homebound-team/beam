import { textCell } from "src/components/Table/components/cells/textCell";
import type { GridDataRow } from "src/components/Table/components/Row";
import { GridTable } from "src/components/Table/GridTable";
import type { RowStyles } from "src/components/Table/TableStyles";
import type { GridColumn } from "src/components/Table/types";
import { simpleHeader, type SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { cell, click, render, withRouter } from "src/utils/rtl";
import { vi } from "vitest";

type Data = { name: string | null };
type Row = SimpleHeaderAndData<Data>;

const rows: GridDataRow<Row>[] = [
  simpleHeader,
  { kind: "data", id: "1", data: { name: "Foo" } },
  { kind: "data", id: "2", data: { name: null } },
];

describe("textCell", () => {
  it("uses the text as the cell's value", () => {
    // When building a text cell
    const content = textCell("Foo");
    // Then the text drives sorting, filtering and CSV
    expect(content.value).toBe("Foo");
  });

  it("shows the table's empty cell for empty values and drops the decorations", async () => {
    // Given a column with a link, a status dot and an end icon
    const columns: GridColumn<Row>[] = [
      {
        header: "Name",
        data: ({ name }) => textCell(name, { onClick: "/foo", status: "success", endIcon: { icon: "error" } }),
      },
    ];
    // When rendered with a row whose name is null
    const r = await render(<GridTable columns={columns} rows={rows} />, withRouter());
    // Then the empty row shows "-" with no link or icon
    expect(cell(r, 2, 0)).toHaveTextContent(/^-$/);
    expect(cell(r, 2, 0).querySelector("a, svg")).toBeNull();
  });

  it("leaves out the value and default card slot for empty values", () => {
    // When building an empty cell with a status
    const content = textCell(null, { status: "success" });
    // Then it has no value to sort or filter on
    expect(content.value).toBeUndefined();
    // And no status card slot
    expect(content.cardSlot).toBeUndefined();
  });

  it("links only the text, not the decorations", async () => {
    // Given a linked cell with a status dot and an end icon
    const columns: GridColumn<Row>[] = [
      {
        header: "Name",
        data: ({ name }) => textCell(name, { onClick: "/foo", status: "info", endIcon: { icon: "error" } }),
      },
    ];
    // When rendered
    const r = await render(<GridTable columns={columns} rows={rows} />, withRouter());
    // Then there is a single link, around just the text
    const links = cell(r, 1, 0).querySelectorAll("a");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent(/^Foo$/);
    expect(links[0]).toHaveAttribute("href", "/foo");
    // And the icon sits outside it
    expect(links[0].querySelector("svg")).toBeNull();
    expect(cell(r, 1, 0).querySelector("svg")).not.toBeNull();
  });

  it("supports openInNew and download links", async () => {
    // Given one cell that opens in a new tab and one that downloads
    const columns: GridColumn<Row>[] = [
      { header: "New tab", data: () => textCell("New tab", { onClick: "/a", openInNew: true }) },
      { header: "Download", data: () => textCell("Download", { onClick: "/b.pdf", download: true }) },
    ];
    // When rendered
    const r = await render(<GridTable columns={columns} rows={rows.slice(0, 2)} />, withRouter());
    // Then the links carry the matching attributes
    expect(r.getByText("New tab", { selector: "a span" }).closest("a")).toHaveAttribute("target", "_blank");
    expect(r.getByText("Download", { selector: "a span" }).closest("a")).toHaveAttribute("download");
  });

  it("renders a button for a function onClick, outside the row's onClick", async () => {
    // Given a row onClick
    const rowOnClick = vi.fn();
    const rowStyles: RowStyles<Row> = { header: {}, data: { onClick: rowOnClick } };
    // And a cell with its own onClick
    const cellOnClick = vi.fn();
    const columns: GridColumn<Row>[] = [
      { header: "Name", data: ({ name }) => textCell(name, { onClick: cellOnClick }) },
    ];
    const r = await render(<GridTable columns={columns} rows={rows} rowStyles={rowStyles} />);
    // When clicking the text
    click(r.getByRole("button", { name: "Foo" }));
    // Then only the cell's onClick fires
    expect(cellOnClick).toHaveBeenCalledTimes(1);
    expect(rowOnClick).not.toHaveBeenCalled();
  });

  it("defaults the card slot to the status, and a passed cardSlot wins", () => {
    // When building a cell with a status
    // Then the card gets a matching status tag
    expect(textCell("Active", { status: "success" }).cardSlot).toEqual({
      kind: "status",
      tag: { text: "Active", type: "success" },
    });
    // And a caller's cardSlot replaces the default
    const cardSlot = { kind: "title", text: "Active" } as const;
    expect(textCell("Active", { status: "success", cardSlot }).cardSlot).toBe(cardSlot);
  });
});
