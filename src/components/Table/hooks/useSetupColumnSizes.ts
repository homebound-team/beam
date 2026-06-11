import { useResizeObserver } from "@react-aria/utils";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { GridStyle } from "src/components/Table/TableStyles";
import { ResizedWidths, useColumnResizing } from "src/components/Table/hooks/useColumnResizing";
import { GridColumnWithId, Kinded } from "src/components/Table/types";
import { calcColumnLayout } from "src/components/Table/utils/columns";
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
export function useSetupColumnSizes<R extends Kinded>(
  style: GridStyle,
  columns: GridColumnWithId<R>[],
  resizeRef: MutableRefObject<HTMLElement | null>,
  expandedColumnIds: string[],
  visibleColumnsStorageKey: string | undefined,
  disableColumnResizing: boolean,
  inDocumentScrollLayout: boolean,
): {
  columnSizes: string[];
  /** Container width from the resize probe (unchanged when content expands). */
  tableWidth: number | undefined;
  /** Row width required by column defs; only expands beyond probe in document-scroll layouts. */
  contentWidth: number | undefined;
  resizedWidths: ResizedWidths;
  setResizedWidth: (columnId: string, width: number) => void;
  setResizedWidths: (widths: ResizedWidths | ((prev: ResizedWidths) => ResizedWidths)) => void;
  resetColumnWidths: () => void;
} {
  // Call useColumnResizing to manage column width state and persistence
  const { resizedWidths, setResizedWidth, setResizedWidths, resetColumnWidths } = useColumnResizing(
    disableColumnResizing ? undefined : visibleColumnsStorageKey,
  );

  // Calculate the column sizes immediately rather than via the `debounce` method.
  // We do this for Storybook integrations that may use MockDate. MockDate changes the behavior of `new Date()`,
  // which is used internally by `useDebounce`, so the frozen clock means the callback is never called.
  const calculateImmediately = useRef<boolean>(true);
  const [tableWidth, setTableWidth] = useState<number | undefined>();
  const [contentWidth, setContentWidth] = useState<number | undefined>();
  const [columnSizes, setColumnSizes] = useState<string[]>(
    () =>
      calcColumnLayout(columns, undefined, style.minWidthPx, expandedColumnIds, resizedWidths, inDocumentScrollLayout)
        .columnSizes,
  );
  // Track previous table width to detect container resize
  const prevTableWidthRef = useRef<number | undefined>(tableWidth);

  const applyColumnLayout = useCallback(
    (probeWidth: number) => {
      const layout = calcColumnLayout(
        columns,
        probeWidth,
        style.minWidthPx,
        expandedColumnIds,
        resizedWidths,
        inDocumentScrollLayout,
      );
      setTableWidth(probeWidth);
      setContentWidth(layout.contentWidth);
      setColumnSizes(layout.columnSizes);
    },
    [columns, style.minWidthPx, expandedColumnIds, resizedWidths, inDocumentScrollLayout],
  );

  // Scale resized column widths when container width changes
  useEffect(() => {
    if (!prevTableWidthRef.current) {
      prevTableWidthRef.current = tableWidth;
      return;
    }

    if (!tableWidth) return;

    const prevWidth = prevTableWidthRef.current;
    const widthChanged = Math.abs(tableWidth - prevWidth) > 1; // Allow 1px tolerance for subpixel rounding

    if (widthChanged) {
      const scale = tableWidth / prevWidth;

      setResizedWidths((currentResizedWidths: ResizedWidths): ResizedWidths => {
        if (!currentResizedWidths || Object.keys(currentResizedWidths).length === 0) {
          return currentResizedWidths;
        }

        const scaledWidths: ResizedWidths = {};
        Object.entries(currentResizedWidths).forEach(([id, width]) => {
          scaledWidths[id] = Math.round(width * scale);
        });

        return scaledWidths;
      });

      prevTableWidthRef.current = tableWidth;
    }
  }, [tableWidth, setResizedWidths]);

  // Used to recalculate our columns sizes when columns or resized widths change
  useEffect(
    () => {
      if (!calculateImmediately.current) {
        const width = resizeRef.current?.clientWidth;
        width && applyColumnLayout(width);
      }
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, resizedWidths, applyColumnLayout],
  );

  const applyColumnLayoutDebounced = useDebouncedCallback(applyColumnLayout, 100);

  const onResize = useCallback(
    () => {
      const target = resizeRef.current;
      if (target && target.clientWidth !== tableWidth) {
        if (calculateImmediately.current) {
          calculateImmediately.current = false;
          applyColumnLayout(target.clientWidth);
        } else {
          applyColumnLayoutDebounced(target.clientWidth);
        }
      }
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tableWidth, applyColumnLayout, applyColumnLayoutDebounced],
  );

  useResizeObserver({ ref: resizeRef, onResize });

  return {
    columnSizes,
    tableWidth,
    contentWidth,
    resizedWidths,
    setResizedWidth,
    setResizedWidths,
    resetColumnWidths,
  };
}
