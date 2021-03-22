import { useButton } from "@react-aria/button";
import { useMemo, useRef } from "react";
import { useFocusRing, useHover } from "react-aria";
import { Icon, IconProps } from "src";
import { Css, Palette } from "src/Css";
import { BeamButtonProps, BeamFocusableProps } from "src/interfaces";

export interface IconButtonProps extends BeamButtonProps, BeamFocusableProps {
  // The icon to use within the button
  icon: IconProps["icon"];
}

export function IconButton(props: IconButtonProps) {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);
  const { focusProps, isFocusVisible } = useFocusRing(props);
  const { hoverProps, isHovered } = useHover(props);
  const { icon, isDisabled } = props;

  const styles = useMemo(
    () => ({
      ...iconButtonStylesReset,
      ...(isHovered && iconButtonStylesHover),
      ...(isFocusVisible && iconButtonStylesFocus),
      ...(isDisabled && iconButtonStylesDisabled),
    }),
    [isHovered, isFocusVisible, isDisabled],
  );
  const iconColor = useMemo(() => (isDisabled ? Palette.CoolGray300 : undefined), [isDisabled]);

  return (
    <button {...buttonProps} {...focusProps} {...hoverProps} ref={ref} css={styles}>
      <Icon icon={icon} color={iconColor} />
    </button>
  );
}

// TODO: @KoltonG Remove p0 when CSSReset is included
const iconButtonStylesReset = Css.hPx(28).wPx(28).p0.br8.bTransparent.bw2.bgTransparent.cursorPointer.outline0.df
  .itemsCenter.justifyCenter.transition.$;
export const iconButtonStylesHover = Css.bgCoolGray100.$;
const iconButtonStylesFocus = Css.bSky500.$;
const iconButtonStylesDisabled = Css.cursorNotAllowed.$;
