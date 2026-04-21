import { Key as AriaKey, Node } from "@react-types/shared";
import { Value } from "src/inputs/Value";

type FoundOption<O> = { option: NestedOption<O>; parents: NestedOption<O>[] };
export type NestedOption<O> = O & { children?: NestedOption<O>[]; defaultCollapsed?: boolean };
export type NestedOptionsOrLoad<O> =
  | NestedOption<O>[]
  | { current: NestedOption<O>[]; load: () => Promise<{ options: NestedOption<O>[] }> };
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
  allowCollapsing: boolean;
};

export type TreeSelectResponse<O, V extends Value> = {
  all: { values: V[]; options: O[] };
  leaf: { values: V[]; options: O[] };
  root: { values: V[]; options: O[] };
};

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

export function flattenOptions<O>(o: NestedOption<O>): NestedOption<O>[] {
  return [o, ...(o.children?.length ? o.children.flatMap((oc: NestedOption<O>) => flattenOptions(oc)) : [])];
}

export function isLeveledOption<O>(option: LeveledOption<O> | any): option is LeveledOption<O> {
  return Array.isArray(option) && option.length === 2 && typeof option[1] === "number";
}

export function isLeveledNode<O>(node: Node<O> | Node<LeveledOption<O>>): node is Node<LeveledOption<O>> {
  return isLeveledOption(node.value);
}
