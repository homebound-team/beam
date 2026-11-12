import { type ReactNode, useRef } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon, type IconProps } from "src/components/Icon";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css, type Properties, Tokens } from "src/Css";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

export type ButtonGroupProps = {
  buttons: ButtonGroupButton[];
  /** Disables all buttons in ButtonGroup */
  disabled?: boolean;
  /** Stretches the group to its container, splitting the width evenly between the buttons. */
  fullWidth?: boolean;
};

export type ButtonGroupButton = {
  icon?: IconProps["icon"];
  iconColor?: IconProps["color"];
  iconInc?: IconProps["inc"];
  text?: ReactNode;
  onClick?: VoidFunction;
  /** Disables the button. Pass a ReactNode to disable the button and show a tooltip */
  disabled?: boolean | ReactNode;
  /** Indicates the selected button, as in a view toggle where exactly one text button is active. */
  active?: boolean;
  /** Adds tooltip to the button */
  tooltip?: ReactNode;
};

export function ButtonGroup(props: ButtonGroupProps) {
  const { buttons, disabled = false, fullWidth = false } = props;
  const tid = useTestIds(props, "buttonGroup");
  return (
    // Adding `line-height: 0` prevent inheriting line-heights that might throw off sizing within the button group.
    <div {...tid} css={Css.df.lh(0).hPx(40).if(fullWidth).w100.$}>
      {buttons.map(({ disabled: buttonDisabled, ...buttonProps }, i) => (
        // Disable the button if the ButtonGroup is disabled or if the current button is disabled.
        <GroupButton
          key={i}
          {...buttonProps}
          disabled={disabled || buttonDisabled}
          isFirst={i === 0}
          isLast={i === buttons.length - 1}
          fullWidth={fullWidth}
          {...tid}
        />
      ))}
    </div>
  );
}

type GroupButtonProps = {
  isFirst: boolean;
  isLast: boolean;
  fullWidth: boolean;
} & ButtonGroupButton;

function GroupButton(props: GroupButtonProps) {
  const {
    icon,
    iconInc,
    iconColor,
    text,
    active = false,
    onClick: onPress,
    disabled,
    tooltip,
    isFirst,
    isLast,
    fullWidth,
    ...otherProps
  } = props;
  const ariaProps = { onPress, isDisabled: !!disabled, ...otherProps };
  const ref = useRef(null);
  const { buttonProps, isPressed } = useButton(ariaProps, ref);
  const { isFocusVisible, focusProps } = useFocusRing();
  const { hoverProps, isHovered } = useHover(ariaProps);
  const tid = useTestIds(props);
  // Extend the group prefix with this button's text (or icon/fallback), then scope its tooltip to that button ID.
  // I.e. "Save" produces buttonGroup_save for the button and buttonGroup_save_tooltip for its tooltip.
  const buttonTid = useTestIds(tid[defaultTestId((typeof text === "string" && text) || icon || "button")]);

  return (
    // Raise the active and focused buttons so their borders paint over the neighboring button's shared border.
    <span css={Css.relative.if(!isFirst).mlPx(-1).if(active).z1.if(isFocusVisible).z2.if(fullWidth).fg1.fb0.$}>
      {maybeTooltip({
        ...buttonTid.tooltip,
        title: resolveTooltip(disabled, tooltip),
        placement: "top",
        children: (
          <button
            ref={ref}
            {...buttonProps}
            {...focusProps}
            {...hoverProps}
            css={{
              ...getButtonStyles(isFirst, isLast, !!icon && !text),
              ...Css.if(fullWidth).w100.jcc.$,
              ...(active ? activeStyles : isPressed ? pressedStyles : isHovered ? hoverStyles : {}),
              ...(disabled ? disabledStyles : {}),
              ...(isFocusVisible ? defaultFocusRingStyles : {}),
            }}
            {...buttonTid}
          >
            {icon && (
              <Icon xss={Css.if(!!text).mrPx(4).$} icon={icon} color={disabled ? undefined : iconColor} inc={iconInc} />
            )}
            {text}
          </button>
        ),
      })}
    </span>
  );
}

const pressedStyles = Css.bgColor(Tokens.NeutralFillPressed).$;
const activeStyles = Css.bgColor(Tokens.SurfaceActive).bc(Tokens.Primary).$;
const hoverStyles = Css.bgColor(Tokens.SurfaceHover).$;
const disabledStyles = Css.color(Tokens.OnSurfaceDisabled).cursorNotAllowed.$;
// A 2px ring drawn over the border as one shape, so it stays inside the 40px box and follows the rounded corners.
// The wrapper's z-index raises it over the neighboring buttons' shared border.
const defaultFocusRingStyles = Css.outline(`2px solid ${Tokens.FieldBorderFocus}`).outlineOffset("-2px").$;

function getButtonStyles(isFirst: boolean, isLast: boolean, iconOnly: boolean): Properties {
  return {
    ...Css.buttonBase.h100.br0.ba.bw1
      .bc(Tokens.FieldBorderDefault)
      .bgColor(Tokens.Surface)
      // Stops the fill at the border, so it doesn't tint the antialiased rounded corners
      .bgClip("padding-box")
      .color(Tokens.OnSurface)
      .if(iconOnly).p1.else.px2.$,
    // Our first button should have a rounded left border.
    ...(isFirst && Css.add("borderRadius", "8px 0 0 8px").$),
    // Our last button should have a rounded right border.
    ...(isLast && Css.add("borderRadius", "0 8px 8px 0").$),
    // A lone button is rounded on both sides.
    ...(isFirst && isLast && Css.br8.$),
  };
}
