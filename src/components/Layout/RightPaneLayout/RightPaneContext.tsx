import React, { ReactNode, useCallback, useContext, useMemo, useState } from "react";

export interface OpenRightPaneOpts {
  content: ReactNode;
}

export type RightPaneLayoutContextProps = {
  openInPane: (opts: OpenRightPaneOpts) => void;
  closePane: () => void;
  clearPane: () => void;
  isRightPaneOpen: Boolean;
  rightPaneContent: ReactNode;
};

export const RightPaneContext = React.createContext<RightPaneLayoutContextProps>({
  openInPane: () => {},
  closePane: () => {},
  clearPane: () => {},
  isRightPaneOpen: false,
  rightPaneContent: null,
});

export function RightPaneProvider({ children }: { children: ReactNode }) {
  // Note: separating the pane content from isOpen state to prevent animating when updating content.
  const [rightPaneContent, setRightPaneContent] = useState<ReactNode>(undefined);
  const [isRightPaneOpen, setIsRightPaneOpen] = useState<Boolean>(false);

  const openInPane = useCallback(
    (opts: OpenRightPaneOpts) => {
      setRightPaneContent(opts?.content);
      setIsRightPaneOpen(true);
    },
    [setRightPaneContent],
  );
  const closePane = useCallback(() => setIsRightPaneOpen(false), [setRightPaneContent]);
  const clearPane = useCallback(() => setRightPaneContent(undefined), [setRightPaneContent]);

  const context = useMemo(
    () => ({ openInPane, closePane, clearPane, rightPaneContent, isRightPaneOpen }),
    [openInPane, closePane, rightPaneContent, clearPane, isRightPaneOpen],
  );

  return <RightPaneContext.Provider value={context}>{children}</RightPaneContext.Provider>;
}

export function useRightPaneContext() {
  return useContext(RightPaneContext);
}
