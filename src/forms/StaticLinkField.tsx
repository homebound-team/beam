import { Css } from "src/Css";

interface StaticLinkFieldProps {
  label: string;
  href: string;
}

export function StaticLinkField(props: StaticLinkFieldProps) {
  const { label, href } = props;
  return (
    <div>
      <label css={Css.db.sm.gray700.mbPx(4).$}>{label}</label>
      {/*Our form fields are 40px high, so match that.*/}
      <div css={Css.sm.gray900.hPx(40).df.itemsCenter.$}>
        <a href={href}>{href.replace(/^https?:\/\//, "")}</a>
      </div>
    </div>
  );
}
