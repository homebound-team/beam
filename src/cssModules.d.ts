// Beam imports CSS for its side effects, i.e. `import "./trix.css"`, and lets Vite and tsup turn those
// imports into stylesheets at bundle time. TypeScript never has a module to resolve them to, because
// no `.d.ts` describes a `.css` file.
//
// Named `cssModules.d.ts` (not `css.d.ts`) so this ambient file is not taken as the types for the
// `src/css/` directory. TypeScript 6 enables `noUncheckedSideEffectImports` by default, which
// resolves every import; without this module, each CSS import fails `yarn type-check` with TS2882.
declare module "*.css";
