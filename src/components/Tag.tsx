import { Icon, IconKey, maybeTooltip } from "src/components";
import { Css, Margin, Only, Xss } from "src/Css";
import { useTestIds } from "src/utils";
import { ReactNode, useRef, useState } from "react";
import { useResizeObserver } from "@react-aria/utils";

type TagXss = Margin | "backgroundColor" | "color";
export type TagType = "info" | "caution" | "warning" | "success" | "neutral";
interface TagProps<X> {
  text: ReactNode;
  // Defaults to "neutral"
  type?: TagType;
  xss?: X;
  icon?: IconKey;
  /** A tooltip will automatically be displayed if the text is truncated. Set to true to prevent this behavior.
   * @default false */
  preventTooltip?: boolean;
}

/** Tag used for indicating a status */
export function Tag<X extends Only<Xss<TagXss>, X>>(props: TagProps<X>) {
  const { text, type, xss, preventTooltip = false, ...otherProps } = props;
  const typeStyles = getStyles(type);
  const tid = useTestIds(otherProps);
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useResizeObserver({
    ref,
    onResize: () => {
      if (ref.current) {
        setShowTooltip(ref.current.offsetHeight < ref.current.scrollHeight);
      }
    },
  });

  return maybeTooltip({
    title: !preventTooltip && showTooltip ? text : undefined,
    children: (
      <span {...tid} css={{ ...Css.dif.tinySb.ttu.aic.gapPx(4).pxPx(6).pyPx(2).gray900.br4.$, ...typeStyles, ...xss }}>
        {/* Nesting `lineClamp` styles as the padding bottom set would expose the remainder of the text if applied on the same element */}
        {/* Using `lineClamp1` instead of `truncate` as `truncate` requires a width set to properly truncate and `lineClamp` can smartly do it based on the parent's width */}
        {otherProps.icon && (
          <span css={Css.fs0.$}>
            <Icon icon={otherProps.icon} inc={1.5} />
          </span>
        )}
        <span ref={ref} css={Css.lineClamp1.wbba.$}>
          {text}
        </span>
      </span>
    ),
  });
}

function getStyles(type?: TagType) {
  switch (type) {
    case "info":
      return Css.bgBlue100.$;
    case "caution":
      return Css.bgYellow200.$;
    case "warning":
      return Css.bgRed200.$;
    case "success":
      return Css.bgGreen200.$;
    default:
      // Neutral case
      return Css.bgGray200.$;
  }
}
