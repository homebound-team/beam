import { defineConfig, newMethod, newMethodsForProp, Sections } from "@homebound/truss";
import { palette } from "./truss-palette";

const increment = 8;
const numberOfIncrements = 8;

// prettier-ignore
const fonts: Record<string, { fontWeight: 400 | 500 | 600 | 700, fontSize: string; lineHeight: string }> = {
  xs2:   { fontWeight: 400, fontSize: "10px", lineHeight: "14px" },
  xs2Sb: { fontWeight: 600, fontSize: "10px", lineHeight: "14px" },

  xs:     { fontWeight: 400, fontSize: "12px", lineHeight: "16px" },
  xsSb:   { fontWeight: 600, fontSize: "12px", lineHeight: "16px" },

  sm:     { fontWeight: 400, fontSize: "14px", lineHeight: "20px" },
  smSb:   { fontWeight: 600, fontSize: "14px", lineHeight: "20px" },

  md:   { fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
  mdSb: { fontWeight: 600, fontSize: "16px", lineHeight: "24px" },

  lg:   { fontWeight: 600, fontSize: "18px", lineHeight: "28px" },

  xl:   { fontWeight: 600, fontSize: "20px", lineHeight: "28px" },

  // Using xl2 vs 2xl so that we can use it via Css.xl2 vs Css['2xl']
  xl2:  { fontWeight: 600, fontSize: "30px", lineHeight: "36px" },
};

const transition: string = ["background-color", "border-color", "box-shadow", "left", "right", "margin"]
  .map((property) => `${property} 200ms`)
  .join(", ");

// Custom rules
const sections: Sections = {
  fontFamily: () =>
    newMethodsForProp("fontFamily", {
      sansSerif: "'Inter', sans-serif",
    }),
  borderRadius: () => [
    ...newMethodsForProp("borderRadius", {
      br0: "0",
      br4: "4px",
      br8: "8px",
      br12: "12px",
      br16: "16px",
      br24: "24px",
      br100: "100%",
    }),
    newMethod("brt4", { borderTopRightRadius: "4px", borderTopLeftRadius: "4px" }),
    newMethod("brb4", { borderBottomRightRadius: "4px", borderBottomLeftRadius: "4px" }),
  ],
  animation: () => [newMethod("transition", { transition })],
  boxShadow: () =>
    newMethodsForProp("boxShadow", {
      bsh0: "none",
      bshBasic: "0px 4px 8px rgba(53, 53, 53, 0.08), 0px 2px 16px rgba(53, 53, 53, 0.03);",
      bshHover: "0px 4px 8px rgba(53, 53, 53, 0.1), 0px 2px 24px rgba(53, 53, 53, 0.08);",
      bshFocus: `0px 0px 0px 2px ${palette.White}, 0px 0px 0px 4px ${palette.Blue700}`,
      bshDanger: `0px 0px 0px 2px ${palette.White}, 0px 0px 0px 4px ${palette.Red800}`,
      bshModal: "0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)",
    }),
  buttonBase: () => [
    newMethod("buttonBase", {
      ...fonts.smMd,
      outline: 0,
      borderRadius: "8px",
      display: "inline-flex",
      alignItems: "center",
      whiteSpace: "nowrap",
      transition,
    }),
  ],
  listReset: () => [newMethod("listReset", { padding: 0, margin: 0, listStyle: "none" })],
  underlay: () => [
    newMethod("underlay", {
      position: "fixed",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(36,36,36,0.6)",
    }),
  ],
  // Css that would be applied if using react-aria <VisuallyHidden />
  visuallyHidden: () => [
    newMethod("visuallyHidden", {
      position: "absolute",
      overflow: "hidden",
      clip: "inset(50%)",
      clipPath: "",
      border: 0,
      height: "1px",
      margin: "-1px",
      width: "1px",
      padding: 0,
      whiteSpace: "nowrap",
      opacity: 0,
    }),
  ],
  contentEmpty: () => [newMethod("contentEmpty", { content: "''" })],
};

const aliases: Record<string, string[]> = {};

const breakpoints = { sm: 0, md: 600, lg: 1025 };

export default defineConfig({
  outputPath: "./src/Css.ts",
  palette,
  fonts,
  increment,
  numberOfIncrements,
  aliases,
  typeAliases: {
    Font: ["fontSize", "fontWeight", "lineHeight"],
  },
  breakpoints,
  sections,
});
