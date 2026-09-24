import { Css } from "src/Css";
import { pageContentPaddingXValue, smPageContentPaddingXValue } from "./layoutVars";

/**
 * Empty table gutter column width. Default cell pad is 12px and gutters use `px0`, so
 * gutter + cell pad = page content inset at `mdAndUp` (24). Kept at 12 on `sm` so companion
 * chrome and first-column text stay inset from the viewport edge.
 */
export const pageContentGutterPx = 12;

/** Horizontal inset for page body / page header content: 12px below `md`, 24px at `mdAndUp`. */
export const pageContentPaddingX = Css.px(smPageContentPaddingXValue).ifMdAndUp.px(pageContentPaddingXValue).$;

/**
 * Horizontal inset for global header chrome (navbar, env banner): `px1` below `md`, `px5` at
 * `mdAndUp`. Pass `compact` when the navbar collapses for overflow (not only viewport).
 */
export function headerContentPaddingX(compact = false) {
  return compact ? Css.px1.$ : Css.px1.ifMdAndUp.px5.$;
}
