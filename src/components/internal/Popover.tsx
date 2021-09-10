import React, { MutableRefObject } from "react";
import { OverlayContainer, useOverlay } from "react-aria";

interface PopoverProps extends React.PropsWithChildren<any> {
  popoverRef: MutableRefObject<HTMLDivElement | null>;
  positionProps: React.HTMLAttributes<Element>;
  width?: number;
  onClose: () => void;
  isOpen: boolean;
}

/** Popover is used for generating menus and list-boxes */
export function Popover(props: PopoverProps) {
  const { popoverRef, positionProps, width, children, onClose, isOpen } = props;
  const { overlayProps } = useOverlay(
    {
      onClose,
      isOpen,
      isDismissable: true,
      shouldCloseOnInteractOutside: () => {
        // By default when passing `isDismissable: true` then Popover will `stopPropagation` of the PointerDown event, which is used nearly everywhere in React-Aria (like for clicking buttons)
        // We do not want that propagation to be stopped, but we still want the overlay to be dismissable.
        // When providing `isDimissable: true`, then you can also provide this callback function, `shouldCloseOnInteractOutside`
        // By returning `false` in this function it will no longer call `stopPropagation`, but it also will not call `onHide` for us, so we need to call `onClose` ourselves.
        onClose();
        return false;
      },
    },
    popoverRef,
  );

  if (width) {
    positionProps.style = {
      ...positionProps.style,
      width: width,
    };
  }

  return (
    <OverlayContainer>
      <div {...{ ...overlayProps, ...positionProps }} ref={popoverRef}>
        {children}
      </div>
    </OverlayContainer>
  );
}
