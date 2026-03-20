import { renderHook } from "@testing-library/react";
import { createElement, PropsWithChildren } from "react";
import { useResponsiveGridItem } from "src/components/Grid/useResponsiveGridItem";
import { ResponsiveGridContext } from "src/components/Grid/utils";

describe(useResponsiveGridItem, () => {
  it("returns the correct props without context", () => {
    const result = renderHook(() => useResponsiveGridItem({ colSpan: 2 })).result.current;
    expect(result.gridItemProps).toEqual({ "data-grid-item-span": 2 });
    expect(result.gridItemStyles).toEqual({});
  });

  it("returns container query styles with context", () => {
    const config = { minColumnWidth: 100, gap: 10, columns: 4 };
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(ResponsiveGridContext.Provider, { value: config }, children);
    const result = renderHook(() => useResponsiveGridItem({ colSpan: 3 }), { wrapper }).result.current;
    expect(result.gridItemStyles).toEqual({});
    expect(result.gridItemProps).toEqual({
      "data-grid-item-span": 3,
      className: "responsive-grid-item-100-10-4-3",
    });

    const styleEl = document.head.querySelector('[data-responsive-grid-item-styles="true"]');
    expect(
      styleEl?.textContent?.includes(
        "@container (min-width: 1px) and (max-width: 210px) { .responsive-grid-item-100-10-4-3 { grid-column: span 1; } }\n" +
          "@container (min-width: 211px) and (max-width: 320px) { .responsive-grid-item-100-10-4-3 { grid-column: span 2; } }\n" +
          "@container (min-width: 321px) { .responsive-grid-item-100-10-4-3 { grid-column: span 3; } }",
      ),
    ).toBe(true);
  });

  it("returns container query styles with explicit config (no context needed)", () => {
    const result = renderHook(() =>
      useResponsiveGridItem({ colSpan: 3, gridConfig: { minColumnWidth: 100, gap: 10, columns: 4 } }),
    ).result.current;
    expect(result.gridItemStyles).toEqual({});
    expect(result.gridItemProps).toEqual({
      "data-grid-item-span": 3,
      className: "responsive-grid-item-100-10-4-3",
    });

    const styleEl = document.head.querySelector('[data-responsive-grid-item-styles="true"]');
    expect(
      styleEl?.textContent?.includes(
        "@container (min-width: 1px) and (max-width: 210px) { .responsive-grid-item-100-10-4-3 { grid-column: span 1; } }\n" +
          "@container (min-width: 211px) and (max-width: 320px) { .responsive-grid-item-100-10-4-3 { grid-column: span 2; } }\n" +
          "@container (min-width: 321px) { .responsive-grid-item-100-10-4-3 { grid-column: span 3; } }",
      ),
    ).toBe(true);
  });
});
