import { Key, memo, useCallback, useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { MultiSelectField, MultiSelectFieldProps, SelectField, SelectFieldProps } from "src/inputs";

interface FilterProps<T extends object> {
  /** List of filters */
  filterDefs: Record<keyof T, FilterDefs>;
  /** Optional callback to execute when the filter fields have been changed */
  onApply?: (f: T) => void;
}

function Filters<T extends object>(props: FilterProps<T>) {
  const { onApply, filterDefs } = props;
  const filterKeys = useMemo(() => Object.keys(filterDefs) as (keyof T)[], []);

  const [filter, setFilter] = useState<T>(
    filterKeys.reduce((acc, key) => {
      const filterDef = filterDefs[key] as FilterDefs;
      switch (filterDef.kind) {
        case "multi":
          filterDef.values.length > 0 && Object.assign(acc, { [key]: filterDef.values });
          break;
        case "single":
          filterDef.value && Object.assign(acc, { [key]: filterDef.value });
          break;
      }
      return acc;
    }, {} as T),
  );
  const [clearFilterTick, setClearFilterTick] = useState<number>(0);

  const updateFilter = useCallback((key: keyof T, value: Key[] | Key, currentFilter: T) => {
    // if the changedFilter's value an empty array, then remove the property all together.
    const newFilter =
      Array.isArray(value) && value.length === 0 ? omitKey(key, currentFilter) : { ...currentFilter, [key]: value };
    setFilter(newFilter);
    onApply && onApply(newFilter);
  }, []);

  const memoComponents = useMemo(() => {
    return filterKeys.map((key) => {
      const filterDef = filterDefs[key] as FilterDefs;

      if (filterDef.kind === "single") {
        return <SelectField {...filterDef} inlineLabel onSelect={(value) => updateFilter(key, value, filter)} />;
      }

      if (filterDef.kind === "multi") {
        return <MultiSelectField {...filterDef} inlineLabel onSelect={(values) => updateFilter(key, values, filter)} />;
      }
    });
  }, [filterKeys, clearFilterTick]);

  // console.log("objectId memoComponents", objectId(memoComponents));
  // console.log("objectId filterKeys", objectId(filterKeys));

  // Return list of filter components. `onSelect` should update the `filter`
  return (
    <div css={Css.df.childGap1.$}>
      {memoComponents.map((c, idx) => (
        <div key={idx}>{c}</div>
      ))}
      <Button
        label="Clear"
        variant="tertiary"
        onClick={() => {
          console.log("clearing out the filters!");
          setFilter({} as T);
          onApply && onApply({} as T);
          setClearFilterTick(clearFilterTick + 1);
        }}
      />
    </div>
  );
}

// memo doesn't support generic parameters, so cast the result to the correct type
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-849543638
const _Filters = memo(Filters) as typeof Filters;
export { _Filters as Filters };

interface SingleSelectFieldFilter<T extends object, V extends Key> extends SelectFieldProps<T, V> {
  kind: "single";
}

interface MultiSelectFieldFilter<T extends object, V extends Key> extends MultiSelectFieldProps<T, V> {
  kind: "multi";
}

type FilterDefs = SingleSelectFieldFilter<object, Key> | MultiSelectFieldFilter<object, Key>;

// Returns object with specified key removed
const omitKey = <T extends object, K extends keyof T>(key: K, { [key]: _, ...obj }: T) => obj as T;

export const objectId = (() => {
  let currentId = 0;
  const map = new WeakMap();
  return (object: object): number => {
    if (!map.has(object)) {
      map.set(object, ++currentId);
    }
    return map.get(object)!;
  };
})();
