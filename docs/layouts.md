# Beam page layouts

This document is the **canonical contract** for structural page layouts in Beam. It ships with the `@homebound/beam` package so **consuming apps** (e.g. `internal-frontend`) can adopt the same rules without duplicating tribal knowledge.

## Rules (normative)

1. **Use the layouts for app page structure** — When a screen matches the navbar + body, side nav + content, or page-header + body pattern, compose **`EnvironmentBannerLayout`**, **`NavbarLayout`**, **`SideNavLayout`**, and **`PageHeaderLayout`** from `@homebound/beam` instead of ad-hoc flex wrappers that recreate the same regions.
2. **Preserve nesting order** when all apply: **`EnvironmentBannerLayout` → `NavbarLayout` → `SideNavLayout` → `PageHeaderLayout`**. Put **`CenteredLayout`** / **`FormSectionLayout`** in `PageHeaderLayout` / `StepperLayout` / `FocusedFormLayout` **children** — they are body-width shells, not chrome peers. Page headers stay full-bleed. `FormSectionLayout` wraps `CenteredLayout size="sm"` (do not wrap it again).
3. **Workflow layouts are standalone, not `PageHeaderLayout` peers** — Pick **`StepperLayout`** when the user is led through sequential steps, **`FocusedFormLayout`** for a single-page workflow without steps. Nest either as **`EnvironmentBannerLayout` → `StepperLayout` / `FocusedFormLayout`**, never under `NavbarLayout` or `SideNavLayout` — the intent is to keep attention on the workflow, not offer other exits via app nav. Both render `WorkflowHeader` (stepper strip only on `StepperLayout`) and own their chrome. Do not use a stepless `StepperLayout` for a form with no steps. JumpLinks live on **`FormSectionLayout`** (`withJumpLinks`), not on the workflow chrome.
4. **Layouts render Beam components, not arbitrary nodes** — Each layout owns its chrome and renders the real Beam component internally. Pass the component's props as a **nested object** (`environmentBanner`, `navbar`, `sideNav`, `pageHeader`); pass page body content via **`children`**. Workflow layouts are the exception: header-config props are flattened (since `WorkflowHeader` isn't public). `StepperLayout`'s body comes from `steps`; `FocusedFormLayout`'s body is **`children`** (typically `FormSectionLayout`). The layouts handle the document-scroll coordination (sticky chrome, auto-hide, CSS-var offsets) for you.
5. **Do not compose `AiPanel` / `AiCard` for app page structure** — Use a pre-composed AI surface: **`AiBanner`**, **`AiLinkCardGroup`**, **`AiLoadingPanel`**, **`AiSlimBanner`**, or **`aiMode`** on **`FormSectionLayout`**, **`StepperLayout`**, **`FocusedFormLayout`**, or **`Modal`**. `AiPanel` and `AiCard` are an escape hatch for one-off chrome only. If none of those fit, ask the Design System team whether a component already exists or should — do not invent a parallel AI layout.

## React (`@homebound/beam`)

| Layout                    | Renders                        | Props                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EnvironmentBannerLayout` | `EnvironmentBanner` (optional) | `environmentBanner?: EnvironmentBannerProps`; body → **`children`**                                                                                                                                                                                                                                                                                                                                                                                      |
| `NavbarLayout`            | `Navbar`                       | `navbar: NavbarProps`; body → **`children`**                                                                                                                                                                                                                                                                                                                                                                                                             |
| `SideNavLayout`           | `SideNav`                      | `sideNav: SideNavProps`; content → **`children`**; `railWidthPx?`, `showCollapseToggle?`, `contrastRail?`                                                                                                                                                                                                                                                                                                                                                |
| `PageHeaderLayout`        | `PageHeader`                   | `pageHeader: PageHeaderProps`; body → **`children`**                                                                                                                                                                                                                                                                                                                                                                                                     |
| `StepperLayout`           | `WorkflowHeader` + steps       | `title`, `onCancel`, `completeLabel`, `onComplete`, `onSaveAndExit?`, `isDirty?` flattened onto `StepperLayoutProps`, `steps: StepperLayoutStep[]` (label/isValid/disabled/content — no `value`, it's derived from `label`) — active step's `content` is the body and need not be `FormSectionLayout`; `defaultStep?` picks the initial step; standalone, only ever under `EnvironmentBannerLayout` (see rule 3). `aiMode?` paints the body AI background and uses the `ai` Continue/Complete variant — pair with `FormSectionLayout` `aiMode` for the card + gradient title. |
| `FocusedFormLayout`       | `WorkflowHeader` (no steps)    | Same flattened chrome as `StepperLayout`, plus `isValid`, `aiMode?` (page wash + `ai` CTA), and body → **`children`** (typically `FormSectionLayout`). Does **not** own JumpLinks — pass `withJumpLinks` on the body `FormSectionLayout`. Standalone, only ever under `EnvironmentBannerLayout` (see rule 3). |
| `CenteredLayout`          | centered body-width shell      | `size: "sm" \| "lg"`; body → **`children`**. **Not** a chrome peer (see rule 2). Horizontal padding 12px / 24px from `md`, publishes `--beam-layout-content-padding-x` for `layoutContainer` / sticky in-column chrome. `sm` = 720px content (768px shell max); `lg` = 1392px content (1440px shell max). `FormSectionLayout` wraps `CenteredLayout size="sm"` — do not wrap it again. |
| `FormSectionLayout`       | form + optional JumpLinks      | `title`, `sections?`, `withJumpLinks?` (default false; rail needs 2+ includable sections, hidden on `sm`), `excludeJumpLink` on a section to omit it from the rail, `aiMode?` (`AiCard` + gradient title). Use as a `StepperLayout` step body or as `FocusedFormLayout` children. The rail does **not** shift the form: the content column mirrors the rail's 192px on its right, so the shell stays centered on the page exactly as it is without the rail (CSS-only `clamp`, no measuring). Below ~1152px there is no room for both, so the mirror shrinks and the form keeps its full width instead of narrowing. |

`EnvironmentBannerLayout` is the **outermost** wrapper. Pass `environmentBanner` when `shouldShowEnvironmentBanner(env, impersonating, showProdWarning)` is true (`dev`, `qa`, `local-prod`, or `prod` while impersonating or with `showProdWarning`); omit it (or pass `undefined`) when hidden (`local`, or `prod` without impersonation or `showProdWarning`). The banner does **not** auto-hide.

The navbar and page header **always auto-hide** — they scroll away on scroll-down and slide back in on
scroll-up. (Workflow layout headers are the exception — see below.)

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

On the `sm` breakpoint (≤599px), `NavbarLayout` + `SideNavLayout` share **one hamburger**. `SideNavLayout` does not render its rail or collapse toggle; it registers its `items` (and optional `top` / `footer`) as the mobile menu's nested pane. The drawer renders both levels with the same `AppNavItems` chrome and page-content inset. Opening the menu shows that mobile sub-nav first (`level: "sub"`), with **Main Menu** to switch to `Navbar.items` (`level: "global"`). Close, scrim, or route change dismisses the drawer; the next open lands on the sub-nav again. Pages without a registered mobile sub-nav keep the main-only drawer. On `mdAndUp` the SideNav rail is unchanged; a hamburger that appears from navbar overflow stays main-only.

When the rail is collapsed, `SideNav` hides `top`, `items`, and `footer` (toggle-only strip). Pass `showContentWhenCollapsed` on `sideNav` to keep those slots (icon-only items when every link has an icon). The mobile sub-nav always receives the full slots.

Workflow pages skip `NavbarLayout`/`SideNavLayout` entirely. **`StepperLayout`** is the sequential
experience: `steps` drives the header's tab strip, the active step's `content` is the body, and
Continue/Complete is gated on that step's `isValid`. The layout owns step navigation (`defaultStep`
only picks the start). **`FocusedFormLayout`** is the stepless workflow chrome: pass the body as
**`children`** (typically `FormSectionLayout`). JumpLinks are owned by **`FormSectionLayout`**
(`withJumpLinks`, section `excludeJumpLink`) — use the same body in a Stepper step or under
FocusedForm. `aiMode` on the workflow paints a full-bleed wash; pair with `FormSectionLayout`
`aiMode` for the card + gradient title.

```tsx
import {
  EnvironmentBannerLayout,
  FocusedFormLayout,
  shouldShowEnvironmentBanner,
  StepperLayout,
} from "@homebound/beam";

<EnvironmentBannerLayout
  environmentBanner={
    shouldShowEnvironmentBanner(env, impersonating, showProdWarning)
      ? { env, impersonating, showProdWarning }
      : undefined
  }
>
  <StepperLayout
    title={title}
    onCancel={onCancel}
    completeLabel={completeLabel}
    onComplete={onComplete}
    isDirty={() => formState.dirty}
    steps={steps}
  />
</EnvironmentBannerLayout>;
```

```tsx
<FocusedFormLayout
  title={title}
  onCancel={onCancel}
  completeLabel="Create"
  onComplete={onComplete}
  isValid={formState.valid}
  isDirty={() => formState.dirty}
>
  <FormSectionLayout withJumpLinks title={formTitle} sections={sections} />
</FocusedFormLayout>
```

When `isDirty` returns true, Cancel, in-app React Router navigation, and tab close/refresh ask the user to confirm before leaving. Requires a data router (`RouterProvider` / `createBrowserRouter`) for in-app blocking. Do **not** also register the same form with an app-level navigation check (e.g. `useRegisterNavigationCheck`) — only one `useBlocker` should guard the page.

#### Multiple form states (one per step)

When each step has its own `@homebound/form-state` instance, keep those forms **alive on the workflow page** (not created/destroyed with step mount). Load each step’s server data on demand into `useFormState`’s `init` so hydration does not mark the form dirty. Aggregate dirty flags in `isDirty`:

```tsx
function CreateThingWorkflow() {
  // Config-only at first — light. Fetch each step’s input when that step is visited, then pass it to `init`.
  const [basicsInput, setBasicsInput] = useState<BasicsInput | undefined>();
  const [detailsInput, setDetailsInput] = useState<DetailsInput | undefined>();

  const basicsForm = useFormState({
    config: basicsConfig,
    ...(basicsInput ? { init: { input: basicsInput, map: (i) => i } } : {}),
  });
  const detailsForm = useFormState({
    config: detailsConfig,
    ...(detailsInput ? { init: { input: detailsInput, map: (i) => i } } : {}),
  });

  return (
    <StepperLayout
      title={title}
      onCancel={onCancel}
      completeLabel="Create"
      onComplete={onComplete}
      isDirty={() => basicsForm.dirty || detailsForm.dirty}
      steps={[
        {
          label: "Basics",
          isValid: basicsForm.valid,
          content: <BasicsStep form={basicsForm} onLoad={setBasicsInput} />,
        },
        {
          label: "Details",
          isValid: detailsForm.valid,
          disabled: !basicsForm.valid,
          content: <DetailsStep form={detailsForm} onLoad={setDetailsInput} />,
        },
      ]}
    />
  );
}
```

Avoid creating form state only inside step content that unmounts when the user changes steps — leave protection would lose dirty state for unvisited/unmounted steps. Prefer feeding loaded data through `init` (or `set` + `commitChanges`) rather than field-by-field edits that look like user changes.

See Storybook: **StepperLayoutMultiFormApp** for a runnable example.

### Environment favicons

Favicon **image files** are app-owned (host PNGs under your app's `public/` directory; 32×32 PNG recommended for Safari). Beam provides **`setEnvironmentFavicon(env, favicons)`** — call it once at app bootstrap (e.g. `main.tsx`) with the same `env` used for `EnvironmentBannerLayout`. Keep a static default `<link rel="icon">` in `index.html` for first paint before React hydrates.

### Scroll coordination (informative)

The layouts share a **document-scroll** model: the environment banner, navbar, side nav rail, and page header pin via
`position: sticky/fixed` and communicate through CSS custom properties so wide content (e.g. large
tables) uses the document scrollbars while chrome stays in place:

- `DocumentScrollLayoutProvider` (via `EnvironmentBannerLayout` or each layout's outermost wrapper) measures and publishes the
  visible viewport size (`--beam-layout-viewport-width` / `--beam-layout-viewport-height`). Its root also uses
  `width: fit-content; min-width: 100%` so sticky chrome stays pinned when wide content expands the document horizontally,
  regardless of which layout is outermost.
- `EnvironmentBannerLayout` publishes the displayed banner height (`--beam-environment-banner-height`; `0px` when hidden, `32px` when shown).
- `NavbarLayout` measures and publishes the navbar height (`--beam-navbar-layout-height`).
- `SideNavLayout` publishes its rail width (`--beam-side-nav-layout-width`) for sticky column offsets.
- `PageHeaderLayout` reads those and publishes its own height (`--beam-page-header-layout-height`).
- `GridTableLayout` — **inside `DocumentScrollLayoutProvider`** (e.g. under `NavbarLayout` / `PageHeaderLayout`): when filters, search, or edit-columns are shown, measures and publishes the table actions toolbar height (`--beam-table-actions-height`), pins table actions with the other document-scroll chrome, and renders the table inline for document scroll. **`GridTable`** reads these vars so its sticky header sits below the environment banner + navbar + page header + table actions and its sticky columns sit right of the side nav rail. Pass **`withRightPane`** (`true` for the default width, or a px number) to opt the table into **`DocumentScrollRightPaneLayout`** around **only the table body** (table actions stay outside so they remain full-bleed); open the pane via **`useRightPane`**. The layout hosts the fixed pane (pinned below table actions via `stickyTableHeaderOffset`), publishes scoped `--beam-right-pane-width` for sticky **right** columns, and adds a matching-width spacer so horizontal document scroll can reach columns under the pane. Omit `withRightPane` when the page does not use a detail pane. Do **not** wrap the whole `GridTableLayout` (or legacy **`RightPaneLayout`**) for this pattern. **Outside document-scroll layouts**, `GridTableLayout` does not pin table actions; it wraps the table in **`ScrollableParent` / `ScrollableContent`** (with `virtualized` when `as="virtual"`) so scrolling stays in the legacy page scroll region — keep using **`RightPaneLayout`** there until the page migrates.
- `DocumentScrollRightPaneLayout` — document-scroll right pane wrapper (`children` = main content; pane content comes from `openRightPane`). **Desktop / `md+`:** fixed pane + spacer; `top` / height use `stickyTableHeaderOffset()` / `documentScrollRightPaneHeight()` so unset chrome vars fall back to `0px`; pane width is `min(paneWidth, documentScrollChromeWidth())`. Publishes scoped `--beam-right-pane-width` for sticky-right descendants, and `--beam-floating-right-offset` on `document.documentElement` so floating chrome outside the layout (e.g. `DocumentScrollToTopButton` via `getFloatingRightOffset`) can clear the pane without leaking the pane-width token globally. **`sm`:** the open pane is a full-bleed fixed overlay portaled to `document.body`, pinned below the environment banner (same banner-height context pattern as `NavbarMobileMenu`), covering navbar / page header / table actions; document scroll is locked via `usePreventScroll`; no horizontal spacer and width vars stay `0px`. Used by `GridTableLayout` around the table body; other surfaces can adopt it later.
- `StepperLayout` / `FocusedFormLayout` publish `--beam-page-header-layout-height` the same way `PageHeaderLayout` does (so `stickyNavAndHeaderOffset` / `stickyTableHeaderOffset` / `GridTable` keep working unchanged inside a workflow page), but their headers do **not** auto-hide — they stay always visible/sticky, and they do no scroll-position tracking of their own. `StepperLayout`'s stepper tabs collapse to a condensed indicator bar on the `sm` breakpoint only; there is no scroll-driven collapse at `md`+ (that behavior was removed pending a revisit — `useScrollCollapse` is kept but unused). On the `sm` breakpoint, action buttons move to a sticky mobile footer instead, whose height they publish as `--beam-workflow-layout-footer-height`. `getFloatingBottomOffset(basePx?)` reads that var so bottom-anchored floating chrome (e.g. `DocumentScrollToTopButton`) stacks above the footer instead of being covered by it — the same pattern future bottom-anchored elements should use. `aiMode` paints a full-bleed `aiBackground` wash on the body and uses the `ai` Continue/Complete variant — pair with `FormSectionLayout` `aiMode` for the `AiCard` + gradient title. `FormSectionLayout` JumpLinks (`withJumpLinks`) are hidden on `sm`.

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
