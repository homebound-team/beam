import { camelCase } from "change-case";

/**
 * Guesses an id based on a label string, i.e. given `Homeowner Contract`,
 * returns `homeownerContract`.
 *
 * This is useful for our (non-bound) form fields that will probably have a label,
 * but may not have a `data-testid` set by the encompassing page.
 *
 * (Bound form fields typically set their test id from their form-state field's key.)
 */
export function defaultTestId(label: string): string {
  // Strip `m:4` to `m4` to prevent it from becoming `m_4` which our rtl-utils assumes
  // means "the 4th element with a data-testid value of 'm'".
  return camelCase(label.replace(":", ""));
}
