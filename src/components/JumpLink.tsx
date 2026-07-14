import { PressEvent } from "@react-types/shared";
import { ReactNode, useMemo, useRef } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import { Css, Properties, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type JumpLinkProps = {
  label: ReactNode;
  active: boolean;
  onClick: (e: PressEvent) => void;
  disabled?: boolean;
  /** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
  __storyState?: { hovered?: boolean; focusVisible?: boolean };
};

/** A link that scrolls the page to a section, e.g. for "on this page" tables of contents. */
export function JumpLink(props: JumpLinkProps) {
  const { label, active, onClick, disabled, __storyState, ...otherProps } = props;
  const isDisabled = !!disabled;
  const ref = useRef<HTMLButtonElement>(null);
  const ariaProps = { isDisabled, onPress: onClick };
  const { buttonProps } = useButton(ariaProps, ref);
  const { isFocusVisible: isFocusVisibleFromEvents, focusProps } = useFocusRing();
  const { hoverProps, isHovered: isHoveredFromEvents } = useHover({ isDisabled });
  const isHovered = __storyState?.hovered ?? isHoveredFromEvents;
  const isFocusVisible = __storyState?.focusVisible ?? isFocusVisibleFromEvents;
  const { baseStyles, activeStyles, hoverStyles, focusStyles, disabledStyles } = useMemo(getJumpLinkStyles, []);
  const tid = useTestIds(otherProps, "jumpLink");

  return (
    <button
      ref={ref}
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      {...tid}
      css={{
        ...baseStyles,
        ...(active && activeStyles),
        ...(isHovered && !isDisabled && hoverStyles),
        ...(isFocusVisible && focusStyles),
        ...(isDisabled && disabledStyles),
      }}
    >
      <span css={Css.wPx(140).lineClamp2.$}>{label}</span>
    </button>
  );
}

export function getJumpLinkStyles(): {
  baseStyles: Properties;
  activeStyles: Properties;
  hoverStyles: Properties;
  focusStyles: Properties;
  disabledStyles: Properties;
} {
  return {
    baseStyles: Css.wPx(184).tal.sm.cursorPointer.px3.py1.color(Tokens.TextLinkDefault).lhPx(24).$,
    activeStyles: Css.smSb.bl.add("borderLeftWidth", "3px").bcBlue600.lhPx(24).$,
    hoverStyles: Css.bgColor(Tokens.NeutralFillHoverSubtle).color(Tokens.TextLinkHover).$,
    focusStyles: Css.bshFocus.$,
    disabledStyles: Css.color(Tokens.TextLinkDisabled).bcBlue200.cursorNotAllowed.$,
  };
}
