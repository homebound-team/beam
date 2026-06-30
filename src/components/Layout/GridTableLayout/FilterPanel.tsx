import { Button } from "src/components/Button";
import {
  DefinedFilterValue,
  Filter,
  FilterDefs,
  FilterImpls,
  filterTestIdPrefix,
  SelectedFilterLabelValue,
  updateFilter,
} from "src/components/Filters";
import { ToggleChip } from "src/components/ToggleChip";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks";
import { SelectField } from "src/inputs/SelectField";
import { Value } from "src/inputs/Value";
import { useDocumentScrollLayout } from "src/layouts/DocumentScrollLayoutContext";
import { isDefined, safeEntries, safeKeys, useTestIds } from "src/utils";

type FilterPanelProps<F extends Record<string, unknown>, G extends Value = string> = {
  isOpen: boolean;
  groupBy?: {
    value: G;
    setValue: (g: G) => void;
    options: Array<{ id: G; name: string }>;
  };
  filterImpls: FilterImpls<F>;
  filter?: F;
  setFilter?: (filter: F) => void;
  activeFilterCount: number;
  onClear: () => void;
};

export function FilterPanel<F extends Record<string, unknown>, G extends Value = string>({
  isOpen,
  groupBy,
  filterImpls,
  filter,
  setFilter,
  activeFilterCount,
  onClear,
}: FilterPanelProps<F, G>) {
  const { sm } = useBreakpoint();
  const testId = useTestIds({}, filterTestIdPrefix);
  const inDocumentScrollLayout = useDocumentScrollLayout();

  if (isOpen) {
    const filterControls =
      filter && setFilter
        ? (() => {
            const entries = safeEntries(filterImpls);
            const nonCheckbox = entries.filter(([_, f]) => !f.hideLabelInModal);
            const checkbox = entries.filter(([_, f]) => f.hideLabelInModal);
            return [...nonCheckbox, ...checkbox].map(([key, f]: [keyof F, Filter<any>]) => (
              <div key={key as string}>
                {f.render(filter[key], (value) => setFilter(updateFilter(filter, key, value)), testId, false, false)}
              </div>
            ));
          })()
        : null;

    return (
      <div
        style={{ scrollbarWidth: "none" }}
        css={
          sm
            ? Css.df.gap1.aic.oxa.mw0.if(inDocumentScrollLayout).px3.$
            : Css.df.fww.gap1.aic.if(inDocumentScrollLayout).px3.$
        }
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

  if (!filter || !setFilter) return null;

  const chips = safeEntries(filterImpls).flatMap(([key, f]) => chipsForFilterKey(key, f, filter, setFilter, testId));

  if (chips.length === 0) return null;

  return (
    <div css={Css.df.gap1.aic.oxa.mw0.fww.if(inDocumentScrollLayout).pl3.$}>
      {chips}
      <Button label="Clear" variant="tertiary" onClick={onClear} {...testId.clearBtn} />
    </div>
  );
}

export function buildFilterImpls<F extends Record<string, unknown>>(filterDefs: FilterDefs<F>): FilterImpls<F> {
  return Object.fromEntries(safeEntries(filterDefs).map(([key, fn]) => [key, fn(key as string)])) as FilterImpls<F>;
}

export function getActiveFilterCount<F extends Record<string, unknown>>(filter: F): number {
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
