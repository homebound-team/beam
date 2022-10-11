import { getTableStyles } from "src/components/Table/TableStyles";

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
});
