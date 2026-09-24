import { Css } from "src/Css";
import { pageContentPaddingXValue, smPageContentPaddingXValue } from "./layoutVars";

/**
 * Empty table gutter column width at `mdAndUp`. Default cell pad is 12px and gutters use `px0`, so
 * gutter + cell pad = page content inset (24).
 */
export const pageContentGutterPx = 12;

/** {@link pageContentGutterPx} for the current breakpoint; below `md` the cell pad alone covers the inset. */
export function layoutGutterPx(sm: boolean): number {
  return sm ? 0 : pageContentGutterPx;
}

/** Horizontal inset for page body / page header content: 12px below `md`, 24px at `mdAndUp`. */
export const pageContentPaddingX = Css.px(smPageContentPaddingXValue).ifMdAndUp.px(pageContentPaddingXValue).$;

/**
 * Horizontal inset for global header chrome (navbar, env banner): `px1` below `md`, `px5` at
 * `mdAndUp`. Pass `compact` when the navbar collapses for overflow (not only viewport).
 */
export function headerContentPaddingX(compact = false) {
  return compact ? Css.px1.$ : Css.px1.ifMdAndUp.px5.$;
}
