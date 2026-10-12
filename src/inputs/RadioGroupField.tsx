import { Fragment, type ReactNode, useMemo, useRef } from "react";
import { mergeProps, useFocusRing, useHover, usePress, useRadio, useRadioGroup, VisuallyHidden } from "react-aria";
import { type RadioGroupState, useRadioGroupState } from "react-stately";
import { HelperText } from "src/components/HelperText";
import { Label } from "src/components/Label";
import type { PresentationFieldProps } from "src/components/PresentationContext";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css, Tokens } from "src/Css";
import { useLabelSuffix } from "src/forms/labelUtils";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { getRadioStateStyles, radioDefault, radioFocus, radioHover, radioReset } from "src/inputs/internal/radioStyles";
import type { StyledRadioProps } from "src/inputs/StyledRadio";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

let nextNameId = 0;

export type RadioFieldOption<K extends string> = {
  // testId?: string;
  /** The label for a specific option, i.e. "Cheddar". */
  label: string;
  /** An optional longer description to render under the label. Not shown for `layout="thumbnail"`. */
  description?: string | (() => ReactNode);
  /** The undisplayed value, i.e. an id of some sort. */
  value: K;
  /** Disable only specific option, with an optional reason */
  disabled?: boolean | ReactNode;
  /** The image to show for this option, i.e. a material swatch. Only used by `layout="thumbnail"`. */
  imgSrc?: string;
};

export type RadioGroupFieldLayout = "vertical" | "horizontal" | "thumbnail";

export type RadioGroupFieldProps<K extends string, O extends RadioFieldOption<K> = RadioFieldOption<K>> = {
  /** The label for the choice itself, i.e. "Favorite Cheese". */
  label: string;
  /** Adds tooltip for the field, shown via an info icon beside the label. */
  tooltip?: ReactNode;
  /** The currently selected option value (i.e. an id). */
  value: K | undefined;
  /** Called when an option is selected. We don't support unselecting. */
  onChange: (value: K) => void;
  /** The list of options. */
  options: (RadioFieldOption<K> & O)[];
  disabled?: boolean;
  /** Whether the field is required. When true, renders the required suffix (i.e. "*") next to the label. */
  required?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  /** The options' arrangement. Defaults to "vertical". */
  layout?: RadioGroupFieldLayout;
  /**
   * Renders each option's whole row, like a title, price and images. Not used by `layout="thumbnail"`.
   *
   * Wrap the row in a `<label>` and place `<StyledRadio {...radioProps} />` inside it, so a click anywhere in the row
   * selects the option.
   */
  renderOption?: (option: RadioFieldOption<K> & O, radioProps: StyledRadioProps) => ReactNode;
} & Pick<PresentationFieldProps, "labelStyle">;

/**
 * Provides a radio group with label.
 *
 * This is generally meant to be used in a form vs. being raw radio buttons.
 *
 * TODO: Add hover (non selected and selected) styles
 */
export function RadioGroupField<K extends string, O extends RadioFieldOption<K> = RadioFieldOption<K>>(
  props: RadioGroupFieldProps<K, O>,
) {
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
    tooltip,
    renderOption,
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

  const isThumbnail = layout === "thumbnail";
  // Custom rows stretch to the field's width, or fill the space beside a left label.
  const stretchOptions = !!renderOption && !isThumbnail;

  return (
    // default styling to position `<Label />` above.
    <div css={Css.df.fdc.gap1.aifs.if(labelStyle === "left").fdr.gap2.jcsb.$} {...tid}>
      <Label
        label={label}
        {...labelProps}
        {...tid.label}
        suffix={labelSuffix}
        tooltip={tooltip}
        hidden={labelStyle === "hidden"}
      />
      <div
        {...radioGroupProps}
        css={Css.if(stretchOptions && labelStyle === "left").fg1.end.if(stretchOptions && labelStyle !== "left").w100.$}
      >
        <div css={Css.df.fdc.gap1.if(layout !== "vertical").fdr.fww.end.if(layout === "horizontal").gap3.$}>
          {options.map((option) => {
            const radioProps = {
              option,
              state,
              isOptionDisabled: !!option.disabled,
              ...otherProps,
              ...tid[option.value],
            };
            return (
              <Fragment key={option.value}>
                {isThumbnail ? (
                  <ThumbnailRadio {...radioProps} />
                ) : renderOption ? (
                  <CustomRadio {...radioProps} renderOption={renderOption} />
                ) : (
                  <Radio parentId={name} {...radioProps} />
                )}
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
    option: { description, label, value, disabled: disabledReason },
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

  return maybeTooltip({
    title: resolveTooltip(disabledReason),
    placement: "bottom",
    children: (
      <label css={Css.df.cursorPointer.if(disabled).add("cursor", "initial").$} {...hoverProps}>
        <input
          type="radio"
          ref={ref}
          css={{
            ...radioReset,
            ...radioDefault,
            ...getRadioStateStyles({ isDisabled: disabled, isSelected }),
            ...(isHovered && !disabled ? radioHover : {}),
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
            css={Css.sm.color(Tokens.OnSurface).if(disabled).color(Tokens.TextDisabled).$}
            {...(description ? { "aria-describedby": descriptionId } : {})}
          >
            {label}
          </div>
          {description && (
            <div id={descriptionId} css={Css.sm.color(Tokens.OnSurfaceMuted).if(disabled).color(Tokens.TextDisabled).$}>
              {typeof description === "function" ? description() : description}
            </div>
          )}
        </div>
      </label>
    ),
  });
}

/**
 * A radio option that the caller lays out with `renderOption`.
 *
 * We handle the radio's state and accessibility, and pass the caller `StyledRadioProps` to render the circle with.
 */
function CustomRadio<K extends string, O extends RadioFieldOption<K>>(props: {
  option: O;
  state: RadioGroupState;
  // Per-option disabled flag, kept separate from state; see `Radio` for why.
  isOptionDisabled?: boolean;
  renderOption: (option: O, radioProps: StyledRadioProps) => ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
}) {
  const { option, state, isOptionDisabled, renderOption, ...others } = props;
  const ref = useRef<HTMLInputElement>(null);
  // The caller's row has no label element for us to point at, so the option's label is the accessible name.
  const { inputProps, isDisabled } = useRadio(
    { value: option.value, "aria-label": option.label, isDisabled: isOptionDisabled },
    state,
    ref,
  );
  // Like `Radio`, a disabled option doesn't show as selected.
  const isSelected = !isDisabled && state.selectedValue === option.value;
  const { focusProps, isFocusVisible } = useFocusRing();

  return maybeTooltip({
    title: resolveTooltip(option.disabled),
    placement: "bottom",
    children: renderOption(option, {
      // Merge others last b/c it could have data-testid in it or onX events.
      inputProps: { ...mergeProps(inputProps, focusProps, others), ref },
      isSelected,
      isDisabled,
      isFocusVisible,
    }),
  });
}

/**
 * A radio rendered as an image swatch, for `layout="thumbnail"`.
 *
 * The real `<input>` is visually hidden inside the `<label>`, so clicks, keyboard navigation and form semantics all
 * stay native, while the option's label is its accessible name rather than visible text.
 */
function ThumbnailRadio<K extends string>(props: {
  option: RadioFieldOption<K>;
  state: RadioGroupState;
  // Per-option disabled flag, kept separate from state; see `Radio` for why.
  isOptionDisabled?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}) {
  const {
    option: { label, value, imgSrc, disabled: disabledReason },
    state,
    isOptionDisabled,
    ...others
  } = props;

  const ref = useRef<HTMLInputElement>(null);
  const { inputProps, isDisabled } = useRadio({ value, "aria-label": label, isDisabled: isOptionDisabled }, state, ref);
  // Like `Radio`, a disabled option doesn't show as selected.
  const isSelected = !isDisabled && state.selectedValue === value;
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled });
  // preventFocusOnPress keeps a mouse click from reading as "virtual" focus and showing the keyboard
  // focus ring; see `SelectCardShell` for the full story. Keyboard focus goes straight to the input.
  const { pressProps, isPressed } = usePress({ isDisabled, preventFocusOnPress: true });

  return maybeTooltip({
    // Thumbnails have no visible text, so their label doubles as the tooltip, unless there's a disabled reason.
    title: resolveTooltip(disabledReason) ?? label,
    placement: "top",
    children: (
      <label
        css={{
          // The padding over the white background is the inner ring between the border and the image.
          ...Css.db.fs0.sqPx(32).pPx(2).br8.ba.bc(Tokens.FieldBorderDefault).bgColor(Tokens.SurfaceRaised).outline(0)
            .cursorPointer.$,
          // Lets a wrapping `Carousel` snap to each thumbnail.
          ...Css.ssa("start").$,
          ...(isHovered && !isFocusVisible ? Css.bshHover.$ : {}),
          ...(isSelected || isPressed ? Css.bc(Tokens.Primary).$ : {}),
          ...(isFocusVisible ? Css.bshFocus.$ : {}),
          ...(isDisabled ? Css.cursorNotAllowed.$ : {}),
        }}
        data-selected={isSelected}
        data-disabled={isDisabled}
        {...mergeProps(hoverProps, pressProps)}
      >
        {/* A span, b/c this sits inside the thumbnail's `<label>`, where a `<div>` isn't valid HTML. */}
        <VisuallyHidden elementType="span">
          {/* Merge others last b/c it could have data-testid in it or onX events. */}
          <input {...mergeProps(inputProps, focusProps, others)} ref={ref} />
        </VisuallyHidden>
        <span css={Css.relative.db.w100.h100.oh.br4.$}>
          <img src={imgSrc} alt={label} loading="lazy" css={Css.w100.h100.objectCover.db.if(isDisabled).o50.$} />
          {(isSelected || isPressed) && (
            <span
              css={{
                ...Css.absolute.top0.left0.w100.h100.pen.$,
                ...(isSelected ? Css.bgColor(Tokens.SelectionFill).add("mixBlendMode", "multiply").$ : {}),
                ...(isPressed ? Css.bgColor(Tokens.Primary).o(0.28).add("mixBlendMode", "normal").$ : {}),
              }}
            />
          )}
        </span>
      </label>
    ),
  });
}
