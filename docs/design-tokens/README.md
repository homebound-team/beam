# Beam Design Tokens Roadmap

This folder tracks Beam's design-token migration strategy (phased delivery).

**Authoring, codegen, validation, CI, and naming conventions** live in [`tokens/README.md`](../../tokens/README.md). **Phase 1 (contrast preset) — completed** summary: [`phase-1-contrast.md`](./phase-1-contrast.md). Palette→token sweep backlog: [`palette-token-sweep.md`](./palette-token-sweep.md).

## Phases

1. **Phase 1: Semantic colors + contrast preset**
   - Replace color-based contrast branches with semantic token usage (`var(--b-*, …)`).
   - Apply the contrast preset via `ContrastScope` / overlay roots (`data-theme` + generated CSS), not per-component props.
1.5. **System dark (reuse contrast axis)** — deferred
   - Not enabled: apps stay on light `:root` until dark mode is ready product-wide.
   - Future: codegen may emit `@media (prefers-color-scheme: dark)` applying contrast values on `:root`.
   - `ContrastScope` and Storybook’s **Color scheme** toolbar remain for forced contrast verification.
2. **Phase 2: Focus and shadow system**
   - Move focus-ring and danger ring stacks to tokenized shadow model.
3. **Phase 3: Form semantics**
   - Finish form-specific semantic coverage and simplify field state colors.
4. **Phase 4: Optional extensions**
   - Elevation/status/motion tokens where runtime theming needs justify them.
