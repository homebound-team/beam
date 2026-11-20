import { useId } from "@react-aria/utils";
import type { ReactNode } from "react";
import { type PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { Css, Tokens } from "src/Css";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

type StaticFieldProps = {
  label: ReactNode;
  value?: string;
  /** Rendered when `value` is empty. */
  children?: ReactNode;
  /** Only `"above"` and the deprecated `"left"` apply; `"inline"` and `"hidden"` render as `"above"`. Defaults to the presentation context. */
  labelStyle?: PresentationFieldProps["labelStyle"];
};

/** A read-only label and value laid out like a form field. */
export function StaticField(props: StaticFieldProps) {
  const { fieldProps } = usePresentationContext();
  const { label, labelStyle = fieldProps?.labelStyle ?? "above", value, children } = props;
  const tid = useTestIds(props, typeof label === "string" ? defaultTestId(label) : "staticField");
  const id = useId();
  return (
    <div css={Css.if(labelStyle === "left").df.jcsb.maxw100.$} {...tid.container}>
      <label css={Css.db.sm.color(Tokens.TextLabel).mbPx(4).$} htmlFor={id} {...tid.label}>
        {label}
      </label>
      <div id={id} css={Css.sm.color(Tokens.OnSurface).df.aic.if(labelStyle === "left").w50.$} {...tid}>
        {value || children}
      </div>
    </div>
  );
}
