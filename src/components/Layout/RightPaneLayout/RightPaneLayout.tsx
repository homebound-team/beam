import { AnimatePresence, motion } from "framer-motion";
import { ReactElement, useEffect } from "react";
import { Css, Palette } from "../../../Css";
import { useRightPaneContext } from "./RightPaneContext";

export function RightPaneLayout({
  children,
  paneBgColor = Palette.White,
  paneWidth = 450,
  rightColumnContent,
}: {
  children: ReactElement;
  paneBgColor?: Palette;
  paneWidth?: number;
  rightColumnContent?: ReactElement;
}) {
  const { isRightPaneOpen, rightPaneContent, clearPane, closePane } = useRightPaneContext();

  // Close pane on page unmount because otherwise the next page that has a right pane will show our stale content
  useEffect(() => {
    return () => {
      closePane();
    };
  }, []);

  return (
    <div css={Css.h100.df.overflowXHidden.$}>
      <>
        <div
          css={{
            ...Css.w(`calc(100% - ${paneWidth + 24}px)`).add("transition", "width .2s linear").h100.mr3.overflowXAuto.$,
            ...Css.if(!isRightPaneOpen).w100.mr0.$,
            ...Css.if(!!rightColumnContent).w(`calc(100% - ${paneWidth + 24}px)`).mr3.$,
          }}
        >
          {children}
        </div>

        <div css={Css.if(!!rightColumnContent).wPx(paneWidth).position("relative").$}>
          {rightColumnContent && (
            <div
              css={
                Css.h100
                  .wPx(paneWidth)
                  .left(0)
                  .position("absolute")
                  .add("transition", "all .3s ease-in-out")
                  .if(isRightPaneOpen)
                  .add("opacity", 0)
                  .left(100).$
              }
            >
              {rightColumnContent}
            </div>
          )}

          <AnimatePresence>
            {isRightPaneOpen && (
              <motion.div
                layout="position"
                key="rightPane"
                data-testid="rightPaneContent"
                css={Css.bgColor(paneBgColor).h100.wPx(paneWidth).$}
                // Keeping initial x to offset pane width and space between panel and page content
                initial={{ x: paneWidth + 24, position: "absolute" }}
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
        </div>
      </>
    </div>
  );
}
