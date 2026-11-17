import type { JSX } from "react";
import { BaseMenuSelectField } from "src/inputs/MenuSelectField/internal/BaseMenuSelectField";
import type { MenuSelectFieldBaseProps, SelectionView } from "src/inputs/MenuSelectField/types";
import type { Value } from "src/inputs/Value";

export type MenuMultiSelectFieldProps<O, V extends Value> = MenuSelectFieldBaseProps<O, V> & {
  values: V[];
  /** Values proposed by an AI model; puts the field in AI mode. */
  proposedValues?: V[];
  onSelect: (values: V[], opts: O[]) => void;
  /** How selections show in the closed field. @default inField */
  selectionView?: SelectionView;
  /**
   * Lists `Add "<search>"` under the matches while the trimmed search matches no option label, ignoring case and accents.
   *
   * Search is always shown. Choosing that row passes the trimmed text, clears the search, and keeps the menu open. It does not call `onSelect`: create the option, then add its value to `values`.
   *
   * In AI mode, `onSelect` first commits the proposal, so the new value is added to it.
   */
  onAddNew?: (value: string) => void;
};

/** Menu select that toggles several values and shows in-field pills by default. Search is included when the list is longer than `searchOptionLimit`, or when `onSearch` or `onAddNew` is set. See `MenuMultiSelectField.mdx`. */
export function MenuMultiSelectField<O, V extends Value>(props: MenuMultiSelectFieldProps<O, V>): JSX.Element {
  const { onSelect, ...rest } = props;
  return <BaseMenuSelectField {...rest} selectionMode="multiple" onCommit={onSelect} />;
}
