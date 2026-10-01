import type { InputStylePalette, PresentationFieldProps } from "src/components/PresentationContext";
import { Css, increment, Palette, Tokens, type Typography } from "src/Css";
import { getFieldWidth } from "src/inputs/utils";

type FieldLabelStyle = NonNullable<PresentationFieldProps["labelStyle"]>;

export type FieldChromeOptions = {
  typeScale: Typography;
  labelStyle: FieldLabelStyle;
  /** Width of the control when `labelStyle` is `"left"`. Defaults to `"50%"`. */
  labelLeftFieldWidth?: number | string;
  compact: boolean;
  borderless: boolean;
  borderOnHover: boolean;
  fullWidth: boolean;
  visuallyDisabled: boolean;
  isHovered: boolean;
  /** No border of its own; a compound field draws the box. Text fields only. */
  compound?: boolean;
  /** Min-height instead of a fixed height, so the control can grow. Text fields only. */
  multiline?: boolean;
  /** AI proposal fill. Wins over palette, borderless, and border-on-hover backgrounds. */
  showProposal?: boolean;
  inputStylePalette?: InputStylePalette;
};

const fieldHeight = 40;
const compactFieldHeight = 32;

/** Border, fill, type, and height shared by text fields and menu selects. */
export function getFieldChrome(options: FieldChromeOptions) {
  const {
    typeScale,
    labelStyle,
    labelLeftFieldWidth = "50%",
    compact,
    borderless,
    borderOnHover,
    fullWidth,
    visuallyDisabled,
    isHovered,
    compound = false,
    multiline = false,
    showProposal = false,
    inputStylePalette,
  } = options;

  const maybeSmaller = compound ? 2 : 0;
  const [bgColor, hoverBgColor, disabledBgColor] = fieldBackgrounds({
    showProposal,
    inputStylePalette,
    borderOnHover,
    borderless,
    compound,
  });
  const fixedHeight = Css.hPx(fieldHeight - maybeSmaller)
    .if(compact)
    .hPx(compactFieldHeight - maybeSmaller).$;
  // Multiline grows with its content, but not below a single-line field.
  const minHeight = Css.mhPx(fieldHeight - maybeSmaller)
    .if(compact)
    .mhPx(compactFieldHeight - maybeSmaller).$;

  return {
    container: Css.df.fdc.w100.maxw(getFieldWidth(fullWidth)).relative.if(labelStyle === "left").maxw100.fdr.gap2.jcsb
      .aic.$,
    control: {
      ...Css.typography(typeScale)
        .df.aic.br8.pxPx(textFieldBasePadding)
        .w100.bgColor(bgColor)
        .color(Tokens.OnSurface)
        .if(labelStyle === "left")
        .w(labelLeftFieldWidth).$,
      // Borderless fields sit next to plain text in tables. Grow by the horizontal padding and pull
      // back left so the text lines up. Compound fields own their own width.
      ...(borderless && !compound
        ? Css.bcTransparent.w("calc(100% + 16px)").ml(-1).$
        : Css.bc(Tokens.FieldBorderDefault).$),
      ...(!compound ? Css.ba.$ : {}),
      ...(borderOnHover ? Css.br4.ba.bcTransparent.add("transition", "border-color 200ms").$ : {}),
      ...(borderOnHover && isHovered ? Css.bgColor(hoverBgColor).ba.bcBlue300.$ : {}),
      ...(multiline ? minHeight : fixedHeight),
    },
    readOnly: {
      ...Css.typography(typeScale)
        .df.aic.w100.color(Tokens.OnSurface)
        .if(labelStyle === "left")
        .w(labelLeftFieldWidth).$,
      // Hidden labels mean a table cell. Min-height matches an editable field so the row lines up.
      ...(labelStyle === "hidden" ? minHeight : {}),
    },
    hover: Css.bgColor(hoverBgColor).bc(Tokens.FieldBorderHover).$,
    focus: Css.bc(Tokens.FieldBorderFocus).bgColor(hoverBgColor).if(borderOnHover).bc(Tokens.FieldBorderFocus).$,
    disabled: visuallyDisabled
      ? Css.cursorNotAllowed.color(Tokens.FieldTextDisabled).bgColor(disabledBgColor).$
      : Css.cursorNotAllowed.$,
    error: Css.bc(Tokens.FieldBorderError).$,
  };
}

/** Selected-option text. Plain text fields keep the type scale's weight. */
export function selectedValueCss(labelStyle: PresentationFieldProps["labelStyle"], readOnly?: boolean) {
  return labelStyle !== "inline" && !readOnly ? Css.fw5.$ : undefined;
}

/** Horizontal padding of a single-line field, in px. */
export const textFieldBasePadding = increment(1);

type FieldBackgroundOptions = {
  showProposal: boolean;
  inputStylePalette?: InputStylePalette;
  borderOnHover: boolean;
  borderless: boolean;
  compound: boolean;
};

function fieldBackgrounds(options: FieldBackgroundOptions): [string, string, string] {
  const { showProposal, inputStylePalette, borderOnHover, borderless, compound } = options;
  if (showProposal) return [Tokens.AiFieldBg, Palette.Purple100, Tokens.FieldBgDisabled];
  if (inputStylePalette) return inputStylePaletteBackgrounds(inputStylePalette);
  // Transparent fill lets a table row's hover color show through.
  if (borderOnHover) return [Palette.Transparent, Palette.Blue100, Palette.Gray100];
  if (borderless && !compound) return [Palette.Gray100, Palette.Gray200, Palette.Gray200];
  return [Tokens.FieldBgDefault, Tokens.FieldBgHover, Tokens.FieldBgDisabled];
}

function inputStylePaletteBackgrounds(inputStylePalette: InputStylePalette): [string, string, string] {
  switch (inputStylePalette) {
    case "success":
      return [Palette.Green50, Palette.Green100, Palette.Green50];
    case "caution":
      return [Palette.Yellow50, Palette.Yellow100, Palette.Yellow50];
    case "warning":
      return [Palette.Red50, Palette.Red100, Palette.Red50];
    case "info":
      return [Palette.Blue50, Palette.Blue100, Palette.Blue50];
    default:
      return [Palette.White, Palette.Gray100, Palette.Gray100];
  }
}
