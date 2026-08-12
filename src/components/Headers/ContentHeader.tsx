import { ReactNode } from "react";
import { HeaderAction, HeaderActions } from "src/components/Headers/HeaderActions";
import { Css, Only, Padding, Tokens, Xss } from "src/Css";
import { useTestIds } from "src/utils";

type ContentHeaderXss = Xss<Padding>;

export type ContentHeaderProps<X = ContentHeaderXss> = {
  title?: string;
  description?: ReactNode;
  actions?: HeaderAction[];
  /** Style overrides for padding. */
  xss?: X;
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
export function ContentHeader<X extends Only<ContentHeaderXss, X>>(props: ContentHeaderProps<X>) {
  const { title, description, actions, xss } = props;
  const tid = useTestIds(props, "contentHeader");

  if (!title && !description && !actions) {
    return null;
  }

  const descriptionEl = description && (
    <div css={Css.sm.color(Tokens.OnSurface).$} {...tid.description}>
      {description}
    </div>
  );

  return (
    <div css={{ ...Css.df.fdc.gapPx(12).layoutContainer.bgColor(Tokens.Surface).$, ...xss }} {...tid}>
      <div css={Css.df.aic.jcsb.mw0.$}>
        {title ? (
          <h2 css={Css.xl.$} {...tid.title}>
            {title}
          </h2>
        ) : (
          descriptionEl
        )}
        {actions && <HeaderActions actions={actions} {...tid.actions} />}
      </div>
      {title && descriptionEl}
    </div>
  );
}
