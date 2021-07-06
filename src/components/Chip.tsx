import React from "react";
import { Icon } from "src/components/Icon";
import { Css, Margin, Only, Palette, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type ChipXss = Xss<Margin>;

export interface ChipProps<X> {
  text: string;
  onClick: () => void;
  xss?: X;
}

export function Chip<X extends Only<ChipXss, X>>(props: ChipProps<X>) {
  const { text, onClick, xss = {} } = props;
  const tid = useTestIds(props, "chip");
  return (
    <button
      type="button"
      css={{
        ...Css.dif.itemsCenter.br16.sm.pl1
          // Use a lower right-padding to get closer to the `X` circle
          .prPx(4)
          .pyPx(2).gray900.bgGray200.$,
        ":hover": Css.bgGray300.$,
        ...xss,
      }}
      onClick={onClick}
      {...tid}
    >
      <span css={Css.prPx(6).tl.$}>{text}</span>
      <span css={Css.fs0.br16.bgGray400.$}>
        <Icon icon="x" color={Palette.Gray700} />
      </span>
    </button>
  );
}
