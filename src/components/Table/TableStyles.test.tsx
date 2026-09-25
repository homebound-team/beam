import { Css } from "src/Css";
import {
  defaultStyle,
  getTableStyles,
  isGridStyleDef,
  resolveStyles,
  type GridStyle,
} from "src/components/Table/TableStyles";

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

  it("defaults body cell vertical alignment to top for flexible rows", () => {
    // Given the default (flexible) table styles
    const { cellCss } = getTableStyles();
    // Then body cells are top-aligned
    expect(cellCss?.alignItems?.[1]).toEqual({ "--alignItems": "flex-start" });
  });

  it("defaults body cell vertical alignment to center for fixed rows", () => {
    // Given fixed-height table styles
    const { cellCss } = getTableStyles({ rowHeight: "fixed" });
    // Then body cells stay vertically centered
    expect(cellCss?.alignItems?.[1]).toEqual({ "--alignItems": "center" });
  });

  it("lets vAlign override the row-height default", () => {
    // Given explicit vertical alignment on either row height
    // Then the explicit value wins
    expect(getTableStyles({ vAlign: "center" }).cellCss?.alignItems?.[1]).toEqual({ "--alignItems": "center" });
    expect(getTableStyles({ vAlign: "bottom" }).cellCss?.alignItems?.[1]).toEqual({ "--alignItems": "flex-end" });
    expect(getTableStyles({ rowHeight: "fixed", vAlign: "top" }).cellCss?.alignItems?.[1]).toEqual({
      "--alignItems": "flex-start",
    });
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

  it("borders and rounds the default style when the inset is handled", () => {
    // Given the untouched default style inside an inset shell (e.g. CenteredLayout)
    // When resolving styles
    const resolved = resolveStyles(defaultStyle, true);
    // Then the table is all-white, bordered, with a rounded header
    expect(resolved).toBe(getTableStyles({ allWhite: true, bordered: true, roundedHeader: true }));
  });

  it("merges the inset defaults under a GridStyleDef", () => {
    // Given a def that opts out of the border inside an inset shell
    // When resolving styles
    const resolved = resolveStyles({ bordered: false }, true);
    // Then the def wins over the layout default
    expect(resolved).toBe(getTableStyles({ allWhite: true, bordered: false, roundedHeader: true }));
  });

  it("uses an all-white square header for a full-bleed document-scroll table", () => {
    // Given the default style on a document-scroll page that is not inset
    // When resolving styles
    const resolved = resolveStyles(defaultStyle, false, true);
    // Then the header matches the page surface and sits flush to the edge
    expect(resolved).toBe(getTableStyles({ allWhite: true, roundedHeader: false }));
  });

  it("prefers the inset defaults over the document-scroll square header", () => {
    // Given an inset shell on a document-scroll page
    // When resolving styles
    const resolved = resolveStyles(defaultStyle, true, true);
    // Then CenteredLayout's bordered, rounded table wins
    expect(resolved).toBe(getTableStyles({ allWhite: true, bordered: true, roundedHeader: true }));
  });

  it("leaves the default style alone outside any page layout", () => {
    // Given the default style with no layout context
    // When resolving styles
    const resolved = resolveStyles(defaultStyle);
    // Then the widget-table look is untouched
    expect(resolved).toBe(defaultStyle);
  });

  it("leaves a custom full GridStyle alone when the inset is handled", () => {
    // Given an app-provided full GridStyle inside an inset shell
    const style: GridStyle = { cellCss: Css.p2.$ };
    // When resolving styles
    const resolved = resolveStyles(style, true);
    // Then it is opaque to the layout defaults
    expect(resolved).toBe(style);
  });
});
