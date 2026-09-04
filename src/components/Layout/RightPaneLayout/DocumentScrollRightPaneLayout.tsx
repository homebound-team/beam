import { ReactNode, useContext, useRef } from "react";
import { DocumentScrollOverlayRightPaneLayout } from "./DocumentScrollOverlayRightPaneLayout";
import { NestedRightPaneLayoutContext } from "./documentScrollRightPaneLayoutShared";

export type DocumentScrollRightPaneLayoutProps = {
  children: ReactNode;
  /** Width (px) of the detail pane opened via `useRightPane`. */
  paneWidth?: number;
};

/** Document-scroll overlay right pane host. Prefer {@link DocumentScrollOverlayRightPaneLayout} when composing. */
export function DocumentScrollRightPaneLayout(props: DocumentScrollRightPaneLayoutProps) {
  const nestedInLayout = useContext(NestedRightPaneLayoutContext);
  const nestedWarnedRef = useRef(false);

  if (nestedInLayout && process.env.NODE_ENV !== "production" && !nestedWarnedRef.current) {
    nestedWarnedRef.current = true;
    console.warn(
      "DocumentScrollRightPaneLayout is nested inside another document-scroll right-pane layout. Use a single layout (compose at the body; do not set withRightPane on both a parent and a nested layout).",
    );
  }

  if (nestedInLayout) return <>{props.children}</>;

  return (
    <DocumentScrollOverlayRightPaneLayout paneWidth={props.paneWidth}>
      {props.children}
    </DocumentScrollOverlayRightPaneLayout>
  );
}

export { DocumentScrollOverlayRightPaneLayout } from "./DocumentScrollOverlayRightPaneLayout";
export type { DocumentScrollOverlayRightPaneLayoutProps } from "./DocumentScrollOverlayRightPaneLayout";
