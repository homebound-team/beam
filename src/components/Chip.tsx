import React from "react";
import { Icon } from "src/components/Icon";
import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export interface ChipProps {
  text: string;
  onClick: () => void;
}

export function Chip(props: ChipProps) {
  const { text, onClick } = props;
  const tid = useTestIds(props, "chip");
  return (
    <button
      type="button"
      css={{
        ...Css.dif.itemsCenter.br16.sm.pl1
          // The `X` icon handles the right padding
          .prPx(4)
          .pyPx(2)
          .hPx(24).gray900.bgGray200.$,
        ":hover": Css.bgGray300.$,
      }}
      onClick={onClick}
      {...tid}
    >
      <span css={Css.prPx(6).tl.$}>{text}</span>
      <span css={Css.fs0.br16.bgGray400.$}>
        <Icon icon="x" inc={2} color={Palette.Gray700} />
      </span>
    </button>
  );
}
