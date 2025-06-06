import type { NumberFieldAria } from "@react-aria/numberfield";
import React, {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  MutableRefObject,
  ReactNode,
  TextareaHTMLAttributes,
  useState,
} from "react";
import { chain, mergeProps, useFocusWithin, useHover } from "react-aria";
import { Icon, IconButton, maybeTooltip } from "src/components";
import { HelperText } from "src/components/HelperText";
import { InlineLabel, Label } from "src/components/Label";
import { InputStylePalette, usePresentationContext } from "src/components/PresentationContext";
import { BorderHoverChild, BorderHoverParent } from "src/components/Table/components/Row";
import { Css, Only, Palette } from "src/Css";
import { useLabelSuffix } from "src/forms/labelUtils";
import { useGetRef } from "src/hooks/useGetRef";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { getFieldWidth } from "src/inputs/utils";
import { BeamTextFieldProps, TextFieldInternalProps, TextFieldXss } from "src/interfaces";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

export interface TextFieldBaseProps<X>
  extends Pick<
      BeamTextFieldProps<X>,
      | "label"
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
    >,
    Partial<Pick<BeamTextFieldProps<X>, "onChange">> {
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>;
  inputRef?: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  inputWrapRef?: MutableRefObject<HTMLDivElement | null>;
  multiline?: boolean;
  groupProps?: NumberFieldAria["groupProps"];
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
  contrast?: boolean;
  clearable?: boolean;
  // TextArea specific
  textAreaMinHeight?: number;
  tooltip?: ReactNode;
  hideErrorMessage?: boolean;
  // If set, the helper text will always be shown (usually we hide the helper text if read only)
  alwaysShowHelperText?: boolean;
  // Replaces empty input field and placeholder with node
  // IE: Multiselect renders list of selected items in the input field
  unfocusedPlaceholder?: ReactNode;
  /** Allow focusing without selecting, i.e. to let the user keep typing after we've pre-filled text + called focus, like the Add New component. */
  selectOnFocus?: boolean;
}

// Used by both TextField and TextArea
export function TextFieldBase<X extends Only<TextFieldXss, X>>(props: TextFieldBaseProps<X>) {
  const { fieldProps, wrap = false } = usePresentationContext();
  const { labelLeftFieldWidth = "50%" } = fieldProps ?? {};
  const {
    label,
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
    contrast = false,
    borderless = fieldProps?.borderless ?? false,
    borderOnHover = fieldProps?.borderOnHover ?? false,
    textAreaMinHeight = 96,
    clearable = false,
    tooltip,
    visuallyDisabled = fieldProps?.visuallyDisabled ?? true,
    errorInTooltip = fieldProps?.errorInTooltip ?? false,
    hideErrorMessage = false,
    alwaysShowHelperText = false,
    fullWidth = fieldProps?.fullWidth ?? false,
    unfocusedPlaceholder,
    selectOnFocus = true,
    inputStylePalette,
  } = props;

  const typeScale = fieldProps?.typeScale ?? (inputProps.readOnly && labelStyle !== "hidden" ? "smMd" : "sm");
  const internalProps: TextFieldInternalProps = (props as any).internalProps || {};
  const { compound = false, forceFocus = false, forceHover = false } = internalProps;
  const errorMessageId = `${inputProps.id}-error`;
  const labelSuffix = useLabelSuffix(required, inputProps.readOnly);
  const ElementType: React.ElementType = multiline ? "textarea" : "input";
  const tid = useTestIds(props, defaultTestId(label));
  const [isFocused, setIsFocused] = useState(false);
  const { hoverProps, isHovered } = useHover({});
  const { focusWithinProps } = useFocusWithin({ onFocusWithinChange: setIsFocused });
  const fieldRef = useGetRef(inputRef);

  const maybeSmaller = compound ? 2 : 0;
  const fieldHeight = 40;
  const compactFieldHeight = 32;

  const [bgColor, hoverBgColor, disabledBgColor] = inputStylePalette
    ? getInputStylePalette(inputStylePalette)
    : contrast
      ? [Palette.Gray700, Palette.Gray600, Palette.Gray700]
      : borderOnHover
        ? // Use transparent backgrounds to blend with the table row hover color
          [Palette.Transparent, Palette.Blue100, Palette.Gray100]
        : borderless && !compound
          ? [Palette.Gray100, Palette.Gray200, Palette.Gray200]
          : [Palette.White, Palette.Gray100, Palette.Gray100];

  const fieldMaxWidth = getFieldWidth(fullWidth);

  const fieldStyles = {
    container: Css.df.fdc.w100.maxw(fieldMaxWidth).relative.if(labelStyle === "left").maxw100.fdr.gap2.jcsb.aic.$,
    inputWrapper: {
      ...Css[typeScale].df.aic.br4.px1.w100
        .bgColor(bgColor)
        .gray900.if(contrast && !inputStylePalette)
        .white.if(labelStyle === "left")
        .w(labelLeftFieldWidth).$,
      // When borderless then perceived vertical alignments are misaligned. As there is no longer a border, then the field looks oddly indented.
      // This typically happens in tables when a column has a mix of static text (i.e. "roll up" rows and table headers) and input fields.
      // To remedy this perceived misalignment then we increase the width by the horizontal padding applied (16px), and set a negative margin left margin to re-center the field.
      // Note: Do not modify width and position of 'compound' fields.
      ...(borderless && !compound
        ? Css.bcTransparent.w("calc(100% + 16px)").ml(-1).$
        : Css.bcGray300.if(contrast).bcGray700.$),
      // Do not add borders to compound fields. A compound field is responsible for drawing its own borders
      ...(!compound ? Css.ba.$ : {}),
      ...(borderOnHover && Css.br4.ba.bcTransparent.add("transition", "border-color 200ms").$),
      ...(borderOnHover && Css.if(isHovered).bgColor(hoverBgColor).ba.bcBlue300.$),
      ...{
        // Highlight the field when hovering over the row in a table, unless some other edit component (including ourselves) is hovered
        [`.${BorderHoverParent}:hover:not(:has(.${BorderHoverChild}:hover)) &`]: Css.ba.bcBlue300.$,
      },
      // When multiline is true, then we want to allow the field to grow to the height of the content, but not shrink below the minHeight
      // Otherwise, set fixed heights values accordingly.
      ...(multiline
        ? Css.mhPx(fieldHeight - maybeSmaller)
            .if(compact)
            .mhPx(compactFieldHeight - maybeSmaller).$
        : Css.hPx(fieldHeight - maybeSmaller)
            .if(compact)
            .hPx(compactFieldHeight - maybeSmaller).$),
    },
    inputWrapperReadOnly: {
      ...Css[typeScale].df.aic.w100.gray900
        .if(contrast && !inputStylePalette)
        .white.if(labelStyle === "left")
        .w(labelLeftFieldWidth).$,
      // If we are hiding the label, then we are typically in a table. Keep the `mh` in this case to ensure editable and non-editable fields in a single table row line up properly
      ...(labelStyle === "hidden" &&
        Css.mhPx(fieldHeight - maybeSmaller)
          .if(compact)
          .mhPx(compactFieldHeight - maybeSmaller).$),
    },
    input: {
      ...Css.w100.mw0.outline0.fg1.bgColor(bgColor).$,
      // Not using Truss's inline `if` statement here because `addIn` properties do not respect the if statement.
      ...(contrast && !inputStylePalette && Css.addIn("&::selection", Css.bgGray800.$).$),
      // Make the background transparent when highlighting the field on hover
      ...(borderOnHover && Css.bgTransparent.$),
      // For "multiline" fields we add top and bottom padding of 7px for compact, or 11px for non-compact, to properly match the height of the single line fields
      ...(multiline ? Css.br4.pyPx(compact ? 7 : 11).add("resize", "none").$ : Css.truncate.$),
    },
    hover: Css.bgColor(hoverBgColor).if(contrast).bcGray600.$,
    focus: Css.bcBlue700.if(contrast).bcBlue500.if(borderOnHover).bgColor(hoverBgColor).bcBlue500.$,
    disabled: visuallyDisabled
      ? Css.cursorNotAllowed.gray600.bgColor(disabledBgColor).if(contrast).gray500.$
      : Css.cursorNotAllowed.$,
    error: Css.bcRed600.if(contrast).bcRed400.$,
  };

  // Watch for each WIP change, convert empty to undefined, and call the user's onChange
  function onDomChange(e: ChangeEvent<HTMLInputElement>) {
    if (onChange) {
      let value: string | undefined = e.target.value;
      if (value === "") {
        value = undefined;
      }
      onChange(value);
    }
  }

  const onFocusChained = chain((e: FocusEvent<HTMLInputElement> | FocusEvent<HTMLTextAreaElement>) => {
    if (selectOnFocus) e.target.select();
  }, onFocus);

  // Simulate clicking `ElementType` when using an unfocused placeholder
  function handleUnfocusedPlaceholderClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    fieldRef.current?.click();
  }

  const showFocus = (isFocused && !inputProps.readOnly) || forceFocus;
  const showHover = (isHovered && !inputProps.disabled && !inputProps.readOnly && !isFocused) || forceHover;

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
            contrast={contrast}
            {...tid.label}
          />
        )}
        {maybeTooltip({
          title: tooltip,
          placement: "top",
          children: inputProps.readOnly ? (
            <div
              css={{
                // Use input wrapper to get common styles, but then we need to override some
                ...fieldStyles.inputWrapperReadOnly,
                ...(multiline ? Css.fdc.aifs.gap2.$ : Css.if(wrap === false).truncate.$),
                ...xss,
              }}
              className={BorderHoverChild}
              data-readonly="true"
              {...tid}
            >
              {labelStyle === "inline" && label && (
                <InlineLabel multiline={multiline} labelProps={labelProps} label={label} {...tid.label} />
              )}
              {multiline
                ? (inputProps.value as string | undefined)?.split("\n\n").map((p, i) => (
                    <p key={i} css={Css.py1.$}>
                      {p.split("\n").map((sentence, j) => (
                        <span key={j}>
                          {sentence}
                          <br />
                        </span>
                      ))}
                    </p>
                  ))
                : inputProps.value}
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
                <InlineLabel multiline={multiline} labelProps={labelProps} label={label} {...tid.label} />
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
                    ...(showHover ? fieldStyles.hover : {}),
                    ...(inputProps.disabled ? fieldStyles.disabled : {}),
                    ...(isFocused && Css.visuallyHidden.$),
                  }}
                >
                  {unfocusedPlaceholder}
                </div>
              )}
              <ElementType
                {...mergeProps(
                  inputProps,
                  { onBlur, onFocus: onFocusChained, onChange: onDomChange },
                  { "aria-invalid": Boolean(errorMsg), ...(labelStyle === "hidden" ? { "aria-label": label } : {}) },
                )}
                {...(errorMsg ? { "aria-errormessage": errorMessageId } : {})}
                ref={fieldRef as any}
                rows={multiline ? 1 : undefined}
                css={{
                  ...fieldStyles.input,
                  ...(inputProps.disabled ? fieldStyles.disabled : {}),
                  ...(showHover ? fieldStyles.hover : {}),
                  ...(unfocusedPlaceholder && !isFocused && Css.visuallyHidden.$),
                  ...xss,
                }}
                {...tid}
              />
              {isFocused && clearable && onChange && inputProps.value && (
                <IconButton
                  icon="xCircle"
                  color={Palette.Gray700}
                  onClick={() => {
                    onChange(undefined);
                    // Reset focus to input element
                    fieldRef.current?.focus();
                  }}
                />
              )}
              {errorInTooltip && errorMsg && !hideErrorMessage && (
                <span css={Css.df.aic.asc.pl1.fs0.$}>
                  <Icon icon="error" color={Palette.Red600} tooltip={errorMsg} />
                </span>
              )}
              {endAdornment && <span css={Css.df.aic.asc.pl1.fs0.$}>{endAdornment}</span>}
            </div>
          ),
        })}
        {/* Compound fields will handle their own error and helper text.
          * Do not show error or helper text when 'readOnly' or disabled
          except if alwaysShowHelperText is provided */}
        {labelStyle !== "left" &&
          (alwaysShowHelperText || (!compound && !inputProps.disabled && !inputProps.readOnly)) && (
            <>
              {errorMsg && !errorInTooltip && (
                <ErrorMessage id={errorMessageId} errorMsg={errorMsg} hidden={hideErrorMessage} {...tid.errorMsg} />
              )}
              {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
            </>
          )}
      </div>
      {/* Error message and helper text for "left" labelStyle */}
      {labelStyle === "left" &&
        (alwaysShowHelperText ||
          (!compound &&
            !inputProps.disabled &&
            !inputProps.readOnly &&
            ((errorMsg && !errorInTooltip) || helperText))) && (
          // Reduces the margin between the error/helper text and input field
          <div css={Css.mtPx(-8).$}>
            {errorMsg && !errorInTooltip && (
              <ErrorMessage id={errorMessageId} errorMsg={errorMsg} hidden={hideErrorMessage} {...tid.errorMsg} />
            )}
            {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
          </div>
        )}
    </>
  );
}

function getInputStylePalette(inputStylePalette: InputStylePalette): [Palette, Palette, Palette] {
  switch (inputStylePalette) {
    case "success":
      return [Palette.Green50, Palette.Green100, Palette.Green50];
    case "caution":
      return [Palette.Yellow50, Palette.Yellow100, Palette.Yellow50];
    case "warning":
      return [Palette.Red50, Palette.Red100, Palette.Red50];
    case "info":
      return [Palette.Blue50, Palette.Blue100, Palette.Blue50];
    default:
      return [Palette.White, Palette.Gray100, Palette.Gray100];
  }
}
