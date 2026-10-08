import type { PageBannerProps } from "src/components/StatusBanner/StatusBanner";

type CurrentBanner = { id: string; banner: PageBannerProps };

let current: CurrentBanner | undefined;
const listeners = new Set<() => void>();

/** Banner set by `usePageBanner`, for the mounted page layout. */
export const pageBannerStore = {
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: (): PageBannerProps | undefined => current?.banner,
};

function notify() {
  listeners.forEach((listener) => listener());
}

/** True once a layout slot has subscribed. */
export function hasPageBannerSubscriber(): boolean {
  return listeners.size > 0;
}

export function setPageBanner(id: string, banner: PageBannerProps) {
  const previous = current;
  if (previous?.id === id && previous.banner === banner) return;
  if (previous && previous.id !== id && process.env.NODE_ENV !== "production") {
    console.warn("[usePageBanner] A second page banner replaced the first; a layout shows one at a time.");
  }
  current = { id, banner };
  notify();
}

export function clearPageBanner(id: string) {
  if (current?.id !== id) return;
  current = undefined;
  notify();
}

/** Reset module store between tests. */
export function resetPageBannerStore() {
  current = undefined;
  notify();
}
