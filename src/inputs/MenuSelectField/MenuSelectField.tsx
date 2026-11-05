import { type JSX, useMemo } from "react";
import { type OptionsOrLoad, unsetOption } from "src/inputs/internal/selectFieldHelpers";
import { BaseMenuSelectField } from "src/inputs/MenuSelectField/internal/BaseMenuSelectField";
import type { MenuSelectFieldProps } from "src/inputs/MenuSelectField/types";
import type { NestedOption } from "src/inputs/TreeSelectField/utils";
import type { Value } from "src/inputs/Value";

/** Select whose trigger shows the value and opens a menu.
 *
 * Options with `children` are a tree: every node stays visible, and the trigger shows the path. Search is included when the list is longer than `searchOptionLimit`, or when `onSearch` is set. See `MenuSelectField.mdx`. */
export function MenuSelectField<O, V extends Value>(props: MenuSelectFieldProps<O, V>): JSX.Element {
  const { value, proposedValue, onSelect, unsetLabel, options, autoSort, ...rest } = props;
  const nested = optionsHaveChildren(options);
  // An empty value selects the `unsetLabel` row, so the trigger shows `unsetLabel` and the row is checked.
  const values = useMemo(() => {
    if (value !== undefined) return [value];
    return unsetLabel ? [undefined as V] : [];
  }, [value, unsetLabel]);
  const proposedValues = useMemo(() => (proposedValue === undefined ? undefined : [proposedValue]), [proposedValue]);
  return (
    <BaseMenuSelectField
      {...rest}
      options={options}
      unsetLabel={unsetLabel}
      autoSort={autoSort ?? !nested}
      selectionMode="single"
      values={values}
      proposedValues={proposedValues}
      // A hierarchy uses the shared tree menu: every node stays listed and the trigger shows the path. A flat list omits this, so its rows stay regular and it still sorts.
      tree={nested ? { getChildren: menuOptionChildren } : undefined}
      onCommit={(next, opts) => {
        const option = opts[0];
        // The `unsetLabel` row is a sentinel. Callers receive `undefined` for both the value and the option.
        onSelect(next[0], option === unsetOption ? undefined : option);
      }}
    />
  );
}

function optionsHaveChildren<O>(options: OptionsOrLoad<O> | OptionsOrLoad<NestedOption<O>>): boolean {
  const list = Array.isArray(options)
    ? options
    : [
        ...(options.current === undefined ? [] : Array.isArray(options.current) ? options.current : [options.current]),
        ...(options.options ?? []),
      ];
  return list.some((option) => isNestedOption(option) && (option.children?.length ?? 0) > 0);
}

/** `children` from a `NestedOption`. A flat option has none. Module-level so a new `tree` object does not rebuild the menu index. */
function menuOptionChildren<O>(option: O): readonly O[] | undefined {
  return isNestedOption(option) ? option.children : undefined;
}

function isNestedOption<O>(option: O): option is NestedOption<O> {
  return typeof option === "object" && option !== null && "children" in option && Array.isArray(option.children);
}
