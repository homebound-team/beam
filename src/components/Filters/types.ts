import { MultiSelectFieldProps, SelectFieldProps, Value } from "src/inputs";

export type FilterDefs<F> = {
  [K in keyof F]: FilterDef<Exclude<F[K], null | undefined>>;
};

export type SingleFilterProps<O, V extends Value> = Omit<SelectFieldProps<O, V>, "value" | "onSelect"> & {
  defaultValue?: V;
};

export type MultiFilterProps<O, V extends Value> = Omit<MultiSelectFieldProps<O, V>, "values" | "onSelect"> & {
  defaultValue?: V[];
};

export type BooleanOption = [boolean | undefined, string];
export type BooleanFilterProps = SingleFilterProps<BooleanOption, string> & {
  defaultValue?: string;
};

export type ToggleFilterProps = { label: string; enabledValue?: boolean; defaultValue?: boolean };

// What is V?
// - V might be `string[]` and could be used for a multiselect that getOptionValue returned strings
// - V might be `number[]` and could be used for a multiselect that getOptionValue returned numbers
// - V might be `boolean` and could be used for ...boolFilter...

// All of the extra brackets are to avoid `Stage` turning into `Stage.One` | `Stage.Two`:
// https://stackoverflow.com/questions/53996797/typescript-conditional-type-array-of-union-type-distribution
export type FilterDef<V> = [V] extends [boolean | undefined]
  ? ({ kind: "boolean" } & BooleanFilterProps) | ({ kind: "toggle" } & ToggleFilterProps)
  : [V] extends [Value]
  ? { kind: "single" } & SingleFilterProps<any, V>
  : V extends Array<Value>
  ? { kind: "multi" } & MultiFilterProps<any, Value>
  : never;
