# Figma Console MCP — Designer brown bag

Materials for a ~45–60 minute lunch-and-learn on installing, using, and getting value from [Figma Console MCP](https://github.com/southleft/figma-console-mcp) with Beam.

| Artifact | Purpose |
| --- | --- |
| [`slides.html`](./slides.html) | Presenter deck — open in a browser, use ←/→ or space |
| [`how-to.md`](./how-to.md) | Step-by-step install + smoke tests (handout) |
| [`use-cases.md`](./use-cases.md) | Beam-flavored prompts and workflows |

**Official product docs:** [docs.figma-console-mcp.southleft.com](https://docs.figma-console-mcp.southleft.com/)

## Suggested agenda (50 min)

| Time | Segment | Deck slides |
| --- | --- | --- |
| 0–5 | Why this matters for Beam | 1–4 |
| 5–15 | Install walkthrough (live) | 5–10 |
| 15–35 | Use cases + demos | 11–18 |
| 35–45 | Hands-on exercise | 19 |
| 45–50 | Tips, gotchas, Q&A | 20–22 |

## Facilitator prep

1. Confirm **Node.js 18+**, **Figma Desktop**, and **Cursor** on the demo machine.
2. Have a Figma PAT ready (or create one live — scopes in [`how-to.md`](./how-to.md)).
3. Open the [Beam Design System Refresh](https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/) file and run the **Desktop Bridge** plugin before the meeting.
4. Clone or open this repo in Cursor so design–code parity demos can see `tokens/` and `src/`.
5. Pre-run `Check Figma status` once so first-time `npx` download isn’t mid-demo.

## Audience outcomes

After the session, designers should be able to:

- Install Figma Console MCP in Cursor and connect the Desktop Bridge
- Choose read-only vs full write setup
- Run Beam-relevant workflows: token export, component specs, variant scaffolding, a11y checks, design–code parity
- Write prompts that name files, components, and constraints clearly
