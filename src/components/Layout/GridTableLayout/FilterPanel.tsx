import { Button } from "src/components/Button";
import {
  DefinedFilterValue,
  Filter,
  FilterDefs,
  FilterImpls,
  filterTestIdPrefix,
  getActiveFilterCount,
  SelectedFilterLabelValue,
  updateFilter,
} from "src/components/Filters";
import { ToggleChip } from "src/components/ToggleChip";
import { Css } from "src/Css";
import { Value } from "src/inputs/Value";
import { useDocumentScrollLayout } from "src/layouts/DocumentScrollLayoutContext";
import { isDefined, maybeCall, safeEntries, useTestIds } from "src/utils";
import { GroupByField, GroupByFieldProps } from "./GroupByField";

type FilterPanelProps<F extends Record<string, unknown>, G extends Value = string> = {
  isOpen: boolean;
  groupBy?: GroupByFieldProps<G>;
  filterImpls: FilterImpls<F>;
  filter?: F;
  setFilter?: (filter: F) => void;
  onClear?: () => void;
};

export function FilterPanel<F extends Record<string, unknown>, G extends Value = string>(
  props: FilterPanelProps<F, G>,
) {
  return props.isOpen ? <FilterPanelOpen {...props} /> : <FilterPanelClosed {...props} />;
}

function FilterPanelOpen<F extends Record<string, unknown>, G extends Value = string>({
  groupBy,
  filterImpls,
  filter,
  setFilter,
  onClear,
}: Omit<FilterPanelProps<F, G>, "isOpen">) {
  const tid = useTestIds({}, filterTestIdPrefix);
  const inDocumentScrollLayout = useDocumentScrollLayout();
  const activeFilterCount = getActiveFilterCount(filter ?? {});
  const filterControls = filter && setFilter ? buildFilterControls(filterImpls, filter, setFilter, tid) : null;

  return (
    <div
      css={{
        ...Css.df.aic.gap1.sbwn.$,
        ...Css.ifSm.oxa.mw0.$,
        ...Css.ifMdAndUp.fww.$,
        ...Css.if(inDocumentScrollLayout).px3.$,
      }}
    >
      {groupBy && <GroupByField {...groupBy} />}
      {filterControls}
      {activeFilterCount > 0 && (
        <Button label="Clear" variant="tertiary" onClick={() => maybeCall(onClear)} {...tid.clearBtn} />
      )}
    </div>
  );
}

function FilterPanelClosed<F extends Record<string, unknown>, G extends Value = string>({
  filterImpls,
  filter,
  setFilter,
  onClear,
}: Omit<FilterPanelProps<F, G>, "isOpen" | "groupBy">) {
  const tid = useTestIds({}, filterTestIdPrefix);
  const inDocumentScrollLayout = useDocumentScrollLayout();

  if (!filter || !setFilter) return null;

  const chips = safeEntries(filterImpls).flatMap(([key, f]) => chipsForFilterKey(key, f, filter, setFilter, tid));

  if (chips.length === 0) return null;

  return (
    <div css={Css.df.gap1.aic.mw0.fww.if(inDocumentScrollLayout).pl3.$}>
      {chips}
      <Button label="Clear" variant="tertiary" onClick={() => maybeCall(onClear)} {...tid.clearBtn} />
    </div>
  );
}

export function buildFilterControls<F extends Record<string, unknown>>(
  filterImpls: FilterImpls<F>,
  filter: F,
  setFilter: (f: F) => void,
  testId: ReturnType<typeof useTestIds>,
) {
  const entries = safeEntries(filterImpls);
  const nonCheckbox = entries.filter(([_, f]) => !f.hideLabelInModal);
  const checkbox = entries.filter(([_, f]) => f.hideLabelInModal);
  return [...nonCheckbox, ...checkbox].map(([key, f]: [keyof F, Filter<any>]) => (
    <div key={key as string}>
      {f.render(filter[key], (value) => setFilter(updateFilter(filter, key, value)), testId, false, false)}
    </div>
  ));
}

export function buildFilterImpls<F extends Record<string, unknown>>(filterDefs: FilterDefs<F>): FilterImpls<F> {
  return Object.fromEntries(safeEntries(filterDefs).map(([key, fn]) => [key, fn(key as string)])) as FilterImpls<F>;
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
