import { memo, useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { CountBadge } from "src/components/CountBadge";
import {
  buildFilterImpls,
  Filter,
  FilterDefs,
  getActiveFilterCount,
  GroupByConfig,
  renderGroupByField,
  updateFilter,
} from "src/components/Filters";
import { Icon } from "src/components/Icon";
import { ToggleChip } from "src/components/ToggleChip";
import { Css } from "src/Css";
import { Value } from "src/inputs/Value";
import { safeEntries, useTestIds } from "src/utils";

interface FilterDropdownMenuProps<F extends Record<string, unknown>, G extends Value = string> {
  /** List of filters */
  filterDefs: FilterDefs<F>;
  /** The current filter value. */
  filter: F;
  /** Called when the filters have changed. */
  onChange: (filter: F) => void;
  groupBy?: GroupByConfig<G>;
}

function FilterDropdownMenu<F extends Record<string, unknown>, G extends Value = string>(
  props: FilterDropdownMenuProps<F, G>,
) {
  const { filter, onChange, filterDefs, groupBy } = props;
  const testId = useTestIds(props, "filterDropdown");

  const [isOpen, setIsOpen] = useState(false);

  // Calculate the number of active filters for badge count
  const activeFilterCount = useMemo(() => getActiveFilterCount(filter), [filter]);

  // Convert FilterDefs to FilterImpls
  const filterImpls = useMemo(() => buildFilterImpls(filterDefs), [filterDefs]);

  // Remove a specific value from an array filter, or remove entire filter
  const removeFilter = (key: keyof F, valueToRemove?: any) => {
    if (valueToRemove !== undefined && Array.isArray(filter[key])) {
      // Remove specific item from array
      const newArray = (filter[key] as any[]).filter((v) => v !== valueToRemove);
      onChange(updateFilter(filter, key, newArray.length > 0 ? (newArray as any) : undefined));
    } else {
      // Remove entire filter by setting to undefined
      onChange(updateFilter(filter, key, undefined));
    }
  };

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

  // Render filter chips when dropdown is closed
  const renderFilterChips = () => {
    const renderChip = (key: keyof F, value: any, itemToRemove?: any) => {
      const text = String(itemToRemove ?? value);
      const chipKey = itemToRemove !== undefined ? `${String(key)}_${text}` : String(key);
      return (
        <ToggleChip
          key={chipKey}
          text={text.charAt(0).toUpperCase() + text.slice(1)}
          onClick={() => removeFilter(key, itemToRemove)}
          {...testId[`chip_${chipKey}`]}
        />
      );
    };

    const chips = safeEntries(filter)
      .filter(([_, value]) => value !== undefined && value !== null)
      .flatMap(([key]) => {
        const filterImpl = filterImpls[key as keyof F];
        if (!filterImpl) return [];

        const value = filter[key];

        // For arrays, create a separate chip for each value
        if (Array.isArray(value)) {
          return value.map((item) => renderChip(key as keyof F, value, item));
        }

        // For non-array values, create a single chip
        return renderChip(key as keyof F, value);
      });

    if (chips.length === 0) return null;

    return <div css={Css.w100.df.gap1.fww.order(1).$}>{chips}</div>;
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
        <div css={Css.w100.df.aic.fww.gap1.order(1).$}>
          {renderGroupByField(groupBy)}

          {/* Render all filters (non-checkbox first, then checkbox) */}
          {renderFilters()}

          {activeFilterCount > 0 && (
            <div>
              <Button
                label="Clear"
                variant="tertiary"
                onClick={() => {
                  onChange({} as F);
                  setIsOpen(false);
                }}
                {...testId.clearBtn}
              />
            </div>
          )}
        </div>
      )}

      {/* Filter chips shown below when dropdown is closed */}
      {!isOpen && renderFilterChips()}
    </>
  );
}

// memo doesn't support generic parameters, so cast the result to the correct type
const _FilterDropdownMenu = memo(FilterDropdownMenu) as typeof FilterDropdownMenu;
export { _FilterDropdownMenu as FilterDropdownMenu };
