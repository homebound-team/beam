import { addMonths, format } from "date-fns";
import React from "react";
import { CaptionProps, useNavigation } from "react-day-picker";
import { IconButton } from "src/components/IconButton";
import { Css, Palette } from "src/Css";

export function Header(props: CaptionProps) {
  const { displayMonth } = props;
  const { goToMonth } = useNavigation();

  return (
    <div css={Css.df.jcsb.aic.mlPx(12).mrPx(2).hPx(32).$}>
      <h1 css={Css.base.$}>{format(displayMonth, "MMMM yyyy")}</h1>
      <div>
        <IconButton color={Palette.Gray700} icon="chevronLeft" onClick={() => goToMonth(addMonths(displayMonth, -1))} />
        <IconButton color={Palette.Gray700} icon="chevronRight" onClick={() => goToMonth(addMonths(displayMonth, 1))} />
      </div>
    </div>
  );
}
