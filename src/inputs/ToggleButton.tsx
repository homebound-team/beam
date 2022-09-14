import { ReactNode, useRef, useState } from "react";
import { useFocusRing, useHover, usePress, useSwitch, VisuallyHidden } from "react-aria";
import { useToggleState } from "react-stately";
import { Icon, IconKey, maybeTooltip, resolveTooltip } from "src/components";
import { Css } from "src/Css";
import { isPromise, useTestIds } from "src/utils";

export interface ToggleButtonProps {
  /** Input label */
  label: string;
  selected?: boolean;
  onChange: ((selected: boolean) => void) | ((active: boolean) => Promise<void>);
  autoFocus?: boolean;
  icon?: IconKey;
  /** Whether the field is disabled. If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip. */
  disabled?: boolean | ReactNode;
  tooltip?: ReactNode;
  /** Handler when the interactive element state changes. */
}

export function ToggleButton(props: ToggleButtonProps) {
  const { selected: isSelected = false, disabled = false, label, onChange, icon, ...otherProps } = props;
  const [asyncInProgress, setAsyncInProgress] = useState(false);
  const isDisabled = !!disabled || asyncInProgress;
  const ariaProps = { "aria-label": label, isSelected, isDisabled: isDisabled, ...otherProps };
  const state = useToggleState({
    ...ariaProps,
    onChange: (e) => {
      const result = onChange(e);
      if (isPromise(result)) {
        setAsyncInProgress(true);
        result.finally(() => setAsyncInProgress(false));
      }
      return result;
    },
  });
  const labelRef = useRef(null);
  const ref = useRef(null);
  const tid = useTestIds(props, label);
  const { isPressed, pressProps } = usePress({ ref: labelRef, isDisabled });
  const { inputProps } = useSwitch(ariaProps, state, ref);
  const { isFocusVisible: isKeyboardFocus, focusProps } = useFocusRing({ ...otherProps, within: true });
  const { hoverProps, isHovered } = useHover({ isDisabled });

  const tooltip = resolveTooltip(disabled);

  const labelAttrs = {
    ...focusProps,
    ...hoverProps,
    ...pressProps,
    css: {
      ...Css.br4.dif.aic.gap1.bgTransparent.gray500.hPx(32).plPx(4).pr1.relative.cursorPointer.w("max-content").smEm
        .selectNone.$,
      ...(isHovered && toggleHoverStyles),
      ...(isPressed && togglePressStyles),
      ...(isSelected && !isDisabled && Css.lightBlue700.$),
      ...(isKeyboardFocus && toggleFocusStyles),
      ...(isDisabled && Css.gray300.cursorNotAllowed.$),
    },
    ...tid,
  };

  return maybeTooltip({
    title: tooltip,
    placement: "top",
    children: (
      <label {...labelAttrs}>
        {icon && <Icon icon={icon} />}
        {label}
        <VisuallyHidden>
          <input {...tid.value} ref={ref} {...inputProps} />
        </VisuallyHidden>
      </label>
    ),
  });
}

/** Styles */
// Toggle element styles
export const toggleHoverStyles = Css.bgGray100.$;
export const toggleFocusStyles = Css.bshFocus.$;
export const togglePressStyles = Css.bgGray300.$;
