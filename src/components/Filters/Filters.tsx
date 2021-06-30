import { memo, useCallback, useMemo } from "react";
import { Button } from "src/components/Button";
import { FilterDefs, FilterModal, getFilterComponents } from "src/components/Filters";
import { useModalContext } from "src/components/Modal";
import { Css } from "src/Css";
import { omitKey, safeEntries, safeKeys } from "src/utils";

interface FilterProps<F> {
  filter: F;
  /** List of filters */
  filterDefs: FilterDefs<F>;
  /** Callback to execute when the filter fields have been changed */
  onChange: (f: F) => void;
}

function Filters<F>(props: FilterProps<F>) {
  const { filter, onChange, filterDefs } = props;
  const { openModal } = useModalContext();
  const [pageFilterDefs, modalFilterDefs] = useMemo(() => {
    const filterEntries = safeEntries(filterDefs);
    // If we have more than 4 filters,
    if (filterEntries.length > 4) {
      // Then return the first three to show on the page, and the remainder for the modal.
      return [
        Object.fromEntries(filterEntries.slice(0, 3)) as FilterDefs<F>,
        Object.fromEntries(filterEntries.slice(3)) as FilterDefs<F>,
      ];
    }
    // Otherwise, we don't have enough to show the modal, so only use page filter keys
    return [filterDefs, {} as FilterDefs<F>];
  }, [filterDefs]);

  const updateFilter = useCallback((currentFilter: F, key: keyof F, value: any | undefined) => {
    if (value === undefined || (Array.isArray(value) && value.length === 0)) {
      onChange(omitKey(key, currentFilter));
    } else {
      onChange({ ...currentFilter, [key]: value });
    }
  }, []);

  const numModalFilters = safeKeys(modalFilterDefs).filter((fk) => filter[fk] !== undefined).length;

  const pageFilters = getFilterComponents<F>({
    filter,
    filterDefs: pageFilterDefs,
    updateFilter,
  });

  // Return list of filter components. `onSelect` should update the `filter`
  return (
    <div css={Css.df.itemsCenter.childGap1.$}>
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
              title: "More Filters",
              content: <FilterModal onApply={onChange} filterDefs={modalFilterDefs} filter={filter} />,
            })
          }
        />
      )}
      {Object.keys(filter).length > 0 && <Button label="Clear" variant="tertiary" onClick={() => onChange({} as F)} />}
    </div>
  );
}

// memo doesn't support generic parameters, so cast the result to the correct type
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-849543638
const _Filters = memo(Filters) as typeof Filters;
export { _Filters as Filters };
