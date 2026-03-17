import { useContext, useMemo } from "react";
import { Css, Properties } from "src";
import { gridItemDataAttribute, ResponsiveGridContext } from "src/components/Grid/utils";

export function useResponsiveGridItem({ colSpan = 1 }: { colSpan?: number }): {
  gridItemProps: Record<string, number>;
  gridItemStyles: Properties;
} {
  const config = useContext(ResponsiveGridContext);

  const gridItemStyles = useMemo(() => {
    if (!config || colSpan <= 1) return {};
    const { minColumnWidth, gap } = config;

    // Build container query styles for each possible span from 1 to colSpan
    let styles: Properties = {};
    for (let span = 1; span < colSpan; span++) {
      const minWidth = span === 1 ? 0 : minColumnWidth * span + gap * (span - 1);
      const maxWidth = minColumnWidth * (span + 1) + gap * span;
      styles = { ...styles, ...Css.ifContainer({ gt: minWidth, lt: maxWidth }).gc(`span ${span}`).$ };
    }

    // Default style: full colSpan when container is wide enough
    const fullSpanMinWidth = minColumnWidth * colSpan + gap * (colSpan - 1);
    styles = { ...styles, ...Css.ifContainer({ gt: fullSpanMinWidth }).gc(`span ${colSpan}`).$ };

    return styles;
  }, [config, colSpan]);

  return {
    gridItemProps: { [gridItemDataAttribute]: colSpan },
    gridItemStyles,
  };
}
