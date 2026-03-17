import { renderHook } from "@testing-library/react";
import { createElement, PropsWithChildren } from "react";
import { useResponsiveGridItem } from "src/components/Grid/useResponsiveGridItem";
import { ResponsiveGridContext } from "src/components/Grid/utils";

describe(useResponsiveGridItem, () => {
  it("returns the correct props without context", () => {
    const result = renderHook(() => useResponsiveGridItem({ colSpan: 2 })).result.current;
    expect(result).toMatchInlineSnapshot(`
      {
        "gridItemProps": {
          "data-grid-item-span": 2,
        },
        "gridItemStyles": {},
      }
    `);
  });

  it("returns container query styles with context", () => {
    const config = { minColumnWidth: 100, gap: 10, columns: 4 };
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(ResponsiveGridContext.Provider, { value: config }, children);
    const result = renderHook(() => useResponsiveGridItem({ colSpan: 3 }), { wrapper }).result.current;
    expect(result).toMatchInlineSnapshot(`
      {
        "gridItemProps": {
          "data-grid-item-span": 3,
        },
        "gridItemStyles": {
          "@container  (max-width: 210px) and (min-width: 1px)": {
            "gridColumn": "span 1",
          },
          "@container  (max-width: 320px) and (min-width: 211px)": {
            "gridColumn": "span 2",
          },
          "@container  (min-width: 321px)": {
            "gridColumn": "span 3",
          },
        },
      }
    `);
  });

  it("returns container query styles with explicit config (no context needed)", () => {
    const result = renderHook(() =>
      useResponsiveGridItem({ colSpan: 3, gridConfig: { minColumnWidth: 100, gap: 10, columns: 4 } }),
    ).result.current;
    expect(result).toMatchInlineSnapshot(`
      {
        "gridItemProps": {
          "data-grid-item-span": 3,
        },
        "gridItemStyles": {
          "@container  (max-width: 210px) and (min-width: 1px)": {
            "gridColumn": "span 1",
          },
          "@container  (max-width: 320px) and (min-width: 211px)": {
            "gridColumn": "span 2",
          },
          "@container  (min-width: 321px)": {
            "gridColumn": "span 3",
          },
        },
      }
    `);
  });
});
