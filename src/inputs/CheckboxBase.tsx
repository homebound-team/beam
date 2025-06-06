import { InputHTMLAttributes, ReactNode, useRef } from "react";
import { mergeProps, useFocusRing, useHover, VisuallyHidden } from "react-aria";
import { HelperText, maybeTooltip } from "src/components";
import { Css, Palette, px } from "src/Css";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { BeamFocusableProps } from "src/interfaces";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

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
  checkboxOnly?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  /** If false this will be wrap in a div element instead of the label
   * Expects implementer to wrap within a label element to work properly
   * @default true
   */
  withLabelElement?: boolean;
  /** Tooltip content is set when disabled prop is a ReactNode via `Checkbox` component */
  tooltip?: ReactNode;
}

export function CheckboxBase(props: CheckboxBaseProps) {
  const {
    ariaProps,
    description,
    isDisabled = false,
    isIndeterminate = false,
    inputProps,
    label,
    errorMsg,
    helperText,
    checkboxOnly = false,
    withLabelElement = true,
    tooltip,
  } = props;
  const ref = useRef(null);
  const { isFocusVisible, focusProps } = useFocusRing(ariaProps);
  const tid = useTestIds(props, defaultTestId(label));

  const Tag = withLabelElement ? "label" : "div";

  return maybeTooltip({
    title: tooltip,
    placement: "top",
    children: (
      <Tag
        css={
          Css.df.cursorPointer.relative
            // Prevents accidental checkbox clicks due to label width being longer
            // than the content.
            .w("max-content")
            .maxw(px(320))
            .if(description !== undefined)
            .maxw(px(344))
            .if(isDisabled).cursorNotAllowed.$
        }
        aria-label={label}
      >
        <VisuallyHidden>
          <input ref={ref} {...mergeProps(inputProps, focusProps)} {...tid} data-indeterminate={isIndeterminate} />
        </VisuallyHidden>
        <StyledCheckbox {...props} isFocusVisible={isFocusVisible} {...tid} />
        {!checkboxOnly && (
          // Use a mtPx(-2) to better align the label with the checkbox.
          // Not using align-items: center as the checkbox would align with all content below, where we really want it to stay only aligned with the label
          <div css={Css.ml1.mtPx(-2).$}>
            {label && <div css={{ ...labelStyles, ...(isDisabled && disabledColor) }}>{label}</div>}
            {description && <div css={{ ...descStyles, ...(isDisabled && disabledColor) }}>{description}</div>}
            {errorMsg && <ErrorMessage errorMsg={errorMsg} {...tid.errorMsg} />}
            {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
          </div>
        )}
      </Tag>
    ),
  });
}

const baseStyles = Css.hPx(16).mw(px(16)).relative.ba.bcGray300.br4.bgWhite.transition.$;
const filledBoxStyles = Css.bcBlue700.bgBlue700.$;
const filledBoxHoverStyles = Css.bgBlue900.$;
const disabledBoxStyles = Css.bgGray50.bcGray100.$;
const disabledSelectedBoxStyles = Css.bgGray400.bcGray400.$;
const disabledColor = Css.gray300.$;
const focusRingStyles = Css.bshFocus.$;
const hoverBorderStyles = Css.bcBlue900.$;
const markStyles = { ">svg": Css.absolute.topPx(-1).leftPx(-1).$ };
const labelStyles = Css.smMd.$;
const descStyles = Css.sm.gray700.$;

interface StyledCheckboxProps {
  isDisabled?: boolean;
  isIndeterminate?: boolean;
  isSelected?: boolean;
  isFocusVisible?: boolean;
}

export function StyledCheckbox(props: StyledCheckboxProps) {
  const { isDisabled = false, isIndeterminate = false, isSelected, isFocusVisible } = props;
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const markIcon = isIndeterminate ? dashSmall : isSelected ? checkmarkSmall : "";
  const tid = useTestIds(props);
  return (
    <span
      {...hoverProps}
      css={{
        ...baseStyles,
        ...(((isSelected && !isDisabled) || isIndeterminate) && filledBoxStyles),
        ...(((isSelected && !isDisabled) || isIndeterminate) && isHovered && filledBoxHoverStyles),
        ...(isDisabled && disabledBoxStyles),
        ...(isDisabled && isSelected && disabledSelectedBoxStyles),
        ...(isFocusVisible && focusRingStyles),
        ...(isHovered && hoverBorderStyles),
        ...markStyles,
      }}
      aria-hidden="true"
      data-checked={isSelected ? true : isIndeterminate ? "mixed" : false}
      {...tid.checkbox}
    >
      {markIcon}
    </span>
  );
}

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
