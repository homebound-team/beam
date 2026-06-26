# Beam global overlays (Modal & SuperDrawer)

This document is the **canonical contract** for mounting Beam's global overlays so modal and super-drawer content can use app React context. It ships with the `@homebound/beam` package for consuming apps.

## Rules (normative)

1. **Wrap the app in `BeamProvider`** — Required for `useModal`, `useSuperDrawer`, snackbars, and other Beam globals.
2. **Mount `<BeamOverlays />` once per `BeamProvider`** — Place it **inside** `BeamProvider`, **below** app-wide providers whose context overlay content should read.
3. **Do not mount multiple `BeamOverlays`** — A second instance logs a dev warning and can render duplicate modals.
4. **Route-scoped context still requires props** — Providers mounted only on a page or route do not wrap `BeamOverlays` unless you restructure the tree. Pass that data into `openModal` / `openInDrawer` content explicitly.

## Why this exists

`useModal` and `useSuperDrawer` render a **single global** Modal and SuperDrawer. Without `BeamOverlays`, Beam mounts them as **React siblings** of your app `children`. Content opened via `openModal({ content })` is then **outside** providers nested under `children`, so app context hooks in overlay content see default values.

This is a **React tree** issue, not a DOM portal issue. Portals change where nodes paint in the DOM; they do not change which providers wrap overlay content in React.

## Setup

```tsx
import { BeamOverlays, BeamProvider } from "@homebound/beam";

<BeamProvider>
  <AppWideProviders>
    {children}
    <BeamOverlays />
  </AppWideProviders>
</BeamProvider>;
```

`AppWideProviders` is whatever wraps most of your app — auth, data clients, feature config, etc. Mount `<BeamOverlays />` as a **descendant** of each provider whose context modals and drawers should see, typically as the last child alongside `{children}`.

Providers that call `useModal` or `useSuperDrawer` must remain **inside** `BeamProvider`. Providers scoped to a single route usually wrap only that route's `{children}`; overlay content on those screens still needs props unless you hoist those providers above `<BeamOverlays />`.

## Fallback (optional adoption)

If an app does **not** mount `BeamOverlays`, `BeamProvider` will render Modal and SuperDrawer at the legacy sibling position. Existing modals keep working; app-wide context in overlay content remains unavailable until `BeamOverlays` is added.

## Consuming apps

After install, this file is available at:

`node_modules/@homebound/beam/docs/overlays.md`

Add a pointer in the app's agent/onboarding docs, e.g.:

> Global modals/drawers: mount `<BeamOverlays />` per `@homebound/beam/docs/overlays.md`.

## GitHub (browse without install)

`https://github.com/homebound-team/beam/blob/main/docs/overlays.md`
