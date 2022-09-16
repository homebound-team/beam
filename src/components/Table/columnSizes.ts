import { useResizeObserver } from "@react-aria/utils";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { calcColumnSizes, GridColumn, GridStyle } from "src/components/Table/GridTable";
import { useDebouncedCallback } from "use-debounce";

/**
 * Calculates an array of sizes for each of our columns.
 *
 * We originally supported CSS grid-template-column definitions which allowed fancier,
 * dynamic/content-based widths, but have eventually dropped it mainly due to:
 *
 * 1. In virtual tables, a) the table never has all of the rows in DOM at a single time,
 * so any "content-based" widths will change as you scroll the table, which is weird, and
 * b) a sticky header and rows are put in different DOM parent elements by react-virtuoso,
 * so wouldn't arrive at the same "content-based" widths.
 *
 * 2. Using CSS grid but still have a row-level div for hover/focus targeting required
 * a "fake" `display: contents` div that couldn't have actually any styles applied to it.
 *
 * So we've just got with essentially fixed/deterministic widths, i.e. `px` or `percent` or
 * `fr`.
 *
 * Disclaimer that we roll our own `fr` b/c we're not in CSS grid anymore.
 */
export function useSetupColumnSizes(
  style: GridStyle,
  columns: GridColumn<any>[],
  resizeRef: MutableRefObject<HTMLElement | null>,
): string[] {
  // Calculate the column sizes immediately rather than via the `debounce` method.
  // We do this for Storybook integrations that may use MockDate. MockDate changes the behavior of `new Date()`,
  // which is used internally by `useDebounce`, so the frozen clock means the callback is never called.
  const calculateImmediately = useRef<boolean>(true);
  const [tableWidth, setTableWidth] = useState<number | undefined>();

  // Calc our initial/first render sizes where we won't have a width yet
  const [columnSizes, setColumnSizes] = useState<string[]>(calcColumnSizes(columns, tableWidth, style.minWidthPx));

  const setTableAndColumnWidths = useCallback(
    (width: number) => {
      setTableWidth(width);
      setColumnSizes(calcColumnSizes(columns, width, style.minWidthPx));
    },
    [setTableWidth, setColumnSizes, columns, style],
  );

  // Used to recalculate our columns sizes when columns change
  useEffect(() => {
    if (!calculateImmediately.current) {
      const width = resizeRef.current?.clientWidth;
      width && setTableAndColumnWidths(width);
    }
  }, [columns, setTableAndColumnWidths]);

  const setTableAndColumnWidthsDebounced = useDebouncedCallback(setTableAndColumnWidths, 100);

  const onResize = useCallback(() => {
    const target = resizeRef.current;
    if (target && target.clientWidth !== tableWidth) {
      if (calculateImmediately.current) {
        calculateImmediately.current = false;
        setTableAndColumnWidths(target.clientWidth);
      } else {
        setTableAndColumnWidthsDebounced(target.clientWidth);
      }
    }
  }, [tableWidth, setTableAndColumnWidths, setTableAndColumnWidthsDebounced]);

  useResizeObserver({ ref: resizeRef, onResize });

  return columnSizes;
}
