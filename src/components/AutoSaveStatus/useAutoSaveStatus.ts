import { useContext } from "react";
import { AutoSaveStatusContext } from "./AutoSaveStatusProvider";

/**
 * Provides access to the current auto-save status, i.e. idle/saving/done.
 *
 * Applications should generally instrument their network layer, i.e. GraphQL
 * mutations, to automatically update the auto-save status on any wire call,
 * and then just use this `useAutoSaveStatus` to "show spinners" in appropriate
 * places.
 *
 * See the `apolloHooks.ts` file in `internal-frontend` for an example.
 */
export function useAutoSaveStatus() {
  return useContext(AutoSaveStatusContext);
}
