import { Css } from "src/Css";

/**
 * Empty table gutter column width. Default cell pad is 12px and gutters use `px0`, so
 * gutter + cell pad = page content inset (`px3` / 24).
 */
export const pageContentGutterPx = 12;

/** Horizontal inset for page body / page header content. */
export const pageContentPaddingX = Css.px3.$;

/**
 * Horizontal inset for global header chrome (navbar, env banner): `px1` below `md`, `px5` at
 * `mdAndUp`. Pass `compact` when the navbar collapses for overflow (not only viewport).
 */
export function headerContentPaddingX(compact = false) {
  return compact ? Css.px1.$ : Css.px1.ifMdAndUp.px5.$;
}
