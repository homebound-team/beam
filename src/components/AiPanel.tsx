import { AriaAttributes, AriaRole, ReactNode } from "react";
import { BlueprintAiLogo } from "src/components/Logos";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type AiPanelProps = {
  /** Rounds the corners, for a panel sitting within page content rather than spanning it. */
  rounded?: boolean;
  /** Set false to size the card to its content and center it, rather than filling the panel. */
  fullWidth?: boolean;
  children?: ReactNode;
} & AriaAttributes & { role?: AriaRole };

/**
 * The Blueprint AI surface: the wordmark over the AI background, wrapping a card of whatever the flow
 * needs.
 *
 * The background always spans its container; `fullWidth` only governs the card.
 */
export function AiPanel(props: AiPanelProps) {
  const { rounded = false, fullWidth = true, children, ...others } = props;
  const tid = useTestIds(others, "aiPanel");
  return (
    <div css={{ ...Css.df.fdc.w100.px3.py2.aiBackground.$, ...(rounded ? Css.br12.$ : {}) }} {...others} {...tid}>
      {/* Keeps the wordmark aligned to the card when the card is narrower than the panel. */}
      <div css={Css.df.fdc.aifs.gap1.w100.if(!fullWidth).wfc.mxa.$} {...tid.column}>
        <BlueprintAiLogo height={3} />
        <div css={Css.df.fdc.w100.br12.ptPx(12).px2.pb2.bgColor(Tokens.Surface).bshBasic.$} {...tid.card}>
          {children}
        </div>
      </div>
    </div>
  );
}
