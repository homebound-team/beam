import { createContext, CSSProperties, memo, ReactNode, useCallback, useRef } from "react";
import { Css } from "src/Css";
import { beamRightPaneWidthVar } from "src/layouts/layoutVars";
import { useRightPaneOpenActions } from "./RightPaneContext";

/** True when a document-scroll right-pane layout is already mounted above. */
export const NestedRightPaneLayoutContext = createContext(false);

/** Closes the pane when the layout root unmounts. */
export function useDocumentScrollRightPaneAnchorRef() {
  const { closePane } = useRightPaneOpenActions();
  const ref = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node && ref.current) {
        closePane();
      }
      ref.current = node;
    },
    [closePane],
  );

  return { ref, setRef };
}

/** Stable layout root: nested guard, anchor ref, test id, pane width var. */
export function DocumentScrollRightPaneLayoutRoot({
  anchorRef,
  tid,
  children,
}: {
  anchorRef: ReturnType<typeof useDocumentScrollRightPaneAnchorRef>;
  tid: object;
  children: ReactNode;
}) {
  return (
    <NestedRightPaneLayoutContext.Provider value={true}>
      <div ref={anchorRef.setRef} css={Css.w100.$} style={{ [beamRightPaneWidthVar]: "0px" } as CSSProperties} {...tid}>
        {children}
      </div>
    </NestedRightPaneLayoutContext.Provider>
  );
}

/** Skip re-rendering main content when only open/close chrome changes. */
export const DocumentScrollRightPaneMainChildren = memo(function DocumentScrollRightPaneMainChildren({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
});
