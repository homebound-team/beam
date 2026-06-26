import type { CSSProperties, ReactNode } from "react";
import {
  EnvironmentBanner,
  type EnvironmentBannerProps,
  environmentBannerSizePx,
  shouldShowEnvironmentBanner,
} from "src/components/EnvironmentBanner/EnvironmentBanner";
import { Css } from "src/Css";
import { DocumentScrollLayoutProvider } from "src/layouts/DocumentScrollLayoutContext";
import { EnvironmentBannerLayoutHeightProvider } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayoutHeightContext";
import { beamEnvironmentBannerLayoutHeightVar, beamLayoutViewportWidthVar } from "src/layouts/layoutVars";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";

export type EnvironmentBannerLayoutProps = {
  /** When provided and {@link shouldShowEnvironmentBanner} is true, renders {@link EnvironmentBanner} and publishes height. */
  environmentBanner?: EnvironmentBannerProps;
  children?: ReactNode;
};

/** Outermost layout shell; optional sticky environment banner above all other chrome. Contract: `docs/layouts.md`. */
export function EnvironmentBannerLayout(props: EnvironmentBannerLayoutProps) {
  const { environmentBanner, children } = props;
  const tid = useTestIds(props, "environmentBannerLayout");
  const showBanner =
    environmentBanner != null &&
    shouldShowEnvironmentBanner(
      environmentBanner.env,
      environmentBanner.impersonating,
      environmentBanner.showProdWarning ?? false,
    );
  const bannerHeightPx = showBanner ? environmentBannerSizePx : 0;

  const style = {
    [beamEnvironmentBannerLayoutHeightVar]: `${bannerHeightPx}px`,
  } as CSSProperties;

  const innerWidth = `var(${beamLayoutViewportWidthVar}, 100vw)`;

  return (
    <DocumentScrollLayoutProvider>
      <EnvironmentBannerLayoutHeightProvider value={bannerHeightPx}>
        <div css={Css.df.fdc.wfc.mw100.$} style={style} {...tid}>
          {showBanner && environmentBanner && (
            <div css={Css.fs0.w100.$} style={{ height: environmentBannerSizePx }}>
              {/* Using a fixed position to avoid unwanted overscroll behaviors (bouncing) */}
              <div css={Css.fixed.top0.left0.z(zIndices.environmentBanner).w(innerWidth).$} {...tid.bannerSticky}>
                <EnvironmentBanner {...environmentBanner} {...tid.environmentBanner} />
              </div>
            </div>
          )}

          {children}
        </div>
      </EnvironmentBannerLayoutHeightProvider>
    </DocumentScrollLayoutProvider>
  );
}
