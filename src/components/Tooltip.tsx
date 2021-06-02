import { mergeProps } from "@react-aria/utils";
import { useTooltipTriggerState } from "@react-stately/tooltip";
import React, { ReactElement, ReactNode, useRef, useState } from "react";
import { useTooltip, useTooltipTrigger } from "react-aria";
import { usePopper } from "react-popper";

interface TooltipProps {
  /** the content that shows up when hovered */
  tooltip: ReactNode;
  children: ReactElement;
  placement?: Placement;
  delay?: number;
  isDisabled?: boolean;
}

export function Tooltip(props: TooltipProps) {
  const state = useTooltipTriggerState(props);
  const triggerRef = React.useRef(null);
  const { placement, children, tooltip } = props;

  const { triggerProps, tooltipProps: _tooltipProps } = useTooltipTrigger(props, state, triggerRef);
  const { tooltipProps } = useTooltip(_tooltipProps, state);

  return (
    <>
      {React.cloneElement(children, { ref: triggerRef, ...triggerProps })}
      {state.isOpen && (
        <Popper
          {...mergeProps(_tooltipProps, tooltipProps)}
          triggerRef={triggerRef}
          content={tooltip}
          placement={placement}
        />
      )}
    </>
  );
}

// The Placement type is not exported from the react-popper library, the values were taken out from there to create the type here
export type Placement = "top" | "bottom" | "left" | "right";

interface PopperProps {
  triggerRef: React.MutableRefObject<null>;
  content: ReactNode;
  placement?: Placement;
}

export function Popper({ triggerRef, content, placement = "bottom" }: PopperProps) {
  const popperRef = useRef(null);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(triggerRef.current, popperRef.current, {
    modifiers: [
      { name: "arrow", options: { element: arrowRef } },
      { name: "offset", options: { offset: [0, 5] } },
    ],
    placement,
  });

  return (
    <div ref={popperRef} style={styles.popper} {...attributes.popper}>
      <div ref={setArrowRef} style={{ ...styles.arrow }} id="arrow" />
      {content}
    </div>
  );
}
