import { Node } from "@react-types/shared";
import { Key } from "react";
import { Value } from "src/inputs/Value";

type FoundOption<O> = { option: NestedOption<O>; parents: NestedOption<O>[] };
export type NestedOption<O> = O & { children?: NestedOption<O>[] };
export type NestedOptionsOrLoad<O> =
  | NestedOption<O>[]
  | { current: NestedOption<O>[]; load: () => Promise<{ options: NestedOption<O>[] }> };
export type LeveledOption<O> = [NestedOption<O>, number];

export type TreeFieldState<O> = {
  inputValue: string;
  filteredOptions: LeveledOption<O>[];
  selectedKeys: Key[];
  selectedOptions: NestedOption<O>[];
  allOptions: NestedOption<O>[];
  optionsLoading: boolean;
  allowCollapsing: boolean;
};

export type TreeSelectResponse<O, V extends Value> = {
  all: { values: V[]; options: O[] };
  leaf: { values: V[]; options: O[] };
  root: { values: V[]; options: O[] };
};

/** Finds an option by Key, and returns it + any parents. */
export function findOption<O, V extends Value>(
  options: NestedOption<O>[],
  key: Key,
  getOptionValue: (o: O) => V,
): FoundOption<O> | undefined {
  // This is technically an array of "maybe FoundRow"
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

export function flattenOptions<O>(o: NestedOption<O>): NestedOption<O>[] {
  return [o, ...(o.children?.length ? o.children.flatMap((oc: NestedOption<O>) => flattenOptions(oc)) : [])];
}

export function isLeveledOption<O>(option: LeveledOption<O> | any): option is LeveledOption<O> {
  return Array.isArray(option) && option.length === 2 && typeof option[1] === "number";
}

export function isLeveledNode<O>(node: Node<O> | Node<LeveledOption<O>>): node is Node<LeveledOption<O>> {
  return isLeveledOption(node.value);
}
