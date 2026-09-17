import { useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import {
  beamFloatingRightOffsetVar,
  beamRightPaneContentMinVar,
  beamRightPaneWidthVar,
  documentScrollRightPaneWidthCss,
} from "src/layouts/layoutVars";
import { useTestIds } from "src/utils/useTestIds";
import { DocumentScrollRightPane } from "./DocumentScrollRightPane";
import { DocumentScrollRightPaneLayoutRoot, NestedRightPaneLayoutContext } from "./DocumentScrollRightPaneLayoutRoot";
import { useDocumentScrollRightPaneAnchorRef } from "./useDocumentScrollRightPaneAnchorRef";
import { useRightPaneOpenState } from "./useRightPane";
import { waitForRightPaneExit } from "./waitForRightPaneExit";
import { defaultDocumentScrollRightPaneWidth, minDocumentScrollContentWidthPx } from "./withRightPane";

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

  if (nestedInLayout) return <>{children}</>;

  return (
    <DocumentScrollRightPaneLayoutRoot anchorRef={anchorRef} tid={tid}>
      {sm ? (
        <>
          {children}
          <DocumentScrollRightPane paneWidth={paneWidth} mobile={true} />
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
          <DocumentScrollOverlayRightPaneHost anchorRef={anchorRef.ref} spacerRef={spacerRef} paneWidth={paneWidth} />
        </>
      )}
    </DocumentScrollRightPaneLayoutRoot>
  );
}

type DocumentScrollOverlayRightPaneHostProps = {
  anchorRef: RefObject<HTMLDivElement | null>;
  spacerRef: RefObject<HTMLDivElement | null>;
  paneWidth: number;
};
/** Subscribes to pane open/close here so the layout shell and `{children}` stay stable; syncs width vars/spacer and mounts the overlay pane. */
function DocumentScrollOverlayRightPaneHost(props: DocumentScrollOverlayRightPaneHostProps) {
  const { anchorRef, spacerRef, paneWidth } = props;
  const { isRightPaneOpen } = useRightPaneOpenState();
  const paneWidthCss = documentScrollRightPaneWidthCss(paneWidth);
  const [keepOverlayChrome, setKeepOverlayChrome] = useState(isRightPaneOpen);

  // Keep width vars until the pane exit animation finishes (shared poll with DocumentScrollRightPane).
  useLayoutEffect(() => {
    if (isRightPaneOpen) {
      setKeepOverlayChrome(true);
      return;
    }
    return waitForRightPaneExit(() => setKeepOverlayChrome(false));
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

    const openPaneWidth = keepOverlayChrome ? paneWidthCss : "0px";
    const contentMin = keepOverlayChrome ? `${minDocumentScrollContentWidthPx}px` : "0px";
    layoutRoot.style.setProperty(beamRightPaneWidthVar, openPaneWidth);
    layoutRoot.style.setProperty(beamRightPaneContentMinVar, contentMin);
    // Floating right offset helps position elements such as the "scroll to top" button properly when the pane is open.
    document.documentElement.style.setProperty(beamFloatingRightOffsetVar, openPaneWidth);

    return () => {
      layoutRoot.style.setProperty(beamRightPaneWidthVar, "0px");
      layoutRoot.style.setProperty(beamRightPaneContentMinVar, "0px");
      document.documentElement.style.setProperty(beamFloatingRightOffsetVar, "0px");
    };
  }, [anchorRef, keepOverlayChrome, paneWidthCss]);

  return <DocumentScrollRightPane paneWidth={paneWidth} mobile={false} anchorRef={anchorRef} />;
}
