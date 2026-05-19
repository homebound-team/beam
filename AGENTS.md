## Testing

Use `vitest` to run tests, not jest. Example:

```
npx vitest run src/forms/FormLines.test.tsx
```

## Design tokens

Authoring, structure, nomenclature, and commands: [`tokens/README.md`](tokens/README.md) (source: [`tokens/tokens.json`](tokens/tokens.json)). After JSON edits: `yarn generate:design-tokens` (also at the start of `yarn build` / `yarn build:truss`), then `yarn validate:tokens`. **CI** runs **`yarn validate:tokens`** then **`yarn check:token-drift`** before `yarn build`; on drift, regenerate, commit `truss-token-vars.ts`, `truss-palette.ts`, and `src/css/generated/theme-scopes.css`, and push. Roadmap: [`docs/design-tokens/README.md`](docs/design-tokens/README.md).

## Linting

CI **`validate-code`** runs **`yarn lint:ci`** on `src/` (ESLint with cache + quiet, same as local). **Before opening a PR**, run **`yarn lint:ci`** and fix all reported issues so the lint job does not fail downstream.

Whenever you edit **`.ts` / `.tsx` / `.js` under `src/`**, run ESLint with **`--fix`** on those paths (then address anything left manually):

```
yarn lint:fix:files src/components/Example.tsx
```

Pass every touched path under `src/`. For a full-tree autofix, use **`yarn lint:fix`**.
