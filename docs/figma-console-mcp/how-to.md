# Figma Console MCP in Claude Desktop

One page. Start here; skip the rest until you need write access.

Beam file (for prompts): [Beam Design System Refresh](https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/)

---

## Setup (~3 minutes)

**What you need:** Claude Desktop + access to the Beam Figma file.

1. Open **Claude Desktop → Settings → Connectors** (or **Developer → Edit Config** on some builds).
2. **Add Custom Connector**
   - **Name:** `Figma Console`
   - **URL:** `https://figma-console-mcp.southleft.com/sse`
3. Save. Restart Claude if it doesn’t show up.
4. First time you ask about a Figma file, Claude may open a browser tab to **authorize with Figma** — click Allow.

That’s it for the brown bag. No Node, no config files, no plugin.

**What you get:** read-only tools — pull variables, component specs, screenshots, file structure. Enough for audits, handoff notes, and “what’s in this file?”

**What you don’t get (yet):** creating frames, editing variables, or token push/pull. Eng can help with the [full setup](https://github.com/southleft/figma-console-mcp#-npx-setup-recommended) if you need that later.

---

## Smoke test

Paste into a new Claude chat:

```
Get design variables from https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/
Summarize the color collections and modes in plain language.
```

If you see variable names back, you’re connected.

---

## Five prompts for Beam

**1 — Token inventory**

```
List semantic color variables in the Beam Design System Refresh file.
Group by collection/mode. Flag anything that looks like a primitive ramp vs a role token (Surface, Primary, FieldBorder*, etc.).
```

**2 — Component spec (handoff)**

```
Get the Button component from the Beam file with a visual reference.
List variants, properties, spacing, and any bound variables. Format as a short handoff note for engineering.
```

**3 — Quick audit**

```
Get the design system kit for the Beam file — components, variables, and styles.
What looks incomplete or inconsistent for a design system library?
```

**4 — Accessibility**

```
Take a screenshot of [paste frame URL or describe the page] and run accessibility design checks.
Summarize contrast and legibility issues using our token names where possible.
```

**5 — Compare two components**

```
Compare Chip and CountBadge in the Beam file: variants, sizes, and token usage.
Where could we consolidate instead of maintaining two patterns?
```

---

## Optional: full setup (write access)

Only if you need to **create or edit** in Figma from Claude (draft variants, variable modes, etc.):

| Extra requirement | Why |
| --- | --- |
| [Node.js 18+](https://nodejs.org) | Runs the local MCP server |
| Figma Desktop | Required for the Bridge plugin |
| Personal access token (`figd_…`) | [Create in Figma settings](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens) |

Edit Claude’s MCP config (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "figma-console": {
      "command": "npx",
      "args": ["-y", "figma-console-mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN_HERE",
        "ENABLE_MCP_APPS": "true"
      }
    }
  }
}
```

Then in Figma Desktop: **Plugins → Development → Import plugin from manifest…** → `~/.figma-console-mcp/plugin/manifest.json` → run **Desktop Bridge**.

Ask eng before exporting tokens into the Beam repo — `tokens/tokens.json` has validation rules.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Connector missing after add | Restart Claude Desktop |
| Auth popup doesn’t appear | Settings → Connectors → reconnect Figma Console |
| “Can’t create / edit” | Expected on read-only setup — see optional full setup |
| Wrong file | Paste the full Figma URL in the prompt |

---

## Not the same as Figma’s official MCP

**Figma Console MCP** (this guide) = design-system extraction, variables, audits.

**Official Figma MCP** = design-to-code in dev tools like Cursor. Different tool; both can coexist.
