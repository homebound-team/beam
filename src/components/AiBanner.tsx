import { ReactNode } from "react";
import { AiPanel } from "src/components/AiPanel";
import { Button } from "src/components/Button";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type AiBannerProps = {
  title: string;
  message?: ReactNode;
  primaryAction?: ActionButtonProps;
  secondaryAction?: ActionButtonProps;
};

export function AiBanner(props: AiBannerProps) {
  const { title, message, primaryAction, secondaryAction } = props;
  const tid = useTestIds(props, "aiBanner");
  return (
    <AiPanel {...tid}>
      <div css={Css.df.aic.jcsb.gap2.w100.$}>
        <div css={Css.df.fdc.gapPx(4).fg1.mw0.$}>
          <span css={Css.smSb.aiBoldText.$} {...tid.title}>
            {title}
          </span>
          {message && (
            <span css={Css.xs.color(Tokens.OnSurface).$} {...tid.message}>
              {message}
            </span>
          )}
        </div>
        {(primaryAction || secondaryAction) && (
          <div css={Css.df.aic.gap2.fs0.$}>
            {secondaryAction && <Button {...secondaryAction} variant="quaternary" />}
            {primaryAction && <Button {...primaryAction} variant="ai" />}
          </div>
        )}
      </div>
    </AiPanel>
  );
}
