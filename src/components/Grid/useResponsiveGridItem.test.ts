import { useResponsiveGridItem } from "src/components/Grid/useResponsiveGridItem";

describe(useResponsiveGridItem, () => {
  it("returns the correct props", async () => {
    const result = useResponsiveGridItem({ colSpan: 2 });
    expect(result).toMatchInlineSnapshot(`
      {
        "gridItemProps": {
          "data-grid-item-span": 2,
        },
      }
    `);
  });
});
