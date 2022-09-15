import { Css, Icon, useTestIds, Palette } from "src/index";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { useFocusRing } from "react-aria";
import { useId } from "@react-aria/utils";

export interface AccordionProps {
  label?: string;
  title: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  defaultExpanded?: boolean;
  size?: AccordionSize;
  /** Adds a top border (enabled by default) */
  topSection?: boolean;
  /** Adds a bottom border (disabled by default) */
  bottomSection?: boolean;
  /** Used by AccordionList */
  allowMultipleExpanded?: boolean;
  index?: number;
  currentSelectedIndex?: number;
  setCurrentSelectedIndex?: Dispatch<SetStateAction<number | undefined>>;
}

type AccordionSize = "xs" | "s" | "m" | "l";

const accordionSizes: Record<AccordionSize, number> = {
  "xs": 240,
  "s": 360,
  "m": 480,
  "l": 600
}

export function Accordion(props: AccordionProps) {
  const {
    title,
    children,
    size,
    disabled = false,
    defaultExpanded = false,
    topSection = true,
    bottomSection = false,
    label = "accordion",
    allowMultipleExpanded = true,
    index,
    setCurrentSelectedIndex,
    currentSelectedIndex
  } = props;
  const testIds = useTestIds({}, label);
  const id = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { isFocusVisible, focusProps } = useFocusRing();

  useEffect(() => {
    // Handle only one expanded accordion when selected in AccordionList
    if (!allowMultipleExpanded && index !== currentSelectedIndex) {
      setExpanded(false)
    }
  }, [allowMultipleExpanded, currentSelectedIndex, index]);

  return (
    <div
      {...testIds}
      css={
       {...Css.mbPx(4)
        .if(topSection).bt.bGray400
        .if(bottomSection && !(!expanded && isFocusVisible)).bb.$,
        ...(size? Css.wPx(accordionSizes[size]).$ : {})} 
      }
    >
      <button
        {...testIds.summary}
        {...focusProps}
        aria-controls={id}
        aria-expanded={expanded}
        disabled={disabled}
        css={Css.w100.df.addIn(":focus", { outline: "none" }).addIn(":hover", Css.bgGray100.$).if(isFocusVisible).bshFocus.$}
        onClick={() => {
          setExpanded(!expanded)
          if (!allowMultipleExpanded && setCurrentSelectedIndex) setCurrentSelectedIndex(index)
        }}
      >
        <div {...testIds.title} css={Css.p2.baseEm.if(disabled).gray500.$}>
          {title}
        </div>
        <div css={Css.ml("auto").my("auto").prPx(14).$}>
          <span
            css={{
              ...Css.mwPx(24).mhPx(24).pyPx(9).db.tc.cursorPointer.$,
              ...{
                transition: "transform 150ms linear",
                WebkitTransform: expanded ? "translateY(-1px) rotate(180deg)" : "translateY(-1px) rotate(0deg)",
              },
            }}
          >
            <Icon icon="chevronDown" color={disabled ? Palette.Gray500 : Palette.Gray900} />
          </span>
        </div>
      </button>
      <div
        {...testIds.details}
        id={id} 
        aria-hidden={!expanded}
        css={{
          // Use max-height for grow/shrink animation
          ...Css.overflowHidden.maxhPx(1000)
          .add("transition", "max-height 0.25s ease-in-out").$,
          ...(!expanded || disabled ? Css.maxh0.$ : {}),
        }}
      >
        <div css={Css.px2.pb2.pt1.$}>
          {children}
        </div>
      </div>
    </div>
  );
}

interface AccordionListProps {
  accordions: AccordionProps[];
  /** Allows multiple accordions to be expanded simultaneously (enabled by default) */
  allowMultipleExpanded?: boolean;
  size?: AccordionSize;
}

export function AccordionList({ accordions, size, allowMultipleExpanded = true }: AccordionListProps) {
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState<number>();
  return (<>
    {accordions.map((accordionProps, index, arr) => (
      <Accordion
        {...accordionProps}
        key={index}
        label={`accordion${index}`}
        size={size}
        bottomSection={index === arr.length - 1}
        allowMultipleExpanded={allowMultipleExpanded}
        index={index}
        currentSelectedIndex={currentSelectedIndex}
        setCurrentSelectedIndex={setCurrentSelectedIndex}
      />
    ))}
  </>)
}
