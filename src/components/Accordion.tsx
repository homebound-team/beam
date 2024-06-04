import { useId, useResizeObserver } from "@react-aria/utils";
import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  /** Turns the title into a button. If provided, disables expand/collapse on title text */
  titleOnClick?: VoidFunction;
  /** Used by Accordion list. Sets default padding to 0 for nested accordions */
  omitPadding?: boolean;
  /** Styles overrides for padding */
  xss?: X;
  /** Modifies the typography, padding, icon size and background color of the accordion header */
  compact?: boolean;
}

export function Accordion<X extends Only<AccordionXss, X>>(props: AccordionProps<X>) {
  const {
    title,
    children,
    size,
    disabled = false,
    defaultExpanded = false,
    compact = false,
    topBorder = compact ? false : true,
    bottomBorder = false,
    index,
    setExpandedIndex,
    titleOnClick,
    omitPadding = false,
    xss,
  } = props;
  const tid = useTestIds(props, "accordion");
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

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
    if (setExpandedIndex) setExpandedIndex(index);
  }, [index, setExpandedIndex]);

  const touchableStyle = useMemo(
    () => ({
      ...Css.df.jcsb.gapPx(12).aic.p2.baseMd.outline("none").onHover.bgGray100.if(!!titleOnClick).baseSb.$,
      ...(compact && Css.smMd.pl2.prPx(10).py1.bgGray100.mbPx(4).br8.onHover.bgGray200.$),
      ...(compact && !!titleOnClick && Css.br0.$),
      ...(disabled && Css.gray500.$),
      ...(isFocusVisible && Css.boxShadow(`inset 0 0 0 2px ${Palette.Blue700}`).$),
      ...xss,
    }),
    [compact, disabled, isFocusVisible, titleOnClick, xss],
  );

  return (
    <div
      {...tid.container}
      css={{
        ...Css.bcGray300.if(topBorder).bt.if(bottomBorder).bb.$,
        ...(size ? Css.wPx(accordionSizes[size]).$ : {}),
      }}
    >
      {titleOnClick ? (
        <div {...focusProps} aria-controls={id} aria-expanded={expanded} css={Css.df.$}>
          <button {...tid.title} disabled={disabled} css={{ ...touchableStyle, ...Css.fg1.$ }} onClick={titleOnClick}>
            {title}
          </button>
          <button
            {...tid.toggle}
            disabled={disabled}
            css={{ ...touchableStyle, ...Css.px2.jcfe.if(compact).pxPx(10).$ }}
            onClick={toggle}
          >
            <RotatingChevronIcon expanded={expanded} />
          </button>
        </div>
      ) : (
        <button
          {...tid.title}
          {...focusProps}
          aria-controls={id}
          aria-expanded={expanded}
          disabled={disabled}
          css={{ ...Css.w100.$, ...touchableStyle }}
          onClick={toggle}
        >
          <span css={Css.fg1.tal.$}>{title}</span>
          <RotatingChevronIcon expanded={expanded} />
        </button>
      )}
      <div
        {...tid.details}
        id={id}
        aria-hidden={!expanded}
        css={Css.oh.h(contentHeight).add("transition", "height 250ms ease-in-out").$}
      >
        {expanded && (
          <div css={Css.px2.pb2.pt1.if(omitPadding).p0.$} ref={contentRef} {...tid.content}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

function RotatingChevronIcon(props: { expanded: boolean }) {
  return (
    <span
      css={{
        ...Css.fs0.$,
        transition: "transform 250ms linear",
        transform: props.expanded ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <Icon icon="chevronDown" />
    </span>
  );
}

export type AccordionSize = "xs" | "sm" | "md" | "lg";

const accordionSizes: Record<AccordionSize, number> = {
  xs: 240,
  sm: 360,
  md: 480,
  lg: 600,
};
