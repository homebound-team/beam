import { create } from "storybook/theming";
import { palette } from "../truss-palette";

const fontBase = '"Inter", ui-sans-serif, system-ui, sans-serif';
const fontCode = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/**
 * Storybook manager + docs theme. Colors come from {@link palette} (same values as
 * `Tokens.Primary`, `OnSurface`, `Surface`, etc. in `theme-scopes.css`).
 */
export default create({
  base: "light",
  fontBase,
  fontCode,
  brandTitle: "Beam",
  brandUrl: "https://github.com/homebound-team/beam",
  brandImage: "BeamLockup.png",
  brandTarget: "_blank",

  colorPrimary: palette.Blue600,
  colorSecondary: palette.Blue600,

  appBg: palette.Gray100,
  appContentBg: palette.White,
  appHoverBg: palette.Gray100,
  appPreviewBg: palette.White,
  appBorderColor: palette.Gray200,
  appBorderRadius: 8,

  textColor: palette.Gray900,
  textInverseColor: palette.White,
  textMutedColor: palette.Gray700,

  barTextColor: palette.Gray700,
  barSelectedColor: palette.Blue600,
  barHoverColor: palette.Gray900,
  barBg: palette.White,

  buttonBg: palette.White,
  buttonBorder: palette.Gray300,
  booleanBg: palette.Gray100,
  booleanSelectedBg: palette.Blue50,

  inputBg: palette.White,
  inputBorder: palette.Gray300,
  inputTextColor: palette.Gray900,
  inputBorderRadius: 8,
});
