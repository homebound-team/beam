import { Css, Palette, Properties } from "src/Css";
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
  headerCellCss: Css.nowrap.py1.bgGray100.vBottom.$,
  firstRowMessageCss: Css.px1.py2.$,
  rowHoverColor: Palette.Gray200,
};

export const originalTableStyles: GridStyle = {
  ...defaultStyle,
  headerCellCss: {
    ...defaultStyle.headerCellCss,
    ...Css.fw("bold").$,
  },
};

/** Tightens up the padding of rows, great for rows that have form elements in them. */
export const condensedStyle: GridStyle = {
  ...defaultStyle,
  headerCellCss: Css.bgGray100.tinyEm.$,
  cellCss: Css.vMid.sm.py1.px2.$,
  rootCss: Css.gray700.xs.$,
};

/** Renders each row as a card. */
export const cardStyle: GridStyle = {
  ...defaultStyle,
  rootCss: {
    ...defaultStyle.rootCss,
    ...Css.add("borderCollapse", "separate").add("borderSpacing", "0 16px").mt(-2).$,
  },
  cellCss: Css.p2.bt.bb.bGray400.$,
  firstCellCss: Css.bl.add({ borderTopLeftRadius: "4px", borderBottomLeftRadius: "4px" }).$,
  lastCellCss: Css.br.add({ borderTopRightRadius: "4px", borderBottomRightRadius: "4px" }).$,
  // Undo the card look & feel for the header
  headerCellCss: {
    ...defaultStyle.headerCellCss,
    ...Css.add({
      border: "none",
      borderRadius: "unset",
    }).p1.xsEm.gray700.$,
  },
};

// Once completely rolled out across all tables in Blueprint, this will change to be the `defaultStyle`.
export const beamFixedStyle: GridStyle = {
  headerCellCss: Css.vMid.gray700.xsEm.bgGray200.truncate.pxPx(12).hPx(40).$,
  cellCss: Css.vMid.gray900.xs.bgWhite.truncate.pxPx(12).hPx(36).boxShadow(`inset 0 -1px 0 ${Palette.Gray100}`).$,
  emptyCell: "-",
  presentationSettings: { borderless: true, typeScale: "xs", wrap: false },
  rowHoverColor: Palette.Gray200,
};

export const beamFlexibleStyle: GridStyle = {
  ...beamFixedStyle,
  headerCellCss: { ...beamFixedStyle.headerCellCss, ...Css.py0.px2.$ },
  cellCss: Css.vMid.xs.bgWhite.p2.boxShadow(`inset 0 -1px 0 ${Palette.Gray100}`).$,
  presentationSettings: { borderless: false, typeScale: "xs", wrap: true },
};

export const beamGroupRowStyle: Properties = Css.xsEm
  .hPx(56)
  .gray700.bgGray100.boxShadow(`inset 0 -1px 0 ${Palette.Gray200}`).$;

export const beamTotalsRowStyle: Properties = Css.gray700.smEm.hPx(40).mb1.bgWhite.boxShadow("none").$;
