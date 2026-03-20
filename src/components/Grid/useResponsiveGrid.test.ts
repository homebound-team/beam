import { renderHook } from "@testing-library/react";
import { useResponsiveGrid } from "src/components/Grid/useResponsiveGrid";

describe(useResponsiveGrid, () => {
  it("defines the responsive grid styles", () => {
    const result = renderHook(() => useResponsiveGrid({ minColumnWidth: 100, gap: 10, columns: 4 })).result.current;

    expect(result).toMatchInlineSnapshot(`
      {
        "gridStyles": {
          "containerType": "ctis",
          "display": [
            "dg",
            TrussDebugInfo {
              "src": "useResponsiveGrid.ts:77",
            },
          ],
          "gap": [
            "gap_var",
            {
              "--gap": "10px",
            },
          ],
          "gridTemplateColumns": [
            "gtc_var",
            {
              "--gridTemplateColumns": "repeat(auto-fill, minmax(max(100px, calc((100% - 30px) / 4)), 1fr))",
            },
          ],
        },
      }
    `);
  });
});
