import { RefObject, useMemo } from "react";
import { useCheckbox, useHover, VisuallyHidden } from "react-aria";
import { useToggleState } from "react-stately";
import { Icon, IconProps, maybeTooltip, resolveTooltip } from "src/components";
import { Css, Palette } from "src/Css";
import { useGetRef } from "src/hooks/useGetRef";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type SelectCardProps = {
  /** The icon to use within the card. */
  icon: IconProps["icon"];
  label: string;
  /** Optional secondary copy shown beneath the label. When present the card grows to fit it. */
  description?: string;
  selected?: boolean;
  /** Handler that is called when the element's selection state changes. */
  onChange?: (selected: boolean) => void;
  cardRef?: RefObject<HTMLInputElement>;
  disabled?: boolean;
  tooltip?: string;
};

export function SelectCard(props: SelectCardProps) {
  const {
    selected: isSelected = false,
    disabled: isDisabled = false,
    icon,
    cardRef,
    label,
    description,
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
      ...(isHovered && !isDisabled && selectCardStylesHover),
      ...(isSelected && !isDisabled && selectedStyles),
      ...(isDisabled && (isSelected ? disabledSelectedStyles : disabledStyles)),
    }),
    [isDisabled, isHovered, isSelected],
  );

  const tid = useTestIds(props, defaultTestId(label));

  return maybeTooltip({
    title: resolveTooltip(isDisabled, tooltip),
    placement: "top",
    children: (
      <button css={styles} {...hoverProps} onClick={toggleState.toggle} disabled={isDisabled} {...tid}>
        <VisuallyHidden>
          <input ref={ref} {...inputProps} {...tid.value} />
        </VisuallyHidden>
        <Icon icon={icon} inc={4} color={isDisabled ? Palette.Gray700 : Palette.Gray900} />
        <span css={copyStyles}>
          <span css={Css.smSb.if(isDisabled).gray700.$}>{label}</span>
          {description && <span css={Css.xs.gray700.$}>{description}</span>}
        </span>
      </button>
    ),
  });
}

const baseStyles = Css.df.fdc.aic.jcfs.wPx(187).ba.br12.bgWhite.add("borderColor", "rgba(53, 53, 53, 0.16)").gap1.px2
  .py3.tac.$;
const copyStyles = Css.df.fdc.aic.gap("4px").w100.$;
export const selectCardStylesHover = Css.bw2.bcBlue600.$;
export const selectedStyles = Css.bw2.bcBlue600.bgBlue50.$;
const disabledStyles = Css.bgGray50.add("borderColor", "rgba(53, 53, 53, 0.16)").$;
const disabledSelectedStyles = Css.bw2.bgGray100.add("borderColor", "rgba(53, 53, 53, 0.16)").$;
