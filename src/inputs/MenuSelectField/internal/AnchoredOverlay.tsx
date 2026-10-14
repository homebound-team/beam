import { type PropsWithChildren, type RefObject, useRef } from "react";
import { FocusScope } from "react-aria";
import { Popover } from "src/components/internal/Popover";
import { shouldDismissOverlay } from "src/components/internal/shouldDismissOverlay";
import { useAnchoredPosition } from "src/inputs/MenuSelectField/internal/useAnchoredPosition";
import { useTestIds } from "src/utils/useTestIds";

export type AnchoredOverlayProps = PropsWithChildren<{
  triggerRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: VoidFunction;
}>;

/** Portaled overlay anchored to a trigger; stays open and follows the trigger on scroll. See `docs/components.md`. */
export function AnchoredOverlay(props: AnchoredOverlayProps) {
  const { triggerRef, isOpen, onClose, children } = props;
  const popoverRef = useRef<HTMLDivElement>(null);
  const tid = useTestIds(props, "anchoredOverlay");
  const positionProps = useAnchoredPosition(triggerRef, popoverRef, isOpen);

  if (!isOpen) return null;

  return (
    <Popover
      triggerRef={triggerRef}
      popoverRef={popoverRef}
      positionProps={{ ...positionProps, ...tid.overlay }}
      onClose={onClose}
      isOpen={isOpen}
      // Close ourselves and return false so the interaction still reaches the target.
      shouldCloseOnInteractOutside={(el: Element) => {
        if (!triggerRef.current?.contains(el) && shouldDismissOverlay(el, triggerRef.current)) onClose();
        return false;
      }}
    >
      {/* A child scope, so a containing modal's `FocusScope contain` allows focus in this portal. */}
      <FocusScope>{children}</FocusScope>
    </Popover>
  );
}
