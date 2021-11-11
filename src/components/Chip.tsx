import React from "react";
import { Css, Margin, Only, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export interface ChipProps<X> {
  text: string;
  xss?: X;
}

/** Kinda like a chip, but read-only, so no `onClick` or `hover`. */
export function Chip<X extends Only<Xss<Margin>, X>>(props: ChipProps<X>) {
  const { text, xss = {} } = props;
  const tid = useTestIds(props, "chip");
  return (
    <span
      css={{
        ...Css.dif.aic.br16.sm.pl1.px1.pyPx(2).gray900.bgGray200.$,
        ...xss,
      }}
      {...tid}
      title={text}
    >
      <span css={Css.lineClamp1.$}>{text}</span>
    </span>
  );
}
