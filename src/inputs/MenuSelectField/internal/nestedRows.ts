import type { TreeSelectionDisplay } from "src/inputs/MenuSelectField/types";

/** One visible row of a nested list, with its depth. */
export type NestedRow<T> = { node: T; level: number };

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
