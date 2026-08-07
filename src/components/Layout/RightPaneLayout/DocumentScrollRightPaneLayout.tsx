import { CSSProperties, ReactNode, useLayoutEffect } from "react";
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
import { useRightPaneContext } from "./RightPaneContext";

export const defaultDocumentScrollRightPaneWidth = 450;

export type DocumentScrollRightPaneLayoutProps = {
  children: ReactNode;
  /** Width (px) of the fixed detail pane opened via `useRightPane`. */
  paneWidth?: number;
};

/**
 * Document-scroll right pane: `children` are main content; pane body comes from `openRightPane`.
 * Desktop: pins below sticky chrome; publishes scoped `--beam-right-pane-width` and root
 * `--beam-floating-right-offset`. On `sm`, the open pane is a full-bleed overlay (no spacer / width vars).
 * `GridTableLayout` scopes this around the table body (not table actions).
 */
export function DocumentScrollRightPaneLayout(props: DocumentScrollRightPaneLayoutProps) {
  const { children, paneWidth = defaultDocumentScrollRightPaneWidth } = props;
  const tid = useTestIds(props, "documentScrollRightPaneLayout");
  const { isRightPaneOpen } = useRightPaneContext();
  const { sm } = useBreakpoint();
  // Split layout only on larger viewports; on `sm` the pane overlays full-bleed so no spacer/offsets.
  const isSplitPaneOpen = isRightPaneOpen && !sm;
  const effectivePaneWidth = isSplitPaneOpen ? documentScrollRightPaneWidth(paneWidth) : "0px";

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.style.getPropertyValue(beamFloatingRightOffsetVar);
    root.style.setProperty(beamFloatingRightOffsetVar, effectivePaneWidth);
    return () => {
      if (previous) {
        root.style.setProperty(beamFloatingRightOffsetVar, previous);
      } else {
        root.style.removeProperty(beamFloatingRightOffsetVar);
      }
    };
  }, [effectivePaneWidth]);

  return (
    <div css={Css.w100.$} style={{ [beamRightPaneWidthVar]: effectivePaneWidth } as CSSProperties} {...tid}>
      <DocumentScrollRightPaneSpacer paneWidth={paneWidth} isOpen={isSplitPaneOpen}>
        {children}
      </DocumentScrollRightPaneSpacer>
      <DocumentScrollRightPane paneWidth={paneWidth} />
    </div>
  );
}

/** Grows horizontal document scroll by the pane width when open so content is not trapped under it. */
function DocumentScrollRightPaneSpacer({
  paneWidth,
  isOpen,
  children,
}: {
  paneWidth: number;
  isOpen: boolean;
  children: ReactNode;
}) {
  const tid = useTestIds({}, "rightPaneSpacer");
  const effectivePaneWidth = documentScrollRightPaneWidth(paneWidth);

  return (
    <div css={Css.df.mw100.$} style={{ width: isOpen ? "fit-content" : "100%" }}>
      <div css={Css.fs0.mw("fit-content").$} style={{ width: `min(100%, ${documentScrollChromeWidth()})` }}>
        {children}
      </div>
      <div
        aria-hidden
        css={Css.fs0.fg0.$}
        style={{ width: isOpen ? effectivePaneWidth : 0 }}
        {...(isOpen ? tid : {})}
      />
    </div>
  );
}
