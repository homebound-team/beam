import { AnimatePresence, motion } from "framer-motion";
import { CSSProperties, RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";
import { usePreventScroll } from "react-aria";
import { createPortal } from "react-dom";
import { Css, Tokens } from "src/Css";
import { useEnvironmentBannerLayoutHeight } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import {
  documentScrollRightPaneHeight,
  documentScrollRightPaneWidth,
  stickyTableHeaderOffset,
} from "src/layouts/layoutVars";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { ResolvedDocumentScrollRightPaneBehavior } from "./documentScrollRightPaneMode";
import { useRightPaneContentContext, useRightPaneOpenContext } from "./RightPaneContext";
import { useDocumentScrollRightPaneViewportGeometry } from "./useDocumentScrollRightPaneViewportGeometry";

export type DocumentScrollRightPaneProps = {
  paneWidth: number;
  /** When true, full-bleed portal below the env banner (`sm` takeover — not a desktop mode). */
  mobile: boolean;
  /** Desktop only: fixed overlay, or in-flow push/clear. Ignored when `mobile` is true. */
  behavior?: ResolvedDocumentScrollRightPaneBehavior;
  /** Desktop overlay only: layout root for fixed pane top/height. */
  anchorRef?: RefObject<HTMLElement | null>;
};

/** Detail pane UI: mobile takeover, desktop fixed overlay, or desktop sticky in-flow (push/clear). */
export function DocumentScrollRightPane({ paneWidth, mobile, behavior, anchorRef }: DocumentScrollRightPaneProps) {
  const { isRightPaneOpen, clearPane } = useRightPaneOpenContext();
  const rightPaneContent = useRightPaneContentContext();
  const tid = useTestIds({}, "rightPaneContent");
  const paneRef = useRef<HTMLDivElement>(null);
  const [keepPaneLayout, setKeepPaneLayout] = useState(false);
  const exitReleasedRef = useRef(false);

  const bannerHeightPx = useEnvironmentBannerLayoutHeight();
  const isFixedOverlay = !mobile && behavior === "overlay";
  const isInFlowDesktop = !mobile && behavior !== undefined && behavior !== "overlay";

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

    let frame = 0;
    const waitForPaneExit = () => {
      if (document.querySelector("[data-right-pane-content]")) {
        frame = requestAnimationFrame(waitForPaneExit);
        return;
      }
      releaseAfterExit();
    };
    frame = requestAnimationFrame(waitForPaneExit);
    return () => cancelAnimationFrame(frame);
  }, [isRightPaneOpen, keepPaneLayout, releaseAfterExit]);

  usePreventScroll({ isDisabled: !mobile || !isRightPaneOpen });

  const slideX = mobile ? "100%" : paneWidth;
  const effectivePaneWidth = documentScrollRightPaneWidth(paneWidth);

  const anchor = anchorRef ?? { current: null };
  const paneGeometry = useDocumentScrollRightPaneViewportGeometry(
    isFixedOverlay ? anchor : paneRef,
    paneLayoutActive && (isFixedOverlay || isInFlowDesktop),
  );

  const paneStyle: CSSProperties | undefined = mobile
    ? { top: bannerHeightPx }
    : isFixedOverlay && paneGeometry
      ? { top: paneGeometry.topPx, height: paneGeometry.heightPx, maxHeight: paneGeometry.heightPx }
      : paneGeometry
        ? { height: paneGeometry.heightPx, maxHeight: paneGeometry.heightPx }
        : undefined;

  const pane = (
    <AnimatePresence>
      {isRightPaneOpen && (
        <motion.div
          ref={paneRef}
          key="documentScrollRightPane"
          data-right-pane-content
          {...tid}
          css={
            mobile
              ? Css.fixed.right0.bottom0.left0.oya.bgColor(Tokens.Surface).z(zIndices.rightPaneMobile).$
              : isFixedOverlay
                ? Css.fixed.right0.oya
                    .w(effectivePaneWidth)
                    .bgColor(Tokens.Surface)
                    .z(zIndices.rightPane)
                    .bl.bc(Tokens.SurfaceSeparator).$
                : Css.sticky.transitionTop
                    .top(stickyTableHeaderOffset())
                    .right(0)
                    .asfs.fs0.fg0.oya.w(effectivePaneWidth)
                    .bgColor(Tokens.Surface)
                    .z(zIndices.rightPane)
                    .bl.bc(Tokens.SurfaceSeparator)
                    .maxh(documentScrollRightPaneHeight())
                    .if(behavior === "clear")
                    .ml(`calc(-1 * ${effectivePaneWidth})`).$
          }
          style={paneStyle}
          initial={{ x: slideX }}
          animate={{ x: 0 }}
          exit={{ x: slideX }}
          transition={{ ease: "linear", duration: 0.2 }}
          onAnimationComplete={(definition: { x: number | string }) => {
            if (definition.x !== 0) releaseAfterExit();
          }}
        >
          {rightPaneContent}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (mobile || isFixedOverlay) {
    return createPortal(pane, document.body);
  }

  return pane;
}
