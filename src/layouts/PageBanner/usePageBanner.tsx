import { useEffect, useId, useLayoutEffect } from "react";
import type { PageBannerProps } from "src/components/StatusBanner/StatusBanner";
import { clearPageBanner, hasPageBannerSubscriber, setPageBanner } from "src/layouts/PageBanner/pageBannerStore";

/** Pins `banner` in the page layout's banner slot while mounted. Memoize `banner`; `undefined` shows none. */
export function usePageBanner(banner: PageBannerProps | undefined): void {
  const id = useId();

  useLayoutEffect(() => {
    if (!banner) return;
    setPageBanner(id, banner);
    return () => clearPageBanner(id);
  }, [id, banner]);

  useEffect(() => {
    if (!banner || hasPageBannerSubscriber() || process.env.NODE_ENV === "production") return;
    console.warn("[usePageBanner] No page layout above this component; the banner will not render.");
  }, [banner]);
}

/** JSX form of {@link usePageBanner}. Memoize these props; renders nothing in place. */
export function PageBanner(props: PageBannerProps) {
  usePageBanner(props);
  return null;
}
