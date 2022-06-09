import { useId } from "@react-aria/utils";
import { ReactNode } from "react";
import { Css } from "src/Css";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

interface StaticFieldProps {
  label: string;
  value?: string;
  children?: ReactNode;
}

export function StaticField(props: StaticFieldProps) {
  const { label, value, children } = props;
  const tid = useTestIds(props, defaultTestId(label));
  const id = useId();
  return (
    <div>
      <label css={Css.db.sm.gray700.mbPx(4).$} htmlFor={id} {...tid.label}>
        {label}
      </label>
      <div id={id} css={Css.smEm.gray900.df.aic.$} {...tid}>
        {value || children}
      </div>
    </div>
  );
}
