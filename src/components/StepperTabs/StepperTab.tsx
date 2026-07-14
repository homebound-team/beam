import { useMemo, useRef } from "react";
import { mergeProps, useButton, useFocusRing, useHover, VisuallyHidden } from "react-aria";
import { Icon } from "src/components/Icon";
import { Css, Properties } from "src/Css";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type StepperTabProps = {
  label: string;
  value: string;
  /** Whether this is the currently-selected step. */
  active: boolean;
  /** Whether this step's content has been completed. */
  completed: boolean;
  onClick: (value: string) => void;
  disabled?: boolean;
  /** Collapses the tab down to its colored bottom border only, hiding the label — for narrow/many-tab layouts. */
  collapsed?: boolean;
};

export function StepperTab(props: StepperTabProps) {
  const { label, value, active, completed, onClick, disabled = false, collapsed = false } = props;
  // Collapsed tabs are a passive indicator bar, not an actionable control — same as `disabled`, they shouldn't be clickable or focusable.
  const ariaProps = { onPress: () => onClick(value), isDisabled: disabled || collapsed };
  const ref = useRef(null);
  const { buttonProps } = useButton(ariaProps, ref);
  const { isFocusVisible, focusProps } = useFocusRing();
  const { hoverProps, isHovered } = useHover(ariaProps);
  const tid = useTestIds(props, "stepperTab");

  const { baseStyles, stateStyles, hoverStyles, focusRingStyles, disabledStyles, getCollapsedStyles } = useMemo(
    () => getStepperTabStyles(),
    [],
  );

  return (
    <button
      ref={ref}
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      aria-label={label}
      css={{
        ...baseStyles,
        ...stateStyles(active, completed),
        ...(isHovered && !disabled ? hoverStyles : {}),
        ...(collapsed ? getCollapsedStyles(active, completed) : {}),
        ...(disabled ? disabledStyles : {}),
        ...(isFocusVisible ? focusRingStyles : {}),
      }}
      {...tid[defaultTestId(value)]}
    >
      {!collapsed && (
        <>
          <span css={Css.lineClamp1.$}>{label}</span>
          {completed && (
            <span css={Css.fs0.ml1.$}>
              <Icon icon="check" inc={2.5} {...tid.check} />
            </span>
          )}
          <VisuallyHidden>{completed ? "Complete" : "Not Complete"}</VisuallyHidden>
        </>
      )}
    </button>
  );
}

function getStepperTabStyles() {
  const withBorderBottom = (color: Properties) => ({
    ...Css.bb.add("borderBottomWidth", `6px`).$,
    ...color,
  });

  // Blue once either completed or active; bold only while active.
  const stateStyles = (active: boolean, completed: boolean): Properties => ({
    ...Css.gray400.if(active || completed).blue700.if(active).smSb.$,
    ...withBorderBottom(active || completed ? Css.bcBlue600.$ : Css.bcGray300.$),
  });

  // All 4 prior states rendered identically on hover — this was never state-dependent.
  const hoverStyles: Properties = Css.bgGray100.$;

  // Collapsed: only a completed-and-not-currently-active step keeps a blue border.
  const getCollapsedStyles = (active: boolean, completed: boolean): Properties => ({
    ...Css.cursor("default").hPx(0).py0.$,
    ...(completed && !active ? Css.bcBlue600.$ : Css.bcGray300.$),
  });

  return {
    baseStyles: Css.df.aic.fg1.py1.prPx(12).plPx(24).sm.br0.$,
    stateStyles,
    hoverStyles,
    focusRingStyles: Css.bshFocus.$,
    // Disabled always wins over both the state's and the collapsed border color.
    disabledStyles: { ...Css.gray400.cursorNotAllowed.$, ...Css.bcGray300.$ },
    getCollapsedStyles,
  };
}
