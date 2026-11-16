import { useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import {
  beamFloatingRightOffsetVar,
  beamRightPaneContentMinVar,
  beamRightPaneWidthVar,
  documentScrollRightPaneMinHeight,
  documentScrollRightPaneWidthCss,
} from "src/layouts/layoutVars";
import { useTestIds } from "src/utils/useTestIds";
import { DocumentScrollRightPane } from "./DocumentScrollRightPane";
import { DocumentScrollRightPaneLayoutRoot, NestedRightPaneLayoutContext } from "./DocumentScrollRightPaneLayoutRoot";
import { useDocumentScrollRightPaneAnchorRef } from "./useDocumentScrollRightPaneAnchorRef";
import { useRightPaneOpenState } from "./useRightPane";
import { waitForRightPaneExit } from "./waitForRightPaneExit";
import { documentScrollRightPaneWidth, minDocumentScrollContentWidthPx } from "./withRightPane";

export type DocumentScrollOverlayRightPaneLayoutProps = {
  children: ReactNode;
};

/** Full-width main + fixed overlay pane on desktop; full-bleed pane on `sm`. */
export function DocumentScrollOverlayRightPaneLayout({ children }: DocumentScrollOverlayRightPaneLayoutProps) {
  const nestedInLayout = useContext(NestedRightPaneLayoutContext);
  const { sm } = useBreakpoint();
  const tid = useTestIds({}, "documentScrollRightPaneLayout");
  const anchorRef = useDocumentScrollRightPaneAnchorRef();
  const spacerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (nestedInLayout && process.env.NODE_ENV !== "production") {
      console.warn(
        "DocumentScrollOverlayRightPaneLayout is nested inside another document-scroll right-pane layout. Use a single layout (compose at the body; do not set withRightPane on both a parent and a nested layout).",
      );
    }
  }, [nestedInLayout]);

  // In-flow on desktop for as long as this layout is mounted, so a short page can scroll the navbar and page header
  // away while the pane is open. Kept when closed, since removing it would clamp a scrolled page and jump it to the top.
  // Set here rather than in the host, which runs before the anchor's ref is attached.
  useLayoutEffect(() => {
    const layoutRoot = anchorRef.ref.current;
    if (!layoutRoot || sm) return;

    layoutRoot.style.minHeight = documentScrollRightPaneMinHeight();
    return () => {
      layoutRoot.style.removeProperty("min-height");
    };
  }, [anchorRef.ref, sm]);

  if (nestedInLayout) return <>{children}</>;

  return (
    <DocumentScrollRightPaneLayoutRoot anchorRef={anchorRef} tid={tid}>
      {sm ? (
        <>
          {children}
          <DocumentScrollRightPane paneWidth={documentScrollRightPaneWidth} mobile={true} />
        </>
      ) : (
        <>
          <div css={Css.df.aifs.wfc.mw100.$}>
            <div css={Css.w100.mwfc.$} {...tid.main}>
              {children}
            </div>
            <div
              ref={spacerRef}
              aria-hidden
              css={Css.fs0.fg0.h1.transitionWidth.$}
              style={{ width: 0 }}
              {...tid.spacer}
            />
          </div>
          <DocumentScrollOverlayRightPaneHost anchorRef={anchorRef.ref} spacerRef={spacerRef} />
        </>
      )}
    </DocumentScrollRightPaneLayoutRoot>
  );
}

type DocumentScrollOverlayRightPaneHostProps = {
  anchorRef: RefObject<HTMLDivElement | null>;
  spacerRef: RefObject<HTMLDivElement | null>;
};
/** Subscribes to pane open/close here so the layout shell and `{children}` stay stable; syncs width vars/spacer and mounts the overlay pane. */
function DocumentScrollOverlayRightPaneHost(props: DocumentScrollOverlayRightPaneHostProps) {
  const { anchorRef, spacerRef } = props;
  const { isRightPaneOpen } = useRightPaneOpenState();
  const paneWidthCss = documentScrollRightPaneWidthCss(documentScrollRightPaneWidth);
  // Open, or the exit slide is still on screen. Same condition as `paneOpenOrExiting` in `DocumentScrollRightPane`, which keeps the pane's measured top.
  // This one keeps the width vars, so the page does not jump while the pane is still visible.
  const [paneOpenOrExiting, setPaneOpenOrExiting] = useState(isRightPaneOpen);

  useLayoutEffect(() => {
    if (isRightPaneOpen) {
      setPaneOpenOrExiting(true);
      return;
    }
    return waitForRightPaneExit(() => setPaneOpenOrExiting(false));
  }, [isRightPaneOpen]);

  // Spacer follows open state so width can CSS-transition with the pane slide.
  useLayoutEffect(() => {
    const spacer = spacerRef.current;
    if (!spacer) return;
    spacer.style.width = isRightPaneOpen ? paneWidthCss : "0px";
  }, [isRightPaneOpen, paneWidthCss, spacerRef]);

  // Keep width vars until exit so sticky-right columns do not jump mid-slide.
  useLayoutEffect(() => {
    const layoutRoot = anchorRef.current;
    if (!layoutRoot) return;

    const openPaneWidth = paneOpenOrExiting ? paneWidthCss : "0px";
    const contentMin = paneOpenOrExiting ? `${minDocumentScrollContentWidthPx}px` : "0px";
    layoutRoot.style.setProperty(beamRightPaneWidthVar, openPaneWidth);
    layoutRoot.style.setProperty(beamRightPaneContentMinVar, contentMin);
    // Floating right offset helps position elements such as the "scroll to top" button properly when the pane is open.
    document.documentElement.style.setProperty(beamFloatingRightOffsetVar, openPaneWidth);

    return () => {
      layoutRoot.style.setProperty(beamRightPaneWidthVar, "0px");
      layoutRoot.style.setProperty(beamRightPaneContentMinVar, "0px");
      document.documentElement.style.setProperty(beamFloatingRightOffsetVar, "0px");
    };
  }, [anchorRef, paneOpenOrExiting, paneWidthCss]);

  return <DocumentScrollRightPane paneWidth={documentScrollRightPaneWidth} mobile={false} anchorRef={anchorRef} />;
}
