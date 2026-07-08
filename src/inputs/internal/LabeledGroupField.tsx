import { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { HelperText } from "src/components/HelperText";
import { Label } from "src/components/Label";
import { PresentationFieldProps } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { useTestIds } from "src/utils";

type LabeledGroupFieldProps = {
  label: string;
  labelStyle: NonNullable<PresentationFieldProps["labelStyle"]>;
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  groupProps: HTMLAttributes<HTMLDivElement>;
  errorMsg?: string;
  helperText?: string | ReactNode;
  labelSuffix?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  children: ReactNode;
  tid: ReturnType<typeof useTestIds>;
};

/** Shared label + group shell for checkbox/radio groups and similar multi-option fields. */
export function LabeledGroupField(props: LabeledGroupFieldProps) {
  const {
    label,
    labelStyle,
    labelProps,
    groupProps,
    errorMsg,
    helperText,
    labelSuffix,
    onBlur,
    onFocus,
    children,
    tid,
  } = props;

  const isHiddenLabel = labelStyle === "hidden";
  const isLeftLabel = labelStyle === "left";

  const labelElement = (
    <Label
      label={label}
      {...labelProps}
      {...tid.label}
      suffix={labelSuffix}
      hidden={isHiddenLabel}
      inline={isLeftLabel}
    />
  );

  return (
    <div {...groupProps} css={Css.w100.if(isLeftLabel).df.fdr.$} onBlur={onBlur} onFocus={onFocus} {...tid}>
      {isLeftLabel ? <div css={Css.if(!isHiddenLabel).w50.$}>{labelElement}</div> : labelElement}
      {children}
      {errorMsg && <ErrorMessage errorMsg={errorMsg} {...tid.errorMsg} />}
      {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
    </div>
  );
}
