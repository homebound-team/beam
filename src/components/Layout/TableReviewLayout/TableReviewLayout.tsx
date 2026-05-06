import { ReactNode } from "react";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import { HeaderBreadcrumb, PageHeaderBreadcrumbs } from "../PageHeaderBreadcrumbs";

export type TableReviewLayoutProps = {
  pageTitle: ReactNode;
  breadcrumb?: HeaderBreadcrumb | HeaderBreadcrumb[];
  /** Instructional text rendered below the title, above the table. */
  description: ReactNode;
  closeAction: VoidFunction;
  /** When set, renders the panel column alongside the table. Caller owns this state. */
  panelContent?: ReactNode;
  onClosePanel?: VoidFunction;
};

export function TableReviewLayout(props: TableReviewLayoutProps) {
  const { pageTitle, breadcrumb, description, closeAction } = props;
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
      <div css={Css.fg1.oh.df.$} {...tid.content}>
        {/* Table + panel column — Step 3 */}
      </div>
    </div>
  );
}
