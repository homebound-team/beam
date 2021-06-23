import { Key, memo, useCallback, useMemo } from "react";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { MultiSelectField, MultiSelectFieldProps, SelectField, SelectFieldProps } from "src/inputs";

interface FilterProps<T> {
  filter: T;
  /** List of filters */
  filterDefs: { [K in keyof T]: FilterDef<T[K]> };
  /** Callback to execute when the filter fields have been changed */
  onApply: (f: T) => void;
}

function Filters<T>(props: FilterProps<T>) {
  const { filter, onApply, filterDefs } = props;
  const filterKeys = useMemo(() => Object.keys(filterDefs) as (keyof T)[], [filterDefs]);

  const updateFilter = useCallback((key: keyof T, value: Key[] | Key, currentFilter: T) => {
    const parsedValue = Array.isArray(value) ? value : parseKeyValue(value);

    // if the changedFilter's value an empty array, then remove the property all together.
    const newFilter =
      (Array.isArray(value) && value.length === 0) || parsedValue === undefined
        ? omitKey(key, currentFilter)
        : { ...currentFilter, [key]: parsedValue };

    onApply && onApply(newFilter);
  }, []);

  const memoComponents = useMemo(
    () =>
      filterKeys.map((key) => {
        const filterDef = filterDefs[key] as any;

        if (filterDef.kind === "single") {
          return (
            <SelectField
              {...filterDef}
              value={
                typeof filter[key] === "string" || typeof filter[key] === "number" ? filter[key] : String(filter[key])
              }
              inlineLabel
              onSelect={(value) => updateFilter(key, value, filter)}
            />
          );
        }

        if (filterDef.kind === "multi") {
          return (
            <MultiSelectField
              {...filterDef}
              values={filter[key] || []}
              inlineLabel
              onSelect={(values) => updateFilter(key, values, filter)}
            />
          );
        }
      }),
    [filterKeys, filter],
  );

  // Return list of filter components. `onSelect` should update the `filter`
  return (
    <div css={Css.df.childGap1.$}>
      {memoComponents.map((c, idx) => (
        <div key={idx}>{c}</div>
      ))}
      <Button
        label="Clear"
        variant="tertiary"
        disabled={Object.keys(filter).length === 0}
        onClick={() => {
          onApply && onApply({} as T);
        }}
      />
    </div>
  );
}

// memo doesn't support generic parameters, so cast the result to the correct type
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-849543638
const _Filters = memo(Filters) as typeof Filters;
export { _Filters as Filters };

// Returns object with specified key removed
const omitKey = <T, K extends keyof T>(key: K, { [key]: _, ...obj }: T) => obj as T;

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
}: BooleanFilterProps): { kind: "single" } & SingleFilterProps<BooleanOption, string> {
  return {
    kind: "single" as const,
    options,
    label,
    getOptionValue: (o) => String(o[0]),
    getOptionLabel: (o) => o[1],
  };
}

// What is V?
// - V might be `string[]` and could be used for a multiselect that getOptionValue returned strings
// - V might be `number[]` and could be used for a multiselect that getOptionValue returned numbers
// - V might be `boolean` and could be used for ...boolFilter...
export type FilterDef<V> = V extends Array<infer U>
  ? U extends Key
    ? { kind: "multi" } & MultiFilterProps<any, U>
    : never
  : V extends boolean | undefined
  ? { kind: "single" } & SingleFilterProps<BooleanOption, string>
  : V extends Key
  ? { kind: "single" } & SingleFilterProps<any, V>
  : never;

function parseKeyValue(value: Key): boolean | undefined | Key {
  return value === "undefined" ? undefined : value === "true" ? true : value === "false" ? false : value;
}
