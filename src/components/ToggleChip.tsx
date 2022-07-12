import React from "react";
import { Icon } from "src/components/Icon";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, Margin, Only, Palette, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type ToggleChipXss = Xss<Margin>;

export interface ToggleChipProps<X> {
  text: string;
  onClick: () => void;
  xss?: X;
  disabled?: boolean;
}

export function ToggleChip<X extends Only<ToggleChipXss, X>>(props: ToggleChipProps<X>) {
  const { text, onClick, xss = {}, disabled = false } = props;
  const { fieldProps } = usePresentationContext();
  // If compact, then use a smaller type scale
  const compact = fieldProps?.compact;
  const tid = useTestIds(props, "chip");
  return (
    <button
      type="button"
      css={{
        ...Css[compact ? "xs" : "sm"].dif.aic.br16.pl1
          // Use a lower right-padding to get closer to the `X` circle
          .prPx(4)
          .pyPx(2)
          .gray900.bgGray200.if(disabled)
          .mhPx(compact ? 20 : 28).gray600.$,
        ":hover:not(:disabled)": Css.bgGray300.$,
        ":disabled": Css.cursorNotAllowed.$,
        ...xss,
      }}
      disabled={disabled}
      onClick={onClick}
      {...tid}
    >
      <span css={Css.prPx(6).tl.lineClamp1.breakAll.if(disabled).prPx(4).$} title={text}>
        {text}
      </span>
      {!disabled && (
        <span css={Css.fs0.br16.bgGray400.$}>
          <Icon icon="x" color={Palette.Gray700} inc={compact ? 2 : undefined} />
        </span>
      )}
    </button>
  );
}
