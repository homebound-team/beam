import { camelCase } from "change-case";

/**
 * Guesses an id based on a label string.
 *
 * This is useful for our form fields that will probably have a label,
 * but may not have an data-testid set by the encompassing page.
 */
export function defaultTestId(label: string): string {
  return camelCase(label);
}
