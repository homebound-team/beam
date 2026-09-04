import { AriaAttributes, AriaRole, ReactNode } from "react";
import { BlueprintAiLogo } from "src/components/Logos";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type AiPanelProps = {
  /** Rounds the corners, for a panel sitting within page content rather than spanning it. */
  rounded?: boolean;
  /** Background padding. `lg` = 24 all around; `sm` = 24 horizontal, 16 vertical. */
  padding?: AiPanelPadding;
  children?: ReactNode;
};

/**
 * Escape hatch for one-off AI chrome — prefer a pre-composed component. See {@link AiBanner}, {@link AiLoadingPanel}, {@link AiSlimBanner}, or `aiMode` on {@link FormSectionLayout} / {@link StepperLayout} / {@link FocusedFormLayout} / {@link Modal}.
 * If none fit, ask the Design System team whether a component exists or should. Full rule: `docs/layouts.md`.
 */
export function AiPanel(props: AiPanelProps) {
  const { rounded = false, padding = "sm", children, ...others } = props;
  const tid = useTestIds(others, "aiPanel");
  return (
    <div css={{ ...Css.w100.aiBackground.if(rounded).br12.$, ...aiBackgroundPaddingCss[padding] }} {...others} {...tid}>
      {children}
    </div>
  );
}

export type AiCardProps = {
  /** Set false to size the card to its content and center it, rather than filling the parent. */
  fullWidth?: boolean;
  /** Logo height and logo-to-card gap. */
  size?: AiCardSize;
  children?: ReactNode;
} & AriaAttributes & { role?: AriaRole };

/**
 * Escape hatch for one-off AI chrome — prefer a pre-composed component. See {@link AiBanner}, {@link AiLoadingPanel}, {@link AiSlimBanner}, or `aiMode` on {@link FormSectionLayout} / {@link StepperLayout} / {@link FocusedFormLayout} / {@link Modal}.
 * If none fit, ask the Design System team whether a component exists or should. Full rule: `docs/layouts.md`.
 */
export function AiCard(props: AiCardProps) {
  const { fullWidth = true, size = "lg", children, ...others } = props;
  const { logoHeight, gapCss } = aiCardChrome[size];
  const tid = useTestIds(others, "aiCard");
  return (
    <div css={{ ...Css.df.fdc.aifs.w100.if(!fullWidth).wfc.maxw100.mxa.$, ...gapCss }} {...tid.column}>
      <BlueprintAiLogo height={logoHeight} />
      <div css={Css.df.fdc.w100.mw0.br12.bgColor(Tokens.Surface).bshBasic.$} {...others} {...tid.card}>
        {children}
      </div>
    </div>
  );
}

export type AiPanelPadding = "lg" | "sm";
export type AiCardSize = "lg" | "sm";

const aiBackgroundPaddingCss = {
  lg: Css.p3.$,
  sm: Css.px3.py2.$,
} satisfies Record<AiPanelPadding, object>;

const aiCardChrome = {
  lg: { logoHeight: 3, gapCss: Css.gap2.$ },
  sm: { logoHeight: 2, gapCss: Css.gapPx(4).$ },
};
