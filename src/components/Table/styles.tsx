import { Css, Palette } from "src";
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
  // Use h100 so that all cells are the same height when scrolled; set bgWhite for when we're laid over other rows.
  headerCellCss: Css.asfe.nowrap.py1.bgGray100.h100.aife.$,
  firstRowMessageCss: Css.px1.py2.$,
  rowHoverColor: Palette.Gray200,
};

/** Tightens up the padding of rows, great for rows that have form elements in them. */
export const condensedStyle: GridStyle = {
  ...defaultStyle,
  headerCellCss: Css.bgGray100.tinyEm.$,
  cellCss: Css.aic.sm.py1.px2.$,
  rootCss: Css.dg.gray700.xs.$,
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
