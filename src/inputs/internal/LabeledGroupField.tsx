import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { HelperText } from "src/components/HelperText";
import { Label } from "src/components/Label";
import type { PresentationFieldProps } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import type { useTestIds } from "src/utils/useTestIds";

type LabeledGroupFieldProps = {
  label: string;
  tooltip?: ReactNode;
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
    tooltip,
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
      tooltip={tooltip}
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
