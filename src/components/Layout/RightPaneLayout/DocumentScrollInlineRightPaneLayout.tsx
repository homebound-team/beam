import { ReactNode, useLayoutEffect } from "react";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import {
  beamFloatingRightOffsetVar,
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
import { readDocumentScrollChromeWidthPx, resolveDocumentScrollRightPaneBehavior } from "./documentScrollRightPaneMode";
import { useRightPaneOpenContext } from "./RightPaneContext";
import { defaultDocumentScrollRightPaneWidth, DocumentScrollInlineRightPaneMode } from "./types";

export type DocumentScrollInlineRightPaneLayoutProps = {
  children: ReactNode;
  /** Width (px) of the detail pane opened via `useRightPane`. */
  paneWidth?: number;
  /** Desktop strategy. Default `auto` (push or clear from shell collision math). */
  mode?: DocumentScrollInlineRightPaneMode;
  /** Centered shell max-width (px) for `auto` collision math. */
  shellMaxPx?: number;
  /** Left rail width (px) reserved beside the centered shell (e.g. JumpLinks). */
  jumpLinksWidthPx?: number;
};

/** In-flow push/clear pane on desktop; full-bleed pane on `sm`. */
export function DocumentScrollInlineRightPaneLayout({
  children,
  paneWidth = defaultDocumentScrollRightPaneWidth,
  mode = "auto",
  shellMaxPx,
  jumpLinksWidthPx = 0,
}: DocumentScrollInlineRightPaneLayoutProps) {
  const { sm } = useBreakpoint();
  const tid = useTestIds({}, "documentScrollRightPaneLayout");
  const mainTid = useTestIds({}, "rightPaneMain");
  const { isRightPaneOpen } = useRightPaneOpenContext();
  const anchorRef = useDocumentScrollRightPaneAnchorRef();

  const behavior =
    !sm && isRightPaneOpen
      ? resolveDocumentScrollRightPaneBehavior({
          mode,
          chromeWidthPx: readDocumentScrollChromeWidthPx(anchorRef.ref.current),
          paneWidthPx: paneWidth,
          shellMaxPx,
          jumpLinksWidthPx,
        })
      : undefined;

  const isPush = behavior === "push";
  const mainPart = isPush ? mainTid.push : undefined;
  const floatingOffset = !sm && isRightPaneOpen ? documentScrollRightPaneWidth(paneWidth) : "0px";

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(beamFloatingRightOffsetVar, floatingOffset);
    return () => {
      document.documentElement.style.setProperty(beamFloatingRightOffsetVar, "0px");
    };
  }, [floatingOffset]);

  return (
    <DocumentScrollRightPaneLayoutRoot anchorRef={anchorRef} tid={tid}>
      {sm ? (
        <>
          <DocumentScrollRightPaneMainChildren>{children}</DocumentScrollRightPaneMainChildren>
          <DocumentScrollRightPane paneWidth={paneWidth} mobile={true} />
        </>
      ) : (
        <div css={isPush ? Css.df.aifs.w(`min(100%, ${documentScrollChromeWidth()})`).$ : Css.df.aifs.w100.$}>
          <DocumentScrollInlineRightPaneMain isPush={isPush} mainPart={mainPart}>
            <DocumentScrollRightPaneMainChildren>{children}</DocumentScrollRightPaneMainChildren>
          </DocumentScrollInlineRightPaneMain>
          {behavior !== undefined && (
            <DocumentScrollRightPane paneWidth={paneWidth} mobile={false} behavior={behavior} />
          )}
        </div>
      )}
    </DocumentScrollRightPaneLayoutRoot>
  );
}

/** Push/clear main column — see {@link DocumentScrollOverlayRightPaneMain} for overlay. */
function DocumentScrollInlineRightPaneMain({
  isPush,
  mainPart,
  children,
}: {
  isPush: boolean;
  mainPart: object | undefined;
  children: ReactNode;
}) {
  if (isPush) {
    return (
      <div css={Css.fg1.fs1.mw0.$} data-right-pane-main {...mainPart}>
        {children}
      </div>
    );
  }

  return (
    <div css={Css.fs0.w100.$} data-right-pane-main {...mainPart}>
      {children}
    </div>
  );
}
