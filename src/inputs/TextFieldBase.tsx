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
import { HelperText } from "src/components/HelperText";
import { InlineLabel, Label } from "src/components/Label";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, px, Xss } from "src/Css";
import { getLabelSuffix } from "src/forms/labelUtils";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { BeamTextFieldProps } from "src/interfaces";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

interface TextFieldBaseProps
  extends Pick<
      BeamTextFieldProps,
      | "label"
      | "required"
      | "readOnly"
      | "errorMsg"
      | "onBlur"
      | "onFocus"
      | "helperText"
      | "hideLabel"
      | "placeholder"
      | "compound"
      | "compact"
      | "borderless"
    >,
    Partial<Pick<BeamTextFieldProps, "onChange">> {
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>;
  inputRef?: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  inputWrapRef?: MutableRefObject<HTMLDivElement | null>;
  multiline?: boolean;
  groupProps?: NumberFieldAria["groupProps"];
  /** Styles overrides */
  xss?: Xss<"textAlign" | "fontWeight" | "justifyContent">;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
  inlineLabel?: boolean;
  contrast?: boolean;
  // TextArea specific
  minHeight?: number;
}

// Used by both TextField and TextArea
export function TextFieldBase(props: TextFieldBaseProps) {
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
    readOnly,
    onChange,
    onBlur,
    onFocus,
    xss,
    endAdornment,
    startAdornment,
    inlineLabel,
    compound = false,
    contrast = false,
    borderless = fieldProps?.borderless ?? false,
    minHeight = 96,
  } = props;
  const errorMessageId = `${inputProps.id}-error`;
  const labelSuffix = getLabelSuffix(required);
  const ElementType: React.ElementType = multiline ? "textarea" : "input";
  const tid = useTestIds(props, defaultTestId(label));
  const [isFocused, setIsFocused] = useState(false);
  const { hoverProps, isHovered } = useHover({});
  const { focusWithinProps } = useFocusWithin({ onFocusWithinChange: setIsFocused });

  const maybeSmaller = compound ? 2 : 0;
  const fieldHeight = 40;
  const compactFieldHeight = 32;

  const fieldStyles = {
    container: Css.df.fdc.w100.maxw(px(550)).$,
    inputWrapper: {
      ...Css.sm.df.aic.br4.px1.w100
        .hPx(fieldHeight - maybeSmaller)
        .if(compact)
        .hPx(compactFieldHeight - maybeSmaller).$,
      ...Css.bgWhite.gray900.if(contrast).bgGray700.white.$,
      ...(borderless ? Css.bTransparent.$ : Css.bGray300.if(contrast).bGray700.$),
      ...(!compound ? Css.ba.$ : {}),
    },
    inputWrapperReadOnly: {
      ...Css.sm.df.aic.w100
        .mhPx(fieldHeight - maybeSmaller)
        .if(compact)
        .mhPx(compactFieldHeight - maybeSmaller).$,
      ...Css.gray900.if(contrast).white.$,
    },
    input: {
      ...Css.w100.mw0.outline0.br4.fg1.$,
      // Not using Truss's inline `if` statement here because `addIn` properties do not respect the if statement.
      ...(!contrast ? Css.bgWhite.$ : Css.bgGray700.addIn("&::selection", Css.bgGray800.$).$),
    },
    hover: Css.bgGray100.if(contrast).bgGray600.bGray600.$,
    focus: borderless ? Css.bshFocus.$ : Css.bLightBlue700.if(contrast).bLightBlue500.$,
    disabled: Css.cursorNotAllowed.gray400.bgGray100.if(contrast).gray500.bgGray700.$,
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

  return (
    <div css={fieldStyles.container} {...groupProps} {...focusWithinProps}>
      {label && !inlineLabel && (
        <Label
          labelProps={labelProps}
          hidden={hideLabel}
          label={label}
          suffix={labelSuffix}
          contrast={contrast}
          {...tid.label}
        />
      )}
      {readOnly && (
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
      )}
      {!readOnly && (
        <div
          css={{
            ...fieldStyles.inputWrapper,
            ...(inputProps.disabled ? fieldStyles.disabled : {}),
            ...(isFocused && !readOnly ? fieldStyles.focus : {}),
            ...(isHovered && !inputProps.disabled && !readOnly && !isFocused ? fieldStyles.hover : {}),
            ...(errorMsg ? fieldStyles.error : {}),
            ...Css.if(multiline).aifs.px0.mhPx(minHeight).$,
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
            ref={inputRef as any}
            rows={multiline ? 1 : undefined}
            css={{
              ...fieldStyles.input,
              ...(inputProps.disabled ? fieldStyles.disabled : {}),
              ...(isHovered && !inputProps.disabled && !readOnly && !isFocused ? fieldStyles.hover : {}),
              ...(multiline ? Css.h100.p1.add("resize", "none").if(borderless).pPx(4).$ : Css.truncate.$),
              ...xss,
            }}
            {...tid}
          />
          {!multiline && endAdornment && <span css={Css.df.aic.pl1.fs0.$}>{endAdornment}</span>}
        </div>
      )}
      {errorMsg && <ErrorMessage id={errorMessageId} errorMsg={errorMsg} {...tid.errorMsg} />}
      {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
    </div>
  );
}
