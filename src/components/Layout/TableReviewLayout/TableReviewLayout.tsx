import { AnimatePresence, motion } from "framer-motion";
import React, { ReactNode, useEffect, useState } from "react";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { GridTable } from "src/components/Table/GridTable";
import { GridTableXss, Kinded } from "src/components/Table/types";
import { Css, Only, Palette } from "src/Css";
import { useTestIds } from "src/utils";
import { QueryTable, QueryTableProps } from "../GridTableLayout/QueryTable";
import {
  GridTablePropsWithRows,
  isGridTableProps,
  BaseQueryTableProps as QueryTablePropsWithQuery,
} from "../layoutTypes";
import { HeaderBreadcrumb, PageHeaderBreadcrumbs } from "../PageHeaderBreadcrumbs";

const defaultRightPaneWidth = 450;

export type TableReviewLayoutProps<R extends Kinded, X extends Only<GridTableXss, X>, QData> = {
  pageTitle: ReactNode;
  breadCrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
  /** Instructional text rendered below the title, above the table. */
  description: ReactNode;
  closeAction: VoidFunction;
  tableProps: GridTablePropsWithRows<R, X> | QueryTablePropsWithQuery<R, X, QData>;
  /**
   * Replaces the table region with centered content.
   *
   * For rows-based tables: shown automatically when `tableProps.rows` contains no data rows.
   * For query-based tables: shown whenever defined
   */
  emptyState?: ReactNode;
  /**
   * Content to render in the slide-in panel column. Renders when defined.
   */
  panelContent?: ReactNode;
  onPanelClose?: VoidFunction;
  /** Defaults to 450. */
  rightPaneWidth?: number;
};

function TableReviewLayoutComponent<R extends Kinded, X extends Only<GridTableXss, X>, QData>(
  props: TableReviewLayoutProps<R, X, QData>,
) {
  const {
    pageTitle,
    breadCrumb,
    description,
    closeAction,
    tableProps,
    emptyState,
    panelContent,
    onPanelClose,
    rightPaneWidth = defaultRightPaneWidth,
  } = props;
  const tid = useTestIds(props, "tableReviewLayout");

  const [isPanelVisible, setIsPanelVisible] = useState(!!panelContent);

  // Open when new content arrives; close when content is cleared by the caller.
  useEffect(() => {
    setIsPanelVisible(!!panelContent);
  }, [panelContent]);

  function handleClosePanel() {
    setIsPanelVisible(false);
    onPanelClose?.();
  }

  let tableContent: ReactNode;
  if (isGridTableProps(tableProps)) {
    // For rows-based tables: show emptyState when no data rows exist and emptyState is provided;
    // otherwise let GridTable render its own fallback.
    if (emptyState && !tableProps.rows.some((r) => r.kind !== "header")) {
      tableContent = <div css={Css.h100.df.fdc.aic.jcc.$}>{emptyState}</div>;
    } else {
      tableContent = <GridTable {...tableProps} style={{ allWhite: true }} stickyHeader />;
    }
  } else if (emptyState) {
    // For query-based tables: caller owns the decision on when to show emptyState.
    // NOTE: This is more of a workaround until we get an `emptyState` prop into GridTable
    // that works as a successor to `fallbackMessage`.
    tableContent = <div css={Css.h100.df.fdc.aic.jcc.$}>{emptyState}</div>;
  } else {
    tableContent = (
      <QueryTable {...(tableProps as QueryTableProps<R, QData, X>)} style={{ allWhite: true }} stickyHeader />
    );
  }

  return (
    <div css={Css.fixed.top0.bottom0.left0.right0.z(1000).bgWhite.df.fdc.$} {...tid}>
      <header css={Css.px3.pt3.pb2.fs0.$} {...tid.header}>
        <div css={Css.df.jcsb.aic.$}>
          <div>
            {breadCrumb && <PageHeaderBreadcrumbs breadcrumb={breadCrumb} />}
            <h1 css={Css.xl2.mt1.mb0.$} {...tid.pageTitle}>
              {pageTitle}
            </h1>
          </div>
          <Button label="Close" onClick={closeAction} {...tid.closeButton} />
        </div>
        <div css={Css.sm.gray700.mt2.$} {...tid.description}>
          {description}
        </div>
      </header>
      <div css={Css.fg1.df.mh0.$} {...tid.content}>
        {/* Table column — margin instead of padding to keep table from touching panel border */}
        <div css={{ ...Css.fg1.oya.pl3.mr3.$, ...Css.if(!!panelContent).mr4.$ }}>{tableContent}</div>
        {/* Panel column */}
        <AnimatePresence>
          {isPanelVisible && panelContent && (
            <motion.div
              key="panel"
              initial={{ width: 0 }}
              animate={{ width: rightPaneWidth }}
              exit={{ width: 0 }}
              transition={{ ease: "linear", duration: 0.2 }}
              css={Css.df.fdc.fs0.relative.$}
            >
              {/* Close button + vertical line — negative top pulls it up into the header description row */}
              <div css={Css.absolute.topPx(-32).df.fdc.aic.leftPx(-24).z1.$}>
                <IconButton
                  bgColor={Palette.White}
                  circle
                  icon="x"
                  inc={3.5}
                  onClick={handleClosePanel}
                  {...tid.closePanelButton}
                />
                <div css={Css.wPx(1).bgGray300.vh100.$} />
              </div>
              {/* Panel content */}
              <div css={Css.fg1.oh.mh0.$}>{panelContent}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const TableReviewLayout = React.memo(TableReviewLayoutComponent) as typeof TableReviewLayoutComponent;
