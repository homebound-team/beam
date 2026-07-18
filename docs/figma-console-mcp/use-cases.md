# Beam use cases & prompt cookbook

Copy-paste prompts for the brown bag demos. Swap in the live Beam Figma URL if needed:

`https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/` (Beam Design System Refresh)

Open this repo in Cursor when a prompt mentions `tokens/` or `src/`.

---

## 1. Design-system kit dump (orientation)

**When:** Onboarding, auditing a library page, or briefing an agent before a bigger task.

```
Using Figma Console MCP, get the design system kit for the Beam Design System Refresh file.
Summarize: variable collections/modes, top-level component sets, and text/color styles.
Call out anything that looks like semantic color vs primitive ramps.
```

**Why it matters for Beam:** Grounds the AI in *our* library before it invents Material-like APIs. Beam prefers consistency and few props over flexible kits.

---

## 2. Token export vs `tokens/tokens.json`

**When:** Design updated Figma variables; engineering needs DTCG aligned with Beam authoring rules.

```
Export variables from the open Beam Figma file as DTCG JSON.
Compare the semantic color roles to tokens/tokens.json under beam.color.semantic.
List: (1) tokens in Figma missing from JSON, (2) JSON tokens missing from Figma,
(3) name mismatches. Do not write files yet — report only.
```

Follow-up after human review:

```
Propose a minimal tokens.json patch that adds only the agreed semantic roles,
using PascalCase leaf keys, primitive references where possible, and
$extensions["com.homebound.beam"].cssVar following tokens/README.md.
Dry-run first.
```

**Guardrails:** Beam’s source of truth for codegen is `tokens/tokens.json`, then `yarn generate:design-tokens` + `yarn validate:tokens`. MCP export is a bridge, not a free pass to skip validation or invent `--b-*` names.

---

## 3. Contrast / theme modes

**When:** Exploring high-contrast or future theme axes (see `docs/design-tokens/`).

```
Inspect variable modes in the Beam file related to contrast or theme.
Map them to how Beam applies [data-theme] via ContrastScope and theme-scopes.css.
Suggest which Figma modes should stay design-only vs which should sync to code.
```

---

## 4. Component spec for implementation

**When:** Handing a Figma component to eng, or checking Storybook coverage.

```
Get the Button component from the Beam Figma file with a visual reference.
List variants, properties, spacing, and bound variables.
Compare against src/components/Button.tsx and Button.stories.tsx:
what already exists, what’s only in Figma, and what would require a new prop
(flag new props as discouraged per Beam’s “few props” philosophy).
```

Swap `Button` for `SideNav`, `PageHeader`, `Banner`, `Chip`, `Modal`, etc.

---

## 5. Design–code parity scorecard

**When:** Before a release train or after a visual refresh.

```
Run a design-code parity check for SideNav: Figma component vs
src/components/SideNav/. Produce a scored report with concrete fix items
for design and for code. Prefer semantic tokens over hard-coded hex.
```

---

## 6. Scaffold a variant matrix (designer-led)

**When:** Exploring a new component set without clicking every combination by hand.

```
In a scratch page of the Beam file, create a draft component set for
"FilterChip" with variants: selected true/false × size sm/md.
Use existing Beam color variables for fill/text — do not invent new hex values.
Use auto-layout. Leave it as a draft named "[MCP] FilterChip — review".
Do not publish to the team library.
```

**Review checklist:** Matches Beam density? Uses semantic roles? New API knobs justifiable, or should this be an existing `Chip` / filter pattern?

---

## 7. Arrange messy variants into a proper set

**When:** You generated or duplicated variants and need the purple component-set treatment.

```
Select my FilterChip draft variants and arrange them into a proper
component set with row/column labels for selected × size.
```

---

## 8. Accessibility pass before handoff

**When:** Visual QA on a new pattern or marketing-adjacent frame in the DS file.

```
Run accessibility design checks on the selected frame (or Page Header examples).
Prioritize contrast, touch target size, and text truncation risks.
Relate findings to Beam tokens (e.g. OnSurface vs OnSurfaceMuted) where possible.
```

---

## 9. Layout shell audit

**When:** Product mocks reinvent navbar / side nav / page header structure.

```
Look at the selected product mock. Compare its page chrome to Beam layouts:
EnvironmentBannerLayout → NavbarLayout → SideNavLayout → PageHeaderLayout
(see docs/layouts.md). List where the mock should reuse Beam layout components
instead of custom frames, and suggest Figma structure that mirrors that nesting.
```

---

## 10. Version history / changelog for a library page

**When:** Writing release notes after a DS refresh.

```
List recent versions of the Beam Design System file and summarize visual/API
changes relevant to Button and form fields. Draft a short designer-facing changelog.
```

---

## 11. FigJam workshop board

**When:** Crit, prioritization, or token naming workshop.

```
Create a FigJam board for a Beam token naming workshop with columns:
Proposed name | Figma variable | CSS --b-* | Ships in code? | Notes.
Add three example stickies using FieldBorderDefault as a filled-in sample.
```

---

## 12. Documentation generation

**When:** Filling gaps between Figma descriptions and Storybook.

```
Generate markdown documentation for Banner by merging Figma component data
with src/components/Banner.tsx. Include when to use / when not to use,
variants, and token dependencies. Keep the tone consistent with Beam docs.
```

---

## Prompt patterns that work

| Do | Don’t |
| --- | --- |
| Paste the Figma file URL or say “current open file” | Assume the agent knows which file is focused |
| Name the Beam component and repo path | Say “make a Material button” |
| “Use existing variables; don’t invent hex” | “Make it look modern” with no constraints |
| “Draft only / don’t publish to library” | Silent writes to shared library pages |
| “Report first, then apply” for token sync | Blind import into `tokens.json` |
| “Few props — prefer global change or existing variant” | Ask for five new stylistic props by default |

### Starter template

```
Context: Beam design system (Homebound). Figma: [URL]. Repo open in Cursor.
Task: [one outcome].
Constraints: reuse existing components/tokens; no new hex; no library publish;
follow tokens/README.md and Beam’s few-props philosophy.
Output: [summary | Figma draft | suggested tokens.json diff | parity report].
```

---

## Hands-on exercise (10 minutes)

Pairs or solo:

1. Confirm `Check Figma status` is green with Desktop Bridge.
2. Pick **one** component you own (or Button if unsure).
3. Run use case **4** or **5** and save the agent’s report.
4. Share with the group: one surprise (design-only, code-only, or token drift).

Stretch: run use case **2** on a single semantic color and discuss whether Figma or `tokens.json` should win.
