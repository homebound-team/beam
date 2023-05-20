import { Dispatch, SetStateAction } from "react";
import { IconButton } from "src/components";
import { Css, Palette } from "src/Css";
import { SelectField } from "src/inputs";
import { useTestIds } from "src/utils";

export type PageSettings = {
  pageNumber: number;
  pageSize: number;
};

export const defaultPage: PageSettings = { pageNumber: 1, pageSize: 100 };

interface PaginationProps {
  page: readonly [PageSettings, Dispatch<SetStateAction<PageSettings>>];
  totalCount: number;
}

export function Pagination(props: PaginationProps) {
  const {
    page: [page, setPage],
    totalCount,
  } = props;
  const { pageSize, pageNumber } = page;

  const hasPrevPage = pageNumber > 1;
  const hasNextPage = pageNumber < totalCount / pageSize;
  // Create the `1 - 100 of 1000` or `0 of 0`
  const first = pageSize * (pageNumber - 1) + (totalCount ? 1 : 0);
  const last = Math.min(pageSize * pageNumber, totalCount);
  // Don't both with `0 - 0 of 0`
  const showLast = totalCount > 0;

  const tid = useTestIds(props, "pagination");
  return (
    <div css={Css.df.bGray300.bt.xs.gray500.px1.ml2.pt2.$} {...tid}>
      <div css={Css.df.mya.mr2.$} {...tid.pageSizeLabel}>
        Page size:
      </div>
      <div css={Css.wPx(78).$}>
        <SelectField
          compact
          label="Page Size"
          labelStyle="hidden"
          options={pageOptions}
          value={pageSize}
          onSelect={(val) => {
            setPage({ pageNumber: 1, pageSize: val! });
          }}
          {...tid.pageSize}
        />
      </div>
      <div css={Css.mla.mya.df.$}>
        <div css={Css.df.mya.mr2.$} {...tid.pageInfoLabel}>
          {first} {showLast ? `- ${last}` : ""} of {totalCount}
        </div>
        <IconButton
          icon="chevronLeft"
          color={hasPrevPage ? Palette.LightBlue700 : Palette.Gray200}
          onClick={() => setPage({ pageNumber: page.pageNumber - 1, pageSize })}
          disabled={!hasPrevPage}
          {...tid.previousIcon}
        />
        <IconButton
          icon="chevronRight"
          color={hasNextPage ? Palette.LightBlue700 : Palette.Gray200}
          onClick={() => setPage({ pageNumber: page.pageNumber + 1, pageSize })}
          disabled={!hasNextPage}
          {...tid.nextIcon}
        />
      </div>
    </div>
  );
}

export function toLimitAndOffset(page: PageSettings) {
  return {
    // E.g. on first page the offset is 0, second page the offset is 100, then 200, etc.
    offset: (page.pageNumber - 1) * page.pageSize,
    limit: page.pageSize,
  };
}

// Make a list of 100/500/1000 page sizes for the user to chose
export const pageOptions = [100, 500, 1000].map((num) => ({ id: num, name: String(num) }));
