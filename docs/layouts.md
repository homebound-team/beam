# Beam page layouts

This document is the **canonical contract** for structural page layouts in Beam. It ships with the `@homebound/beam` package so **consuming apps** (e.g. `internal-frontend`) can adopt the same rules without duplicating tribal knowledge.

## Rules (normative)

1. **Use the layouts for app page structure** — When a screen matches the navbar + body, side nav + content, or page-header + body pattern, compose **`EnvironmentBannerLayout`**, **`NavbarLayout`**, **`SideNavLayout`**, and **`PageHeaderLayout`** (or **`WorkflowLayout`** for step-based workflow pages) from `@homebound/beam` instead of ad-hoc flex wrappers that recreate the same regions.
2. **Preserve nesting order** when all apply: **`EnvironmentBannerLayout` → `NavbarLayout` → `SideNavLayout` → `PageHeaderLayout`**. For step-based workflow pages, use **`WorkflowLayout`** as the innermost layout instead of `PageHeaderLayout` — the two are not nested together, since `WorkflowLayout` renders a different header component (`WorkflowHeader`) and owns its own chrome. Its body is arbitrary content, passed as `children`, the same way `GridTableLayout`/arbitrary content is `PageHeaderLayout`'s.
3. **Layouts render Beam components, not arbitrary nodes** — Each layout owns its chrome and renders the real Beam component internally. Pass the component's props as a **nested object** (`environmentBanner`, `navbar`, `sideNav`, `pageHeader`/`workflowHeader`); pass page body content via **`children`**. The layouts handle the document-scroll coordination (sticky chrome, auto-hide, CSS-var offsets) for you.

## React (`@homebound/beam`)

| Layout                    | Renders                        | Props                                                                                                      |
| ------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `EnvironmentBannerLayout` | `EnvironmentBanner` (optional) | `environmentBanner?: EnvironmentBannerProps`; body → **`children`**                                        |
| `NavbarLayout`            | `Navbar`                       | `navbar: NavbarProps`; body → **`children`**                                                               |
| `SideNavLayout`           | `SideNav`                      | `sideNav: SideNavProps`; content → **`children`**; `railWidthPx?`, `showCollapseToggle?`, `contrastRail?`  |
| `PageHeaderLayout`        | `PageHeader`                   | `pageHeader: PageHeaderProps`; body → **`children`**                                                       |
| `WorkflowLayout`    | `WorkflowHeader`               | `workflowHeader: WorkflowHeaderConfig`; body → **`children`**                                              |

`EnvironmentBannerLayout` is the **outermost** wrapper. Pass `environmentBanner` when `shouldShowEnvironmentBanner(env, impersonating, showProdWarning)` is true (`dev`, `qa`, `local-prod`, or `prod` while impersonating or with `showProdWarning`); omit it (or pass `undefined`) when hidden (`local`, or `prod` without impersonation or `showProdWarning`). The banner does **not** auto-hide.

The navbar and page header **always auto-hide** — they scroll away on scroll-down and slide back in on
scroll-up. (`WorkflowLayout`'s header is the one exception — see below.)

```tsx
// main.tsx (once at bootstrap, before render)
import { setEnvironmentFavicon } from "@homebound/beam";

setEnvironmentFavicon(env, {
  default: "/favicons/favicon.png",
  dev: "/favicons/favicon-dev.png",
  qa: "/favicons/favicon-qa.png",
  "local-prod": "/favicons/favicon-local-prod.png",
  prod: "/favicons/favicon-prod.png",
});

// App shell
import {
  EnvironmentBannerLayout,
  NavbarLayout,
  PageHeaderLayout,
  shouldShowEnvironmentBanner,
  SideNavLayout,
} from "@homebound/beam";

<EnvironmentBannerLayout
  environmentBanner={
    shouldShowEnvironmentBanner(env, impersonating, showProdWarning)
      ? { env, impersonating, showProdWarning }
      : undefined
  }
>
  <NavbarLayout navbar={{ brand, items, user }}>
    <SideNavLayout sideNav={{ top, items, footer }}>
      <PageHeaderLayout pageHeader={{ title, tabs }}>
        <YourPageBody />
      </PageHeaderLayout>
    </SideNavLayout>
  </NavbarLayout>
</EnvironmentBannerLayout>;
```

### Environment favicons

Favicon **image files** are app-owned (host PNGs under your app's `public/` directory; 32×32 PNG recommended for Safari). Beam provides **`setEnvironmentFavicon(env, favicons)`** — call it once at app bootstrap (e.g. `main.tsx`) with the same `env` used for `EnvironmentBannerLayout`. Keep a static default `<link rel="icon">` in `index.html` for first paint before React hydrates.

### Scroll coordination (informative)

The layouts share a **document-scroll** model: the environment banner, navbar, side nav rail, and page header pin via
`position: sticky/fixed` and communicate through CSS custom properties so wide content (e.g. large
tables) uses the document scrollbars while chrome stays in place:

- `DocumentScrollLayoutProvider` (via `EnvironmentBannerLayout` or each layout's outermost wrapper) measures and publishes the
  visible viewport size (`--beam-layout-viewport-width` / `--beam-layout-viewport-height`).
- `EnvironmentBannerLayout` publishes the displayed banner height (`--beam-environment-banner-height`; `0px` when hidden, `32px` when shown).
- `NavbarLayout` measures and publishes the navbar height (`--beam-navbar-layout-height`).
- `SideNavLayout` publishes its rail width (`--beam-side-nav-layout-width`) for sticky column offsets.
- `PageHeaderLayout` reads those and publishes its own height (`--beam-page-header-layout-height`).
- `GridTableLayout` — **inside `DocumentScrollLayoutProvider`** (e.g. under `NavbarLayout` / `PageHeaderLayout`): when filters, search, or edit-columns are shown, measures and publishes the table actions toolbar height (`--beam-table-actions-height`), pins table actions with the other document-scroll chrome, and renders the table inline for document scroll. **`GridTable`** reads these vars so its sticky header sits below the environment banner + navbar + page header + table actions and its sticky columns sit right of the side nav rail. **Outside document-scroll layouts**, `GridTableLayout` does not publish that var or pin table actions; it wraps the table in **`ScrollableParent` / `ScrollableContent`** (with `virtualized` when `as="virtual"`) so scrolling stays in the legacy page scroll region.
- `WorkflowLayout` publishes `--beam-page-header-layout-height` the same way `PageHeaderLayout` does (so `stickyNavAndHeaderOffset` / `stickyTableHeaderOffset` / `GridTable` keep working unchanged inside a workflow page), but its header itself does **not** auto-hide — it stays always visible/sticky. It reuses the same scroll-direction tracking as the navbar/page-header auto-hide, but for a different effect: its stepper tabs collapse on scroll-down and re-expand on scroll-up (even before reaching the top), rather than the header sliding away. On the `sm` breakpoint, its header's action buttons move to a sticky mobile footer instead, whose height it publishes as `--beam-workflow-layout-footer-height` (read by `DocumentScrollToTopButton` so the floating scroll-to-top control isn't covered by the footer).

The exported var-name constants (`beamNavbarLayoutHeightVar`, etc.) are available for advanced sticky
chrome inside a page body.

Source: `src/layouts/` in the Beam repo. **Storybook:** co-located `*.stories.tsx` next to each layout.

## Consuming apps (e.g. internal-frontend)

After `yarn` / `npm install`, this file is available at:

`node_modules/@homebound/beam/docs/layouts.md`

**Hoist the rule into the app repo** so any AI or human touching pages sees it:

1. **Link or copy** — In the app's `AGENTS.md`, `CLAUDE.md`, or team onboarding doc, add a short **mandatory** pointer, for example:

   > Page structure: use Beam layouts (`EnvironmentBannerLayout`, `NavbarLayout`, `SideNavLayout`, `PageHeaderLayout`) per `@homebound/beam/docs/layouts.md` (or the same file under `node_modules` after install). Do not invent parallel page layouts unless design signs off.

2. **Cursor / IDE** — Add an app-level Cursor rule (or extend team defaults) that references the same path or the GitHub raw URL to `docs/layouts.md` on `main`.

3. **Versioning** — When Beam bumps, re-read the doc in the version you depend on; layout contracts may evolve in semver-minor releases—changelog / PR description should call out layout changes.

## GitHub (browse without install)

`https://github.com/homebound-team/beam/blob/main/docs/layouts.md`
