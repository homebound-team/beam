import { Key, memo, useCallback, useMemo } from "react";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { MultiSelectField, MultiSelectFieldProps, SelectField, SelectFieldProps } from "src/inputs";
import { omitKey } from "src/utils";

interface FilterProps<F> {
  filter: F;
  /** List of filters */
  filterDefs: FilterDefs<F>;
  /** Callback to execute when the filter fields have been changed */
  onChange: (f: F) => void;
}

function Filters<T>(props: FilterProps<T>) {
  const { filter, onChange, filterDefs } = props;
  const filterKeys = useMemo(() => Object.keys(filterDefs) as (keyof T)[], [filterDefs]);

  const updateFilter = useCallback((currentFilter: T, key: keyof T, value: any | undefined) => {
    if (value === undefined || (Array.isArray(value) && value.length === 0)) {
      onChange(omitKey(key, currentFilter));
    } else {
      onChange({ ...currentFilter, [key]: value });
    }
  }, []);

  const filterComponents = filterKeys.map((key) => {
    const filterDef = filterDefs[key] as any;

    if (filterDef.kind === "boolean") {
      return (
        <SelectField
          {...filterDef}
          value={String(filter[key])}
          inlineLabel
          onSelect={(value) => {
            const parsedValue = value === "undefined" ? undefined : value === "true" ? true : false;
            updateFilter(filter, key, parsedValue);
          }}
        />
      );
    }

    if (filterDef.kind === "single") {
      return (
        <SelectField
          {...filterDef}
          value={filter[key]}
          inlineLabel
          onSelect={(value) => updateFilter(filter, key, value)}
        />
      );
    }

    if (filterDef.kind === "multi") {
      return (
        <MultiSelectField
          {...filterDef}
          values={filter[key] || []}
          inlineLabel
          onSelect={(values) => updateFilter(filter, key, values)}
        />
      );
    }
  });

  // Return list of filter components. `onSelect` should update the `filter`
  return (
    <div css={Css.df.itemsCenter.childGap1.$}>
      {filterComponents.map((c, idx) => (
        <div key={idx}>{c}</div>
      ))}
      <Button
        label="Clear"
        variant="tertiary"
        disabled={Object.keys(filter).length === 0}
        onClick={() => onChange({} as T)}
      />
    </div>
  );
}

// memo doesn't support generic parameters, so cast the result to the correct type
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-849543638
const _Filters = memo(Filters) as typeof Filters;
export { _Filters as Filters };

type SingleFilterProps<O, V extends Key> = Omit<SelectFieldProps<O, V>, "value" | "onSelect">;
export function singleFilter<O, V extends Key>(props: SingleFilterProps<O, V>) {
  return { kind: "single" as const, ...props };
}

type MultiFilterProps<O, V extends Key> = Omit<MultiSelectFieldProps<O, V>, "values" | "onSelect">;
export function multiFilter<O, V extends Key>(props: MultiFilterProps<O, V>) {
  return { kind: "multi" as const, ...props };
}

type BooleanOption = [boolean | undefined, string];
const defaultBooleanOptions: BooleanOption[] = [
  [undefined, "Any"],
  [true, "Yes"],
  [false, "No"],
];

interface BooleanFilterProps {
  options?: BooleanOption[];
  label: string;
}
export function booleanFilter({
  options = defaultBooleanOptions,
  label,
}: BooleanFilterProps): { kind: "boolean" } & SingleFilterProps<BooleanOption, string> {
  return {
    kind: "boolean" as const,
    options,
    label,
    getOptionValue: (o) => String(o[0]),
    getOptionLabel: (o) => o[1],
  };
}

export type FilterDefs<F> = { [K in keyof F]: FilterDef<F[K]> };

// What is V?
// - V might be `string[]` and could be used for a multiselect that getOptionValue returned strings
// - V might be `number[]` and could be used for a multiselect that getOptionValue returned numbers
// - V might be `boolean` and could be used for ...boolFilter...
export type FilterDef<V> = V extends Array<infer U>
  ? U extends Key
    ? { kind: "multi" } & MultiFilterProps<any, U>
    : never
  : V extends boolean | undefined
  ? { kind: "boolean" } & SingleFilterProps<BooleanOption, string>
  : V extends Key
  ? { kind: "single" } & SingleFilterProps<any, V>
  : never;
