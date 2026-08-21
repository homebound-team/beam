import { ReactNode } from "react";
import { AutoSaveIndicator } from "src/components/AutoSaveIndicator";
import { HeaderAction, HeaderActions } from "src/components/Headers/HeaderActions";
import { Css, Only, Padding, Tokens, Xss } from "src/Css";
import { useTestIds } from "src/utils";

type ContentHeaderXss = Xss<Padding>;

export type ContentHeaderLevel = 2 | 3 | 4;

export type ContentHeaderProps<X = ContentHeaderXss> = {
  title?: string;
  description?: ReactNode;
  actions?: HeaderAction[];
  /** When true, prepends `AutoSaveIndicator` in the actions area. */
  withAutoSave?: boolean;
  /** Heading tag and size. `2` = `h2`/`xl` (default); `3` = `h3`/`lg`; `4` = `h4`/`mdSb`. Never `h1`. */
  level?: ContentHeaderLevel;
  /** Rendered before the title, e.g. a drag handle on `FormSectionChild`. */
  startAdornment?: ReactNode;
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
 *
 * Apply horizontal inset via `xss` when the header should align with padded body content; omit for
 * full-bleed within the page column. `layoutContainer` honors `--beam-layout-content-padding-x`
 * from padded ancestors (e.g. {@link CenteredLayout}).
 */
export function ContentHeader<X extends Only<ContentHeaderXss, X>>(props: ContentHeaderProps<X>) {
  const { title, description, actions, withAutoSave, level = 2, startAdornment, xss } = props;
  const tid = useTestIds(props, "contentHeader");
  const { tag: Heading, css: headingCss } = headingByLevel[level];

  if (!title && !description && !actions && !withAutoSave) {
    return null;
  }

  const descriptionEl = description && (
    <div css={Css.sm.color(Tokens.OnSurface).$} {...tid.description}>
      {description}
    </div>
  );

  return (
    <div
      css={{
        ...Css.df.fdc.gapPx(12).layoutContainer.mw0.bgColor(Tokens.Surface).$,
        ...xss,
      }}
      {...tid}
    >
      <div css={Css.df.aic.jcsb.mw0.$}>
        {title ? (
          <div css={Css.df.aic.gap1.mw0.$}>
            {startAdornment}
            <Heading css={headingCss} {...tid.title}>
              {title}
            </Heading>
          </div>
        ) : (
          descriptionEl
        )}
        {(withAutoSave || actions) && (
          <div css={Css.df.gap1.fs0.$} {...tid.actions}>
            {withAutoSave && <AutoSaveIndicator />}
            {actions && <HeaderActions actions={actions} />}
          </div>
        )}
      </div>
      {title && descriptionEl}
    </div>
  );
}

const headingByLevel = {
  2: { tag: "h2", css: Css.xl.$ },
  3: { tag: "h3", css: Css.lg.$ },
  4: { tag: "h4", css: Css.mdSb.$ },
} as const;
