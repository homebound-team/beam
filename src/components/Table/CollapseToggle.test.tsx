import { CollapseToggle } from "src/components/Table/CollapseToggle";
import { GridCollapseContext } from "src/components/Table/GridCollapseContext";
import { noop } from "src/utils";
import { render } from "src/utils/rtl";

describe("CollapseToggle", () => {
  it("defaults to uncollapsed", async () => {
    const r = await render(<CollapseToggle row={{ id: "r:1", kind: "header" }} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("chevronsDown");
  });

  it.each([
    [true, "header", "chevronsRight"],
    [false, "header", "chevronsDown"],
    [true, "otherKind", "chevronRight"],
    [false, "otherKind", "chevronDown"],
  ])("displays the correct chevron based on context and kind", async (isCollapsed, kind, expectedIcon) => {
    const r = await render(
      <GridCollapseContext.Provider
        value={{ headerCollapsed: false, isCollapsed: () => isCollapsed, toggleCollapsed: noop }}
      >
        <CollapseToggle row={{ id: "r:1", kind, children: [{}] }} />
      </GridCollapseContext.Provider>,
    );
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual(expectedIcon);
  });

  it("only renders for non-header rows when there are children", async () => {
    const r = await render(<CollapseToggle row={{ id: "r:1", kind: "otherKind", children: [] }} />);

    expect(r.firstElement).toMatchInlineSnapshot(`
      <div
        data-overlay-container="true"
      />
    `);
    expect(r.firstElement.firstElementChild).toBeNull();
  });
});
