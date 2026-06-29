import { RefObject, useMemo } from "react";
import { useCheckbox, useHover, VisuallyHidden } from "react-aria";
import { useToggleState } from "react-stately";
import { Icon, IconProps, maybeTooltip, resolveTooltip } from "src/components";
import { Css, Palette, Xss } from "src/Css";
import { useGetRef } from "src/hooks/useGetRef";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

// Layout properties a parent may override to align a card within a row.
type SelectCardLayout = "width" | "height" | "flexBasis" | "flexGrow" | "flexShrink" | "alignSelf" | "minWidth";

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
  /** Layout overrides applied by a parent to align this card within a row (see `fillRowStyles`). */
  xss?: Xss<SelectCardLayout>;
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
    xss,
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
      // A label-only card is a fixed compact box; a description card fills the row and stretches.
      ...(description ? fillRowStyles : fixedSizeStyles),
      // Description cards top-align so multi-line copy lines up; label-only cards center.
      ...(description ? Css.jcfs.$ : Css.jcc.$),
      ...(isHovered && !isDisabled && hoverStyles),
      ...(isSelected && !isDisabled && selectedStyles),
      ...(isDisabled && (isSelected ? disabledSelectedStyles : disabledStyles)),
      // Spread last so a parent can override sizing (see `SelectCardGroup`).
      ...xss,
    }),
    [description, isDisabled, isHovered, isSelected, xss],
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
// Fixed compact box, matching the original IconCard sizing.
const fixedSizeStyles = Css.wPx(130).hPx(114).$;
// Fill the row evenly and stretch to a shared height; the `mwPx` floor keeps cards equal width.
// Exported so `SelectCardGroup` can apply it to label-only cards via `xss`; `wa`/`ha` reset
// `fixedSizeStyles` when it does.
export const fillRowStyles = Css.fb(0).fg1.fs0.asStretch.mwPx(187).wa.ha.$;
const copyStyles = Css.df.fdc.aic.gap("4px").w100.$;
const hoverStyles = Css.bw2.bcBlue600.$;
const selectedStyles = Css.bw2.bcBlue600.bgBlue50.$;
const disabledStyles = Css.bgGray50.bcGray300.$;
const disabledSelectedStyles = Css.bw2.bgGray100.bcGray300.$;
