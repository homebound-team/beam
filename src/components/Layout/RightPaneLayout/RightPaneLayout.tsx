import { AnimatePresence, motion } from "framer-motion";
import React, { ReactElement } from "react";
import { Css, Palette, px } from "../../../Css";
import { useRightPaneContext } from "./RightPaneContext";

export function RightPaneLayout({ children, paneBgColor }: { children: ReactElement; paneBgColor?: Palette }) {
  const { isRightPaneOpen, rightPaneContent } = useRightPaneContext();

  // Todo pass as prop?
  const paneWidth = 450;

  return (
    <div css={Css.h100.df.$}>
      <>
        <motion.div
          layout="position"
          key="rightPaneLayoutPageContent"
          css={Css.h100.if(!!isRightPaneOpen).overflowX("scroll").mr3.if(!isRightPaneOpen).overflowX("unset").$}
          initial={"closed"}
          animate={!isRightPaneOpen ? "closed" : "open"}
          variants={{
            open: { width: `calc(100% - ${paneWidth + 24}px)` },
            closed: { width: "100%" },
          }}
          transition={{ ease: "linear", duration: 0.2 }}
        >
          {children}
        </motion.div>
        <AnimatePresence>
          {isRightPaneOpen && (
            <motion.div
              layout="position"
              key="rightPane"
              data-testid="rightPaneContent"
              css={Css.bgColor(paneBgColor).h100.maxw(px(paneWidth)).w100.df.fdc.relative.$}
              // Keeping initial x to offset pane width and space between panel and page content
              initial={{ x: paneWidth + 24 }}
              animate={{ x: 0 }}
              // Custom transitions settings for the translateX animation
              transition={{ ease: "linear", duration: 0.2 }}
              exit={{ transition: { ease: "linear", duration: 0.2 }, x: paneWidth }}
              // Preventing clicks from triggering parent onClick
              onClick={(e) => e.stopPropagation()}
            >
              {rightPaneContent}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </div>
  );
}
