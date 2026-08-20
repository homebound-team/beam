# Beam agent docs

Machine-readable design-system knowledge for AI agents scaffolding pages in consuming apps (e.g. internal-frontend).

## How to use (consumer apps)

1. Read from the **installed package**: `node_modules/@homebound/beam/docs/agent/`
2. Always pair with `@homebound/beam/docs/layouts.md` for the full layout contract.
3. For app-specific routing and file conventions, use the consumer app's scaffold skill (e.g. internal-frontend `.cursor/skills/scaffold-beam-page/`).

## Files

| File | Purpose |
|------|---------|
| [layouts.md](./layouts.md) | Agent-oriented layout nesting, route-tree vs page split |
| [page-recipes.md](./page-recipes.md) | Page archetypes → Beam composition (start here for scaffolding) |
| [component-catalog.md](./component-catalog.md) | Layout and table-page exports agents should use |
| [figma-mapping.json](./figma-mapping.json) | Figma frame/component names → Beam exports (partial — see below) |

## Figma mapping status

The Beam Figma library is **not fully aligned** with production layout components yet. The Layouts POC page has structural shell frames (`Layout / Outer Shell`, etc.) but many atomic components lack Code Connect links and stable library names.

**Until Figma catches up, agents should:**

1. Prefer **page-recipes.md** and **component-catalog.md** (code is source of truth).
2. Use **figma-mapping.json** for structural shell detection and `figmaStatus` hints — not as an exhaustive component registry.
3. **Do not build new layout elements** when scaffolding pages — compose existing Beam layouts and consumer route wrappers only.
4. Ask the user to confirm ambiguous mappings.

When Figma components are published and linked, extend `figma-mapping.json` and optionally add a generator script from Storybook `parameters.design.url`.

## Versioning

These docs ship with `@homebound/beam` semver. Consumer skills should read the installed version, not hardcode export lists.
