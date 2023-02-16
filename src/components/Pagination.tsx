import { Dispatch, SetStateAction } from "react";
import { IconButton } from "src/components";
import { Css, Palette } from "src/Css";
import { SelectField } from "src/inputs";
import { useTestIds } from "src/utils";
import { zeroTo } from "src/utils/sb";

export type PageSettings = {
  page: number;
  perPage: number;
};

type PaginationProps = {
  label: string;
  hasNextPage: boolean;
  settings: PageSettings;
  setSettings: Dispatch<SetStateAction<PageSettings>>;
};

// Make a list of 50/100/150/etc page sizes for the user to chose
const pageOptions = zeroTo(5).map((n) => {
  const option = n * 50;
  return { id: option, name: option.toString() };
});

export function Pagination(props: PaginationProps) {
  const { hasNextPage, label, settings, setSettings } = props;
  const { perPage } = settings;

  const tid = useTestIds(props, "pagination");
  return (
    <div css={Css.df.bGray300.bt.xs.gray500.px1.ml2.pt2.$} {...tid}>
      <div css={Css.df.mya.mr2.$} {...tid.label}>
        {label} per page:
      </div>
      <div css={Css.wPx(78).$}>
        <SelectField
          {...tid.perPage}
          labelStyle="hidden"
          label={`${label} per page`}
          options={pageOptions}
          value={perPage}
          onSelect={(val) => {
            setSettings({ page: 1, perPage: val! });
          }}
        />
      </div>
      <div css={Css.mla.mya.df.$}>
        <IconButton
          {...tid.previousIcon}
          icon="chevronLeft"
          color={Palette.LightBlue700}
          onClick={() => setSettings({ page: settings.page - 1, perPage })}
          disabled={settings.page === 1}
        />
        <IconButton
          {...tid.nextIcon}
          icon="chevronRight"
          color={Palette.LightBlue700}
          onClick={() => setSettings({ page: settings.page + 1, perPage })}
          disabled={!hasNextPage}
        />
      </div>
    </div>
  );
}

export const initPageSettings = { page: 1, perPage: 100 };

export function toFirstAndOffset(page: number, perPage: number) {
  return {
    first: perPage,
    // E.g. on first page the offset is 0, second page the offset is 100, then 200, etc.
    offset: (page - 1) * perPage,
  };
}
