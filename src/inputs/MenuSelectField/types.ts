import type { ReactNode } from "react";
import type { PresentationFieldProps } from "src/components/PresentationContext";
import type { OptionsOrLoad } from "src/inputs/internal/selectFieldHelpers";
import type { Value } from "src/inputs/Value";

/** Props shared by `MenuSelectField`, `MenuMultiSelectField`, and `MenuTreeSelectField`. */
export type MenuSelectFieldBaseProps<O, V extends Value> = {
  label: string;
  /** The full list, or the selected option plus a loader fired the first time the menu opens. */
  options: OptionsOrLoad<O>;
  /** Defaults to `option.id`. */
  getOptionValue?: (opt: O) => V;
  /** String used in the trigger and the option's accessible name. Defaults to `option.name`. */
  getOptionLabel?: (opt: O) => string;
  /** Custom content for the menu row. Falls back to `getOptionLabel`. */
  getOptionMenuLabel?: (opt: O) => ReactNode;
  /** Extra text the menu search matches, in addition to `getOptionLabel`. */
  getOptionSearchText?: (opt: O) => string | readonly string[];
  /** Sort options by `getOptionLabel`. On by default. `MenuTreeSelectField` defaults this to false. */
  autoSort?: boolean;
  /** Debounced menu search text. The caller replaces `options` and should keep the current selection in that list. Closing calls this with `""`. */
  onSearch?: (search: string) => void;
  disabledOptions?: (V | { value: V; reason: string })[];
  /** Shown in the field when nothing is selected, e.g. "All". */
  nothingSelectedText?: string;
  placeholder?: string;
  /** Placeholder for the search input inside the menu. */
  searchPlaceholder?: string;
  /** Whether the field is disabled. If a ReactNode, it's shown as the disabled reason in a tooltip. */
  disabled?: boolean | ReactNode;
  /** Whether the field is read-only. If a ReactNode, it's shown as the read-only reason in a tooltip. */
  readOnly?: boolean | ReactNode;
  required?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  onFocus?: VoidFunction;
  onBlur?: VoidFunction;
} & Pick<
  PresentationFieldProps,
  | "labelStyle"
  | "compact"
  | "borderless"
  | "borderOnHover"
  | "fullWidth"
  | "visuallyDisabled"
  | "errorInTooltip"
  | "inputStylePalette"
>;

export type MenuSelectFieldProps<O, V extends Value> = MenuSelectFieldBaseProps<O, V> & {
  value: V | undefined;
  /** Value proposed by an AI model; puts the field in AI mode. */
  proposedValue?: V;
  onSelect: (value: V | undefined, opt: O | undefined) => void;
  /**
   * When set, `options` are the roots of a hierarchy. The menu lists every node, indented, with no chevrons.
   * The closed field shows the path to the selection, joined with ` > `.
   */
  getChildren?: (opt: O) => readonly O[] | undefined;
};

/** Selection contract the single, multi, and tree fields pass into the shared menu. */
export type MenuSelectControllerProps<O, V extends Value> = MenuSelectFieldBaseProps<O, V> & {
  selectionMode: "single" | "multiple";
  values: V[];
  /** Values proposed by an AI model; puts the field in AI mode. */
  proposedValues?: V[];
  /** For a tree, receives every selected value, including cascaded parents and children. */
  onCommit: (values: V[], opts: O[]) => void;
  /** Makes `options` the roots of a tree, with expandable parents and cascading selection. Multiple selection only. */
  tree?: MenuSelectTreeConfig<O>;
  /** Single select over a hierarchy: every node stays visible, and the trigger shows the path. */
  hierarchy?: MenuSelectHierarchyConfig<O>;
};

export type MenuSelectHierarchyConfig<O> = {
  getChildren: (opt: O) => readonly O[] | undefined;
};

/** Which selected options to surface: every one, only leaves, or only the highest selected ancestors. */
export type TreeSelectionDisplay = "all" | "leaf" | "root";

export type MenuSelectTreeConfig<O> = {
  getChildren: (opt: O) => readonly O[] | undefined;
  /** Which selections the closed field counts. */
  display: TreeSelectionDisplay;
  /** Groups start open. Otherwise only groups holding a selection start open. */
  defaultExpanded: boolean;
};

/** A rendered menu row. `key` identifies the row and `valueKey` identifies the option, so one option can show up more than once. */
export type MenuOptionItem<O> = {
  /** Unique in the list. A flat list will use its "stringified" value as the key. Nested lists could have the same value under multiple groups.
   * For instance, a single option under two different groups gets one path per tag, e.g. `"rough-in/task-1"` and `"electrical/task-1"`. */
  key: string;
  /** Result of `valueToKey(value)`. In a flat list, `valueKey === key`. In a nested list, `valueKey` may be repeated. Selected under one path will select under all paths. */
  valueKey: string;
  option: O;
};
