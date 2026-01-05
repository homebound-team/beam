import { ReactNode } from "react";
import { Css, Margin, Only, Xss } from "src/Css";

type TableActionsXss = Xss<Margin>;

interface TableActionsProps<X> {
  xss?: X;
  children: ReactNode;
  /** Content pinned to the right (e.g., column picker). */
  right?: ReactNode;
}

/** Provides layout and spacing for actions above a table (Filters, Search, EditColumns, etc.) */
export function TableActions<X extends Only<TableActionsXss, X>>(props: TableActionsProps<X>) {
  const { xss, children, right } = props;
  return (
    <div css={{ ...Css.df.gap1.aic.jcsb.aifs.pb2.$, ...xss }}>
      <div css={Css.df.gap1.aic.fww.$}>{children}</div>
      {right}
    </div>
  );
}
