import { type ReactNode, type RefObject, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import {
  beamFloatingRightOffsetVar,
  beamRightPaneWidthVar,
  documentScrollChromeWidth,
  documentScrollRightPaneWidthCss,
} from "src/layouts/layoutVars";
import { useTestIds } from "src/utils/useTestIds";
import { DocumentScrollRightPane } from "./DocumentScrollRightPane";
import {
  DocumentScrollRightPaneLayoutRoot,
  NestedRightPaneLayoutContext,
  useDocumentScrollRightPaneAnchorRef,
} from "./documentScrollRightPaneLayoutShared";
import { defaultDocumentScrollRightPaneWidth } from "./types";
import { useRightPaneOpenState } from "./useRightPane";
import { waitForRightPaneExit } from "./waitForRightPaneExit";

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
          <div css={Css.df.aifs.mw100.wfc.$}>
            <div css={Css.fs0.mwfc.w(`min(100%, ${documentScrollChromeWidth()})`).$}>{children}</div>
            <div ref={spacerRef} aria-hidden css={Css.fs0.fg0.h1.$} style={{ width: 0 }} {...tid.spacer} />
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
  const [reserveOverlayChrome, setReserveOverlayChrome] = useState(isRightPaneOpen);

  // Keep spacer / width vars until the pane exit animation finishes (shared poll with DocumentScrollRightPane).
  useLayoutEffect(() => {
    if (isRightPaneOpen) {
      setReserveOverlayChrome(true);
      return;
    }
    return waitForRightPaneExit(() => setReserveOverlayChrome(false));
  }, [isRightPaneOpen]);

  // Imperatively sync scoped pane width, root floating offset, and spacer width while overlay chrome is reserved.
  useLayoutEffect(() => {
    const layoutRoot = anchorRef.current;
    const spacer = spacerRef.current;
    if (!layoutRoot) return;

    const width = reserveOverlayChrome ? paneWidthCss : "0px";
    layoutRoot.style.setProperty(beamRightPaneWidthVar, width);
    // Floating right offset helps position elements such as the "scroll to top" button properly when the pane is open.
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
  }, [anchorRef, paneWidthCss, reserveOverlayChrome, spacerRef]);

  return <DocumentScrollRightPane paneWidth={paneWidth} mobile={false} behavior="overlay" anchorRef={anchorRef} />;
}
