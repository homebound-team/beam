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
      shouldCloseOnBlur: false,
      isOpen,
      isDismissable: true,
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
