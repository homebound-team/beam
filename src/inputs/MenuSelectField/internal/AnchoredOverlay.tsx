import { type PropsWithChildren, type RefObject, useRef } from "react";
import { DismissButton, FocusScope, useOverlay } from "react-aria";
import { createPortal } from "react-dom";
import { contrastDataTheme, useContrastScope } from "src/components/ContrastScope";
import { shouldDismissOverlay } from "src/components/internal/shouldDismissOverlay";
import { Css } from "src/Css";
import { useAnchoredPosition } from "src/inputs/MenuSelectField/internal/useAnchoredPosition";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";

export type AnchoredOverlayProps = PropsWithChildren<{
  triggerRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: VoidFunction;
}>;

/** Portaled overlay anchored to a trigger; stays open and follows the trigger on scroll. See `docs/components.md`. */
export function AnchoredOverlay(props: AnchoredOverlayProps) {
  const { triggerRef, isOpen, onClose, children } = props;
  const overlayRef = useRef<HTMLDivElement>(null);
  const contrast = useContrastScope();
  const tid = useTestIds(props, "anchoredOverlay");
  const { style: positionStyle, ...positionProps } = useAnchoredPosition(triggerRef, overlayRef, isOpen);

  const { overlayProps } = useOverlay(
    {
      isOpen,
      onClose,
      isDismissable: true,
      // Returning `false` keeps react-aria from swallowing the outside press, so the click still reaches
      // whatever the user pressed; we close ourselves instead.
      shouldCloseOnInteractOutside: (el) => {
        // The trigger toggles itself. Anything else that should dismiss closes here.
        if (!triggerRef.current?.contains(el) && shouldDismissOverlay(el, triggerRef.current)) onClose();
        return false;
      },
    },
    overlayRef,
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      {...overlayProps}
      {...positionProps}
      ref={overlayRef}
      css={overlayCss}
      style={positionStyle}
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

const overlayCss = Css.z(zIndices.popover).$;
