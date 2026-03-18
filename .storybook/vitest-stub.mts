// Stub for vitest when loaded in Storybook's browser environment.
// See main.mts resolve.alias for context.
export const vi = { fn: (...args: any[]) => args[0] ?? (() => {}) };
