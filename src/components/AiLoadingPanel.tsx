import { ReactNode } from "react";
import { AiLoader } from "src/components/AiLoader";
import { AiCard, AiPanel } from "src/components/AiPanel";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type AiLoadingPanelProps = {
  title?: string;
  message?: ReactNode;
  omitBg?: boolean;
};

/**
 * Tells the user AI work is running, and that they're free to go do something else.
 *
 * Indeterminate — these steps don't report progress, so this never shows a percentage or ETA.
 */
export function AiLoadingPanel(props: AiLoadingPanelProps) {
  const { title = "Importing Details...", message = defaultMessage, omitBg = false } = props;
  const tid = useTestIds(props, "aiLoadingPanel");
  const card = (
    // `status` rather than `alert` so assistive tech waits for a pause instead of interrupting, and
    // `aria-busy` so it knows the surrounding content is still settling.
    <AiCard role="status" aria-busy={true} size="lg" {...tid}>
      <div css={Css.df.fdc.aic.gap1.w100.py2.px3.$}>
        <AiLoader />
        <span css={Css.lg.aiBoldText.$} {...tid.title}>
          {title}
        </span>
        <span css={Css.sm.color(Tokens.OnSurface).tac.$} {...tid.message}>
          {message}
        </span>
      </div>
    </AiCard>
  );

  return omitBg ? (
    card
  ) : (
    <AiPanel padding="lg" {...tid}>
      {card}
    </AiPanel>
  );
}

const defaultMessage =
  "This process can take a few minutes. Feel free to keep working in another tab. Once imported, you may edit or add to content before saving.";
