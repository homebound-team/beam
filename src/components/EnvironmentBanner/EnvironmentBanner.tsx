import type { ReactNode } from "react";
import { BeamColor } from "src/colors";
import { Icon } from "src/components/Icon";
import { Css, maybeCssVar, Palette, Tokens } from "src/Css";
import { isDefined, useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { Tag } from "../Tag";

export type AppEnvironment = "local" | "dev" | "qa" | "local-prod" | "prod";

export type ImpersonatedUser = { name: string };

export type EnvironmentBannerProps = {
  env: AppEnvironment;
  impersonating?: ImpersonatedUser;
};

/** Environment banner; horizontal/vertical pinning is owned by {@link EnvironmentBannerLayout}. */
export function EnvironmentBanner(props: EnvironmentBannerProps) {
  const { env, impersonating, ...others } = props;
  const tid = useTestIds(others, "environmentBanner");

  if (!shouldShowEnvironmentBanner(env, impersonating)) {
    return null;
  }

  const { bgColor, badgeLabel, message, tooltip } = getEnvironmentBannerConfig(env, impersonating);
  const bgColorVar = maybeCssVar(bgColor);

  return (
    <div
      css={Css.fs0.relative.z(zIndices.environmentBanner).bgColor(bgColorVar).hPx(environmentBannerSizePx).w100.$}
      role="banner"
      {...tid}
    >
      {getInvertedCorner("left", bgColorVar)}
      {getInvertedCorner("right", bgColorVar)}

      <div css={Css.relative.z2.df.aic.jcsb.h100.px2.ifMdAndUp.px6.$} {...tid.content}>
        <span css={Css.df.aic.gap2.fg1.mh0.oh.$} {...tid.left}>
          <Tag text={badgeLabel} xss={Css.bgColor("#FFFFFF90").$} {...tid.badge} />
          <span
            css={{
              ...Css.aic.gap1.xsSb.white.$,
              ...(impersonating ? Css.dn.ifMdAndUp.df.$ : Css.df.$),
            }}
            {...tid.message}
          >
            {message}
            <span css={Css.fs0.$} {...tid.info}>
              <Icon icon="infoCircle" tooltip={tooltip} inc={2} color={Palette.White} />
            </span>
          </span>
        </span>
        {impersonating != null && (
          <span css={Css.df.aic.gap2.xsSb.white.fs0.$} {...tid.impersonating}>
            {env !== "prod" && (
              <span>
                <span css={Css.dn.ifMdAndUp.dib.$}>Impersonating &nbsp;</span>
                {impersonating.name}
              </span>
            )}
            <span css={Css.df.fs0.$} {...tid.impersonatingIcon}>
              <Icon icon="impersonate" inc={2} color={Palette.White} />
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

/** True when {@link EnvironmentBanner} should display: `dev`, `qa`, `local-prod`, or `prod` while impersonating. */
export function shouldShowEnvironmentBanner(env: AppEnvironment, impersonating: ImpersonatedUser | undefined): boolean {
  return env === "dev" || env === "qa" || env === "local-prod" || (env === "prod" && isDefined(impersonating));
}

type EnvironmentBannerConfig = {
  bgColor: BeamColor;
  badgeLabel: string;
  message: string;
  tooltip?: string;
};

function getEnvironmentBannerConfig(
  env: AppEnvironment,
  impersonating: ImpersonatedUser | undefined,
): EnvironmentBannerConfig {
  switch (env) {
    case "dev":
      return {
        bgColor: Tokens.EnvBrandDev,
        badgeLabel: "DEV",
        message: "You are in the Dev Environment",
        tooltip: "You are in the Dev Environment. Any changes here will not be reflected in live production data.",
      };
    case "qa":
      return {
        bgColor: Tokens.EnvBrandQa,
        badgeLabel: "QA",
        message: "You are in the QA Environment",
        tooltip: "You are in the QA Environment. Any changes here will not be reflected in live production data.",
      };
    // Prod env banner should only be displayed when impersonating
    case "prod":
      return {
        bgColor: Tokens.EnvBrandProd,
        badgeLabel: "PROD",
        message: `You are impersonating ${impersonating?.name}`,
        tooltip:
          "You are currently viewing the application as another user in Production. Any changes here WILL be reflected in live production data.",
      };
    case "local-prod":
      return {
        bgColor: Tokens.EnvBrandLocalProd,
        badgeLabel: "LOCAL-PROD",
        message: `You are in the Local Prod Environment`,
        tooltip:
          "You are connected to live production data from a local environment. Any changes made here WILL immediately affect production.",
      };
    default:
      throw new Error(`Invalid environment: ${env}`);
  }
}

/** Rounded bottom-edge cutout via box-shadow; `side` controls horizontal shadow offset. */
function getInvertedCorner(side: "left" | "right", bgColorVar: string): ReactNode {
  const invertedCornerRadiusPx = 12;
  const shell = Css.absolute.bottomPx(-invertedCornerRadiusPx).sqPx(invertedCornerRadiusPx).add("pointerEvents", "none")
    .z1.$;
  const outerPosition = side === "left" ? Css.left0.$ : Css.rightPx(invertedCornerRadiusPx).$;
  const shadowXOffset = side === "left" ? -invertedCornerRadiusPx : invertedCornerRadiusPx;

  return (
    <div aria-hidden css={{ ...shell, ...outerPosition }}>
      <div
        css={
          Css.h("200%")
            .w("200%")
            .absolute.add("borderRadius", "50%")
            .boxShadow(`${shadowXOffset}px -${invertedCornerRadiusPx}px 0 0 ${bgColorVar}`).$
        }
      />
    </div>
  );
}

/** Fixed banner height (px); {@link EnvironmentBannerLayout} reads this for spacer/CSS var offsets. */
export const environmentBannerSizePx = 32;
