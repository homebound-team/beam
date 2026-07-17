# Layouts (agent summary)

Full contract: [`../layouts.md`](../layouts.md).

## Nesting order (when all apply)

```
EnvironmentBannerLayout → NavbarLayout → SideNavLayout? → PageHeaderLayout → page body
```

## Route tree vs page component (internal-frontend pattern)

Consuming apps wrap Beam layouts in route-tree components. Pages render header + body only.

| Layer | Beam export | Typical route wrapper | In page file? |
|-------|-------------|----------------------|---------------|
| Env banner | `EnvironmentBannerLayout` | `EnvBannerLayout` | No |
| Global nav | `NavbarLayout` | `BeamNavbarLayout` | No |
| Side nav | `SideNavLayout` | (future route wrapper) | No |
| Page header | `PageHeaderLayout` | — | **Yes** |
| Table/list body | `GridTableLayout` | — | **Yes** (only supported page-content layout today) |

## Detection heuristics (Figma)

| Figma signal | Likely mapping |
|--------------|----------------|
| Full-width top bar with logo + nav links | Route: `EnvironmentBannerLayout` + `NavbarLayout` |
| Left rail with section links | Route: `SideNavLayout` (or skip if page has no side nav) |
| Sticky title row + right actions | Page: `PageHeaderLayout` |
| Filter bar + search + table or card grid | Page: `GridTableLayout` |
| Nested gray scroll region / `PreventBrowserScroll` | **Legacy** — do not use for new pages |

## Scroll model

New pages use **document scroll**. Layouts publish CSS vars (`beamNavbarLayoutHeightVar`, etc.) so `GridTable` sticky chrome aligns with env banner + navbar + page header + table actions.

Legacy app patterns (`ScrollableParent`, nested scroll) are being replaced — see consumer app `layout-architecture.md`.

## Props pattern

Layouts take nested prop objects; body via `children`:

```tsx
<EnvironmentBannerLayout environmentBanner={{ env, impersonating }}>
  <NavbarLayout navbar={navbarProps}>
    <PageHeaderLayout pageHeader={{ title, rightSlot }}>
      <GridTableLayout layoutState={...} tableProps={...} />
    </PageHeaderLayout>
  </NavbarLayout>
</EnvironmentBannerLayout>
```

Side nav omitted when the page has no side rail (e.g. Global Product Offerings).

## Do not build new layout elements

Scaffolding and Figma-to-code workflows **compose** existing layouts — they do not author new layout components. Import from `@homebound/beam`; in consumer apps use existing route wrappers (`EnvBannerLayout`, `BeamNavbarLayout`). If a design needs a layout not listed above, add it to Beam first, then update the mapping.
