import type { Breakpoint } from "src/Css";

// jsdom has no layout engine, so `useBreakpoint` is driven by `window.matchMedia`. Fake it: resolve
// each query's `min-width`/`max-width` against a synthetic viewport width, so every breakpoint —
// including compound ones like `mdAndUp`/`smOrMd` — falls out of a single chosen width.

/** The device tiers a test can target; combos like `mdAndUp` resolve naturally from the chosen width. */
export type ViewportSize = Extract<Breakpoint, "sm" | "md" | "lg">;

/** Representative width (px) per tier — sm ≤ 599, md 600–1024, lg ≥ 1025 (see `Breakpoints`). */
const viewportWidths: Record<ViewportSize, number> = { sm: 400, md: 800, lg: 1280 };

/** Set the viewport by device tier, e.g. `setViewport("sm")` for mobile. */
export function setViewport(size: ViewportSize): void {
  const width = viewportWidths[size];
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    const max = /max-width:\s*(\d+)px/.exec(query);
    const min = /min-width:\s*(\d+)px/.exec(query);
    return {
      matches: (!max || width <= Number(max[1])) && (!min || width >= Number(min[1])),
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

/**
 * Restore the default desktop viewport, so a viewport set in one test can't leak into the next.
 * Wired into a global `beforeEach` in `setupTests`. Tests assume desktop unless they opt into a
 * smaller tier with {@link setViewport}.
 */
export function resetViewport(): void {
  setViewport("lg");
}
