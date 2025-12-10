import { memo, useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { CountBadge } from "src/components/CountBadge";
import { Filter, FilterDefs, FilterImpls } from "src/components/Filters";
import { Icon } from "src/components/Icon";
import { ToggleChip } from "src/components/ToggleChip";
import { Css } from "src/Css";
import { SelectField } from "src/inputs/SelectField";
import { Value } from "src/inputs/Value";
import { omitKey, safeEntries, safeKeys, useTestIds } from "src/utils";

function updateFilter<F, K extends keyof F>(currentFilter: F, key: K, value: F[K] | undefined): F {
  if (value === undefined) {
    return omitKey(key, currentFilter);
  } else {
    return { ...currentFilter, [key]: value };
  }
}

/** Convert FilterDefs to FilterImpls by evaluating the factory functions */
function buildFilterImpls<F extends Record<string, unknown>>(filterDefs: FilterDefs<F>): FilterImpls<F> {
  return Object.fromEntries(safeEntries(filterDefs).map(([key, fn]) => [key, fn(key as string)])) as FilterImpls<F>;
}

/** Calculate the number of active (non-undefined) filters */
function getActiveFilterCount<F extends Record<string, unknown>>(filter: F): number {
  return safeKeys(filter).filter((key) => filter[key] !== undefined).length;
}

/**
 * FilterDropdownMenu is a newer filter UI pattern that shows a "Filter" button
 * which expands to reveal filter controls in a row below, with chips displayed
 * when closed to indicate active filters.
 *
 * Note: We expect the existing `Filters` component to eventually become
 * `FilterDropdownMenu`, but it hasn't been rolled out everywhere yet.
 */
interface FilterDropdownMenuProps<F extends Record<string, unknown>, G extends Value = string> {
  /** List of filters */
  filterDefs: FilterDefs<F>;
  /** The current filter value. */
  filter: F;
  /** Called when the filters have changed. */
  onChange: (filter: F) => void;
  groupBy?: {
    /** The current group by value. */
    value: G;
    /** Called when the group by have changed. */
    setValue: (groupBy: G) => void;
    /** The list of group by options. */
    options: Array<{ id: G; name: string }>;
  };
}

function FilterDropdownMenu<F extends Record<string, unknown>, G extends Value = string>(
  props: FilterDropdownMenuProps<F, G>,
) {
  const { filter, onChange, filterDefs, groupBy } = props;
  const testId = useTestIds(props, "filter");

  const [isOpen, setIsOpen] = useState(false);

  // Calculate the number of active filters for badge count
  const activeFilterCount = useMemo(() => getActiveFilterCount(filter), [filter]);

  // Convert FilterDefs to FilterImpls
  const filterImpls = useMemo(() => buildFilterImpls(filterDefs), [filterDefs]);

  // Render all filters, with non-checkbox filters first, then checkbox filters
  const renderFilters = () => {
    const entries = safeEntries(filterImpls);
    const nonCheckbox = entries.filter(([_, f]) => !f.hideLabelInModal);
    const checkbox = entries.filter(([_, f]) => f.hideLabelInModal);

    return [...nonCheckbox, ...checkbox].map(([key, f]: [keyof F, Filter<any>]) => (
      <div key={key as string}>
        {f.render(filter[key], (value) => onChange(updateFilter(filter, key, value)), testId, false, false)}
      </div>
    ));
  };

  return (
    <>
      <div>
        <Button
          label="Filter"
          icon="filter"
          size="md"
          endAdornment={
            <div css={Css.df.aic.gap1.$}>
              {activeFilterCount > 0 && <CountBadge count={activeFilterCount} />}
              <Icon icon={isOpen ? "chevronUp" : "chevronDown"} />
            </div>
          }
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
          {...testId.button}
        />
      </div>

      {/* When open, show all filter controls in a new row below */}
      {isOpen && (
        <div css={Css.df.aic.fww.gap1.order(1).$}>
          {groupBy && (
            <SelectField
              label="Group by"
              compact
              labelStyle="inline"
              sizeToContent
              options={groupBy.options}
              getOptionValue={(o) => o.id}
              getOptionLabel={(o) => o.name}
              value={groupBy.value}
              onSelect={(g) => g && groupBy.setValue(g)}
            />
          )}

          {/* Render all filters (non-checkbox first, then checkbox) */}
          {renderFilters()}

          {/* Clear button at end of filter controls */}
          {activeFilterCount > 0 && (
            <Button label="Clear" variant="tertiary" onClick={() => onChange({} as F)} {...testId.clearBtn} />
          )}
        </div>
      )}

      {/* Filter chips (and clear button) shown when dropdown is closed */}
      {!isOpen && (
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
  const removeSingleFilter = (key: keyof F) => {
    onChange(updateFilter(filter, key, undefined));
  };

  const removeArrayFilterItem = (key: keyof F, itemToRemove: unknown) => {
    const newArray = (filter[key] as any[]).filter((v) => v !== itemToRemove);
    onChange(updateFilter(filter, key, newArray.length > 0 ? (newArray as any) : undefined));
  };

  const chips = safeEntries(filterImpls).flatMap(([key]) => {
    const value = filter[key];
    if (value === undefined || value === null) return [];

    const getLabel = (v: unknown) => String(v);

    if (Array.isArray(value)) {
      return value.map((item) => {
        const chipKey = `${String(key)}_${item}`;
        return (
          <ToggleChip
            key={chipKey}
            text={getLabel(item)}
            onClick={() => removeArrayFilterItem(key, item)}
            {...testId[`chip_${chipKey}`]}
          />
        );
      });
    }

    return (
      <ToggleChip
        key={String(key)}
        text={getLabel(value)}
        onClick={() => removeSingleFilter(key)}
        {...testId[`chip_${String(key)}`]}
      />
    );
  });

  if (chips.length === 0) return null;

  return (
    <div css={Css.df.gap1.fww.aic.order(1).w100.$}>
      {chips}
      <Button label="Clear" variant="tertiary" onClick={onClear} {...testId.clearBtn} />
    </div>
  );
}

// memo doesn't support generic parameters, so cast the result to the correct type
const _FilterDropdownMenu = memo(FilterDropdownMenu) as typeof FilterDropdownMenu;
export { _FilterDropdownMenu as FilterDropdownMenu };
