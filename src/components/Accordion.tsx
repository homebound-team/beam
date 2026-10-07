import { useId } from "@react-aria/utils";
import { type Dispatch, type ReactNode, type SetStateAction, useCallback, useMemo } from "react";
import { useFocusRing } from "react-aria";
import { Css, type Only, type Padding, Tokens, type Xss } from "src/Css";
import { ExpandChevron, expandCollapsePanelStyles, useExpandCollapse } from "src/hooks/useExpandCollapse";
import { useTestIds } from "src/utils/useTestIds";

type AccordionXss = Xss<Padding>;

export type AccordionProps<X = AccordionXss> = {
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
  onToggle?: VoidFunction;
  setExpandedIndex?: Dispatch<SetStateAction<number | undefined>>;
  /** Turns the title into a button. If provided, disables expand/collapse on title text */
  titleOnClick?: VoidFunction;
  /** Used by Accordion list. Sets default padding to 0 for nested accordions */
  omitPadding?: boolean;
  /** Styles overrides for padding */
  xss?: X;
  /** Modifies the typography, padding, icon size and background color of the accordion header */
  compact?: boolean;
};

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
    onToggle,
    omitPadding = false,
    xss,
  } = props;
  const tid = useTestIds(props, "accordion");
  const id = useId();
  const { isFocusVisible, focusProps } = useFocusRing();
  const {
    expanded,
    toggle: toggleExpanded,
    contentRef,
    contentHeight,
  } = useExpandCollapse({
    defaultExpanded,
    disabled,
  });

  const toggle = useCallback(() => {
    toggleExpanded();
    if (setExpandedIndex) setExpandedIndex(index);
    if (onToggle) onToggle();
  }, [toggleExpanded, index, setExpandedIndex, onToggle]);

  const touchableStyle = useMemo(
    () => ({
      ...Css.df.jcsb
        .gapPx(12)
        .aic.p2.md.outline("none")
        .onHover.bgColor(Tokens.NeutralFillHoverSubtle)
        .if(!!titleOnClick).onHover.mdSb.$,
      ...(compact &&
        Css.sm.pl2
          .prPx(10)
          .py1.bgColor(Tokens.NeutralFillHoverSubtle)
          .mbPx(4)
          .br8.onHover.bgColor(Tokens.NeutralFillPressed).$),
      ...(compact && !!titleOnClick && Css.br0.$),
      ...(disabled && Css.color(Tokens.TextDisabled).$),
      ...(isFocusVisible && Css.boxShadow(`inset 0 0 0 2px ${Tokens.FocusRingInset}`).$),
      ...xss,
    }),
    [compact, disabled, isFocusVisible, titleOnClick, xss],
  );

  return (
    <div
      {...tid.container}
      css={{
        ...Css.bc(Tokens.FieldBorderDefault).if(topBorder).bt.if(bottomBorder).bb.$,
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
            <ExpandChevron expanded={expanded} />
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
          <ExpandChevron expanded={expanded} />
        </button>
      )}
      <div {...tid.details} id={id} aria-hidden={!expanded} css={expandCollapsePanelStyles(contentHeight)}>
        {expanded && (
          <div css={Css.px2.pb2.pt1.if(omitPadding).p0.$} ref={contentRef} {...tid.content}>
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
