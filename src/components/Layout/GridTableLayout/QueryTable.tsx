import { useMemo } from "react";
import { LoadingSkeleton, type LoadingSkeletonProps } from "src/components/LoadingSkeleton";
import type { GridDataRow } from "src/components/Table/components/Row";
import { GridTable, type GridTableProps } from "src/components/Table/GridTable";
import type { GridTableEmptyStateProps } from "src/components/Table/GridTableEmptyState";
import type { GridTableXss, Kinded } from "src/components/Table/types";
import type { Only } from "src/Css";

export type QueryResult<QData> = {
  loading: boolean;
  error?: { message: string };
  data?: QData;
  /** Apollo's last successful result; kept on screen while a refetch is in flight. */
  previousData?: QData;
};

export type QueryTableProps<R extends Kinded, QData, X> = Omit<GridTableProps<R, X>, "rows" | "fallback"> & {
  query: QueryResult<QData>;
  emptyFallback?: string;
  /** Creates the rows given the data; needs to accept undefined so we can create the header row. */
  createRows: (data: QData | undefined) => GridDataRow<R>[];
};

/**
 * An adaption of GridTable that binds directly to an Apollo QueryResult.
 *
 * This handles the data/loading/error states internally within the table, i.e. we'll show a skeleton
 * for the initial load, and dim the existing rows for refetches, instead of the table blinking in/out.
 */
export function QueryTable<R extends Kinded, QData, X extends Only<GridTableXss, X> = any>(
  props: QueryTableProps<R, QData, X>,
) {
  const { emptyFallback, query, createRows, columns, emptyState: emptyStateProp, ...others } = props;

  // While a 2nd query is in flight, Apollo either keeps the 1st query's `data` or moves it to
  // `previousData`; either way we keep showing it so the page doesn't collapse to a skeleton.
  const displayData = query.error ? undefined : (query.data ?? query.previousData);
  const rows = useMemo(() => createRows(displayData), [createRows, displayData]);

  const fallbackMessage = query.loading ? "Loading…" : query.error ? `Error: ${query.error.message}` : undefined;

  const emptyState: GridTableEmptyStateProps | undefined = useMemo(() => {
    if (query.loading || query.error) return undefined;
    if (emptyStateProp) return emptyStateProp;
    return { title: emptyFallback };
  }, [emptyFallback, emptyStateProp, query.error, query.loading]);

  // Nothing to show yet, i.e. the initial load.
  if (query.loading && displayData === undefined) {
    return (
      <div>
        <LoadingTable columns={columns.length} />
      </div>
    );
  }

  return <GridTable {...{ rows, columns, fallbackMessage, emptyState, ...others }} loading={query.loading} />;
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
