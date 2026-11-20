# Beam MCP server

An [MCP](https://modelcontextprotocol.io) server that gives coding agents (Claude Code, Cursor, …) Beam's component docs: props with types and defaults, JSDoc, the Storybook MDX pages, deprecations, Figma links, layout guides, and color tokens.

It runs from a local Beam checkout and reads that checkout's `src`, so it describes the branch you have checked out. That can be newer than the Beam version a project has installed. Every response names the checkout's version, branch, and commit.

## Setup

Install Beam's dependencies once (`yarn install` in the checkout). Then register the server with your agent, pointing at your checkout. For Claude Code, available in every project:

```sh
claude mcp add --scope user beam -- ~/workspace/beam/node_modules/.bin/tsx ~/workspace/beam/scripts/mcp/server.ts
```

Or in a project's `.mcp.json`:

```json
{
  "mcpServers": {
    "beam": {
      "command": "/absolute/path/to/beam/node_modules/.bin/tsx",
      "args": ["/absolute/path/to/beam/scripts/mcp/server.ts"]
    }
  }
}
```

Launch it with `tsx` directly, not `yarn --cwd`. Outside the checkout, `yarn` resolves to a global Yarn 1, which rejects Beam's Node engine and prints to stdout, breaking the MCP stream.

## What agents get on connect

The server's instructions explain the tools and include the **Rules** section of the Using Beam guide (`src/intro/UsingBeam.mdx`). The server reads that section from the guide at startup, so edit the rules there.

## Tools

- `list_components`: exports of a kind (components by default), with one-line descriptions. Deprecated exports are hidden unless asked for.
- `get_component`: everything about one export: description, props, docs page, stories, Figma link, deprecation. Suggests close names on a miss.
- `search_beam`: finds exports and guides for a need, e.g. "date range" or "confirm unsaved changes".
- `get_guide`: topic guides, such as which layout to use, routing, and the layout rules in `docs/layouts.md`.
- `get_tokens`: semantic color tokens and breakpoints, with Truss usage rules.

## The manifest

The server reads `.cache/mcp-manifest.json`, generated from `src/index.ts` exports (TypeScript compiler and `react-docgen-typescript`), the MDX pages, `docs/`, and `tokens/README.md`. It rebuilds automatically, in about a second, when any of those change, so edits show up without restarting the server.

`yarn mcp:manifest` rebuilds it by hand and prints doc coverage: components missing a description, a docs page, or a Figma link.
