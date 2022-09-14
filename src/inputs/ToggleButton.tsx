import { ReactNode, useRef, useState } from "react";
import { useHover, useSwitch, useFocusRing, VisuallyHidden, useButton } from "react-aria";
import { isPromise, toToggleState, useTestIds } from "src/utils";
import { Css } from "src/Css";
import { Icon, IconKey, maybeTooltip, resolveTooltip } from "..";

export interface ToggleButtonProps {
  /** Input label */
  label: string;
  selected?: boolean;
  onClick: ((selected: boolean) => void) | ((active: boolean) => Promise<void>);
  autoFocus?: boolean;
  icon?: IconKey;
  /** Whether the field is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  tooltip?: ReactNode;
  /** Handler when the interactive element state changes. */
}

export function ToggleButton(props: ToggleButtonProps) {
  const {
    selected: isSelected = false,
    disabled = false,
    label,
    onClick,
    icon,
    ...otherProps
  } = props;
  const isDisabled = !!disabled;
  const state = toToggleState(isSelected, onClick);
  const [asyncInProgress, setAsyncInProgress] = useState(false);

  const ref = useRef(null);
  const tid = useTestIds(props, label);

  const ariaProps = { isSelected, isDisabled: isDisabled || asyncInProgress, ...otherProps };
  const { inputProps } = useSwitch({ ...ariaProps, "aria-label": label }, state, ref);
  const { buttonProps, isPressed } = useButton(
    {
      ...ariaProps,
      onPress: () => {
        const result = onClick(!isSelected);
        if (isPromise(result)) {
          setAsyncInProgress(true);
          result.finally(() => setAsyncInProgress(false));
        }
        return result;
      },
      elementType: "button",
    },
    ref,
  );
  const { isFocusVisible: isKeyboardFocus, focusProps } = useFocusRing(otherProps);
  const { hoverProps, isHovered } = useHover(ariaProps);

  const tooltip = resolveTooltip(disabled);

  const buttonAttrs = {
    ref: ref as any,
    ...buttonProps,
    ...focusProps,
    ...hoverProps,
    css: {
      ...Css.buttonBase.br8.tt("inherit").$,
      ...Css.bgTransparent.gray500.hPx(32).pxPx(12).$,
      ...(isHovered && toggleHoverStyles),
      ...(isPressed ? togglePressStyles : {}),
      ...(isDisabled && Css.gray300.$),
      ...(isSelected && Css.lightBlue700.$),
      ...(isSelected && isHovered && toggleSelectedHoverStyles),
      ...(isKeyboardFocus && toggleFocusStyles),
    },
    ...tid,
  };

  return maybeTooltip({
    title: tooltip,
    placement: "top",
    children: (
      <label
        {...hoverProps}
        css={{
          ...Css.relative.cursorPointer.df.w("max-content").smEm.selectNone.$,
          ...(isDisabled && Css.cursorNotAllowed.gray400.$),
        }}
        aria-label={label}
      >
        <button
           aria-hidden="true"
          {...buttonAttrs}
        >
          {icon && <Icon xss={Css.mrPx(4).$} icon={icon} />}
          {label}
        </button>
        {/* Background */}
        <VisuallyHidden>
          <input {...tid.value} ref={ref} {...inputProps} {...focusProps} />
        </VisuallyHidden>
      </label>
    ),
  });
}

/** Styles */
// Toggle element styles
export const toggleHoverStyles = Css.bgGray100.$;
export const toggleFocusStyles = Css.bshFocus.$;
export const toggleSelectedHoverStyles = Css.bgGray300.$
export const togglePressStyles = Css.bgGray300.$