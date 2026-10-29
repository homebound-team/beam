import type { GridColumnWithId } from "src/components/Table/types";
import {
  calcColumnSizes,
  collapseColumn,
  firstContentControlPx,
  selectColumn,
  toLayoutColumns,
} from "src/components/Table/utils/columns";

describe("columns", () => {
  it("drops select and collapse from the layout and keeps other columns", () => {
    // Given select, collapse, and two content columns
    const columns = [
      collapseColumn(),
      selectColumn(),
      { id: "name", header: "Name" },
      { id: "value", header: "Value", isAction: true },
    ] as GridColumnWithId<any>[];

    // When laying the columns out
    const layout = toLayoutColumns(columns);

    // Then only the content and action columns remain, in order
    expect(layout.map((column) => column.id)).toEqual(["name", "value"]);
  });

  it("pins the first content column when a control column is sticky", () => {
    // Given a sticky select column and an unsticky name column
    const columns = [
      { id: "gutter", isLayoutGutter: true },
      selectColumn({ sticky: "left" }),
      { id: "name", header: "Name" },
      { id: "value", header: "Value", sticky: "right" },
    ] as GridColumnWithId<any>[];

    // When laying the columns out
    const layout = toLayoutColumns(columns);

    // Then the name column picks up the left stickiness and the value column keeps its own
    expect(layout.map((column) => column.sticky)).toEqual([undefined, "left", "right"]);
  });

  it("leaves an already sticky content column alone", () => {
    // Given a content column that is already sticky right
    const columns = [collapseColumn({ sticky: "left" }), { id: "name", sticky: "right" }] as GridColumnWithId<any>[];

    // When laying the columns out
    const layout = toLayoutColumns(columns);

    // Then the content column keeps sticky right
    expect(layout[0].sticky).toBe("right");
  });

  it("adds collapse and select width to the first content column", () => {
    // Given a fixed name column and both the collapse toggle and the select checkbox
    const columns = [
      { id: "name", w: "220px" },
      { id: "value", w: "100px" },
    ] as GridColumnWithId<any>[];

    // When sizing the layout columns
    const sizes = calcColumnSizes(
      columns,
      undefined,
      0,
      [],
      undefined,
      firstContentControlPx([collapseColumn(), selectColumn()]),
    );

    // Then the name column grows by the chevron (36px) and the checkbox (24px)
    expect(sizes).toEqual(["280px", "100px"]);
  });

  it("adds the row pin width when row pinning is on", () => {
    // Given the collapse toggle and the select checkbox, with row pinning on
    const width = firstContentControlPx([collapseColumn(), selectColumn()], true);
    // Then the pin (36px) is added to the chevron (36px) and the checkbox (24px)
    expect(width).toBe(96);
  });

  it("keeps a resized first content column at the dragged width", () => {
    // Given a name column the user has already resized
    const columns = [{ id: "name", w: "220px" }, { id: "value" }] as GridColumnWithId<any>[];

    // When sizing with a resized width
    const sizes = calcColumnSizes(columns, undefined, 0, [], { name: 300 }, 60);

    // Then the resized width is the whole cell and flexible columns do not also lose 60px
    expect(sizes[0]).toBe("300px");
    expect(sizes[1]).toBe("((100% - 0% - 300px) * (1 / 1))");
  });
});
