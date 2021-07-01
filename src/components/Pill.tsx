import React from "react";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export interface PillProps {
  text: string;
}

/** Kinda like a chip, but read-only, so no `onClick` or `hover`. */
export function Pill(props: PillProps) {
  const { text } = props;
  const tid = useTestIds(props, "pill");
  return (
    <span css={Css.dif.itemsCenter.br16.sm.pl1.px1.pyPx(2).hPx(24).gray900.bgGray200.$} {...tid}>
      {text}
    </span>
  );
}
