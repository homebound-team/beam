import { Css, Margin, Only, Xss } from "src/Css";

type TagXss = Margin;
export type TagType = "info" | "caution" | "warning" | "success" | "neutral";
interface TagProps<X> {
  text: string;
  // Defaults to "neutral"
  type?: TagType;
  xss?: X;
}

/** Tag used for indicating a status */
export function Tag<X extends Only<Xss<TagXss>, X>>({ text, type, xss }: TagProps<X>) {
  const typeStyles = getStyles(type);
  return <span css={{ ...Css.dib.tinyEm.ttu.px1.pyPx(4).gray900.br4.$, ...typeStyles, ...xss }}>{text}</span>;
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
