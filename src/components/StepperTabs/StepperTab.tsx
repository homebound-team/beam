import { useMemo, useRef } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import { Icon } from "src/components/Icon";
import { Css, Properties } from "src/Css";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type StepperTabState = "notVisited" | "completed" | "active" | "activeCompleted";

export type StepperTabProps = {
  label: string;
  value: string;
  state: StepperTabState;
  onClick: (value: string) => void;
  disabled?: boolean;
  /** Collapses the tab down to its colored bottom border only, hiding the label — for narrow/many-tab layouts. */
  collapsed?: boolean;
};

export function StepperTab(props: StepperTabProps) {
  const { label, value, state, onClick, disabled = false, collapsed = false } = props;
  const ariaProps = { onPress: () => onClick(value), isDisabled: disabled };
  const ref = useRef(null);
  const { buttonProps } = useButton(ariaProps, ref);
  const { isFocusVisible, focusProps } = useFocusRing();
  const { hoverProps, isHovered } = useHover(ariaProps);
  const tid = useTestIds(props, "stepperTab");

  const { baseStyles, stateStyles, hoverStyles, focusRingStyles, disabledStyles, collapsedStyles } = useMemo(
    () => getStepperTabStyles(),
    [],
  );

  const showCheck = state === "completed" || state === "activeCompleted";

  return (
    <button
      ref={ref}
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      aria-label={collapsed ? label : undefined}
      css={{
        ...baseStyles,
        ...stateStyles[state],
        ...(isHovered && !disabled ? hoverStyles[state] : {}),
        ...(collapsed ? collapsedStyles[state] : {}),
        ...(disabled ? disabledStyles : {}),
        ...(isFocusVisible ? focusRingStyles : {}),
      }}
      {...tid[defaultTestId(value)]}
    >
      {!collapsed && (
        <>
          <span css={Css.lineClamp1.$}>{label}</span>
          {showCheck && (
            <span css={Css.fs0.ml1.$}>
              <Icon icon="check" inc={2.5} />
            </span>
          )}
        </>
      )}
    </button>
  );
}

const borderBottomWidthPx = 6;

function getStepperTabStyles() {
  const withBorderBottom = (color: Properties) => ({
    ...Css.bb.add("borderBottomWidth", `${borderBottomWidthPx}px`).$,
    ...color,
  });

  const stateStyles: Record<StepperTabState, Properties> = {
    notVisited: { ...Css.gray400.$, ...withBorderBottom(Css.bcGray300.$) },
    completed: { ...Css.blue700.$, ...withBorderBottom(Css.bcBlue600.$) },
    active: { ...Css.blue700.smSb.$, ...withBorderBottom(Css.bcBlue600.$) },
    activeCompleted: { ...Css.blue700.smSb.$, ...withBorderBottom(Css.bcBlue600.$) },
  };

  const hoverStyles: Record<StepperTabState, Properties> = {
    notVisited: Css.bgGray100.$,
    completed: Css.bgGray100.$,
    active: Css.bgGray100.$,
    activeCompleted: Css.bgGray100.$,
  };

  // When collapsed, every state's border goes gray except "completed" (visited, inactive, completed), which stays blue.
  const collapsedStyles: Record<StepperTabState, Properties> = {
    notVisited: Css.bcGray300.$,
    completed: Css.bcBlue600.$,
    active: Css.bcGray300.$,
    activeCompleted: Css.bcGray300.$,
  };

  return {
    baseStyles: Css.df.aic.fg1.py1.prPx(12).plPx(24).sm.br0.$,
    stateStyles,
    hoverStyles,
    focusRingStyles: Css.bshFocus.$,
    // Disabled always wins over both the state's and the collapsed border color.
    disabledStyles: { ...Css.gray400.cursorNotAllowed.$, ...Css.bcGray300.$ },
    collapsedStyles,
  };
}
