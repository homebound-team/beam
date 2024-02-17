import { CollapseToggle } from "src/components/Table/components/CollapseToggle";
import { GridTableApiImpl } from "src/components/Table/GridTableApi";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { render } from "src/utils/rtl";

describe("CollapseToggle", () => {
  it("defaults to uncollapsed", async () => {
    const state = new GridTableApiImpl().tableState;
    state.setRows([{ id: "r:1", kind: "data", data: {} }]);
    const r = await render(
      <TableStateContext.Provider value={{ tableState: state }}>
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
    const state = new GridTableApiImpl().tableState;
    state.setRows([{ id: "r:1", kind: "data", data: {} }]);
    if (isCollapsed) {
      state.toggleCollapsed("r:1");
    }
    const r = await render(
      <TableStateContext.Provider value={{ tableState: state }}>
        <CollapseToggle row={{ id: "r:1", kind, data: {}, children: [{} as any] }} />
      </TableStateContext.Provider>,
    );
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual(expectedIcon);
  });

  it("only renders for non-header rows when there are children", async () => {
    const state = new GridTableApiImpl().tableState;
    state.setRows([{ id: "r:1", kind: "otherKind", data: {} }]);
    const r = await render(
      <TableStateContext.Provider value={{ tableState: state }}>
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
