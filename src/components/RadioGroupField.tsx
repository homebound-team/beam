import { ReactNode, useRef, useState } from "react";
import { useRadio, useRadioGroup } from "react-aria";
import { RadioGroupState } from "react-stately";
import { Css, Palette } from "src/Css";

export interface RadioFieldOption<K extends string> {
  // testId?: string;
  label: string;
  description?: string | (() => ReactNode);
  value: K;
}

interface RadioGroupFieldProps<K extends string> {
  // id?: string;
  label: string;
  value: K | undefined;
  onChange: (value: K) => void;
  options: RadioFieldOption<K>[];
}

export function RadioGroupField<K extends string>(props: RadioGroupFieldProps<K>) {
  const { label, value, onChange, options } = props;

  // Instead of calling useRadioState, adapt our props to it, so we can still use useRadioGroup
  const [lastFocusedValue, setLastFocusedValue] = useState<string | null>(null);
  const state: RadioGroupState = {
    name: "foo",
    isDisabled: false,
    isReadOnly: false,
    selectedValue: value || null,
    setSelectedValue: onChange,
    lastFocusedValue,
    setLastFocusedValue,
  };

  // We use useRadioGroup b/c it does neat keyboard up/down stuff
  const { labelProps, radioGroupProps } = useRadioGroup({ label }, state);

  // max-width is dependent on having descriptions
  const anyDescriptions = options.some((o) => !!o.description);

  return (
    <div css={Css.maxw(anyDescriptions ? "344px" : "320px").$}>
      <div {...labelProps} css={Css.sm.coolGray500.my1.$}>
        {label}
      </div>
      <div {...radioGroupProps}>
        {options.map((option) => (
          <Radio option={option} state={state} />
        ))}
      </div>
    </div>
  );
}

// Not meant to be standalone, but its own component so it can use hooks
function Radio<K extends string>(props: { option: RadioFieldOption<K>; state: RadioGroupState }) {
  const { option, state } = props;
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps } = useRadio(
    {
      value: option.value,
      // We wrap option.label+description in a `label` element but only want the
      // shorter option.label value to be the aria-label text.
      "aria-label": option.label,
    },
    state,
    ref,
  );

  return (
    <label key={option.value} css={Css.df.cursorPointer.mb1.$}>
      <input
        type="radio"
        ref={ref}
        css={{
          ...radioReset,
          ...(state.selectedValue === option.value ? radioChecked : radioUnchecked),
          // Sometimes we use useFocusRing, but here we want both to focus to drive
          ...{ "&:focus": radioFocus },
          // Nudge down so the center of the circle lines up with the label text
          ...Css.mtPx(2).mr1.$,
        }}
        {...inputProps}
      />
      <div>
        <div css={Css.smEm.coolGray700.$}>{option.label}</div>
        <div css={Css.sm.coolGray500.$}>{option.description}</div>
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
  ...Css.bgWhite.bSky500.ba.$,
  // Set a color that will be used by background=currentColor + box shadow, but is initially ignored
  ...Css.sky500.$,
};

// Unchecked means a gray border
export const radioUnchecked = Css.cursorPointer.bCoolGray300.$;

// Checked means a blue circle (achieved by a blue background + white dot background image)
export const radioChecked = {
  // When checked, make a circle by having the border blend into the background
  ...Css.add("borderColor", "transparent").$,
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
  ...Css.add("boxShadow", `${Palette.White} 0px 0px 0px 2px, currentColor 0px 0px 0px 4px`).$,
};
