import type { ReactNode } from "react";

// The vitest config aliases "framer-motion" to this module, and "framer-motion-actual" to the real
// package, so every test file sees the same substitution no matter which file loaded it first.
// A `vi.mock` in the setup file could not promise that once test files share a module graph.
export * from "framer-motion-actual";

/** Renders its children immediately, so exit animations never keep elements in the document. */
export function AnimatePresence(props: { children?: ReactNode }) {
  return <div {...props} />;
}
