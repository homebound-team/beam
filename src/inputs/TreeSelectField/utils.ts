import type { Key as AriaKey, Node } from "@react-types/shared";
import type { Value } from "src/inputs/Value";

type FoundOption<O> = { option: NestedOption<O>; parents: NestedOption<O>[] };
export type NestedOption<O> = O & { children?: NestedOption<O>[]; defaultCollapsed?: boolean };
export type NestedOptionsOrLoad<O> =
  NestedOption<O>[] | { current: NestedOption<O>[]; load: () => Promise<{ options: NestedOption<O>[] }> };
export type LeveledOption<O> = [NestedOption<O>, number];

export type TreeFieldState<O> = {
  inputValue: string;
  searchValue?: string;
  selectedKeys: AriaKey[];
  selectedOptions: NestedOption<O>[];
  /** These are the selected options shown as chips for the current `chipDisplay` mode. */
  selectedChipOptions: NestedOption<O>[];
  /** These are the labels shown as chips for the current `chipDisplay` mode. */
  selectedOptionsLabels: string[];
  allOptions: NestedOption<O>[];
  optionsLoading: boolean;
};

export type TreeSelectResponse<O, V extends Value> = {
  all: { values: V[]; options: O[] };
  leaf: { values: V[]; options: O[] };
  root: { values: V[]; options: O[] };
};

/** Which selected options to surface: every one, only leaves, or only the highest selected ancestors. */
export type TreeSelectionDisplay = "all" | "leaf" | "root";

/** One visible row of a nested list, with its depth. */
export type NestedRow<T> = { node: T; level: number };

/** Finds first option by Key, and returns it + any parents. */
export function findOption<O, V extends Value>(
  options: NestedOption<O>[],
  key: AriaKey,
  getOptionValue: (o: O) => V,
): FoundOption<O> | undefined {
  // This is technically an array of "maybe FoundOption"
  const todo: FoundOption<O>[] = options.map((option) => ({ option, parents: [] }));
  while (todo.length > 0) {
    const curr = todo.pop()!;
    if (getOptionValue(curr.option) === key) {
      return curr;
    } else if (curr.option.children) {
      // Search our children and pass along us as the parent
      todo.push(...curr.option.children.map((option) => ({ option, parents: [...curr.parents, curr.option] })));
    }
  }
  return undefined;
}

/** Finds all options by Key, and returns it + any parents. */
export function findOptions<O, V extends Value>(
  options: NestedOption<O>[],
  key: AriaKey,
  getOptionValue: (o: O) => V,
): FoundOption<O>[] {
  // This is technically an array of "maybe FoundOption"
  const todo: FoundOption<O>[] = options.map((option) => ({ option, parents: [] }));
  const found = [];
  while (todo.length > 0) {
    const curr = todo.pop()!;
    if (getOptionValue(curr.option) === key) {
      found.push(curr);
    } else if (curr.option.children) {
      // Search our children and pass along us as the parent
      todo.push(...curr.option.children.map((option) => ({ option, parents: [...curr.parents, curr.option] })));
    }
  }
  return found;
}

/**
 * Rows to render, in tree order. Without `matches`, children of a collapsed node are hidden.
 * With `matches`, a row stays when it, an ancestor, or a descendant matches; a collapsed node still hides its children.
 */
export function visibleNestedRows<T>(
  roots: readonly T[],
  getChildren: (node: T) => readonly T[] | undefined,
  isExpanded: (node: T) => boolean,
  matches?: (node: T) => boolean,
): NestedRow<T>[] {
  const keep = matches ? matchedNodes(roots, getChildren, matches) : undefined;
  const rows: NestedRow<T>[] = [];
  function visit(node: T, level: number) {
    if (keep && !keep.has(node)) return;
    rows.push({ node, level });
    if (!isExpanded(node)) return;
    for (const child of getChildren(node) ?? []) visit(child, level + 1);
  }
  roots.forEach((root) => visit(root, 0));
  return rows;
}

/** Splits an already-selected list into every selection, the leaves, and the highest selected ancestors. */
export function bucketTreeSelection<T>(
  selected: readonly T[],
  getChildren: (node: T) => readonly T[] | undefined,
): Record<TreeSelectionDisplay, T[]> {
  const covered = new Set<T>();
  for (const node of selected) {
    for (const child of getChildren(node) ?? []) cover(child, getChildren, covered);
  }
  return {
    all: [...selected],
    leaf: selected.filter((node) => !getChildren(node)?.length),
    root: selected.filter((node) => !covered.has(node)),
  };
}

function cover<T>(node: T, getChildren: (node: T) => readonly T[] | undefined, into: Set<T>): void {
  into.add(node);
  for (const child of getChildren(node) ?? []) cover(child, getChildren, into);
}

/** Direct matches, plus their ancestors and descendants. */
function matchedNodes<T>(
  roots: readonly T[],
  getChildren: (node: T) => readonly T[] | undefined,
  matches: (node: T) => boolean,
): Set<T> {
  const direct = new Set<T>();
  const parentOf = new Map<T, T>();
  function walk(node: T, parent: T | undefined) {
    if (parent) parentOf.set(node, parent);
    if (matches(node)) direct.add(node);
    for (const child of getChildren(node) ?? []) walk(child, node);
  }
  roots.forEach((root) => walk(root, undefined));

  const keep = new Set<T>();
  for (const node of direct) {
    keep.add(node);
    for (const child of getChildren(node) ?? []) cover(child, getChildren, keep);
    let parent = parentOf.get(node);
    while (parent) {
      keep.add(parent);
      parent = parentOf.get(parent);
    }
  }
  return keep;
}

export function flattenOptions<O>(o: NestedOption<O>): NestedOption<O>[] {
  return [o, ...(o.children?.length ? o.children.flatMap((oc: NestedOption<O>) => flattenOptions(oc)) : [])];
}

export function isLeveledOption<O>(option: LeveledOption<O> | any): option is LeveledOption<O> {
  return Array.isArray(option) && option.length === 2 && typeof option[1] === "number";
}

export function isLeveledNode<O>(node: Node<O> | Node<LeveledOption<O>>): node is Node<LeveledOption<O>> {
  return isLeveledOption(node.value);
}
