# Beam page layouts

This document is the **canonical contract** for structural page layouts in Beam. It ships with the `@homebound/beam` package so **consuming apps** (e.g. `internal-frontend`) can adopt the same rules without duplicating tribal knowledge.

## Rules (normative)

1. **Use the layouts for app page structure** — When a screen matches the navbar + body, side nav + content, or page-header + body pattern, compose **`NavbarLayout`**, **`SideNavLayout`**, and **`PageHeaderLayout`** from `@homebound/beam` instead of ad-hoc flex wrappers that recreate the same regions.
2. **Preserve nesting order** when all three apply: **`NavbarLayout` → `SideNavLayout` → `PageHeaderLayout`**.
3. **Layouts render Beam components, not arbitrary nodes** — Each layout owns its chrome and renders the real Beam component internally. Pass the component's props as a **nested object** (`navbar`, `sideNav`, `pageHeader`); pass page body content via **`children`**. The layouts handle the document-scroll coordination (sticky chrome, auto-hide, CSS-var offsets) for you.

## React (`@homebound/beam`)

| Layout | Renders | Props |
|--------|---------|-------|
| `NavbarLayout` | `Navbar` | `navbar?: NavbarProps`; body → **`children`** |
| `SideNavLayout` | `SideNav` | `sideNav?: SideNavProps`; content → **`children`**; `railWidthPx?`, `showCollapseToggle?`, `contrastRail?` |
| `PageHeaderLayout` | `PageHeader` | `pageHeader?: PageHeaderProps`; body → **`children`** |

The navbar and page header **always auto-hide** — they scroll away on scroll-down and slide back in on
scroll-up.

```tsx
import { NavbarLayout, PageHeaderLayout, SideNavLayout } from "@homebound/beam";

<NavbarLayout navbar={{ brand, items, user }}>
  <SideNavLayout sideNav={{ top, items, footer }}>
    <PageHeaderLayout pageHeader={{ title, tabs }}>
      <YourPageBody />
    </PageHeaderLayout>
  </SideNavLayout>
</NavbarLayout>;
```

### Scroll coordination (informative)

The layouts share a **document-scroll** model: the navbar, side nav rail, and page header pin via
`position: sticky/fixed` and communicate through CSS custom properties so wide content (e.g. large
tables) uses the document scrollbars while chrome stays in place:

- `NavbarLayout` measures and publishes the navbar height (`--beam-navbar-layout-height`) and the
  visible viewport size (`--beam-layout-viewport-width` / `--beam-layout-viewport-height`).
- `SideNavLayout` publishes its rail width (`--beam-side-nav-layout-width`) for sticky column offsets.
- `PageHeaderLayout` reads those and publishes its own height (`--beam-page-header-layout-height`).
- `GridTable` reads these vars so its sticky header sits below the navbar + page header and its sticky
  columns sit right of the side nav rail.

The exported var-name constants (`beamNavbarLayoutHeightVar`, etc.) are available for advanced sticky
chrome inside a page body.

Source: `src/layouts/` in the Beam repo. **Storybook:** co-located `*.stories.tsx` next to each layout.

## Consuming apps (e.g. internal-frontend)

After `yarn` / `npm install`, this file is available at:

`node_modules/@homebound/beam/docs/layouts.md`

**Hoist the rule into the app repo** so any AI or human touching pages sees it:

1. **Link or copy** — In the app's `AGENTS.md`, `CLAUDE.md`, or team onboarding doc, add a short **mandatory** pointer, for example:

   > Page structure: use Beam layouts (`NavbarLayout`, `SideNavLayout`, `PageHeaderLayout`) per `@homebound/beam/docs/layouts.md` (or the same file under `node_modules` after install). Do not invent parallel page layouts unless design signs off.

2. **Cursor / IDE** — Add an app-level Cursor rule (or extend team defaults) that references the same path or the GitHub raw URL to `docs/layouts.md` on `main`.

3. **Versioning** — When Beam bumps, re-read the doc in the version you depend on; layout contracts may evolve in semver-minor releases—changelog / PR description should call out layout changes.

## GitHub (browse without install)

`https://github.com/homebound-team/beam/blob/main/docs/layouts.md`
