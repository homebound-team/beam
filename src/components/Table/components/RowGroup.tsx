import { Fragment, ReactNode } from "react";
import { BorderHoverParent, rowHoverBgVar, RowHoverClass } from "src/components/Table/components/Row";
import { GridStyle, tableRowPrintBreakCss } from "src/components/Table/TableStyles";
import type { RenderAs } from "src/components/Table/types";
import { Css, maybeCssVar, Tokens } from "src/Css";

type RowGroupProps = {
  as: RenderAs;
  /** Skip the tbody wrapper when rows render inside `<thead>` (e.g. pinned table rows). */
  inHead?: boolean;
  showRowHover?: boolean;
  style: GridStyle;
  children: ReactNode;
};

/** Groups a data row and optional companion as one table/list unit. */
export function RowGroup(props: RowGroupProps) {
  const { as, inHead = false, showRowHover = false, style, children } = props;

  if (as === "table" && inHead) {
    // Pinned rows in `as="table"` live in `<thead>` — emit a fragment, not `<tbody>`.
    return <Fragment>{children}</Fragment>;
  }

  const Tag = as === "table" ? "tbody" : "div";
  const rowHoverBg: string = maybeCssVar(
    style.rowHoverColor !== undefined && style.rowHoverColor !== "none" ? style.rowHoverColor : Tokens.SurfaceHover,
  );

  return (
    <Tag
      css={{
        ...(as === "table" ? tableRowPrintBreakCss : undefined),
        ...(showRowHover && Css.style({ [rowHoverBgVar]: rowHoverBg }).$),
      }}
      className={showRowHover ? `${BorderHoverParent} ${RowHoverClass}` : BorderHoverParent}
    >
      {children}
    </Tag>
  );
}
