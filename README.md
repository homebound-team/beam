# 🪵 Beam Design System

Homebound's React component design system.

_To see the latest designs, check out the [Figma](https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System-Refresh?node-id=0%3A1) file._

## Getting Started

There are a few ways to run the application each with its own advantage.

```bash
# Only when running for the first time to install dependencies for Beam & Truss
> yarn
> cd ./truss && npm i # Note that this will change director to /truss

# Easiest way to start.
# This runs Storybook and Truss/Beam automatic build process
> yarn start

# Alternatively Beam/Truss automatic build process can be started independently from storybook by using two terminals.
> yarn watch
> yarn storybook

# Lastly, the following three commands can be used to achieve the same result.
# This makes the console output easier to read
> yarn watch:beam
> yarn watch:truss # Only required if any ./truss/*.ts files will be altered
> yarn storybook
```

## Commands

### `> yarn storybook`

This loads the stories from `./stories`.

> NOTE: Stories should reference the components as if using the library, similar to the example playground. This means importing from the root project directory. This has been aliased in the tsconfig and the storybook webpack config as a helper.
