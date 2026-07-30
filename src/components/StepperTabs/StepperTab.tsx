import { useRef } from "react";
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
  /** Collapses the tab down to its colored bottom border only, hiding the label — for the mobile view */
  collapsed?: boolean;
  /**
   * Whether the user has ever navigated to this step. A step can't visually read as "done" until it's
   * been visited, regardless of `completed`. Defaults to `true` so direct (non-`WorkflowLayout`) callers
   * that don't pass it keep today's look.
   */
  visited?: boolean;
  /** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
  __storyState?: {
    hovered?: boolean;
    focusVisible?: boolean;
  };
};

export function StepperTab(props: StepperTabProps) {
  const {
    label,
    value,
    active,
    completed,
    onClick,
    disabled = false,
    collapsed = false,
    visited = true,
    __storyState,
  } = props;
  // Collapsed tabs are a passive indicator bar, not an actionable control — same as `disabled`, they shouldn't be clickable or focusable.
  const ariaProps = { onPress: () => onClick(value), isDisabled: disabled || collapsed };
  const ref = useRef(null);
  const { buttonProps } = useButton(ariaProps, ref);
  const { isFocusVisible: isFocusVisibleFromEvents, focusProps } = useFocusRing();
  const { hoverProps, isHovered: isHoveredFromEvents } = useHover(ariaProps);
  const isHovered = __storyState?.hovered ?? isHoveredFromEvents;
  const isFocusVisible = __storyState?.focusVisible ?? isFocusVisibleFromEvents;
  const tid = useTestIds(props, "stepperTab");
  // A step can't read as "done" until it's been visited, even if the caller marks it `completed`.
  const showCompleted = completed && visited;

  return (
    <button
      ref={ref}
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      aria-label={label}
      css={{
        ...stepperTabStyles.baseStyles,
        ...getStateStyles(active, visited),
        ...(isHovered && !disabled ? stepperTabStyles.hoverStyles : {}),
        ...(collapsed ? getCollapsedStyles(visited) : {}),
        ...(disabled ? stepperTabStyles.disabledStyles : {}),
        ...(isFocusVisible ? stepperTabStyles.focusRingStyles : {}),
      }}
      {...tid[defaultTestId(value)]}
    >
      <span css={Css.lineClamp1.$}>{label}</span>
      {showCompleted && (
        <span css={Css.fs0.ml1.$}>
          <Icon icon="check" inc={2.5} {...tid.check} />
        </span>
      )}
      <VisuallyHidden>{showCompleted ? "Complete" : "Not Complete"}</VisuallyHidden>
    </button>
  );
}

function withBorderBottom(color: Properties) {
  return {
    ...Css.bb.add("borderBottomWidth", `3px`).$,
    ...color,
  };
}

function getStateStyles(active: boolean, visited: boolean): Properties {
  return {
    ...Css.gray400.if(visited).blue700.if(active).smSb.$,
    ...withBorderBottom(visited ? Css.bcBlue600.$ : Css.bcGray300.$),
  };
}

function getCollapsedStyles(visited: boolean): Properties {
  return {
    ...Css.cursor("default").hPx(0).py0.$,
    ...(visited ? Css.bcBlue600.$ : Css.bcGray300.$),
  };
}

const stepperTabStyles = {
  baseStyles: Css.df.aic.fg1.py1.prPx(12).plPx(24).sm.oh.tal.hPx(48).transitionAll.$,
  hoverStyles: Css.bgGray100.$,
  focusRingStyles: Css.bshFocus.outline0.$,
  // Disabled always wins over both the state's and the collapsed border color.
  disabledStyles: Css.gray400.cursorNotAllowed.bcGray300.$,
};
