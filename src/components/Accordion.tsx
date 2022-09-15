import { Css, Icon, useTestIds, Palette } from "src/index";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { useFocusRing } from "react-aria";

export interface AccordionProps {
  label?: string;
  title: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  defaultExpanded?: boolean;
  /** Adds a top border (enabled by default)*/
  topSection?: boolean;
  /** Adds a bottom border (disabled by default) */
  bottomSection?: boolean;
  /** Used by AccordionList */
  allowMultipleExpanded?: boolean;
  index?: number;
  currentSelectedIndex?: number;
  setCurrentSelectedIndex?: Dispatch<SetStateAction<number | undefined>>;
}

export function Accordion(props: AccordionProps) {
  const {
    title,
    children,
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
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { isFocusVisible, focusProps } = useFocusRing();
  const testIds = useTestIds({}, label);

  useEffect(() => {
    // Handle only one selection when selected in AccordionList
    if (!allowMultipleExpanded && index !== currentSelectedIndex) {
      setExpanded(false)
    }
  }, [allowMultipleExpanded, currentSelectedIndex, index]);

  return (
    <div
      {...testIds}
      css={Css.mbPx(4).if(topSection).bt.bGray400.if(bottomSection && !(!expanded && isFocusVisible)).bb.$}
    >
      <button
        {...testIds.summary}
        {...focusProps}
        disabled={disabled}
        css={Css.w100.df.addIn(":focus", { outline: "none" }).addIn(":hover", Css.bgGray100.$).if(isFocusVisible).bshFocus.$}
        onClick={() => {
          setExpanded(!expanded)
          console.log()
          if (!allowMultipleExpanded && setCurrentSelectedIndex) setCurrentSelectedIndex(index)
        }}
      >
        <div {...testIds.title} css={Css.p2.baseEm.fw5.if(disabled).gray500.$}>
          {title}
        </div>
        <div css={Css.ml("auto").my("auto").pr1.$}>
          <span
            css={{
              ...Css.mwPx(24).mhPx(24).pyPx(9).db.tc.cursorPointer.$,
              ...{
                transition: "transform 150ms linear",
                WebkitTransform: expanded ? "translateY(-1px) rotate(180deg)" : "translateY(-1px) rotate(0deg)",
              },
            }}
            data-testid="toggle-caret"
          >
            <Icon icon="chevronDown" color={disabled ? Palette.Gray500 : Palette.Gray900} />
          </span>
        </div>
      </button>
      <div
        {...testIds.details}
        css={{
          // Use max-height for grow/shrink animation
          ...Css.overflowHidden.maxhPx(1000)
          // Use transitions to smooth the interaction
          .add("transition", "max-height 0.25s ease-in-out").$,
          // When collapsed, set max-height to 0
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
  /** Allows multiple accordion to be expanded simultaneously (enabled by default)*/
  allowMultipleExpanded?: boolean;
}

export function AccordionList({ accordions, allowMultipleExpanded = true }: AccordionListProps) {
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState<number>();
  return (<>
    {accordions.map((accordionProps, index, arr) => (
      <Accordion
        {...accordionProps}
        label={`accordion${index}`}
        bottomSection={index === arr.length - 1}
        allowMultipleExpanded={allowMultipleExpanded}
        index={index}
        currentSelectedIndex={currentSelectedIndex}
        setCurrentSelectedIndex={setCurrentSelectedIndex}
      />
    ))}
  </>)
}
