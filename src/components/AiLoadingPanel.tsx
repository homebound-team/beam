import { type ReactNode, useEffect, useRef, useState } from "react";
import { AiLoader } from "src/components/AiLoader";
import { AiCard, AiPanel } from "src/components/AiPanel";
import { Icon } from "src/components/Icon";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type AiLoadingPanelProps = {
  title?: string;
  message?: ReactNode;
  omitBg?: boolean;
  /**
   * How long this work usually takes so we can show an estimate to the user, i.e. the median of recent runs.
   */
  estimateInSeconds?: number;
};

const keepWorkingMessage =
  "Feel free to keep working in another tab. Once imported, you may edit or add to content before saving.";

/**
 * Tells the user AI work is running, and that they're free to go do something else.
 *
 * Indeterminate, but `estimateInSeconds` lets it say how long this usually takes so the user has an approximate idea of how long they have to wait.
 */
export function AiLoadingPanel(props: AiLoadingPanelProps) {
  const { title = "Importing Details...", message, omitBg = false, estimateInSeconds } = props;
  const tid = useTestIds(props, "aiLoadingPanel");
  const isRunningLong = useIsRunningLong(estimateInSeconds);
  const resolvedMessage =
    message ??
    (estimateInSeconds !== undefined
      ? keepWorkingMessage
      : `This process can take a few minutes. ${keepWorkingMessage}`);
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
          {resolvedMessage}
        </span>
        {estimateInSeconds !== undefined && (
          <div
            css={{
              ...Css.w100.df.aic.jcc.gap1.mt1.pt2.bt.bc(Tokens.SurfaceSeparator).xs.$,
              ...(isRunningLong ? Css.orange700.$ : Css.color(Tokens.OnSurfaceMuted).$),
            }}
          >
            <Icon icon="time" inc={2} />
            <span {...tid.estimate}>
              {isRunningLong ? "Taking longer than usual" : `Usually ${formatDuration(estimateInSeconds)}`}
            </span>
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

/** Flips to false once the panel has been up long enough that the estimate is clearly no longer accurate. */
function useIsRunningLong(estimateInSeconds: number | undefined): boolean {
  const [isRunningLong, setIsRunningLong] = useState(false);
  // Read from the effect rather than during render, and set once so a re-render can't push the deadline out
  const mountedAt = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (estimateInSeconds === undefined) return;
    mountedAt.current ??= Date.now();
    const deadline = mountedAt.current + slowAfterSeconds(estimateInSeconds) * 1000;
    const id = setInterval(() => setIsRunningLong(Date.now() >= deadline), 1000);
    return () => clearInterval(id);
  }, [estimateInSeconds]);

  return isRunningLong;
}

/**
 * How long to wait past the estimate before admitting the run is unusually slow.
 */
function slowAfterSeconds(estimateInSeconds: number): number {
  const slowMultiplier = 1.5;
  // The shortest estimate we give is less than a minute so we only want to show that slow message if the run is at least a minute.
  const minSlowSeconds = 60;
  return Math.max(estimateInSeconds * slowMultiplier, minSlowSeconds);
}

/** Rounds to the coarsest unit a waiting user cares about. */
function formatDuration(seconds: number): string {
  if (seconds < 45) return "less than a minute";
  const minutes = Math.round(seconds / 60);
  if (minutes <= 1) return "about a minute";
  if (minutes < 60) return `about ${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  return hours <= 1 ? "about an hour" : `about ${hours} hours`;
}
