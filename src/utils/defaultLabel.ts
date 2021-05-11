import { capitalCase } from "change-case";

/**
 * Guesses a label based on an `id`-ish string, i.e. even an id of
 * `homeownerContractId` will return `Homeowner Contract`.
 *
 * This is primarily useful for our `Bound...` controls where we'll
 * have a known id/key for a given form state field.
 */
export function defaultLabel(id: string): string {
  return capitalCase(id).replace(/Ids?$/, "");
}
