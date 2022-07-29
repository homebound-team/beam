import { addMonths, format, addYears } from "date-fns";
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

// TODO: Callout in PR - this was really helpful when building -
// With us adding in the ability for a dateRangeField to be cleared if in filter, an updated header will provide a better UX and keep
// our code a bit simpler E.G. fewer props and default logic to track in case a user does clear field
// Some additional options could be to use selectors,
//      or even adding in some simple logic based on the current calendar view that'll remind a user they're selecting `FROM/TO` if they go too far or get distracted
//        "But isn't that even more logic?" - no because this would only use internal date picker values to show a label
export function YearSkipHeader(props: CaptionProps) {
  const { displayMonth } = props;
  const { goToMonth } = useNavigation();

  return (
    <div css={Css.df.jcsb.aic.mlPx(12).mrPx(12).hPx(32).$}>
      <div css={Css.df.fdr.jcsb.$ }>
        <IconButton color={Palette.Gray700} icon="chevronLeft" onClick={() => goToMonth(addMonths(displayMonth, -1))} />
        <h1 css={Css.base.$}>{format(displayMonth, "MMM")}</h1>
        <IconButton color={Palette.Gray700} icon="chevronRight" onClick={() => goToMonth(addMonths(displayMonth, 1))} />
      </div>
      <div css={Css.df.fdr.jcsb.$ }>
        <IconButton color={Palette.Gray700} icon="chevronLeft" onClick={() => goToMonth(addYears(displayMonth, -1))} />
        <h1 css={Css.base.$}>{format(displayMonth, "yyyy")}</h1>
        <IconButton color={Palette.Gray700} icon="chevronRight" onClick={() => goToMonth(addYears(displayMonth, 1))} />
      </div>
    </div>
  );
}
