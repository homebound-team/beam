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

// Once completely rolled out across all tables in Blueprint, this will change to be the `defaultStyle`.
export const beamFixedStyle: GridStyle = {
  headerCellCss: Css.gray700.xsEm.bgGray200.aic.nowrap.pxPx(12).hPx(40).$,
  cellCss: Css.gray900.xs.bgWhite.aic.nowrap.pxPx(12).hPx(36).boxShadow(`inset 0 -1px 0 ${Palette.Gray200}`).$,
  emptyCell: "-",
  presentationSettings: { borderless: true, typeScale: "xs", wrap: false },
  firstRowMessageCss: Css.tc.py3.$,
  // Indent styles extends the existing padding-left defined in CellCss. The indentation should be +12px.
  indentOneCss: Css.pl3.$,
  indentTwoCss: Css.plPx(36).$,
  // Included as a hacky "treat indent as deprecated for this table" hint to GridTable
  levels: {},
};

// The look & feel for parent rows' cells in a nested parent/child table.
export const beamGroupRowStyle: Properties = Css.xsEm
  .mhPx(56)
  .gray700.bgGray100.boxShadow(`inset 0 -1px 0 ${Palette.Gray200}`).$;

// The look & feel for a totals row's cells.
export const beamTotalsRowStyle: Properties = Css.gray700.smEm.hPx(40).mb1.bgWhite.boxShadow("none").$;

export const beamNestedFixedStyle: GridStyle = {
  ...beamFixedStyle,
  levels: { 0: { cellCss: beamGroupRowStyle } },
};

export const beamTotalsFixedStyle: GridStyle = {
  ...beamFixedStyle,
  cellCss: { ...beamFixedStyle.cellCss, ...beamTotalsRowStyle },
};

export const beamFlexibleStyle: GridStyle = {
  ...beamFixedStyle,
  cellCss: Css.xs.bgWhite.aic.p2.boxShadow(`inset 0 -1px 0 ${Palette.Gray100}`).$,
  presentationSettings: { borderless: true, typeScale: "xs", wrap: true },
};

export const beamNestedFlexibleStyle: GridStyle = {
  ...beamFlexibleStyle,
  levels: { 0: { cellCss: beamGroupRowStyle } },
};

export const beamTotalsFlexibleStyle: GridStyle = {
  ...beamFlexibleStyle,
  cellCss: { ...beamFlexibleStyle.cellCss, ...beamTotalsRowStyle },
};
