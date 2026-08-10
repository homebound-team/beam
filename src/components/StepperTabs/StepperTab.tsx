import { useRef } from "react";
import { mergeProps, useButton, useFocusRing, useHover, VisuallyHidden } from "react-aria";
import { Icon } from "src/components/Icon";
import { Css, Properties, Tokens } from "src/Css";
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
  /** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
  __storyState?: {
    hovered?: boolean;
    focusVisible?: boolean;
  };
};

export function StepperTab(props: StepperTabProps) {
  const { label, value, active, completed, onClick, disabled = false, collapsed = false, __storyState } = props;
  // Collapsed tabs are a passive indicator bar, not an actionable control — same as `disabled`, they shouldn't be clickable or focusable.
  const ariaProps = { onPress: () => onClick(value), isDisabled: disabled || collapsed };
  const ref = useRef(null);
  const { buttonProps } = useButton(ariaProps, ref);
  const { isFocusVisible: isFocusVisibleFromEvents, focusProps } = useFocusRing();
  const { hoverProps, isHovered: isHoveredFromEvents } = useHover(ariaProps);
  const isHovered = __storyState?.hovered ?? isHoveredFromEvents;
  const isFocusVisible = __storyState?.focusVisible ?? isFocusVisibleFromEvents;
  const tid = useTestIds(props, "stepperTab");

  return (
    <button
      ref={ref}
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      aria-label={label}
      css={{
        ...stepperTabStyles.baseStyles,
        ...getStateStyles(active, completed),
        ...(isHovered && !disabled ? stepperTabStyles.hoverStyles : {}),
        ...(collapsed ? stepperTabStyles.collapsedStyles : {}),
        ...(disabled ? stepperTabStyles.disabledStyles : {}),
        ...(isFocusVisible ? stepperTabStyles.focusRingStyles : {}),
      }}
      {...tid[defaultTestId(value)]}
    >
      <span css={Css.dg.jic.mw0.transitionAll.o100.if(collapsed).o0.$}>
        {/* Hidden semibold size reserves bold width so switching between font-weights won't shift layout. */}
        <span
          css={Css.smSb.visibility("hidden").add("gridArea", "1/1").lineClamp1.wordBreak("break-all").$}
          aria-hidden
        >
          {label}
        </span>
        <span css={Css.add("gridArea", "1/1").lineClamp1.wordBreak("break-all").if(active).smSb.$}>{label}</span>
      </span>
      {!collapsed && (
        <span
          css={
            Css.fs0.ml1.transitionAll.o0
              .add("transform", "scale(0.75) translateY(100%)")
              .if(completed)
              .o100.add("transform", "scale(1) translateY(0%)").$
          }
        >
          <Icon icon="check" inc={2.5} {...tid.check} />
        </span>
      )}
      {/* The indicator is a border element that is used to indicate the current step. */}
      <span aria-hidden css={getIndicatorStyles(active, completed, disabled)} {...tid.indicator} />
      <VisuallyHidden>{completed ? "Complete" : "Not Complete"}</VisuallyHidden>
    </button>
  );
}

function getStateStyles(active: boolean, completed: boolean): Properties {
  return Css.color(Tokens.OnSurfaceMuted)
    .if(active || completed)
    .color(Tokens.ChoiceSelected).$;
}

function getIndicatorStyles(active: boolean, completed: boolean, disabled: boolean): Properties {
  // Absolute so active vs inactive thickness never changes the tab's layout height.
  // Note: We are using border token colors for background. This is because the element we are rendering visually appears as a border.
  return {
    ...Css.absolute.left0.right0.bottom0
      .hPx(active ? activeIndicatorHeightPx : inactiveIndicatorHeightPx)
      .bgColor(Tokens.FieldBorderDefault)
      .if((active || completed) && !disabled)
      .bgColor(Tokens.Primary).$,
  };
}

const activeIndicatorHeightPx = 3;
const inactiveIndicatorHeightPx = 2;

const stepperTabStyles = {
  // No overflow:hidden — collapsed indicators are absolute and must paint outside the 0-height box.
  baseStyles: Css.relative.df.aic.jcfs.fg1.py1.prPx(12).plPx(24).sm.color(Tokens.OnSurfaceMuted).tal.hPx(40)
    .transitionAll.$,
  hoverStyles: Css.bgGray100.$,
  focusRingStyles: Css.bshFocus.outline0.$,
  collapsedStyles: Css.cursor("default").hPx(0).py0.$,
  disabledStyles: Css.color(Tokens.TextDisabled).cursorNotAllowed.$,
};
