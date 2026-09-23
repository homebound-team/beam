import type { RefObject } from "react";
import { Banner, type BannerProps } from "src/components/Banner";
import { Css } from "src/Css";
import { documentScrollChromeLeft, documentScrollChromeWidth, pageBannerChromeTop } from "src/layouts/layoutVars";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";

type PageBannerSlotProps = {
  banner: BannerProps;
  metricsRef: RefObject<HTMLDivElement | null>;
};

/** Stay-pinned sticky slot for a page-level {@link Banner}. */
export function PageBannerSlot(props: PageBannerSlotProps) {
  const { banner, metricsRef } = props;
  const tid = useTestIds(props, "pageBannerSlot");

  return (
    <div
      ref={metricsRef}
      css={
        Css.fs0.w100.transitionTop.sticky
          .top(pageBannerChromeTop())
          .left(documentScrollChromeLeft())
          .w(`min(100%, ${documentScrollChromeWidth()})`)
          .z(zIndices.pageBanner).$
      }
      {...tid.bannerSticky}
    >
      <Banner {...banner} {...tid.banner} />
    </div>
  );
}
