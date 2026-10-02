import { Icon, type IconKey } from "src/components/Icon";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type ContextTagProps = {
  icon: IconKey;
  text: string;
};

/** Gray icon-and-label tag that names what something is, e.g. a row's type. */
export function ContextTag(props: ContextTagProps) {
  const { icon, text } = props;
  const tid = useTestIds(props, "contextTag");
  return (
    <span css={Css.dif.aic.gapPx(6).hPx(32).plPx(6).prPx(14).br8.bgGray100.sm.gray900.wsnw.$} {...tid}>
      <Icon icon={icon} xss={Css.fs0.$} />
      {text}
    </span>
  );
}
