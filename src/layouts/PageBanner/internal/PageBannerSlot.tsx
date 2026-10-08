import type { RefObject } from "react";
import { StatusBanner, type PageBannerProps } from "src/components/StatusBanner/StatusBanner";
import { Css } from "src/Css";
import { documentScrollChromeLeft, documentScrollChromeWidth, pageBannerOffset } from "src/layouts/layoutVars";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";

type PageBannerSlotProps = {
  banner: PageBannerProps;
  metricsRef: RefObject<HTMLDivElement | null>;
};

/** Stay-pinned sticky slot for a page-level banner (layout `banner` prop or `usePageBanner`). */
export function PageBannerSlot(props: PageBannerSlotProps) {
  const { banner, metricsRef } = props;
  const tid = useTestIds(props, "pageBannerSlot");

  return (
    <div
      ref={metricsRef}
      css={
        Css.fs0.w100.transitionTop.sticky
          .top(pageBannerOffset())
          .left(documentScrollChromeLeft())
          .w(`min(100%, ${documentScrollChromeWidth()})`)
          .z(zIndices.pageBanner).$
      }
      {...tid.bannerSticky}
    >
      <StatusBanner {...banner} sticky {...tid.banner} />
    </div>
  );
}
