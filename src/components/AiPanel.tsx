import { AriaAttributes, AriaRole, ReactNode } from "react";
import { AiLoader } from "src/components/AiLoader";
import { Button } from "src/components/Button";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { BlueprintAiLogo } from "src/components/Logos";
import { Css, Properties, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

/**
 * `banner` sits above other page content and fills whatever column its container gives it; `page` is
 * for when the AI surface *is* the page, and caps its content width. Styles vary slightly between the two
 * within figma.
 */
export type AiPanelVariant = "banner" | "page";

/** Designs *should* only ever use the one content width, so it's not configurable. */
const pageContentWidthPx = 768;

export type AiPanelProps = {
  title?: ReactNode;
  message?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
  align?: "left" | "center";
  rounded?: boolean;
  variant?: AiPanelVariant;
  primaryAction?: ActionButtonProps;
  secondaryAction?: ActionButtonProps;
} & AriaAttributes & { role?: AriaRole };

/**
 * The Blueprint AI surface: a tinted wash, the wordmark, and a card holding whatever the flow needs —
 * a loader, a form, a review prompt, or an entire page's worth of form sections.
 *
 * `ImportBanner` is the loading preset.
 */
export function AiPanel(props: AiPanelProps) {
  const {
    title,
    message,
    loading = false,
    children,
    align = "left",
    rounded = false,
    variant = "banner",
    primaryAction,
    secondaryAction,
    ...others
  } = props;
  const tid = useTestIds(others, "aiPanel");
  const { column, card, logoHeight } = variantStyles[variant];
  const hasActions = !!(primaryAction || secondaryAction);
  const panelContent = (
    <>
      {loading && <AiLoader />}
      {title && (
        <span css={{ ...Css.if(hasActions).mdSb.else.lg.$, ...Css.aiGradientText.$ }} {...tid.title}>
          {title}
        </span>
      )}
      {message && (
        <span css={{ ...Css.sm.color(Tokens.OnSurface).$, ...alignStyles[align].text }} {...tid.message}>
          {message}
        </span>
      )}
      {children}
    </>
  );
  return (
    // The wash is out here rather than on the column, so it fills the container even when `page` caps
    // the content inside it.
    <div
      css={{
        // `aiWash` is a backgroundImage, so the surface under it stays the caller's — and themeable.
        ...Css.df.fdc.aic.px3.py2.bgColor(Tokens.Surface).aiWash.$,
        ...(rounded ? Css.br12.$ : {}),
      }}
      // Before `others`, so a caller can override.
      {...loadingAria(loading)}
      {...others}
      {...tid}
    >
      <div css={{ ...Css.df.fdc.aifs.w100.$, ...column }} {...tid.column}>
        <BlueprintAiLogo height={logoHeight} />
        {/* actions need to render themselves on the right side of the title & message */}
        {hasActions ? (
          <div css={{ ...Css.df.aic.gap2.w100.bgColor(Tokens.Surface).bshBasic.$, ...card }} {...tid.card}>
            <div css={Css.df.fdc.gapPx(4).fg1.mw0.$}>{panelContent}</div>
            <div css={Css.df.gap2.fs0.$} {...tid.actions}>
              {secondaryAction && <Button {...secondaryAction} variant="quaternary" />}
              {primaryAction && <Button {...primaryAction} variant="ai" />}
            </div>
          </div>
        ) : (
          <div
            css={{ ...Css.df.fdc.gap1.w100.bgColor(Tokens.Surface).bshBasic.$, ...card, ...alignStyles[align].card }}
            {...tid.card}
          >
            {panelContent}
          </div>
        )}
      </div>
    </div>
  );
}

/** Only the loading state is a live region, so only it gets announced. */
function loadingAria(loading: boolean): AriaAttributes & { role?: AriaRole } {
  return loading ? { role: "status", "aria-busy": true } : {};
}

const alignStyles: Record<"left" | "center", { card: Properties; text: Properties }> = {
  left: { card: Css.aifs.$, text: Css.tal.$ },
  center: { card: Css.aic.$, text: Css.tac.$ },
};

/** `column` is the logo→card gap, plus `page`'s content cap. */
const variantStyles: Record<AiPanelVariant, { column: Properties; card: Properties; logoHeight: number }> = {
  banner: { column: Css.gapPx(4).$, card: Css.br12.ptPx(12).px2.pb2.$, logoHeight: 2 },
  page: { column: Css.gap1.maxwPx(pageContentWidthPx).$, card: Css.br16.pt3.px3.pb6.$, logoHeight: 3 },
};
