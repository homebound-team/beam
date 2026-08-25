import { createContext, CSSProperties, ReactNode, useContext, useLayoutEffect, useMemo, useRef } from "react";
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
  ResolvedDocumentScrollRightPaneBehavior,
  resolveDocumentScrollRightPaneBehavior,
} from "./documentScrollRightPaneMode";
import { useRightPaneContext } from "./RightPaneContext";
import { defaultDocumentScrollRightPaneWidth, DocumentScrollRightPaneMode } from "./types";
import { useDocumentScrollChromeWidthPx } from "./useDocumentScrollChromeWidthPx";

export { defaultDocumentScrollRightPaneWidth };

const DocumentScrollRightPaneHostContext = createContext(false);

export type DocumentScrollRightPaneLayoutProps = {
  children: ReactNode;
  /** Width (px) of the fixed detail pane opened via `useRightPane`. */
  paneWidth?: number;
  /**
   * Desktop layout strategy. Default `overlay` (spacer so under-pane content stays reachable).
   * `auto` needs `shellMaxPx` for centered bodies — see `docs/layouts.md`.
   */
  mode?: DocumentScrollRightPaneMode;
  /** Centered shell max-width (px) for `auto` collision math. */
  shellMaxPx?: number;
  /** Left rail width (px) reserved beside the centered shell (e.g. JumpLinks). */
  jumpLinksWidthPx?: number;
};

/**
 * Document-scroll right pane: `children` are main content; pane body comes from `openRightPane`.
 * Desktop: pins below sticky chrome; publishes scoped `--beam-right-pane-width` and root
 * `--beam-floating-right-offset`. On `sm`, the open pane is a full-bleed overlay (no spacer / width vars).
 * Compose around the body that knows its shape (`GridTableLayout`, `CenteredLayout`, `FocusedFormLayout`).
 */
export function DocumentScrollRightPaneLayout(props: DocumentScrollRightPaneLayoutProps) {
  const {
    children,
    paneWidth = defaultDocumentScrollRightPaneWidth,
    mode = "overlay",
    shellMaxPx,
    jumpLinksWidthPx = 0,
  } = props;
  const tid = useTestIds(props, "documentScrollRightPaneLayout");
  const { isRightPaneOpen } = useRightPaneContext();
  const { sm } = useBreakpoint();
  const hostRef = useRef<HTMLDivElement>(null);
  const chromeWidthPx = useDocumentScrollChromeWidthPx(hostRef);
  const nestedInHost = useContext(DocumentScrollRightPaneHostContext);

  useLayoutEffect(() => {
    if (nestedInHost && process.env.NODE_ENV !== "production") {
      console.warn(
        "DocumentScrollRightPaneLayout is nested inside another document-scroll right-pane host. Use a single host (compose at the body; FocusedForm withRightPane must not also set withRightPane on the inner form).",
      );
    }
  }, [nestedInHost]);

  // Split layout only on larger viewports; on `sm` the pane overlays full-bleed so no spacer/offsets.
  const isSplitPaneOpen = isRightPaneOpen && !sm;
  const behavior: ResolvedDocumentScrollRightPaneBehavior = useMemo(() => {
    if (!isSplitPaneOpen) return "clear";
    return resolveDocumentScrollRightPaneBehavior({
      mode,
      chromeWidthPx,
      paneWidthPx: paneWidth,
      shellMaxPx,
      jumpLinksWidthPx,
    });
  }, [isSplitPaneOpen, mode, chromeWidthPx, paneWidth, shellMaxPx, jumpLinksWidthPx]);

  const showSpacer = isSplitPaneOpen && behavior === "overlay";
  const isPush = isSplitPaneOpen && behavior === "push";
  // Sticky-right columns only need the pane-width token in overlay (spacer) mode.
  const stickyPaneWidthCss = showSpacer ? documentScrollRightPaneWidth(paneWidth) : "0px";
  // Floating chrome always clears the open desktop pane (all behaviors).
  const floatingOffsetCss = isSplitPaneOpen ? documentScrollRightPaneWidth(paneWidth) : "0px";

  useLayoutEffect(() => {
    // Apply styles to the root element so elements such as the "ScrollToTop" button can position correctly.
    const root = document.documentElement;
    const previous = root.style.getPropertyValue(beamFloatingRightOffsetVar);
    root.style.setProperty(beamFloatingRightOffsetVar, floatingOffsetCss);
    return () => {
      if (previous) {
        root.style.setProperty(beamFloatingRightOffsetVar, previous);
      } else {
        root.style.removeProperty(beamFloatingRightOffsetVar);
      }
    };
  }, [floatingOffsetCss]);

  return (
    <DocumentScrollRightPaneHostContext.Provider value={true}>
      <div
        ref={hostRef}
        css={Css.w100.$}
        style={{ [beamRightPaneWidthVar]: stickyPaneWidthCss } as CSSProperties}
        {...tid}
      >
        <DocumentScrollRightPaneMain paneWidth={paneWidth} showSpacer={showSpacer} isPush={isPush}>
          {children}
        </DocumentScrollRightPaneMain>
        <DocumentScrollRightPane paneWidth={paneWidth} />
      </div>
    </DocumentScrollRightPaneHostContext.Provider>
  );
}

/** Main column: optional overlay spacer, or push constraint so content clears the fixed pane. */
function DocumentScrollRightPaneMain({
  paneWidth,
  showSpacer,
  isPush,
  children,
}: {
  paneWidth: number;
  showSpacer: boolean;
  isPush: boolean;
  children: ReactNode;
}) {
  const tid = useTestIds({}, "rightPaneSpacer");
  const effectivePaneWidth = documentScrollRightPaneWidth(paneWidth);

  if (isPush) {
    return (
      <div
        css={Css.w100.$}
        style={{ maxWidth: `calc(${documentScrollChromeWidth()} - ${effectivePaneWidth})` }}
        {...tid.push}
      >
        {children}
      </div>
    );
  }

  if (!showSpacer) {
    return <div css={Css.w100.$}>{children}</div>;
  }

  // Overlay: grow horizontal document scroll by the pane width so content under it stays reachable.
  return (
    <div css={Css.df.mw100.$} style={{ width: "fit-content" }}>
      <div css={Css.fs0.mw("fit-content").$} style={{ width: `min(100%, ${documentScrollChromeWidth()})` }}>
        {children}
      </div>
      <div aria-hidden css={Css.fs0.fg0.$} style={{ width: effectivePaneWidth }} {...tid} />
    </div>
  );
}
