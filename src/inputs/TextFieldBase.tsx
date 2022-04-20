import type { NumberFieldAria } from "@react-aria/numberfield";
import React, {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  MutableRefObject,
  ReactNode,
  TextareaHTMLAttributes,
  useRef,
  useState,
} from "react";
import { chain, mergeProps, useFocusWithin, useHover } from "react-aria";
import { IconButton, maybeTooltip } from "src/components";
import { HelperText } from "src/components/HelperText";
import { InlineLabel, Label } from "src/components/Label";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, Only, Palette, px } from "src/Css";
import { getLabelSuffix } from "src/forms/labelUtils";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { BeamTextFieldProps, TextFieldInternalProps, TextFieldXss } from "src/interfaces";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

export interface TextFieldBaseProps<X>
  extends Pick<
      BeamTextFieldProps<X>,
      | "label"
      | "required"
      | "errorMsg"
      | "onBlur"
      | "onFocus"
      | "helperText"
      | "hideLabel"
      | "placeholder"
      | "compact"
      | "borderless"
      | "visuallyDisabled"
      | "xss"
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
  inlineLabel?: boolean;
  contrast?: boolean;
  clearable?: boolean;
  // TextArea specific
  textAreaMinHeight?: number;
  tooltip?: ReactNode;
}

// Used by both TextField and TextArea
export function TextFieldBase<X extends Only<TextFieldXss, X>>(props: TextFieldBaseProps<X>) {
  const { fieldProps } = usePresentationContext();
  const {
    label,
    required,
    labelProps,
    hideLabel = fieldProps?.hideLabel ?? false,
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
    inlineLabel,
    contrast = false,
    borderless = fieldProps?.borderless ?? false,
    textAreaMinHeight = 96,
    clearable = false,
    tooltip,
    visuallyDisabled = fieldProps?.visuallyDisabled ?? true,
  } = props;

  const typeScale = fieldProps?.typeScale ?? "sm";
  const errorInTooltip = fieldProps?.errorInTooltip ?? false;
  const internalProps: TextFieldInternalProps = (props as any).internalProps || {};
  const { compound = false, forceFocus = false, forceHover = false } = internalProps;
  const errorMessageId = `${inputProps.id}-error`;
  const labelSuffix = getLabelSuffix(required);
  const ElementType: React.ElementType = multiline ? "textarea" : "input";
  const tid = useTestIds(props, defaultTestId(label));
  const [isFocused, setIsFocused] = useState(false);
  const { hoverProps, isHovered } = useHover({});
  const { focusWithinProps } = useFocusWithin({ onFocusWithinChange: setIsFocused });
  const fieldRef = inputRef ?? useRef();

  const maybeSmaller = compound ? 2 : 0;
  const fieldHeight = 40;
  const compactFieldHeight = 32;

  const fieldStyles = {
    container: Css.df.fdc.w100.maxw(px(550)).relative.$,
    inputWrapper: {
      ...Css[typeScale].df.aic.br4.px1.w100
        .hPx(fieldHeight - maybeSmaller)
        .if(compact)
        .hPx(compactFieldHeight - maybeSmaller).$,
      ...Css.bgWhite.gray900.if(contrast).bgGray700.white.$,
      ...(borderless ? Css.bTransparent.$ : Css.bGray300.if(contrast).bGray700.$),
      ...(!compound ? Css.ba.$ : {}),
    },
    inputWrapperReadOnly: {
      ...Css[typeScale].df.aic.w100
        .mhPx(fieldHeight - maybeSmaller)
        .if(compact)
        .mhPx(compactFieldHeight - maybeSmaller).$,
      ...Css.gray900.if(contrast).white.$,
      // Make read-only fields vertically line up with editable fields in tables
      ...(borderless ? Css.px1.$ : {}),
    },
    input: {
      ...Css.w100.mw0.outline0.fg1.if(multiline).br4.$,
      // Not using Truss's inline `if` statement here because `addIn` properties do not respect the if statement.
      ...(!contrast ? Css.bgWhite.$ : Css.bgGray700.addIn("&::selection", Css.bgGray800.$).$),
    },
    hover: Css.bgGray100.if(contrast).bgGray600.bGray600.$,
    focus: Css.bLightBlue700.if(contrast).bLightBlue500.$,
    disabled: visuallyDisabled
      ? Css.cursorNotAllowed.gray400.bgGray100.if(contrast).gray500.bgGray700.$
      : Css.cursorNotAllowed.$,
    error: Css.bRed600.if(contrast).bRed400.$,
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
    e.target.select();
  }, onFocus);

  const showFocus = (isFocused && !inputProps.readOnly) || forceFocus;
  const showHover = (isHovered && !inputProps.disabled && !inputProps.readOnly && !isFocused) || forceHover;

  return (
    <div css={fieldStyles.container} {...groupProps} {...focusWithinProps}>
      {label && !inlineLabel && (
        // set `hidden` if being rendered as a compound field
        <Label
          labelProps={labelProps}
          hidden={hideLabel || compound}
          label={label}
          suffix={labelSuffix}
          contrast={contrast}
          {...tid.label}
        />
      )}
      {maybeTooltip({
        title: (errorInTooltip && errorMsg) || tooltip,
        placement: "top",
        children: inputProps.readOnly ? (
          <div
            css={{
              // Use input wrapper to get common styles, but then we need to override some
              ...fieldStyles.inputWrapperReadOnly,
              ...(multiline ? Css.fdc.aifs.childGap2.$ : Css.truncate.$),
              ...xss,
            }}
            data-readonly="true"
            {...tid}
          >
            {!multiline && inlineLabel && label && !hideLabel && (
              <InlineLabel labelProps={labelProps} label={label} {...tid.label} />
            )}
            {multiline
              ? (inputProps.value as string | undefined)?.split("\n\n").map((p, i) => (
                  <p key={i} css={Css.my1.$}>
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
              ...(errorMsg ? fieldStyles.error : {}),
              ...Css.if(multiline).aifs.px0.mhPx(textAreaMinHeight).$,
            }}
            {...hoverProps}
            ref={inputWrapRef as any}
          >
            {!multiline && inlineLabel && label && !hideLabel && (
              <InlineLabel labelProps={labelProps} label={label} {...tid.label} />
            )}
            {!multiline && startAdornment && <span css={Css.df.aic.fs0.br4.pr1.$}>{startAdornment}</span>}
            <ElementType
              {...mergeProps(
                inputProps,
                { onBlur, onFocus: onFocusChained, onChange: onDomChange },
                { "aria-invalid": Boolean(errorMsg), ...(hideLabel ? { "aria-label": label } : {}) },
              )}
              {...(errorMsg ? { "aria-errormessage": errorMessageId } : {})}
              ref={fieldRef as any}
              rows={multiline ? 1 : undefined}
              css={{
                ...fieldStyles.input,
                ...(inputProps.disabled ? fieldStyles.disabled : {}),
                ...(showHover ? fieldStyles.hover : {}),
                ...(multiline ? Css.h100.p1.add("resize", "none").$ : Css.truncate.$),
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
            {!multiline && endAdornment && <span css={Css.df.aic.pl1.fs0.$}>{endAdornment}</span>}
          </div>
        ),
      })}

      {/* Compound fields will handle their own error and helper text */}
      {errorMsg && !compound && !errorInTooltip && (
        <ErrorMessage id={errorMessageId} errorMsg={errorMsg} {...tid.errorMsg} />
      )}
      {helperText && !compound && <HelperText helperText={helperText} {...tid.helperText} />}
    </div>
  );
}
