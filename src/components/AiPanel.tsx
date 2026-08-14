import { AriaAttributes, AriaRole, ReactNode } from "react";
import { BlueprintAiLogo } from "src/components/Logos";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type AiPanelProps = {
  /** Rounds the corners, for a panel sitting within page content rather than spanning it. */
  rounded?: boolean;
  children?: ReactNode;
} & AriaAttributes & { role?: AriaRole };

/**
 * The Blueprint AI surface: the wordmark over the AI background, wrapping a card of whatever the flow
 * needs.
 */
export function AiPanel(props: AiPanelProps) {
  const { rounded = false, children, ...others } = props;
  const tid = useTestIds(others, "aiPanel");
  return (
    <div
      css={{
        // `aiBackground` is opaque, so `Tokens.Surface` only shows if the gradient fails to paint.
        ...Css.df.fdc.aifs.gapPx(4).w100.px3.py2.bgColor(Tokens.Surface).aiBackground.$,
        ...(rounded ? Css.br12.$ : {}),
      }}
      {...others}
      {...tid}
    >
      <BlueprintAiLogo height={2} />
      <div css={Css.df.fdc.w100.br12.ptPx(12).px2.pb2.bgColor(Tokens.Surface).bshBasic.$} {...tid.card}>
        {children}
      </div>
    </div>
  );
}
