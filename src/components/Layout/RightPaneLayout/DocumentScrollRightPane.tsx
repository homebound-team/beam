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

/** Detail pane UI: mobile takeover or desktop fixed overlay. */
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

  const paneStyle: CSSProperties | undefined = mobile
    ? { top: bannerHeightPx }
    : paneBounds
      ? { top: paneBounds.topPx, height: paneBounds.heightPx, maxHeight: paneBounds.heightPx }
      : undefined;

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
              : Css.fixed.right0.oya
                  .w(paneWidthCss)
                  .bgColor(Tokens.Surface)
                  .z(zIndices.rightPane)
                  .bl.bc(Tokens.SurfaceSeparator).$
          }
          style={paneStyle}
          initial={{ x: slideX }}
          animate={{ x: 0 }}
          exit={{ x: slideX }}
          transition={{ ease: "linear", duration: 0.2 }}
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
