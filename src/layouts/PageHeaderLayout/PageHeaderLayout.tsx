import { CSSProperties, ReactNode, useCallback, useMemo, useRef } from "react";
import { PageHeader, PageHeaderProps } from "src/components/PageHeader";
import { TabsContentXss } from "src/components/Tabs";
import { Css, Only } from "src/Css";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { DocumentScrollLayoutProvider } from "../DocumentScrollLayoutContext";
import {
  bannerAndNavbarChromeTop,
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
  /** Slot: main page body (tables, forms, etc.). */
  children?: ReactNode;
};

/** Page header + body shell with auto-hide chrome. Contract: `docs/layouts.md`. */
export function PageHeaderLayout<V extends string, X extends Only<TabsContentXss, X>>(
  props: PageHeaderLayoutProps<V, X>,
) {
  const { pageHeader, children } = props;
  const tid = useTestIds(props, "pageHeaderLayout");

  // Ref mirrors context so the scroll handler avoids per-scroll getComputedStyle.
  const bannerAndNavbarHeight = useBannerAndNavbarHeight();
  const bannerAndNavbarHeightRef = useRef(bannerAndNavbarHeight);
  bannerAndNavbarHeightRef.current = bannerAndNavbarHeight;
  const getBannerAndNavbarHeight = useCallback(() => bannerAndNavbarHeightRef.current, []);

  const headerMetricsRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMeasuredHeight(headerMetricsRef, true);

  const { state: autoHideState, atTop } = useAutoHideOnScroll(spacerRef, true, getBannerAndNavbarHeight);
  const headerOccupiesPosition = autoHideState === "revealed" || atTop;

  const cssVars: Record<string, string> | undefined =
    headerHeight > 0 && headerOccupiesPosition ? { [beamPageHeaderLayoutHeightVar]: `${headerHeight}px` } : undefined;

  const headerLeft = documentScrollChromeLeft();
  const headerWidth = documentScrollChromeWidth();
  const outerTop = bannerAndNavbarChromeTop();

  const innerCss =
    autoHideState === "static"
      ? Css.sticky.left(headerLeft).w(headerWidth).z(zIndices.pageStickyHeader).$
      : Css.fixed.left(headerLeft).w(headerWidth).z(zIndices.pageStickyHeader).transitionTop.$;

  // Hidden top = revealed top minus headerHeight so the slide matches navbar lockstep.
  const innerStyle: CSSProperties | undefined =
    autoHideState !== "static"
      ? { top: autoHideState === "revealed" ? outerTop : `calc(${outerTop} - ${headerHeight}px)` }
      : undefined;

  const pageHeaderEl = useMemo(() => <PageHeader {...pageHeader} />, [pageHeader]);

  return (
    <DocumentScrollLayoutProvider>
      <div css={Css.df.fdc.w100.$} style={cssVars} {...tid}>
        {/* Spacer reserves height when inner flips to fixed. */}
        <div ref={spacerRef} css={Css.fs0.w100.$} style={{ height: headerHeight }}>
          <div ref={headerMetricsRef} css={innerCss} style={innerStyle} {...tid.pageHeader}>
            {pageHeaderEl}
          </div>
        </div>
        <div css={Css.df.fdc.fg1.mh0.w100.$} {...tid.body}>
          {children}
        </div>
      </div>
    </DocumentScrollLayoutProvider>
  );
}
