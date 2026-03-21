import { Css } from "src/Css";

/**
 * Styles for the "border highlight on row hover" pattern.
 *
 * When a table row (`.beam-bhp`) is hovered, all child fields (`.beam-bhc`)
 * get a blue border — unless the field itself is being hovered directly.
 */
export const css = {
  ".beam-bhp:hover:not(:has(.beam-bhc:hover)) .beam-bhc": Css.ba.bcBlue300.$,
};
