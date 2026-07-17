import { Css, Properties, Tokens } from "src/Css";

const whiteCircle =
  "data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='4'/%3e%3c/svg%3e";

export const radioReset = {
  ...Css.add("appearance", "none").p0.dib.vam.add("userSelect", "none").fs0.h2.w2.br100.$,
  ...Css.add("outline", "0px solid transparent").$,
};

export const radioDefault = {
  ...Css.bgColor(Tokens.Surface).bc(Tokens.FieldBorderDefault).ba.$,
  ...Css.color(Tokens.Primary).$,
  ...Css.transition.$,
};

export const radioUnchecked = Css.cursorPointer.bc(Tokens.FieldBorderDefault).$;

export const radioChecked = {
  ...Css.add("backgroundColor", "currentColor")
    .add("backgroundSize", "100% 100%")
    .add("backgroundPosition", "center")
    .add("backgroundRepeat", "no-repeat").$,
  ...Css.add("backgroundImage", `url("${whiteCircle}")`).$,
  ...Css.add("borderColor", "currentColor").$,
};

export const radioFocus = {
  ...Css.add("outline", "2px solid transparent").add("outlineOffset", "2px").$,
  ...Css.bshFocus.$,
};

// Blue900 hover has no semantic token — keep palette.
export const radioHover = Css.blue900.bcBlue900.$;

export const radioDisabled = {
  ...Css.cursorNotAllowed.color(Tokens.NeutralFillHoverSubtle).$,
  ...Css.add("backgroundColor", "currentColor")
    .add("backgroundSize", "100% 100%")
    .add("backgroundPosition", "center")
    .add("backgroundRepeat", "no-repeat").$,
};

export const radioDisabledSelected = {
  ...radioChecked,
  ...Css.cursorNotAllowed.color(Tokens.TextDisabled).$,
};

export type RadioStateStyleProps = {
  isDisabled?: boolean;
  isSelected?: boolean;
};

/** Checked/unchecked/disabled styles for a Beam radio input. */
export function getRadioStateStyles({ isDisabled = false, isSelected = false }: RadioStateStyleProps): Properties {
  if (isDisabled && isSelected) return radioDisabledSelected;
  if (isDisabled) return radioDisabled;
  if (isSelected) return radioChecked;
  return radioUnchecked;
}
