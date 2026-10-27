/** One occurrence of an option. The same value can appear under more than one parent, so `key` is unique and `valueKey` is not. */
export type MenuTreeNode<O> = {
  /** Unique within the tree. Equals `valueKey` until that value repeats. */
  key: string;
  /** The option's value. Shared by every copy of that option. */
  valueKey: string;
  option: O;
  parentKey: string | undefined;
  childKeys: string[];
};

/** Occurrences keyed by their unique path. `orderedKeys` is a pre-order walk, i.e. the order rows render in. */
export type MenuTree<O> = {
  nodes: Map<string, MenuTreeNode<O>>;
  orderedKeys: string[];
};

/** Indexes every occurrence in `roots`. A repeated value stays, once under each parent. */
export function buildMenuTree<O>(
  roots: readonly O[],
  getKey: (opt: O) => string,
  getChildren: (opt: O) => readonly O[] | undefined,
): MenuTree<O> {
  const nodes = new Map<string, MenuTreeNode<O>>();
  const orderedKeys: string[] = [];
  function visit(option: O, parentKey: string | undefined): string {
    const valueKey = getKey(option);
    const key = occurrenceKey(parentKey, valueKey, nodes);
    const node: MenuTreeNode<O> = { key, valueKey, option, parentKey, childKeys: [] };
    nodes.set(key, node);
    orderedKeys.push(key);
    for (const child of getChildren(option) ?? []) node.childKeys.push(visit(child, key));
    return key;
  }
  roots.forEach((root) => visit(root, undefined));
  return { nodes, orderedKeys };
}

/** `parent/value` for a repeated value, then `parent/value#2` if that path is taken too. */
function occurrenceKey<O>(
  parentKey: string | undefined,
  valueKey: string,
  nodes: Map<string, MenuTreeNode<O>>,
): string {
  const base = parentKey === undefined ? valueKey : `${parentKey}/${valueKey}`;
  if (!nodes.has(base)) return base;
  let count = 2;
  while (nodes.has(`${base}#${count}`)) count += 1;
  return `${base}#${count}`;
}

/**
 * Expands `valueKeys` to the enabled descendants of every selected value, and every parent whose children are all selected.
 * A value selects each of its copies. Disabled values keep whatever state `valueKeys` gives them.
 */
export function normalizeTreeSelection<O>(
  tree: MenuTree<O>,
  valueKeys: Iterable<string>,
  disabledKeys: ReadonlySet<string>,
): Set<string> {
  const selected = new Set<string>();
  for (const valueKey of valueKeys) {
    const nodes = nodesWithValue(tree, valueKey);
    if (nodes.length === 0) continue;
    selected.add(valueKey);
    for (const node of nodes) {
      descendantValueKeys(tree, node)
        .filter((key) => !disabledKeys.has(key))
        .forEach((key) => selected.add(key));
    }
  }
  // Reverse pre-order visits children before their parents.
  for (const key of [...tree.orderedKeys].reverse()) {
    const node = tree.nodes.get(key)!;
    if (isFullySelected(tree, node, selected, disabledKeys)) selected.add(node.valueKey);
  }
  return selected;
}

/** Selects or deselects a value, cascading through every copy, its enabled descendants, and its ancestors. */
export function toggleTreeSelection<O>(
  tree: MenuTree<O>,
  selected: ReadonlySet<string>,
  valueKey: string,
  select: boolean,
  disabledKeys: ReadonlySet<string>,
): Set<string> {
  const next = new Set(selected);
  const nodes = nodesWithValue(tree, valueKey);
  const affected = new Set<string>([valueKey]);
  for (const node of nodes) {
    descendantValueKeys(tree, node)
      .filter((key) => !disabledKeys.has(key))
      .forEach((key) => affected.add(key));
  }
  affected.forEach((key) => (select ? next.add(key) : next.delete(key)));
  const seen = new Set<string>();
  for (const node of nodes) {
    let parentKey = node.parentKey;
    while (parentKey !== undefined && !seen.has(parentKey)) {
      seen.add(parentKey);
      const parent = tree.nodes.get(parentKey)!;
      if (isFullySelected(tree, parent, next, disabledKeys)) next.add(parent.valueKey);
      else next.delete(parent.valueKey);
      parentKey = parent.parentKey;
    }
  }
  return next;
}

/** Occurrence keys of parents with some, but not all, of their descendants selected. */
export function partiallySelectedKeys<O>(tree: MenuTree<O>, selected: ReadonlySet<string>): Set<string> {
  const partial = new Set<string>();
  for (const key of tree.orderedKeys) {
    const node = tree.nodes.get(key)!;
    if (node.childKeys.length === 0 || selected.has(node.valueKey)) continue;
    if (descendantValueKeys(tree, node).some((valueKey) => selected.has(valueKey))) partial.add(key);
  }
  return partial;
}

/** Groups to open with the menu. Every group when `defaultExpanded`, otherwise just the ones holding a selection. */
export function initialExpandedKeys<O>(
  tree: MenuTree<O>,
  selected: ReadonlySet<string>,
  defaultExpanded: boolean,
): Set<string> {
  if (!defaultExpanded) return expandedForSelection(tree, selected);
  const expanded = new Set<string>();
  for (const key of tree.orderedKeys) {
    if (tree.nodes.get(key)!.childKeys.length > 0) expanded.add(key);
  }
  return expanded;
}

/** Parents to expand on open, so that every selected occurrence is visible. Everything else starts collapsed. */
export function expandedForSelection<O>(tree: MenuTree<O>, selected: ReadonlySet<string>): Set<string> {
  const expanded = new Set<string>();
  for (const key of tree.orderedKeys) {
    const node = tree.nodes.get(key)!;
    if (!selected.has(node.valueKey)) continue;
    let parentKey = node.parentKey;
    while (parentKey !== undefined && !expanded.has(parentKey)) {
      expanded.add(parentKey);
      parentKey = tree.nodes.get(parentKey)?.parentKey;
    }
  }
  return expanded;
}

/** The first option for each selected value, in tree order. */
export function selectedTreeOptions<O>(tree: MenuTree<O>, selected: ReadonlySet<string>): O[] {
  const seen = new Set<string>();
  const options: O[] = [];
  for (const key of tree.orderedKeys) {
    const node = tree.nodes.get(key)!;
    if (!selected.has(node.valueKey) || seen.has(node.valueKey)) continue;
    seen.add(node.valueKey);
    options.push(node.option);
  }
  return options;
}

/** A parent counts as selected when every child value is selected or disabled, and at least one is selected. */
function isFullySelected<O>(
  tree: MenuTree<O>,
  node: MenuTreeNode<O>,
  selected: ReadonlySet<string>,
  disabledKeys: ReadonlySet<string>,
): boolean {
  const childValues = node.childKeys.map((key) => tree.nodes.get(key)!.valueKey);
  return (
    childValues.some((key) => selected.has(key)) &&
    childValues.every((key) => selected.has(key) || disabledKeys.has(key))
  );
}

function nodesWithValue<O>(tree: MenuTree<O>, valueKey: string): MenuTreeNode<O>[] {
  return tree.orderedKeys.map((key) => tree.nodes.get(key)!).filter((node) => node.valueKey === valueKey);
}

function descendantValueKeys<O>(tree: MenuTree<O>, node: MenuTreeNode<O>): string[] {
  return node.childKeys.flatMap((key) => {
    const child = tree.nodes.get(key)!;
    return [child.valueKey, ...descendantValueKeys(tree, child)];
  });
}
