import { ReactNode } from "react";
import { Css, px } from "src/Css";

interface StaticFieldProps {
  label: string;
  value?: string;
  children?: ReactNode;
}

export function StaticField(props: StaticFieldProps) {
  const { label, value, children } = props;
  return (
    <div>
      <label css={Css.db.sm.gray700.mbPx(4).$}>{label}</label>
      {/*Our form fields are 40px high, so match that.*/}
      <div css={Css.sm.gray900.mh(px(40)).df.itemsCenter.$}>{value || children}</div>
    </div>
  );
}
