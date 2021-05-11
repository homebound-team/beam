import { mergeProps } from "@react-aria/utils";
import React, { InputHTMLAttributes, LabelHTMLAttributes, MutableRefObject, TextareaHTMLAttributes } from "react";
import { ErrorMessage } from "src/components/ErrorMessage";
import { Label } from "src/components/Label";
import { Css, px } from "src/Css";
import { BeamTextFieldProps } from "src/interfaces";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

interface TextFieldBaseProps extends Pick<BeamTextFieldProps, "label" | "errorMsg" | "onBlur" | "onChange"> {
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>;
  inputRef?: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  multiline?: boolean;
  /** TextField specific */
  compact?: boolean;
  /** TextArea specific */
  wide?: boolean;
}

// Used by both TextField and TextArea
export function TextFieldBase(props: TextFieldBaseProps) {
  const {
    label,
    labelProps,
    inputProps,
    inputRef,
    compact = false,
    errorMsg,
    multiline = false,
    onChange,
    wide = false,
    onBlur,
  } = props;
  const errorMessageId = `${inputProps.id}-error`;

  const ElementType: React.ElementType = multiline ? "textarea" : "input";
  // Default the widths, though eventually these should be responsive. Note: there is no "compact" view for "wide" fields at the moment
  const width = wide ? 550 : compact ? 248 : 320;
  const tid = useTestIds(props, defaultTestId(label || "textField"));

  return (
    <div css={Css.df.flexColumn.wPx(width).$}>
      {label && <Label labelProps={labelProps} label={label} />}
      <ElementType
        {...mergeProps(inputProps, { onBlur }, { "aria-invalid": Boolean(errorMsg) })}
        {...(errorMsg ? { "aria-errormessage": errorMessageId } : {})}
        ref={inputRef as any}
        rows={multiline ? 1 : undefined}
        onChange={(e: any) => {
          const string = (e.target.value as string).trim();
          onChange(string === "" ? undefined : string);
        }}
        css={{
          ...Css.add("resize", "none")
            .bgWhite.wPx(width)
            .sm.px1.hPx(40)
            .gray900.br4.outline0.ba.bGray300.if(compact)
            .hPx(32).$,
          ...Css.if(multiline).mh(px(96)).py1.px2.$,
          "&:focus": Css.bLightBlue700.$,
          "&:disabled": Css.gray400.bgGray100.cursorNotAllowed.$,
          ...(errorMsg ? Css.bRed600.$ : {}),
        }}
        {...tid}
      />
      <ErrorMessage id={errorMessageId} errorMsg={errorMsg} {...tid.errorMsg} />
    </div>
  );
}
