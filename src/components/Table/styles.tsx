import { Css, Palette } from "src/Css";
import { GridStyle } from ".";

/** Our original table look & feel/style. */
export const defaultStyle: GridStyle = {
  rootCss: Css.gray700.$,
  betweenRowsCss: Css.bt.bGray400.$,
  firstNonHeaderRowCss: Css.add({ borderTopStyle: "none" }).$,
  cellCss: Css.py2.px3.$,
  firstCellCss: Css.pl1.$,
  lastCellCss: Css.$,
  indentOneCss: Css.pl4.$,
  indentTwoCss: Css.pl7.$,
  headerCellCss: Css.nowrap.py1.bgGray100.aife.$,
  firstRowMessageCss: Css.tc.py3.$,
};

/** Tightens up the padding of rows, great for rows that have form elements in them. */
export const condensedStyle: GridStyle = {
  ...defaultStyle,
  headerCellCss: Css.bgGray100.tinyEm.$,
  cellCss: Css.aic.sm.py1.px2.$,
  rootCss: Css.dg.gray700.xs.$,
  firstRowMessageCss: Css.tc.py2.$,
};

/** Renders each row as a card. */
export const cardStyle: GridStyle = {
  ...defaultStyle,
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
    }).p1.m0.xsEm.gray700.$,
  },
};

export interface GridStyleDef {
  inlineEditing?: boolean;
  grouped?: boolean;
  rowHeight?: "fixed" | "flexible";
  totals?: boolean;
}

function memoizedTableStyles() {
  const cache: Record<string, GridStyle> = {};
  return (props?: GridStyleDef) => {
    const { inlineEditing = false, grouped = false, rowHeight = "flexible", totals = false } = props || {};
    const key = `${inlineEditing}|${grouped}|${rowHeight}|${totals}`;

    if (!cache[key]) {
      const groupedLevels = {
        0: {
          cellCss: Css.xsEm.mhPx(56).gray700.bgGray100.boxShadow(`inset 0 -1px 0 ${Palette.Gray200}`).$,
          firstContentColumn: Css.smEm.$,
        },
        2: { firstContentColumn: Css.tiny.pl3.$ },
      };
      const defaultLevels = { 1: { firstContentColumn: Css.tiny.pl3.$ } };

      cache[key] = {
        emptyCell: "-",
        firstRowMessageCss: Css.tc.py3.$,
        headerCellCss: Css.gray700.xsEm.bgGray200.aic.nowrap.pxPx(12).hPx(40).$,
        cellCss: {
          ...Css.gray900.xs.bgWhite.aic.pxPx(12).boxShadow(`inset 0 -1px 0 ${Palette.Gray200}`).$,
          ...(rowHeight === "flexible" ? Css.py2.$ : Css.nowrap.hPx(inlineEditing ? 48 : 36).$),
          ...(totals ? Css.gray700.smEm.hPx(40).mb1.bgWhite.boxShadow("none").$ : {}),
        },
        presentationSettings: { borderless: true, typeScale: "xs", wrap: rowHeight === "flexible" },
        levels: totals ? {} : grouped ? groupedLevels : defaultLevels,
      };
    }

    return cache[key];
  };
}

export const getTableStyles = memoizedTableStyles();
