import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Detects when content is wider than the space available to it, so a component can react before the
 * content visibly overflows (wraps/clips) — e.g. collapsing a toolbar into an overflow menu.
 *
 * Attach `containerRef` to the element that defines the available space (its `clientWidth` is the
 * room actually granted) and `contentRef` to a `max-content`-width wrapper around the content (its
 * `offsetWidth` is the content's natural width). When the natural width exceeds the available width,
 * `overflows` is `true`.
 *
 * Keep the content mounted (e.g. `visibility: hidden` rather than unmounted) while it's hidden so its
 * natural width stays measurable and the component can recover as space frees up.
 *
 * Measurement runs on mount, when `enabled` flips, and on viewport resize. It deliberately does not
 * observe `containerRef` or re-measure on every commit: if reacting to `overflows` reflows the
 * container (changing its `clientWidth`), observing it would re-trigger the measurement, flip the
 * result, and loop ("Maximum update depth exceeded"). The content's natural width is treated as
 * static after mount.
 *
 * @param enabled When `false`, measurement is skipped and `overflows` is forced to `false`.
 */
export function useContentOverflow(enabled: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  const check = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!enabled || !container || !content) {
      setOverflows(false);
      return;
    }
    setOverflows(content.offsetWidth > container.clientWidth);
  }, [enabled]);

  // Measure pre-paint on mount / when `enabled` flips (avoids a flash of the un-collapsed content),
  // then re-measure on viewport resize. See the note above on why we don't observe `containerRef`.
  useLayoutEffect(() => {
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [check]);

  return { containerRef, contentRef, overflows };
}
