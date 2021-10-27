import { Css, Margin, Only, Xss } from "src/Css";
import { useTestIds } from "src/utils";

type TagXss = Margin;
export type TagType = "info" | "caution" | "warning" | "success" | "neutral";
interface TagProps<X> {
  text: string;
  // Defaults to "neutral"
  type?: TagType;
  xss?: X;
}

/** Tag used for indicating a status */
export function Tag<X extends Only<Xss<TagXss>, X>>({ text, type, xss, ...otherProps }: TagProps<X>) {
  const typeStyles = getStyles(type);
  const tid = useTestIds(otherProps);

  return (
    <span {...tid} css={{ ...Css.dib.tinyEm.ttu.px1.pyPx(4).gray900.br4.$, ...typeStyles, ...xss }} title={text}>
      {/* Nesting `lineClamp` styles as the padding bottom set would expose the remainder of the text if applied on the same element */}
      {/* Using `lineClamp1` instead of `truncate` as `truncate` requires a width set to properly truncate and `lineClamp` can smartly do it based on the parent's width */}
      <span css={Css.lineClamp1.$}>{text}</span>
    </span>
  );
}

function getStyles(type?: TagType) {
  switch (type) {
    case "info":
      return Css.bgLightBlue200.$;
    case "caution":
      return Css.bgYellow600.$;
    case "warning":
      return Css.bgRed100.$;
    case "success":
      return Css.bgGreen300.$;
    default:
      // Neutral case
      return Css.bgGray200.$;
  }
}
