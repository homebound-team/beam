import { useEffect, useState } from "react";
import { Filters } from "src/components/Filters/Filters";
import { Icon } from "src/components/Icon";
import { GridTable, GridTableProps } from "src/components/Table/GridTable";
import { TableActions } from "src/components/Table/TableActions";
import { GridTableXss, Kinded } from "src/components/Table/types";
import { Css, Only, Palette } from "src/Css";
import { usePersistedFilter, UsePersistedFilterProps } from "src/hooks";
import { TextField } from "src/inputs/TextField";
import { useTestIds } from "src/utils";
import { useDebounce } from "use-debounce";
import { FullBleed } from "../FullBleed";
import { HeaderBreadcrumb, PageHeaderBreadcrumbs } from "../PageHeaderBreadcrumbs";
import { ScrollableContent } from "../ScrollableContent";

export type GridTableLayoutProps<
  F extends Record<string, unknown>,
  R extends Kinded,
  X extends Only<GridTableXss, X>,
> = {
  pageTitle: string;
  breadcrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
  gridTableProps: GridTableProps<R, X>;
  tableState?: ReturnType<typeof useGridTableLayoutState<F>>;
};

export function GridTableLayout<F extends Record<string, unknown>, R extends Kinded, X extends Only<GridTableXss, X>>(
  props: GridTableLayoutProps<F, R, X>,
) {
  const { pageTitle, breadcrumb, gridTableProps, tableState } = props;
  const { filterState, searchState } = tableState ?? {};

  const clientSearch = searchState?.useSearch === "client" ? searchState.searchString : undefined;
  const showTableActions = filterState || searchState;

  const tids = useTestIds({}, "gridTableLayout");

  return (
    <>
      <Header pageTitle={pageTitle} breadcrumb={breadcrumb} {...tids} />
      <div css={Css.px2.$}>
        {showTableActions && (
          <TableActions>
            {searchState && <SearchBox onSearch={searchState.setSearchString} />}

            {filterState && (
              <Filters
                filterDefs={filterState.filterDefs}
                filter={filterState.filter}
                onChange={filterState.setFilter}
              />
            )}
          </TableActions>
        )}
        <ScrollableContent virtualized={gridTableProps.as === "virtual"}>
          <GridTable {...gridTableProps} filter={clientSearch} style={{ allWhite: true }} />
        </ScrollableContent>
      </div>
    </>
  );
}

export function useGridTableLayoutState<F extends Record<string, unknown>>({
  persistedFilter,
  useSearch,
}: {
  persistedFilter: UsePersistedFilterProps<F>;
  useSearch?: "client" | "server";
}) {
  const { filter, setFilter } = usePersistedFilter<F>(persistedFilter);
  const [searchString, setSearchString] = useState<string | undefined>("");

  return {
    filterState: { filter, setFilter, filterDefs: persistedFilter.filterDefs },
    searchState: { searchString, setSearchString, useSearch },
    // Duplicated for easier destructuring
    filter,
    searchString,
  };
}

type HeaderProps = {
  pageTitle: string;
  breadcrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
};

function Header(props: HeaderProps) {
  const { pageTitle, breadcrumb } = props;
  const tids = useTestIds(props);

  return (
    <FullBleed>
      <header css={{ ...Css.p3.mb3.mhPx(50).bgWhite.$ }} {...tids.header}>
        {breadcrumb && <PageHeaderBreadcrumbs breadcrumb={breadcrumb} />}
        <h1 css={Css.xl2Sb.mt2.$} {...tids.pageTitle}>
          {pageTitle}
        </h1>
      </header>
    </FullBleed>
  );
}

type SearchBoxProps = {
  onSearch(filter: string): void;
  clearable?: boolean;
  updateQueryString?: boolean;
};

function SearchBox(props: SearchBoxProps) {
  const { onSearch, clearable, updateQueryString = true } = props;
  // const [{ search: initialValue }, setQs] = useZodQueryString(searchSchema);
  const [value, setValue] = useState<string>("");

  // const tid = useTestIds(props, "searchBox");
  const [debouncedSearch] = useDebounce(value, 300);

  // TODO: figure out query strings
  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch, updateQueryString]);

  return (
    <div css={Css.wPx(244).$}>
      <TextField
        label="Search"
        labelStyle="hidden"
        value={value}
        onChange={(v) => setValue(v ?? "")}
        placeholder={"Search"}
        clearable={clearable}
        startAdornment={<Icon icon="search" color={Palette.Gray700} />}
        // {...tid}
      />
    </div>
  );
}
