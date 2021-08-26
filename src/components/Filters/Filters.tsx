import { memo, useMemo } from "react";
import { Button } from "src/components/Button";
import {
  filterBuilder,
  FilterDefs,
  FilterModal,
  filterTestIdPrefix,
  getFilterComponents,
} from "src/components/Filters";
import { useModal } from "src/components/Modal";
import { Css } from "src/Css";
import { SelectField } from "src/inputs/SelectField";
import { Value } from "src/inputs/Value";
import { safeEntries, safeKeys, useTestIds } from "src/utils";

interface FilterProps<F, G extends Value = string> {
  /** List of filters */
  filterDefs: FilterDefs<F>;
  /** The current filter value. */
  filter: F;
  /** Called when the filters have changed. */
  onChange: (f: F) => void;
  groupBy?: {
    /** The current group by value. */
    value: G;
    /** Called when the group by have changed. */
    setValue: (groupBy: G) => void;
    /** The list of group by options. */
    options: Array<{ id: G; name: string }>;
  };
}

function Filters<F, G extends Value = string>(props: FilterProps<F, G>) {
  const { filter, onChange, filterDefs, groupBy } = props;
  const testId = useTestIds(props, filterTestIdPrefix);

  const { openModal } = useModal();
  const numberOfPageFilters = groupBy ? 2 : 3;
  const [pageFilterDefs, modalFilterDefs] = useMemo(() => {
    const filterEntries = safeEntries(filterDefs);
    // If we have more than 4 filters,
    if (filterEntries.length > numberOfPageFilters + 1) {
      // Then return the first three to show on the page, and the remainder for the modal.
      return [
        Object.fromEntries(filterEntries.slice(0, numberOfPageFilters)) as FilterDefs<F>,
        Object.fromEntries(filterEntries.slice(numberOfPageFilters)) as FilterDefs<F>,
      ];
    }
    // Otherwise, we don't have enough to show the modal, so only use page filter keys
    return [filterDefs, {} as FilterDefs<F>];
  }, [filterDefs]);

  const updateFilter = useMemo(() => filterBuilder(onChange, filterDefs), []);
  const numModalFilters = safeKeys(modalFilterDefs).filter((fk) => filter[fk] !== undefined).length;

  const pageFilters = getFilterComponents<F>({
    // Spreading `props` to pass along `data-testid`
    ...props,
    filterDefs: pageFilterDefs,
    updateFilter,
  });

  const maybeGroupByField = groupBy ? (
    <div>
      <SelectField
        label="Group by"
        compact={true}
        inlineLabel={true}
        sizeToContent={true}
        options={groupBy.options}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        value={groupBy.value}
        onSelect={(g) => groupBy.setValue(g)}
      />
    </div>
  ) : null;

  // Return list of filter components. `onSelect` should update the `filter`
  return (
    <div css={Css.df.itemsCenter.childGap1.$} {...testId}>
      {maybeGroupByField}
      {pageFilters.map((c, idx) => (
        <div key={idx}>{c}</div>
      ))}
      {Object.keys(modalFilterDefs).length > 0 && (
        <Button
          label="More Filters"
          endAdornment={
            numModalFilters > 0 && (
              <span css={Css.wPx(16).hPx(16).fs0.br100.bgLightBlue700.white.tinyEm.df.itemsCenter.justifyCenter.$}>
                {numModalFilters}
              </span>
            )
          }
          variant="secondary"
          onClick={() =>
            openModal({
              // Spreading `props` to pass along `data-testid`
              content: <FilterModal {...props} onApply={onChange} filterDefs={modalFilterDefs} filter={filter} />,
            })
          }
          {...testId.moreFiltersBtn}
        />
      )}
      {Object.keys(filter).length > 0 && (
        <Button label="Clear" variant="tertiary" onClick={() => onChange({} as F)} {...testId.clearBtn} />
      )}
    </div>
  );
}

// memo doesn't support generic parameters, so cast the result to the correct type
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-849543638
const _Filters = memo(Filters) as typeof Filters;
export { _Filters as Filters };
