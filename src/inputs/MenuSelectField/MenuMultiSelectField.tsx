import type { JSX } from "react";
import { BaseMenuSelectField } from "src/inputs/MenuSelectField/internal/BaseMenuSelectField";
import type { MenuSelectFieldBaseProps } from "src/inputs/MenuSelectField/types";
import type { Value } from "src/inputs/Value";

export type MenuMultiSelectFieldProps<O, V extends Value> = MenuSelectFieldBaseProps<O, V> & {
  values: V[];
  /** Values proposed by an AI model; puts the field in AI mode. */
  proposedValues?: V[];
  onSelect: (values: V[], opts: O[]) => void;
};

/** Menu select that toggles several values and shows a count badge instead of the value. Search is included when the list is longer than `searchOptionLimit`, or when `onSearch` is set. See `MenuMultiSelectField.mdx`. */
export function MenuMultiSelectField<O, V extends Value>(props: MenuMultiSelectFieldProps<O, V>): JSX.Element {
  const { onSelect, ...rest } = props;
  return <BaseMenuSelectField {...rest} selectionMode="multiple" onCommit={onSelect} />;
}
