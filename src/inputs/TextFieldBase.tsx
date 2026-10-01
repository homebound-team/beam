import React, {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  type TextareaHTMLAttributes,
  useState,
} from "react";
import type { NumberFieldAria } from "react-aria";
import { chain, mergeProps, useFocusWithin, useHover } from "react-aria";
import { HelperText } from "src/components/HelperText";
import { Icon } from "src/components/Icon";
import { IconButton } from "src/components/IconButton";
import { InlineLabel, Label } from "src/components/Label";
import { usePresentationContext } from "src/components/PresentationContext";
import { OriginalValue, ProposedValue } from "src/components/ProposedValue";
import { BorderHoverChild } from "src/components/Table/components/Row";
import { maybeTooltip } from "src/components/Tooltip";
// Side-effect import: injects CSS for the border-hover-on-row pattern
import "src/components/Table/components/Row.css";
import { Css, type Only, Tokens } from "src/Css";
import { useLabelSuffix } from "src/forms/labelUtils";
import { useGetRef } from "src/hooks/useGetRef";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { getFieldChrome } from "src/inputs/fieldChrome";
import type { BeamTextFieldProps, TextFieldInternalProps, TextFieldXss } from "src/interfaces";
import { defaultTestId } from "src/utils/defaultTestId";
import { maybeCall } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

export type TextFieldBaseProps<X> = {
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>;
  inputRef?: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  inputWrapRef?: MutableRefObject<HTMLDivElement | null>;
  multiline?: boolean;
  groupProps?: NumberFieldAria["groupProps"];
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
  clearable?: boolean;
  // TextArea specific
  textAreaMinHeight?: number;
  hideErrorMessage?: boolean;
  // If set, the helper text will always be shown (usually we hide the helper text if read only)
  alwaysShowHelperText?: boolean;
  // Replaces empty input field and placeholder with node
  // IE: Multiselect renders list of selected items in the input field
  unfocusedPlaceholder?: ReactNode;
  /** Value proposed by an AI model; puts the field in AI mode. Pre-formatted for display. */
  proposedValue?: string;
  /** The formatted value on record, rendered struck through below the field. Independent of `proposedValue`. */
  originalValue?: string;
  /** Called on any edit the user makes, so the owning field can end AI mode. */
  onUserEdit?: VoidFunction;
  /** Called when the user leaves the field, so the owning field can retire the struck-through original. */
  onUserBlur?: VoidFunction;
  /** Allow focusing without selecting, i.e. to let the user keep typing after we've pre-filled text + called focus, like the Add New component. */
  selectOnFocus?: boolean;
} & Pick<
  BeamTextFieldProps<X>,
  | "label"
  | "tooltip"
  | "required"
  | "errorMsg"
  | "errorInTooltip"
  | "onBlur"
  | "onFocus"
  | "helperText"
  | "labelStyle"
  | "placeholder"
  | "compact"
  | "borderless"
  | "borderOnHover"
  | "visuallyDisabled"
  | "fullWidth"
  | "xss"
  | "inputStylePalette"
> &
  Partial<Pick<BeamTextFieldProps<X>, "onChange">>;

// Used by both TextField and TextArea
export function TextFieldBase<X extends Only<TextFieldXss, X>>(props: TextFieldBaseProps<X>) {
  const { fieldProps, wrap = false } = usePresentationContext();
  const { labelLeftFieldWidth = "50%" } = fieldProps ?? {};
  const {
    label,
    tooltip,
    required,
    labelProps,
    inputProps,
    inputRef,
    inputWrapRef,
    groupProps,
    compact = fieldProps?.compact ?? false,
    errorMsg,
    helperText,
    multiline = false,
    onChange,
    onBlur,
    onFocus,
    xss,
    endAdornment,
    startAdornment,
    labelStyle = fieldProps?.labelStyle ?? "above",
    borderless = fieldProps?.borderless ?? false,
    borderOnHover = fieldProps?.borderOnHover ?? false,
    textAreaMinHeight = 96,
    clearable = false,
    visuallyDisabled = fieldProps?.visuallyDisabled ?? true,
    errorInTooltip = fieldProps?.errorInTooltip ?? false,
    hideErrorMessage = false,
    alwaysShowHelperText = false,
    fullWidth = fieldProps?.fullWidth ?? false,
    unfocusedPlaceholder,
    selectOnFocus = true,
    inputStylePalette,
    proposedValue,
    originalValue,
    onUserEdit,
    onUserBlur,
  } = props;

  const typeScale = fieldProps?.typeScale ?? "sm";
  const internalProps: TextFieldInternalProps = (props as any).internalProps || {};
  const { compound = false, forceFocus = false, forceHover = false } = internalProps;
  // A field has exactly one tooltip. It lives on the label's info icon whenever there is a visible
  // label to hang it on. With no visible label it falls back to wrapping the field, but only while
  // the field is non-interactive — a tooltip on top of an enabled input does not behave, so there we
  // drop it rather than render something broken (tables should put the tooltip on the column header).
  const hasVisibleLabel = !!label && labelStyle !== "inline" && labelStyle !== "hidden" && !compound;
  const isInteractive = !inputProps.disabled && !inputProps.readOnly;
  const tooltipLocation = hasVisibleLabel ? "label" : !isInteractive ? "field" : undefined;
  const errorMessageId = `${inputProps.id}-error`;
  const labelSuffix = useLabelSuffix(required, inputProps.readOnly);
  const tid = useTestIds(props, defaultTestId(label));
  const [isFocused, setIsFocused] = useState(false);
  const { hoverProps, isHovered } = useHover({});
  const { focusWithinProps } = useFocusWithin({ onFocusWithinChange: setIsFocused });
  const fieldRef = useGetRef(inputRef);

  // Takes precedence over the `inputStylePalette` / `borderless` / `borderOnHover` backgrounds below.
  const showProposal = proposedValue !== undefined;
  const showOriginal = originalValue !== undefined && originalValue !== "";
  // Read-only draws both halves inline instead, since it renders no field for the original to sit under,
  // and a compound field's halves sit inside its own bordered boxes, so it owns everything below them.
  const originalBelow = showOriginal && !inputProps.readOnly && !compound ? originalValue : undefined;
  // Compound fields draw their own; otherwise supporting copy is noise on a field nobody can edit.
  const showErrorAndHelper = alwaysShowHelperText || (!compound && !inputProps.disabled && !inputProps.readOnly);

  const fieldChrome = getFieldChrome({
    typeScale,
    labelStyle,
    labelLeftFieldWidth,
    compact,
    borderless,
    borderOnHover,
    fullWidth,
    visuallyDisabled,
    isHovered,
    compound,
    multiline,
    showProposal,
    inputStylePalette,
  });

  const fieldStyles = {
    container: fieldChrome.container,
    inputWrapper: fieldChrome.control,
    // Border-hover-on-row styling is handled by Row.css.ts (imported above as a side-effect)
    inputWrapperReadOnly: fieldChrome.readOnly,
    input: {
      ...Css.w100.mw0.outline0.fg1.bgTransparent
        .if(!inputStylePalette)
        .element("::selection")
        .bgColor(Tokens.TextSelection).$,
      // For "multiline" fields we add top and bottom padding of 7px for compact, or 11px for non-compact, to properly match the height of the single line fields
      ...(multiline
        ? Css.br4.pyPx(compact ? 7 : textFieldBaseMultilineTopPadding).add("resize", "none").$
        : Css.truncate.$),
      ...(showProposal ? Css.fw6.color(Tokens.AiFieldFg).$ : {}),
    },
    hover: fieldChrome.hover,
    focus: fieldChrome.focus,
    disabled: fieldChrome.disabled,
    error: fieldChrome.error,
  };

  // Watch for each WIP change, convert empty to undefined, and call the user's onChange
  function onDomChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    // Every field's text entry lands here, so this is where AI mode ends for typed edits.
    maybeCall(onUserEdit);
    if (onChange) {
      let value: string | undefined = e.target.value;
      if (value === "") {
        value = undefined;
      }
      onChange(value);
    }
  }

  const onFocusChained = chain((e: FocusEvent<HTMLInputElement> | FocusEvent<HTMLTextAreaElement>) => {
    // Only select on real user focus events, not synthetic ones (e.g., react-aria's dispatchVirtualFocus).
    if (selectOnFocus && e.isTrusted) e.target.select();
  }, onFocus);

  // Simulate clicking `ElementType` when using an unfocused placeholder
  function handleUnfocusedPlaceholderClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    fieldRef.current?.click();
  }

  const showFocus = (isFocused && !inputProps.readOnly) || forceFocus;
  const showHover = (isHovered && !inputProps.disabled && !inputProps.readOnly && !isFocused) || forceHover;
  const fieldElementProps = mergeProps(
    inputProps,
    { onBlur: chain(() => maybeCall(onUserBlur), onBlur), onFocus: onFocusChained, onChange: onDomChange },
    { "aria-invalid": Boolean(errorMsg), ...(labelStyle === "hidden" ? { "aria-label": label } : {}) },
    // Mirrors `data-readonly`, so callers and tests can see the AI treatment without reading styles.
    { ...(showProposal ? { "data-ai-mode": "true" } : {}) },
  );
  const errorMessageProps = errorMsg ? { "aria-errormessage": errorMessageId } : {};
  const fieldElementCss = {
    ...fieldStyles.input,
    ...(inputProps.disabled ? fieldStyles.disabled : {}),
    ...(showHover ? fieldStyles.hover : {}),
    ...(unfocusedPlaceholder && !isFocused && Css.visuallyHidden.$),
    ...xss,
  };

  return (
    <>
      <div css={fieldStyles.container} {...groupProps} {...focusWithinProps}>
        {/* TODO: place the label */}
        {label && labelStyle !== "inline" && (
          <Label
            labelProps={labelProps}
            hidden={labelStyle === "hidden" || compound}
            label={label}
            inline={labelStyle !== "above"}
            suffix={labelSuffix}
            tooltip={tooltipLocation === "label" ? tooltip : undefined}
            {...tid.label}
          />
        )}
        {maybeTooltip({
          title: tooltipLocation === "field" ? tooltip : undefined,
          placement: "top",
          children: inputProps.readOnly ? (
            <div
              css={{
                // Use input wrapper to get common styles, but then we need to override some
                ...fieldStyles.inputWrapperReadOnly,
                ...(multiline ? Css.fdc.aifs.gap2.$ : Css.if(!wrap).truncate.$),
                ...xss,
              }}
              data-readonly="true"
              data-ai-mode={showProposal ? "true" : undefined}
              {...tid}
            >
              {labelStyle === "inline" && label && (
                <InlineLabel
                  multiline={multiline}
                  labelProps={labelProps}
                  label={label}
                  disabled={!!inputProps.disabled && visuallyDisabled}
                  {...tid.label}
                />
              )}
              {showProposal ? (
                // Read-only renders no input at all, so both halves are drawn as text here. Checked
                // before `multiline` so a read-only TextAreaField still shows the struck-through original.
                <ProposedValue
                  original={showOriginal ? originalValue : undefined}
                  proposed={proposedValue}
                  {...tid.proposedValue}
                />
              ) : multiline ? (
                (inputProps.value as string | undefined)?.split("\n\n").map((p, i) => (
                  <p key={i} css={Css.py1.$}>
                    {p.split("\n").map((sentence, j) => (
                      <span key={j}>
                        {sentence}
                        <br />
                      </span>
                    ))}
                  </p>
                ))
              ) : (
                inputProps.value
              )}
            </div>
          ) : (
            <div
              css={{
                ...fieldStyles.inputWrapper,
                ...(inputProps.disabled ? fieldStyles.disabled : {}),
                ...(showFocus ? fieldStyles.focus : {}),
                ...(showHover ? fieldStyles.hover : {}),
                // Only show error styles if the field is not disabled, following the pattern that the error message is also hidden
                ...(errorMsg && !inputProps.disabled ? fieldStyles.error : {}),
                ...Css.if(multiline).aifs.oh.mhPx(textAreaMinHeight).$,
              }}
              // Class name used for the grid table on row hover for highlighting
              className={BorderHoverChild}
              {...hoverProps}
              ref={inputWrapRef as any}
              onClick={unfocusedPlaceholder ? handleUnfocusedPlaceholderClick : undefined}
            >
              {labelStyle === "inline" && label && (
                <InlineLabel
                  multiline={multiline}
                  labelProps={labelProps}
                  label={label}
                  disabled={!!inputProps.disabled && visuallyDisabled}
                  {...tid.label}
                />
              )}
              {startAdornment && <span css={Css.df.aic.asc.fs0.br4.pr1.$}>{startAdornment}</span>}
              {unfocusedPlaceholder && (
                <div
                  // Setting -1 tabIndex as this is a scrollable container, which is focusable by default.
                  // However, we want the user's focus to move to the field element, which will hide this container.
                  tabIndex={-1}
                  {...tid.unfocusedPlaceholderContainer}
                  css={{
                    ...Css.df.asc.w100.maxhPx(74).oa.$,
                    ...fieldStyles.input,
                    // Multiline grows, so top-align like the textarea's own text.
                    ...(multiline && Css.asfs.$),
                    ...(showHover ? fieldStyles.hover : {}),
                    ...(inputProps.disabled ? fieldStyles.disabled : {}),
                    ...(isFocused && Css.visuallyHidden.$),
                  }}
                >
                  {unfocusedPlaceholder}
                </div>
              )}
              {multiline ? (
                <textarea
                  {...(fieldElementProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
                  {...errorMessageProps}
                  ref={fieldRef as MutableRefObject<HTMLTextAreaElement | null>}
                  rows={1}
                  css={fieldElementCss}
                  {...tid}
                />
              ) : (
                <input
                  {...(fieldElementProps as InputHTMLAttributes<HTMLInputElement>)}
                  {...errorMessageProps}
                  ref={fieldRef as MutableRefObject<HTMLInputElement | null>}
                  css={fieldElementCss}
                  {...tid}
                />
              )}
              {isFocused && clearable && onChange && inputProps.value && (
                <IconButton
                  icon="xCircle"
                  color={Tokens.OnSurfaceMuted}
                  onClick={() => {
                    maybeCall(onUserEdit);
                    onChange(undefined);
                    // Reset focus to input element
                    fieldRef.current?.focus();
                  }}
                />
              )}
              {errorInTooltip && errorMsg && !hideErrorMessage && (
                <span css={Css.df.aic.asc.pl1.fs0.$}>
                  <Icon icon="error" color={Tokens.Danger} tooltip={errorMsg} />
                </span>
              )}
              {endAdornment && <span css={Css.df.aic.asc.pl1.fs0.$}>{endAdornment}</span>}
            </div>
          ),
        })}
        {labelStyle !== "left" && (
          <>
            {/* Outside `showErrorAndHelper`, because a disabled field still shows what it's replacing. */}
            {originalBelow && <OriginalValue originalValue={originalBelow} {...tid.originalValue} />}
            {showErrorAndHelper && (
              <>
                {errorMsg && !errorInTooltip && (
                  <ErrorMessage id={errorMessageId} errorMsg={errorMsg} hidden={hideErrorMessage} {...tid.errorMsg} />
                )}
                {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
              </>
            )}
          </>
        )}
      </div>
      {/* Original value, error message, and helper text for the deprecated "left" labelStyle, whose container is a row.
       * Shifted half the container width so it sits under the field instead of the label. */}
      {labelStyle === "left" &&
        (originalBelow ||
          alwaysShowHelperText ||
          (!compound &&
            !inputProps.disabled &&
            !inputProps.readOnly &&
            ((errorMsg && !errorInTooltip) || helperText))) && (
          // Reduces the margin between the error/helper text and input field
          <div css={Css.mtPx(-8).ml("50%").$}>
            {originalBelow && <OriginalValue originalValue={originalBelow} {...tid.originalValue} />}
            {showErrorAndHelper && (
              <>
                {errorMsg && !errorInTooltip && (
                  <ErrorMessage id={errorMessageId} errorMsg={errorMsg} hidden={hideErrorMessage} {...tid.errorMsg} />
                )}
                {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
              </>
            )}
          </div>
        )}
    </>
  );
}

// Prevents text from being cutoff
// We don't care about `compact` using 7 because we have no `compact` TextAreaField
export const textFieldBaseMultilineTopPadding = 11;
