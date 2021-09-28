import { ReactNode } from "react";
import { Css, px } from "src/Css";
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
  return (
    <div>
      <label css={Css.db.sm.gray700.mbPx(4).$}>{label}</label>
      {/*Our form fields are 40px high, so match that.*/}
      <div css={Css.sm.gray900.mh(px(40)).df.aic.$} {...tid}>
        {value || children}
      </div>
    </div>
  );
}
