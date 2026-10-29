import { AnimatePresence, motion } from "framer-motion";
import { type CSSProperties, type RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";
import { usePreventScroll } from "react-aria";
import { createPortal } from "react-dom";
import { Css, Tokens } from "src/Css";
import { useEnvironmentBannerLayoutHeight } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import { documentScrollRightPaneWidthCss, stickyTableHeaderOffsetPx } from "src/layouts/layoutVars";
import { useScrollPinnedViewportBounds } from "src/layouts/useScrollPinnedViewportBounds";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";
import { useRightPaneContent, useRightPaneOpenState } from "./useRightPane";
import { rightPaneContentDataAttribute, waitForRightPaneExit } from "./waitForRightPaneExit";

export type DocumentScrollRightPaneProps = {
  paneWidth: number;
  /** When true, full-bleed portal below the env banner (`sm` takeover — not a desktop mode). */
  mobile: boolean;
  /** Desktop only: layout root for fixed pane top/height. */
  anchorRef?: RefObject<HTMLElement | null>;
};

/** `sm` full-bleed takeover, or a desktop `position: fixed` pane over the page (content scrolls underneath). */
export function DocumentScrollRightPane({ paneWidth, mobile, anchorRef }: DocumentScrollRightPaneProps) {
  const { isRightPaneOpen, clearPane } = useRightPaneOpenState();
  const rightPaneContent = useRightPaneContent();
  const tid = useTestIds({}, "rightPaneContent");
  const paneRef = useRef<HTMLDivElement>(null);
  const [keepPaneLayout, setKeepPaneLayout] = useState(false);
  const exitReleasedRef = useRef(false);

  const bannerHeightPx = useEnvironmentBannerLayoutHeight();
  const isFixedOverlay = !mobile;

  useLayoutEffect(() => {
    if (isRightPaneOpen) {
      setKeepPaneLayout(true);
      exitReleasedRef.current = false;
    }
  }, [isRightPaneOpen]);

  const paneLayoutActive = isRightPaneOpen || keepPaneLayout;

  const releaseAfterExit = useCallback(() => {
    if (exitReleasedRef.current) return;
    exitReleasedRef.current = true;
    clearPane();
    setKeepPaneLayout(false);
  }, [clearPane]);

  // Fallback when exit animations do not run (e.g. jsdom); `onAnimationComplete` handles the normal path.
  useLayoutEffect(() => {
    if (isRightPaneOpen || !keepPaneLayout) return;
    return waitForRightPaneExit(releaseAfterExit);
  }, [isRightPaneOpen, keepPaneLayout, releaseAfterExit]);

  usePreventScroll({ isDisabled: !mobile || !isRightPaneOpen });

  const slideX = mobile ? "100%" : paneWidth;
  const paneWidthCss = documentScrollRightPaneWidthCss(paneWidth);

  const anchor = anchorRef ?? { current: null };
  const paneBounds = useScrollPinnedViewportBounds(
    isFixedOverlay ? anchor : paneRef,
    paneLayoutActive && isFixedOverlay,
    stickyTableHeaderOffsetPx,
  );

  // Only `top`; `bottom0` sizes the pane, since a `window.innerHeight` height runs under a horizontal scrollbar.
  const paneStyle: CSSProperties = { top: mobile ? bannerHeightPx : paneBounds?.topPx };

  const pane = (
    <AnimatePresence>
      {isRightPaneOpen && (
        <motion.div
          ref={paneRef}
          key="documentScrollRightPane"
          {...{ [rightPaneContentDataAttribute]: true }}
          {...tid}
          css={
            mobile
              ? Css.fixed.right0.bottom0.left0.oya.bgColor(Tokens.Surface).z(zIndices.rightPaneMobile).$
              : Css.fixed.right0.bottom0.oya
                  .w(paneWidthCss)
                  .bgColor(Tokens.Surface)
                  .z(zIndices.rightPane)
                  // The top border continues the layout table's, which the pane sits level with
                  .bl.bt.bc(Tokens.SurfaceSeparator)
                  // Pinned, `top` only moves when the chrome above hides or reveals, so ease with it the
                  // way sticky chrome does. Unpinned it tracks the anchor every scroll and must not lag.
                  .if(!!paneBounds?.isPinned).transitionTop.$
          }
          style={paneStyle}
          initial={{ x: slideX }}
          animate={{ x: 0 }}
          exit={{ x: slideX }}
          // Copy Css.transition* / truss-motion `normal` + `standard`.
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={(definition: { x?: number | string }) => {
            if (definition.x !== 0 && definition.x !== undefined) releaseAfterExit();
          }}
        >
          {rightPaneContent}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(pane, document.body);
}
