import { useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useHasSideNavLayoutProvider, useSideNavLayoutContext } from "src/layouts/SideNavLayout/SideNavLayoutContext";
import {
  beamFloatingRightOffsetVar,
  beamRightPaneWidthVar,
  documentScrollRightPaneWidthCss,
} from "src/layouts/layoutVars";
import { useTestIds } from "src/utils/useTestIds";
import { DocumentScrollRightPane } from "./DocumentScrollRightPane";
import { DocumentScrollRightPaneLayoutRoot, NestedRightPaneLayoutContext } from "./DocumentScrollRightPaneLayoutRoot";
import { useDocumentScrollRightPaneAnchorRef } from "./useDocumentScrollRightPaneAnchorRef";
import { useRightPaneOpenState } from "./useRightPane";
import { waitForRightPaneExit } from "./waitForRightPaneExit";
import {
  defaultDocumentScrollRightPaneWidth,
  readDocumentScrollChromeWidthPx,
  resolveOverlaySpacerWidthPx,
  type ReserveScroll,
} from "./withRightPane";

export type DocumentScrollOverlayRightPaneLayoutProps = {
  children: ReactNode;
  /** Width (px) of the detail pane opened via `useRightPane`. */
  paneWidth?: number;
  /**
   * Whether to insert a horizontal-scroll spacer while the pane is open.
   * `true` for tables; `"auto"` for forms (pane-width spacer when leftover chrome is usable).
   */
  reserveScroll?: ReserveScroll;
};

/** Full-width main + fixed overlay pane on desktop; full-bleed pane on `sm`. */
export function DocumentScrollOverlayRightPaneLayout({
  children,
  paneWidth = defaultDocumentScrollRightPaneWidth,
  reserveScroll = true,
}: DocumentScrollOverlayRightPaneLayoutProps) {
  const nestedInLayout = useContext(NestedRightPaneLayoutContext);
  const { sm } = useBreakpoint();
  const tid = useTestIds({}, "documentScrollRightPaneLayout");
  const anchorRef = useDocumentScrollRightPaneAnchorRef();
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const growWithContent = reserveScroll === true;

  useEffect(() => {
    if (nestedInLayout && process.env.NODE_ENV !== "production") {
      console.warn(
        "DocumentScrollOverlayRightPaneLayout is nested inside another document-scroll right-pane layout. Use a single layout (compose at the body; do not set withRightPane on both a parent and a nested layout).",
      );
    }
  }, [nestedInLayout]);

  if (nestedInLayout) return <>{children}</>;

  return (
    <DocumentScrollRightPaneLayoutRoot anchorRef={anchorRef} tid={tid} expandToMinContent={growWithContent}>
      {sm ? (
        <>
          {children}
          <DocumentScrollRightPane paneWidth={paneWidth} mobile={true} />
        </>
      ) : (
        <>
          <div css={growWithContent ? Css.df.aifs.wfc.mw100.$ : Css.df.aifs.w100.$}>
            <div css={growWithContent ? Css.w100.mwfc.$ : Css.fg1.mw0.$}>{children}</div>
            <div ref={spacerRef} aria-hidden css={Css.fs0.fg0.h1.$} style={{ width: 0 }} {...tid.spacer} />
          </div>
          <DocumentScrollOverlayRightPaneHost
            anchorRef={anchorRef.ref}
            spacerRef={spacerRef}
            paneWidth={paneWidth}
            reserveScroll={reserveScroll}
          />
        </>
      )}
    </DocumentScrollRightPaneLayoutRoot>
  );
}

type DocumentScrollOverlayRightPaneHostProps = {
  anchorRef: RefObject<HTMLDivElement | null>;
  spacerRef: RefObject<HTMLDivElement | null>;
  paneWidth: number;
  reserveScroll: ReserveScroll;
};
/** Subscribes to pane open/close here so the layout shell and `{children}` stay stable; syncs width vars/spacer and mounts the overlay pane. */
function DocumentScrollOverlayRightPaneHost(props: DocumentScrollOverlayRightPaneHostProps) {
  const { anchorRef, spacerRef, paneWidth, reserveScroll } = props;
  const { isRightPaneOpen } = useRightPaneOpenState();
  const paneWidthCss = documentScrollRightPaneWidthCss(paneWidth);
  const [reserveOverlayChrome, setReserveOverlayChrome] = useState(isRightPaneOpen);
  const [spacerWidth, setSpacerWidth] = useState("0px");
  const resolvedOnOpenRef = useRef(false);
  const skipNextNavResolveRef = useRef(true);
  const hasSideNav = useHasSideNavLayoutProvider();
  const { navState } = useSideNavLayoutContext();

  // Keep spacer / width vars until the pane exit animation finishes (shared poll with DocumentScrollRightPane).
  useLayoutEffect(() => {
    if (isRightPaneOpen) {
      setReserveOverlayChrome(true);
      if (!resolvedOnOpenRef.current) {
        resolvedOnOpenRef.current = true;
        setSpacerWidth(resolveSpacerWidthCss(reserveScroll, paneWidth, paneWidthCss, anchorRef.current));
      }
      return;
    }
    return waitForRightPaneExit(() => {
      resolvedOnOpenRef.current = false;
      setReserveOverlayChrome(false);
      setSpacerWidth("0px");
    });
  }, [anchorRef, isRightPaneOpen, paneWidth, paneWidthCss, reserveScroll]);

  // After the rail width transition, re-resolve `auto` (leftover may cross the usable threshold).
  useEffect(() => {
    if (!hasSideNav || reserveScroll !== "auto" || !isRightPaneOpen) {
      skipNextNavResolveRef.current = true;
      return;
    }
    if (skipNextNavResolveRef.current) {
      skipNextNavResolveRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      setSpacerWidth(resolveSpacerWidthCss(reserveScroll, paneWidth, paneWidthCss, anchorRef.current));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [anchorRef, hasSideNav, isRightPaneOpen, navState, paneWidth, paneWidthCss, reserveScroll]);

  // Imperatively sync scoped pane width, root floating offset, and spacer width while the pane is open.
  useLayoutEffect(() => {
    const layoutRoot = anchorRef.current;
    const spacer = spacerRef.current;
    if (!layoutRoot) return;

    const tokenWidth = reserveOverlayChrome ? paneWidthCss : "0px";
    const nextSpacerWidth = reserveOverlayChrome ? spacerWidth : "0px";
    layoutRoot.style.setProperty(beamRightPaneWidthVar, tokenWidth);
    // Floating right offset helps position elements such as the "scroll to top" button properly when the pane is open.
    document.documentElement.style.setProperty(beamFloatingRightOffsetVar, tokenWidth);
    if (spacer) {
      spacer.style.width = nextSpacerWidth;
    }

    return () => {
      layoutRoot.style.setProperty(beamRightPaneWidthVar, "0px");
      document.documentElement.style.setProperty(beamFloatingRightOffsetVar, "0px");
      if (spacer) {
        spacer.style.width = "0px";
      }
    };
  }, [anchorRef, paneWidthCss, reserveOverlayChrome, spacerRef, spacerWidth]);

  return <DocumentScrollRightPane paneWidth={paneWidth} mobile={false} anchorRef={anchorRef} />;
}

function resolveSpacerWidthCss(
  reserveScroll: ReserveScroll,
  paneWidth: number,
  paneWidthCss: string,
  layoutRoot: Element | null,
): string {
  if (reserveScroll === true) return paneWidthCss;
  const widthPx = resolveOverlaySpacerWidthPx({
    reserveScroll,
    chromeWidthPx: readDocumentScrollChromeWidthPx(layoutRoot),
    paneWidthPx: paneWidth,
  });
  return widthPx > 0 ? `${Math.round(widthPx)}px` : "0px";
}
