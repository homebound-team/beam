import { AnimatePresence, motion } from "framer-motion";
import React, { ReactElement } from "react";
import { Css, Palette, px } from "../../../Css";
import { useRightPaneContext } from "./RightPaneContext";

export function RightPaneLayout({
  children,
  paneBgColor = Palette.White,
  paneWidth = 450,
}: {
  children: ReactElement;
  paneBgColor?: Palette;
  paneWidth?: number;
}) {
  const { isRightPaneOpen, rightPaneContent, clearPane } = useRightPaneContext();

  return (
    <div css={Css.h100.df.overflowXHidden.$}>
      <>
        <div
          css={
            Css.add("width", `calc(100% - ${paneWidth + 24}px)`)
              .add("transition", "width .2s linear")
              .h100.mr3.overflowXAuto.if(!isRightPaneOpen).w100.mr0.$
          }
        >
          {children}
        </div>
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
              transition={{ ease: "linear", duration: 0.2 }}
              exit={{ transition: { ease: "linear", duration: 0.2 }, x: paneWidth }}
              // Clear the content of the detail pane when the animation is completed and only when pane is closing
              onAnimationComplete={(definition: { x: number }) => definition.x !== 0 && clearPane()}
            >
              {rightPaneContent}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </div>
  );
}
