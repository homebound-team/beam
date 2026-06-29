import { memo, ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { CountBadge } from "src/components/CountBadge";
import {
  DefinedFilterValue,
  Filter,
  FilterDefs,
  FilterImpls,
  filterTestIdPrefix,
  SelectedFilterLabelValue,
  updateFilter,
} from "src/components/Filters";
import { Icon } from "src/components/Icon";
import { IconButton } from "src/components/IconButton";
import { ToggleChip } from "src/components/ToggleChip";
import { Css, Palette } from "src/Css";
import { useBreakpoint } from "src/hooks";
import { SelectField } from "src/inputs/SelectField";
import { TextField } from "src/inputs/TextField";
import { Value } from "src/inputs/Value";
import { useDocumentScrollLayout } from "src/layouts/DocumentScrollLayoutContext";
import { isDefined, safeEntries, safeKeys, useTestIds } from "src/utils";
import { useDebounce } from "use-debounce";
import { StringParam, useQueryParams } from "use-query-params";

export type SearchBoxProps = {
  onSearch: (filter: string) => void;
};

type GridTableLayoutActionsProps<F extends Record<string, unknown>, G extends Value = string> = {
  filterDefs?: FilterDefs<F>;
  filter?: F;
  onChange?: (filter: F) => void;
  groupBy?: {
    value: G;
    setValue: (groupBy: G) => void;
    options: Array<{ id: G; name: string }>;
  };
  searchProps?: SearchBoxProps;
  /** Content pinned right in the actions bar (e.g., Edit Columns, View Toggle). */
  right?: ReactNode;
};

function GridTableLayoutActionsComponent<F extends Record<string, unknown>, G extends Value = string>(
  props: GridTableLayoutActionsProps<F, G>,
) {
  const { filter, onChange, filterDefs, groupBy, searchProps, right } = props;
  const testId = useTestIds(props, filterTestIdPrefix);

  const { sm } = useBreakpoint();
  const inDocumentScrollLayout = useDocumentScrollLayout();
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [{ search: initialValue }, setQueryParams] = useQueryParams({ search: StringParam });
  const [searchValue, setSearchValue] = useState<string>(initialValue || "");
  const [debouncedSearch] = useDebounce(searchValue, 300);

  useEffect(() => {
    if (searchProps) {
      searchProps.onSearch(debouncedSearch);
      setQueryParams({ search: debouncedSearch || undefined }, "replaceIn");
    }
  }, [debouncedSearch, searchProps, setQueryParams]);

  const hasSearch = !!searchProps;
  const hasFilters = !!filterDefs && Object.keys(filterDefs ?? {}).length > 0;
  const activeFilterCount = useMemo(() => (filter ? getActiveFilterCount(filter) : 0), [filter]);
  const filterImpls = useMemo(() => (filterDefs ? buildFilterImpls(filterDefs) : ({} as FilterImpls<F>)), [filterDefs]);

  const searchTextField = (
    <TextField
      label="Search"
      labelStyle="hidden"
      value={searchValue}
      onChange={(v) => setSearchValue(v ?? "")}
      placeholder="Search"
      clearable
      fullWidth
      startAdornment={<Icon icon="search" color={Palette.Gray700} />}
    />
  );

  return (
    <div css={Css.df.fdc.gap1.pb1.$}>
      <div css={Css.df.gap1.aic.jcsb.aifs.pt3.if(inDocumentScrollLayout).pl3.pr3.$}>
        <div css={Css.df.gap1.aic.fww.$}>
          {/* Large screen: 244px inline search field */}
          {!sm && hasSearch && <div css={Css.wPx(244).$}>{searchTextField}</div>}

          {/* Small screen: search icon toggle */}
          {sm && hasSearch && (
            <IconButton
              variant="outline"
              icon="search"
              label="Search"
              onClick={() => setShowSearch(!showSearch)}
              active={showSearch}
              {...testId.searchButton}
            />
          )}

          {/* Small screen: filter button (icon + badge, no label text) */}
          {sm && hasFilters && (
            <Button
              label=""
              variant="secondaryBlack"
              size="md"
              icon="filter"
              aria-label="Filter"
              endAdornment={activeFilterCount > 0 ? <CountBadge count={activeFilterCount} /> : undefined}
              onClick={() => setShowFilters(!showFilters)}
              active={showFilters}
              {...testId.button}
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
              {...testId.button}
            />
          )}
        </div>
        {right}
      </div>

      {/* Search row — spans full width below TableActions (including under right-side buttons) */}
      {sm && showSearch && hasSearch && <div css={Css.pl3.pr3.$}>{searchTextField}</div>}

      {/* Combined filter panel — controls when open, chips when closed */}
      {hasFilters && (
        <FilterPanel
          sm={sm}
          isOpen={showFilters}
          groupBy={groupBy}
          filterImpls={filterImpls}
          filter={filter}
          onChange={onChange}
          activeFilterCount={activeFilterCount}
          testId={testId}
          onClear={() => onChange?.({} as F)}
        />
      )}
    </div>
  );
}

// memo doesn't support generic parameters, so cast the result to the correct type
const _GridTableLayoutActions = memo(GridTableLayoutActionsComponent) as typeof GridTableLayoutActionsComponent;
export { _GridTableLayoutActions as GridTableLayoutActions };

// --- FilterPanel ---

type FilterPanelProps<F extends Record<string, unknown>, G extends Value = string> = {
  sm: boolean;
  isOpen: boolean;
  groupBy?: {
    value: G;
    setValue: (g: G) => void;
    options: Array<{ id: G; name: string }>;
  };
  filterImpls: FilterImpls<F>;
  filter?: F;
  onChange?: (filter: F) => void;
  activeFilterCount: number;
  testId: ReturnType<typeof useTestIds>;
  onClear: () => void;
};

function FilterPanel<F extends Record<string, unknown>, G extends Value = string>({
  sm,
  isOpen,
  groupBy,
  filterImpls,
  filter,
  onChange,
  activeFilterCount,
  testId,
  onClear,
}: FilterPanelProps<F, G>) {
  if (isOpen) {
    const filterControls =
      filter && onChange
        ? (() => {
            const entries = safeEntries(filterImpls);
            const nonCheckbox = entries.filter(([_, f]) => !f.hideLabelInModal);
            const checkbox = entries.filter(([_, f]) => f.hideLabelInModal);
            return [...nonCheckbox, ...checkbox].map(([key, f]: [keyof F, Filter<any>]) => (
              <div key={key as string}>
                {f.render(filter[key], (value) => onChange(updateFilter(filter, key, value)), testId, false, false)}
              </div>
            ));
          })()
        : null;

    return (
      <div
        style={{ scrollbarWidth: "none" }}
        css={sm ? Css.df.gap1.aic.oxa.mw0.pl3.pr3.$ : Css.df.fww.gap1.aic.pl3.pr3.$}
      >
        {groupBy && (
          <SelectField
            label="Group by"
            labelStyle="inline"
            sizeToContent
            options={groupBy.options}
            getOptionValue={(o) => o.id}
            getOptionLabel={(o) => o.name}
            value={groupBy.value}
            onSelect={(g) => g && groupBy.setValue(g)}
          />
        )}
        {filterControls}
        {activeFilterCount > 0 && <Button label="Clear" variant="tertiary" onClick={onClear} {...testId.clearBtn} />}
      </div>
    );
  }

  if (!filter || !onChange) return null;

  const chips = safeEntries(filterImpls).flatMap(([key, f]) => chipsForFilterKey(key, f, filter, onChange, testId));

  if (chips.length === 0) return null;

  return (
    <div css={Css.df.gap1.aic.pl3.oxa.mw0.if(!sm).fww.$}>
      {chips}
      <Button label="Clear" variant="tertiary" onClick={onClear} {...testId.clearBtn} />
    </div>
  );
}

// --- Helpers (adapted from FilterDropdownMenu) ---

function buildFilterImpls<F extends Record<string, unknown>>(filterDefs: FilterDefs<F>): FilterImpls<F> {
  return Object.fromEntries(safeEntries(filterDefs).map(([key, fn]) => [key, fn(key as string)])) as FilterImpls<F>;
}

function getActiveFilterCount<F extends Record<string, unknown>>(filter: F): number {
  return safeKeys(filter).filter((key) => filter[key] !== undefined).length;
}

function chipsForFilterKey<F extends Record<string, unknown>, K extends keyof F>(
  key: K,
  f: FilterImpls<F>[K],
  filter: F,
  onChange: (filter: F) => void,
  testId: ReturnType<typeof useTestIds>,
) {
  const value = filter[key];
  if (!isDefined(value)) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const label = f.formatSelectedFilterLabel(item as SelectedFilterLabelValue<DefinedFilterValue<F, K>>);
      if (!isDefined(label)) return [];

      const chipKey = `${String(key)}_${item}`;
      const newArray = value.filter((v) => v !== item);
      return (
        <ToggleChip
          key={chipKey}
          text={label}
          onClick={() => onChange(updateFilter(filter, key, newArray.length > 0 ? (newArray as F[K]) : undefined))}
          {...testId[`chip_${chipKey}`]}
        />
      );
    });
  }

  const label = f.formatSelectedFilterLabel(value as SelectedFilterLabelValue<DefinedFilterValue<F, K>>);
  if (!isDefined(label)) return [];

  return (
    <ToggleChip
      key={String(key)}
      text={label}
      onClick={() => onChange(updateFilter(filter, key, undefined))}
      {...testId[`chip_${String(key)}`]}
    />
  );
}
