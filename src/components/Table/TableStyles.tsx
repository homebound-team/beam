import { ReactNode } from "react";
import { BeamColor } from "src/colors";
import { PresentationContextProps, PresentationFieldProps } from "src/components/PresentationContext";
import type { RenderCellFn } from "src/components/Table/components/cell";
import type { GridDataRow } from "src/components/Table/components/Row";
import type { GridTableApi } from "src/components/Table/GridTableApi";
import { DiscriminateUnion, Kinded } from "src/components/Table/types";
import { Css, maybeCssVar, Palette, Properties, Tokens, Typography } from "src/Css";
import { safeKeys } from "src/utils";

const insetSeparator = `inset 0 -1px 0 ${maybeCssVar(Tokens.SurfaceSeparator)}`;
const insetSeparatorCorner = `inset -1px -1px 0 ${maybeCssVar(Tokens.SurfaceSeparator)}`;

/** Completely static look & feel, i.e. nothing that is based on row kinds/content. */
export type GridStyle = {
  /** Applied to the base div element. */
  rootCss?: Properties;
  /** Extra bottom padding for the virtual-table footer loader/spacer, in pixels. */
  virtualFooterPaddingBottomPx?: number;
  /**
   * Applied as the base body-row cell styling (commonly used for row separators).
   * This is applied to body rows broadly (including the last body row); use
   * `lastRowCellCss`/`lastRowCss` to adjust/cancel any final-row treatment.
   */
  betweenRowsCss?: Properties;
  /** Applied on the last row of the table, typically to override/cancel `betweenRowsCss`. */
  lastRowCss?: Properties;
  /** Applied on the first row of the table (could be the Header or Totals row). */
  firstRowCss?: Properties;
  /** Applied to every non-header row of the table */
  nonHeaderRowCss?: Properties;
  /** Applied to the first body row, i.e. if you want to cancel out `betweenRowsCss`. */
  firstBodyRowCss?: Properties;
  /** Applied to all cell divs (via a selector off the base div). */
  cellCss?: Properties;
  /**
   * Applied to the header row divs.
   *
   * NOTE `as=virtual`: When using a virtual table with the goal of adding space
   * between the header and the first row use `firstBodyRowCss` with a
   * margin-top instead. Using `headerCellCss` will not work since the header
   * rows are wrapper with Chrome rows.
   */
  headerCellCss?: Properties;
  /** Applied to 'kind: "totals"' cells */
  totalsCellCss?: Properties;
  /** Applied to 'kind: "expandableHeader"' cells */
  expandableHeaderCss?: Properties;
  /** Applied to expandable header cells that are not the last table column. */
  expandableHeaderNonLastColumnCss?: Properties;
  /** Applied to the first cell of all rows, i.e. for table-wide padding or left-side borders. */
  firstCellCss?: Properties;
  /** Applied to the last cell of all rows, i.e. for table-wide padding or right-side borders. */
  lastCellCss?: Properties;
  /** Applied to any column that opts into `GridColumn.border`. */
  borderStyle?: Properties;
  /** Applied to every cell in the first table-head row (expandableHeader/header/totals). */
  firstRowCellCss?: Properties;
  /** Applied to the first cell in the first table-head row. */
  firstRowFirstCellCss?: Properties;
  /** Applied to the last cell in the first table-head row. */
  firstRowLastCellCss?: Properties;
  /** Applied to every cell in the last table-body row. */
  lastRowCellCss?: Properties;
  /** Applied to the first cell in the last table-body row. */
  lastRowFirstCellCss?: Properties;
  /** Applied to the last cell in the last table-body row. */
  lastRowLastCellCss?: Properties;
  /** Applied if there is a fallback/overflow message showing. */
  firstRowMessageCss?: Properties;
  /** Applied on hover if a row has a rowLink/onClick set. */
  rowHoverColor?: BeamColor | "none";
  /** Default content to put into an empty cell */
  emptyCell?: ReactNode;
  presentationSettings?: Pick<PresentationFieldProps, "borderless" | "borderOnHover" | "typeScale"> &
    Pick<PresentationContextProps, "wrap">;
  /** Minimum table width in pixels. Used when calculating columns sizes */
  minWidthPx?: number;
  /** Css to apply at each level of a parent/child nested table. */
  levels?:
    | Record<
        number,
        {
          /** Number of pixels to indent the row. This value will be subtracted from the "first content column" width. First content column is the first column that is not an 'action' column (i.e. non-checkbox or non-collapse button column) */
          rowIndent?: number;
          cellCss?: Properties;
          firstContentColumn?: Properties;
        }
      >
    | ((level: number) => { rowIndent?: number; cellCss?: Properties; firstContentColumn?: Properties });
  /** Allows for customization of the background color used to denote an "active" row */
  activeBgColor?: BeamColor;
  /** Defines styles for the group row which holds the selected rows that have been filtered out */
  keptGroupRowCss?: Properties;
  /** Defines styles for the last row `keptGroup` to provide separation from the rest of the table */
  keptLastRowCss?: Properties;
  /** Applied to every cell of a runtime-pinned row — the blue highlight for the pinned section. */
  pinnedRowCss?: Properties;
};

// If adding a new `GridStyleDef`, ensure if it added to the `defKeys` in the `resolveStyles` function below
export type GridStyleDef = {
  /** Changes the height of the rows when `rowHeight: fixed` to provide more space between rows for input fields. */
  inlineEditing?: boolean;
  /** Adds styling for grouped rows */
  grouped?: boolean;
  /** 'fixed' height rows do not allow text to wrap. 'flexible' allows for wrapping. Defaults to `flexible` */
  rowHeight?: "fixed" | "flexible";
  /** Enables cells Highlight and hover */
  cellHighlight?: boolean;
  /** Applies a white background to the whole table, including header and group rows. */
  allWhite?: boolean;
  /** Whether to apply a border around the whole table */
  bordered?: boolean;
  /** Whether to show a hover effect on rows. Defaults to true */
  rowHover?: boolean;
  /** Defines the vertical alignment of the content of the cells for the whole table (not including the 'header' rows). Defaults to `center` */
  vAlign?: "top" | "center" | "bottom";
  /** Defines the Typography for the table body's cells (not the header). This only applies to rows that are not nested/grouped */
  cellTypography?: Typography;
  /** Defines if the table should highlight the row on hover. Defaults to true */
  highlightOnHover?: boolean;
  /** Rounds the top corners of the first head-row cells. Defaults to true */
  roundedHeader?: boolean;
};

// Returns a "blessed" style of GridTable
function memoizedTableStyles() {
  const cache: Record<string, GridStyle> = {};
  return (props: GridStyleDef = {}) => {
    const {
      inlineEditing = false,
      grouped = false,
      rowHeight = "flexible",
      cellHighlight = false,
      allWhite = false,
      bordered = false,
      vAlign = "center",
      cellTypography = "xs" as const,
      highlightOnHover = true,
      roundedHeader = true,
    } = props;

    const key = safeKeys(props)
      .sort()
      .map((k) => `${k}_${props[k]}`)
      .join("|");

    if (!cache[key]) {
      const alignItems = vAlign === "center" ? "center" : vAlign === "top" ? "flex-start" : "flex-end";
      const groupedLevels = {
        0: {
          cellCss: {
            ...Css.xsSb.mhPx(56).color(Tokens.OnSurfaceMuted).bgColor(Tokens.ListRowBgHover).boxShadow(insetSeparator)
              .$,
            ...(allWhite && Css.bgColor(Tokens.Surface).$),
          },
          firstContentColumn: { ...Css.sm.$, ...(allWhite && Css.smSb.color(Tokens.OnSurface).$) },
        },
        2: { firstContentColumn: Css.xs.pl3.$ },
        // Add 12 more pixels of padding for each level of nesting
        3: { firstContentColumn: Css.xs.plPx(36).$ },
      };
      const defaultLevels = { 1: { firstContentColumn: Css.xs.pl3.$ } };

      cache[key] = {
        emptyCell: "-",
        firstRowMessageCss: {
          ...Css.tac.py3.$,
          ...(allWhite && Css.bgColor(Tokens.Surface).$),
          ...(bordered && Css.bl.br.bc(Tokens.SurfaceSeparator).$),
        },
        headerCellCss: {
          // We want to support headers having two lines of wrapped text, and could add a `lineClamp2` here, but
          // lineClamp requires `display: webkit-box`, which disables `align-items: center` (requires `display: flex/grid`)
          // Header's will add `lineClamp2` more locally in their renders.
          // Also `unset`-ing the white-space: nowrap defined in `cellCss` below.
          ...Css.color(Tokens.OnSurface).xsSb.bgColor(Tokens.SurfaceSubtle).aic.pxPx(12).whiteSpace("unset").hPx(40).$,
          ...(allWhite && Css.bgColor(Tokens.Surface).$),
        },
        totalsCellCss: Css.color(Tokens.OnSurfaceMuted).bgColor(Tokens.ListRowBgHover).xsSb.hPx(totalsRowHeight).pPx(12)
          .$,
        expandableHeaderCss: Css.bgColor(Tokens.Surface)
          .color(Tokens.OnSurface)
          .xsSb.wsn.hPx(expandableHeaderRowHeight)
          .pxPx(12)
          .py0.boxShadow(insetSeparator).$,
        // Draw a 1px divider inside the cell on the right edge and bottom edge.
        // Using `inset` keeps the line inside the cell so it doesn't change layout.
        expandableHeaderNonLastColumnCss: Css.boxShadow(insetSeparatorCorner).$,
        cellCss: {
          ...Css.typography(cellTypography)
            .color(Tokens.OnSurface)
            .bgColor(Tokens.Surface)
            .ai(alignItems)
            .pxPx(12)
            .boxShadow(insetSeparator).$,
          ...(rowHeight === "flexible" ? Css.pyPx(12).$ : Css.wsnw.hPx(inlineEditing ? 48 : 36).$),
          ...(cellHighlight ? Css.onHover.bgColor(Tokens.ListRowBgHover).$ : {}),
        },
        firstCellCss: bordered ? Css.bl.bc(Tokens.SurfaceSeparator).$ : undefined,
        lastCellCss: bordered ? Css.br.bc(Tokens.SurfaceSeparator).$ : undefined,
        borderStyle: Css.bc(Tokens.SurfaceSeparator).$,
        firstRowCellCss: bordered ? Css.bt.bc(Tokens.SurfaceSeparator).$ : undefined,
        firstRowFirstCellCss: roundedHeader ? Css.borderRadius("8px 0 0 0 ").$ : undefined,
        firstRowLastCellCss: roundedHeader ? Css.borderRadius("0 8px 0 0").$ : undefined,
        // Keep `betweenRowsCss` on all body rows, but on the final body row
        // remove the inset shadow and, when bordered, replace it with a true bottom border.
        lastRowCellCss: bordered ? Css.bsh0.bb.bc(Tokens.SurfaceSeparator).$ : Css.bsh0.$,
        // Only apply bottom corner radii to the final body-row cells when using `bordered`.
        lastRowFirstCellCss: bordered ? Css.borderRadius("0 0 0 8px").$ : undefined,
        lastRowLastCellCss: bordered ? Css.borderRadius("0 0 8px 0").$ : undefined,
        presentationSettings: {
          borderless: true,
          typeScale: "xs",
          wrap: rowHeight === "flexible",
          borderOnHover: highlightOnHover,
        },
        levels: grouped ? groupedLevels : defaultLevels,
        // Dedicated table-row hover token (neutral); blue selection fills stay palette below.
        rowHoverColor: Tokens.ListRowBgHover,
        // Kept-group yellow status fill has no semantic token yet.
        keptGroupRowCss: Css.bgYellow100.color(Tokens.OnSurface).xsSb.df.aic.$,
        keptLastRowCss: Css.boxShadow("inset 0px -14px 8px -11px rgba(63,63,63,.18)").$,
        // Pinned rows keep Blue50 until a selection-surface token exists.
        pinnedRowCss: Css.bgColor(Palette.Blue50).$,
      };
    }

    return cache[key];
  };
}

export const getTableStyles = memoizedTableStyles();

export const totalsRowHeight = 40;
export const expandableHeaderRowHeight = 40;
export const tableRowPrintBreakCss = Css.add("pageBreakAfter", "auto").add("pageBreakInside", "avoid").$;

/** Defines row-specific styling for each given row `kind` in `R` */
export type RowStyles<R extends Kinded> = {
  [P in R["kind"]]?: RowStyle<DiscriminateUnion<R, "kind", P>>;
};

export type RowStyle<R extends Kinded> = {
  /** Applies this css to the wrapper row, i.e. for row-level hovers. */
  rowCss?: Properties | ((row: R) => Properties);
  /** Applies this css to each cell in the row. */
  cellCss?: Properties | ((row: R) => Properties);
  /** Renders the cell element, i.e. a link to get whole-row links. */
  renderCell?: RenderCellFn<R>;
  /** Whether the row should be a link. */
  rowLink?: (row: R) => string;
  /** Fired when the row is clicked, similar to rowLink but for actions that aren't 'go to this link'. */
  onClick?: (row: GridDataRow<R>, api: GridTableApi<R>) => void;
};

/** Our original table look & feel/style. */
export const defaultStyle: GridStyle = getTableStyles({});

/** Tightens up the padding of rows, great for rows that have form elements in them. */
export const condensedStyle: GridStyle = {
  ...getTableStyles({ rowHeight: "fixed" }),
  firstRowMessageCss: {
    ...getTableStyles({ rowHeight: "fixed" }).firstRowMessageCss,
    ...Css.xs.color(Tokens.OnSurface).$,
  },
};

/** Renders each row as a card.
 * TODO: Add `cardStyle` option to `getTableStyles` and remove this.
 * */
export const cardStyle: GridStyle = {
  ...defaultStyle,
  betweenRowsCss: {} as Properties,
  nonHeaderRowCss: Css.br4.oh.ba
    .bc(Tokens.TextDisabled)
    .mt2.add("transition", "all 240ms")
    .onHover.bshHover.bc(Tokens.OnSurfaceMuted).$,
  firstRowCss: Css.bl.br.bc(Tokens.SurfaceSeparator).borderRadius("8px 8px 0 0").oh.$,
  cellCss: Css.p2.$,
  // Undo the card look & feel for the header
  headerCellCss: {
    ...defaultStyle.headerCellCss,
    ...Css.p1.m0.xsSb.color(Tokens.OnSurfaceMuted).$,
  },
  rowHoverColor: "none",
  // this will allow having N amount of nested childs without having to define each level margin
  levels: (level) => ({ rowIndent: level > 0 ? 24 * level : undefined }),
};

const gridStyleDefKeysRecord: Record<keyof GridStyleDef, boolean> = {
  inlineEditing: true,
  grouped: true,
  rowHeight: true,
  cellHighlight: true,
  allWhite: true,
  bordered: true,
  rowHover: true,
  vAlign: true,
  cellTypography: true,
  highlightOnHover: true,
  roundedHeader: true,
};

/** True when `style` is a GridStyleDef (empty or any def key present); otherwise a full GridStyle. */
export function isGridStyleDef(style: GridStyle | GridStyleDef): style is GridStyleDef {
  const keys = safeKeys(style);
  const defKeys = safeKeys(gridStyleDefKeysRecord);
  return keys.length === 0 || keys.some((k) => defKeys.includes(k));
}

export function resolveStyles(style: GridStyle | GridStyleDef): GridStyle {
  if (isGridStyleDef(style)) {
    return getTableStyles(style);
  }
  return style;
}
