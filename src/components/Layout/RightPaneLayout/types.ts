import { ReactNode } from "react";

/**
 * Desktop right-pane layout strategy. Default varies by layout (`overlay` for GridTable, `auto` for forms).
 * On `sm`, all layouts use {@link DocumentScrollRightPane} `mobile` instead — not a mode here.
 * See `docs/layouts.md` and `ResolvedDocumentScrollRightPaneBehavior` for resolved outcomes.
 *
 * - `overlay` — fixed pane over full-width main (tables).
 * - `push` — main column shrinks beside the pane.
 * - `auto` — pick `clear` or `push` from shell / pane math; when tight → narrow push (forms).
 */
export type DocumentScrollRightPaneMode = "auto" | "overlay" | "push";

/** Desktop strategies for {@link DocumentScrollInlineRightPaneLayout} only. */
export type DocumentScrollInlineRightPaneMode = "auto" | "push";

/** Default document-scroll detail pane width (px). */
export const defaultDocumentScrollRightPaneWidth = 450;

/**
 * Opt into `DocumentScrollRightPaneLayout`.
 * `true` / a px width use the caller's default mode; an object sets width and/or mode.
 */
export type WithRightPane =
  | boolean
  | number
  | {
      width?: number;
      mode?: DocumentScrollRightPaneMode;
    };

/** Body passed to `openRightPane`. */
export type OpenRightPaneOpts = {
  content: ReactNode;
};
