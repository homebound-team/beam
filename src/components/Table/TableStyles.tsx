import { ReactNode } from "react";
import { PresentationContextProps, PresentationFieldProps } from "src/components/PresentationContext";
import { DiscriminateUnion, GridDataRow, GridTableApi, RenderCellFn } from "src/components/Table/index";
import { Kinded } from "src/components/Table/types";
import { Css, Palette, Properties, Typography } from "src/Css";
import { safeKeys } from "src/utils";

/** Completely static look & feel, i.e. nothing that is based on row kinds/content. */
export interface GridStyle {
  /** Applied to the base div element. */
  rootCss?: Properties;
  /** Applied with the owl operator between rows for rendering border lines. */
  betweenRowsCss?: Properties;
  /** Applied on the last row of the table. */
  lastRowCss?: Properties;
  /** Applied on the first row of the table (could be the Header or Totals row). */
  firstRowCss?: Properties;
  /** Applied to the first non-header row, i.e. if you want to cancel out `betweenRowsCss`. */
  firstNonHeaderRowCss?: Properties;
  /** Applied to all cell divs (via a selector off the base div). */
  cellCss?: Properties;
  /**
   * Applied to the header row divs.
   *
   * NOTE `as=virtual`: When using a virtual table with the goal of adding space
   * between the header and the first row use `firstNonHeaderRowCss` with a
   * margin-top instead. Using `headerCellCss` will not work since the header
   * rows are wrapper with Chrome rows.
   */
  headerCellCss?: Properties;
  /** Applied to 'kind: "totals"' cells */
  totalsCellCss?: Properties;
  /** Applied to 'kind: "expandableHeader"' cells */
  expandableHeaderCss?: Properties;
  /** Applied to the first cell of all rows, i.e. for table-wide padding or left-side borders. */
  firstCellCss?: Properties;
  /** Applied to the last cell of all rows, i.e. for table-wide padding or right-side borders. */
  lastCellCss?: Properties;
  /** Applied if there is a fallback/overflow message showing. */
  firstRowMessageCss?: Properties;
  /** Applied on hover if a row has a rowLink/onClick set. */
  rowHoverColor?: Palette;
  /** Default content to put into an empty cell */
  emptyCell?: ReactNode;
  presentationSettings?: Pick<PresentationFieldProps, "borderless" | "typeScale"> &
    Pick<PresentationContextProps, "wrap">;
  /** Minimum table width in pixels. Used when calculating columns sizes */
  minWidthPx?: number;
  /** Css to apply at each level of a parent/child nested table. */
  levels?: Record<number, { cellCss?: Properties; firstContentColumn?: Properties }>;
  /** Allows for customization of the background color used to denote an "active" row */
  activeBgColor?: Palette;
  /** Defines styles for the group row which holds the selected rows that have been filtered out */
  keptGroupRowCss?: Properties;
  /** Defines styles for the last row `keptGroup` to provide separation from the rest of the table */
  keptLastRowCss?: Properties;
}

// If adding a new `GridStyleDef`, ensure if it added to the `defKeys` in the `resolveStyles` function below
export interface GridStyleDef {
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
}

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
            ...Css.xsMd.mhPx(56).gray700.bgGray100.boxShadow(`inset 0 -1px 0 ${Palette.Gray200}`).$,
            ...(allWhite && Css.bgWhite.$),
          },
          firstContentColumn: { ...Css.smMd.$, ...(allWhite && Css.smBd.gray900.$) },
        },
        2: { firstContentColumn: Css.tiny.pl3.$ },
        // Add 12 more pixels of padding for each level of nesting
        3: { firstContentColumn: Css.tiny.plPx(36).$ },
      };
      const defaultLevels = { 1: { firstContentColumn: Css.tiny.pl3.$ } };

      cache[key] = {
        emptyCell: "-",
        firstRowMessageCss: {
          ...Css.tc.py3.$,
          ...(allWhite && Css.bgWhite.$),
          ...(bordered && Css.bl.br.bGray200.$),
        },
        headerCellCss: {
          // We want to support headers having two lines of wrapped text, and could add a `lineClamp2` here, but
          // lineClamp requires `display: webkit-box`, which disables `align-items: center` (requires `display: flex/grid`)
          // Header's will add `lineClamp2` more locally in their renders.
          // Also `unset`-ing the white-space: nowrap defined in `cellCss` below.
          ...Css.gray700.xsMd.bgGray200.aic.pxPx(12).whiteSpace("unset").hPx(40).$,
          ...(allWhite && Css.bgWhite.$),
        },
        totalsCellCss: Css.bgWhite.gray700.bgGray100.xsMd.hPx(totalsRowHeight).pPx(12).$,
        expandableHeaderCss: Css.bgWhite.gray900.xsMd.wsNormal
          .hPx(expandableHeaderRowHeight)
          .pxPx(12)
          .py0.boxShadow(`inset 0 -1px 0 ${Palette.Gray200}`)
          .addIn("&:not(:last-of-type)", Css.boxShadow(`inset -1px -1px 0 ${Palette.Gray200}`).$).$,
        cellCss: {
          ...Css[cellTypography].gray900.bgWhite.ai(alignItems).pxPx(12).boxShadow(`inset 0 -1px 0 ${Palette.Gray200}`)
            .$,
          ...(rowHeight === "flexible" ? Css.pyPx(12).$ : Css.nowrap.hPx(inlineEditing ? 48 : 36).$),
          ...(cellHighlight ? { "&:hover": Css.bgGray100.$ } : {}),
          ...(bordered && { "&:first-child": Css.bl.bGray200.$, "&:last-child": Css.br.bGray200.$ }),
        },
        firstRowCss: {
          ...Css.addIn("& > *:first-of-type", Css.borderRadius("8px 0 0 0 ").$).addIn(
            "& > *:last-of-type",
            Css.borderRadius("0 8px 0 0").$,
          ).$,
          ...(bordered && Css.addIn("& > *", Css.bt.bGray200.$).$),
        },
        // Only apply border radius styles to the last row when using the `bordered` style table.
        lastRowCss: bordered
          ? Css.addIn("& > *:first-of-type", Css.borderRadius("0 0 0 8px").$).addIn(
              "& > *:last-of-type",
              Css.borderRadius("0 0 8px 0").$,
            ).$
          : Css.addIn("> *", Css.bsh0.$).$,
        presentationSettings: { borderless: true, typeScale: "xs", wrap: rowHeight === "flexible" },
        levels: grouped ? groupedLevels : defaultLevels,
        rowHoverColor: Palette.Blue100,
        keptGroupRowCss: Css.bgYellow100.gray900.xsMd.$,
        keptLastRowCss: Css.boxShadow("inset 0px -14px 8px -11px rgba(63,63,63,.18)").$,
      };
    }

    return cache[key];
  };
}

export const getTableStyles = memoizedTableStyles();

export const totalsRowHeight = 40;
export const expandableHeaderRowHeight = 40;

/** Defines row-specific styling for each given row `kind` in `R` */
export type RowStyles<R extends Kinded> = {
  [P in R["kind"]]?: RowStyle<DiscriminateUnion<R, "kind", P>>;
};

export interface RowStyle<R extends Kinded> {
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
}

/** Our original table look & feel/style. */
export const defaultStyle: GridStyle = getTableStyles({});

/** Tightens up the padding of rows, great for rows that have form elements in them. */
export const condensedStyle: GridStyle = {
  ...getTableStyles({ rowHeight: "fixed" }),
  firstRowMessageCss: {
    ...getTableStyles({ rowHeight: "fixed" }).firstRowMessageCss,
    ...Css.xs.gray900.$,
  },
};

/** Renders each row as a card.
 * TODO: Add `cardStyle` option to `getTableStyles` and remove this.
 * */
export const cardStyle: GridStyle = {
  ...defaultStyle,
  betweenRowsCss: {},
  firstNonHeaderRowCss: Css.mt2.$,
  cellCss: Css.p2.my1.bt.bb.bGray400.$,
  firstCellCss: Css.bl.add({ borderTopLeftRadius: "4px", borderBottomLeftRadius: "4px" }).$,
  lastCellCss: Css.br.add({ borderTopRightRadius: "4px", borderBottomRightRadius: "4px" }).$,
  // Undo the card look & feel for the header
  headerCellCss: {
    ...defaultStyle.headerCellCss,
    ...Css.add({
      border: "none",
      borderRadius: "unset",
    }).p1.m0.xsMd.gray700.$,
  },
};

export function resolveStyles(style: GridStyle | GridStyleDef): GridStyle {
  const defKeysRecord: Record<keyof GridStyleDef, boolean> = {
    inlineEditing: true,
    grouped: true,
    rowHeight: true,
    cellHighlight: true,
    allWhite: true,
    bordered: true,
    rowHover: true,
    vAlign: true,
    cellTypography: true,
  };
  const keys = safeKeys(style);
  const defKeys = safeKeys(defKeysRecord);
  if (keys.length === 0 || keys.some((k) => defKeys.includes(k))) {
    return getTableStyles(style as GridStyleDef);
  }
  return style as GridStyle;
}
