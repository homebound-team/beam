import { renderHook } from "@testing-library/react";
import { useResponsiveGrid } from "src/components/Grid/useResponsiveGrid";

describe(useResponsiveGrid, () => {
  it("defines the responsive grid styles", async () => {
    const result = renderHook(() => useResponsiveGrid({ minColumnWidth: 100, gap: 10, columns: 4 })).result.current;
    expect(result).toMatchInlineSnapshot(`
      {
        "gridStyles": {
          "& > [data-grid-item-span='2'], & > [data-grid-item-span='3'], & > [data-grid-item-span='4']": {
            "@container  (max-width: 210px) and (min-width: 1px)": {
              "gridColumn": "span 1",
            },
          },
          "& > [data-grid-item-span='3'], & > [data-grid-item-span='4']": {
            "@container  (max-width: 320px) and (min-width: 211px)": {
              "gridColumn": "span 2",
            },
          },
          "& > [data-grid-item-span='4']": {
            "@container  (max-width: 430px) and (min-width: 321px)": {
              "gridColumn": "span 3",
            },
          },
          "&& > [data-grid-item-span='2']": {
            "@container  (min-width: 211px)": {
              "gridColumn": "span 2",
            },
          },
          "&& > [data-grid-item-span='3']": {
            "@container  (min-width: 321px)": {
              "gridColumn": "span 3",
            },
          },
          "&& > [data-grid-item-span='4']": {
            "@container  (min-width: 431px)": {
              "gridColumn": "span 4",
            },
          },
          "containerType": "inline-size",
          "display": "grid",
          "gap": "10px",
          "gridTemplateColumns": "repeat(auto-fill, minmax(max(100px, calc((100% - 30px) / 4)), 1fr))",
        },
      }
    `);
  });
});
