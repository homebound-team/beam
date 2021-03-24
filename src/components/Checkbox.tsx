import { useCheckbox } from "@react-aria/checkbox";
import { useFocusRing } from "@react-aria/focus";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { useToggleState } from "@react-stately/toggle";
import { useRef } from "react";
import { Css, Palette, px } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";

interface CheckboxProps extends BeamFocusableProps {
  /** Additional text displayed below label */
  description?: string;
  disabled?: boolean;
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  indeterminate?: boolean;
  selected?: boolean;
  label?: string;
  /** Handler that is called when the element's selection state changes. */
  onChange?: (selected: boolean) => void;
  value?: string;
}

export function Checkbox(props: CheckboxProps) {
  const { label, indeterminate = false, disabled = false, description } = props;
  const ref = useRef(null);

  // useToggleState requires variable name `isSelected`
  const state = useToggleState({ ...props, isSelected: props.selected });
  const selected = state.isSelected;

  const { inputProps } = useCheckbox({ ...props, "aria-label": label }, state, ref);
  const { isFocusVisible, focusProps } = useFocusRing(props);
  const markIcon = indeterminate ? dashSmall : selected ? checkmarkSmall : "";

  return (
    <div>
      <label css={Css.df.itemsCenter.$}>
        <VisuallyHidden>
          <input ref={ref} {...inputProps} {...focusProps} />
        </VisuallyHidden>
        <span
          css={{
            ...checkboxStyles({ disabled, selected, indeterminate }),
            ...(isFocusVisible && focusRingStyles),
          }}
          aria-hidden="true"
        ></span>
        <span css={markStyles}>{markIcon}</span>
        {label && <div css={labelStyles(disabled)}>{label}</div>}
      </label>
      {description && <div css={descStyles}>{description}</div>}
    </div>
  );
}

interface ICheckboxStyles {
  disabled: boolean;
  selected: boolean;
  indeterminate: boolean;
}

function checkboxStyles({ disabled, selected, indeterminate }: ICheckboxStyles) {
  return Css.hPx(16)
    .wPx(16)
    .cursorPointer.ba.bCoolGray300.br4.bgWhite.if(selected || indeterminate)
    .bSky500.bgSky500.if(disabled).bCoolGray300.bgCoolGray100.cursorNotAllowed.$;
}
const focusRingStyles = Css.bshFocus.$;
const markStyles = { ...Css.relative.cursorPointer.$, "& svg": Css.absolute.topPx(-8).rightPx(0).$ };
function labelStyles(disabled: boolean) {
  return Css.pl1.sm.if(disabled).coolGray300.$;
}
const descStyles = Css.pl3.sm.coolGray500.maxw(px(312)).$;

export const checkmarkSmall = (
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
