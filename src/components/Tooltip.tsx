import { useTooltipTriggerState } from "@react-stately/tooltip";
import React, { ReactElement, ReactNode, useRef, useState } from "react";
import { mergeProps, useTooltip, useTooltipTrigger } from "react-aria";
import { usePopper } from "react-popper";
import { Css } from "src/Css";

// We combine react-popper and aria-tooltip to makeup the tooltip component for the following reasons:
// Aria can handle all aspects of the tooltip accessibility and rendering it except handling the dynamic positioning aspect
// Popper provides the functionlity for positioning the tooltip wrt the trigger element

interface TooltipProps {
  /** The content that shows up when hovered */
  title: string;
  children: ReactElement;
  placement?: Placement;
  delay?: number;
  disabled?: boolean;
}

export function Tooltip(props: TooltipProps) {
  const state = useTooltipTriggerState({ delay: 0.5, ...props });
  const triggerRef = React.useRef(null);
  const { placement, children, title, disabled } = props;
  const { triggerProps, tooltipProps: _tooltipProps } = useTooltipTrigger(
    { ...props, isDisabled: disabled },
    state,
    triggerRef,
  );
  const { tooltipProps } = useTooltip(_tooltipProps, state);

  return (
    <>
      {React.cloneElement(children, { ref: triggerRef, ...triggerProps })}
      {state.isOpen && (
        <Popper
          {...mergeProps(_tooltipProps, tooltipProps)}
          triggerRef={triggerRef}
          content={title}
          placement={placement}
        />
      )}
    </>
  );
}

// The Placement type is not exported from the react-popper library, the values were taken out from there to create the type here
// As necessary, more values can be pulled in from the ones available in the library
export type Placement = "top" | "bottom" | "left" | "right" | "auto";

interface PopperProps {
  triggerRef: React.MutableRefObject<null>;
  content: ReactNode;
  placement?: Placement;
}

export function Popper({ triggerRef, content, placement = "auto" }: PopperProps) {
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
    <div ref={popperRef} style={styles.popper} {...attributes.popper} css={Css.bgGray900.white.px1.py("4px").br4.xs.$}>
      <div ref={setArrowRef} style={{ ...styles.arrow }} id="arrow" />
      {content}
    </div>
  );
}
