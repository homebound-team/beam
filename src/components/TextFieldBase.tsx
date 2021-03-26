import { mergeProps } from "@react-aria/utils";
import React, { InputHTMLAttributes, LabelHTMLAttributes, MutableRefObject, TextareaHTMLAttributes } from "react";
import { Icon } from "src/components/Icon";
import { Label } from "src/components/Label";
import { Css, Palette, px } from "src/Css";
import { BeamTextFieldProps } from "src/interfaces";

interface TextFieldBaseProps extends Pick<BeamTextFieldProps, "label" | "errorMsg"> {
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>;
  inputRef?: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  multiline?: boolean;
  /** TextField specific */
  compact?: boolean;
  /** TextArea specific */
  wide?: boolean;
}

export function TextFieldBase(props: TextFieldBaseProps) {
  const { label, labelProps, inputProps, inputRef, compact = false, errorMsg, multiline = false, wide = false } = props;
  const errorMessageId = `${inputProps.id}-error`;

  const ElementType: React.ElementType = multiline ? "textarea" : "input";
  // Default the widths, though eventually these should be responsive. Note: there is no "compact" view for "wide" fields at the moment
  const width = wide ? 550 : compact ? 248 : 320;

  return (
    <div css={Css.df.flexColumn.wPx(width).$}>
      {label && <Label labelProps={labelProps} label={label} />}
      <ElementType
        {...mergeProps(inputProps, { "aria-invalid": Boolean(errorMsg) })}
        {...(errorMsg ? { "aria-errormessage": errorMessageId } : {})}
        ref={inputRef as any}
        rows={multiline ? 1 : undefined}
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
      />
      {errorMsg && (
        <div id={errorMessageId} css={Css.red600.sm.df.mtPx(4).$}>
          <span css={Css.fs0.$}>
            <Icon icon="error" color={Palette.Red600} />
          </span>
          <span css={Css.ml1.mtPx(2).$}>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
