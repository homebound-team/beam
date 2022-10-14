import { ReactNode } from "react";
import { Css, Margin, Only, Xss } from "src/Css";

type TableActionsXss = Xss<Margin>;

interface TableActionsProps<X> {
  xss?: X;
  children: ReactNode;
  onlyLeft?: boolean;
  onlyRight?: boolean;
}

/** Provides default spacing for Actions sitting above a table (Filters, Search, etc...) */
export function TableActions<X extends Only<TableActionsXss, X>>(props: TableActionsProps<X>) {
  const { xss, children, onlyLeft, onlyRight } = props;
  const alignmentStyles = onlyLeft ? Css.jcfs.$ : onlyRight ? Css.jcfe.$ : Css.jcsb.$;
  return <div css={{ ...Css.df.aic.pb2.gap1.$, ...xss, ...alignmentStyles }}>{children}</div>;
}
