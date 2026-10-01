import { createPopper, type Instance, type Modifier } from "@popperjs/core";
import { type RefObject, useLayoutEffect, useRef } from "react";

export type AnchoredPlacement = "bottom-start" | "bottom-end";

export type UseAnchoredPositionOpts = {
  isOpen: boolean;
  /** The overlay's uncapped height; the side is chosen from this so shrinking-to-fit never flip-flops. */
  preferredHeight: number;
  placement?: AnchoredPlacement;
  /** Gap between trigger and overlay, in px. */
  offset?: number;
  /** Keeps the overlay at least as wide as the trigger. */
  matchWidth?: boolean;
  maxHeight?: number;
};

/** Positions `overlayRef` against `triggerRef` with Popper; follows scroll, picks a side, and writes `--menu-max-height`. */
export function useAnchoredPosition(
  triggerRef: RefObject<HTMLElement | null>,
  overlayRef: RefObject<HTMLElement | null>,
  opts: UseAnchoredPositionOpts,
): void {
  const {
    isOpen,
    preferredHeight,
    placement = "bottom-start",
    offset = 4,
    matchWidth = true,
    maxHeight = defaultMaxHeight,
  } = opts;
  const instanceRef = useRef<Instance | undefined>(undefined);
  // Read by the modifier on every update, so a new value never needs a new Popper instance.
  const preferredRef = useRef(preferredHeight);

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const overlay = overlayRef.current;
    if (!isOpen || !trigger || !overlay) return;

    const instance = createPopper(trigger, overlay, {
      strategy: "fixed",
      placement,
      modifiers: [
        // Popper's `flip` measures the already-shrunk overlay, so it bounces between sides; `anchoredSide` replaces it.
        { name: "flip", enabled: false },
        { name: "arrow", enabled: false },
        { name: "offset", options: { offset: [0, offset] } },
        { name: "preventOverflow", options: { padding: viewportPadding, altAxis: false } },
        { name: "computeStyles", options: { gpuAcceleration: true, adaptive: false } },
        anchoredSideModifier(() => preferredRef.current, offset, maxHeight),
        maxHeightWriterModifier,
        ...(matchWidth ? [matchWidthModifier] : []),
      ],
    });
    instanceRef.current = instance;
    // Position synchronously so the first paint is already in place.
    instance.forceUpdate();

    const update = () => void instance.update();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : undefined;
    resizeObserver?.observe(trigger);
    resizeObserver?.observe(overlay);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      resizeObserver?.disconnect();
      window.visualViewport?.removeEventListener("resize", update);
      instance.destroy();
      instanceRef.current = undefined;
    };
  }, [isOpen, placement, offset, matchWidth, maxHeight, triggerRef, overlayRef]);

  useLayoutEffect(() => {
    preferredRef.current = preferredHeight;
    void instanceRef.current?.update();
  }, [preferredHeight]);
}

/** Space kept between the overlay and the viewport edge, in px. */
const viewportPadding = 8;
const defaultMaxHeight = 512;
/** Never squeeze the overlay below this, even with little room on either side. */
const minHeight = 120;

type AnchoredSideData = { maxHeight: number };

function anchoredSideModifier(
  getPreferredHeight: () => number,
  offset: number,
  cap: number,
): Partial<Modifier<"anchoredSide", object>> {
  return {
    name: "anchoredSide",
    enabled: true,
    phase: "main",
    fn({ state, name }) {
      const rect = state.elements.reference.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const below = viewportHeight - rect.bottom - offset - viewportPadding;
      const above = rect.top - offset - viewportPadding;
      const wanted = Math.min(getPreferredHeight(), cap);
      const current = state.placement.startsWith("top") ? "top" : "bottom";
      const currentSpace = current === "top" ? above : below;

      // Stay on the current side while it still fits, so scrolling doesn't flip the overlay back and forth.
      const side =
        wanted <= currentSpace
          ? current
          : wanted <= below
            ? "bottom"
            : wanted <= above
              ? "top"
              : above > below
                ? "top"
                : "bottom";

      const available = side === "top" ? above : below;
      state.modifiersData[name] = {
        maxHeight: Math.round(Math.min(cap, Math.max(minHeight, available))),
      } satisfies AnchoredSideData;

      const align = state.placement.endsWith("end") ? "end" : "start";
      const next = `${side}-${align}` as const;
      if (next !== state.placement) {
        state.placement = next;
        state.reset = true;
      }
    },
  };
}

const maxHeightWriterModifier: Partial<Modifier<"maxHeightWriter", object>> = {
  name: "maxHeightWriter",
  enabled: true,
  phase: "write",
  requires: ["anchoredSide"],
  fn({ state }) {
    const data = state.modifiersData.anchoredSide as AnchoredSideData | undefined;
    if (!data) return;
    const value = `${data.maxHeight}px`;
    const el = state.elements.popper;
    if (el.style.getPropertyValue("--menu-max-height") !== value) {
      el.style.setProperty("--menu-max-height", value);
    }
  },
};

const matchWidthModifier: Partial<Modifier<"matchWidth", object>> = {
  name: "matchWidth",
  enabled: true,
  phase: "beforeWrite",
  requires: ["computeStyles"],
  fn({ state }) {
    state.styles.popper.minWidth = `${state.rects.reference.width}px`;
  },
  effect({ state }) {
    state.elements.popper.style.minWidth = `${(state.elements.reference as HTMLElement).offsetWidth}px`;
  },
};
