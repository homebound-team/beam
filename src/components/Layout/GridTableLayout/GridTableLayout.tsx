import React, { useEffect, useMemo, useState } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { Filters } from "src/components/Filters/Filters";
import { Icon } from "src/components/Icon";
import { OffsetAndLimit, Pagination } from "src/components/Pagination";
import { GridDataRow } from "src/components/Table";
import { EditColumnsButton } from "src/components/Table/components/EditColumnsButton";
import { GridTable, GridTableProps } from "src/components/Table/GridTable";
import { GridTableApiImpl } from "src/components/Table/GridTableApi";
import { TableActions } from "src/components/Table/TableActions";
import { GridTableXss, Kinded } from "src/components/Table/types";
import { Css, Only, Palette } from "src/Css";
import {
  useBreakpoint,
  useComputed,
  useGroupBy,
  usePersistedFilter,
  UsePersistedFilterProps,
  useSessionStorage,
} from "src/hooks";
import { TextField } from "src/inputs/TextField";
import { useTestIds } from "src/utils";
import { useDebounce } from "use-debounce";
import { StringParam, useQueryParams } from "use-query-params";
import { FullBleed } from "../FullBleed";
import { HeaderBreadcrumb, PageHeaderBreadcrumbs } from "../PageHeaderBreadcrumbs";
import { ScrollableContent } from "../ScrollableContent";
import { QueryResult, QueryTable, QueryTableProps } from "./QueryTable";

type ActionButtonProps = Pick<ButtonProps, "onClick" | "label" | "disabled" | "tooltip">;

type OmittedTableProps = "filter" | "stickyHeader" | "style" | "rows";

// To wrap the `QueryTable` behavior, we allow a user to pass in EITHER `rows` OR `query` + `createRows` to opt-in to the QueryTable behavior
type BaseTableProps<R extends Kinded, X extends Only<GridTableXss, X>> = Omit<GridTableProps<R, X>, OmittedTableProps>;
type GridTablePropsWithRows<R extends Kinded, X extends Only<GridTableXss, X>> = BaseTableProps<R, X> & {
  rows: GridTableProps<R, X>["rows"];
  query?: never;
  createRows?: never;
};
type QueryTablePropsWithQuery<R extends Kinded, X extends Only<GridTableXss, X>, QData> = BaseTableProps<R, X> & {
  query: QueryResult<QData>;
  createRows: (data: QData | undefined) => GridDataRow<R>[];
  getPageInfo?: (data: QData) => { hasNextPage: boolean };
  emptyFallback?: string;
  keepHeaderWhenLoading?: boolean;
  rows?: never;
};
function isGridTableProps<R extends Kinded, X extends Only<GridTableXss, X>, QData>(
  props: GridTablePropsWithRows<R, X> | QueryTablePropsWithQuery<R, X, QData>,
): props is GridTablePropsWithRows<R, X> {
  return "rows" in props;
}

export type GridTableLayoutProps<
  F extends Record<string, unknown>,
  R extends Kinded,
  X extends Only<GridTableXss, X>,
  QData,
> = {
  pageTitle: string;
  tableProps: GridTablePropsWithRows<R, X> | QueryTablePropsWithQuery<R, X, QData>;
  breadcrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
  layoutState?: ReturnType<typeof useGridTableLayoutState<F>>;
  primaryAction?: ActionButtonProps;
  secondaryAction?: ActionButtonProps;
  tertiaryAction?: ActionButtonProps;
  hideEditColumns?: boolean;
  totalCount: number;
};

/**
 * A layout component that combines a table with a header, actions buttons, filters, and pagination.
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
 *
 * Pagination is always enabled - use `layoutState.page` for query variables.
 */
function GridTableLayoutComponent<
  F extends Record<string, unknown>,
  R extends Kinded,
  X extends Only<GridTableXss, X>,
  QData,
>(props: GridTableLayoutProps<F, R, X, QData>) {
  const {
    pageTitle,
    breadcrumb,
    tableProps,
    layoutState,
    primaryAction,
    secondaryAction,
    tertiaryAction,
    hideEditColumns = false,
    totalCount,
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
  const clientSearch = layoutState?.search === "client" ? layoutState.searchString : undefined;
  const showTableActions = layoutState?.filterDefs || layoutState?.search || hasHideableColumns;
  const isVirtualized = tableProps.as === "virtual";

  const breakpoints = useBreakpoint();

  // Sync API changes back to persisted state when persistedColumns is provided
  const visibleColumnIds = useComputed(() => api.getVisibleColumnIds(), [api]);
  useEffect(() => {
    if (layoutState?.setVisibleColumnIds) {
      layoutState.setVisibleColumnIds(visibleColumnIds);
    }
  }, [visibleColumnIds, layoutState]);

  const visibleColumnsStorageKey = layoutState?.persistedColumnsStorageKey;

  return (
    <>
      <Header
        pageTitle={pageTitle}
        breadcrumb={breadcrumb}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        tertiaryAction={tertiaryAction}
      />
      {showTableActions && (
        <TableActions onlyRight={!layoutState?.search && hasHideableColumns}>
          <div css={Css.df.gap1.$}>
            {layoutState?.search && <SearchBox onSearch={layoutState.setSearchString} />}
            {layoutState?.filterDefs && (
              <Filters
                filterDefs={layoutState.filterDefs}
                filter={layoutState.filter}
                onChange={layoutState.setFilter}
                groupBy={layoutState.groupBy}
                numberOfInlineFilters={breakpoints.mdAndDown ? 2 : undefined}
              />
            )}
          </div>
          {hasHideableColumns && (
            <EditColumnsButton
              columns={columns}
              api={api}
              tooltip="Display columns"
              trigger={{ icon: "kanban", label: "", variant: "secondaryBlack" }}
              {...tid.editColumnsButton}
            />
          )}
        </TableActions>
      )}
      <ScrollableContent virtualized={isVirtualized}>
        {isGridTableProps(tableProps) ? (
          <GridTable
            {...tableProps}
            api={api}
            filter={clientSearch}
            style={{ allWhite: true }}
            stickyHeader
            visibleColumnsStorageKey={visibleColumnsStorageKey}
          />
        ) : (
          <QueryTable
            {...(tableProps as QueryTableProps<R, QData, X>)}
            api={api}
            filter={clientSearch}
            style={{ allWhite: true }}
            stickyHeader
            visibleColumnsStorageKey={visibleColumnsStorageKey}
          />
        )}
        {layoutState && (
          <Pagination
            page={[layoutState.page, layoutState.setPage]}
            totalCount={totalCount}
            pageSizes={layoutState.pageSizes}
            {...tid.pagination}
          />
        )}
      </ScrollableContent>
    </>
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

/** Configuration for pagination in GridTableLayout */
export type PaginationConfig = {
  /** Available page size options */
  pageSizes?: number[];
  /** Storage key for persisting page size preference */
  storageKey?: string;
};

/**
 * A wrapper around standard filter, grouping, search, and pagination state hooks.
 * * `client` search will use the built-in grid table search functionality.
 * * `server` search will return `searchString` as a debounced search string to query the server.
 * * Pagination is always enabled by default. Use `pagination` config to customize page sizes or storage key.
 */
export function useGridTableLayoutState<F extends Record<string, unknown>>({
  persistedFilter,
  persistedColumns,
  search,
  groupBy: maybeGroupBy,
  pagination,
}: {
  persistedFilter?: UsePersistedFilterProps<F>;
  persistedColumns?: { storageKey: string };
  search?: "client" | "server";
  groupBy?: Record<string, string>;
  /** Customize pagination page sizes or storage key. Pagination is always enabled. */
  pagination?: PaginationConfig;
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

  // Pagination state management - always enabled by default
  const paginationFallbackKey = "unset-pagination";
  const [persistedPageSize, setPersistedPageSize] = useSessionStorage<number>(
    pagination?.storageKey ?? paginationFallbackKey,
    100, // default page size
  );

  const [page, setPage] = useState<OffsetAndLimit>({
    offset: 0,
    limit: persistedPageSize,
  });

  // Persist page size and reset to first page when filters/search change
  const filterString = JSON.stringify(filter);
  useEffect(() => {
    if (page.limit !== persistedPageSize) setPersistedPageSize(page.limit);
    setPage((prev) => ({ ...prev, offset: 0 }));
  }, [page.limit, persistedPageSize, setPersistedPageSize, filterString, searchString]);

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
    page,
    setPage,
    pageSizes: pagination?.pageSizes,
  };
}

type HeaderProps = {
  pageTitle: string;
  breadcrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
  primaryAction?: ActionButtonProps;
  secondaryAction?: ActionButtonProps;
  tertiaryAction?: ActionButtonProps;
};

function Header(props: HeaderProps) {
  const { pageTitle, breadcrumb, primaryAction, secondaryAction, tertiaryAction } = props;
  const tids = useTestIds(props);

  return (
    <FullBleed>
      <header css={{ ...Css.p3.mb3.mhPx(50).bgWhite.df.jcsb.aic.$ }} {...tids.header}>
        <div>
          {breadcrumb && <PageHeaderBreadcrumbs breadcrumb={breadcrumb} />}
          <h1 css={Css.xl2.mt1.$} {...tids.pageTitle}>
            {pageTitle}
          </h1>
        </div>
        {/* Flex wrap reverse and justify flex end allows the buttons to wrap naturally/responsively on smaller screens */}
        <div css={Css.df.fwr.jcfe.gap1.$}>
          {tertiaryAction && <Button {...tertiaryAction} variant="tertiary" />}
          {secondaryAction && <Button {...secondaryAction} variant="secondary" />}
          {primaryAction && <Button {...primaryAction} />}
        </div>
      </header>
    </FullBleed>
  );
}

function SearchBox({ onSearch }: { onSearch(filter: string): void }) {
  const [{ search: initialValue }, setQueryParams] = useQueryParams({ search: StringParam });
  const [value, setValue] = useState<string>(initialValue || "");

  const [debouncedSearch] = useDebounce(value, 300);

  useEffect(() => {
    onSearch(debouncedSearch);
    setQueryParams({ search: debouncedSearch || undefined }, "replaceIn");
  }, [debouncedSearch, onSearch, setQueryParams]);

  return (
    <div css={Css.wPx(244).$}>
      <TextField
        label="Search"
        labelStyle="hidden"
        value={value}
        onChange={(v) => setValue(v ?? "")}
        placeholder={"Search"}
        clearable
        startAdornment={<Icon icon="search" color={Palette.Gray700} />}
      />
    </div>
  );
}
