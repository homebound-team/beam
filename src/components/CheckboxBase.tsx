import { InputHTMLAttributes, useRef } from "react";
import { useFocusRing, useHover, VisuallyHidden } from "react-aria";
import { Css, Palette, px } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";

interface CheckboxAriaProps {
  description?: string | undefined;
  onChange?: (selected: boolean) => void;
  autoFocus?: boolean | undefined;
  isSelected: boolean | undefined;
  isDisabled: boolean;
  isIndeterminate: boolean;
}
export interface CheckboxBaseProps extends BeamFocusableProps {
  ariaProps: CheckboxAriaProps;
  description?: string;
  isDisabled?: boolean;
  isIndeterminate?: boolean;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  isSelected?: boolean;
  label: string;
}

export function CheckboxBase(props: CheckboxBaseProps) {
  const { ariaProps, description, isDisabled = false, isIndeterminate = false, isSelected, inputProps, label } = props;
  const ref = useRef(null);
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const { hoverProps, isHovered } = useHover({ isDisabled });

  const markIcon = isIndeterminate ? dashSmall : isSelected ? checkmarkSmall : "";

  return (
    <label
      css={
        Css.df.cursorPointer
          .maxw(px(320))
          .if(description !== undefined)
          .maxw(px(344))
          .if(isDisabled).cursorNotAllowed.$
      }
    >
      <VisuallyHidden>
        <input ref={ref} {...inputProps} {...focusProps} />
      </VisuallyHidden>
      <span
        {...hoverProps}
        css={{
          ...baseStyles,
          ...((isSelected || isIndeterminate) && filledBoxStyles),
          ...((isSelected || isIndeterminate) && isHovered && filledBoxHoverStyles),
          ...(isDisabled && disabledBoxStyles),
          ...(isFocusVisible && focusRingStyles),
          ...(isHovered && hoverBorderStyles),
          ...markStyles,
        }}
        aria-hidden="true"
      >
        {markIcon}
      </span>
      <div css={Css.ml1.$}>
        {label && <div css={{ ...labelStyles, ...(isDisabled && disabledColor) }}>{label}</div>}
        {description && <div css={{ ...descStyles, ...(isDisabled && disabledColor) }}>{description}</div>}
      </div>
    </label>
  );
}

const baseStyles = Css.hPx(16).mw(px(16)).relative.ba.bGray300.br4.bgWhite.transition.topPx(2).$;
const filledBoxStyles = Css.bLightBlue700.bgLightBlue700.$;
const filledBoxHoverStyles = Css.bgLightBlue900.$;
const disabledBoxStyles = Css.bGray400.bGray100.$;
const disabledColor = Css.gray300.$;
const focusRingStyles = Css.bshFocus.$;
const hoverBorderStyles = Css.bLightBlue900.$;
const markStyles = { svg: Css.absolute.topPx(-1).leftPx(-1).$ };
const labelStyles = Css.smEm.$;
const descStyles = Css.sm.gray700.$;

const checkmarkSmall = (
  <svg width="16" height="16">
    <path
      d="M6.66669 10.3907L4.47135 8.19533L3.52869 9.138L6.66669 12.276L13.138 5.80467L12.1954 4.862L6.66669 10.3907Z"
      fill={Palette.White}
    />
  </svg>
);

const dashSmall = (
  <svg width="16" height="16">
    <rect x="4" y="7.5" width="8" height="1.35" fill={Palette.White} />
  </svg>
);
