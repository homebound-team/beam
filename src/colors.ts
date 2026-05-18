import { Palette, Tokens } from "src/Css";

/** Primitive (`Palette`), semantic (`Tokens`, `--b-*`), or CSS color keywords for props and Truss param methods. */
export type BeamColor = Palette | Tokens | "inherit" | "currentColor";
