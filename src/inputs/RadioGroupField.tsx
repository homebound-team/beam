import { Fragment, ReactNode, useMemo, useRef } from "react";
import { useFocusRing, useHover, useRadio, useRadioGroup } from "react-aria";
import { RadioGroupState, useRadioGroupState } from "react-stately";
import { maybeTooltip, resolveTooltip } from "src/components";
import { HelperText } from "src/components/HelperText";
import { Label } from "src/components/Label";
import { PresentationFieldProps } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

let nextNameId = 0;

export interface RadioFieldOption<K extends string> {
  // testId?: string;
  /** The label for a specific option, i.e. "Cheddar". */
  label: string;
  /** An optional longer description to render under the label. */
  description?: string | (() => ReactNode);
  /** The undisplayed value, i.e. an id of some sort. */
  value: K;
  /** Disable only specific option, with an optional reason */
  disabled?: boolean | ReactNode;
}

export interface RadioGroupFieldProps<K extends string> extends Pick<PresentationFieldProps, "labelStyle"> {
  /** The label for the choice itself, i.e. "Favorite Cheese". */
  label: string;
  /** The currently selected option value (i.e. an id). */
  value: K | undefined;
  /** Called when an option is selected. We don't support unselecting. */
  onChange: (value: K) => void;
  /** The list of options. */
  options: RadioFieldOption<K>[];
  disabled?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
}

/**
 * Provides a radio group with label.
 *
 * This is generally meant to be used in a form vs. being raw radio buttons.
 *
 * TODO: Add hover (non selected and selected) styles
 */
export function RadioGroupField<K extends string>(props: RadioGroupFieldProps<K>) {
  const { label, labelStyle, value, onChange, options, disabled = false, errorMsg, helperText, ...otherProps } = props;

  // useRadioGroupState uses a random group name, so use our name
  const name = useMemo(() => `radio-group-${++nextNameId}`, []);
  const state = useRadioGroupState({
    name,
    value,
    onChange: (value) => onChange(value as K),
    isDisabled: disabled,
    isReadOnly: false,
  });
  const tid = useTestIds(props, defaultTestId(label));

  // We use useRadioGroup b/c it does neat keyboard up/down stuff
  // TODO: Pass read only, required, error message to useRadioGroup
  const { labelProps, radioGroupProps } = useRadioGroup({ label, isDisabled: disabled }, state);

  return (
    // default styling to position `<Label />` above.
    <div css={Css.df.fdc.gap1.aifs.if(labelStyle === "left").fdr.gap2.jcsb.$}>
      <Label label={label} {...labelProps} {...tid.label} hidden={labelStyle === "hidden"} />
      <div {...radioGroupProps}>
        {options.map((option) => {
          const isDisabled = state.isDisabled || !!option.disabled;
          return (
            <Fragment key={option.value}>
              {maybeTooltip({
                title: resolveTooltip(option.disabled),
                placement: "bottom",
                children: (
                  <Radio
                    parentId={name}
                    option={option}
                    state={{ ...state, isDisabled }}
                    {...otherProps}
                    {...tid[option.value]}
                  />
                ),
              })}
            </Fragment>
          );
        })}
        {errorMsg && <ErrorMessage errorMsg={errorMsg} {...tid.errorMsg} />}
        {helperText && <HelperText helperText={helperText} />}
      </div>
    </div>
  );
}

// Not meant to be standalone, but its own component so it can use hooks
function Radio<K extends string>(props: {
  parentId: string;
  option: RadioFieldOption<K>;
  state: RadioGroupState;
  onBlur?: () => void;
  onFocus?: () => void;
}) {
  const {
    parentId,
    option: { description, label, value },
    state,
    ...others
  } = props;
  const disabled = state.isDisabled;

  const labelId = `${parentId}-${value}-label`;
  const descriptionId = `${parentId}-${value}-description`;
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps } = useRadio({ value, "aria-labelledby": labelId }, state, ref);
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  return (
    <label css={Css.df.cursorPointer.mb1.if(disabled).add("cursor", "initial").$} {...hoverProps}>
      <input
        type="radio"
        ref={ref}
        css={{
          ...radioReset,
          ...radioDefault,
          ...(!disabled && state.selectedValue === value ? radioChecked : radioUnchecked),
          ...(disabled ? radioDisabled : {}),
          ...(isHovered ? radioHover : {}),
          ...(isFocusVisible ? radioFocus : {}),
          // Nudge down so the center of the circle lines up with the label text
          ...Css.mtPx(2).mr1.$,
        }}
        disabled={disabled}
        aria-labelledby={labelId}
        {...inputProps}
        {...focusProps}
        // Put others here b/c it could have data-testid in it or onX events.
        {...others}
      />
      <div>
        <div
          id={labelId}
          css={Css.smMd.gray800.if(disabled).gray400.$}
          {...(description ? { "aria-describedby": descriptionId } : {})}
        >
          {label}
        </div>
        {description && (
          <div id={descriptionId} css={Css.sm.gray700.if(disabled).gray400.$}>
            {typeof description === "function" ? description() : description}
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
};

export const radioDefault = {
  // By default we're a white circle with a gray border
  ...Css.bgWhite.bGray300.ba.$,
  // Set the "selected" color that will be used by background=currentColor + box shadow, but is initially ignored
  ...Css.lightBlue700.$,
  // Apply our default transitions
  ...Css.transition.$,
};

// Unchecked means a gray border
export const radioUnchecked = Css.cursorPointer.bGray300.$;

// Checked means a blue circle (achieved by a blue background + white dot background image)
export const radioChecked = {
  // Make the background become the current (blue) color
  ...Css.add("backgroundColor", "currentColor")
    .add("backgroundSize", "100% 100%")
    .add("backgroundPosition", "center")
    .add("backgroundRepeat", "no-repeat").$,
  // And use backgroundImage to draw a white dot in the middle of the background
  ...Css.add("backgroundImage", `url("${whiteCircle}")`).$,
  // Make our border the same color as the dot
  ...Css.add("borderColor", "currentColor").$,
};

// When active draw another circle via boxShadow
export const radioFocus = {
  // The box shadow ends up drawing over this afaict?
  ...Css.add("outline", "2px solid transparent").add("outlineOffset", "2px").$,
  // Draw 1st box shadow of white/outline, 2nd box current (blue) of another outline
  ...Css.bshFocus.$,
};

export const radioHover = {
  // Change both the dot and the border to a darker blue
  ...Css.lightBlue900.bLightBlue900.$,
};

export const radioDisabled = {
  ...Css.cursorNotAllowed.gray100.$,
  ...Css.add("backgroundColor", "currentColor")
    .add("backgroundSize", "100% 100%")
    .add("backgroundPosition", "center")
    .add("backgroundRepeat", "no-repeat").$,
};
