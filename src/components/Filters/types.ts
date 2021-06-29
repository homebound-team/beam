import { Key } from "react";
import { MultiSelectFieldProps, SelectFieldProps } from "src/inputs";

export type FilterDefs<F> = { [K in keyof F]: FilterDef<F[K]> };

export type SingleFilterProps<O, V extends Key> = Omit<SelectFieldProps<O, V>, "value" | "onSelect">;
export type MultiFilterProps<O, V extends Key> = Omit<MultiSelectFieldProps<O, V>, "values" | "onSelect">;
export type BooleanOption = [boolean | undefined, string];

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
