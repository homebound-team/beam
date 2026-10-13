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

/** Turns `optionsOrLoad` into a flat option list, with `unsetLabel` prepended when set. */
export function initializeOptions<O, V extends Value>(
  optionsOrLoad: OptionsOrLoad<O>,
  getOptionValue: (opt: O) => V,
  getOptionLabel: (opt: O) => string,
  unsetLabel: string | undefined,
  autoSort: boolean,
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
    // Add the `current` to the list of options in the event it is not already there.
    if (current) {
      const toCheck = Array.isArray(current) ? current : [current];
      toCheck.forEach((current) => {
        const value = getOptionValue(current);
        const found = options && options.find((o) => getOptionValue(o) === value);
        if (!found) {
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
