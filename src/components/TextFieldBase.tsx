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
  compact?: boolean;
  wide?: boolean;
}

export function TextFieldBase(props: TextFieldBaseProps) {
  const { label, labelProps, inputProps, inputRef, compact = false, errorMsg, multiline = false, wide = false } = props;
  const errorMessageId = `${inputProps.id}-error`;

  const ElementType: React.ElementType = multiline ? "textarea" : "input";
  const width = wide ? 550 : 320;

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
            .wPx(width)
            .sm.px1.pyPx(10)
            .coolGray900.br4.outline0.ba.bCoolGray300.if(compact)
            .pyPx(6).$,
          ...Css.if(multiline).mh(px(120)).$,
          "&:focus": Css.bSky500.$,
          "&:disabled": Css.coolGray400.bgCoolGray100.cursorNotAllowed.$,
          ...(errorMsg ? Css.bCoral500.$ : {}),
        }}
      />
      {errorMsg && (
        <div id={errorMessageId} css={Css.coral600.sm.df.mtPx(4).$}>
          <span css={Css.fs0.$}>
            <Icon icon="error" color={Palette.Coral500} />
          </span>
          <span css={Css.ml1.mtPx(2).$}>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
