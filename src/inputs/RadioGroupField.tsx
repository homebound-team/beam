import { Fragment, ReactNode, useMemo, useRef } from "react";
import { useFocusRing, useHover, useRadio, useRadioGroup, VisuallyHidden } from "react-aria";
import { RadioGroupState, useRadioGroupState } from "react-stately";
import { maybeTooltip, resolveTooltip } from "src/components";
import { HelperText } from "src/components/HelperText";
import { Label } from "src/components/Label";
import { PresentationFieldProps } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { useLabelSuffix } from "src/forms/labelUtils";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { getRadioStateStyles, radioDefault, radioFocus, radioHover, radioReset } from "src/inputs/internal/radioStyles";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

let nextNameId = 0;

export type RadioFieldOption<K extends string> = {
  // testId?: string;
  /** The label for a specific option, i.e. "Cheddar". */
  label: string;
  /** An optional longer description to render under the label. */
  description?: string | (() => ReactNode);
  /** The undisplayed value, i.e. an id of some sort. */
  value: K;
  /** Disable only specific option, with an optional reason */
  disabled?: boolean | ReactNode;
  /**
   * Optional image shown beside the radio instead of the label/description text, i.e. for a
   * photo picker. `label` is still required and used for assistive tech, but is visually hidden.
   */
  image?: string;
};

export type RadioGroupFieldLayout = "vertical" | "horizontal";

export type RadioGroupFieldProps<K extends string> = {
  /** The label for the choice itself, i.e. "Favorite Cheese". */
  label: string;
  /** The currently selected option value (i.e. an id). */
  value: K | undefined;
  /** Called when an option is selected. We don't support unselecting. */
  onChange: (value: K) => void;
  /** The list of options. */
  options: RadioFieldOption<K>[];
  disabled?: boolean;
  /** Whether the field is required. When true, renders the required suffix (i.e. "*") next to the label. */
  required?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  /** Direction of the options. Defaults to "vertical". */
  layout?: RadioGroupFieldLayout;
} & Pick<PresentationFieldProps, "labelStyle">;

/**
 * Provides a radio group with label.
 *
 * This is generally meant to be used in a form vs. being raw radio buttons.
 *
 * TODO: Add hover (non selected and selected) styles
 */
export function RadioGroupField<K extends string>(props: RadioGroupFieldProps<K>) {
  const {
    label,
    labelStyle,
    value,
    onChange,
    options,
    disabled = false,
    required,
    errorMsg,
    helperText,
    layout = "vertical",
    ...otherProps
  } = props;

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
  const labelSuffix = useLabelSuffix(required, false);

  // We use useRadioGroup b/c it does neat keyboard up/down stuff
  // TODO: Pass read only, error message to useRadioGroup
  const { labelProps, radioGroupProps } = useRadioGroup({ label, isDisabled: disabled, isRequired: required }, state);

  return (
    // default styling to position `<Label />` above.
    <div css={Css.df.fdc.gap1.aifs.if(labelStyle === "left").fdr.gap2.jcsb.$} {...tid}>
      <Label label={label} {...labelProps} {...tid.label} suffix={labelSuffix} hidden={labelStyle === "hidden"} />
      <div {...radioGroupProps}>
        <div css={Css.df.if(layout === "horizontal").fdr.fww.gap3.else.fdc.gap1.$}>
          {options.map((option) => {
            return (
              <Fragment key={option.value}>
                {maybeTooltip({
                  title: resolveTooltip(option.disabled),
                  placement: "bottom",
                  children: (
                    <Radio
                      parentId={name}
                      option={option}
                      state={state}
                      isOptionDisabled={!!option.disabled}
                      {...otherProps}
                      {...tid[option.value]}
                    />
                  ),
                })}
              </Fragment>
            );
          })}
        </div>
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
  // Per-option disabled flag, kept separate from state to avoid spreading RadioGroupState.
  // react-aria uses a WeakMap keyed by the state object identity to store radio group
  // metadata, so spreading state into a new object breaks the lookup.
  isOptionDisabled?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}) {
  const {
    parentId,
    option: { description, label, value, image },
    state,
    isOptionDisabled,
    ...others
  } = props;

  const labelId = `${parentId}-${value}-label`;
  const descriptionId = `${parentId}-${value}-description`;
  const ref = useRef<HTMLInputElement>(null);
  // Pass per-option isDisabled via useRadio's props rather than overriding state.isDisabled.
  // useRadio merges props.isDisabled with state.isDisabled internally (props.isDisabled || state.isDisabled).
  const { inputProps, isDisabled } = useRadio(
    { value, "aria-labelledby": labelId, isDisabled: isOptionDisabled },
    state,
    ref,
  );
  const disabled = isDisabled;
  const isSelected = !disabled && state.selectedValue === value;
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  return (
    <label
      css={{
        ...Css.df.cursorPointer.if(disabled).add("cursor", "initial").$,
        ...(image && Css.aic.gap1.$),
      }}
      {...hoverProps}
    >
      <input
        type="radio"
        ref={ref}
        css={{
          ...radioReset,
          ...radioDefault,
          ...getRadioStateStyles({ isDisabled: disabled, isSelected }),
          ...(isHovered && !disabled ? radioHover : {}),
          ...(isFocusVisible ? radioFocus : {}),
          // Without an image, nudge down so the center of the circle lines up with the label text.
          // With an image, the label is hidden and `gap1` on the label above handles spacing instead.
          ...(image ? Css.fs0.$ : Css.mtPx(2).mr1.$),
        }}
        disabled={disabled}
        aria-labelledby={labelId}
        {...inputProps}
        {...focusProps}
        // Put others here b/c it could have data-testid in it or onX events.
        {...others}
      />
      {image ? (
        <>
          {/* Kept for accessibility; the image stands in for the visible label. */}
          <VisuallyHidden>
            <span id={labelId}>{label}</span>
          </VisuallyHidden>
          <div css={Css.sqPx(120).ba.bw1.bcGray200.br8.bgWhite.df.aic.jcc.oh.p1.fs0.$}>
            <img src={image} alt="" css={Css.w100.h100.objectContain.$} />
          </div>
        </>
      ) : (
        <div>
          <div
            id={labelId}
            css={Css.sm.gray800.if(disabled).gray400.$}
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
      )}
    </label>
  );
}
