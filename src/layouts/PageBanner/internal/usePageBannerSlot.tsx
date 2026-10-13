import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { PageBannerProps } from "src/components/StatusBanner/StatusBanner";
import { PageBannerSlot } from "src/layouts/PageBanner/internal/PageBannerSlot";
import { pageBannerStore } from "src/layouts/PageBanner/pageBannerStore";
import { useMeasuredHeight } from "src/layouts/useMeasuredHeight";

/**
 * The layout's sticky banner slot and its measured height.
 * While `usePageBanner` is mounted, that banner fills the slot. Otherwise the layout's `banner` prop does.
 */
export function usePageBannerSlot(bannerProp: PageBannerProps | undefined, testIds: object) {
  const publishedBanner = usePublishedPageBanner();
  const banner = publishedBanner ?? bannerProp;
  const metricsRef = useRef<HTMLDivElement>(null);
  const height = useMeasuredHeight(metricsRef, banner != null);
  const slot = banner ? <PageBannerSlot {...testIds} banner={banner} metricsRef={metricsRef} /> : null;

  return { slot, height };
}

/** Banner `usePageBanner` has published. Read before paint so the first frame includes it. */
function usePublishedPageBanner(): PageBannerProps | undefined {
  const [banner, setBanner] = useState(pageBannerStore.getSnapshot);
  const sync = useCallback(() => {
    const next = pageBannerStore.getSnapshot();
    setBanner((prev) => (prev === next ? prev : next));
  }, []);

  useLayoutEffect(() => {
    sync();
    return pageBannerStore.subscribe(sync);
  }, [sync]);

  return banner;
}
