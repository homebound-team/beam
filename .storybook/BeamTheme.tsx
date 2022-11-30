import { create } from "@storybook/theming";
import { Palette } from "../src/Css";

export default create({
  base: "light",

  colorPrimary: Palette.LightBlue700,
  colorSecondary: Palette.LightBlue300,

  // UI
  appBg: Palette.White,
  appContentBg: "#F7F5F5",
  appBorderRadius: 4,

  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: "monospace",

  // Text colors
  textColor: Palette.Gray900,
  textInverseColor: "rgba(255,255,255,0.9)",

  // Toolbar default and active colors
  barTextColor: Palette.Gray700,
  barSelectedColor: Palette.LightBlue700,
  barBg: Palette.White,

  // Form colors
  inputBg: Palette.White,
  inputBorder: Palette.Gray200,
  inputTextColor: Palette.Gray900,
  inputBorderRadius: 4,

  brandTitle: "Beam Storybook",
  brandUrl: "/",
  brandImage: "/BeamLockup.png",
  brandTarget: "_self",
});
