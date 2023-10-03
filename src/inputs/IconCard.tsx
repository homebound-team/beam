import { RefObject, useMemo } from "react";
import { useCheckbox, useHover, VisuallyHidden } from "react-aria";
import { useToggleState } from "react-stately";
import { Icon, IconProps, maybeTooltip, resolveTooltip } from "src/components";
import { Css, Palette } from "src/Css";
import { useGetRef } from "src/hooks/useGetRef";
import { noop, useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export interface IconCardProps {
  /** The icon to use within the card. */
  icon: IconProps["icon"];
  label: string;
  selected?: boolean;
  /** Handler that is called when the element's selection state changes. */
  onChange?: (selected: boolean) => void;
  cardRef?: RefObject<HTMLInputElement>;
  disabled?: boolean;
  tooltip?: string;
}

export function IconCard(props: IconCardProps) {
  const {
    selected: isSelected = false,
    disabled: isDisabled = false,
    icon,
    cardRef,
    label,
    tooltip,
    ...otherProps
  } = props;
  const ref = useGetRef(cardRef);
  const ariaProps = { isSelected, isDisabled, ...otherProps };
  const checkboxProps = { ...ariaProps, "aria-label": label };

  const { hoverProps, isHovered } = useHover({ isDisabled });
  const toggleState = useToggleState(ariaProps);
  const { inputProps } = useCheckbox(checkboxProps, toggleState, ref);

  const styles = useMemo(
    () => ({
      ...baseStyles,
      ...(isHovered && iconCardStylesHover),
      ...(isSelected && selectedStyles),
      ...(isDisabled && disabledStyles),
    }),
    [isDisabled, isHovered, isSelected],
  );

  const tid = useTestIds(props, defaultTestId(label));

  return maybeTooltip({
    title: resolveTooltip(isDisabled, tooltip),
    placement: "top",
    children: (
      <button css={styles} {...hoverProps} onClick={isDisabled ? noop : toggleState.toggle} {...tid}>
        <VisuallyHidden>
          <input ref={ref} {...inputProps} {...tid.value} />
        </VisuallyHidden>
        <Icon icon={icon} inc={4} color={isDisabled ? Palette.Gray300 : Palette.Gray900} />
        <span css={Css.xsMd.if(isDisabled).gray300.$}>{label}</span>
      </button>
    ),
  });
}

const baseStyles = Css.df.fdc.aic.jcc.wPx(130).hPx(114).ba.br8.bGray300.bgWhite.gap("12px").p2.tc.$;
export const selectedStyles = Css.bw2.bBlue500.bgBlue50.$;
const disabledStyles = Css.bGray200.bgGray50.$;
export const iconCardStylesHover = Css.bgGray100.$;
