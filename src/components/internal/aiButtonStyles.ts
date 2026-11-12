import { Css, Palette, Tokens } from "src/Css";

/**
 * Fills for filled AI buttons: `Button`'s `ai` variant and `AiProgressButton`.
 *
 * Design applies their "AI Bold" ramp to the primary button but hasn't specified hover, pressed, or disabled,
 * so those ramps are extrapolated from it rather than design-sourced.
 */
export const aiButtonStyles = {
  baseStyles: Css.aiBoldBg.color(Tokens.OnPrimary).$,
  hoverStyles: Css.add("backgroundImage", `linear-gradient(270deg, ${Palette.Blue800}, ${Palette.Purple800})`).$,
  pressedStyles: Css.add("backgroundImage", `linear-gradient(270deg, ${Palette.Blue900}, ${Palette.Purple900})`).$,
  disabledStyles: Css.add("backgroundImage", `linear-gradient(270deg, ${Palette.Blue200}, ${Palette.Purple200})`).color(
    Tokens.ButtonPrimaryDisabledFg,
  ).$,
  focusStyles: Css.bshFocus.$,
};
