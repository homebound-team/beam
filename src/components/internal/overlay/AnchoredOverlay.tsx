import { type PropsWithChildren, type RefObject, useRef } from "react";
import { DismissButton, FocusScope, useOverlay } from "react-aria";
import { createPortal } from "react-dom";
import { contrastDataTheme, useContrastScope } from "src/components/ContrastScope";
import { type AnchoredPlacement, useAnchoredPosition } from "src/components/internal/overlay/useAnchoredPosition";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";

export type AnchoredOverlayProps = PropsWithChildren<{
  triggerRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: VoidFunction;
  /** The overlay's uncapped height, used to choose above vs. below the trigger. */
  preferredHeight: number;
  placement?: AnchoredPlacement;
  matchWidth?: boolean;
}>;

/** Portaled overlay anchored to a trigger; stays open and follows the trigger on scroll. See `docs/components.md`. */
export function AnchoredOverlay(props: AnchoredOverlayProps) {
  const { triggerRef, isOpen, onClose, preferredHeight, placement, matchWidth, children } = props;
  const overlayRef = useRef<HTMLDivElement>(null);
  const contrast = useContrastScope();
  const tid = useTestIds(props, "anchoredOverlay");

  useAnchoredPosition(triggerRef, overlayRef, { isOpen, preferredHeight, placement, matchWidth });

  const { overlayProps } = useOverlay(
    {
      isOpen,
      onClose,
      isDismissable: true,
      // Returning `false` keeps react-aria from swallowing the outside press, so the click still reaches
      // whatever the user pressed; we close ourselves instead.
      shouldCloseOnInteractOutside: (el) => {
        if (shouldDismissOnInteract(el, triggerRef.current)) onClose();
        return false;
      },
    },
    overlayRef,
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      {...overlayProps}
      ref={overlayRef}
      css={overlayCss}
      data-theme={contrast ? contrastDataTheme : undefined}
      {...tid.overlay}
    >
      {/* A child scope, so a containing modal's `FocusScope contain` allows focus in this portal. */}
      <FocusScope>
        {children}
        <DismissButton onDismiss={onClose} />
      </FocusScope>
    </div>,
    document.body,
  );
}

/** Whether pressing `el` (outside the overlay) should close it. */
export function shouldDismissOnInteract(el: Element, trigger: HTMLElement | null): boolean {
  // The trigger toggles itself.
  if (trigger?.contains(el)) return false;
  if (el.closest(".tribute-container") || el.closest("[role='alert']")) return false;
  // A dialog layered on top of us shouldn't close us; the dialog we live in should.
  const dialog = el.closest("[role='dialog']");
  if (dialog && !(trigger && dialog.contains(trigger))) return false;
  return true;
}

// Popper's `hide` modifier sets `data-popper-reference-hidden` when the trigger is scrolled out of its container.
const overlayCss = Css.fixed.top0.left0.z(zIndices.popover).when("[data-popper-reference-hidden]").visibility("hidden")
  .pen.$;
