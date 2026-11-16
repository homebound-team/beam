import { Css } from "src/Css";

/** Minimum height of a `Pill`. A pill grows past it when its text wraps. */
export const pillMinHeight = 24;

/** Capsule chrome shared by `Pill` and `FilterPill`. Colors are added by each pill. */
export function pillBaseStyles() {
  return Css.xsSb.dif.aic.br16.px1.gapPx(4).pyPx(4).mhPx(pillMinHeight).$;
}
