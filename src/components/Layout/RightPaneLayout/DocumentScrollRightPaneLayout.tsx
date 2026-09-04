import { ReactNode, useContext, useRef } from "react";
import { DocumentScrollInlineRightPaneLayout } from "./DocumentScrollInlineRightPaneLayout";
import { DocumentScrollOverlayRightPaneLayout } from "./DocumentScrollOverlayRightPaneLayout";
import { NestedRightPaneLayoutContext } from "./documentScrollRightPaneLayoutShared";
import { toInlineRightPaneMode } from "./documentScrollRightPaneMode";
import { DocumentScrollRightPaneMode } from "./types";

export type DocumentScrollRightPaneLayoutProps = {
  children: ReactNode;
  /** Width (px) of the detail pane opened via `useRightPane`. */
  paneWidth?: number;
  /**
   * Desktop layout strategy. Default `overlay` (tables). `auto` needs `shellMaxPx` for centered bodies — see `docs/layouts.md`.
   */
  mode?: DocumentScrollRightPaneMode;
  /** Centered shell max-width (px) for `auto` collision math. */
  shellMaxPx?: number;
  /** Left rail width (px) reserved beside the centered shell (e.g. JumpLinks). */
  jumpLinksWidthPx?: number;
};

/** Routes to overlay or inline layout (each handles `sm` internally). Prefer the specific layout when composing. */
export function DocumentScrollRightPaneLayout(props: DocumentScrollRightPaneLayoutProps) {
  const nestedInLayout = useContext(NestedRightPaneLayoutContext);
  const nestedWarnedRef = useRef(false);
  const { mode = "overlay" } = props;

  if (nestedInLayout && process.env.NODE_ENV !== "production" && !nestedWarnedRef.current) {
    nestedWarnedRef.current = true;
    console.warn(
      "DocumentScrollRightPaneLayout is nested inside another document-scroll right-pane layout. Use a single layout (compose at the body; do not set withRightPane on both a parent and a nested FormSectionLayout / CenteredLayout / GridTableLayout).",
    );
  }

  if (nestedInLayout) return <>{props.children}</>;

  if (mode === "overlay") {
    return (
      <DocumentScrollOverlayRightPaneLayout paneWidth={props.paneWidth}>
        {props.children}
      </DocumentScrollOverlayRightPaneLayout>
    );
  }

  return (
    <DocumentScrollInlineRightPaneLayout
      paneWidth={props.paneWidth}
      mode={toInlineRightPaneMode(mode)}
      shellMaxPx={props.shellMaxPx}
      jumpLinksWidthPx={props.jumpLinksWidthPx}
    >
      {props.children}
    </DocumentScrollInlineRightPaneLayout>
  );
}

export { DocumentScrollInlineRightPaneLayout } from "./DocumentScrollInlineRightPaneLayout";
export type { DocumentScrollInlineRightPaneLayoutProps } from "./DocumentScrollInlineRightPaneLayout";
export { DocumentScrollOverlayRightPaneLayout } from "./DocumentScrollOverlayRightPaneLayout";
export type { DocumentScrollOverlayRightPaneLayoutProps } from "./DocumentScrollOverlayRightPaneLayout";
