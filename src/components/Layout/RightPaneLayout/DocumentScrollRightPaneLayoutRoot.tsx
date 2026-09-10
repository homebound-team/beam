import { createContext, type CSSProperties, type ReactNode } from "react";
import { Css } from "src/Css";
import { beamRightPaneWidthVar } from "src/layouts/layoutVars";
import type { useDocumentScrollRightPaneAnchorRef } from "./useDocumentScrollRightPaneAnchorRef";

/** True when a document-scroll right-pane layout is already mounted above. */
export const NestedRightPaneLayoutContext = createContext(false);

export type DocumentScrollRightPaneLayoutRootProps = {
  anchorRef: ReturnType<typeof useDocumentScrollRightPaneAnchorRef>;
  tid: object;
  children: ReactNode;
  /** Tables grow the document with wide content; forms stay leftover-sized. */
  expandToMinContent?: boolean;
};

/** Nested guard, anchor ref, test id, and pane width var for document-scroll right-pane hosts. */
export function DocumentScrollRightPaneLayoutRoot(props: DocumentScrollRightPaneLayoutRootProps) {
  const { anchorRef, tid, children, expandToMinContent = false } = props;
  return (
    <NestedRightPaneLayoutContext.Provider value={true}>
      <div
        ref={anchorRef.setRef}
        css={expandToMinContent ? Css.wfc.mw100.$ : Css.w100.$}
        style={{ [beamRightPaneWidthVar]: "0px" } as CSSProperties}
        {...tid}
      >
        {children}
      </div>
    </NestedRightPaneLayoutContext.Provider>
  );
}
