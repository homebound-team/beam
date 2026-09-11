import { type MutableRefObject, type RefObject, useRef } from "react";

/**
 * Replaces code like `const ref = passedRef || useRef(null)` which was triggering rules-of-hooks violations. Used
 * to sometimes accept a caller's ref, or if they did not pass one, use an internal one anyway.
 */
export const useGetRef = <T extends HTMLElement>(
  maybeRef: RefObject<T | null> | undefined,
): MutableRefObject<T | null> => {
  const newRef = useRef<T | null>(null);
  return maybeRef || newRef;
};
