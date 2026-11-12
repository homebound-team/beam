import { type RefObject, useRef } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import type { ButtonSize } from "src/components/Button";
import { Icon } from "src/components/Icon";
import { aiButtonStyles } from "src/components/internal/aiButtonStyles";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css } from "src/Css";
import { navLink } from "src/css/CssReset";
import type { BeamButtonProps } from "src/interfaces";
import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { noop } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

export type AiProgressButtonProps = {
  label: string;
  /** Spins the star while the AI work runs. */
  inProgress?: boolean;
  size?: ButtonSize;
} & BeamButtonProps;

/** An AI button that rests as its star and slides the label out on hover or keyboard focus. */
export function AiProgressButton(props: AiProgressButtonProps) {
  const { label, inProgress = false, size = "md", onClick, disabled, tooltip, openInNew } = props;
  const asLink = typeof onClick === "string";
  const isDisabled = !!disabled;
  const ref = useRef<HTMLElement>(null);
  const tid = useTestIds(props, label);
  const { buttonProps, isPressed } = useButton(
    {
      onPress: typeof onClick === "string" ? noop : onClick,
      isDisabled,
      elementType: asLink ? "a" : "button",
    },
    ref as RefObject<HTMLElement>,
  );
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { focusProps, isFocusVisible } = useFocusRing();
  const open = isHovered || isFocusVisible;
  const { height, endPadding } = sizes[size];

  const content = (
    <>
      <span css={Css.df.aic.jcc.fs0.sqPx(height).$}>
        {/* aiStar hardcodes its gradient fill, which vanishes on the AI fill; flatten it to white. */}
        <span
          css={{ ...Css.df.filter("brightness(0) invert(1)").$, ...(inProgress && Css.spin("3s linear infinite").$) }}
        >
          <Icon icon="aiStar" />
        </span>
      </span>
      {/* Animating `0fr` → `1fr` grows the label to its own width, which `width: auto` can't transition to. */}
      <span
        css={{
          // truss-motion `slow` + `standard`.
          ...Css.dg
            .gtc("0fr")
            .o0.add(
              "transition",
              "grid-template-columns 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            ).$,
          ...(open && Css.gtc("1fr").o100.$),
        }}
      >
        <span css={Css.oh.mw0.$}>
          <span css={Css.db.prPx(endPadding).$}>{label}</span>
        </span>
      </span>
    </>
  );

  const attrs = {
    ref: ref as any,
    ...mergeProps(buttonProps, focusProps, hoverProps),
    className: asLink ? navLink : undefined,
    ...Css.props({
      ...Css.buttonBase.hPx(height).$,
      ...aiButtonStyles.baseStyles,
      ...(isHovered && !isPressed ? aiButtonStyles.hoverStyles : {}),
      ...(isPressed ? aiButtonStyles.pressedStyles : {}),
      ...(isDisabled ? { ...aiButtonStyles.disabledStyles, ...Css.cursorNotAllowed.$ } : {}),
      ...(isFocusVisible ? aiButtonStyles.focusStyles : {}),
    }),
    ...tid,
  };

  return maybeTooltip({
    ...tid.tooltip,
    title: resolveTooltip(disabled, tooltip),
    placement: "bottom",
    children: getButtonOrLink(content, onClick, attrs, openInNew),
  });
}

/** Button's heights and horizontal padding per size. */
const sizes: Record<ButtonSize, { height: number; endPadding: number }> = {
  sm: { height: 32, endPadding: 12 },
  md: { height: 40, endPadding: 16 },
  lg: { height: 48, endPadding: 24 },
};
