import { initializeOptions, type OptionsOrLoad } from "src/inputs/internal/selectFieldHelpers";
import { flattenOptions, type NestedOption } from "src/inputs/TreeSelectField/utils";
import type { Value } from "src/inputs/Value";

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
  optionsOrLoad: OptionsOrLoad<NestedOption<O>>,
  getOptionValue: (o: O) => V,
  getOptionLabel: (o: O) => string,
  value: V,
): string {
  const options = resolveNestedOptions(optionsOrLoad);
  const match = options.flatMap(flattenOptions).find((o) => getOptionValue(o) === value);
  return match ? getOptionLabel(match) : String(value);
}

function resolveNestedOptions<O>(optionsOrLoad: OptionsOrLoad<NestedOption<O>>): NestedOption<O>[] {
  if (Array.isArray(optionsOrLoad)) return optionsOrLoad;
  if (optionsOrLoad.options && optionsOrLoad.options.length > 0) return optionsOrLoad.options;
  const { current } = optionsOrLoad;
  if (!current) return [];
  return Array.isArray(current) ? current : [current];
}
