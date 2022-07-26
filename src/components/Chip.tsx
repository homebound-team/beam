import React from "react";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, Margin, Only, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type TagType = "caution" | "warning" | "success";

export interface ChipProps<X> {
  text: string;
  xss?: X;
  // Defaults to "neutral"
  type?: TagType;
}

/** Kinda like a chip, but read-only, so no `onClick` or `hover`. */
export function Chip<X extends Only<Xss<Margin>, X>>(props: ChipProps<X>) {
  const { text, type, xss = {} } = props;
  const { fieldProps } = usePresentationContext();
  const compact = fieldProps?.compact;
  const typeStyles = getStyles(type);
  const tid = useTestIds(props, "chip");
  return (
    <span
      css={{
        ...Css[compact ? "xs" : "sm"].dif.aic.br16.pl1.px1.pyPx(2).gray900.$,
        ...typeStyles,
        ...xss,
      }}
      {...tid}
      title={text}
    >
      <span css={Css.lineClamp1.breakAll.$}>{text}</span>
    </span>
  );
}

function getStyles(type?: TagType) {
  switch (type) {
    case "caution":
      return Css.bgYellow200.$;
    case "warning":
      return Css.bgRed100.$;
    case "success":
      return Css.bgGreen100.$;
    default:
      // Neutral case
      return Css.bgGray200.$;
  }
}
