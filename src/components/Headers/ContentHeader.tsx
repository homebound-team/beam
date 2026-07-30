import { ReactNode } from "react";
import { Css, Tokens } from "src/Css";
import { documentScrollChromeLeft, documentScrollChromeWidth } from "src/layouts/layoutVars";
import { useTestIds } from "src/utils";

export type ContentHeaderProps = {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
};

/**
 * Generic title/description/actions header for content sections; stays visible while the page scrolls
 * horizontally, but scrolls away normally on the vertical axis.
 *
 * `position: sticky`'s horizontal offset is bounded by the element's containing block — unlike the
 * vertical axis (where a block's height naturally grows to fit all scrolled content), a block's width
 * does *not* grow to fit an overflowing sibling, so sticky has no "room" to operate unless something
 * gives it that room. If this sits above/beside content that overflows horizontally (e.g. a wide
 * table), wrap both in a shared container sized with `min-width: fit-content` (truss: `mw("fit-content")`)
 * so the containing block grows to match the full scrollable width — the same technique `GridTable`
 * uses internally for its own sticky columns (`src/components/Table/GridTable.tsx`).
 */
export function ContentHeader(props: ContentHeaderProps) {
  const { title, description, actions } = props;
  const tid = useTestIds(props, "contentHeader");

  return (
    <div
      css={Css.sticky.left(documentScrollChromeLeft()).w(documentScrollChromeWidth()).px3.df.jcsb.if(!title).aic.$}
      {...tid}
    >
      {(title || description) && (
        <div css={Css.df.fdc.gapPx(12).mw0.$}>
          {title && (
            <h2 css={Css.xl.$} {...tid.title}>
              {title}
            </h2>
          )}
          {description && (
            <div css={Css.sm.color(Tokens.OnSurface).$} {...tid.description}>
              {description}
            </div>
          )}
        </div>
      )}
      {actions && (
        <div css={Css.df.gap1.fs0.$} {...tid.actions}>
          {actions}
        </div>
      )}
    </div>
  );
}
