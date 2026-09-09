// Beam imports CSS for its side effects, i.e. `import "./trix.css"`, and lets Vite and tsup turn those
// imports into stylesheets at bundle time. TypeScript never has a module to resolve them to, because
// no `.d.ts` describes a `.css` file.
//
// Up through TypeScript 5, that was fine: a side-effect import was not resolved or type-checked at all,
// so an unresolvable one was silently accepted. TypeScript 6 turns on `noUncheckedSideEffectImports` by
// default, which makes it resolve every import, and each CSS import then fails `yarn type-check` with
// TS2882 "Cannot find module or type declarations for side-effect import". This ambient declaration
// gives every `*.css` specifier a module to resolve to, so the imports type-check again without any
// change to how they are bundled.
declare module "*.css";
