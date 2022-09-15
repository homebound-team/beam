import { useId } from "@react-aria/utils";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { useFocusRing } from "react-aria";
import { Css, Icon, Palette, useTestIds } from "src/index";

export interface AccordionProps {
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
}

export function Accordion(props: AccordionProps) {
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
  } = props;
  const testIds = useTestIds(props, "accordion");
  const id = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { isFocusVisible, focusProps } = useFocusRing();

  useEffect(() => { setExpanded(defaultExpanded); }, [defaultExpanded])

  return (
    <div
      {...testIds.container}
      css={{
        ...Css.bGray400.if(topBorder).bt.if(bottomBorder).bb.$,
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
          ...Css.df.jcsb.gap2.aic.w100.p2.baseEm.outline("none").addIn(":hover", Css.bgGray100.$).$,
          ...(disabled && Css.gray500.$),
          ...(isFocusVisible && Css.boxShadow(`inset 0 0 0 2px ${Palette.LightBlue700}`).$),
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
        css={{
          // Use max-height for grow/shrink animation
          ...Css.overflowHidden.maxhPx(1000).add("transition", `max-height ${expanded? "300ms" : "0"} ease-in-out`).$,
          ...(!expanded || disabled ? Css.maxh0.$ : {}),
        }}
      >
        <div css={Css.px2.pb2.pt1.$}>{children}</div>
      </div>
    </div>
  );
}

export type AccordionSize = "xs" | "s" | "m" | "l";

const accordionSizes: Record<AccordionSize, number> = {
  xs: 240,
  s: 360,
  m: 480,
  l: 600,
};
