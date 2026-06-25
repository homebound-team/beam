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
      // The two layouts are meaningfully different: a label-only card is a fixed, compact,
      // center-aligned box (the original IconCard sizing), while a card with a description
      // fills the row evenly, stretches to a shared height, and top-aligns its content.
      ...(description ? withDescriptionStyles : withoutDescriptionStyles),
      ...(isHovered && !isDisabled && hoverStyles),
      ...(isSelected && !isDisabled && selectedStyles),
      ...(isDisabled && (isSelected ? disabledSelectedStyles : disabledStyles)),
    }),
    [description, isDisabled, isHovered, isSelected],
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

// Shared visuals for both layouts (flex column, border, radius, bg, padding, gap, centered text).
const baseStyles = Css.df.fdc.aic.ba.br12.bgWhite.bcGray300.gap1.px2.py3.tac.$;
// Label-only card: fixed, compact, center-aligned box (matches the original IconCard sizing).
const withoutDescriptionStyles = Css.jcc.wPx(130).hPx(114).$;
// Card with a description: fill the row evenly (`flex: 1 0 0`), stretch to a shared height,
// and top-align content so multi-line descriptions line up across the row.
const withDescriptionStyles = Css.jcfs.fb(0).fg1.fs0.asStretch.mwPx(187).$;
const copyStyles = Css.df.fdc.aic.gap("4px").w100.$;
const hoverStyles = Css.bw2.bcBlue600.$;
const selectedStyles = Css.bw2.bcBlue600.bgBlue50.$;
const disabledStyles = Css.bgGray50.bcGray300.$;
const disabledSelectedStyles = Css.bw2.bgGray100.bcGray300.$;
