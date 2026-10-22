import type { JSX } from "react";
import { BaseMenuSelectField } from "src/inputs/MenuSelectField/internal/BaseMenuSelectField";
import type { MenuSelectFieldBaseProps } from "src/inputs/MenuSelectField/types";
import {
  bucketTreeSelection,
  type NestedOption,
  type TreeSelectionDisplay,
  type TreeSelectResponse,
} from "src/inputs/TreeSelectField/utils";
import type { Value } from "src/inputs/Value";

export type MenuTreeSelectFieldProps<O, V extends Value> = MenuSelectFieldBaseProps<NestedOption<O>, V> & {
  /** Selected values. A parent selects its whole subtree; a parent whose children are all selected is selected too. */
  values: V[];
  /** Values proposed by an AI model; puts the field in AI mode. */
  proposedValues?: V[];
  onSelect: (response: TreeSelectResponse<O, V>) => void;
  /** Which selections the closed field counts. @default all */
  selectionDisplay?: TreeSelectionDisplay;
  /** Start with every group open. Otherwise only groups holding a selection start open. @default false */
  defaultExpanded?: boolean;
};

/** Multi select over nested options, with expandable groups and cascading selection. See `MenuTreeSelectField.mdx`. */
export function MenuTreeSelectField<O, V extends Value>(props: MenuTreeSelectFieldProps<O, V>): JSX.Element {
  const { onSelect, selectionDisplay = "all", defaultExpanded = false, ...rest } = props;
  return (
    <BaseMenuSelectField
      {...rest}
      selectionMode="multiple"
      tree={{ getChildren: getNestedChildren, display: selectionDisplay, defaultExpanded }}
      onCommit={(values, opts) => onSelect(treeSelectResponse(values, opts))}
    />
  );
}

/** `values` and `opts` are every selected node, aligned and in tree order. */
function treeSelectResponse<O, V extends Value>(values: V[], opts: NestedOption<O>[]): TreeSelectResponse<O, V> {
  const valueOf = new Map(opts.map((option, index) => [option, values[index]]));
  const buckets = bucketTreeSelection(opts, (option) => option.children);
  const pack = (nodes: NestedOption<O>[]) => ({
    values: nodes.map((node) => valueOf.get(node)!),
    options: nodes,
  });
  return { all: pack(buckets.all), leaf: pack(buckets.leaf), root: pack(buckets.root) };
}

function getNestedChildren<O>(option: NestedOption<O>): readonly NestedOption<O>[] | undefined {
  return option.children;
}
