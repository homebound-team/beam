import { forwardRef, ReactNode, RefObject, useLayoutEffect, useRef, useState } from "react";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import {
  beamFloatingRightOffsetVar,
  beamRightPaneWidthVar,
  documentScrollChromeWidth,
  documentScrollRightPaneWidth,
} from "src/layouts/layoutVars";
import { useTestIds } from "src/utils";
import { DocumentScrollRightPane } from "./DocumentScrollRightPane";
import {
  DocumentScrollRightPaneLayoutRoot,
  DocumentScrollRightPaneMainChildren,
  useDocumentScrollRightPaneAnchorRef,
} from "./documentScrollRightPaneLayoutShared";
import { defaultDocumentScrollRightPaneWidth } from "./types";
import { useRightPaneOpenContext } from "./useRightPane";

export type DocumentScrollOverlayRightPaneLayoutProps = {
  children: ReactNode;
  /** Width (px) of the detail pane opened via `useRightPane`. */
  paneWidth?: number;
};

/** Full-width main + fixed overlay pane on desktop; full-bleed pane on `sm`. */
export function DocumentScrollOverlayRightPaneLayout({
  children,
  paneWidth = defaultDocumentScrollRightPaneWidth,
}: DocumentScrollOverlayRightPaneLayoutProps) {
  const { sm } = useBreakpoint();
  const tid = useTestIds({}, "documentScrollRightPaneLayout");
  const mainTid = useTestIds({}, "rightPaneMain");
  const spacerTid = useTestIds({}, "rightPaneSpacer");
  const anchorRef = useDocumentScrollRightPaneAnchorRef();
  const spacerRef = useRef<HTMLDivElement | null>(null);

  return (
    <DocumentScrollRightPaneLayoutRoot anchorRef={anchorRef} tid={tid}>
      {sm ? (
        <>
          <DocumentScrollRightPaneMainChildren>{children}</DocumentScrollRightPaneMainChildren>
          <DocumentScrollRightPane paneWidth={paneWidth} mobile={true} />
        </>
      ) : (
        <>
          <div css={Css.df.aifs.mw100.w("fit-content").$}>
            <DocumentScrollOverlayRightPaneMain mainPart={mainTid.overlay}>
              <DocumentScrollRightPaneMainChildren>{children}</DocumentScrollRightPaneMainChildren>
            </DocumentScrollOverlayRightPaneMain>
            <DocumentScrollOverlayRightPaneSpacer ref={spacerRef} {...spacerTid} />
          </div>
          <DocumentScrollOverlayRightPaneOpen anchorRef={anchorRef.ref} spacerRef={spacerRef} paneWidth={paneWidth} />
        </>
      )}
    </DocumentScrollRightPaneLayoutRoot>
  );
}

/** Publishes pane width CSS vars and mounts the fixed overlay — isolated from the main subtree. */
function DocumentScrollOverlayRightPaneOpen({
  anchorRef,
  spacerRef,
  paneWidth,
}: {
  anchorRef: RefObject<HTMLDivElement | null>;
  spacerRef: RefObject<HTMLDivElement | null>;
  paneWidth: number;
}) {
  const { isRightPaneOpen } = useRightPaneOpenContext();
  const effectivePaneWidth = documentScrollRightPaneWidth(paneWidth);
  const [reserveOverlayChrome, setReserveOverlayChrome] = useState(isRightPaneOpen);

  useLayoutEffect(() => {
    if (isRightPaneOpen) {
      setReserveOverlayChrome(true);
      return;
    }

    let frame = 0;
    const waitForPaneExit = () => {
      if (document.querySelector("[data-right-pane-content]")) {
        frame = requestAnimationFrame(waitForPaneExit);
        return;
      }
      setReserveOverlayChrome(false);
    };
    frame = requestAnimationFrame(waitForPaneExit);
    return () => cancelAnimationFrame(frame);
  }, [isRightPaneOpen]);

  useLayoutEffect(() => {
    const layoutRoot = anchorRef.current;
    const spacer = spacerRef.current;
    if (!layoutRoot) return;

    const width = reserveOverlayChrome ? effectivePaneWidth : "0px";
    layoutRoot.style.setProperty(beamRightPaneWidthVar, width);
    document.documentElement.style.setProperty(beamFloatingRightOffsetVar, width);
    if (spacer) {
      spacer.style.width = width;
    }

    return () => {
      layoutRoot.style.setProperty(beamRightPaneWidthVar, "0px");
      document.documentElement.style.setProperty(beamFloatingRightOffsetVar, "0px");
      if (spacer) {
        spacer.style.width = "0px";
      }
    };
  }, [anchorRef, effectivePaneWidth, reserveOverlayChrome, spacerRef]);

  return <DocumentScrollRightPane paneWidth={paneWidth} mobile={false} behavior="overlay" anchorRef={anchorRef} />;
}

/** Overlay main column — full chrome width; spacer adds horizontal scroll when open. */
function DocumentScrollOverlayRightPaneMain({ mainPart, children }: { mainPart: object; children: ReactNode }) {
  return (
    <div
      css={Css.fs0.mw("fit-content").w(`min(100%, ${documentScrollChromeWidth()})`).$}
      data-right-pane-main
      {...mainPart}
    >
      {children}
    </div>
  );
}

/** Zero-width slot; width toggled imperatively when the overlay pane opens. */
const DocumentScrollOverlayRightPaneSpacer = forwardRef<HTMLDivElement, Record<string, unknown>>(
  function DocumentScrollOverlayRightPaneSpacer(tid, ref) {
    return <div ref={ref} aria-hidden css={Css.fs0.fg0.h1.$} style={{ width: 0 }} {...tid} />;
  },
);
