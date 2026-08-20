# Page recipes

Page archetypes → Beam composition. **Code is source of truth** until Figma library components are fully aligned.

## Layout shell only page

**Example:** Figma [Some example page](https://www.figma.com/design/aWUE4pPeUTgrYZ4vaTYZQU/?node-id=49463-6484) — Environment Banner Layout → Navbar Layout → empty PageHeader Layout.

**Figma signals:** nested layout instances present; page body slot empty; no PAGE HEADER text or table.

### Route tree (consumer app)

```
AppShell
  └── EnvBannerLayout
        └── BeamNavbarLayout
              └── MyPage
```

Every new page includes `EnvBannerLayout`. Include `BeamNavbarLayout` for standard global-nav pages.

### Page component

```tsx
<PageHeaderLayout pageHeader={{ title: "Page Title" }} />
```

No `children`, no GraphQL, no `GridTableLayout`. Title from user prompt when Figma header is unfilled.

### Supporting code

None required — optional route smoke test only.

---

## Grid table list page

**Example:** internal-frontend Global Product Offerings index.

**Figma signals:** page title + primary action; filter row; table or card grid.

### Route tree (consumer app)

Same as layout-shell-only.

### Page component

```tsx
<PageHeaderLayout pageHeader={{ title, rightSlot }}>
  <GridTableLayout
    layoutState={layoutState}
    defaultView="card"
    withCardView
    tableProps={{ rows, columns, sorting, fallbackMessage, rowStyles }}
  />
</PageHeaderLayout>
```

### Supporting code

| Piece | Beam / app |
|-------|------------|
| Filter + search state | `useGridTableLayoutState`, `FilterDefs` |
| Columns / rows | Co-located `*Table.tsx` factories |
| Data | Apollo co-located `.graphql` (consumer app) |

### Storybook reference (Beam)

- `NavbarLayout.stories.tsx` → `ComposedWithEnvironmentBanner` — full shell + table example
- `PageHeaderLayout.stories.tsx` → `Default`
- `GridTableLayout.stories.tsx` — table layout behavior

### Not in scope yet

| Archetype | Status |
|-----------|--------|
| Form page | No page-content layout recipe — use ad-hoc until Beam ships pattern |
| Detail page | Same |
| Settings page | Same |
| Workflow (no global nav) | Shell not defined — track in consumer `layout-architecture.md` |
| Side nav + table | Beam `SideNavLayout` in route tree not wired in consumer app yet |

When a new archetype ships, add a section here before scaffolding agents use it.
