# How to install & use Figma Console MCP (for Beam designers)

This is the handout companion to the brown bag. Prefer the **NPX + Cursor** path below — it unlocks full write tools and pairs well with the Beam repo open in the same workspace.

> **Not the same as Figma’s official MCP.** Official Figma MCP (`/add-plugin figma` in Cursor) is excellent for design-to-code and Code Connect. **Figma Console MCP** (Southleft) is a separate open-source server focused on design-system extraction, token sync, variable management, component creation, a11y scanning, and design–code parity. Many teams run both.

---

## What you need

| Prerequisite | Why |
| --- | --- |
| [Node.js 18+](https://nodejs.org) | Runs the MCP server via `npx` |
| [Figma Desktop](https://www.figma.com/downloads/) | Desktop Bridge plugin (web-only Figma is not enough for write tools) |
| [Cursor](https://cursor.com) (or another MCP client) | Chat UI that calls the tools |
| Figma personal access token (`figd_…`) | Auth for file / variable APIs |

Check Node: `node --version` in Terminal.

---

## Path A — Full power (recommended)

~10 minutes. **106 tools**, including create/edit, variables, token sync, FigJam, Slides.

### 1. Create a Figma personal access token

1. Follow Figma Help: [Manage personal access tokens](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens).
2. Description: `Figma Console MCP`.
3. Suggested scopes: **File content** (Read), **File versions** (Read), **Variables** (Read), **Comments** (Read and write).
4. Copy the token once — it won’t be shown again.

Treat the token like a password. Don’t paste it into Slack, Storybook, or git.

### 2. Add the server in Cursor

1. Open **Cursor Settings → Tools & MCP**.
2. **Add Custom MCP** (or edit `~/.cursor/mcp.json` on macOS / `%USERPROFILE%\.cursor\mcp.json` on Windows).
3. Use:

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

4. Replace `figd_YOUR_TOKEN_HERE` with your real token.
5. Save. Restart Cursor if the server doesn’t show as connected.

### 3. Install & run the Desktop Bridge plugin

The MCP server auto-creates the plugin at a stable path the first time it starts.

1. Open **Figma Desktop** and a Beam file (e.g. Beam Design System Refresh).
2. **Plugins → Development → Import plugin from manifest…**
3. Choose: `~/.figma-console-mcp/plugin/manifest.json`  
   - macOS: `/Users/YourName/.figma-console-mcp/plugin/manifest.json`  
   - Windows: `C:\Users\YourName\.figma-console-mcp\plugin\manifest.json`
4. Run **Figma Desktop Bridge** in that file.
5. Leave the plugin running while you work with the AI client.

The plugin scans ports **9223–9232** and connects to the local MCP server over WebSocket.

**Plugin updates:** After some MCP releases, re-import the same manifest so Figma picks up a new `code.js`. Check release notes when tools suddenly fail after an upgrade.

### 4. Smoke tests

In Cursor Agent chat, try:

```
Check Figma status
```

Expect: connected, WebSocket / Desktop Bridge active, file context visible.

```
Create a simple frame named "MCP smoke test" with a teal background
```

Expect: a new frame appears in the open Figma file (write path works).

```
Get design variables from the current Figma file
```

Expect: collections / variables listed (read path works).

---

## Path B — Read-only (quick taste)

~2 minutes. **9 tools**. Good for a first peek; **cannot** create or edit designs.

Cursor `mcp.json`:

```json
{
  "mcpServers": {
    "figma-console": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://figma-console-mcp.southleft.com/sse"]
    }
  }
}
```

Upgrade to Path A when you want write + token sync.

---

## Path C — Cloud Mode (web AI clients)

For Claude.ai / similar **without** Node on your machine: use `https://figma-console-mcp.southleft.com/mcp` with your PAT, run Desktop Bridge, then ask the AI to **pair** with a short code from the plugin. Details: [upstream quick start](https://github.com/southleft/figma-console-mcp#️-cloud-mode-web-ai-clients).

For Beam work we still recommend Path A inside Cursor with this repo open.

---

## Daily workflow checklist

1. Open the target Figma file in **Desktop**.
2. Run **Desktop Bridge**.
3. Open Cursor on the Beam (or product) repo when you care about code parity.
4. Ask for status before a long task.
5. Prefer **dry-run** when importing tokens back into Figma.
6. Name the file URL, component, and “don’t invent new tokens / props” constraints in the prompt.

---

## Troubleshooting

| Symptom | Try |
| --- | --- |
| MCP red / not connected | Restart Cursor; confirm JSON is valid; `node --version` ≥ 18 |
| Status says no bridge | Open Figma Desktop, run Desktop Bridge in the **same** file |
| Writes don’t appear | Confirm Path A (not read-only SSE); plugin still running |
| Token / variable tools empty | PAT scopes; file permissions; correct file focused |
| Plugin behaves oddly after upgrade | Re-import `~/.figma-console-mcp/plugin/manifest.json` |
| First call is slow | Normal — `npx` may download `@latest` once |

Diagnostic prompts:

```
Diagnose my Figma Console MCP setup
```

```
Reconnect to the Desktop Bridge plugin
```

---

## Security & team norms

- Prefer personal PATs with least privilege; rotate if leaked.
- Don’t commit `mcp.json` with real tokens into Beam.
- Treat AI-created components as **drafts** until a designer reviews against Beam conventions (few props, semantic tokens, existing variants).
- Token export into this repo must still pass `yarn validate:tokens` and follow [`tokens/README.md`](../../tokens/README.md).
