import { ReactNode, useMemo, useRef } from "react";
import { useRadio, useRadioGroup } from "react-aria";
import { RadioGroupState, useRadioGroupState } from "react-stately";
import { Css } from "src/Css";

let nextNameId = 0;

export interface RadioFieldOption<K extends string> {
  // testId?: string;
  /** The label for a specific option, i.e. "Cheddar". */
  label: string;
  /** An optional longer description to render under the label. */
  description?: string | (() => ReactNode);
  /** The undisplayed value, i.e. an id of some sort. */
  value: K;
}

interface RadioGroupFieldProps<K extends string> {
  // id?: string;
  /** The label for the choice itself, i.e. "Favorite Cheese". */
  label: string;
  /** The currently selected option value (i.e. an id). */
  value: K | undefined;
  /** Called when an option is selected. We don't support unselecting. */
  onChange: (value: K) => void;
  /** The list of options. */
  options: RadioFieldOption<K>[];
  disabled?: boolean;
}

/**
 * Provides a radio group with label.
 *
 * This is generally meant to be used in a form vs. being raw radio buttons.
 *
 * TODO: Add hover (non selected and selected) styles
 */
export function RadioGroupField<K extends string>(props: RadioGroupFieldProps<K>) {
  const { label, value, onChange, options, disabled = false } = props;

  // useRadioGroupState uses a random group name, so use our name
  const name = useMemo(() => `radio-group-${++nextNameId}`, []);
  const state = useRadioGroupState({
    name,
    value,
    onChange: (value) => onChange(value as K),
    isDisabled: disabled,
    isReadOnly: false,
  });

  // We use useRadioGroup b/c it does neat keyboard up/down stuff
  // TOOD: Pass read only, required, error message to useRadioGroup
  const { labelProps, radioGroupProps } = useRadioGroup({ label, isDisabled: disabled }, state);

  // max-width is dependent on having descriptions
  const anyDescriptions = options.some((o) => !!o.description);

  return (
    <div css={Css.maxw(anyDescriptions ? "344px" : "320px").$}>
      <div css={Css.sm.gray800.my1.$} {...labelProps}>
        {label}
      </div>
      <div {...radioGroupProps}>
        {options.map((option) => (
          <Radio key={option.value} parentId={state.name} option={option} state={state} />
        ))}
      </div>
    </div>
  );
}

// Not meant to be standalone, but its own component so it can use hooks
function Radio<K extends string>(props: { parentId: string; option: RadioFieldOption<K>; state: RadioGroupState }) {
  const {
    parentId,
    option: { description, label, value },
    state,
  } = props;
  const disabled = state.isDisabled;

  const labelId = `${parentId}-${value}-label`;
  const descriptionId = `${parentId}-${value}-description`;
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps } = useRadio({ value, "aria-labelledby": labelId }, state, ref);

  return (
    <label css={Css.df.cursorPointer.mb1.if(disabled).add("cursor", "initial").$}>
      <input
        type="radio"
        ref={ref}
        css={{
          ...radioReset,
          ...(!disabled && state.selectedValue === value ? radioChecked : radioUnchecked),
          ...(disabled ? radioDisabled : {}),
          // Sometimes we use useFocusRing, but here we want both mouse & keyboard to drive focus
          ...{ "&:focus": radioFocus },
          // Nudge down so the center of the circle lines up with the label text
          ...Css.mtPx(2).mr1.$,
        }}
        disabled={disabled}
        {...inputProps}
        aria-labelledby={labelId}
      />
      <div>
        <div
          id={labelId}
          css={Css.smEm.gray800.if(disabled).gray400.$}
          {...(description ? { "aria-describedby": descriptionId } : {})}
        >
          {label}
        </div>
        {description && (
          <div id={descriptionId} css={Css.sm.gray700.if(disabled).gray400.$}>
            {description}
          </div>
        )}
      </div>
    </label>
  );
}

const whiteCircle =
  "data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='4'/%3e%3c/svg%3e";

// Didn't put these in radioReset yet, are they needed?
// color-adjust: exact;
// -webkit-print-color-adjust: exact;

export const radioReset = {
  ...Css.add("appearance", "none").p0.dib.vMid.add("userSelect", "none").fs0.h2.w2.br100.$,
  ...Css.add("outline", "0px solid transparent").$,
  // By default we're white with a blue border
  ...Css.bgWhite.bLightBlue900.ba.$,
  // Set a color that will be used by background=currentColor + box shadow, but is initially ignored
  ...Css.lightBlue700.$,
};

// Unchecked means a gray border
export const radioUnchecked = Css.cursorPointer.bGray300.$;

// Checked means a blue circle (achieved by a blue background + white dot background image)
export const radioChecked = {
  // When checked, make a circle by having the border blend into the background
  ...Css.bTransparent.$,
  // And make the background become the current (blue) color
  ...Css.add("backgroundColor", "currentColor")
    .add("backgroundSize", "100% 100%")
    .add("backgroundPosition", "center")
    .add("backgroundRepeat", "no-repeat").$,
  // And use backgroundImage to draw a white dot in the middle of the background
  ...Css.add("backgroundImage", `url("${whiteCircle}")`).$,
};

// When active draw another circle via boxShadow
export const radioFocus = {
  // The box shadow ends up drawing over this afaict?
  ...Css.add("outline", "2px solid transparent").add("outlineOffset", "2px").$,
  // Draw 1st box shadow of white/outline, 2nd box current (blue) of another outline
  ...Css.bshFocus.$,
};

export const radioDisabled = {
  ...Css.cursorNotAllowed.gray100.$,
  ...Css.add("backgroundColor", "currentColor")
    .add("backgroundSize", "100% 100%")
    .add("backgroundPosition", "center")
    .add("backgroundRepeat", "no-repeat").$,
};
