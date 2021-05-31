import { mergeProps } from "@react-aria/utils";
import { useTooltipTriggerState } from "@react-stately/tooltip";
import { TooltipTriggerProps } from "@react-types/tooltip";
import React, { ReactNode, useRef, useState } from "react";
import { useTooltip, useTooltipTrigger } from "react-aria";
import { usePopper } from "react-popper";

function AriaTooltip({ state, ...props }: any) {
  let { tooltipProps } = useTooltip(props, state);

  return <div {...mergeProps(props, tooltipProps)}>{props.children}</div>;
}

// The Placement type is not exported from the react-popper library, the values were taken out from there to create the type here
export type Placement =
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "right-start"
  | "right-end"
  | "left-start"
  | "left-end"
  | "auto"
  | "auto-start"
  | "auto-end"
  | "top"
  | "bottom"
  | "left"
  | "right";

interface PopperProps {
  buttonRef: React.MutableRefObject<null>;
  content: string | ReactNode;
  placement?: Placement;
}

export function Popper({ buttonRef, content, placement = "bottom" }: PopperProps) {
  const popperRef = useRef(null);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(buttonRef.current, popperRef.current, {
    modifiers: [
      {
        name: "arrow",
        options: {
          element: arrowRef,
        },
      },
      {
        name: "offset",
        options: {
          offset: [0, 5],
        },
      },
    ],
    placement,
  });

  return (
    <div ref={popperRef} style={styles.popper} {...attributes.popper}>
      <div ref={setArrowRef} style={styles.arrow} id="arrow" />
      {content}
    </div>
  );
}

interface TooltipProps extends TooltipTriggerProps {
  // the content that shows up when hovered
  tooltipinfo: string | ReactNode;
  children: ReactNode;
  placement?: Placement;
}

export function Tooltip(props: TooltipProps) {
  const state = useTooltipTriggerState(props);
  const ref = React.useRef(null);
  const { placement, children, tooltipinfo } = props;

  const { triggerProps, tooltipProps } = useTooltipTrigger(props, state, ref);

  return (
    <span>
      <button ref={ref} {...triggerProps} {...props}>
        {children}
      </button>
      {state.isOpen && (
        <AriaTooltip state={state} {...tooltipProps}>
          <Popper buttonRef={ref} content={tooltipinfo} placement={placement} />
        </AriaTooltip>
      )}
    </span>
  );
}
