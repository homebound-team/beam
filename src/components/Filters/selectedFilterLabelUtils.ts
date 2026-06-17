import { initializeOptions, OptionsOrLoad } from "src/inputs/internal/ComboBoxBase";
import { flattenOptions, NestedOption, NestedOptionsOrLoad } from "src/inputs/TreeSelectField/utils";
import { Value } from "src/inputs/Value";

/** Resolves a display label for a selected option value (static or lazy-loaded options). */
export function resolveOptionSelectedFilterLabel<O, V extends Value>(
  optionsOrLoad: OptionsOrLoad<O>,
  getOptionValue: (o: O) => V,
  getOptionLabel: (o: O) => string,
  value: V,
): string {
  const options = initializeOptions(optionsOrLoad, getOptionValue, getOptionLabel, undefined, false);
  const match = options.find((o) => getOptionValue(o) === value);
  return match ? getOptionLabel(match) : String(value);
}

/** Resolves a display label for a selected tree option value (static or lazy-loaded options). */
export function resolveTreeSelectedFilterLabel<O, V extends Value>(
  optionsOrLoad: NestedOptionsOrLoad<O>,
  getOptionValue: (o: O) => V,
  getOptionLabel: (o: O) => string,
  value: V,
): string {
  const options = resolveNestedOptions(optionsOrLoad);
  const match = options.flatMap(flattenOptions).find((o) => getOptionValue(o) === value);
  return match ? getOptionLabel(match) : String(value);
}

function resolveNestedOptions<O>(optionsOrLoad: NestedOptionsOrLoad<O>): NestedOption<O>[] {
  if (Array.isArray(optionsOrLoad)) {
    return optionsOrLoad;
  }

  return optionsOrLoad.current ?? [];
}
