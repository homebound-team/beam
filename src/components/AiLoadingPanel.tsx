import type { ReactNode } from "react";
import { AiLoader } from "src/components/AiLoader";
import { AiCard, AiPanel } from "src/components/AiPanel";
import { Icon } from "src/components/Icon";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type AiLoadingPanelProps = {
  title?: string;
  message?: ReactNode;
  omitBg?: boolean;
  /** Caller-owned footer progress status, such as "usually takes 3 minutes". Hidden when unset. */
  progressText?: string;
};

/**
 * Tells the user AI work is running, and that they're free to go do something else.
 *
 * The spinner stays indeterminate. `progressText` is an optional status line the caller supplies to give the user a better idea of the progress.
 */
export function AiLoadingPanel(props: AiLoadingPanelProps) {
  const { title = "Importing Details...", omitBg = false, progressText } = props;
  const tid = useTestIds(props, "aiLoadingPanel");

  // The footer already states the timing when `progressText` is set, so the body only repeats it otherwise.
  const message =
    props.message ??
    `${progressText === undefined ? "This process can take a few minutes. " : ""}Feel free to keep working in another tab. Once imported, you may edit or add to content before saving.`;

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
        {progressText !== undefined && (
          <div css={Css.w100.df.aic.jcc.gap1.mt1.pt2.bt.bc(Tokens.SurfaceSeparator).xs.$}>
            <Icon icon="time" inc={2} />
            <span {...tid.progressText}>{progressText}</span>
          </div>
        )}
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
