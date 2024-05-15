import { GridColumnWithId, GridTableApi, Kinded, navLink, RenderAs, RowStyle, Tooltip } from "src/components";
import { Properties } from "src/Css";
import { MutableRefObject, ReactNode, RefObject, useCallback, useMemo, useRef, useState } from "react";
import { Css } from "src";
import { Link } from "react-router-dom";
import { maybeCall } from "src/utils";
import { MaxLines } from "src/components/MaxLines";
import { useResizeObserver } from "@react-aria/utils";

type BodyCellProps<R extends Kinded> = {
  as: RenderAs;
  cellCss: Properties;
  content: ReactNode;
  row: R;
  rowStyle: RowStyle<R> | undefined;
  classNames: string | undefined;
  onClick: VoidFunction | undefined;
  tooltip: ReactNode | undefined;
  colSpan: number;
  column: GridColumnWithId<R>;
  api: GridTableApi<R>;
  lineClamp: 1 | 2 | 3 | 4 | 5 | undefined;
  isFlexible: boolean;
};

export function BodyCell<R extends Kinded>(props: BodyCellProps<R>) {
  const {
    as,
    cellCss,
    content,
    classNames,
    onClick,
    colSpan,
    tooltip,
    row,
    rowStyle,
    column,
    api,
    lineClamp,
    isFlexible,
  } = props;

  // TODO: Handle kept rows to ensure we do not display Collapse Column.

  const Cell = as === "table" ? "td" : "div";
  const { wrapAction = true } = column;

  // if we have a rowLink, then we want to render an `a` tag instead of a `div`
  const rowLink = maybeCall(rowStyle?.rowLink, row);
  const ref = useRef<HTMLElement>(null);

  const cellContent = useMemo(
    () => (
      <AutoTruncateCell
        cellRef={ref}
        content={content}
        lineClamp={lineClamp}
        isFlexible={isFlexible}
        tooltip={tooltip}
      />
    ),
    [content, lineClamp, isFlexible, tooltip],
  );

  if (rowLink) {
    return as === "table" ? (
      <Cell css={{ ...cellCss }} className={classNames} colSpan={colSpan}>
        <Link to={rowLink} css={Css.noUnderline.color("unset").$} className={navLink}>
          {cellContent}
        </Link>
      </Cell>
    ) : (
      <Link
        to={rowLink}
        css={{ ...Css.noUnderline.color("unset").$, ...cellCss }}
        className={`${navLink} ${classNames}`}
      >
        {cellContent}
      </Link>
    );
  }

  return (
    <Cell
      ref={ref as RefObject<HTMLTableCellElement & HTMLDivElement>}
      css={{ ...cellCss }}
      data-imtheref={true}
      role="cell"
      className={classNames}
      onClick={() => {
        if (wrapAction !== false) {
          maybeCall(rowStyle?.onClick, row, api);
          maybeCall(onClick);
        }
      }}
      {...(as === "table" && { colSpan })}
    >
      {cellContent}
    </Cell>
  );
}

type AutoTruncateCellProps = {
  content: ReactNode;
  lineClamp: 1 | 2 | 3 | 4 | 5 | undefined;
  cellRef: MutableRefObject<HTMLElement | null>;
  isFlexible: boolean;
  tooltip: ReactNode | undefined;
};

/**
 * AutoTruncateCell will truncate the content if it overflows the container.
 * If `lineClamp` is set for a flexible row height cell, then use the MaxLines component to handle the truncation.
 * If the cell is not flexible, then use the AutoEllipsisTooltip to handle the truncation.
 * Otherwise, display the content as is.
 */
export function AutoTruncateCell({ content, lineClamp, cellRef, isFlexible, tooltip }: AutoTruncateCellProps) {
  return lineClamp && isFlexible ? (
    <div css={Css.df.$}>
      <MaxLines maxLines={lineClamp}>{content}</MaxLines>
      {tooltip}
    </div>
  ) : !isFlexible ? (
    <AutoEllipsisTooltip content={content} parentRef={cellRef} tooltip={tooltip} />
  ) : (
    <>
      {content}
      {tooltip}
    </>
  );
}

type AutoEllipsisCellProps = {
  content: ReactNode;
  parentRef: MutableRefObject<HTMLElement | null>;
  tooltip: ReactNode | undefined;
};

function AutoEllipsisTooltip({ content, parentRef, tooltip }: AutoEllipsisCellProps) {
  const [showEllipsis, setShowEllipsis] = useState(false);
  const childRef = useRef<HTMLDivElement>(null);

  const onResize = useCallback(() => {
    // We identify if the content is overflowing or not two different ways:
    // 1. If we are not showing the ellipsis, then we can compare just the parent container, as the `content` is a direct child of the parent.
    // 2. Otherwise, we are showing the ellipsis, so we compared the `overflow: hidden` element (childRef) containing the content against the parent's width
    // This is because of some trickery we do on our form field elements in the table, where we give them negative margins so the text content of the field is vertically aligned with other text in the column (i.e. headers)

    const el = parentRef.current;
    if (!el) return;
    // If we aren't showing the ellipsis, but we should be...
    if (!showEllipsis && el && el.scrollWidth > el.clientWidth) {
      setShowEllipsis(true);
    }

    const childEl = childRef.current;
    if (!childEl) return;
    // If we're showing the ellipsis, but we shouldn't be...
    if (showEllipsis && childEl.scrollWidth <= childEl.clientWidth) {
      setShowEllipsis(false);
    }
  }, [parentRef, showEllipsis]);
  useResizeObserver({ ref: parentRef, onResize });

  return (
    <div css={Css.df.aic.mw0.$}>
      <div css={Css.if(showEllipsis).overflowHidden.$} ref={childRef}>
        {content}
      </div>
      {showEllipsis && (
        <div css={Css.fs0.$} aria-hidden={true}>
          <Tooltip title={content} placement="top">
            &hellip;
          </Tooltip>
        </div>
      )}
      {tooltip}
    </div>
  );
}
