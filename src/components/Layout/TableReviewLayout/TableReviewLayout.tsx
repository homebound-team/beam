import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { GridDataRow } from "src/components/Table";
import { GridTable, GridTableProps } from "src/components/Table/GridTable";
import { GridTableXss, Kinded } from "src/components/Table/types";
import { Css, Only, Palette } from "src/Css";
import { useTestIds } from "src/utils";
import { QueryResult, QueryTable, QueryTableProps } from "../GridTableLayout/QueryTable";
import { HeaderBreadcrumb, PageHeaderBreadcrumbs } from "../PageHeaderBreadcrumbs";

type OmittedTableProps = "filter" | "stickyHeader" | "style" | "rows";
type BaseTableProps<R extends Kinded, X extends Only<GridTableXss, X>> = Omit<GridTableProps<R, X>, OmittedTableProps>;

type GridTablePropsWithRows<R extends Kinded, X extends Only<GridTableXss, X>> = BaseTableProps<R, X> & {
  rows: GridTableProps<R, X>["rows"];
  query?: never;
  createRows?: never;
};

type QueryTablePropsWithQuery<R extends Kinded, X extends Only<GridTableXss, X>, QData> = BaseTableProps<R, X> & {
  query: QueryResult<QData>;
  createRows: (data: QData | undefined) => GridDataRow<R>[];
  rows?: never;
};

function isGridTableProps<R extends Kinded, X extends Only<GridTableXss, X>, QData>(
  props: GridTablePropsWithRows<R, X> | QueryTablePropsWithQuery<R, X, QData>,
): props is GridTablePropsWithRows<R, X> {
  return "rows" in props;
}

const defaultRightPaneWidth = 450;

export type TableReviewLayoutProps<R extends Kinded, X extends Only<GridTableXss, X>, QData> = {
  pageTitle: ReactNode;
  breadcrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
  /** Instructional text rendered below the title, above the table. */
  description: ReactNode;
  closeAction: VoidFunction;
  tableProps: GridTablePropsWithRows<R, X> | QueryTablePropsWithQuery<R, X, QData>;
  /** When set, renders the panel column alongside the table. Caller owns this state. */
  panelContent?: ReactNode;
  onClosePanel?: VoidFunction;
  rightPaneWidth?: number;
};

export function TableReviewLayout<R extends Kinded, X extends Only<GridTableXss, X>, QData>(
  props: TableReviewLayoutProps<R, X, QData>,
) {
  const {
    pageTitle,
    breadcrumb,
    description,
    closeAction,
    tableProps,
    panelContent,
    onClosePanel,
    rightPaneWidth = defaultRightPaneWidth,
  } = props;
  const tid = useTestIds(props, "tableReviewLayout");

  return (
    <div css={Css.fixed.top0.bottom0.left0.right0.z(1000).bgWhite.df.fdc.$} {...tid}>
      <header css={Css.px3.pt3.pb2.fs0.$} {...tid.header}>
        <div css={Css.df.jcsb.aic.$}>
          <div>
            {breadcrumb && <PageHeaderBreadcrumbs breadcrumb={breadcrumb} />}
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

      <div css={Css.fg1.df.$} {...tid.content}>
        {/* Table column — mr4 when panel is open keeps the scrollbar from reaching the panel border */}
        <div css={{ ...Css.fg1.h100.oya.pl3.mr3.$, ...Css.if(!!panelContent).mr4.$ }}>
          {isGridTableProps(tableProps) ? (
            <GridTable {...tableProps} style={{ allWhite: true }} stickyHeader disableColumnResizing={false} />
          ) : (
            <QueryTable
              {...(tableProps as QueryTableProps<R, QData, X>)}
              style={{ allWhite: true }}
              stickyHeader
              disableColumnResizing={false}
            />
          )}
        </div>

        {/* Panel column — no overflow:hidden on the motion.div so the close button can sit on the border */}
        <AnimatePresence>
          {panelContent && (
            <motion.div
              key="panel"
              initial={{ width: 0 }}
              animate={{ width: rightPaneWidth }}
              exit={{ width: 0 }}
              transition={{ ease: "linear", duration: 0.2 }}
              css={Css.h100.fs0.relative.$}
            >
              {/* Close button + vertical line — negative top pulls it up into the header description row */}
              <div css={Css.absolute.topPx(-32).df.fdc.aic.leftPx(-24).z1.$}>
                <IconButton bgColor={Palette.White} circle icon="x" inc={3.5} onClick={onClosePanel ?? (() => {})} />
                <div css={Css.wPx(1).bgGray300.mt1.$} style={{ height: "100vh" }} />
              </div>
              {/* Panel content — overflow:hidden here clips to animated width */}
              <div css={Css.h100.oh.$}>{panelContent}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
