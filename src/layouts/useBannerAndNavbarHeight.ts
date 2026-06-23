import { useEnvironmentBannerLayoutHeight } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import { useNavbarLayoutHeight } from "src/layouts/NavbarLayout/NavbarLayoutHeightContext";

/** Occupying height (px) of the environment banner + navbar pinned above nested chrome. */
export function useBannerAndNavbarHeight(): number {
  return useEnvironmentBannerLayoutHeight() + useNavbarLayoutHeight();
}
