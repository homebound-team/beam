# Palette → semantic token sweep

Companion to the palette→token migration (contrast axis ready; OS system dark deferred). **No new tokens** — only replacements where an existing `Tokens.*` role matches.

Authoring / theming: [`tokens/README.md`](../../tokens/README.md). Roadmap: [`README.md`](./README.md).

## Replaced (high-confidence)

| Area | Examples |
|------|----------|
| Scrims | `NavbarMobileMenu`, `SuperDrawer` → `Tokens.Scrim` |
| Nav chrome | `NavLink` global → `Nav*` / `bshFocus`; Snackbar surface/ink → `SurfaceRaised` / `OnSurface` |
| Chrome dividers | `MenuItem`, Modal/SuperDrawer headers, ListBox, FormDivider → `SurfaceSeparator` / `FieldBorderDefault` |
| Buttons / IconButtons | secondary/secondaryBlack/quaternary/textSecondary + focus rings → Surface / FieldBorder* / FocusRing* / TextLink*; circle pressed → NeutralFillPressed |
| Fields | TextFieldBase contrast `.white` removed; clear/error icons → OnSurfaceMuted / Danger; CompoundField borders → Field* |
| Interactive | Tabs, Accordion, Switch, Checkbox, Radio, ToggleButton, SelectCard, ButtonGroup, Stepper (partial) |
| Layouts | Modal, FormPageLayout, TableReviewLayout, GridTableLayout header, RightSidebar, RightPaneLayout, PageHeaderBreadcrumbs, Pagination, Card, Tooltip, Copy, Avatar, EnvironmentBanner ink, AutoSaveIndicator, RichTextField read-only, DateField icons, GridTableEmptyState |
| Tables | `TableStyles` / Row / SortHeader / ExpandableHeader / PinToggle / ColumnResizeHandle / TableCard — Surface, OnSurface*, SurfaceSeparator, SurfaceSubtle, ListRowBgHover, TextLink*, FocusRingInset, Primary (kept Blue50 pin/active + Yellow100 kept-group) |
| Default page chrome | `CssReset` `body { color/background: var(--b-on-surface) / var(--b-surface) }`; Edit Columns + DatePicker day → `OnSurface` |
| Contrast secondary press | `NeutralFillHoverSubtle` → Gray800, `NeutralFillPressed` / `NeutralSurfacePressed` → Gray700 (was near-white) |
| Date picker popover | Panel → `PopoverSurface` + `OnSurface`; header/weekdays/days/day.css hover→tokens; contrast `PopoverSurface` → Gray800 (raised) |

## Kept (no matching semantic token)

| Pattern | Why |
|---------|-----|
| Banner / Chip / Tag / ToggleChip / Button caution ink (`gray900`) | Dark ink on fixed light pastel fills — `OnSurface` would flip to white in dark mode and lose contrast until status fills are tokenized |
| Snackbar status icon colors (`Red400`, `Yellow300`, …) | No per-status icon tokens |
| Button danger / caution fill ramps | Only disabled/focus tokenized |
| IconButton circle Blue100/200 hover | No subtle blue fill tokens |
| Table blue selection fills (`Blue50` active/pinned) | No selection-surface token yet |
| Kept-group yellow (`Yellow100`) | Status fill has no semantic token |
| `Css.underlay` (0.6 alpha) | Distinct from `Tokens.Scrim` (0.2) |
| ScrollShadows `bgColor` | Requires literal `rgba(...)` for gradient hack |
| TextFieldBase presentation / borderless palettes | Status and table-blend fills |
| Switch selected hover `Blue900`, radio/checkbox Blue900 hover | No hover-dark primary token |
| Tabs / SelectCard `Blue50` selected fills | No selected-surface blue token |
| Spacing / radii / typography / shadow stacks | Still Truss-config; reserved JSON namespaces |

## Contrast verification

Apps stay light-only (no `prefers-color-scheme` follow). Use `ContrastScope` or Storybook’s **Color scheme → Dark** toolbar to force `[data-theme="contrast"]` on `:root` for verification.
