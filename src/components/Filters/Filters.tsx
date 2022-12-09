import { memo, useMemo } from "react";
import { Button } from "src/components/Button";
import { Filter, FilterDefs, FilterImpls, FilterModal, filterTestIdPrefix, updateFilter } from "src/components/Filters";
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
  onChange: (filter: F) => void;
  groupBy?: {
    /** The current group by value. */
    value: G;
    /** Called when the group by have changed. */
    setValue: (groupBy: G) => void;
    /** The list of group by options. */
    options: Array<{ id: G; name: string }>;
  };
  /** Specifies the layout of the filters. If not supplied it will use the default (horizontal) layout. Using the 'vertical' layout will also remove the "More Filters" button/modal */
  vertical?: boolean;
  /** Specifies the number of in line filters before more filters modal  */
  numberOfInlineFilters?: number;
}

function Filters<F, G extends Value = string>(props: FilterProps<F, G>) {
  const { filter, onChange, filterDefs, groupBy, vertical = false, numberOfInlineFilters = groupBy ? 2 : 3 } = props;
  const testId = useTestIds(props, filterTestIdPrefix);

  const { openModal } = useModal();
  const [pageFilters, modalFilters] = useMemo(() => {
    // Take the FilterDefs that have a `key => ...` factory and eval it
    const impls = safeEntries(filterDefs).map(([key, fn]) => [key, fn(key as string)]);
    // If we have more than numberOfInlineFilters depending on groupby,
    if (!vertical && impls.length > numberOfInlineFilters + 1) {
      // Then return up to the numberOfInlineFilters, and the remainder in the modal.
      return [
        Object.fromEntries(impls.slice(0, numberOfInlineFilters)) as FilterImpls<F>,
        Object.fromEntries(impls.slice(numberOfInlineFilters)) as FilterImpls<F>,
      ];
    }
    // Otherwise, we don't have enough to show the modal, so only use page filter keys
    return [Object.fromEntries(impls) as FilterImpls<F>, {} as FilterImpls<F>];
  }, [numberOfInlineFilters, filterDefs]);

  const numModalFilters = safeKeys(modalFilters).filter((fk) => filter[fk] !== undefined).length;

  const maybeGroupByField = groupBy ? (
    <div>
      <SelectField
        label="Group by"
        compact={!vertical}
        inlineLabel={!vertical}
        sizeToContent={!vertical}
        options={groupBy.options}
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
        value={groupBy.value}
        onSelect={(g) => g && groupBy.setValue(g)}
      />
    </div>
  ) : null;

  // Return list of filter components. `onSelect` should update the `filter`
  return (
    <div
      css={{
        ...(vertical ? Css.df.fdc.gap2.$ : Css.df.aic.gap1.$),
      }}
      {...testId}
    >
      {maybeGroupByField}

      {safeEntries(pageFilters).map(([key, f]: [keyof F, Filter<any>]) => (
        <div key={key as string}>
          {f.render(filter[key], (value) => onChange(updateFilter(filter, key, value)), testId, false, vertical)}
        </div>
      ))}

      {Object.keys(modalFilters).length > 0 && (
        <Button
          label="More Filters"
          endAdornment={
            numModalFilters > 0 && (
              <span css={Css.wPx(16).hPx(16).fs0.br100.bgLightBlue700.white.tinySb.df.aic.jcc.$}>
                {numModalFilters}
              </span>
            )
          }
          variant="secondary"
          onClick={() =>
            openModal({
              // Spreading `props` to pass along `data-testid`
              content: <FilterModal {...props} filter={filter} onApply={onChange} filters={modalFilters} />,
            })
          }
          {...testId.moreFiltersBtn}
        />
      )}
      {Object.keys(filter).length > 0 && (
        <div>
          <Button label="Clear" variant="tertiary" onClick={() => onChange({} as F)} {...testId.clearBtn} />
        </div>
      )}
    </div>
  );
}

// memo doesn't support generic parameters, so cast the result to the correct type
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-849543638
const _Filters = memo(Filters) as typeof Filters;
export { _Filters as Filters };
