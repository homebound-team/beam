import { AriaTextFieldOptions } from "@react-aria/textfield";
import { mergeProps } from "@react-aria/utils";
import React, {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  MutableRefObject,
  TextareaHTMLAttributes,
  useMemo,
} from "react";
import { Icon } from "src/components/Icon";
import { Css, Palette, px } from "src/Css";

interface TextFieldBaseProps extends Pick<AriaTextFieldOptions, "label"> {
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>;
  inputRef?: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  multiline?: boolean;
  isSmall?: boolean;
  errorMsg?: string;
  wide?: boolean;
}

export function TextFieldBase(props: TextFieldBaseProps) {
  const { label, labelProps, inputProps, inputRef, isSmall = false, errorMsg, multiline = false, wide = false } = props;
  const focusStyles = Css.bSky500.$;
  const errorMessageId = `${inputProps.id}-error`;

  const ElementType: React.ElementType = multiline ? "textarea" : "input";
  const width = useMemo(() => (wide ? 550 : 320), [wide]);

  return (
    <div css={Css.df.flexColumn.wPx(width).$}>
      <label {...labelProps} css={Css.sm.coolGray500.mbPx(4).$}>
        {label}
      </label>
      <ElementType
        {...mergeProps(inputProps, { "aria-invalid": Boolean(errorMsg) })}
        {...(errorMsg ? { "aria-errormessage": errorMessageId } : {})}
        ref={inputRef as any}
        rows={multiline ? 1 : undefined}
        css={{
          ...Css.add("resize", "none")
            .add("boxSizing", "border-box")
            .wPx(width)
            .sm.px1.pyPx(10)
            .coolGray900.br4.outline0.ba.bCoolGray300.if(isSmall)
            .pyPx(6).$,
          ...Css.if(multiline).mh(px(120)).$,
          "&:focus": focusStyles,
          "&:disabled": Css.coolGray400.bgCoolGray100.add("cursor", "not-allowed").$,
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
