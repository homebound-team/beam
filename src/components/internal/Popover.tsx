import React, { type MutableRefObject } from "react";
import { DismissButton, OverlayContainer, useOverlay } from "react-aria";
import { contrastDataTheme, useContrastScope } from "src/components/ContrastScope";
import { shouldDismissOverlay } from "src/components/internal/shouldDismissOverlay";

type PopoverProps = {
  triggerRef: MutableRefObject<HTMLElement | null>;
  popoverRef: MutableRefObject<HTMLDivElement | null>;
  positionProps: React.HTMLAttributes<Element>;
  onClose: () => void;
  isOpen: boolean;
} & React.PropsWithChildren<any>;

/** Popover is used for generating menus and list-boxes */
export function Popover(props: PopoverProps) {
  const { triggerRef, popoverRef, positionProps, children, onClose, isOpen, ...others } = props;
  const contrastScopeActive = useContrastScope();
  const { overlayProps } = useOverlay(
    {
      onClose,
      isOpen,
      isDismissable: true,
      shouldCloseOnInteractOutside: (e) => {
        // Returning `true` closes and stops the event. Returning `false` lets it through and does not close.
        if (triggerRef.current?.contains(e)) return true;
        return shouldDismissOverlay(e, triggerRef.current);
      },
      ...others,
    },
    popoverRef,
  );

  return (
    <OverlayContainer>
      <div
        {...{ ...overlayProps, ...positionProps }}
        ref={popoverRef}
        data-theme={contrastScopeActive ? contrastDataTheme : undefined}
      >
        {children}
        <DismissButton onDismiss={() => onClose()} />
      </div>
    </OverlayContainer>
  );
}
