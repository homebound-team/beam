import React, { ReactNode, useRef, useState } from "react";
import { mergeProps, useTooltip, useTooltipTrigger } from "react-aria";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import { useTooltipTriggerState } from "react-stately";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

// We combine react-popper and aria-tooltip to makeup the tooltip component for the following reasons:
// Aria can handle all aspects of the tooltip accessibility and rendering it except handling the dynamic positioning aspect
// Popper provides the functionality for positioning the tooltip wrt the trigger element

interface TooltipProps {
  /** The content that shows up when hovered */
  title: ReactNode;
  children: ReactNode;
  placement?: Placement;
  delay?: number;
  disabled?: boolean;
}

export function Tooltip(props: TooltipProps) {
  const { placement, children, title, disabled, delay = 0 } = props;

  const state = useTooltipTriggerState({ delay, isDisabled: disabled });
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerProps, tooltipProps: _tooltipProps } = useTooltipTrigger({ isDisabled: disabled }, state, triggerRef);
  const { tooltipProps } = useTooltip(_tooltipProps, state);
  const tid = useTestIds(props, "tooltip");

  return (
    <>
      <span
        ref={triggerRef}
        {...triggerProps}
        {...(!state.isOpen && typeof title === "string" ? { title } : {})}
        {...tid}
        // Add display contents to prevent the tooltip wrapping element from short-circuiting inherited styles (i.e. flex item positioning)
        // Once the element is `:active`, allow pointer events (i.e. click events) to pass through to the children.
        css={Css.display("contents").addIn(":active", Css.add("pointerEvents", "none").$).$}
        // Adding `draggable` as a hack to allow focus to continue through this element and into its children.
        // This is due to some code in React-Aria that prevents default due ot mobile browser inconsistencies,
        // and the only way they don't prevent default is if the element is draggable.
        // See https://github.com/adobe/react-spectrum/discussions/3058 for discussion related to this issue.
        draggable
        onDragStart={(e) => e.preventDefault()}
      >
        {children}
      </span>
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
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  content: ReactNode;
  placement?: Placement;
}

function Popper({ triggerRef, content, placement = "auto" }: PopperProps) {
  const popperRef = useRef(null);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);
  // Since we use `display: contents;` on the `triggerRef`, then the element.offsetTop/Left/etc all equal `0`. This would make
  // the tooltip show in the top left of the document. So instead, we target either the first child, if available, or the parent element as the tooltip target.
  // It is possible there are no children if the element only has text content, which is the reasoning for the parentElement fallback.
  const targetElement = triggerRef.current ? triggerRef.current.children[0] ?? triggerRef.current.parentElement : null;

  const { styles, attributes } = usePopper(targetElement, popperRef.current, {
    modifiers: [
      { name: "arrow", options: { element: arrowRef } },
      { name: "offset", options: { offset: [0, 5] } },
    ],
    placement,
  });

  return createPortal(
    <div
      ref={popperRef}
      style={styles.popper}
      {...attributes.popper}
      // Add `flex-wrap: wrap` to the first child element in the event we have a flex container as the content of the tooltip.
      // We want to ensure the content can wrap as we have a max-width set on the tooltip.
      css={Css.maxw("320px").bgGray900.white.px1.py("4px").br4.xs.add("zIndex", 999999).addIn(" > *", Css.fww.$).$}
    >
      <div ref={setArrowRef} style={{ ...styles.arrow }} id="arrow" />
      {content}
    </div>,
    document.body,
  );
}

// Helper function to conditionally wrap component with Tooltip if necessary.
export function maybeTooltip(props: Omit<TooltipProps, "children"> & { children: ReactNode }) {
  return props.title ? <Tooltip {...props} /> : <>{props.children}</>;
}

// Helper function for resolving showing the Tooltip text via a 'disabled' prop, or the 'tooltip' prop.
export function resolveTooltip(
  disabled?: boolean | ReactNode,
  tooltip?: ReactNode,
  readOnly?: boolean | ReactNode,
): ReactNode | undefined {
  // If `disabled` is a ReactNode, then return that. Otherwise, return `tooltip`
  return typeof disabled !== "boolean" && disabled
    ? disabled
    : typeof readOnly !== "boolean" && readOnly
    ? readOnly
    : tooltip ?? undefined;
}
