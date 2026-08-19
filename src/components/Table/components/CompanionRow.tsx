import { isValidElement, ReactNode } from "react";
import { maybeApply } from "src/components/Table/GridTableApi";
import type { GridStyle } from "src/components/Table/TableStyles";
import type { MaybeFn, RenderAs } from "src/components/Table/types";
import { Css } from "src/Css";
import { useDocumentScrollLayout } from "src/layouts/DocumentScrollLayoutContext";
import { pageContentGutterPx } from "src/layouts/layoutSpacing";
import { beamRightPaneWidthVar, documentScrollChromeLeft, documentScrollChromeWidth } from "src/layouts/layoutVars";
import { useTestIds } from "src/utils/useTestIds";

type CompanionRowProps = {
  as: RenderAs;
  columnSizes: string[];
  style: GridStyle;
  /** Owning data row id — used for keys / test ids. */
  rowId: string;
  colSpan: number;
  isFirstBodyRow: boolean;
  isLastBodyRow: boolean;
  /** Defaults to trailing; leading clears the separator so the owning row sits flush below. */
  position?: CompanionPosition;
  companion: CompanionContent;
  levelIndent?: number;
};

/** Full-width row rendered beside a data row when `GridDataRow.companion` is set. */
export function CompanionRow(props: CompanionRowProps) {
  const {
    as,
    columnSizes,
    style,
    rowId,
    colSpan,
    isFirstBodyRow,
    isLastBodyRow,
    companion,
    position = "trailing",
    levelIndent,
  } = props;
  const RowTag = as === "table" ? "tr" : "div";
  const CellTag = as === "table" ? "td" : "div";
  // Same pattern as PinToggle: prefix + rowId → `companion_${rowId}` for `r.companion_1`.
  const tid = useTestIds({}, "companion");
  const content = maybeApply(companion);
  const isLeading = position === "leading";
  const inDocumentScrollLayout = useDocumentScrollLayout();
  // Pin the card to the visible chrome, inset by the layout gutters so padding does not scroll away.
  const chromeCss = inDocumentScrollLayout
    ? Css.w100.sticky
        .left(`calc(${documentScrollChromeLeft()} + ${pageContentGutterPx}px)`)
        .maxw(
          `calc(${documentScrollChromeWidth()} - var(${beamRightPaneWidthVar}, 0px) - ${pageContentGutterPx * 2}px)`,
        ).$
    : undefined;

  return (
    <RowTag
      css={{
        ...(as === "table" ? {} : Css.relative.df.fg1.fs1.$),
        ...(isFirstBodyRow && style.firstBodyRowCss),
        ...(levelIndent && Css.mlPx(levelIndent).$),
        ...(isLastBodyRow && style.lastRowCss),
      }}
      data-gridrow
      {...tid[rowId]}
    >
      <CellTag
        css={{
          ...style.cellCss,
          ...style.betweenRowsCss,
          // Leading companions sit flush above the owning row — clear the bottom separator.
          ...(isLeading && Css.bsh0.$),
          ...(isLastBodyRow && style.lastRowCellCss),
          ...(isLastBodyRow && style.lastRowFirstCellCss),
          ...(isLastBodyRow && style.lastRowLastCellCss),
          // Companion content is arbitrary — allow wrapping and grow with content.
          ...Css.h("auto")
            .whiteSpace("normal")
            .pyPx(8)
            .w(`calc(${columnSizes.join(" + ")}${levelIndent ? ` - ${levelIndent}px` : ""})`).$,
        }}
        {...(as === "table" ? { colSpan } : {})}
      >
        {chromeCss ? (
          <div css={chromeCss} {...tid.chrome}>
            {content}
          </div>
        ) : (
          content
        )}
      </CellTag>
    </RowTag>
  );
}

export type CompanionPosition = "leading" | "trailing";

export type CompanionContent = MaybeFn<ReactNode>;

/** Object form of `GridDataRow.companion` — omit `position` to default to `"trailing"`. */
export type CompanionConfig = {
  position?: CompanionPosition;
  content: CompanionContent;
};

/** Full-width companion content for a data row; plain content defaults to trailing. */
export type GridRowCompanion = CompanionContent | CompanionConfig;

export function isCompanionConfig(companion: GridRowCompanion): companion is CompanionConfig {
  return (
    typeof companion === "object" &&
    companion !== null &&
    !isValidElement(companion) &&
    !Array.isArray(companion) &&
    "content" in companion
  );
}

type ResolvedCompanion = { position: CompanionPosition; content: CompanionContent };

/** Resolves companion placement and content; `undefined` when there is no companion. */
export function resolveCompanion(companion: GridRowCompanion | null | undefined): ResolvedCompanion | undefined {
  if (companion == null) return undefined;
  if (isCompanionConfig(companion)) {
    return { position: companion.position ?? "trailing", content: companion.content };
  }
  return { position: "trailing", content: companion };
}
