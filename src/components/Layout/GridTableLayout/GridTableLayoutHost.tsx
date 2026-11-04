import { useResizeObserver } from "@react-aria/utils";
import { type ReactNode, type RefObject, useCallback, useImperativeHandle, useLayoutEffect, useRef } from "react";
import type { GridTableLayoutHost as GridTableLayoutHostValue } from "src/components/Layout/GridTableLayout/useGridTableLayoutHost";
import { DocumentScrollOverlayRightPaneLayout } from "src/components/Layout/RightPaneLayout/DocumentScrollOverlayRightPaneLayout";
import { ScrollableContent, VirtualizedScrollParentProvider } from "src/components/Layout/ScrollableContent";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { ModalFullBleed } from "src/components/Modal/ModalFullBleed";
import { modalBodyPaddingX } from "src/components/Modal/modalStyles";
import { Css, type Properties, Tokens } from "src/Css";
import { selfTopSpaced } from "src/layouts/layoutSpacing";
import {
  beamTableActionsHeightVar,
  documentScrollChromeLeft,
  documentScrollChromeWidth,
  documentScrollRightPaneContentMinCss,
  stickyNavAndHeaderOffset,
  stickyNavAndHeaderOffsetPx,
} from "src/layouts/layoutVars";
import { noop } from "src/utils/helpers";
import type { TestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";

type GridTableLayoutHostProps = {
  host: GridTableLayoutHostValue;
  actions?: ReactNode;
  rightPane?: boolean;
  isVirtualized: boolean;
  testIds: TestIds;
  /** Filled with a function that scrolls the active host back to the top of the table. */
  scrollToTopRef?: RefObject<(() => void) | undefined>;
  children: ReactNode;
};

/** Places a table and its actions in the active modal, document-scroll, or nested-scroll host. */
export function GridTableLayoutHost(props: GridTableLayoutHostProps) {
  const { host, actions, rightPane, isVirtualized, testIds, scrollToTopRef, children } = props;
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const tableActionsRef = useRef<HTMLDivElement>(null);
  const hasActions = actions !== undefined;
  const { scrollableEl } = useScrollableParent();
  const modalScrollEl = host.kind === "modal" ? host.scrollEl : undefined;

  useSetTableActionsHeight(tableWrapperRef, tableActionsRef, host.kind !== "scrollable-parent" && hasActions);

  useImperativeHandle(
    scrollToTopRef,
    () => () => {
      // Each scroll is vertical-only, so a horizontally-scrolled table keeps its place.
      const wrapper = tableWrapperRef.current;
      if (!wrapper) return;
      // ScrollableContent portals the table into ScrollableParent's scroller, below the pinned actions.
      const scroller = host.kind === "scrollable-parent" ? scrollableEl?.parentElement : undefined;
      if (scroller) {
        scroller.scrollTo?.({ top: 0, behavior: "smooth" });
      } else if (host.kind === "modal") {
        // The modal body scrolls the whole wrapper, and its actions pin to the body's top edge.
        const top = wrapper.getBoundingClientRect().top - (modalScrollEl?.getBoundingClientRect().top ?? 0);
        modalScrollEl?.scrollBy?.({ top, behavior: "smooth" });
      } else {
        // The document scrolls the whole wrapper; land it below the pinned nav and page header, where the actions stick.
        const top = wrapper.getBoundingClientRect().top - stickyNavAndHeaderOffsetPx(wrapper);
        window.scrollBy({ top, behavior: "smooth" });
      }
    },
    [host.kind, scrollableEl, modalScrollEl],
  );

  const shared = { actions, tableWrapperRef, tableActionsRef, testIds, children };
  if (host.kind === "modal") return <ModalHost {...shared} host={host} />;
  if (host.kind === "document-scroll") return <DocumentScrollHost {...shared} rightPane={rightPane} />;
  return <ScrollableParentHost {...shared} isVirtualized={isVirtualized} />;
}

type HostProps = {
  actions?: ReactNode;
  tableWrapperRef: RefObject<HTMLDivElement | null>;
  tableActionsRef: RefObject<HTMLDivElement | null>;
  testIds: TestIds;
  children: ReactNode;
};

function ModalHost(props: HostProps & { host: Extract<GridTableLayoutHostValue, { kind: "modal" }> }) {
  const { host, actions, tableWrapperRef, tableActionsRef, testIds, children } = props;
  return (
    <ModalFullBleed omitPadding>
      <div ref={tableWrapperRef} {...testIds.tableWrapper}>
        {/* Wider than the modal when the columns are, so sticky actions have a box to hold in. */}
        <div css={Css.wmaxc.mw100.$}>
          <ActionsBar
            actionsRef={tableActionsRef}
            xss={{
              ...Css.sticky.top0.left0.w("100cqw").z(zIndices.tableActions).bgColor(Tokens.Surface).$,
              ...modalBodyPaddingX,
            }}
            testIds={testIds}
          >
            {actions}
          </ActionsBar>
          {/* The modal body scrolls, so virtual tables need its element and visible width instead of ScrollableContent. */}
          <VirtualizedScrollParentProvider element={host.scrollEl} viewportWidth={host.scrollViewportWidth}>
            {children}
          </VirtualizedScrollParentProvider>
        </div>
      </div>
    </ModalFullBleed>
  );
}

function DocumentScrollHost(props: HostProps & { rightPane?: boolean }) {
  const { actions, rightPane, tableWrapperRef, tableActionsRef, testIds, children } = props;
  const tableBody = rightPane ? (
    <DocumentScrollOverlayRightPaneLayout>
      {/* Content floor while the pane is open — tables are not a CenteredLayout shell. */}
      <div css={Css.mw(documentScrollRightPaneContentMinCss()).$}>{children}</div>
    </DocumentScrollOverlayRightPaneLayout>
  ) : (
    children
  );

  return (
    <div
      ref={tableWrapperRef}
      css={Css.df.fdc.wfc.mw100.$}
      {...(actions !== undefined ? selfTopSpaced : {})}
      {...testIds.tableWrapper}
    >
      <ActionsBar
        actionsRef={tableActionsRef}
        xss={
          Css.transitionTop.sticky
            .top(stickyNavAndHeaderOffset())
            .left(documentScrollChromeLeft())
            .w(`min(100%, ${documentScrollChromeWidth()})`)
            // Keep wide filter rows/pills from sizing the `wfc` wrapper (and stretching card view); they wrap or scroll instead.
            .add("contain", "inline-size")
            .z(zIndices.tableActions)
            .bgColor(Tokens.Surface).$
        }
        testIds={testIds}
      >
        {actions}
      </ActionsBar>
      {/* Scope the pane to the table only — actions stay outside so they remain full-bleed sticky chrome. */}
      {tableBody}
    </div>
  );
}

function ScrollableParentHost(props: HostProps & { isVirtualized: boolean }) {
  const { actions, isVirtualized, tableWrapperRef, tableActionsRef, testIds, children } = props;
  return (
    <div
      ref={tableWrapperRef}
      css={Css.df.fdc.$}
      {...(actions !== undefined ? selfTopSpaced : {})}
      {...testIds.tableWrapper}
    >
      <ActionsBar actionsRef={tableActionsRef} testIds={testIds}>
        {actions}
      </ActionsBar>
      <ScrollableContent virtualized={isVirtualized}>{children}</ScrollableContent>
    </div>
  );
}

type ActionsBarProps = {
  actionsRef: RefObject<HTMLDivElement | null>;
  xss?: Properties;
  testIds: TestIds;
  children?: ReactNode;
};

function ActionsBar({ actionsRef, xss, testIds, children }: ActionsBarProps) {
  if (children === undefined) return null;
  return (
    <div ref={actionsRef} css={xss} {...testIds.stickyContent}>
      {children}
    </div>
  );
}

/** Sets the actions height on the table wrapper so sticky descendants can read it without re-rendering. */
function useSetTableActionsHeight(
  tableWrapperRef: RefObject<HTMLElement | null>,
  tableActionsRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const syncHeightVar = useCallback(() => {
    const tableWrapper = tableWrapperRef.current;
    if (!tableWrapper) return;

    if (!enabled) {
      tableWrapper.style.removeProperty(beamTableActionsHeightVar);
      return;
    }

    const height = tableActionsRef.current ? Math.round(tableActionsRef.current.getBoundingClientRect().height) : 0;
    if (height > 0) {
      tableWrapper.style.setProperty(beamTableActionsHeightVar, `${height}px`);
    } else {
      tableWrapper.style.removeProperty(beamTableActionsHeightVar);
    }
  }, [enabled, tableActionsRef, tableWrapperRef]);

  useResizeObserver({ ref: tableActionsRef, onResize: enabled ? syncHeightVar : noop });
  useLayoutEffect(() => {
    syncHeightVar();
    const tableWrapper = tableWrapperRef.current;
    return () => {
      tableWrapper?.style.removeProperty(beamTableActionsHeightVar);
    };
  }, [tableWrapperRef, syncHeightVar]);
}
