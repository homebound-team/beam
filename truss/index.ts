import { generate, GenerateOpts, generateRules, makeRule, makeRules } from "@homebound/truss";
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

// Pass fonts: {} b/c we create our own font rules
const methods = generateRules({ palette, fonts: {}, numberOfIncrements });

// Customize type-scale with per-fontWeight, fontSize and lineHeight
methods["type-scale"] = Object.entries(fonts).map(([abbr, defs]) => makeRule(abbr, { ...defs }));
methods["fontFamilyRules"] = makeRules("fontFamily", {
  sansSerif: "'Inter', sans-serif",
});

const aliases: Record<string, string[]> = {};

const typeAliases: GenerateOpts["typeAliases"] = {};

const breakpoints = {};

generate({
  outputPath: "../src/Css.ts",
  methods,
  palette,
  increment,
  aliases,
  typeAliases,
  breakpoints,
})
  .then(() => console.log("🚀 TRUSS styles generation complete"))
  .catch(console.error);
