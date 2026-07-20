import { Css } from "src/Css";
import { getTableStyles, isGridStyleDef, resolveStyles, type GridStyle } from "src/components/Table/TableStyles";

describe("GridStyleDef", () => {
  it("memoizes grid styles correctly", () => {
    // When getting table styles using the same parameters
    const defaultStyles = getTableStyles();
    const defaultStyles2 = getTableStyles();
    // Then the same object should be returned
    expect(defaultStyles).toBe(defaultStyles2);

    // And when using the other properties of the table styles
    const inlineEditing = getTableStyles({ inlineEditing: true });
    const grouped = getTableStyles({ grouped: true });
    const rowHeightFixed = getTableStyles({ rowHeight: "fixed" });
    const cellHighlight = getTableStyles({ cellHighlight: true });
    // Then they do not equal the defaultStyles as they should have created new objects.
    expect(inlineEditing).not.toBe(defaultStyles);
    expect(grouped).not.toBe(defaultStyles);
    expect(rowHeightFixed).not.toBe(defaultStyles);
    expect(cellHighlight).not.toBe(defaultStyles);

    // And when passing properties in different orders
    const highlightAndGrouped = getTableStyles({ cellHighlight: true, grouped: true });
    const highlightAndGrouped2 = getTableStyles({ grouped: true, cellHighlight: true });
    // Then they are still equal
    expect(highlightAndGrouped).toBe(highlightAndGrouped2);
  });

  it("omits first head-row corner radii when roundedHeader is false", () => {
    const rounded = getTableStyles({ roundedHeader: true });
    const square = getTableStyles({ roundedHeader: false });

    expect(rounded.firstRowFirstCellCss).toBeDefined();
    expect(rounded.firstRowLastCellCss).toBeDefined();
    expect(square.firstRowFirstCellCss).toBeUndefined();
    expect(square.firstRowLastCellCss).toBeUndefined();
  });
});

describe("isGridStyleDef", () => {
  it("treats empty objects and def keys as GridStyleDef", () => {
    // Given an empty style and styles with def keys
    // Then they are identified as GridStyleDef
    expect(isGridStyleDef({})).toBe(true);
    expect(isGridStyleDef({ grouped: true })).toBe(true);
    expect(isGridStyleDef({ allWhite: true, roundedHeader: false })).toBe(true);
  });

  it("treats pure GridStyle objects as not GridStyleDef", () => {
    // Given a style with only GridStyle CSS keys
    const style: GridStyle = { cellCss: Css.bgWhite.$, rowHoverColor: "none" };
    // Then it is not a GridStyleDef
    expect(isGridStyleDef(style)).toBe(false);
  });
});

describe("resolveStyles", () => {
  it("resolves GridStyleDef via getTableStyles", () => {
    // Given a GridStyleDef
    // When resolving styles
    const resolved = resolveStyles({ grouped: true, allWhite: true });
    // Then it matches getTableStyles output
    expect(resolved).toBe(getTableStyles({ grouped: true, allWhite: true }));
  });

  it("returns a full GridStyle unchanged", () => {
    // Given a full GridStyle
    const style: GridStyle = { cellCss: Css.p2.$, rowHoverColor: "none" };
    // When resolving styles
    const resolved = resolveStyles(style);
    // Then the same object is returned
    expect(resolved).toBe(style);
  });
});
