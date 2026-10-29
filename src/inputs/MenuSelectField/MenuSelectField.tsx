import { type JSX, useMemo } from "react";
import { unsetOption } from "src/inputs/internal/selectFieldHelpers";
import { BaseMenuSelectField } from "src/inputs/MenuSelectField/internal/BaseMenuSelectField";
import type { MenuSelectFieldProps } from "src/inputs/MenuSelectField/types";
import type { Value } from "src/inputs/Value";

/** Select whose trigger shows the value and opens a menu. Search is included when the list is longer than `searchOptionLimit`, or when `onSearch` is set. See `MenuSelectField.mdx`. */
export function MenuSelectField<O, V extends Value>(props: MenuSelectFieldProps<O, V>): JSX.Element {
  const { value, proposedValue, onSelect, unsetLabel, ...rest } = props;
  // An empty value selects the `unsetLabel` row, so the trigger shows `unsetLabel` and the row is checked.
  const values = useMemo(() => {
    if (value !== undefined) return [value];
    return unsetLabel ? [undefined as V] : [];
  }, [value, unsetLabel]);
  const proposedValues = useMemo(() => (proposedValue === undefined ? undefined : [proposedValue]), [proposedValue]);
  return (
    <BaseMenuSelectField
      {...rest}
      unsetLabel={unsetLabel}
      selectionMode="single"
      values={values}
      proposedValues={proposedValues}
      onCommit={(next, opts) => {
        const option = opts[0];
        // The `unsetLabel` row is a sentinel. Callers receive `undefined` for both the value and the option.
        onSelect(next[0], option === unsetOption ? undefined : option);
      }}
    />
  );
}
