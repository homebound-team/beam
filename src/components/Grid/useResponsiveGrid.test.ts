import { renderHook } from "@testing-library/react";
import { useResponsiveGrid } from "src/components/Grid/useResponsiveGrid";

describe(useResponsiveGrid, () => {
  it("defines the responsive grid styles", () => {
    const result = renderHook(function () {
      return useResponsiveGrid({ minColumnWidth: 100, gap: 10, columns: 4 });
    }).result.current;

    const display = result.gridStyles.display as unknown as unknown[];
    const classNameEntry = Object.entries(result.gridStyles).find(function (entry) {
      return entry[0].startsWith("className_");
    });

    expect(display).toMatchObject(["dg", { src: expect.any(String) }]);
    expect(result.gridStyles.containerType).toEqual("ctis");
    expect(result.gridStyles.gap).toEqual(["gap_var", { "--gap": "10px" }]);
    expect(result.gridStyles.gridTemplateColumns).toEqual([
      "gtc_var",
      { "--gridTemplateColumns": "repeat(auto-fill, minmax(max(100px, calc((100% - 30px) / 4)), 1fr))" },
    ]);
    expect(classNameEntry?.[1]).toEqual("responsive-grid-100-10-4");
  });

  it("injects runtime container-query rules for item spans", () => {
    const hook = renderHook(function () {
      return useResponsiveGrid({ minColumnWidth: 100, gap: 10, columns: 4 });
    });

    const styleEl = document.head.querySelector("[data-truss-runtime-style]");
    expect(styleEl?.textContent).toEqual(`@container (min-width: 1px) and (max-width: 210px) {
  .responsive-grid-100-10-4 [data-grid-item-span="2"] { grid-column: span 1; }
  .responsive-grid-100-10-4 [data-grid-item-span="3"] { grid-column: span 1; }
  .responsive-grid-100-10-4 [data-grid-item-span="4"] { grid-column: span 1; }
}

@container (min-width: 211px) {
  .responsive-grid-100-10-4 [data-grid-item-span="2"] { grid-column: span 2; }
}

@container (min-width: 211px) and (max-width: 320px) {
  .responsive-grid-100-10-4 [data-grid-item-span="3"] { grid-column: span 2; }
  .responsive-grid-100-10-4 [data-grid-item-span="4"] { grid-column: span 2; }
}

@container (min-width: 321px) {
  .responsive-grid-100-10-4 [data-grid-item-span="3"] { grid-column: span 3; }
}

@container (min-width: 321px) and (max-width: 430px) {
  .responsive-grid-100-10-4 [data-grid-item-span="4"] { grid-column: span 3; }
}

@container (min-width: 431px) {
  .responsive-grid-100-10-4 [data-grid-item-span="4"] { grid-column: span 4; }
}`);

    hook.unmount();

    expect(document.head.querySelector("[data-truss-runtime-style]")).toEqual(null);
  });
});
