import { create } from "@storybook/theming";

export default create({
  base: "light",

  colorPrimary: "#0369A1",
  colorSecondary: "#646464",

  // UI
  appBg: "white",
  appContentBg: "#F7F5F5",
  appBorderRadius: 4,

  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: "monospace",

  // Text colors
  textColor: "black",
  textInverseColor: "rgba(255,255,255,0.9)",

  // Toolbar default and active colors
  barTextColor: "white",
  barSelectedColor: "black",
  barBg: "#0369A1",

  // Form colors
  inputBg: "white",
  inputBorder: "#646464",
  inputTextColor: "black",
  inputBorderRadius: 4,

  brandTitle: "Beam Storybook",
  brandUrl: "https://homebound.com",
  brandImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/600px-JavaScript-logo.png",
  brandTarget: "_self",
});
