import { createContext, useContext, type ReactNode } from "react";

const ContentInsetContext = createContext(false);

export type ContentInsetProviderProps = {
  children: ReactNode;
};

/** Marks descendants as already inset from the viewport edge (e.g. {@link CenteredLayout}). */
export function ContentInsetProvider({ children }: ContentInsetProviderProps) {
  return <ContentInsetContext.Provider value={true}>{children}</ContentInsetContext.Provider>;
}

/** True when an ancestor already applies the page content inset. */
export function useContentInsetHandled(): boolean {
  return useContext(ContentInsetContext);
}
