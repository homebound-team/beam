import { Dispatch } from "react";
import { IconButton } from "src/components";
import { Css, Palette } from "src/Css";
import { SelectField } from "src/inputs";
import { useTestIds } from "src/utils";

/**
 * Page settings, either a pageNumber+pageSize or offset+limit.
 *
 * This component is implemented in terms of "page number + page size",
 * but our backend wants offset+limit, so we accept both and translate.
 */
export type PageSettings = PageNumberAndSize | OffsetAndLimit;
export type PageNumberAndSize = { pageNumber: number; pageSize: number };
export type OffsetAndLimit = { offset: number; limit: number };

// Use OffsetAndLimit as our default b/c that's what backend filters expect
export const defaultPage: OffsetAndLimit = { offset: 0, limit: 100 };

interface PaginationProps {
  page: readonly [PageNumberAndSize, Dispatch<PageNumberAndSize>] | readonly [OffsetAndLimit, Dispatch<OffsetAndLimit>];
  totalCount: number;
}

export function Pagination(props: PaginationProps) {
  const { totalCount } = props;
  const [page, setPage] = props.page;
  const { pageSize, pageNumber } = toPageNumberSize(page);

  const hasPrevPage = pageNumber > 1;
  const hasNextPage = pageNumber < totalCount / pageSize;
  // Create the `1 - 100 of 1000` or `0 of 0`
  const first = pageSize * (pageNumber - 1) + (totalCount ? 1 : 0);
  const last = Math.min(pageSize * pageNumber, totalCount);
  // Don't both with `0 - 0 of 0`
  const showLast = totalCount > 0;

  // Convert the new page back to whatever format the caller wants
  function set(newPage: PageNumberAndSize): void {
    if ("pageNumber" in props.page[0]) {
      setPage(newPage as any);
    } else {
      setPage(toLimitAndOffset(newPage) as any);
    }
  }

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
          onSelect={(val) => set({ pageNumber: 1, pageSize: val! })}
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
          onClick={() => set({ pageNumber: pageNumber - 1, pageSize })}
          disabled={!hasPrevPage}
          {...tid.previousIcon}
        />
        <IconButton
          icon="chevronRight"
          color={hasNextPage ? Palette.LightBlue700 : Palette.Gray200}
          onClick={() => set({ pageNumber: pageNumber + 1, pageSize })}
          disabled={!hasNextPage}
          {...tid.nextIcon}
        />
      </div>
    </div>
  );
}

export function toLimitAndOffset(page: PageSettings): OffsetAndLimit {
  return "limit" in page
    ? page
    : {
        // E.g. on first page the offset is 0, second page the offset is 100, then 200, etc.
        offset: (page.pageNumber - 1) * page.pageSize,
        limit: page.pageSize,
      };
}

export function toPageNumberSize(page: PageSettings): PageNumberAndSize {
  return "pageNumber" in page
    ? page
    : {
        pageNumber: Math.floor(page.offset / page.limit) + 1,
        pageSize: page.limit,
      };
}

// Make a list of 100/500/1000 for the user to choose
export const pageOptions = [100, 500, 1000].map((num) => ({ id: num, name: String(num) }));
