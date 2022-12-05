import React, { ReactElement, ReactNode, useContext, useMemo, useState } from "react";

interface OpenRightPaneOpts {
  content: ReactNode;
}

export type RightPaneLayoutContextProps = {
  openInPane: (opts: OpenRightPaneOpts) => void;
  closePane: () => void;
  isRightPaneOpen: Boolean;
  rightPaneContent: ReactNode;
};

export const RightPaneContext = React.createContext<RightPaneLayoutContextProps>({
  openInPane: () => {},
  closePane: () => {},
  isRightPaneOpen: false,
  rightPaneContent: null,
});

export function RightPaneProvider({ children }: { children: ReactElement }) {
  const [rightPaneContent, setRightPaneContent] = useState<ReactNode>(undefined);
  const [isRightPaneOpen, setIsRightPaneOpen] = useState<Boolean>(false);

  const context = useMemo(() => {
    return {
      openInPane: (opts: OpenRightPaneOpts) => {
        setRightPaneContent(opts?.content);
        setIsRightPaneOpen(true);
      },
      closePane: () => setIsRightPaneOpen(false),
      rightPaneContent,
      isRightPaneOpen,
    };
  }, [setRightPaneContent, rightPaneContent, isRightPaneOpen]);

  return <RightPaneContext.Provider value={context}>{children}</RightPaneContext.Provider>;
}

export function useRightPaneContext() {
  return useContext(RightPaneContext);
}
