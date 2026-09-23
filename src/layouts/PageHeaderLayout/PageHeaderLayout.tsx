import { type CSSProperties, type ReactNode, useCallback, useMemo, useRef } from "react";
import type { BannerProps } from "src/components/Banner";
import { PageHeader, type PageHeaderProps } from "src/components/Headers/PageHeader";
import type { TabsContentXss } from "src/components/Tabs";
import { Css, type Only } from "src/Css";
import { PageBannerSlot } from "src/layouts/PageBannerSlot";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import {
  bannerAndNavbarChromeTop,
  beamPageBannerHeightVar,
  beamPageHeaderLayoutHeightVar,
  documentScrollChromeLeft,
  documentScrollChromeWidth,
} from "../layoutVars";
import { useAutoHideOnScroll } from "../useAutoHideOnScroll";
import { useBannerAndNavbarHeight } from "../useBannerAndNavbarHeight";
import { useMeasuredHeight } from "../useMeasuredHeight";

export type PageHeaderLayoutProps<V extends string, X> = {
  /** Props for the {@link PageHeader} rendered as the page-level header. */
  pageHeader: PageHeaderProps<V, X>;
  /** Stay-pinned status banner under the header. Does not auto-hide with the page header. */
  banner?: BannerProps;
  /** Slot: main page body (tables, forms, etc.). */
  children?: ReactNode;
};

/** Page header + body shell with auto-hide chrome. Contract: `docs/layouts.md`. */
export function PageHeaderLayout<V extends string, X extends Only<TabsContentXss, X>>(
  props: PageHeaderLayoutProps<V, X>,
) {
  const { pageHeader, banner, children } = props;
  const tid = useTestIds(props, "pageHeaderLayout");

  // Ref mirrors context so the scroll handler avoids per-scroll getComputedStyle.
  const bannerAndNavbarHeight = useBannerAndNavbarHeight();
  const bannerAndNavbarHeightRef = useRef(bannerAndNavbarHeight);
  bannerAndNavbarHeightRef.current = bannerAndNavbarHeight;
  const getBannerAndNavbarHeight = useCallback(() => bannerAndNavbarHeightRef.current, []);

  const headerMetricsRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMeasuredHeight(headerMetricsRef, true);

  const bannerMetricsRef = useRef<HTMLDivElement>(null);
  const bannerHeight = useMeasuredHeight(bannerMetricsRef, banner != null);

  const { state: autoHideState } = useAutoHideOnScroll(spacerRef, true, getBannerAndNavbarHeight);
  // The header is fixed at `outerTop` unless hidden.
  const headerOccupiesPosition = autoHideState !== "hidden";

  const cssVars: Record<string, string> = {};
  if (headerHeight > 0 && headerOccupiesPosition) {
    cssVars[beamPageHeaderLayoutHeightVar] = `${headerHeight}px`;
  }
  if (banner != null && bannerHeight > 0) {
    cssVars[beamPageBannerHeightVar] = `${bannerHeight}px`;
  }
  const style = Object.keys(cssVars).length > 0 ? cssVars : undefined;

  const headerLeft = documentScrollChromeLeft();
  const headerWidth = documentScrollChromeWidth();
  const outerTop = bannerAndNavbarChromeTop();

  // Always `fixed` so horizontal document scroll cannot move the header. `left`/`width` use the
  // chrome var (jumps on nav toggle) — `transitionAll` eases them with the rail (200ms).
  const innerCss = Css.fixed.left(headerLeft).w(headerWidth).z(zIndices.pageStickyHeader).transitionAll.$;
  const innerStyle: CSSProperties = {
    top: autoHideState === "hidden" ? `calc(${outerTop} - ${headerHeight}px)` : outerTop,
  };

  const pageHeaderEl = useMemo(() => <PageHeader {...pageHeader} />, [pageHeader]);

  return (
    <DocumentScrollLayoutProvider>
      <div css={Css.df.fdc.w100.$} style={style} {...tid}>
        {/* Spacer reserves height when inner flips to fixed. */}
        <div ref={spacerRef} css={Css.fs0.w100.$} style={{ height: headerHeight }}>
          <div ref={headerMetricsRef} css={innerCss} style={innerStyle} {...tid.pageHeader}>
            {pageHeaderEl}
          </div>
        </div>
        {banner && <PageBannerSlot {...tid} banner={banner} metricsRef={bannerMetricsRef} />}
        <div css={Css.df.fdc.fg1.mh0.w100.$} {...tid.body}>
          {children}
        </div>
      </div>
    </DocumentScrollLayoutProvider>
  );
}
