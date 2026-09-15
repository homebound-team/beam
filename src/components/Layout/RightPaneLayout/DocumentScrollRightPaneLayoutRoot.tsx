import { createContext, type CSSProperties, type ReactNode } from "react";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { beamRightPaneContentMinVar, beamRightPaneWidthVar } from "src/layouts/layoutVars";
import type { useDocumentScrollRightPaneAnchorRef } from "./useDocumentScrollRightPaneAnchorRef";

/** True when a document-scroll right-pane layout is already mounted above. */
export const NestedRightPaneLayoutContext = createContext(false);

export type DocumentScrollRightPaneLayoutRootProps = {
  anchorRef: ReturnType<typeof useDocumentScrollRightPaneAnchorRef>;
  tid: object;
  children: ReactNode;
};

/** Nested guard, anchor ref, test id, and pane width vars for document-scroll right-pane hosts. */
export function DocumentScrollRightPaneLayoutRoot(props: DocumentScrollRightPaneLayoutRootProps) {
  const { anchorRef, tid, children } = props;
  const { sm } = useBreakpoint();
  return (
    <NestedRightPaneLayoutContext.Provider value={true}>
      <div
        ref={anchorRef.setRef}
        // `md+` grows the document to fit content + the pane spacer; `sm` stays 100% wide.
        css={sm ? Css.w100.$ : Css.wfc.mw100.$}
        style={{ [beamRightPaneWidthVar]: "0px", [beamRightPaneContentMinVar]: "0px" } as CSSProperties}
        {...tid}
      >
        {children}
      </div>
    </NestedRightPaneLayoutContext.Provider>
  );
}
