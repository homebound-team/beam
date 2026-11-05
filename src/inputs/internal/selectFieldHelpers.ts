import type { Key } from "@react-types/shared";
import { valueToKey, type Value } from "src/inputs/Value";

/** Lazy-loaded options: the current selection, plus a loader for the full list. */
export type OptionsOrLoad<O> =
  | O[]
  | {
      /** The initial option(s) to show before the user interacts with the dropdown. */
      current: O | O[] | undefined;
      /** Fired when the user interacts with the dropdown, to load the real options. */
      load: () => Promise<unknown>;
      /** The full list of options, after load() has been fired. */
      options: O[] | undefined;
    };

/**
 * Turns `optionsOrLoad` into the list the field renders, with `unsetLabel` first when set.
 * Pass `getChildren` only when those nodes are rendered. A flat select omits it, so a nested `current` stays on the list and keeps its label.
 */
export function initializeOptions<O, V extends Value>(
  optionsOrLoad: OptionsOrLoad<O>,
  getOptionValue: (opt: O) => V,
  getOptionLabel: (opt: O) => string,
  unsetLabel: string | undefined,
  autoSort: boolean,
  getChildren?: (opt: O) => readonly O[] | undefined,
): O[] {
  const result: O[] = [];
  if (unsetLabel) {
    result.push(unsetOption as unknown as O);
  }

  // Collect user options in a separate array so we can sort them independently
  // while keeping special options (e.g. unsetOption) at their fixed positions
  const userOptions: O[] = [];
  if (Array.isArray(optionsOrLoad)) {
    userOptions.push(...optionsOrLoad);
  } else {
    const { options, current } = optionsOrLoad;
    if (options) {
      userOptions.push(...options);
    }
    // Add `current` when the rendered list does not already show it. `getChildren` counts a nested match, so a tree does not also list that leaf as a root.
    if (current) {
      const toCheck = Array.isArray(current) ? current : [current];
      toCheck.forEach((current) => {
        const value = getOptionValue(current);
        const alreadyListed = options !== undefined && optionsIncludeValue(options, value, getOptionValue, getChildren);
        if (!alreadyListed) {
          userOptions.push(current);
        }
      });
    }
  }

  // Sort user options if autoSort is enabled
  result.push(...(autoSort ? sortOptions(userOptions, getOptionLabel) : userOptions));

  return result;
}

/** A marker option to automatically add an "Unset" option to the start of options. */
export const unsetOption = {};

/**
 * Whether `initializeOptions` would already show `value`.
 * A menu tree passes `getChildren`, so a lazy `current` leaf under a parent is not also added as a root. Flat selects pass nothing, and only the top level counts.
 */
function optionsIncludeValue<O, V extends Value>(
  options: readonly O[],
  value: V,
  getOptionValue: (opt: O) => V,
  getChildren: ((opt: O) => readonly O[] | undefined) | undefined,
): boolean {
  return options.some((option) => {
    if (getOptionValue(option) === value) return true;
    const children = getChildren?.(option);
    return children !== undefined && optionsIncludeValue(children, value, getOptionValue, getChildren);
  });
}

/** Key and optional reason for a disabled option entry. */
export function disabledOptionToKeyedTuple(
  disabledOption: Value | { value: Value; reason: string },
): [Key, string | undefined] {
  if (typeof disabledOption === "object" && disabledOption !== null) {
    return [valueToKey(disabledOption.value), disabledOption.reason];
  } else {
    return [valueToKey(disabledOption), undefined];
  }
}

/** Sorts options alphabetically using getOptionLabel, case-insensitive */
function sortOptions<O>(options: O[], getOptionLabel: (opt: O) => string): O[] {
  return [...options].sort((a, b) => {
    const labelA = getOptionLabel(a).toLowerCase();
    const labelB = getOptionLabel(b).toLowerCase();
    return labelA.localeCompare(labelB);
  });
}
