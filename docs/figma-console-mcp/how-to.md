# Claude Desktop + Figma Console MCP

Use the **live docs** for install and workflows. This page only adds Beam context and a few starter prompts.

## Docs to follow (in order)

1. **[Introduction](https://docs.figma-console-mcp.southleft.com/introduction)** — what it is, which setup path to pick  
2. **[Setup](https://docs.figma-console-mcp.southleft.com/setup)** — Claude Desktop steps  
3. **[Mode comparison](https://docs.figma-console-mcp.southleft.com/mode-comparison)** — Remote (read) vs NPX / Cloud (write in Figma)  
4. **[Use cases](https://docs.figma-console-mcp.southleft.com/use-cases)** — demos and day-to-day patterns  
5. Stuck? **[Troubleshooting](https://docs.figma-console-mcp.southleft.com/troubleshooting)**

Also useful later:

- [FigJam guide](https://docs.figma-console-mcp.southleft.com/figjam)
- [Slides guide](https://docs.figma-console-mcp.southleft.com/slides)
- [Tools reference](https://docs.figma-console-mcp.southleft.com/tools)
- [Figma MCP vs Console MCP](https://docs.figma-console-mcp.southleft.com/figma-mcp-vs-figma-console-mcp)

---

## For this brown bag

**App:** [Claude Desktop](https://claude.com/download)

**Beam file to paste into prompts:**  
https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/

**Recommended path today**

| If you want… | Follow in the docs |
| --- | --- |
| Fastest first connection (read Figma) | [Setup → Remote](https://docs.figma-console-mcp.southleft.com/setup) — Claude Desktop → Settings → Connectors → `https://figma-console-mcp.southleft.com/sse` |
| Create / edit in Figma from Claude | [Setup → NPX](https://docs.figma-console-mcp.southleft.com/setup) (or Cloud Mode if using Claude.ai) + Desktop Bridge plugin |

Remote is fine for a taste. For “get more done *in* Figma,” plan on NPX or Cloud + Desktop Bridge from the setup guide.

---

## Starter prompts (Figma work)

Paste the Beam URL when needed. Prefer ideas from the [live use cases](https://docs.figma-console-mcp.southleft.com/use-cases) over inventing new ones.

**Explore the library**

```
Get the design system kit for https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/
Summarize collections, main component sets, and styles.
```

**Component deep-dive**

```
Get the Button component from the Beam file with a visual reference.
List variants, properties, and bound variables as a designer checklist.
```

**Draft in Figma** *(needs write setup)*

```
On a scratch page, create a draft component set for FilterChip
(selected × size). Use existing Beam variables — don’t invent new colors.
Name it "[MCP] FilterChip — review" and don’t publish to the library.
```

**FigJam** *(needs write setup)* — see also [FigJam guide](https://docs.figma-console-mcp.southleft.com/figjam)

```
Create a FigJam board for a Beam crit with columns:
Shipped well | Needs polish | Open questions
```

**Accessibility pass** — see [use cases](https://docs.figma-console-mcp.southleft.com/use-cases)

```
Run accessibility design checks on the selected frame.
Summarize contrast and target-size issues in plain language.
```

---

## Norms for Beam

- Draft on a scratch page; don’t publish AI output to the team library until a human reviews.
- Prefer existing Beam variables and components over new one-offs.
- Treat Claude’s Figma edits like a junior designer’s first pass.
