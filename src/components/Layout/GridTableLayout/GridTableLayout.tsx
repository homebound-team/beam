import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "src/components/Button";
import { getActiveFilterCount } from "src/components/Filters/utils";
import type { HeaderAction } from "src/components/Headers/HeaderActions";
import {
  GridTableLayoutActions,
  type SearchBoxApi,
} from "src/components/Layout/GridTableLayout/GridTableLayoutActions";
import { GridTableLayoutHost } from "src/components/Layout/GridTableLayout/GridTableLayoutHost";
import { QueryTable, type QueryTableProps } from "src/components/Layout/GridTableLayout/QueryTable";
import { useGridTableLayoutHost } from "src/components/Layout/GridTableLayout/useGridTableLayoutHost";
import { usePersistedTableView } from "src/components/Layout/GridTableLayout/usePersistedTableView";
import {
  type BaseQueryTableProps,
  type GridTablePropsWithRows,
  isGridTableProps,
} from "src/components/Layout/layoutTypes";
import { resolveWithRightPaneOptions, type WithRightPane } from "src/components/Layout/RightPaneLayout/withRightPane";
import type { TableView } from "src/components/Table/components/ViewToggleButton";
import { GridTable } from "src/components/Table/GridTable";
import { GridTableApiImpl } from "src/components/Table/GridTableApi";
import type { GridTableEmptyStateProps } from "src/components/Table/GridTableEmptyState";
import { type GridStyle, type GridStyleDef, isGridStyleDef } from "src/components/Table/TableStyles";
import type { GridTableXss, Kinded } from "src/components/Table/types";
import type { Only } from "src/Css";
import { useComputed } from "src/hooks/useComputed";
import { useGroupBy } from "src/hooks/useGroupBy";
import { usePersistedFilter, type UsePersistedFilterProps } from "src/hooks/usePersistedFilter";
import { useSessionStorage } from "src/hooks/useSessionStorage";
import { useTestIds } from "src/utils/useTestIds";

// GridTableLayout-specific query props extend the shared base with display extras.
type QueryTablePropsWithQuery<R extends Kinded, X extends Only<GridTableXss, X>, QData> = BaseQueryTableProps<
  R,
  X,
  QData
> & {
  emptyFallback?: string;
};

export type GridTableLayoutProps<
  F extends Record<string, unknown>,
  R extends Kinded,
  X extends Only<GridTableXss, X>,
  QData,
> = {
  tableProps: GridTablePropsWithRows<R, X> | QueryTablePropsWithQuery<R, X, QData>;
  layoutState?: ReturnType<typeof useGridTableLayoutState<F>>;
  /** Title for the empty state when the table has no data rows. */
  emptyFallback?: string;
  /** Inline buttons, icon buttons, and an optional overflow menu (`kind: "menu"`). */
  actions?: HeaderAction[];
  /**
   * Shows "N Rows Selected · Clear" before the columns selector while rows are selected.
   * Clear deselects every row, then calls `onClear`. Rows can stand for more than one with `GridDataRow.selectionCount`.
   */
  selectionSummary?: true | { onClear?: () => void };
  hideEditColumns?: boolean;
  totalCount?: number;
  /** When true, shows a view toggle button and renders the table with `as="card"` when in card view. */
  withCardView?: boolean;
  defaultView?: TableView;
  /**
   * Opt into the document-scroll detail pane (`useRightPane`).
   * Only applies inside a document-scroll layout; hosts the pane around the table body only.
   */
  withRightPane?: WithRightPane;
};

/**
 * A layout component that combines a table with a header, actions buttons, filters, and infinite scroll.
 *
 * This component can render either a `GridTable` or wrapped `QueryTable` based on the provided props:
 *
 * - For static data or custom handled loading states, use `rows` to pass in the data directly:
 * ```tsx
 * <GridTableLayout
 *   tableProps={{
 *     rows: [...],
 *     columns: [...],
 *   }}
 * />
 * ```
 *
 * - To take advantage of data/loading/error states directly from an Apollo query, use `query` and `createRows`:
 * ```tsx
 * <GridTableLayout
 *   tableProps={{
 *     query,
 *     createRows: (data) => [...],
 *     columns: [...],
 *   }}
 * />
 * ```
 */
function GridTableLayoutComponent<
  F extends Record<string, unknown>,
  R extends Kinded,
  X extends Only<GridTableXss, X>,
  QData,
>(props: GridTableLayoutProps<F, R, X, QData>) {
  const {
    tableProps,
    layoutState,
    actions,
    selectionSummary,
    hideEditColumns = false,
    withCardView,
    defaultView = "list",
    emptyFallback: layoutEmptyFallback,
    withRightPane,
  } = props;
  const rightPane = resolveWithRightPaneOptions(withRightPane);

  const tid = useTestIds(props);
  const host = useGridTableLayoutHost();
  const includeColumnGutters = host.kind === "document-scroll" || host.kind === "modal";
  const columns = tableProps.columns;

  const hasHideableColumns = useMemo(() => {
    if (hideEditColumns) return false;
    validateColumns(columns);
    return columns.some((c) => c.canHide);
  }, [columns, hideEditColumns]);

  // Use user-provided API if available, otherwise create our own
  const api = useMemo<GridTableApiImpl<R>>(
    () => (tableProps.api as GridTableApiImpl<R>) ?? new GridTableApiImpl(),
    [tableProps.api],
  );
  const [view, setView] = usePersistedTableView(defaultView, !!withCardView);
  const clientSearch = layoutState?.search === "client" ? layoutState.searchString : undefined;
  const withSelectionSummary = !!selectionSummary;
  const showTableActions = !!(
    layoutState?.filterDefs ||
    layoutState?.search ||
    hasHideableColumns ||
    withCardView ||
    actions?.length ||
    withSelectionSummary
  );
  // Card render is driven by `view` alone so `defaultView="card"` works without `withCardView`
  // (which only controls whether the list/card toggle is shown).
  const isVirtualized = tableProps.as === "virtual" || view === "card";

  // Sync API changes back to persisted state when persistedColumns is provided
  const visibleColumnIds = useComputed(() => api.getVisibleColumnIds(), [api]);
  useEffect(() => {
    if (layoutState?.setVisibleColumnIds) {
      layoutState.setVisibleColumnIds(visibleColumnIds);
    }
  }, [visibleColumnIds, layoutState]);

  const visibleColumnsStorageKey = layoutState?.persistedColumnsStorageKey;

  const selectedRowCount = useComputed(
    () => (withSelectionSummary ? api.tableState.selectedRowCount : 0),
    [api, withSelectionSummary],
  );
  const onClear = typeof selectionSummary === "object" ? selectionSummary.onClear : undefined;
  const clearSelections = useCallback(() => {
    api.clearSelections();
    onClear?.();
  }, [api, onClear]);

  const filterSearchProps = useMemo(
    () => (layoutState?.search ? { onSearch: layoutState.setSearchString } : undefined),
    [layoutState?.search, layoutState?.setSearchString],
  );

  // Imperative handle into GridTableLayoutActions' search box, so `clearFilters` can reset the search
  // input directly even when triggered from outside GridTableLayoutActions (e.g. the empty state below).
  const searchApiRef = useRef<SearchBoxApi | undefined>(undefined);
  const clearFilters = useCallback(() => {
    layoutState?.clearFilters();
    searchApiRef.current?.clear();
  }, [layoutState]);

  const emptyState = useMemo(
    () => composeEmptyState(tableProps, layoutState, layoutEmptyFallback, clearFilters),
    [layoutEmptyFallback, layoutState, tableProps, clearFilters],
  );

  const tableActionsEl = (
    <GridTableLayoutActions
      filterDefs={layoutState?.filterDefs}
      filter={layoutState?.filter}
      setFilter={layoutState?.setFilter}
      groupBy={layoutState?.groupBy}
      searchProps={filterSearchProps}
      hasHideableColumns={hasHideableColumns}
      columns={columns}
      api={api}
      withCardView={withCardView}
      view={view}
      setView={setView}
      clearFilters={clearFilters}
      searchApi={searchApiRef}
      actions={actions}
      selectedRowCount={selectedRowCount}
      onClearSelections={clearSelections}
    />
  );

  const cardAs = view === "card" ? ("card" as const) : undefined;
  // White is the layout default. Remaining default styles may get applied via GridTable
  const tableStyle = useMemo(() => getDefaultStyle(tableProps.style), [tableProps.style]);

  const tableBody = (
    <>
      {isGridTableProps(tableProps) ? (
        <GridTable
          {...tableProps}
          {...(cardAs ? { as: cardAs } : {})}
          api={api}
          emptyState={emptyState}
          filter={clientSearch}
          style={tableStyle}
          stickyHeader
          disableColumnResizing={false}
          visibleColumnsStorageKey={visibleColumnsStorageKey}
          columnGutter={includeColumnGutters}
        />
      ) : (
        <QueryTable
          {...(tableProps as QueryTableProps<R, QData, X>)}
          {...(cardAs ? { as: cardAs } : {})}
          api={api}
          emptyState={emptyState}
          filter={clientSearch}
          style={tableStyle}
          stickyHeader
          disableColumnResizing={false}
          visibleColumnsStorageKey={visibleColumnsStorageKey}
          columnGutter={includeColumnGutters}
        />
      )}
    </>
  );

  return (
    <GridTableLayoutHost
      host={host}
      actions={showTableActions ? tableActionsEl : undefined}
      rightPane={rightPane}
      isVirtualized={isVirtualized}
      testIds={tid}
    >
      {tableBody}
    </GridTableLayoutHost>
  );
}

export const GridTableLayout = React.memo(GridTableLayoutComponent) as typeof GridTableLayoutComponent;

/** Layout tables are white. A full `GridStyle` is left unchanged; a def can still set `allWhite: false`. */
function getDefaultStyle(style: GridStyle | GridStyleDef | undefined): GridStyle | GridStyleDef {
  if (style !== undefined && !isGridStyleDef(style)) return style;
  return { allWhite: true, ...style };
}

// Force columns to have a name and id property for all our table layouts
function validateColumns(columns: readonly { id?: string; name?: string }[]): void {
  for (const col of columns) {
    if (!col.id || !col.name) {
      throw new Error("Columns must have id and name properties when EditColumnsButtons is enabled");
    }
  }
}

/**
 * A wrapper around standard filter, grouping, search, and column state hooks.
 * * `client` search will use the built-in grid table search functionality.
 * * `server` search will return `searchString` as a debounced search string to query the server.
 */
export function useGridTableLayoutState<F extends Record<string, unknown>>({
  persistedFilter,
  persistedColumns,
  search,
  groupBy: maybeGroupBy,
}: {
  persistedFilter?: UsePersistedFilterProps<F>;
  persistedColumns?: { storageKey: string };
  search?: "client" | "server";
  groupBy?: Record<string, string>;
}) {
  // Because we can't conditionally render a hook, we still call it with a fallback value.
  const filterFallback = { filterDefs: {}, storageKey: "unset-filter" } as UsePersistedFilterProps<F>;
  const { filter, setFilter } = usePersistedFilter<F>(persistedFilter ?? filterFallback);
  const groupBy = useGroupBy(maybeGroupBy ?? { none: "none" });

  const [searchString, setSearchString] = useState<string | undefined>("");

  const columnsFallback = "unset-columns";
  const [visibleColumnIds, setVisibleColumnIds] = useSessionStorage<string[] | undefined>(
    persistedColumns?.storageKey ?? columnsFallback,
    undefined,
  );

  const filteringActive = getActiveFilterCount(filter) > 0 || !!searchString;

  const clearFilters = useCallback(() => {
    setFilter({} as F);
    setSearchString("");
  }, [setFilter]);

  return {
    filter,
    setFilter,
    filterDefs: persistedFilter?.filterDefs,
    searchString,
    setSearchString,
    search,
    groupBy: maybeGroupBy ? groupBy : undefined,
    visibleColumnIds: persistedColumns ? visibleColumnIds : undefined,
    setVisibleColumnIds: persistedColumns ? setVisibleColumnIds : undefined,
    persistedColumnsStorageKey: persistedColumns?.storageKey,
    filteringActive,
    clearFilters,
  };
}

/** Composes the empty state for the table based on the table props and layout state.
 * By default the empty state assumes filters or search are the reason for the empty state.
 */
function composeEmptyState<F extends Record<string, unknown>, R extends Kinded, X extends Only<GridTableXss, X>, QData>(
  tableProps: GridTablePropsWithRows<R, X> | QueryTablePropsWithQuery<R, X, QData>,
  layoutState: ReturnType<typeof useGridTableLayoutState<F>> | undefined,
  layoutEmptyFallback: string | undefined,
  clearFilters: () => void,
): GridTableEmptyStateProps {
  const tableEmptyState = "emptyState" in tableProps ? tableProps.emptyState : undefined;
  const tableEmptyFallback = "emptyFallback" in tableProps ? tableProps.emptyFallback : undefined;

  const filteringActive = layoutState?.filteringActive ?? false;
  const filterEmptyDescription = "Try adjusting your search or filters.";

  return {
    illustration: tableEmptyState?.illustration,
    title: tableEmptyState?.title ?? tableEmptyFallback ?? layoutEmptyFallback,
    description: tableEmptyState?.description ?? (filteringActive ? filterEmptyDescription : undefined),
    actions:
      tableEmptyState?.actions ??
      (filteringActive && layoutState ? (
        <Button label="Clear Filters" variant="tertiary" onClick={clearFilters} data-testid="clearFilters" />
      ) : undefined),
  };
}
