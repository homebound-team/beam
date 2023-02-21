import { addMonths, addYears, format } from "date-fns";
import { useMemo } from "react";
import { CaptionProps, useNavigation } from "react-day-picker";
import { IconButton } from "src/components/IconButton";
import { Css, Palette } from "src/Css";
import { SelectField } from "src/inputs";

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

// Header with year skip option
export function YearSkipHeader(props: CaptionProps) {
  const { displayMonth } = props;
  const { goToMonth } = useNavigation();

  return (
    <div css={Css.df.jcsb.aic.mlPx(12).mrPx(12).hPx(32).$}>
      <div css={Css.df.fdr.jcsb.$}>
        <IconButton color={Palette.Gray700} icon="chevronLeft" onClick={() => goToMonth(addMonths(displayMonth, -1))} />
        <h1 css={Css.base.$}>{format(displayMonth, "MMM")}</h1>
        <IconButton color={Palette.Gray700} icon="chevronRight" onClick={() => goToMonth(addMonths(displayMonth, 1))} />
      </div>
      <div css={Css.df.fdr.jcsb.$}>
        <IconButton color={Palette.Gray700} icon="chevronLeft" onClick={() => goToMonth(addYears(displayMonth, -1))} />
        <h1 css={Css.base.$}>{format(displayMonth, "yyyy")}</h1>
        <IconButton color={Palette.Gray700} icon="chevronRight" onClick={() => goToMonth(addYears(displayMonth, 1))} />
      </div>
    </div>
  );
}

type Option = {
  label: string;
  value: number;
};

export function PreciseDateHeader(props: CaptionProps) {
  const { displayMonth } = props;
  const { goToMonth } = useNavigation();
  const currentYear = new Date().getFullYear();

  const months: Option[] = useMemo(
    () =>
      new Array(12).fill(0).map((_, i) => ({
        label: format(new Date(2021, i), "MMMM"),
        value: i,
      })),
    [],
  );

  const years: Option[] = useMemo(
    () =>
      new Array(100).fill(0).map((_, i) => ({
        label: (currentYear - i).toString(),
        value: currentYear - i,
      })),
    [currentYear],
  );

  return (
    <div css={Css.df.jcsb.aic.hPx(32).maxwPx(224).gap1.$}>
      <SelectField
        options={months}
        label=""
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        value={displayMonth.getMonth()}
        onSelect={(month) => goToMonth(new Date(displayMonth.getFullYear(), month!))}
        compact
      />
      <div css={Css.wPx(150).$}>
        <SelectField
          options={years}
          label=""
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          value={displayMonth.getFullYear()}
          onSelect={(year) => goToMonth(new Date(year!, displayMonth.getMonth()))}
          compact
        />
      </div>
    </div>
  );
}
