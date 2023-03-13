import { useId } from "@react-aria/utils";
import { ReactNode } from "react";
import { PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

interface StaticFieldProps {
  label: ReactNode;
  value?: string;
  children?: ReactNode;
  // Does not currently support "inline" or "hidden".
  labelStyle?: PresentationFieldProps["labelStyle"];
}

export function StaticField(props: StaticFieldProps) {
  const { fieldProps } = usePresentationContext();
  const { label, labelStyle = fieldProps?.labelStyle ?? "above", value, children } = props;
  const tid = useTestIds(props, typeof label === "string" ? defaultTestId(label) : "staticField");
  const id = useId();
  return (
    <div css={Css.if(labelStyle === "left").df.jcsb.maxw100.$} {...tid.container}>
      <label css={Css.db.sm.gray700.mbPx(4).$} htmlFor={id} {...tid.label}>
        {label}
      </label>
      <div id={id} css={Css.smMd.gray900.df.aic.if(labelStyle === "left").w50.$} {...tid}>
        {value || children}
      </div>
    </div>
  );
}
