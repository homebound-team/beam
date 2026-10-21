import type { ReactNode } from "react";
import type { PresentationFieldProps } from "src/components/PresentationContext";
import type { OptionsOrLoad } from "src/inputs/internal/selectFieldHelpers";
import type { TreeSelectionDisplay } from "src/inputs/TreeSelectField/utils";
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
};

export type MenuSelectTreeConfig<O> = {
  getChildren: (opt: O) => readonly O[] | undefined;
  /** Which selections the closed field counts. */
  display: TreeSelectionDisplay;
};

/** One row in the menu list. Flat rows use the value as `key`. A tree row's key is its path, so the same value can show up twice. */
export type MenuCollectionItem<O> = {
  key: string;
  valueKey: string;
  option: O;
};
