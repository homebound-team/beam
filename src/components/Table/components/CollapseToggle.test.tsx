import { CollapseToggle } from "src/components/Table/components/CollapseToggle";
import { TableState, TableStateContext } from "src/components/Table/utils/TableState";
import { render } from "src/utils/rtl";

describe("CollapseToggle", () => {
  it("defaults to uncollapsed", async () => {
    const rowState = new TableState();
    rowState.setRows([{ id: "r:1", kind: "header", data: {} }]);
    const r = await render(
      <TableStateContext.Provider value={{ tableState: rowState }}>
        <CollapseToggle row={{ id: "r:1", kind: "header", data: {} }} />
      </TableStateContext.Provider>,
    );
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("chevronsDown");
  });

  it.each([
    [true, "header", "chevronsRight"],
    [false, "header", "chevronsDown"],
    [true, "otherKind", "chevronRight"],
    [false, "otherKind", "chevronDown"],
  ])("displays the correct chevron based on context and kind", async (isCollapsed, kind, expectedIcon) => {
    const rowState = new TableState();
    rowState.setRows([{ id: "r:1", kind: "header", data: {} }]);
    if (isCollapsed) {
      rowState.toggleCollapsed("r:1");
    }
    const r = await render(
      <TableStateContext.Provider value={{ tableState: rowState }}>
        <CollapseToggle row={{ id: "r:1", kind, data: {}, children: [{} as any] }} />
      </TableStateContext.Provider>,
    );
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual(expectedIcon);
  });

  it("only renders for non-header rows when there are children", async () => {
    const rowState = new TableState();
    rowState.setRows([{ id: "r:1", kind: "otherKind", data: {} }]);
    const r = await render(
      <TableStateContext.Provider value={{ tableState: rowState }}>
        <CollapseToggle row={{ id: "r:1", kind: "otherKind", data: {}, children: [] }} />
      </TableStateContext.Provider>,
    );

    expect(r.firstElement).toMatchInlineSnapshot(`
      <div
        data-overlay-container="true"
      />
    `);
    expect(r.firstElement.firstElementChild).toBeNull();
  });
});
