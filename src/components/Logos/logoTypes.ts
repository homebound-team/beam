/**
 * Sizing for a logo, in `Css` increments, i.e. 5 == 40px.
 *
 * Logos are drawn from a `viewBox`, so they always keep their aspect ratio — the box you give
 * them can never squash the artwork, only pad it. So set *either* `width` or `height` and let
 * the other axis follow; passing both is a type error, since the second one can only add dead
 * space around the logo.
 */
export type LogoSizeProps = { width?: number | "auto"; height?: never } | { height?: number | "auto"; width?: never };
