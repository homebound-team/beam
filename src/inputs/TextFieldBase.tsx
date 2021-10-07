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
import { chain, mergeProps, useFocusWithin } from "react-aria";
import { HelperText } from "src/components/HelperText";
import { InlineLabel, Label } from "src/components/Label";
import { Css, px, Xss } from "src/Css";
import { getLabelSuffix } from "src/forms/labelUtils";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { BeamTextFieldProps } from "src/interfaces";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

interface TextFieldBaseProps
  extends Pick<
      BeamTextFieldProps,
      "label" | "required" | "readOnly" | "errorMsg" | "onBlur" | "onFocus" | "helperText" | "hideLabel"
    >,
    Partial<Pick<BeamTextFieldProps, "onChange">> {
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>;
  inputRef?: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  inputWrapRef?: MutableRefObject<HTMLDivElement | null>;
  multiline?: boolean;
  groupProps?: NumberFieldAria["groupProps"];
  /** TextField specific */
  compact?: boolean;
  /** Styles overrides */
  xss?: Xss<"textAlign">;
  endAdornment?: ReactNode;
  inlineLabel?: boolean;
}

// Used by both TextField and TextArea
export function TextFieldBase(props: TextFieldBaseProps) {
  const {
    label,
    required,
    labelProps,
    hideLabel,
    inputProps,
    inputRef,
    inputWrapRef,
    groupProps,
    compact = false,
    errorMsg,
    helperText,
    multiline = false,
    readOnly,
    onChange,
    onBlur,
    onFocus,
    xss,
    endAdornment,
    inlineLabel,
  } = props;
  const errorMessageId = `${inputProps.id}-error`;
  const labelSuffix = getLabelSuffix(required);
  const ElementType: React.ElementType = multiline ? "textarea" : "input";
  const tid = useTestIds(props, defaultTestId(label || "textField"));
  const [isFocused, setIsFocused] = useState(false);
  const { focusWithinProps } = useFocusWithin({
    onFocusWithinChange: (isFocusedWithin) => setIsFocused(isFocusedWithin),
  });

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
    <div css={Css.df.fdc.w100.maxw(px(550)).$} {...groupProps} {...focusWithinProps}>
      {label && !hideLabel && !inlineLabel && (
        <Label labelProps={labelProps} label={label} suffix={labelSuffix} {...tid.label} />
      )}
      {readOnly && (
        <div
          css={{
            // Copy/pasted from StaticField, maybe we should combine?
            ...Css.sm.gray900.df.aic.mh(px(40)).$,
            ...Css.maxw(px(500)).$,
            ...(multiline ? Css.fdc.aifs.childGap2.$ : Css.add({ overflow: "hidden", whiteSpace: "nowrap" }).$),
            ...xss,
          }}
          {...tid}
          data-readonly="true"
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
            ...Css.df.aic.bgWhite.sm.px1.w100.hPx(40).gray900.br4.ba.bGray300.overflowHidden.if(compact).hPx(32).$,
            ...(inputProps.disabled ? Css.gray400.bgGray100.cursorNotAllowed.$ : {}),
            ...(isFocused ? Css.bLightBlue700.$ : {}),
            ...(errorMsg ? Css.bRed600.$ : {}),
            ...Css.if(multiline).aifs.px0.mh(px(96)).$,
          }}
          ref={inputWrapRef as any}
        >
          {!multiline && inlineLabel && label && !hideLabel && (
            <InlineLabel labelProps={labelProps} label={label} {...tid.label} />
          )}
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
              ...Css.add("resize", "none").sm.w100.gray900.outline0.$,
              ...(inputProps.disabled ? Css.gray400.bgGray100.cursorNotAllowed.$ : {}),
              ...xss,
              ...Css.if(multiline).h100.p1.$,
            }}
            {...tid}
          />
          {!multiline && endAdornment && <span>{endAdornment}</span>}
        </div>
      )}
      {errorMsg && <ErrorMessage id={errorMessageId} errorMsg={errorMsg} {...tid.errorMsg} />}
      {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
    </div>
  );
}
