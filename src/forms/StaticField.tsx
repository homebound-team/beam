import { Css } from "src/Css";

interface StaticFieldProps {
  label: string;
  value: string;
}

export function StaticField(props: StaticFieldProps) {
  const { label, value } = props;
  return (
    <div>
      <label css={Css.db.sm.gray700.mbPx(4).$}>{label}</label>
      {/*Our form fields are 40px high, so match that.*/}
      <div css={Css.smEm.gray900.hPx(40).df.itemsCenter.$}>{value}</div>
    </div>
  );
}
