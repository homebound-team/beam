// Own properties added by scrollWindowWithAnchor / mockDocumentViewport in rtlUtils.tsx.
const documentElementDimensionProps = ["clientHeight", "scrollHeight", "clientWidth"] as const;

/** Reset window scroll position and document scroll mocks before each test. */
export function resetWindowScroll(): void {
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  for (const prop of documentElementDimensionProps) {
    // Drop test mocks only — jsdom's prototype getters remain; no-op if never mocked.
    Reflect.deleteProperty(document.documentElement, prop);
  }
}
