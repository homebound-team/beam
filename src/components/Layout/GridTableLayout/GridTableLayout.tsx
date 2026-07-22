import { useResizeObserver } from "@react-aria/utils";
import React, { RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollableContent } from "src/components";
import { Button } from "src/components/Button";
import { getActiveFilterCount } from "src/components/Filters/utils";
import { TableView } from "src/components/Table/components/ViewToggleButton";
import { GridTable } from "src/components/Table/GridTable";
import { GridTableApiImpl } from "src/components/Table/GridTableApi";
import { GridTableEmptyStateProps } from "src/components/Table/GridTableEmptyState";
import { GridStyle, GridStyleDef, isGridStyleDef } from "src/components/Table/TableStyles";
import { GridTableXss, Kinded } from "src/components/Table/types";
import { Css, Only, Tokens } from "src/Css";
import { useComputed, useGroupBy, usePersistedFilter, UsePersistedFilterProps, useSessionStorage } from "src/hooks";
import { useDocumentScrollLayout } from "src/layouts/DocumentScrollLayoutContext";
import {
  beamTableActionsHeightVar,
  documentScrollChromeLeft,
  documentScrollChromeWidth,
  stickyNavAndHeaderOffset,
} from "src/layouts/layoutVars";
import { noop, useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { BaseQueryTableProps, GridTablePropsWithRows, isGridTableProps } from "../layoutTypes";
import { ActionButtonMenuProps, GridTableLayoutActions, SearchBoxApi } from "./GridTableLayoutActions";
import { QueryTable, QueryTableProps } from "./QueryTable";
import { usePersistedTableView } from "./usePersistedTableView";

// GridTableLayout-specific query props extend the shared base with display extras.
type QueryTablePropsWithQuery<R extends Kinded, X extends Only<GridTableXss, X>, QData> = BaseQueryTableProps<
  R,
  X,
  QData
> & {
  emptyFallback?: string;
  keepHeaderWhenLoading?: boolean;
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
  /** Renders a ButtonMenu with "verticalDots" icon as trigger */
  actionMenu?: ActionButtonMenuProps;
  hideEditColumns?: boolean;
  totalCount?: number;
  /** When true, shows a view toggle button and renders the table with `as="card"` when in card view. */
  withCardView?: boolean;
  defaultView?: TableView;
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
    actionMenu,
    hideEditColumns = false,
    withCardView,
    defaultView = "list",
    emptyFallback: layoutEmptyFallback,
  } = props;

  const tid = useTestIds(props);
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
  const showTableActions = !!(
    layoutState?.filterDefs ||
    layoutState?.search ||
    hasHideableColumns ||
    withCardView ||
    actionMenu
  );
  const isVirtualized = tableProps.as === "virtual" || (!!withCardView && view === "card");
  const inDocumentScrollLayout = useDocumentScrollLayout();
  const tableActionsRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  useSetTableActionsHeight(tableWrapperRef, tableActionsRef, inDocumentScrollLayout && showTableActions);

  // Sync API changes back to persisted state when persistedColumns is provided
  const visibleColumnIds = useComputed(() => api.getVisibleColumnIds(), [api]);
  useEffect(() => {
    if (layoutState?.setVisibleColumnIds) {
      layoutState.setVisibleColumnIds(visibleColumnIds);
    }
  }, [visibleColumnIds, layoutState]);

  const visibleColumnsStorageKey = layoutState?.persistedColumnsStorageKey;

  const filterSearchProps = useMemo(
    () => (layoutState?.search ? { onSearch: layoutState.setSearchString } : undefined),
    [layoutState?.search, layoutState?.setSearchString],
  );

  // Imperative handle into GridTableLayoutActions' search box, so `clearFilters` can reset the search
  // input directly even when triggered from outside GridTableLayoutActions (e.g. the empty state below).
  const searchApiRef = useRef<SearchBoxApi>();
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
      actionMenu={actionMenu}
    />
  );

  const cardAs = withCardView && view === "card" ? ("card" as const) : undefined;
  const tableStyle = resolveGridTableLayoutStyle(tableProps.style, inDocumentScrollLayout);

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
          columnGutter={inDocumentScrollLayout}
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
          columnGutter={inDocumentScrollLayout}
        />
      )}
    </>
  );

  const tableScrollContent = (
    <>
      {showTableActions && (
        <div
          ref={tableActionsRef}
          css={
            Css.if(inDocumentScrollLayout)
              .transitionTop.sticky.top(stickyNavAndHeaderOffset())
              .left(documentScrollChromeLeft())
              .w(documentScrollChromeWidth())
              .z(zIndices.tableActions)
              .bgColor(Tokens.Surface).$
          }
          {...tid.stickyContent}
        >
          {tableActionsEl}
        </div>
      )}
      {inDocumentScrollLayout ? (
        tableBody
      ) : (
        <ScrollableContent virtualized={isVirtualized}>{tableBody}</ScrollableContent>
      )}
    </>
  );

  return (
    /* Wrapper sets --beam-table-actions-height so GridTable's sticky header can read it. */
    <div ref={tableWrapperRef} css={Css.display("contents").$} {...tid.tableWrapper}>
      {tableScrollContent}
    </div>
  );
}

export const GridTableLayout = React.memo(GridTableLayoutComponent) as typeof GridTableLayoutComponent;

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
    title: tableEmptyState?.title ?? tableEmptyFallback ?? layoutEmptyFallback,
    description: tableEmptyState?.description ?? (filteringActive ? filterEmptyDescription : undefined),
    actions:
      tableEmptyState?.actions ??
      (filteringActive && layoutState ? (
        <Button label="Clear Filters" variant="tertiary" onClick={clearFilters} data-testid="clearFilters" />
      ) : undefined),
  };
}

/** Sets `--beam-table-actions-height` on the table wrapper so the sticky header can read it without re-rendering children. */
function useSetTableActionsHeight(
  tableWrapperRef: RefObject<HTMLElement | null>,
  tableActionsRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const syncHeightVar = useCallback(() => {
    const tableWrapper = tableWrapperRef.current;
    if (!tableWrapper) return;

    if (!enabled) {
      tableWrapper.style.removeProperty(beamTableActionsHeightVar);
      return;
    }

    const height = tableActionsRef.current ? Math.round(tableActionsRef.current.getBoundingClientRect().height) : 0;

    if (height > 0) {
      tableWrapper.style.setProperty(beamTableActionsHeightVar, `${height}px`);
    } else {
      tableWrapper.style.removeProperty(beamTableActionsHeightVar);
    }
  }, [enabled, tableActionsRef, tableWrapperRef]);

  useResizeObserver({ ref: tableActionsRef, onResize: enabled ? syncHeightVar : noop });
  useLayoutEffect(() => {
    syncHeightVar();
    const tableWrapper = tableWrapperRef.current;
    return () => {
      tableWrapper?.style.removeProperty(beamTableActionsHeightVar);
    };
  }, [tableWrapperRef, syncHeightVar]);
}

/** Merges layout defaults with a GridStyleDef, or passes a full GridStyle through unchanged. */
export function resolveGridTableLayoutStyle(
  userStyle: GridStyle | GridStyleDef | undefined,
  inDocumentScrollLayout: boolean,
): GridStyle | GridStyleDef {
  const layoutDefaults: GridStyleDef = {
    allWhite: true,
    roundedHeader: !inDocumentScrollLayout,
  };
  if (userStyle === undefined) {
    return layoutDefaults;
  }
  if (isGridStyleDef(userStyle)) {
    return { ...layoutDefaults, ...userStyle };
  }
  return userStyle;
}
