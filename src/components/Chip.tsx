import React from "react";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, Margin, Only, Properties, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type ChipType = "caution" | "warning" | "success" | "light" | "dark" | "neutral";

// exporting for using in type prop as constant - this could be moved and become a global list for colors
export const ChipTypes: Record<ChipType, ChipType> = {
  caution: "caution",
  warning: "warning",
  success: "success",
  light: "light",
  dark: "dark",
  neutral: "neutral",
};

export interface ChipProps<X> {
  text: string;
  xss?: X;
  type?: ChipType;
}

/** Kinda like a chip, but read-only, so no `onClick` or `hover`. */
export function Chip<X extends Only<Xss<Margin>, X>>({ type = ChipTypes.neutral, ...props }: ChipProps<X>) {
  const { text, xss = {} } = props;
  const { fieldProps } = usePresentationContext();
  const compact = fieldProps?.compact;
  const tid = useTestIds(props, "chip");

  return (
    <span
      css={{
        ...Css[compact ? "xs" : "sm"].dif.aic.br16.pl1.px1.pyPx(2).gray900.$,
        ...typeStyles[type],
        ...xss,
      }}
      {...tid}
      title={text}
    >
      <span css={Css.lineClamp1.breakAll.$}>{text}</span>
    </span>
  );
}

const typeStyles: Record<ChipType, Properties> = {
  caution: Css.bgYellow200.$,
  warning: Css.bgRed100.$,
  success: Css.bgGreen100.$,
  light: Css.bgWhite.$,
  dark: Css.bgGray900.white.$,
  neutral: Css.bgGray200.$,
};
