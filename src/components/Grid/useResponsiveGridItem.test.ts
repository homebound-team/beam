import { renderHook } from "@testing-library/react";
import { createElement, type PropsWithChildren } from "react";
import { useResponsiveGridItem } from "src/components/Grid/useResponsiveGridItem";
import { ResponsiveGridContext } from "src/components/Grid/utils";

describe(useResponsiveGridItem, () => {
  it("returns the correct props without context", () => {
    const result = renderHook(function () {
      return useResponsiveGridItem({ colSpan: 2 });
    }).result.current;

    expect(result.gridItemProps).toEqual({ "data-grid-item-span": 2 });
    expect(result.gridItemStyles).toEqual({});
  });

  it("returns the requested span marker with context", () => {
    const config = { minColumnWidth: 100, gap: 10, columns: 4 };

    function wrapper(props: PropsWithChildren) {
      return createElement(ResponsiveGridContext.Provider, { value: config }, props.children);
    }

    const result = renderHook(
      function () {
        return useResponsiveGridItem({ colSpan: 3 });
      },
      { wrapper },
    ).result.current;

    expect(result.gridItemProps).toEqual({ "data-grid-item-span": 3 });
    expect(result.gridItemStyles).toEqual({});
    expect(document.head.querySelector("[data-truss-runtime-style]")).toEqual(null);
  });

  it("accepts explicit config for backwards compatibility", () => {
    const result = renderHook(function () {
      return useResponsiveGridItem({ colSpan: 3, gridConfig: { minColumnWidth: 100, gap: 10, columns: 4 } });
    }).result.current;

    expect(result.gridItemProps).toEqual({ "data-grid-item-span": 3 });
    expect(result.gridItemStyles).toEqual({});
    expect(document.head.querySelector("[data-truss-runtime-style]")).toEqual(null);
  });
});
