import { gridItemDataAttribute } from "src/components/Grid/utils";

export function useResponsiveGridItem({ colSpan = 1 }: { colSpan?: number }) {
  return { gridItemProps: { [gridItemDataAttribute]: colSpan } };
}
