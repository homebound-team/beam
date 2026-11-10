import { type ReactNode, useMemo, useRef } from "react";
import { PageHeader, type PageHeaderProps } from "src/components/Headers/PageHeader";
import type { PageBannerProps } from "src/components/StatusBanner/StatusBanner";
import type { TabsContentXss } from "src/components/Tabs";
import { Css, type Only } from "src/Css";
import { usePageBannerSlot } from "src/layouts/PageBanner/internal/usePageBannerSlot";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import { useEnvironmentBannerLayoutHeight } from "../EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import {
  beamPageBannerHeightVar,
  beamPageHeaderLayoutHeightVar,
  belowNavbarOffset,
  documentScrollChromeLeft,
  documentScrollChromeWidth,
} from "../layoutVars";
import { readNavbarVisibleHeight } from "../NavbarLayout/navbarVisibleHeight";
import { useMeasuredHeight } from "../useMeasuredHeight";
import { useScrollWithPage } from "../useScrollWithPage";

export type PageHeaderLayoutProps<V extends string, X> = {
  /** Props for the {@link PageHeader} rendered as the page-level header. */
  pageHeader: PageHeaderProps<V, X>;
  /** Stay-pinned status banner under the header. A descendant's `usePageBanner` takes precedence. */
  banner?: PageBannerProps;
  /** Slot: main page body (tables, forms, etc.). */
  children?: ReactNode;
};

/** Page header + body shell. The header scrolls with the page, then hides and reveals. Contract: `docs/layouts.md`. */
export function PageHeaderLayout<V extends string, X extends Only<TabsContentXss, X>>(
  props: PageHeaderLayoutProps<V, X>,
) {
  const { pageHeader, banner: bannerProp, children } = props;
  const tid = useTestIds(props, "pageHeaderLayout");
  const { slot: bannerSlot, height: bannerHeight } = usePageBannerSlot(bannerProp, tid);
  const environmentBannerHeight = useEnvironmentBannerLayoutHeight();

  const heightElRef = useRef<HTMLDivElement>(null);
  const fixedElRef = useRef<HTMLDivElement>(null);
  const reserveElRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMeasuredHeight(fixedElRef, true);

  useScrollWithPage({
    heightElRef,
    fixedElRef,
    reserveElRef,
    height: headerHeight,
    restingTop: belowNavbarOffset(),
    heightVar: beamPageHeaderLayoutHeightVar,
    getReserveRestTop: () => environmentBannerHeight + readNavbarVisibleHeight(),
  });

  // The header height var is written by the scroll hook. The banner height is not.
  const style: Record<string, string> | undefined =
    bannerHeight > 0 ? { [beamPageBannerHeightVar]: `${bannerHeight}px` } : undefined;

  // Always `fixed` so horizontal document scroll cannot move the header. `left`/`width` use the
  // chrome var (jumps on nav toggle while resting or following).
  // `top` is written by the scroll hook, so a re-render does not snap it back.
  const innerCss = Css.fixed
    .left(documentScrollChromeLeft())
    .w(documentScrollChromeWidth())
    .z(zIndices.pageStickyHeader).$;

  const pageHeaderEl = useMemo(() => <PageHeader {...pageHeader} />, [pageHeader]);

  return (
    <DocumentScrollLayoutProvider>
      <div ref={heightElRef} css={Css.df.fdc.w100.$} style={style} {...tid}>
        {/* Keeps the header's space in the flow while the header is fixed. */}
        <div ref={reserveElRef} css={Css.fs0.w100.$} style={{ height: headerHeight }}>
          <div ref={fixedElRef} css={innerCss} {...tid.pageHeader}>
            {pageHeaderEl}
          </div>
        </div>
        {bannerSlot}
        {/* Pads the body's top, unless its first child pads its own top edge (`selfTopSpaced`). */}
        <div css={Css.df.fdc.fg1.mh0.w100.when(":not(:has(> [data-self-top-spaced]:first-child))").pt3.$} {...tid.body}>
          {children}
        </div>
      </div>
    </DocumentScrollLayoutProvider>
  );
}
