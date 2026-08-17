import { ReactNode } from "react";
import { AiPanel } from "src/components/AiPanel";
import { Button } from "src/components/Button";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type AiReviewProps = {
  title: string;
  message?: ReactNode;
  /** Accepts the AI's work, e.g. "Accept Import". Drawn with the AI gradient. */
  primaryAction?: ActionButtonProps;
  /** Discards it, e.g. "Clear Import". */
  secondaryAction?: ActionButtonProps;
};

/**
 * Tells the user the AI finished and its work is waiting on them.
 *
 * Reads left-to-right rather than centred like `AiImporting` — the copy sits beside its actions so
 * the whole thing stays one row tall above the content being reviewed.
 */
export function AiReview(props: AiReviewProps) {
  const { title, message, primaryAction, secondaryAction } = props;
  const tid = useTestIds(props, "aiReview");
  return (
    <AiPanel {...tid}>
      <div css={Css.df.aic.gap2.w100.$}>
        <div css={Css.df.fdc.gapPx(4).fg1.mw0.$}>
          <span css={Css.mdSb.aiBoldText.$} {...tid.title}>
            {title}
          </span>
          {message && (
            <span css={Css.sm.color(Tokens.OnSurface).$} {...tid.message}>
              {message}
            </span>
          )}
        </div>
        {(primaryAction || secondaryAction) && (
          <div css={Css.df.gap2.fs0.$} {...tid.actions}>
            {secondaryAction && <Button {...secondaryAction} variant="quaternary" />}
            {primaryAction && <Button {...primaryAction} variant="ai" />}
          </div>
        )}
      </div>
    </AiPanel>
  );
}
