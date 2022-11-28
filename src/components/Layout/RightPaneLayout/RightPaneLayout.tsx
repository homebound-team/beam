import { AnimatePresence, motion } from "framer-motion";
import React, { ReactElement, ReactNode, useContext, useMemo, useState } from "react";
import { Css, px } from "../../../Css";

export type RightPaneLayoutContextProps = {
  openInPane: (pane: { content: ReactNode }) => void;
  closePane: () => void;
};

export const RightPaneContext = React.createContext<RightPaneLayoutContextProps>({
  openInPane: () => {},
  closePane: () => {},
});

export function RightPaneLayout({ children }: { children: ReactElement }) {
  const [rightPaneContent, setRightPaneContent] = useState<ReactNode>(undefined);

  const context = useMemo(() => {
    return {
      openInPane: (pane: { content: ReactNode }) => setRightPaneContent(pane.content),
      closePane: () => setRightPaneContent(undefined),
    };
  }, [setRightPaneContent]);

  return (
    <RightPaneContext.Provider value={context}>
      <div css={Css.h100.df.$}>
        <>
          <motion.div
            layout
            key="rightPaneLayoutPageContent"
            css={Css.bgWhite.h100.w100.df.fdc.relative.if(!rightPaneContent).mr3.$}
          >
            {children}
          </motion.div>
          <AnimatePresence>
            {rightPaneContent && (
              <motion.div
                layout
                key="superDrawerContainer"
                css={
                  Css.h100 // .bgWhite
                    .maxw(px(498)).w100.df.fdc.relative.$
                }
                // Keeping initial x to 1040 as this will still work if the container is smaller
                initial={{ x: 498 }}
                animate={{ x: 0 }}
                // Custom transitions settings for the translateX animation
                transition={{ ease: "linear", duration: 0.2, delay: 0.2 }}
                exit={{ transition: { ease: "linear", duration: 0.2 }, x: 498 }}
                // Preventing clicks from triggering parent onClick
                onClick={(e) => e.stopPropagation()}
              >
                {rightPaneContent}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      </div>
    </RightPaneContext.Provider>
  );
}

export function useRightPaneContext() {
  return useContext(RightPaneContext);
}
