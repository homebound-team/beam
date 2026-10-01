import { Css } from "src/Css";

// Keep these three on the same increment.
/** Horizontal padding of `ModalBody`. */
export const modalBodyPaddingX = Css.px3.$;

/** Left-only `ModalBody` padding, for a `virtualized` body whose children own the scrollbar. */
export const modalBodyPaddingLeft = Css.pl3.$;

/** Cancels `modalBodyPaddingX`, so a block inside `ModalBody` meets the modal edges. */
export const modalBodyFullBleed = Css.mx(-3).$;
