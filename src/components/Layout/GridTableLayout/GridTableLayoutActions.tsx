import { memo, useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { CountBadge } from "src/components/CountBadge";
import { FilterDefs, FilterImpls } from "src/components/Filters";
import { Icon } from "src/components/Icon";
import { IconButton } from "src/components/IconButton";
import { EditColumnsButton } from "src/components/Table/components/EditColumnsButton";
import { TableView, ViewToggleButton } from "src/components/Table/components/ViewToggleButton";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { GridColumn, Kinded } from "src/components/Table/types";
import { Css, Palette } from "src/Css";
import { useBreakpoint } from "src/hooks";
import { TextField } from "src/inputs/TextField";
import { Value } from "src/inputs/Value";
import { useDocumentScrollLayout } from "src/layouts/DocumentScrollLayoutContext";
import { useTestIds } from "src/utils";
import { useDebouncedCallback } from "use-debounce";
import { StringParam, useQueryParams } from "use-query-params";
import { buildFilterImpls, FilterPanel, getActiveFilterCount } from "./FilterPanel";

export type SearchBoxProps = {
  onSearch: (filter: string) => void;
};

type GridTableLayoutActionsProps<
  F extends Record<string, unknown>,
  G extends Value = string,
  R extends Kinded = Kinded,
> = {
  filterDefs?: FilterDefs<F>;
  filter?: F;
  setFilter?: (filter: F) => void;
  groupBy?: {
    value: G;
    setValue: (groupBy: G) => void;
    options: Array<{ id: G; name: string }>;
  };
  searchProps?: SearchBoxProps;
  hasHideableColumns?: boolean;
  columns?: GridColumn<R>[];
  api?: GridTableApi<R>;
  withCardView?: boolean;
  view?: TableView;
  setView?: (v: TableView) => void;
};

function GridTableLayoutActionsComponent<
  F extends Record<string, unknown>,
  G extends Value = string,
  R extends Kinded = Kinded,
>(props: GridTableLayoutActionsProps<F, G, R>) {
  const {
    filter,
    setFilter,
    filterDefs,
    groupBy,
    searchProps,
    hasHideableColumns,
    columns,
    api,
    withCardView,
    view,
    setView,
  } = props;
  const testId = useTestIds(props, "gridTableLayoutActions");

  const { sm } = useBreakpoint();
  const inDocumentScrollLayout = useDocumentScrollLayout();
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [{ search: initialValue }, setQueryParams] = useQueryParams({ search: StringParam });
  const [searchValue, setSearchValue] = useState<string>(initialValue || "");
  const handleSearchDebounced = useDebouncedCallback((value: string) => {
    if (searchProps) {
      searchProps.onSearch(value);
      setQueryParams({ search: value || undefined }, "replaceIn");
    }
  }, 300);

  const hasSearch = !!searchProps;
  const hasFilters = !!filterDefs && Object.keys(filterDefs ?? {}).length > 0;
  const activeFilterCount = useMemo(() => (filter ? getActiveFilterCount(filter) : 0), [filter]);
  const filterImpls = useMemo(() => (filterDefs ? buildFilterImpls(filterDefs) : ({} as FilterImpls<F>)), [filterDefs]);

  const searchTextField = (
    <TextField
      label="Search"
      labelStyle="hidden"
      value={searchValue}
      onChange={(v) => {
        setSearchValue(v ?? "");
        handleSearchDebounced(v ?? "");
      }}
      placeholder="Search"
      clearable
      fullWidth
      startAdornment={<Icon icon="search" color={Palette.Gray700} />}
    />
  );

  return (
    <div css={Css.df.fdc.gap1.pb2.$}>
      <div css={Css.df.gap1.jcsb.pt3.if(inDocumentScrollLayout).px3.$}>
        <div css={Css.df.gap1.aic.$}>
          {/* Large screen: 244px inline search field */}
          {!sm && hasSearch && <div css={Css.wPx(244).$}>{searchTextField}</div>}

          {/* Small screen: search icon toggle */}
          {sm && hasSearch && (
            <IconButton
              variant="outline"
              icon={searchValue ? "searchBadged" : "search"}
              label="Search"
              onClick={() => setShowSearch(!showSearch)}
              active={showSearch}
              {...testId.searchButton}
            />
          )}

          {/* Small screen: filter icon toggle */}
          {sm && hasFilters && (
            <IconButton
              variant="outline"
              icon={activeFilterCount > 0 ? "filterBadged" : "filter"}
              label="Filter"
              onClick={() => setShowFilters(!showFilters)}
              active={showFilters}
              {...testId.filterSmallButton}
            />
          )}

          {/* Large screen: full Filter button with badge + chevron */}
          {!sm && hasFilters && (
            <Button
              label="Filter"
              icon="filter"
              size="md"
              endAdornment={
                <div css={Css.df.aic.gap1.$}>
                  {activeFilterCount > 0 && <CountBadge count={activeFilterCount} />}
                  <Icon icon={showFilters ? "chevronUp" : "chevronDown"} />
                </div>
              }
              variant="secondaryBlack"
              onClick={() => setShowFilters(!showFilters)}
              active={showFilters}
              {...testId.filterButton}
            />
          )}
        </div>
        {(hasHideableColumns || withCardView) && (
          <div css={Css.df.gap1.$}>
            {hasHideableColumns && view === "list" && columns && api && (
              <EditColumnsButton columns={columns} api={api} tooltip="Display columns" />
            )}
            {withCardView && view !== undefined && setView && <ViewToggleButton view={view} onChange={setView} />}
          </div>
        )}
      </div>

      {/* Search row — spans full width below TableActions (including under right-side buttons) */}
      {sm && showSearch && <div css={Css.px3.$}>{searchTextField}</div>}

      {/* Combined filter panel — controls when open, chips when closed */}
      {hasFilters && (
        <FilterPanel
          isOpen={showFilters}
          groupBy={groupBy}
          filterImpls={filterImpls}
          filter={filter}
          setFilter={setFilter}
          onClear={() => setFilter?.({} as F)}
        />
      )}
    </div>
  );
}

// memo doesn't support generic parameters, so cast the result to the correct type
const _GridTableLayoutActions = memo(GridTableLayoutActionsComponent) as typeof GridTableLayoutActionsComponent;
export { _GridTableLayoutActions as GridTableLayoutActions };
