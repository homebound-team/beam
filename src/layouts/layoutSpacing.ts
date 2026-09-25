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

/** Marks page-body chrome that pads its own top edge, so a page header does not space it a second time.
 * `PageHeaderLayout` must repeat this literal — Truss `when()` only takes a string literal selector.
 */
export const selfTopSpacedAttr = "data-self-top-spaced";

/** Spread onto the root of page-body chrome that pads its own top edge (e.g. a sticky table actions bar). */
export const selfTopSpaced = { [selfTopSpacedAttr]: true };

/**
 * Horizontal inset for global header chrome (navbar, env banner): `px1` below `md`, `px5` at
 * `mdAndUp`. Pass `compact` when the navbar collapses for overflow (not only viewport).
 */
export function headerContentPaddingX(compact = false) {
  return compact ? Css.px1.$ : Css.px1.ifMdAndUp.px5.$;
}
