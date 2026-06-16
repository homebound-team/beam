import { useResizeObserver } from "@react-aria/utils";
import React, { ReactNode, RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollableContent } from "src/components";
import { Button } from "src/components/Button";
import { ButtonMenu, ButtonMenuProps } from "src/components/ButtonMenu";
import { FilterDropdownMenu } from "src/components/Filters/FilterDropdownMenu";
import { EditColumnsButton } from "src/components/Table/components/EditColumnsButton";
import { TableView, ViewToggleButton } from "src/components/Table/components/ViewToggleButton";
import { GridTable } from "src/components/Table/GridTable";
import { GridTableApiImpl } from "src/components/Table/GridTableApi";
import { TableActions } from "src/components/Table/TableActions";
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
import { FullBleed } from "../FullBleed";
import { ActionButtonProps, BaseQueryTableProps, GridTablePropsWithRows, isGridTableProps } from "../layoutTypes";
import { HeaderBreadcrumb, PageHeaderBreadcrumbs } from "../PageHeaderBreadcrumbs";
import { QueryTable, QueryTableProps } from "./QueryTable";
import { usePersistedTableView } from "./usePersistedTableView";

// Omit to force all action button menus to look the same
type ActionButtonMenuProps = Omit<ButtonMenuProps, "trigger">;

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
  pageTitle?: ReactNode;
  tableProps: GridTablePropsWithRows<R, X> | QueryTablePropsWithQuery<R, X, QData>;
  breadCrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
  layoutState?: ReturnType<typeof useGridTableLayoutState<F>>;
  /** Renders a ButtonMenu with "verticalDots" icon as trigger */
  actionMenu?: ActionButtonMenuProps;
  primaryAction?: ActionButtonProps;
  secondaryAction?: ActionButtonProps;
  tertiaryAction?: ActionButtonProps;
  hideEditColumns?: boolean;
  /** Temporary prop for card views. When provided, shows a view toggle button. Rendered in place of the table when in tile mode. */
  withCardView?: ReactNode;
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
    pageTitle,
    breadCrumb,
    tableProps,
    layoutState,
    primaryAction,
    secondaryAction,
    tertiaryAction,
    actionMenu,
    hideEditColumns = false,
    withCardView,
    defaultView = "list",
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
  const showTableActions = !!(layoutState?.filterDefs || layoutState?.search || hasHideableColumns || withCardView);
  const isVirtualized = tableProps.as === "virtual";
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

  const tableActionsEl = (
    <TableActions
      right={
        (hasHideableColumns || withCardView) && (
          <div css={Css.df.gap1.$}>
            {hasHideableColumns && (
              <EditColumnsButton columns={columns} api={api} tooltip="Display columns" {...tid.editColumnsButton} />
            )}
            {withCardView && <ViewToggleButton view={view} onChange={setView} />}
          </div>
        )
      }
      xss={Css.pt3.if(inDocumentScrollLayout).pl3.pr3.$}
    >
      {layoutState && (layoutState.filterDefs || layoutState.search) && (
        <FilterDropdownMenu
          filterDefs={layoutState.filterDefs}
          filter={layoutState.filter}
          onChange={layoutState.setFilter}
          groupBy={layoutState.groupBy}
          searchProps={layoutState.search ? { onSearch: layoutState.setSearchString } : undefined}
        />
      )}
    </TableActions>
  );

  const tableBody = (
    <>
      {view === "card" && withCardView ? (
        withCardView
      ) : isGridTableProps(tableProps) ? (
        <GridTable
          {...tableProps}
          api={api}
          filter={clientSearch}
          style={{ allWhite: true, roundedHeader: !inDocumentScrollLayout }}
          stickyHeader
          disableColumnResizing={false}
          visibleColumnsStorageKey={visibleColumnsStorageKey}
          columnGutter={inDocumentScrollLayout}
        />
      ) : (
        <QueryTable
          {...(tableProps as QueryTableProps<R, QData, X>)}
          api={api}
          filter={clientSearch}
          style={{ allWhite: true, roundedHeader: !inDocumentScrollLayout }}
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
    <>
      {pageTitle && (
        <Header
          pageTitle={pageTitle}
          breadCrumb={breadCrumb}
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
          tertiaryAction={tertiaryAction}
          actionMenu={actionMenu}
        />
      )}
      {/* Wrapper sets --beam-table-actions-height so GridTable's sticky header can read it. */}
      <div ref={tableWrapperRef} css={Css.display("contents").$} {...tid.tableWrapper}>
        {tableScrollContent}
      </div>
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
  };
}

type HeaderProps = {
  pageTitle: ReactNode;
  breadCrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
  primaryAction?: ActionButtonProps;
  secondaryAction?: ActionButtonProps;
  tertiaryAction?: ActionButtonProps;
  actionMenu?: ActionButtonMenuProps;
};

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

function Header(props: HeaderProps) {
  const { pageTitle, breadCrumb, primaryAction, secondaryAction, tertiaryAction, actionMenu } = props;
  const tids = useTestIds(props);

  return (
    <FullBleed>
      <header css={{ ...Css.p3.mhPx(50).bgWhite.df.jcsb.aic.$ }} {...tids.header}>
        <div>
          {breadCrumb && <PageHeaderBreadcrumbs breadcrumb={breadCrumb} />}
          <h1 css={Css.xl2.mt1.$} {...tids.pageTitle}>
            {pageTitle}
          </h1>
        </div>
        {/* Flex wrap reverse and justify flex end allows the buttons to wrap naturally/responsively on smaller screens */}
        <div css={Css.df.fwr.jcfe.gap1.aic.$}>
          {tertiaryAction && <Button {...tertiaryAction} variant="tertiary" />}
          {secondaryAction && <Button {...secondaryAction} variant="secondary" />}
          {primaryAction && <Button {...primaryAction} />}
          {actionMenu && <ButtonMenu {...actionMenu} trigger={{ icon: "verticalDots" }} />}
        </div>
      </header>
    </FullBleed>
  );
}
