import { useLayoutEffect, type RefObject } from "react";
import { useOverlayPosition } from "react-aria";
import { zIndices } from "src/utils/zIndices";

/** Positions the menu under the trigger. The menu matches the field and is at least 320px wide. Parent scroll moves it; it does not close. */
export function useAnchoredPosition(
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
) {
  const { overlayProps, updatePosition } = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef: popoverRef,
    isOpen,
    shouldFlip: true,
    placement: "bottom start",
    offset: overlayOffset,
    containerPadding: viewportPadding,
    maxHeight: menuMaxHeight,
  });

  // Handle scroll repositioning of the menu
  useLayoutEffect(() => {
    if (!isOpen) return;
    const onScroll = (event: Event) => {
      const target = event.target;
      // A scrolling ancestor of the trigger. The menu is portaled, so scrolling the list does not match.
      if (!(target instanceof Node) || !triggerRef.current || !target.contains(triggerRef.current)) return;
      updatePosition();
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [isOpen, updatePosition, triggerRef]);

  // Runs every render. react-aria rewrites `style.maxHeight` on each reposition, so copy it into `--menu-max-height`.
  useLayoutEffect(() => {
    if (!isOpen) return;
    applyMenuFrame(popoverRef.current, triggerRef.current);
  });

  useLayoutEffect(() => {
    if (!isOpen) return;
    const onResize = () => applyMenuFrame(popoverRef.current, triggerRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, triggerRef, popoverRef]);

  return {
    ...overlayProps,
    style: {
      ...overlayProps.style,
      zIndex: zIndices.popover,
      width: `max(${menuMinWidth}px, var(--menu-field-width, 0px))`,
      minWidth: `${menuMinWidth}px`,
    },
  };
}

/** Gap between the trigger and the overlay, in px. */
const overlayOffset = 4;
/** Space kept between the overlay and the viewport edge, in px. */
const viewportPadding = 8;
/** Cap shared with `MenuPanel`'s `--menu-max-height` fallback. */
const menuMaxHeight = 512;
/** The menu is never narrower than this, even when the field is. */
const menuMinWidth = 320;

/** Copies the menu's max height and the field width the menu matches. */
function applyMenuFrame(overlay: HTMLElement | null, trigger: HTMLElement | null): void {
  if (!overlay) return;
  const height = overlay.style.maxHeight;
  if (height && overlay.style.getPropertyValue("--menu-max-height") !== height) {
    overlay.style.setProperty("--menu-max-height", height);
  }
  if (!trigger) return;
  const fieldWidth = `${trigger.offsetWidth}px`;
  if (overlay.style.getPropertyValue("--menu-field-width") !== fieldWidth) {
    overlay.style.setProperty("--menu-field-width", fieldWidth);
  }
}
