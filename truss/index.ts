import { generate, newMethodsForProp, Sections } from "@homebound/truss";
import { palette } from "./palette";

const increment = 8;
const numberOfIncrements = 8;

// prettier-ignore
const fonts: Record<string, { fontWeight: 400 | 500 | 600, fontSize: string; lineHeight: string }> = {
  tiny:   { fontWeight: 400, fontSize: "10px", lineHeight: "14px" },
  // Em denotes Emphasized
  tinyEm: { fontWeight: 600, fontSize: "10px", lineHeight: "14px" },
  xs:     { fontWeight: 400, fontSize: "12px", lineHeight: "16px" },
  xsEm:   { fontWeight: 500, fontSize: "12px", lineHeight: "16px" },
  sm:     { fontWeight: 400, fontSize: "14px", lineHeight: "20px" },
  smEm:   { fontWeight: 500, fontSize: "14px", lineHeight: "20px" },
  base:   { fontWeight: 400, fontSize: "16px", lineHeight: "24px" },
  baseEm: { fontWeight: 500, fontSize: "16px", lineHeight: "24px" },
  lg:     { fontWeight: 400, fontSize: "18px", lineHeight: "28px" },
  lgEm:   { fontWeight: 600, fontSize: "18px", lineHeight: "28px" },
  xl:     { fontWeight: 400, fontSize: "20px", lineHeight: "28px" },
  xlEm:   { fontWeight: 600, fontSize: "20px", lineHeight: "28px" },
  // Using xl2 vs 2xl so that we can use it via Css.xl2 vs Css['2xl']
  xl2:    { fontWeight: 400, fontSize: "24px", lineHeight: "32px" },
  xl2Em:  { fontWeight: 600, fontSize: "24px", lineHeight: "32px" },
  xl3:    { fontWeight: 400, fontSize: "30px", lineHeight: "36px" },
  xl3Em:  { fontWeight: 600, fontSize: "30px", lineHeight: "36px" },
  xl4:    { fontWeight: 400, fontSize: "36px", lineHeight: "40px" },
  xl4Em:  { fontWeight: 600, fontSize: "36px", lineHeight: "40px" },
  xl5:    { fontWeight: 400, fontSize: "48px", lineHeight: "48px" },
  xl5Em:  { fontWeight: 600, fontSize: "48px", lineHeight: "48px" },
};

// Custom rules
const sections: Sections = {
  fontFamily: () =>
    newMethodsForProp("fontFamily", {
      sansSerif: "'Inter', sans-serif",
    }),
  borderRadius: () =>
    newMethodsForProp("borderRadius", {
      br4: "4px",
      br8: "8px",
      br16: "16px",
      br100: "100%",
    }),
};

const aliases: Record<string, string[]> = {};

const typeAliases = {};

const breakpoints = {};

generate({
  outputPath: "../src/Css.ts",
  palette,
  fonts,
  increment,
  numberOfIncrements,
  aliases,
  typeAliases,
  breakpoints,
  sections,
})
  .then(() => console.log("🚀 Truss styles generation complete"))
  .catch(console.error);
