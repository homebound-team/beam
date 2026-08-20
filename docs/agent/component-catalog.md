# Component catalog (layout + grid table pages)

Exports from `@homebound/beam` that agents should use for the **grid table list page** archetype. Import by name from the package root.

## Route-tree shells (wrapped by consumer app)

| Export | Category | When to use |
|--------|----------|-------------|
| `EnvironmentBannerLayout` | layout | Outermost chrome; pass `environmentBanner` when `shouldShowEnvironmentBanner(env, impersonating)` |
| `shouldShowEnvironmentBanner` | util | Whether to show env / impersonation banner |
| `setEnvironmentFavicon` | util | App bootstrap (once) |
| `NavbarLayout` | layout | Global top nav; `navbar: NavbarProps` |
| `SideNavLayout` | layout | Domain side rail (when page needs side nav) |

## Page-level layouts

| Export | Category | When to use |
|--------|----------|-------------|
| `PageHeaderLayout` | layout | Page title, tabs, `rightSlot` actions |
| `GridTableLayout` | layout | Filters, search, edit-columns, table/card body |
| `useGridTableLayoutState` | hook | Persisted filters + search state for `GridTableLayout` |

## Table building blocks (inside GridTableLayout)

| Export | Category | When to use |
|--------|----------|-------------|
| `GridTable` | component | Rarely direct — prefer `GridTableLayout` |
| `Filters` | component | Usually via `useGridTableLayoutState` + `FilterDefs` |
| `FilterDefs` | type | Filter configuration shape |
| `multiFilter`, `toggleFilter`, etc. | util | Filter def builders |
| `Button` | component | Header actions, row actions |

## CSS var constants (advanced sticky chrome)

`beamEnvironmentBannerLayoutHeightVar`, `beamNavbarLayoutHeightVar`, `beamPageHeaderLayoutHeightVar`, `beamSideNavLayoutWidthVar`, `beamTableActionsHeightVar`, `stickyTableHeaderOffset`, etc. — from `@homebound/beam` layouts export.

## Do not build new layout elements

Scaffolding imports existing exports only. **Never** create new layout components or wrappers during a page-scaffold workflow. If an export is missing from this catalog, stop — add it to Beam first.

## Do not use for new pages (legacy consumer patterns)

These are app-local or legacy scroll models — not Beam layout exports:

- App `PageHeader`, `TableActions`, `PreventBrowserScroll`, `ScrollableParent` as page structure
- Inventing flex wrappers that duplicate `NavbarLayout` / `PageHeaderLayout`

## Storybook fixtures

`src/utils/sbComponents.tsx` — `createNavbar()`, `GridTableLayoutExample`, `TestProjectLayout` (Beam repo only; reference for composition).
