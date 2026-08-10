import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { usePreventScroll } from "react-aria";
import { createPortal } from "react-dom";
import { Css, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useEnvironmentBannerLayoutHeight } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import {
  documentScrollRightPaneHeight,
  documentScrollRightPaneWidth,
  stickyTableHeaderOffset,
} from "src/layouts/layoutVars";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { useRightPaneContext } from "./RightPaneContext";

/** Fixed detail pane pinned below sticky chrome (desktop) or full-bleed below the env banner (`sm`). */
export function DocumentScrollRightPane({ paneWidth }: { paneWidth: number }) {
  const { isRightPaneOpen, rightPaneContent, clearPane, closePane } = useRightPaneContext();
  const tid = useTestIds({}, "rightPaneContent");
  const { sm } = useBreakpoint();
  // Portal renders on `document.body`; read banner height from context (CSS vars are not inherited there).
  const bannerHeightPx = useEnvironmentBannerLayoutHeight();
  const isMobileOverlay = sm && isRightPaneOpen;

  usePreventScroll({ isDisabled: !isMobileOverlay });

  // Close pane on unmount so the next page does not show stale content.
  useEffect(() => closePane, [closePane]);

  const slideX = sm ? "100%" : paneWidth;

  const pane = (
    <AnimatePresence>
      {isRightPaneOpen && (
        <motion.div
          key="documentScrollRightPane"
          {...tid}
          css={
            sm
              ? Css.fixed.right0.bottom0.left0.oya.bgColor(Tokens.Surface).z(zIndices.rightPaneMobile).$
              : Css.fixed.transitionTop
                  .top(stickyTableHeaderOffset())
                  .right(0)
                  .h(documentScrollRightPaneHeight())
                  .w(documentScrollRightPaneWidth(paneWidth))
                  .oya.bgColor(Tokens.Surface)
                  .z(zIndices.rightPane)
                  .bl.bc(Tokens.SurfaceSeparator).$
          }
          style={sm ? { top: bannerHeightPx } : undefined}
          initial={{ x: slideX }}
          animate={{ x: 0 }}
          exit={{ x: slideX }}
          transition={{ ease: "linear", duration: 0.2 }}
          onAnimationComplete={(definition: { x: number | string }) => definition.x !== 0 && clearPane()}
        >
          {rightPaneContent}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // On `sm`, portal so the overlay escapes page stacking contexts (same as NavbarMobileMenu).
  return sm ? createPortal(pane, document.body) : pane;
}
