import { pillBaseStyles } from "src/components/Pills/pillBaseStyles";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type PillProps = {
  text: string;
};

/** Read-only pill for one selected value. It has no close control or click target, so it can sit inside a button. */
export function Pill(props: PillProps) {
  const { text } = props;
  const tid = useTestIds(props, "pill");
  return (
    <span
      css={{
        ...pillBaseStyles(),
        ...Css.maxw100.dib.truncate.color(Tokens.OnSurface).bgColor(Tokens.SurfaceActive).$,
      }}
      title={text}
      {...tid}
    >
      {text}
    </span>
  );
}
