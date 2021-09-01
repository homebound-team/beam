import React from "react";
import { Icon } from "src/components/Icon";
import { Css, Margin, Only, Palette, px, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type ChipXss = Xss<Margin>;

export interface ChipProps<X> {
  text: string;
  onClick: () => void;
  xss?: X;
  disabled?: boolean;
}

export function Chip<X extends Only<ChipXss, X>>(props: ChipProps<X>) {
  const { text, onClick, xss = {}, disabled = false } = props;
  const tid = useTestIds(props, "chip");
  return (
    <button
      type="button"
      css={{
        ...Css.dif.aic.br16.sm.pl1
          // Use a lower right-padding to get closer to the `X` circle
          .prPx(4)
          .pyPx(2)
          .gray900.bgGray200.if(disabled)
          .mh(px(28)).gray600.$,
        ":hover:not(:disabled)": Css.bgGray300.$,
        ":disabled": Css.cursorNotAllowed.$,
        ...xss,
      }}
      disabled={disabled}
      onClick={onClick}
      {...tid}
    >
      <span css={Css.prPx(6).tl.if(disabled).prPx(4).$}>{text}</span>
      {!disabled && (
        <span css={Css.fs0.br16.bgGray400.$}>
          <Icon icon="x" color={Palette.Gray700} />
        </span>
      )}
    </button>
  );
}
