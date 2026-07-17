import { ReactNode } from "react";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

/** Structured empty state shown in place of a GridTable when there are no data rows. */
export type GridTableEmptyStateProps = {
  title?: string;
  description?: string;
  /** Optional CTAs, e.g. Clear Filters or Create buttons. */
  actions?: ReactNode;
};

export function GridTableEmptyState(props: GridTableEmptyStateProps) {
  const { title = "No results found", description, actions } = props;
  const tid = useTestIds(props, "gridTableEmptyState");

  return (
    <div css={Css.df.fdc.aic.py(12).gap2.$} {...tid}>
      <div css={Css.xl.$} {...tid.title}>
        {title}
      </div>
      {description && (
        <div css={Css.sm.color(Tokens.OnSurfaceMuted).$} {...tid.description}>
          {description}
        </div>
      )}
      {actions && <div {...tid.actions}>{actions}</div>}
    </div>
  );
}
