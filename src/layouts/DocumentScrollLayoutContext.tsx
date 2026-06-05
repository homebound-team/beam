import { createContext, ReactNode, useContext } from "react";

const DocumentScrollLayoutContext = createContext(false);

/**
 * Marks the subtree as a document-scroll Beam layout (`NavbarLayout` / `SideNavLayout` / `PageHeaderLayout`),
 * whose chrome coordinates through the document scrollbars. Components with their own scroll container
 * (notably a virtualized `GridTable`) read {@link useDocumentScrollLayout} to delegate scrolling to the
 * window. The value is a constant `true`, so nesting the layouts is a no-op.
 */
export function DocumentScrollLayoutProvider({ children }: { children: ReactNode }) {
  return <DocumentScrollLayoutContext.Provider value={true}>{children}</DocumentScrollLayoutContext.Provider>;
}

/** True when rendered inside a document-scroll Beam layout. Defaults to `false` outside one. */
export function useDocumentScrollLayout(): boolean {
  return useContext(DocumentScrollLayoutContext);
}
