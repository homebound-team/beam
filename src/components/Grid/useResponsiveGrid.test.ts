import { renderHook } from "@testing-library/react";
import { useResponsiveGrid } from "src/components/Grid/useResponsiveGrid";

describe(useResponsiveGrid, () => {
  it("defines the responsive grid styles", () => {
    const result = renderHook(() => useResponsiveGrid({ minColumnWidth: 100, gap: 10, columns: 4 })).result.current;

    expect(result).toMatchInlineSnapshot(`
      {
        "gridStyles": [
          TrussDebugInfo {
            "src": "useResponsiveGrid.ts:77",
          },
          {
            "$$css": true,
            "k1xSpc": "xrvj5dj",
          },
          [
            {
              "$$css": true,
              "kumcoG": "xqketvx",
            },
            {
              "--x-gridTemplateColumns": "repeat(auto-fill, minmax(max(100px, calc((100% - 30px) / 4)), 1fr))",
            },
          ],
          {
            "$$css": true,
            "k9g6sI": "x12h1iku",
          },
          [
            {
              "$$css": true,
              "kOIVth": "x1pidvrl",
            },
            {
              "--x-gap": "10px",
            },
          ],
        ],
      }
    `);
  });
});
