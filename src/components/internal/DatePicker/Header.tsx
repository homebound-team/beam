import { addMonths, addYears } from "date-fns";
import { type CaptionProps, useNavigation } from "react-day-picker";
import { IconButton } from "src/components/IconButton";
import { Css, Tokens } from "src/Css";
import { formatPlainDate, jsDateToPlainDate } from "src/utils/plainDate";

export function Header(props: CaptionProps) {
  const { displayMonth } = props;
  const displayMonthDate = jsDateToPlainDate(displayMonth);
  const { goToMonth } = useNavigation();

  return (
    <div css={Css.df.jcsb.aic.mlPx(12).mrPx(2).hPx(32).$}>
      <h1 css={Css.md.color(Tokens.OnSurface).$}>{formatPlainDate(displayMonthDate, "monthYear")}</h1>
      <div>
        <IconButton
          color={Tokens.OnSurfaceMuted}
          icon="chevronLeft"
          onClick={() => goToMonth(addMonths(displayMonth, -1))}
        />
        <IconButton
          color={Tokens.OnSurfaceMuted}
          icon="chevronRight"
          onClick={() => goToMonth(addMonths(displayMonth, 1))}
        />
      </div>
    </div>
  );
}

// Header with year skip option
export function YearSkipHeader(props: CaptionProps) {
  const { displayMonth } = props;
  const displayMonthDate = jsDateToPlainDate(displayMonth);
  const { goToMonth } = useNavigation();

  return (
    <div css={Css.df.jcsb.aic.mlPx(12).mrPx(12).hPx(32).$}>
      <div css={Css.df.fdr.jcsb.$}>
        <IconButton
          color={Tokens.OnSurfaceMuted}
          icon="chevronLeft"
          onClick={() => goToMonth(addMonths(displayMonth, -1))}
        />
        <h1 css={Css.md.color(Tokens.OnSurface).$}>{formatPlainDate(displayMonthDate, "shortMonth")}</h1>
        <IconButton
          color={Tokens.OnSurfaceMuted}
          icon="chevronRight"
          onClick={() => goToMonth(addMonths(displayMonth, 1))}
        />
      </div>
      <div css={Css.df.fdr.jcsb.$}>
        <IconButton
          color={Tokens.OnSurfaceMuted}
          icon="chevronLeft"
          onClick={() => goToMonth(addYears(displayMonth, -1))}
        />
        <h1 css={Css.md.color(Tokens.OnSurface).$}>{formatPlainDate(displayMonthDate, "year")}</h1>
        <IconButton
          color={Tokens.OnSurfaceMuted}
          icon="chevronRight"
          onClick={() => goToMonth(addYears(displayMonth, 1))}
        />
      </div>
    </div>
  );
}
