import { useId } from "@react-aria/utils";
import { ReactNode } from "react";
import { PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { Css, px } from "src/Css";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

interface StaticFieldProps {
  label: ReactNode;
  value?: string;
  children?: ReactNode;
  labelStyle?: PresentationFieldProps["labelStyle"];
}

export function StaticField(props: StaticFieldProps) {
  const { fieldProps } = usePresentationContext();
  const { label, labelStyle = fieldProps?.labelStyle ?? "above", value, children } = props;
  const tid = useTestIds(props, typeof label === "string" ? defaultTestId(label) : "staticField");
  const id = useId();
  return (
    <div css={Css.w100.maxw(px(550)).if(labelStyle === "left").df.jcsb.maxw100.$} {...tid.container}>
      <label css={Css.db.sm.gray700.mbPx(4).$} htmlFor={id} {...tid.label}>
        {label}
      </label>
      <div id={id} css={Css.smMd.gray900.$} {...tid}>
        {value || children}
      </div>
    </div>
  );
}
