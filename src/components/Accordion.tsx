import { useId, useResizeObserver } from "@react-aria/utils";
import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { useFocusRing } from "react-aria";
import { Icon } from "src/components/Icon";
import { Css, Only, Padding, Palette, Xss } from "src/Css";
import { useTestIds } from "src/utils";

type AccordionXss = Xss<Padding>;

export interface AccordionProps<X = AccordionXss> {
  title: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  defaultExpanded?: boolean;
  size?: AccordionSize;
  /** Adds a top border (enabled by default) */
  topBorder?: boolean;
  /** Adds a bottom border (disabled by default) */
  bottomBorder?: boolean;
  /**
   * Used by AccordionList
   * Allows multiple accordions to be expanded simultaneously (enabled by default)
   */
  index?: number;
  setExpandedIndex?: Dispatch<SetStateAction<number | undefined>>;
  /** Used by Accordion list. Sets default padding to 0 for nested accordions */
  omitPadding?: boolean;
  /** Styles overrides for padding */
  xss?: X;
}

export function Accordion<X extends Only<AccordionXss, X>>(props: AccordionProps<X>) {
  const {
    title,
    children,
    size,
    disabled = false,
    defaultExpanded = false,
    topBorder = true,
    bottomBorder = false,
    index,
    setExpandedIndex,
    omitPadding = false,
    xss,
  } = props;
  const testIds = useTestIds(props, "accordion");
  const id = useId();
  const [expanded, setExpanded] = useState(defaultExpanded && !disabled);
  const { isFocusVisible, focusProps } = useFocusRing();
  const contentRef = useRef<HTMLDivElement>(null);
  // On initial render, if the accordion is expanded, then set `height` to auto to avoid unnecessary animation on render.
  const [contentHeight, setContentHeight] = useState(expanded ? "auto" : "0");

  useEffect(() => {
    setExpanded(defaultExpanded && !disabled);
  }, [defaultExpanded, disabled]);

  useEffect(() => {
    // When the `expanded` value changes - If true, it means the Accordion's content has been rendered, Otherwise, it's been hidden
    // Then when the content is displayed, the calculate its height so we can give this value to the container to animate height smoothly.
    // When content is removed, simply set the height back to 0
    setContentHeight(expanded && contentRef.current ? `${contentRef.current.scrollHeight}px` : "0");
  }, [expanded]);

  // Using a resizing observer to check if the content of the accordion changes (i.e. lazy loaded image, auto-sizing textarea, etc..),
  // If it does change, then we need to update the container's height accordingly. Only update the height if the accordion is expanded.
  // Note - This may result in two `setContentHeight` calls when the accordion opens: (1) via the above `useEffect` and (2) in `onResize`
  //        Both `setContentHeight` calls _should_ set the same value, so no unnecessary re-renders would be triggered, making this a harmless additional set call.
  const onResize = useCallback(() => {
    if (contentRef.current && expanded) {
      setContentHeight(`${contentRef.current.scrollHeight}px`);
    }
  }, [expanded, setContentHeight]);
  useResizeObserver({ ref: contentRef, onResize });

  return (
    <div
      {...testIds.container}
      css={{
        ...Css.bGray300.if(topBorder).bt.if(bottomBorder).bb.$,
        ...(size ? Css.wPx(accordionSizes[size]).$ : {}),
      }}
    >
      <button
        {...testIds.title}
        {...focusProps}
        aria-controls={id}
        aria-expanded={expanded}
        disabled={disabled}
        css={{
          ...Css.df.jcsb.gap2.aic.w100.p2.baseMd.outline("none").addIn(":hover", Css.bgGray100.$).$,
          ...(disabled && Css.gray500.$),
          ...(isFocusVisible && Css.boxShadow(`inset 0 0 0 2px ${Palette.LightBlue700}`).$),
          ...xss,
        }}
        onClick={() => {
          setExpanded(!expanded);
          if (setExpandedIndex) setExpandedIndex(index);
        }}
      >
        <span>{title}</span>
        <span
          css={{
            transition: "transform 250ms linear",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <Icon icon="chevronDown" />
        </span>
      </button>
      <div
        {...testIds.details}
        id={id}
        aria-hidden={!expanded}
        css={Css.overflowHidden.h(contentHeight).add("transition", "height 250ms ease-in-out").$}
      >
        {expanded && (
          <div css={Css.px2.pb2.pt1.if(omitPadding).p0.$} ref={contentRef} {...testIds.content}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export type AccordionSize = "xs" | "sm" | "md" | "lg";

const accordionSizes: Record<AccordionSize, number> = {
  xs: 240,
  sm: 360,
  md: 480,
  lg: 600,
};
