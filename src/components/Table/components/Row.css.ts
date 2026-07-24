import { Css } from "src/Css";

/**
 * Parent-hover styles for GridTable rows.
 *
 * - `.beam-bhp` / `.beam-bhc`: when a row is hovered, child fields get a blue border
 *   (unless the field itself is hovered). Used with TextFieldBase `borderOnHover`.
 * - `.beam-row-hover`: paints direct children with `--beam-row-hover-bg` on row hover,
 *   so cell backgrounds do not hide the row hover color.
 */
export const css = {
  ".beam-bhp:hover:not(:has(.beam-bhc:hover)) .beam-bhc": Css.ba.bcBlue300.$,
  ".beam-row-hover:hover > *": Css.bgColor("var(--beam-row-hover-bg)").$,
};
