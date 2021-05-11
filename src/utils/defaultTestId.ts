import { camelCase } from "change-case";

/**
 * Guesses an id based on a label string, i.e. given `Homeowner Contract`,
 * returns `homeownerContract`.
 *
 * This is useful for our (non-bound) form fields that will probably have a label,
 * but may not have an data-testid set by the encompassing page.
 */
export function defaultTestId(label: string): string {
  return camelCase(label);
}
