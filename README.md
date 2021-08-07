# 🪵 Beam Design System

Homebound's React component design system.

_To see the latest designs, check out the [Figma](https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System-Refresh?node-id=0%3A1) file._

## Getting Started

```bash
# Only when running for the first time to install dependencies for Beam & Truss
> yarn
> cd ./truss && npm i # Note that this will change director to /truss

# Easiest way to start. This runs Storybook.
> yarn start

# Re-build src/Css.ts after changing truss/ config files
> yarn build:truss

# Automatically re-build src/Css.ts after changing truss/ config files
> yarn watch:truss
```

## Beam's API Design Approach

Beam is specifically "Homebound's Design System". Given this extremely narrow purpose, we can lean into the simplicity of:

- We don't need to support everything for everyone
- We can prefer API/UX consistency & simplicity over configuration & complexity

The most concrete manifestation of this is that we want to _provide as few props as possible_.

Fewer props generally means:

1. More consistent UX for users (the component cannot behave in N different ways, depending on the page the user sees it on)
2. Easier usage for client applications (fewer props to know and understand "...should I set this? or not?")
3. Simpler implementation for Beam components and maintainers
4. More flexibility to change the internal implementations of Beam components and roll out them relatively easily.

All of these points are generally in stark contrast to traditional, "big" UI toolkits like Material UI, Carbon from IBM, Spectrum from Adobe, etc., where they have to be "everything for everyone", and have the large API surface areas and complexity that comes with it.

For them, a MUI application in Company A shouldn't have to look & behave exactly like a MUI application in Company B. Which makes sense.

But for Beam at Homebound, we specifically _want_ a component that behaves in our App A to look & behave the same as it does in our App B.

## Beam and Open Source

As we open source Beam, this vision of "as few props as possible", "components must look _the same_ in every app" doesn't seem like something that other companies/projects would adopt (i.e. surely they want different colors, slightly different behavior to suit their user base, etc.).

Our proposal for solving this tension is to adopt a radically different model than "pull in the Beam npm library into your app and just use it as-is" (although you're free to do that too): it's forking.

"Adopters" of Beam should of course contribute back bug fixes and feature improvements; but they should also feel free (and encouraged) to run their own company-specific forks, and "customize by changing the source".

In this way, Beam should be seen as a place to "copy & paste" start from, rather than a project that will have 1,000s of npm downloads, and 100s of companies all collaborating on getting this _one_ `TextField` implementation to behave in the 101 different ways that they each want.

## Bundling

Beam provides both CommonJS and ESM artifacts.

The CommonJS artifacts are the output of the TypeScript compiler, are not bundled, and are intended to be used downstream for unit testing i.e. in Jest.

The ESM artifacts are from esbuild, and are bundled, and instead to be used for downstream bundling, i.e. in create-react-app/vitejs.

In terms of pros/cons of bundling:

- Pro: The biggest pro is the `esbuild` also bundles our CSS into `dist/index.css`, which we can refer to using `style: dist/index.css` in our `package.json`.

  Without this bundled CSS, vitejs was unable to rewrite the `require(./DateField.css)` line, and we were having to patch around it.

  Granted, a) we really don't use a lot of external file CSS files anyway, and b) we could bundle _just_ our CSS.

- Pro: The bundle is already ESM, which should "make life easier" (admittedly kinda vague) for vitejs downstream.

- (Non-con): I'd thought that a single `index.mjs` would not get tree-shaken, but shaking happens at the `export`-d symbol level and not a file level, so we should be fine.
