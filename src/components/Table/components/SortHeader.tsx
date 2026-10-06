import { type ReactNode, useCallback, useContext } from "react";
import { Icon } from "src/components/Icon";
import { TableStateContext } from "src/components/Table/utils/TableState";
import { Css, type Properties, Tokens } from "src/Css";
import { useComputed } from "src/hooks/useComputed";
import { useHover } from "src/hooks/useHover";
import { useTestIds } from "src/utils/useTestIds";

type SortHeaderProps = {
  content: string;
  xss?: Properties;
  iconOnLeft?: boolean;
  sortKey: string;
  tooltipEl?: ReactNode;
};

/**
 * Sortable column header. GridTable uses it for string headers, or render it in a header cell yourself.
 * `iconOnLeft` puts the sort icon before the label.
 */
export function SortHeader(props: SortHeaderProps) {
  const { content, xss, iconOnLeft = false, sortKey, tooltipEl } = props;
  const { isHovered, hoverProps } = useHover({});
  const { tableState } = useContext(TableStateContext);
  const current = useComputed(() => tableState.sortState?.current, [tableState]);
  const sorted = sortKey === current?.columnId ? current?.direction : undefined;
  const toggleSort = useCallback(() => tableState.setSortKey(sortKey), [sortKey, tableState]);
  const sortVisible = isHovered || sorted !== undefined;

  const tid = useTestIds(props, "sortHeader");

  const sortButton = (
    <button
      type="button"
      aria-label={`Sort ${content}`}
      tabIndex={-1}
      aria-hidden
      onClick={toggleSort}
      css={Css.bn.bgTransparent.p0.fs0.df.aic.lh(0).h100.outline(0).onFocusVisible.bshFocus.$}
    >
      <Icon
        icon={sorted === "DESC" ? "sortDown" : "sortUp"}
        color={sorted !== undefined ? Tokens.TextLinkDefault : Tokens.TextDisabled}
        xss={{
          ...Css.ml1.if(iconOnLeft).mr1.ml0.$,
          ...Css.visibility("hidden").if(sortVisible).visibility("visible").$,
        }}
        inc={2}
        {...tid.icon}
      />
    </button>
  );
  return (
    <div css={{ ...Css.df.aic.h100.usn.mw0.$, ...xss }} {...hoverProps}>
      {iconOnLeft && sortButton}
      <button
        type="button"
        {...tid}
        onClick={toggleSort}
        css={
          // min-content, not 0: the sort icon doesn't shrink, and a 0 floor collapses the name.
          Css.bn.bgTransparent.p0.mwminc.cursorPointer
            .ta("inherit")
            .fw("inherit")
            .color("inherit")
            .usn.df.aic.h100.outline(0).onFocusVisible.bshFocus.$
        }
      >
        <span css={Css.lineClamp2.mwminc.$}>{content}</span>
      </button>
      {tooltipEl}
      {!iconOnLeft && sortButton}
    </div>
  );
}
