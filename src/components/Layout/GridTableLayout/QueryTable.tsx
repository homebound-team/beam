import { useMemo } from "react";
import { LoadingSkeleton, LoadingSkeletonProps } from "src/components/LoadingSkeleton";
import { GridDataRow } from "src/components/Table/components/Row";
import { GridTable, GridTableProps } from "src/components/Table/GridTable";
import { GridTableXss, Kinded } from "src/components/Table/types";
import { Only } from "src/Css";

export type QueryResult<QData> = {
  loading: boolean;
  error?: { message: string };
  data?: QData;
};

export type QueryTableProps<R extends Kinded, QData, X> = Omit<GridTableProps<R, X>, "rows" | "fallback"> & {
  query: QueryResult<QData>;
  emptyFallback?: string;
  /** Creates the rows given the data; needs to accept undefined so we can create the header row. */
  createRows: (data: QData | undefined) => GridDataRow<R>[];
  getPageInfo?: (data: QData) => {
    hasNextPage: boolean;
  };
  keepHeaderWhenLoading?: boolean;
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
  const { emptyFallback, query, createRows, getPageInfo, columns, keepHeaderWhenLoading, ...others } = props;

  // Always call createRows to get the header, even if we're loading/error'd. We do force data=undefined
  // if loading/error though b/c while making/loading a 2nd query, Apollo will keep the 1st query's data.
  // This is arguably a better UX if we could show a spinner-new-results-coming-soon + the
  // old-results-are-still-here at the same time.
  const data = query.loading || query.error ? undefined : query.data;
  const rows = useMemo(() => createRows(data), [createRows, data]);

  // Detect our `pageInfo` response pattern
  const hasNextPage = data && getPageInfo && getPageInfo(data).hasNextPage;
  const infoMessage = hasNextPage ? "Too many rows" : undefined;

  // loading/error/empty can all use the one fallback prop.
  const fallbackMessage = query.loading ? "Loading…" : query.error ? `Error: ${query.error.message}` : emptyFallback;

  const headers = rows.filter((row) => row.kind === "header");

  return query.loading ? (
    <div>
      {keepHeaderWhenLoading ? (
        <GridTable {...{ columns, ...others }} rows={headers} fallbackMessage={fallbackMessage} />
      ) : (
        <LoadingTable columns={columns.length} />
      )}
    </div>
  ) : (
    <GridTable {...{ rows, columns, fallbackMessage, infoMessage, ...others }} />
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
