import { generate, newIncrementDelegateMethods, newMethod, newMethodsForProp, Sections } from "@homebound/truss";
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
      bshBasic: "0px 2px 16px 0px rgba(17,24,39,0.03), 0px 4px 8px 0px rgba(17,24,39,0.08)",
      bshHover: "0px 2px 24px 0px rgba(17,24,39,0.08), 0px 4px 8px 0px rgba(17,24,39,0.1)",
      bshFocus: `0px 0px 0px 2px ${palette.White}, 0px 0px 0px 4px ${palette.LightBlue700}`,
      bshDanger: `0px 0px 0px 2px ${palette.White}, 0px 0px 0px 4px ${palette.Red800}`,
      bshModal: "0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)",
    }),
  // Due to Safari's limited support of the `gap` property, `childGap` will be
  // its replacement until full browser support https://caniuse.com/?search=gap
  childGap: (config) => [
    ...newIncrementDelegateMethods("childGap", config.numberOfIncrements),
    `childGap(inc: number | string) {
    const direction = this.opts.rules["flexDirection"];
    const p = direction === "column" ? "marginTop" : direction === "column-reverse" ? "marginBottom" : "marginLeft";
    return this.addIn("& > * + *", Css.add(p, maybeInc(inc)).important.$);
  }`,
    `childGapPx(px: number) { return this.childGap(\`\${px}px\`); }`,
  ],
  buttonBase: () => [
    newMethod("buttonBase", {
      ...fonts.smEm,
      outline: 0,
      borderRadius: "4px",
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
      backgroundColor: "rgba(36,36,36,0.2)",
    }),
  ],
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
