import { memo, useEffect, useMemo, useState } from "react";
import { IconButton } from "src/components";
import { Button } from "src/components/Button";
import { CountBadge } from "src/components/CountBadge";
import { Filter, FilterDefs, FilterImpls, filterTestIdPrefix, updateFilter } from "src/components/Filters";
import { Icon } from "src/components/Icon";
import { ToggleChip } from "src/components/ToggleChip";
import { Css, Palette } from "src/Css";
import { useBreakpoint } from "src/hooks";
import { SelectField } from "src/inputs/SelectField";
import { TextField } from "src/inputs/TextField";
import { Value } from "src/inputs/Value";
import { isDefined, safeEntries, safeKeys, useTestIds } from "src/utils";
import { useDebounce } from "use-debounce";
import { StringParam, useQueryParams } from "use-query-params";

/** Props for the search box integrated into FilterDropdownMenu. */
export interface SearchBoxProps {
  onSearch: (filter: string) => void;
}

/**
 * FilterDropdownMenu is a newer filter UI pattern that shows a "Filter" button
 * which expands to reveal filter controls in a row below, with chips displayed
 * when closed to indicate active filters.
 *
 * When `searchProps` is provided, a search box is rendered before the filter controls:
 * - On larger screens: as a visible text field inline before the filter button
 * - On smaller screens: as an icon button inline with the filter button, expanding to a
 *   full-width text field below (which appears before any open filter controls)
 *
 * Note: We expect the existing `Filters` component to eventually become
 * `FilterDropdownMenu`, but it hasn't been rolled out everywhere yet.
 */
interface FilterDropdownMenuProps<F extends Record<string, unknown>, G extends Value = string> {
  /** List of filters. When omitted, no filter UI is rendered. */
  filterDefs?: FilterDefs<F>;
  /** The current filter value. */
  filter?: F;
  /** Called when the filters have changed. */
  onChange?: (filter: F) => void;
  groupBy?: {
    /** The current group by value. */
    value: G;
    /** Called when the group by have changed. */
    setValue: (groupBy: G) => void;
    /** The list of group by options. */
    options: Array<{ id: G; name: string }>;
  };
  /** When provided, renders a search box before the filter controls. */
  searchProps?: SearchBoxProps;
}

function FilterDropdownMenu<F extends Record<string, unknown>, G extends Value = string>(
  props: FilterDropdownMenuProps<F, G>,
) {
  const { filter, onChange, filterDefs, groupBy, searchProps } = props;
  const testId = useTestIds(props, filterTestIdPrefix);

  const { sm } = useBreakpoint();
  const [isOpen, setIsOpen] = useState(false);
  const [searchIsOpen, setSearchIsOpen] = useState(false);

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

  // Calculate the number of active filters for badge count
  const activeFilterCount = useMemo(() => (filter ? getActiveFilterCount(filter) : 0), [filter]);

  // Convert FilterDefs to FilterImpls
  const filterImpls = useMemo(() => (filterDefs ? buildFilterImpls(filterDefs) : ({} as FilterImpls<F>)), [filterDefs]);

  // Render all filters, with non-checkbox filters first, then checkbox filters
  const renderFilters = () => {
    if (!filter || !onChange) return null;
    const entries = safeEntries(filterImpls);
    const nonCheckbox = entries.filter(([_, f]) => !f.hideLabelInModal);
    const checkbox = entries.filter(([_, f]) => f.hideLabelInModal);

    return [...nonCheckbox, ...checkbox].map(([key, f]: [keyof F, Filter<any>]) => (
      <div key={key as string}>
        {f.render(filter[key], (value) => onChange(updateFilter(filter, key, value)), testId, false, false)}
      </div>
    ));
  };

  const searchTextField = (
    <TextField
      label="Search"
      labelStyle="hidden"
      value={searchValue}
      onChange={(v) => setSearchValue(v ?? "")}
      placeholder="Search"
      clearable
      startAdornment={<Icon icon="search" color={Palette.Gray700} />}
    />
  );

  return (
    <>
      {/* Large screen: search field visible inline before filter button */}
      {hasSearch && <div css={Css.wPx(244).if(sm).visuallyHidden.$}>{searchTextField}</div>}

      {/* Small screen: search icon button inline with filter button */}
      {sm && hasSearch && (
        <IconButton
          label="Search"
          icon="search"
          onClick={() => setSearchIsOpen(!searchIsOpen)}
          active={searchIsOpen}
          circle
          {...testId.searchButton}
        />
      )}

      {/* Filter button (only rendered when filterDefs are provided) */}
      {hasFilters && sm ? (
        <IconButton
          label="Filter"
          icon="filter"
          onClick={() => setIsOpen(!isOpen)}
          active={isOpen}
          circle
          {...testId.button}
        />
      ) : (
        <Button
          label={sm ? "" : "Filter"}
          aria-label={"Filter"}
          icon="filter"
          size="md"
          endAdornment={
            <div css={Css.df.aic.gap1.$}>
              {activeFilterCount > 0 && <CountBadge count={activeFilterCount} />}
              <Icon xss={Css.if(sm).visuallyHidden.$} icon={isOpen ? "chevronUp" : "chevronDown"} />
            </div>
          }
          variant="secondaryBlack"
          onClick={() => setIsOpen(!isOpen)}
          active={isOpen}
          {...testId.button}
        />
      )}

      {/* Small screen: search text field row — rendered before filter controls */}
      {searchIsOpen && <div css={Css.w100.if(!sm).visuallyHidden.$}>{searchTextField}</div>}

      {/* When open, show all filter controls in a new row below */}
      {hasFilters && isOpen && (
        <div css={Css.df.aic.fww.gap1.w100.$}>
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

          {renderFilters()}

          {/* Clear button at end of filter controls */}
          {activeFilterCount > 0 && (
            <Button label="Clear" variant="tertiary" onClick={() => onChange?.({} as F)} {...testId.clearBtn} />
          )}
        </div>
      )}

      {/* Filter chips (and clear button) shown when dropdown is closed */}
      {hasFilters && !isOpen && filter && onChange && (
        <FilterChips
          filter={filter}
          filterImpls={filterImpls}
          onChange={onChange}
          onClear={() => onChange({} as F)}
          testId={testId}
        />
      )}
    </>
  );
}

interface FilterChipsProps<F extends Record<string, unknown>> {
  filter: F;
  filterImpls: ReturnType<typeof buildFilterImpls<F>>;
  onChange: (filter: F) => void;
  onClear: () => void;
  testId: ReturnType<typeof useTestIds>;
}

function FilterChips<F extends Record<string, unknown>>({
  filter,
  filterImpls,
  onChange,
  onClear,
  testId,
}: FilterChipsProps<F>) {
  const chips = safeEntries(filterImpls).flatMap(([key]) => {
    const value = filter[key];
    if (!isDefined(value)) return [];

    if (Array.isArray(value)) {
      return value.map((item) => {
        const chipKey = `${String(key)}_${item}`;
        const newArray = value.filter((v) => v !== item);
        return (
          <ToggleChip
            key={chipKey}
            text={titleCase(String(item))}
            onClick={() => onChange(updateFilter(filter, key, newArray.length > 0 ? (newArray as any) : undefined))}
            {...testId[`chip_${chipKey}`]}
          />
        );
      });
    }

    return (
      <ToggleChip
        key={String(key)}
        text={titleCase(String(value))}
        onClick={() => onChange(updateFilter(filter, key, undefined))}
        {...testId[`chip_${String(key)}`]}
      />
    );
  });

  if (chips.length === 0) return null;

  return (
    <div css={Css.df.gap1.fww.aic.order(1).$}>
      {chips}
      <Button label="Clear" variant="tertiary" onClick={onClear} {...testId.clearBtn} />
    </div>
  );
}

/** Convert FilterDefs to FilterImpls by evaluating the factory functions */
function buildFilterImpls<F extends Record<string, unknown>>(filterDefs: FilterDefs<F>): FilterImpls<F> {
  return Object.fromEntries(safeEntries(filterDefs).map(([key, fn]) => [key, fn(key as string)])) as FilterImpls<F>;
}

/** Capitalize the first letter of each word */
function titleCase(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Calculate the number of active (non-undefined) filters */
function getActiveFilterCount<F extends Record<string, unknown>>(filter: F): number {
  return safeKeys(filter).filter((key) => filter[key] !== undefined).length;
}

// memo doesn't support generic parameters, so cast the result to the correct type
const _FilterDropdownMenu = memo(FilterDropdownMenu) as typeof FilterDropdownMenu;
export { _FilterDropdownMenu as FilterDropdownMenu };
