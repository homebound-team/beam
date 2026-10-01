import { type JSX, useMemo } from "react";
import { BaseMenuSelectField, type MenuSelectFieldBaseProps } from "src/inputs/MenuSelectField/BaseMenuSelectField";
import type { Value } from "src/inputs/Value";

export type MenuSelectFieldProps<O, V extends Value> = MenuSelectFieldBaseProps<O, V> & {
  value: V | undefined;
  /** Value proposed by an AI model; puts the field in AI mode. */
  proposedValue?: V;
  onSelect: (value: V | undefined, opt: O | undefined) => void;
};

/** Select whose trigger shows the value and opens a menu; search lives inside the menu. See `MenuSelectField.mdx`. */
export function MenuSelectField<O, V extends Value>(props: MenuSelectFieldProps<O, V>): JSX.Element {
  const { value, proposedValue, onSelect, ...rest } = props;
  const values = useMemo(() => (value === undefined ? [] : [value]), [value]);
  const proposedValues = useMemo(() => (proposedValue === undefined ? undefined : [proposedValue]), [proposedValue]);
  return (
    <BaseMenuSelectField
      {...rest}
      selectionMode="single"
      values={values}
      proposedValues={proposedValues}
      onCommit={(next, opts) => onSelect(next[0], opts[0])}
    />
  );
}
