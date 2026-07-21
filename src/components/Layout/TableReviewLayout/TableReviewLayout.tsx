import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { GridTable } from "src/components/Table/GridTable";
import { GridTableXss, Kinded } from "src/components/Table/types";
import { Css, Only, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { Toast } from "../../Toast/Toast";
import { QueryTable, QueryTableProps } from "../GridTableLayout/QueryTable";
import { ActionButtonProps, BaseQueryTableProps, GridTablePropsWithRows, isGridTableProps } from "../layoutTypes";
import { HeaderBreadcrumb, PageHeaderBreadcrumbs } from "../PageHeaderBreadcrumbs";
import { SidePanel } from "./SidePanel";

const defaultRightPaneWidth = 450;

export type SidePanelProps = {
  title: ReactNode;
  content: ReactNode;
  primaryAction?: ActionButtonProps;
  secondaryAction?: ActionButtonProps;
};

export type TableReviewLayoutProps<R extends Kinded, X extends Only<GridTableXss, X>, QData> = {
  pageTitle: ReactNode;
  breadCrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
  /** Instructional text rendered below the title, above the table. */
  description: ReactNode;
  closeAction: VoidFunction;
  tableProps: GridTablePropsWithRows<R, X> | BaseQueryTableProps<R, X, QData>;
  /**
   * Replaces the table region with centered content.
   *
   * For rows-based tables: shown automatically when `tableProps.rows` contains no data rows.
   * For query-based tables: shown when prop is defined; TableReviewLayout does not peek into query results to determine if empty.
   */
  emptyState?: ReactNode;
  /**
   * When set, slides open the panel column and renders a `SidePanel` with the given props.
   */
  panelContent?: SidePanelProps;
  onPanelClose?: VoidFunction;
  /** Defaults to 450. */
  rightPaneWidth?: number;
};

export function TableReviewLayout<R extends Kinded, X extends Only<GridTableXss, X>, QData>(
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
      tableContent = <GridTable {...tableProps} style={{ allWhite: true, bordered: true }} stickyHeader />;
    }
  } else if (emptyState) {
    // For query-based tables: caller owns the decision on when to show emptyState.
    // NOTE: This is more of a workaround until we get an `emptyState` prop into GridTable
    // that works as a successor to `fallbackMessage`.
    tableContent = <div css={Css.h100.df.fdc.aic.jcc.$}>{emptyState}</div>;
  } else {
    tableContent = (
      <QueryTable
        {...(tableProps as QueryTableProps<R, QData, X>)}
        style={{ allWhite: true, bordered: true }}
        stickyHeader
      />
    );
  }

  return (
    <div css={Css.fixed.top0.bottom0.left0.right0.z(zIndices.pageOverlay).bgColor(Tokens.Surface).df.fdc.$} {...tid}>
      <header css={Css.px3.pt3.pb2.fs0.$} {...tid.header}>
        <Toast />
        <div css={Css.df.jcsb.aic.$}>
          <div>
            {breadCrumb && <PageHeaderBreadcrumbs breadcrumb={breadCrumb} />}
            <h1 css={Css.xl2.mt1.mb0.$} {...tid.pageTitle}>
              {pageTitle}
            </h1>
          </div>
          <Button label="Close" onClick={closeAction} {...tid.closeButton} />
        </div>
        <div css={Css.sm.color(Tokens.OnSurfaceMuted).mt2.$} {...tid.description}>
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
                  bgColor={Tokens.Surface}
                  variant="circle"
                  icon="x"
                  inc={3.5}
                  onClick={handleClosePanel}
                  {...tid.closePanelButton}
                />
                <div css={Css.wPx(1).bgColor(Tokens.FieldBorderDefault).vh100.$} />
              </div>
              {/* Panel content */}
              <div css={Css.fg1.oh.mh0.$}>
                <SidePanel {...panelContent} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
