import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoadingSkeleton, LoadingSkeletonProps } from "src/components/LoadingSkeleton";
import type { GridDataRow } from "src/components/Table/components/Row";
import { GridTable, GridTableProps } from "src/components/Table/GridTable";
import { GridTableXss, Kinded } from "src/components/Table/types";
import { Only } from "src/Css";

export type QueryResult<QData> = {
  loading: boolean;
  error?: { message: string };
  data?: QData;
  /**
   * Optional. When provided alongside `infiniteScroll`, QueryTable will call this as the user
   * scrolls to the bottom to load the next page. Requires `as="virtual"` on the table.
   */
  fetchMore?: (variables: { offset: number; limit: number }) => Promise<{ data?: QData }>;
};

export type QueryInfiniteScroll = {
  /** Number of items to load per page. Default: 50 */
  pageSize?: number;
  /** Pixels from the bottom to eagerly trigger `fetchMore`. Default: 500px */
  endOffsetPx?: number;
};

export type QueryTableProps<R extends Kinded, QData, X> = Omit<
  GridTableProps<R, X>,
  "rows" | "fallback" | "infiniteScroll"
> & {
  query: QueryResult<QData>;
  emptyFallback?: string;
  /** Creates the rows given the data; needs to accept undefined so we can create the header row. */
  createRows: (data: QData | undefined) => GridDataRow<R>[];
  keepHeaderWhenLoading?: boolean;
  /**
   * Enables infinite scroll. Requires `as="virtual"` and `query.fetchMore` to be provided.
   * As the user scrolls to the bottom, the next page is fetched and rows are appended.
   * Rows reset automatically when the query re-fires (e.g. filter change).
   */
  infiniteScroll?: QueryInfiniteScroll;
};

/**
 * An adaption of GridTable that binds directly to an Apollo QueryResult.
 *
 * This handles the data/loading/error states internally within the table, i.e. we'll show a fallbackMessage
 * for loading/error states, instead of the entire table blinking in/out.
 */
export function QueryTable<R extends Kinded, QData, X extends Only<GridTableXss, X> = any>(
  props: QueryTableProps<R, QData, X>,
) {
  const { emptyFallback, query, createRows, columns, keepHeaderWhenLoading, infiniteScroll, ...others } = props;

  // Always call createRows to get the header, even if we're loading/error'd. We do force data=undefined
  // if loading/error though b/c while making/loading a 2nd query, Apollo will keep the 1st query's data.
  const data = query.loading || query.error ? undefined : query.data;

  // Infinite scroll: accumulate rows across pages in state.
  const [accumulatedRows, setAccumulatedRows] = useState<GridDataRow<R>[] | null>(null);
  const fetchingMoreRef = useRef(false);

  useEffect(() => {
    // When data changes and we're NOT mid-fetchMore, it's a fresh query result (initial load or
    // filter reset) — replace accumulated rows entirely.
    if (!fetchingMoreRef.current) {
      setAccumulatedRows(createRows(data));
    }
  }, [data, createRows]);

  const handleEndReached = useCallback(
    async (_: number) => {
      if (!query.fetchMore || !infiniteScroll || !accumulatedRows) return;
      const offset = accumulatedRows.filter((r) => r.kind !== "header").length;
      const pageSize = infiniteScroll.pageSize ?? 50;
      fetchingMoreRef.current = true;
      try {
        const result = await query.fetchMore({ offset, limit: pageSize });
        if (result.data) {
          const newRows = createRows(result.data).filter((r) => r.kind !== "header");
          setAccumulatedRows((prev) => [...(prev ?? []), ...newRows]);
        }
      } finally {
        fetchingMoreRef.current = false;
      }
    },
    [query, infiniteScroll, accumulatedRows, createRows],
  );

  // loading/error/empty can all use the one fallback prop.
  const fallbackMessage = query.loading ? "Loading…" : query.error ? `Error: ${query.error.message}` : emptyFallback;

  const rows = useMemo(() => createRows(data), [createRows, data]);
  const headers = rows.filter((row) => row.kind === "header");

  const infiniteScrollProps =
    infiniteScroll && query.fetchMore
      ? { onEndReached: handleEndReached, endOffsetPx: infiniteScroll.endOffsetPx }
      : undefined;

  // When infinite scroll is active, use accumulated rows (which include all pages).
  const tableRows = infiniteScroll && accumulatedRows !== null ? accumulatedRows : rows;

  return query.loading ? (
    <div>
      {keepHeaderWhenLoading ? (
        <GridTable {...{ columns, ...others }} rows={headers} fallbackMessage={fallbackMessage} />
      ) : (
        <LoadingTable columns={columns.length} />
      )}
    </div>
  ) : (
    <GridTable {...{ columns, fallbackMessage, ...others }} rows={tableRows} infiniteScroll={infiniteScrollProps} />
  );
}

export type LoadingTableProps = Pick<LoadingSkeletonProps, "columns">;

function LoadingTable(props: LoadingTableProps) {
  const { columns } = props;
  return (
    <>
      {/* Header row */}
      <LoadingSkeleton rows={1} columns={1} />
      {/* Line Item rows - default to 5 rows/columns */}
      <LoadingSkeleton rows={5} columns={columns ?? 5} />
    </>
  );
}
